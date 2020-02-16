/* eslint-disable max-len,no-await-in-loop */
const { CryptomonElement } = require('../../test/utils.js');
const init = require('./init-scenario');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();
  await init(web3, contract);
  const cryptomons = [
    ['bird', CryptomonElement.Air],
    ['bulb', CryptomonElement.Earth],
    ['pika', CryptomonElement.Electricity],
    ['char', CryptomonElement.Fire],
    ['turt', CryptomonElement.Water],
  ];

  const ps = cryptomons.map(async (cryptomon, index) => {
    const others = cryptomons.map((_, i) => i).filter(i => i !== index);
    for (let j = 0; j < others.length; j++) {
      const i = others[j];
      const name = cryptomons[index][0] + cryptomons[i][0];
      console.log(`${cryptomons[index][0]} + ${cryptomons[i][0]} = ${name}`);
      await contract.methods.share(index, accounts[i]).send({ from: accounts[index], gasLimit: 6721975 });
      console.log('breed');
      await contract.methods.breed(index, i, name).send({ from: accounts[i], gasLimit: 6721975 });
      console.log('unshare');
      await contract.methods.endSharing(index).send({ from: accounts[index], gasLimit: 6721975 });
    }
  });
  await Promise.all(ps);

  await contract.methods.sell(0).send({ from: accounts[0] });
  await contract.methods.sell(1).send({ from: accounts[1] });
  await contract.methods.readyToFight(2).send({ from: accounts[2] });
  await contract.methods.readyToFight(3).send({ from: accounts[3] });
  await contract.methods.makeOffer(0, [4]).send({ from: accounts[4], value: 15e17, gasLimit: 6721975 });
};
