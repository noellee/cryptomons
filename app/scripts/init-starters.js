const Web3 = require('web3');
const { CryptomonElement } = require('../../test/utils.js');

const web3 = new Web3('http://localhost:8545');

function getContract() {
  // eslint-disable-next-line global-require
  const cryptomonsGameArtifact = require('../../build/contracts/CryptomonsGame.json');
  const { abi } = cryptomonsGameArtifact;
  const { address } = cryptomonsGameArtifact.networks[5777];
  console.log(`Using contract at: ${address}`);
  return new web3.eth.Contract(abi, address);
}

async function script() {
  const contract = getContract(web3);
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
}

script()
  .then(process.exit)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 30000);
