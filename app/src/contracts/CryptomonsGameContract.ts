import Web3 from 'web3';

const cryptomonsGameArtifact = require('@/../../build/contracts/CryptomonsGame.json');

export default function getContract(web3: Web3) {
  const { abi } = cryptomonsGameArtifact;
  let address = window.localStorage.getItem('cryptomonContractAddress');
  if (!address) {
    // @ts-ignore
    ({ address } = cryptomonsGameArtifact.networks[web3.currentProvider.networkVersion]);
  }
  if (!address) throw new TypeError();
  console.log(`Using contract at: ${address}`);
  return new web3.eth.Contract(abi, address);
}
