const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const CoTime = await hre.ethers.getContractFactory("CoTime");
  console.log("部署合约中...");
  const coTime = await CoTime.deploy({ gasLimit: 5000000 });
  await coTime.deployed();
  console.log("合约部署成功！地址：", coTime.address);

  fs.writeFileSync(
    "./frontend/src/utils/contract.js",
    `export const CONTRACT_ADDRESS = "${coTime.address}";`
  );
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});