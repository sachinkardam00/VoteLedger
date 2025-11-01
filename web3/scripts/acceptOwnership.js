const hre = require("hardhat");

async function main() {
  const contractAddress = "0x657699D1527AdF93714C00546420097c944fb095";
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Accepting ownership with account:", deployer.address);
  
  const VotingDAO = await hre.ethers.getContractAt("VotingDAO", contractAddress);
  
  console.log("\nCurrent owner:", await VotingDAO.owner());
  
  console.log("\nCalling acceptOwnership()...");
  const tx = await VotingDAO.acceptOwnership();
  console.log("Transaction hash:", tx.hash);
  
  console.log("Waiting for confirmation...");
  await tx.wait();
  
  console.log("\n✓ Ownership accepted!");
  console.log("New owner:", await VotingDAO.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
