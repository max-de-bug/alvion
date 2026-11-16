const fs = require("fs");
const path = require("path");
const solc = require("solc");

function compile() {
  console.log("Compiling Alvion smart contracts with solc 0.8.24...");

  const contractsDir = path.resolve(__dirname, "../contracts");
  const vaultPath = path.join(contractsDir, "AlvionPerpVault.sol");
  const iVaultPath = path.join(contractsDir, "interfaces/IAlvionVault.sol");
  const iPythPath = path.join(contractsDir, "interfaces/IPyth.sol");

  const vaultSource = fs.readFileSync(vaultPath, "utf8");
  const iVaultSource = fs.readFileSync(iVaultPath, "utf8");
  const iPythSource = fs.readFileSync(iPythPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "AlvionPerpVault.sol": { content: vaultSource },
      "interfaces/IAlvionVault.sol": { content: iVaultSource },
      "interfaces/IPyth.sol": { content: iPythSource },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasError = false;
    for (const error of output.errors) {
      if (error.severity === "error") {
        console.error("Compilation error:", error.formattedMessage);
        hasError = true;
      } else {
        console.warn("Compilation warning:", error.formattedMessage);
      }
    }
    if (hasError) {
      process.exit(1);
    }
  }

  const contract = output.contracts["AlvionPerpVault.sol"]["AlvionPerpVault"];
  const artifactsDir = path.resolve(__dirname, "../artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const artifact = {
    contractName: "AlvionPerpVault",
    abi: contract.abi,
    bytecode: "0x" + contract.evm.bytecode.object,
  };

  fs.writeFileSync(
    path.join(artifactsDir, "AlvionPerpVault.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("✓ Contract compiled successfully!");
  console.log(`✓ Bytecode length: ${artifact.bytecode.length} bytes`);
  console.log(`✓ ABI functions: ${artifact.abi.filter((x) => x.type === "function").length}`);
  console.log(`✓ Saved to: ${path.join(artifactsDir, "AlvionPerpVault.json")}`);
}

compile();

