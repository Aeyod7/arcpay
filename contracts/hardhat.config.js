require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ARCPAY_DEPLOYER_PRIVATE_KEY = process.env.ARCPAY_DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      accounts: [ARCPAY_DEPLOYER_PRIVATE_KEY],
    },
  },
};
