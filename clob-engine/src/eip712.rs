use tiny_keccak::{Hasher, Keccak};

pub const AVALANCHE_C_CHAIN_ID: u64 = 43114;

pub fn keccak256(data: &[u8]) -> [u8; 32] {
    let mut keccak = Keccak::v256();
    let mut output = [0u8; 32];
    keccak.update(data);
    keccak.finalize(&mut output);
    output
}

pub fn get_domain_separator(verifying_contract: &str) -> [u8; 32] {
    let type_hash = keccak256(b"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    let name_hash = keccak256(b"AlvionExchange");
    let version_hash = keccak256(b"1.0");

    let mut encoded = Vec::new();
    encoded.extend_from_slice(&type_hash);
    encoded.extend_from_slice(&name_hash);
    encoded.extend_from_slice(&version_hash);
    encoded.extend_from_slice(&AVALANCHE_C_CHAIN_ID.to_be_bytes());
    encoded.extend_from_slice(verifying_contract.as_bytes());

    keccak256(&encoded)
}

