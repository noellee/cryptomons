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

  // console.log(contract.address);
  // console.log(await contract.methods.getCryptomonIdsByOwner(accounts[0]).call());
  // await contract.methods.share('0', accounts[1]).send({ from: accounts[0], gasLimit: 6721975 });
  // for (let index = 0; index < cryptomons.length; index++) {
  //   const others = cryptomons.map((_, i) => i).filter(i => i !== index);
  //   for (let j = 0; j < others.length; j++) {
  //     const i = others[j];
  //     const name = cryptomons[index][0] + cryptomons[i][0];
  //     console.log(`${cryptomons[index][0]} + ${cryptomons[i][0]} = ${name}`);
  //     console.log(i, accounts[index]);
  //     await contract.methods.share(i, accounts[index]).send({ from: accounts[i], gasLimit: 6721975 });
  //     console.log('breed');
  //     await contract.methods.breed(index, i, name).send({ from: accounts[index], gasLimit: 6721975 });
  //     console.log('unshare');
  //     await contract.methods.endSharing(index).send({ from: accounts[i], gasLimit: 6721975 });
  //   }
  // }

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
};
