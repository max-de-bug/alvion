const fs = require("fs");
const path = require("path");
const { createWalletClient, createPublicClient, http } = require("viem");
const { privateKeyToAccount, generatePrivateKey } = require("viem/accounts");
const { avalancheFuji } = require("viem/chains");

async function deployToFuji() {
  console.log("=".repeat(65));
  console.log("  ALVION PERPETUAL VAULT: AVALANCHE FUJI DEPLOYMENT");
  console.log("=".repeat(65));

  const artifactPath = path.resolve(__dirname, "../artifacts/AlvionPerpVault.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found! Run 'node scripts/compile_contracts.js' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Fuji Testnet Configuration
  const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
  const FUJI_USDC = "0x5425890298aed601595a70ab815c96711a31bc65";
  const FUJI_PYTH = "0x77017684D705bF40C0F09b1fC1A5A90C53696879";

  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(FUJI_RPC),
  });

  // Check private key
  let pkey = process.env.DEPLOYER_PRIVATE_KEY;
  let isGenerated = false;

  if (!pkey) {
    // Check if we already have a saved local testnet key
    const keyFile = path.resolve(__dirname, "../.fuji_deployer.key");
    if (fs.existsSync(keyFile)) {
      pkey = fs.readFileSync(keyFile, "utf8").trim();
    } else {
      pkey = generatePrivateKey();
      fs.writeFileSync(keyFile, pkey);
      isGenerated = true;
    }
  }

  if (!pkey.startsWith("0x")) {
    pkey = "0x" + pkey;
  }

  const account = privateKeyToAccount(pkey);
  console.log(`\nDeployer Address: ${account.address}`);

  const balance = await publicClient.getBalance({ address: account.address });
  const balanceAvax = Number(balance) / 1e18;
  console.log(`Fuji AVAX Balance: ${balanceAvax.toFixed(4)} AVAX`);

  const userWalletAddress = "0xA082394ece720f349bD11913A9C1c4B481f6742d";
  const userBalance = await publicClient.getBalance({ address: userWalletAddress });
  const userBalanceAvax = Number(userBalance) / 1e18;
  console.log(`User Wallet (${userWalletAddress}) Fuji Balance: ${userBalanceAvax.toFixed(4)} AVAX`);

  if (balanceAvax < 0.05) {
    console.log("\n[DEPLOYMENT READY - PENDING GAS]");
    console.log(`Your wallet ${userWalletAddress} has ${userBalanceAvax.toFixed(4)} Fuji AVAX.`);
    console.log(`The local deployment key is: ${account.address}`);
    console.log("\nTo proceed with the deployment:");
    console.log(`👉 Send ~0.25 - 0.5 Fuji AVAX from ${userWalletAddress} to ${account.address}`);
    console.log(`   (Or set DEPLOYER_PRIVATE_KEY=<your_testnet_private_key> in .env)`);
    console.log("\nOnce sent, re-run: node scripts/deploy_fuji.js");
    process.exit(0);
  }

  console.log("\nDeploying AlvionPerpVault to Avalanche Fuji...");
  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http(FUJI_RPC),
  });

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [FUJI_USDC, userWalletAddress], // sequencer = user wallet
  });

  console.log(`Deployment transaction submitted: ${hash}`);
  console.log("Waiting for block confirmation on Avalanche Fuji...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log(`✓ Vault deployed at: ${contractAddress}`);

  // Set Pyth Oracle on Avalanche Fuji
  try {
    console.log(`Setting Pyth Oracle (${FUJI_PYTH}) on Avalanche Fuji...`);
    const pythTx = await walletClient.writeContract({
      address: contractAddress,
      abi: artifact.abi,
      functionName: "setPythOracle",
      args: [FUJI_PYTH],
    });
    await publicClient.waitForTransactionReceipt({ hash: pythTx });
    console.log(`✓ Pyth Oracle configured successfully!`);
  } catch (e) {
    console.warn("Could not set Pyth Oracle automatically:", e.message);
  }

  // Transfer ownership to user wallet if deployer != user
  if (account.address.toLowerCase() !== userWalletAddress.toLowerCase()) {
    console.log(`Transferring contract ownership to user wallet (${userWalletAddress})...`);
    try {
      const transferTx = await walletClient.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: "transferOwnership",
        args: [userWalletAddress],
      });
      await publicClient.waitForTransactionReceipt({ hash: transferTx });
      console.log(`✓ Ownership successfully transferred to ${userWalletAddress}!`);
    } catch (e) {
      console.warn("Could not transfer ownership automatically:", e.message);
    }
  }

  console.log("\n" + "=".repeat(65));
  console.log("  ALVION PERP VAULT DEPLOYED SUCCESSFULLY TO AVALANCHE FUJI!");
  console.log("=".repeat(65));
  console.log(`✓ Contract Address: ${contractAddress}`);
  console.log(`✓ Block Number:     ${receipt.blockNumber}`);
  console.log(`✓ Gas Used:         ${receipt.gasUsed.toString()}`);
  console.log(`✓ Snowtrace Link:   https://testnet.snowtrace.io/address/${contractAddress}`);

  // Save deployment artifact
  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    network: "avalancheFuji",
    chainId: 43113,
    contractAddress,
    deployer: account.address,
    owner: userWalletAddress,
    sequencer: userWalletAddress,
    usdcAddress: FUJI_USDC,
    pythOracleAddress: FUJI_PYTH,
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "fuji.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log(`✓ Deployment details saved to: deployments/fuji.json`);

  // Update src/lib/wagmi.ts
  const wagmiPath = path.resolve(__dirname, "../src/lib/wagmi.ts");
  if (fs.existsSync(wagmiPath)) {
    let wagmiContent = fs.readFileSync(wagmiPath, "utf8");
    wagmiContent = wagmiContent.replace(
      /export const ALVION_VAULT_ADDRESS = "[^"]*"/,
      `export const ALVION_VAULT_ADDRESS = "${contractAddress}"`
    );
    if (!wagmiContent.includes("FUJI_ALVION_VAULT_ADDRESS")) {
      wagmiContent = wagmiContent.replace(
        `export const ALVION_VAULT_ADDRESS = "${contractAddress}" as const;`,
        `export const ALVION_VAULT_ADDRESS = "${contractAddress}" as const;\nexport const FUJI_ALVION_VAULT_ADDRESS = "${contractAddress}" as const;`
      );
    }
    fs.writeFileSync(wagmiPath, wagmiContent);
    console.log(`✓ Updated src/lib/wagmi.ts with deployed contract address.`);
  }

  console.log(`✓ Deployment details saved to: deployments/fuji.json`);
}

deployToFuji().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
