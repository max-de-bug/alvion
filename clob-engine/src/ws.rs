use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::State;
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use crate::engine::ClobEngine;

pub type SharedEngine = Arc<Mutex<ClobEngine>>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "action", rename_all = "lowercase")]
pub enum ClientWsMessage {
    Subscribe { channel: String, market: Option<String> },
    Unsubscribe { channel: String, market: Option<String> },
    Ping,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerWsMessage {
    Pong,
    Subscribed {
        channel: String,
        market: Option<String>,
    },
    Unsubscribed {
        channel: String,
        market: Option<String>,
    },
    OrderbookSnapshot {
        market: String,
        depth: serde_json::Value,
    },
    OrderbookUpdate {
        market: String,
        depth: serde_json::Value,
    },
    TradeBroadcast {
        market: String,
        trade: serde_json::Value,
    },
    TickerUpdate {
        market: String,
        oracle_price: f64,
        mark_price: f64,
        funding_1h_pct: f64,
    },
    Error {
        message: String,
    },
}

#[derive(Clone)]
pub struct WsBroadcaster {
    pub tx: broadcast::Sender<ServerWsMessage>,
}

impl WsBroadcaster {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(4096);
        Self { tx }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<ServerWsMessage> {
        self.tx.subscribe()
    }

    pub fn broadcast(&self, msg: ServerWsMessage) {
        // Send fails only if there are no active receivers (0 clients connected), which is expected and harmless.
        let _ = self.tx.send(msg);
    }
}

impl Default for WsBroadcaster {
    fn default() -> Self {
        Self::new()
    }
}

pub fn parse_client_message(text: &str) -> Result<ClientWsMessage, serde_json::Error> {
    if let Ok(msg) = serde_json::from_str::<ClientWsMessage>(text) {
        return Ok(msg);
    }
    // Institutional fallback: Support exchanges with "type", "op", or "event" tags
    if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(text) {
        if let Some(obj) = val.as_object_mut() {
            let action_val = obj
                .get("action")
                .or_else(|| obj.get("type"))
                .or_else(|| obj.get("op"))
                .or_else(|| obj.get("event"))
                .cloned();

            if let Some(action) = action_val {
                obj.insert("action".to_string(), action);
                return serde_json::from_value::<ClientWsMessage>(serde_json::Value::Object(obj.clone()));
            }
        }
    }
    serde_json::from_str::<ClientWsMessage>(text)
}

pub async fn handle_ws_upgrade(
    ws: WebSocketUpgrade,
    State(engine): State<SharedEngine>,
) -> impl IntoResponse {
    let broadcaster = {
        let eng = engine.lock().unwrap();
        eng.broadcaster.clone()
    };
    ws.on_upgrade(move |socket| handle_socket(socket, engine, broadcaster))
}

async fn handle_socket(
    socket: WebSocket,
    engine: SharedEngine,
    broadcaster: Arc<WsBroadcaster>,
) {
    let (mut ws_sink, mut ws_stream) = socket.split();
    let mut rx = broadcaster.subscribe();
    let mut subscribed_channels: HashSet<String> = HashSet::new();

    loop {
        tokio::select! {
            // Receive messages from the connected WebSocket client
            client_msg_opt = ws_stream.next() => {
                let msg_result = match client_msg_opt {
                    Some(res) => res,
                    None => break, // Client closed stream
                };

                let msg = match msg_result {
                    Ok(Message::Text(text)) => text,
                    Ok(Message::Ping(payload)) => {
                        if ws_sink.send(Message::Pong(payload)).await.is_err() {
                            break;
                        }
                        continue;
                    }
                    Ok(Message::Close(_)) => break,
                    Err(_) => break,
                    _ => continue,
                };

                match parse_client_message(&msg) {
                    Ok(ClientWsMessage::Ping) => {
                        let pong = ServerWsMessage::Pong;
                        if let Ok(txt) = serde_json::to_string(&pong) {
                            if ws_sink.send(Message::Text(txt.into())).await.is_err() {
                                break;
                            }
                        }
                    }
                    Ok(ClientWsMessage::Subscribe { channel, market }) => {
                        let channel_lower = channel.to_lowercase();
                        let norm_market = market.as_deref().map(|m| m.to_uppercase());
                        let sub_key = format!("{}:{}", channel_lower, norm_market.as_deref().unwrap_or("all"));
                        subscribed_channels.insert(sub_key);

                        let ack = ServerWsMessage::Subscribed {
                            channel: channel_lower.clone(),
                            market: norm_market.clone(),
                        };
                        if let Ok(txt) = serde_json::to_string(&ack) {
                            if ws_sink.send(Message::Text(txt.into())).await.is_err() {
                                break;
                            }
                        }

                        // If subscribed to orderbook, immediately send snapshot
                        if channel_lower == "orderbook" {
                            let snapshots: Vec<ServerWsMessage> = {
                                let mut eng = engine.lock().unwrap();
                                if let Some(ref m) = norm_market {
                                    if m == "ALL" {
                                        let keys: Vec<String> = eng.orderbooks.keys().cloned().collect();
                                        keys.into_iter().filter_map(|mk| {
                                            eng.get_l4_depth(&mk, 15).map(|depth| ServerWsMessage::OrderbookSnapshot {
                                                market: mk,
                                                depth: serde_json::to_value(depth).unwrap_or_default(),
                                            })
                                        }).collect()
                                    } else {
                                        eng.get_l4_depth(m, 15).map(|depth| vec![ServerWsMessage::OrderbookSnapshot {
                                            market: m.clone(),
                                            depth: serde_json::to_value(depth).unwrap_or_default(),
                                        }]).unwrap_or_default()
                                    }
                                } else {
                                    Vec::new()
                                }
                            };

                            for snap in snapshots {
                                if let Ok(txt) = serde_json::to_string(&snap) {
                                    if ws_sink.send(Message::Text(txt.into())).await.is_err() {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    Ok(ClientWsMessage::Unsubscribe { channel, market }) => {
                        let channel_lower = channel.to_lowercase();
                        let norm_market = market.as_deref().map(|m| m.to_uppercase());
                        let sub_key = format!("{}:{}", channel_lower, norm_market.as_deref().unwrap_or("all"));
                        subscribed_channels.remove(&sub_key);

                        let ack = ServerWsMessage::Unsubscribed {
                            channel: channel_lower,
                            market: norm_market,
                        };
                        if let Ok(txt) = serde_json::to_string(&ack) {
                            if ws_sink.send(Message::Text(txt.into())).await.is_err() {
                                break;
                            }
                        }
                    }
                    Err(e) => {
                        let err_msg = ServerWsMessage::Error {
                            message: format!("Malformed WebSocket message: {}", e),
                        };
                        if let Ok(txt) = serde_json::to_string(&err_msg) {
                            let _ = ws_sink.send(Message::Text(txt.into())).await;
                        }
                    }
                }
            }

            // Receive real-time broadcast events from ClobEngine
            broadcast_res = rx.recv() => {
                match broadcast_res {
                    Ok(broadcast_msg) => {
                        let should_send = match &broadcast_msg {
                            ServerWsMessage::OrderbookSnapshot { market, .. }
                            | ServerWsMessage::OrderbookUpdate { market, .. } => {
                                let m = market.to_uppercase();
                                subscribed_channels.contains(&format!("orderbook:{}", m))
                                    || subscribed_channels.contains("orderbook:all")
                            }
                            ServerWsMessage::TradeBroadcast { market, .. } => {
                                let m = market.to_uppercase();
                                subscribed_channels.contains(&format!("trades:{}", m))
                                    || subscribed_channels.contains("trades:all")
                            }
                            ServerWsMessage::TickerUpdate { market, .. } => {
                                let m = market.to_uppercase();
                                subscribed_channels.contains(&format!("ticker:{}", m))
                                    || subscribed_channels.contains("ticker:all")
                            }
                            _ => false,
                        };

                        if should_send {
                            if let Ok(txt) = serde_json::to_string(&broadcast_msg) {
                                if ws_sink.send(Message::Text(txt.into())).await.is_err() {
                                    break;
                                }
                            }
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(skipped)) => {
                        eprintln!("[WS] Client lagged by {} broadcasts; dropping frames to maintain real-time SLA", skipped);
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        break;
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_client_message_formats() {
        // Standard action tag
        let json_action = r#"{"action":"subscribe","channel":"orderbook","market":"AVAX"}"#;
        let parsed = parse_client_message(json_action).unwrap();
        assert_eq!(
            parsed,
            ClientWsMessage::Subscribe {
                channel: "orderbook".to_string(),
                market: Some("AVAX".to_string())
            }
        );

        // Alternative "type" tag
        let json_type = r#"{"type":"subscribe","channel":"trades","market":"SOL"}"#;
        let parsed = parse_client_message(json_type).unwrap();
        assert_eq!(
            parsed,
            ClientWsMessage::Subscribe {
                channel: "trades".to_string(),
                market: Some("SOL".to_string())
            }
        );

        // Alternative "op" tag
        let json_op = r#"{"op":"ping"}"#;
        let parsed = parse_client_message(json_op).unwrap();
        assert_eq!(parsed, ClientWsMessage::Ping);
    }

    #[tokio::test]
    async fn test_ws_broadcaster_dispatch() {
        let broadcaster = WsBroadcaster::new();
        let mut sub1 = broadcaster.subscribe();
        let mut sub2 = broadcaster.subscribe();

        broadcaster.broadcast(ServerWsMessage::TickerUpdate {
            market: "AVAX".to_string(),
            oracle_price: 25.50,
            mark_price: 25.51,
            funding_1h_pct: 0.0012,
        });

        let msg1 = sub1.recv().await.unwrap();
        let msg2 = sub2.recv().await.unwrap();

        match (msg1, msg2) {
            (
                ServerWsMessage::TickerUpdate { market: m1, oracle_price: p1, .. },
                ServerWsMessage::TickerUpdate { market: m2, oracle_price: p2, .. },
            ) => {
                assert_eq!(m1, "AVAX");
                assert_eq!(m2, "AVAX");
                assert!((p1 - 25.50).abs() < f64::EPSILON);
                assert!((p2 - 25.50).abs() < f64::EPSILON);
            }
            _ => panic!("Expected TickerUpdate message on broadcast"),
        }
    }
}
