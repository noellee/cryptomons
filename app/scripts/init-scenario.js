const { CryptomonElement } = require('../../test/utils.js');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();
  const cost = await contract.methods.starterCryptomonCost().call();

  if (!await contract.methods.isOwnerInitialized(accounts[0]).call()) {
    console.log(`Creating new Cryptomon for ${accounts[0]}`);
    await contract.methods
      .initStarterCryptomon('pika', CryptomonElement.Electricity)
      .send({ from: accounts[0], value: cost, gasLimit: 6721975 });
  }

  if (!await contract.methods.isOwnerInitialized(accounts[2]).call()) {
    console.log(`Creating new Cryptomon for ${accounts[2]}`);
    await contract.methods
      .initStarterCryptomon('char', CryptomonElement.Fire)
      .send({ from: accounts[2], value: cost, gasLimit: 6721975 });
  }
};
