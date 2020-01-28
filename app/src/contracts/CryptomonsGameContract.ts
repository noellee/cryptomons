import Web3 from 'web3';

const cryptomonsGameArtifact = require('@/../../build/contracts/CryptomonsGame.json');

export default function getContract(web3: Web3) {
  const { abi } = cryptomonsGameArtifact;
  // @ts-ignore
  const { address } = cryptomonsGameArtifact.networks[web3.currentProvider.networkVersion];
  console.log(`Using contract at: ${address}`);
  return new web3.eth.Contract(abi, address);
}
