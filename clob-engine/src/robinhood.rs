#![allow(dead_code)]

use serde::{Deserialize, Serialize};
use tiny_keccak::{Hasher, Keccak};

pub const ROBINHOOD_CHAIN_MAINNET_RPC: &str = "https://rpc.mainnet.chain.robinhood.com";
pub const ROBINHOOD_CHAIN_TESTNET_RPC: &str = "https://rpc.testnet.chain.robinhood.com";
pub const ROBINHOOD_CHAIN_ID: u64 = 4663;
pub const ROBINHOOD_TESTNET_CHAIN_ID: u64 = 46630;
pub const ALVION_ROBINHOOD_CLEARINGHOUSE: &str = "0x4663111111111111111111111111111111114663";
pub const ROBINHOOD_USDC_ADDRESS: &str = "0x538d689255850901eC5A206A2a9d80d283A44919";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobinhoodOrderPayload {
    pub trader: String, // Ethereum address format 0x...
    pub market: String,
    pub is_long: bool,
    pub price: f64,
    pub size_usd: f64,
    pub leverage: u16,
    pub nonce: u64,
    pub signature: Option<String>, // EIP-712 secp256k1 signature
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobinhoodBatchReport {
    pub batch_id: String,
    pub trade_count: u32,
    pub target_clearinghouse: String,
    pub settlement_tx_hash: String,
    pub status: String,
    pub timestamp: u64,
    pub chain_id: u64,
}

/// Compute Keccak256 hash of byte input
pub fn keccak256(data: &[u8]) -> [u8; 32] {
    let mut keccak = Keccak::v256();
    let mut output = [0u8; 32];
    keccak.update(data);
    keccak.finalize(&mut output);
    output
}

/// Verify if a string is a valid Ethereum/Robinhood Chain hex address (0x + 40 hex chars)
pub fn is_valid_robinhood_address(address: &str) -> bool {
    if !address.starts_with("0x") && !address.starts_with("0X") {
        return false;
    }
    let hex_part = &address[2..];
    hex_part.len() == 40 && hex_part.chars().all(|c| c.is_ascii_hexdigit())
}

/// Verify format of an EIP-712 signature (0x + 130 hex characters or 65 bytes)
pub fn is_valid_eip712_signature(sig: &str) -> bool {
    let clean = if let Some(stripped) = sig.strip_prefix("0x") {
        stripped
    } else {
        sig
    };
    clean.len() == 130 && clean.chars().all(|c| c.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_robinhood_address_validation() {
        assert!(is_valid_robinhood_address("0x4663111111111111111111111111111111114663"));
        assert!(is_valid_robinhood_address("0x71C8364762A803325b335371b292723E59d64663"));
        assert!(!is_valid_robinhood_address("invalid_address"));
        assert!(!is_valid_robinhood_address("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"));
    }

    #[test]
    fn test_keccak256() {
        let hash = keccak256(b"Alvion Perpetuals");
        assert_eq!(hash.len(), 32);
    }
}

