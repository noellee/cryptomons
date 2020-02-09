const init = require('./init-scenario');

module.exports = async (web3, contract) => {
  const accounts = await web3.eth.getAccounts();
  await init(web3, contract);
};
