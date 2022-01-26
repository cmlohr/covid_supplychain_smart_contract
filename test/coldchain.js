// tests with mocha and chai
const ColdChain = artifacts.require("ColdChain");

contract('ColdChain', (accounts) => {
  it('should do stuff...', async () => {
    const coldChainInstance = await ColdChain.deployed();
    const balance = await coldChainInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
});
