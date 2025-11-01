const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '../artifacts/contracts/VoteLedger.sol/VotingDAO.json');
const outputPath = path.join(__dirname, '../../client/src/config/VotingDAO.abi.json');

const artifact = require(artifactPath);

fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));

console.log('✅ ABI exported successfully to:', outputPath);
