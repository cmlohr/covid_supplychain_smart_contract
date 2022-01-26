// tests with mocha and chai
const ColdChain = artifacts.require("ColdChain");

contract('ColdChain', (accounts) => {
  it('should do stuff...', async () => {
    const coldChainInstance = await ColdChain.deployed();
    // const balance = await coldChainInstance;

    assert.equal(actual, expected, errorMessage);
  });
});
