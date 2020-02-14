import Web3 from 'web3';

// eslint-disable-next-line import/prefer-default-export
export function getWeb3(): Promise<Web3> {
  return new Promise(((resolve, reject) => {
  // Check for injected web3 (mist/metamask)
    const { ethereum } = window;
    if (typeof ethereum !== 'undefined') {
      // @ts-ignore
      const web3 = new Web3(ethereum);
      web3.eth.transactionConfirmationBlocks = 1;
      // @ts-ignore
      ethereum.enable().then(() => resolve(web3));
    } else {
      reject(new Error('Unable to connect to Metamask'));
    }
  }));
}
