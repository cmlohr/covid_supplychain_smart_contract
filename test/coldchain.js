// tests with mocha and chai

const {expectedEvent, BN } = require("@openzeppelin/test-helpers");
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");

const ColdChain = artifacts.require("ColdChain");

contract('ColdChain', (accounts) => {
  it('should do stuff...', async () => {
    const coldChainInstance = await ColdChain.deployed();
    // const balance = await coldChainInstance;

    assert.equal(actual, expected, errorMessage);
  });
});
