require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19", // 与你的合约Solidity版本一致
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY],
      gas: 5000000, // 足够覆盖合约部署
      gasPrice: 30000000000 // 30 Gwei
    }
  },
  paths: {
    sources: "./contracts", // 合约文件路径（原结构）
    scripts: "./scripts",   // 部署脚本路径（原结构）
    artifacts: "./artifacts" // 编译产物路径
  }
};