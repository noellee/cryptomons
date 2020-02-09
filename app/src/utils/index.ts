import Web3 from 'web3';

// eslint-disable-next-line import/prefer-default-export
export function getWeb3(): Promise<Web3> {
  return new Promise(((resolve, reject) => {
  // Check for injected web3 (mist/metamask)
    const { ethereum } = window;
    if (typeof ethereum !== 'undefined') {
      const web3 = new Web3(ethereum);
      // @ts-ignore
      ethereum.enable().then(() => resolve(web3));
    } else {
      // web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545')) GANACHE FALLBACK
      reject(new Error('Unable to connect to Metamask'));
    }
  }));
}
