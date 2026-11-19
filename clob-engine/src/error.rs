// Percolator & CLOB Matching Engine - Centralized Error System
// Implements idiomatic Rust error handling with Display, std::error::Error,
// machine-readable error codes, and serde serialization.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Errors arising from Percolator risk domains, solvency invariants, and position management.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DomainError {
    MarketNotFound(String),
    PositionNotFound(String),
    PositionClosed(String),
    ExceededDomainPnlCap { requested: u64, allowed: u64 },
    MaintenanceMarginViolated,
    InsufficientMargin { required: u64, available: u64 },
}

impl DomainError {
    /// Machine-readable error code for client SDKs and API consumers.
    pub fn error_code(&self) -> &'static str {
        match self {
            DomainError::MarketNotFound(_) => "MARKET_NOT_FOUND",
            DomainError::PositionNotFound(_) => "POSITION_NOT_FOUND",
            DomainError::PositionClosed(_) => "POSITION_CLOSED",
            DomainError::ExceededDomainPnlCap { .. } => "EXCEEDED_DOMAIN_PNL_CAP",
            DomainError::MaintenanceMarginViolated => "MAINTENANCE_MARGIN_VIOLATED",
            DomainError::InsufficientMargin { .. } => "INSUFFICIENT_MARGIN",
        }
    }

    pub fn market_not_found(market: impl Into<String>) -> Self {
        Self::MarketNotFound(market.into())
    }

    pub fn position_not_found(id: impl Into<String>) -> Self {
        Self::PositionNotFound(id.into())
    }

    pub fn position_closed(id: impl Into<String>) -> Self {
        Self::PositionClosed(id.into())
    }
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DomainError::MarketNotFound(market) => {
                write!(f, "Market domain not found: '{}'", market)
            }
            DomainError::PositionNotFound(id) => {
                write!(f, "Position not found: '{}'", id)
            }
            DomainError::PositionClosed(id) => {
                write!(f, "Position is already closed: '{}'", id)
            }
            DomainError::ExceededDomainPnlCap { requested, allowed } => {
                write!(
                    f,
                    "Requested PnL payout of {} exceeds domain insurance cap of {}",
                    requested, allowed
                )
            }
            DomainError::MaintenanceMarginViolated => {
                write!(f, "Maintenance margin requirement violated (position undercollateralized)")
            }
            DomainError::InsufficientMargin { required, available } => {
                write!(
                    f,
                    "Insufficient collateral margin: required {}, available {}",
                    required, available
                )
            }
        }
    }
}

impl std::error::Error for DomainError {}

/// Errors arising from order placement, validation, and cancellation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum OrderError {
    OrderNotFound(String),
    InvalidPrice(u64),
    InvalidSize(u64),
    InvalidSignature(String),
    UnsupportedOrderType(String),
}

impl OrderError {
    #[allow(dead_code)]
    pub fn error_code(&self) -> &'static str {
        match self {
            OrderError::OrderNotFound(_) => "ORDER_NOT_FOUND",
            OrderError::InvalidPrice(_) => "INVALID_PRICE",
            OrderError::InvalidSize(_) => "INVALID_SIZE",
            OrderError::InvalidSignature(_) => "INVALID_SIGNATURE",
            OrderError::UnsupportedOrderType(_) => "UNSUPPORTED_ORDER_TYPE",
        }
    }
}

impl fmt::Display for OrderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OrderError::OrderNotFound(id) => write!(f, "Order not found in book: '{}'", id),
            OrderError::InvalidPrice(price) => write!(f, "Invalid order price: {}", price),
            OrderError::InvalidSize(size) => write!(f, "Invalid order size: {}", size),
            OrderError::InvalidSignature(sig) => write!(f, "Invalid EIP-712 order signature: '{}'", sig),
            OrderError::UnsupportedOrderType(t) => write!(f, "Unsupported order type: '{}'", t),
        }
    }
}

impl std::error::Error for OrderError {}

/// Top-level unified error enum for the Alvion CLOB & Percolator Matching Engine.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EngineError {
    Domain(DomainError),
    Order(OrderError),
    Internal(String),
}

impl EngineError {
    #[allow(dead_code)]
    pub fn error_code(&self) -> &'static str {
        match self {
            EngineError::Domain(e) => e.error_code(),
            EngineError::Order(e) => e.error_code(),
            EngineError::Internal(_) => "INTERNAL_ENGINE_ERROR",
        }
    }
}

impl fmt::Display for EngineError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EngineError::Domain(e) => write!(f, "Domain error: {}", e),
            EngineError::Order(e) => write!(f, "Order error: {}", e),
            EngineError::Internal(msg) => write!(f, "Internal engine error: {}", msg),
        }
    }
}

impl std::error::Error for EngineError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            EngineError::Domain(e) => Some(e),
            EngineError::Order(e) => Some(e),
            EngineError::Internal(_) => None,
        }
    }
}

impl From<DomainError> for EngineError {
    fn from(err: DomainError) -> Self {
        EngineError::Domain(err)
    }
}

impl From<OrderError> for EngineError {
    fn from(err: OrderError) -> Self {
        EngineError::Order(err)
    }
}

#[allow(dead_code)]
pub type Result<T, E = EngineError> = std::result::Result<T, E>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_domain_error_display() {
        let err = DomainError::MarketNotFound("AVAX".to_string());
        assert_eq!(err.to_string(), "Market domain not found: 'AVAX'");
        assert_eq!(err.error_code(), "MARKET_NOT_FOUND");

        let err = DomainError::PositionNotFound("POS-123".to_string());
        assert_eq!(err.to_string(), "Position not found: 'POS-123'");
        assert_eq!(err.error_code(), "POSITION_NOT_FOUND");

        let err = DomainError::PositionClosed("POS-456".to_string());
        assert_eq!(err.to_string(), "Position is already closed: 'POS-456'");
        assert_eq!(err.error_code(), "POSITION_CLOSED");

        let err = DomainError::ExceededDomainPnlCap { requested: 1000, allowed: 500 };
        assert_eq!(
            err.to_string(),
            "Requested PnL payout of 1000 exceeds domain insurance cap of 500"
        );
        assert_eq!(err.error_code(), "EXCEEDED_DOMAIN_PNL_CAP");

        let err = DomainError::MaintenanceMarginViolated;
        assert_eq!(
            err.to_string(),
            "Maintenance margin requirement violated (position undercollateralized)"
        );
        assert_eq!(err.error_code(), "MAINTENANCE_MARGIN_VIOLATED");

        let err = DomainError::InsufficientMargin { required: 200, available: 100 };
        assert_eq!(
            err.to_string(),
            "Insufficient collateral margin: required 200, available 100"
        );
        assert_eq!(err.error_code(), "INSUFFICIENT_MARGIN");
    }

    #[test]
    fn test_order_error_display() {
        let err = OrderError::OrderNotFound("ORD-001".to_string());
        assert_eq!(err.to_string(), "Order not found in book: 'ORD-001'");
        assert_eq!(err.error_code(), "ORDER_NOT_FOUND");

        let err = OrderError::InvalidPrice(0);
        assert_eq!(err.to_string(), "Invalid order price: 0");
        assert_eq!(err.error_code(), "INVALID_PRICE");
    }

    #[test]
    fn test_engine_error_conversion() {
        let domain_err = DomainError::market_not_found("BTC");
        let engine_err: EngineError = domain_err.into();
        assert_eq!(engine_err.error_code(), "MARKET_NOT_FOUND");
        assert_eq!(engine_err.to_string(), "Domain error: Market domain not found: 'BTC'");

        let order_err = OrderError::OrderNotFound("ORD-999".to_string());
        let engine_err: EngineError = order_err.into();
        assert_eq!(engine_err.error_code(), "ORDER_NOT_FOUND");
    }

    #[test]
    fn test_json_serialization() {
        let err = DomainError::position_not_found("POS-XYZ");
        let serialized = serde_json::to_string(&err).unwrap();
        assert!(serialized.contains("PositionNotFound"));
        assert!(serialized.contains("POS-XYZ"));
    }
}
