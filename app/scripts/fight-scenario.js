const { CryptomonState } = require('../../test/utils.js');
const init = require('./init-scenario');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();

  await init(web3, contract);

  console.log('Getting ready to fight');
  const getReadyToFight = async (id, owner) => {
    const cryptomon = await contract.methods.cryptomons(id).call();
    if (cryptomon.state === CryptomonState.ReadyToFight.toString()) {
      console.log('Already ready to fight');
      return;
    }
    await contract.methods.readyToFight(id).send({ from: owner });
  };
  await getReadyToFight(0, accounts[0]);
  await getReadyToFight(1, accounts[1]);

  const stake = 1e18;

  console.log('Challenging');
  await contract.methods.challenge(1, 0).send({ from: accounts[0], value: stake });
};
