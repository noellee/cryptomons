const Web3 = require('web3');

const web3 = new Web3('http://localhost:8545');

function getContract() {
  // eslint-disable-next-line global-require
  const cryptomonsGameArtifact = require('../../build/contracts/CryptomonsGame.json');
  const { abi } = cryptomonsGameArtifact;
  const { address } = cryptomonsGameArtifact.networks[5777];
  console.log(`Using contract at: ${address}`);
  return new web3.eth.Contract(abi, address);
}

if (process.argv.length !== 3) {
  console.error('Invalid number of parameters.');
}

// eslint-disable-next-line import/no-dynamic-require
const script = require(process.argv[2]);

script(web3, getContract(web3))
  .then(process.exit)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 30000);
