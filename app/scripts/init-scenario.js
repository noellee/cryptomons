/* eslint-disable no-await-in-loop */
const { CryptomonElement } = require('../../test/utils.js');

const init = async (contract, cost, account, name, element) => {
  if (!await contract.methods.isOwnerInitialized(account).call()) {
    console.log(`Creating new Cryptomon for ${account}`);
    await contract.methods
      .initStarterCryptomon(name, element)
      .send({ from: account, value: cost, gasLimit: 6721975 });
  }
};

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();
  const cost = await contract.methods.starterCryptomonCost().call();

  const cryptomons = [
    ['bird', CryptomonElement.Air],
    ['bulb', CryptomonElement.Earth],
    ['pika', CryptomonElement.Electricity],
    ['char', CryptomonElement.Fire],
    ['turt', CryptomonElement.Water],
  ];

  for (let i = 0; i < cryptomons.length; i++) {
    const [name, element] = cryptomons[i];
    await init(contract, cost, accounts[i], name, element);
  }
};
