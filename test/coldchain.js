// tests with mocha and chai

const {expectedEvent, BN } = require("@openzeppelin/test-helpers");
const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");

const ColdChain = artifacts.require("ColdChain");

contract('ColdChain', (accounts) => {
  before(async() => {
    this.coldChainInstance = {}
    this.owner = accounts[0];
    
    this.VACCINE_BRANDS = {
      Pfizer: "Pfizer-BioNTech",
      Moderna: "Moderna",
      Janssen: "Johnson & Johnson's Janssen",
      Sputnik: "Sputnik V",
    };

    this.ModeEnums = {
      ISSUER: { val: "ISSUER", pos: 0},
      VERIFIER: { val: "VERIFIER", pos: 1},
      PROVER: { val: "PROVER", pos: 2},
    };
    this.StatusEnums = {
      manufactured: { val: "MANUFACTURED", pos: 0 },
      delivering1: { val: "DELIVERING_INTERNATIONAL", pos: 1 },
      stored: { val: "STORED", pos: 2 },
      delivering2: { val: "DELIVERING_LOCAL", pos: 3 },
      delivered: { val: "DELIVERED", pos: 4 },
    };

    this.defaultEntities = {
      manufacturerA: { id: accounts[1], mode: this.ModeEnums.PROVER.val },
      manufacturerB: { id: accounts[2], mode: this.ModeEnums.PROVER.val },
      inspector: { id: accounts[3], mode: this.ModeEnums.ISSUER.val },
      distributorGlobal: { id: accounts[4], mode: this.ModeEnums.VERIFIER.val },
      distributorLocal: { id: accounts[5], mode: this.ModeEnums.VERIFIER.val },
      immunizer: { id: accounts[6], mode: this.ModeEnums.ISSUER.val },
      traveller: { id: accounts[7], mode: this.ModeEnums.PROVER.val },
      borderAgent: { id: accounts[8], mode: this.ModeEnums.VERIFIER.val },
    };
  });

  it('should do stuff...', async () => {
    const coldChainInstance = await ColdChain.deployed();
    // const balance = await coldChainInstance;

    assert.equal(actual, expected, errorMessage);
  });
});
