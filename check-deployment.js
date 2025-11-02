#!/usr/bin/env node

/**
 * Quick Deployment Check Script
 * Verifies that all necessary configurations are in place for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const checks = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, colors.green);
    checks.push(true);
    return true;
  } else {
    log(`✗ ${description} - MISSING`, colors.red);
    checks.push(false);
    return false;
  }
}

function checkEnvVariable(envPath, variable) {
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasVariable = envContent.includes(variable) && 
                      !envContent.includes(`${variable}=your_`) &&
                      !envContent.includes(`${variable}=0x0000`);
  
  if (hasVariable) {
    log(`  ✓ ${variable} is set`, colors.green);
    return true;
  } else {
    log(`  ✗ ${variable} is NOT set or has placeholder value`, colors.yellow);
    return false;
  }
}

log('\n🔍 VoteLedger Vercel Deployment Check\n', colors.blue);

// Check project structure
log('📁 Project Structure:', colors.blue);
checkFile('client/package.json', 'client/package.json exists');
checkFile('client/vite.config.js', 'client/vite.config.js exists');
checkFile('client/index.html', 'client/index.html exists');
checkFile('client/src/main.jsx', 'client/src/main.jsx exists');

// Check configuration files
log('\n⚙️  Configuration Files:', colors.blue);
checkFile('vercel.json', 'Root vercel.json exists');
checkFile('client/vercel.json', 'Client vercel.json exists');
checkFile('.vercelignore', '.vercelignore exists');

// Check environment setup
log('\n🔐 Environment Configuration:', colors.blue);
const hasEnvExample = checkFile('client/.env.example', 'client/.env.example exists');
const hasEnv = checkFile('client/.env', 'client/.env exists');

if (hasEnv) {
  log('\n  Checking environment variables:', colors.blue);
  const envPath = 'client/.env';
  
  const criticalVars = [
    'VITE_CONTRACT_ADDRESS',
    'VITE_CHAIN_ID',
    'VITE_CHAIN_RPC_URL',
    'VITE_WALLETCONNECT_PROJECT_ID',
    'VITE_PINATA_JWT',
  ];
  
  criticalVars.forEach(varName => {
    checkEnvVariable(envPath, varName);
  });
}

// Check smart contract
log('\n📜 Smart Contract:', colors.blue);
checkFile('web3/contracts/VoteLedger.sol', 'Smart contract exists');
checkFile('client/src/config/VotingDAO.abi.json', 'Contract ABI exists');

// Check dependencies
log('\n📦 Dependencies:', colors.blue);
const packageJsonPath = 'client/package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const requiredDeps = [
    'react',
    'react-dom',
    'wagmi',
    'viem',
    '@rainbow-me/rainbowkit',
    '@tanstack/react-query',
    'axios',
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      log(`  ✓ ${dep} installed`, colors.green);
      checks.push(true);
    } else {
      log(`  ✗ ${dep} missing`, colors.red);
      checks.push(false);
    }
  });
}

// Summary
log('\n' + '='.repeat(50), colors.blue);
const passed = checks.filter(Boolean).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

if (percentage === 100) {
  log(`\n✅ All checks passed! (${passed}/${total})`, colors.green);
  log('\n🚀 Ready for Vercel deployment!', colors.green);
  log('\nNext steps:', colors.blue);
  log('1. Push to GitHub: git push origin main');
  log('2. Import to Vercel and set Framework to "Vite"');
  log('3. Set Root Directory to "client"');
  log('4. Add environment variables in Vercel settings');
  log('5. Deploy!');
  log('\nSee VERCEL_DEPLOYMENT.md for detailed instructions.\n');
} else if (percentage >= 80) {
  log(`\n⚠️  Most checks passed (${passed}/${total} - ${percentage}%)`, colors.yellow);
  log('\nReview the warnings above before deploying.', colors.yellow);
  log('See VERCEL_DEPLOYMENT.md for detailed instructions.\n');
} else {
  log(`\n❌ Some checks failed (${passed}/${total} - ${percentage}%)`, colors.red);
  log('\nPlease fix the issues above before deploying.', colors.red);
  log('See VERCEL_DEPLOYMENT.md for help.\n');
  process.exit(1);
}
