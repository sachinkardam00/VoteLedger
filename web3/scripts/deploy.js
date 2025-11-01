const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting VotingDAO deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy VotingDAO
  console.log("📦 Deploying VotingDAO contract...");
  const VotingDAO = await hre.ethers.getContractFactory("VotingDAO");
  const votingDAO = await VotingDAO.deploy();

  await votingDAO.waitForDeployment();
  const contractAddress = await votingDAO.getAddress();

  console.log("✅ VotingDAO deployed to:", contractAddress);
  console.log("👤 Contract owner:", await votingDAO.owner());
  console.log("📊 Initial status:", await votingDAO.currentStatus(), "(0 = RegistrationOpen)\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    contractName: "VotingDAO",
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
  };

  // Save to JSON file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Generate ABI file for frontend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/VoteLedger.sol/VotingDAO.json"
  );
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiFile = path.join(deploymentsDir, "VotingDAO-ABI.json");
    fs.writeFileSync(
      abiFile,
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log("📄 ABI saved to:", abiFile);
  }

  // Update .env file with contract address
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("✏️  Updated .env with contract address\n");
  }

  console.log("🎉 Deployment completed successfully!\n");
  console.log("📋 Next steps:");
  console.log("1. Copy contract address to frontend .env file");
  console.log("2. Verify contract on block explorer (optional)");
  console.log("3. Start the frontend application");
  console.log("\n✨ Contract Address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
