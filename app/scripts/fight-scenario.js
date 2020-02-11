const init = require('./init-scenario');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();

  await init(web3, contract);

  console.log('Getting ready to fight');
  await contract.methods.readyToFight(0).send({ from: accounts[0] });
  await contract.methods.readyToFight(1).send({ from: accounts[2] });

  // console.log('Challenging');
};
