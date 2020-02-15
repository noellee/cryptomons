const init = require('./init-scenario');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();

  await init(web3, contract);

  console.log('Selling');
  await contract.methods.sell(0).send({ from: accounts[0] });

  console.log('Making offer');
  await contract.methods.makeOffer(0, [1]).send({ from: accounts[1], value: web3.utils.toWei('3', 'ether'), gasLimit: 6721975 });
};
