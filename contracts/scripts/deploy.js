const hre = require("hardhat");

async function main() {
  console.log("[Hardhat] Starting deployment of ArcPayRegistry...");

  const ArcPayRegistry = await hre.ethers.getContractFactory("ArcPayRegistry");
  const registry = await ArcPayRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("=========================================");
  console.log("🎉 ArcPayRegistry Smart Contract Deployed!");
  console.log(`📍 Contract Address: ${address}`);
  console.log("=========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
