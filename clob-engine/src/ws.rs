use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::State;
use axum::response::IntoResponse;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use crate::engine::ClobEngine;

pub type SharedEngine = Arc<Mutex<ClobEngine>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    Subscribed { channel: String, market: Option<String> },
    OrderbookSnapshot { market: String, depth: serde_json::Value },
    TradeBroadcast { trade: serde_json::Value },
    TickerUpdate { market: String, oracle_price: f64, mark_price: f64, funding_1h_pct: f64 },
    Error { message: String },
}

pub struct WsBroadcaster {
    pub tx: broadcast::Sender<ServerWsMessage>,
}

impl WsBroadcaster {
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(1024);
        Self { tx }
    }
}

pub async fn handle_ws_upgrade(
    ws: WebSocketUpgrade,
    State(engine): State<SharedEngine>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, engine))
}

async fn handle_socket(mut socket: WebSocket, engine: SharedEngine) {
    let mut subscribed_channels = std::collections::HashSet::new();

    while let Some(msg) = socket.recv().await {
        let msg = match msg {
            Ok(Message::Text(text)) => text,
            Ok(Message::Ping(_)) => {
                let _ = socket.send(Message::Pong(vec![].into())).await;
                continue;
            }
            Ok(Message::Close(_)) => break,
            _ => continue,
        };

        if let Ok(client_msg) = serde_json::from_str::<ClientWsMessage>(&msg) {
            match client_msg {
                ClientWsMessage::Ping => {
                    let pong = ServerWsMessage::Pong;
                    let _ = socket.send(Message::Text(serde_json::to_string(&pong).unwrap().into())).await;
                }
                ClientWsMessage::Subscribe { channel, market } => {
                    let sub_key = format!("{}:{}", channel, market.as_deref().unwrap_or("all"));
                    subscribed_channels.insert(sub_key);

                    let ack = ServerWsMessage::Subscribed {
                        channel: channel.clone(),
                        market: market.clone(),
                    };
                    let _ = socket.send(Message::Text(serde_json::to_string(&ack).unwrap().into())).await;

                    // If subscribed to orderbook, immediately send snapshot
                    if channel == "orderbook" {
                        if let Some(m) = market {
                            let snapshot_opt = {
                                let mut eng = engine.lock().unwrap();
                                eng.get_l4_depth(&m.to_uppercase(), 10).map(|depth| {
                                    ServerWsMessage::OrderbookSnapshot {
                                        market: m,
                                        depth: serde_json::to_value(depth).unwrap_or_default(),
                                    }
                                })
                            };
                            if let Some(snapshot) = snapshot_opt {
                                let _ = socket.send(Message::Text(serde_json::to_string(&snapshot).unwrap().into())).await;
                            }
                        }
                    }
                }
                ClientWsMessage::Unsubscribe { channel, market } => {
                    let sub_key = format!("{}:{}", channel, market.as_deref().unwrap_or("all"));
                    subscribed_channels.remove(&sub_key);
                }
            }
        }
    }
}
