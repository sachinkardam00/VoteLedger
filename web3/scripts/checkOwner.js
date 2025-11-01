const hre = require("hardhat");

async function main() {
  const contractAddress = "0x657699D1527AdF93714C00546420097c944fb095";
  
  const VotingDAO = await hre.ethers.getContractAt("VotingDAO", contractAddress);
  
  console.log("Contract Address:", contractAddress);
  console.log("Checking owner...");
  
  const owner = await VotingDAO.owner();
  console.log("Contract Owner:", owner);
  console.log("Owner (lowercase):", owner.toLowerCase());
  
  const expectedOwner = "0x7de5877d7e5bb8a1ee28a0c58a04cc76fad9dd74";
  console.log("\nExpected Owner:", expectedOwner);
  console.log("Expected (lowercase):", expectedOwner.toLowerCase());
  
  console.log("\nMatch:", owner.toLowerCase() === expectedOwner.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
