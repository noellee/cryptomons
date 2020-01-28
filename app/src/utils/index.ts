import Web3 from 'web3';

/*
* 1. Check for injected web3 (mist/metamask)
* 2. If metamask/mist create a new web3 instance and pass on result
* 3. Get networkId - Now we can check the user is connected to the right network to use our dApp
* 4. Get user account from metamask
* 5. Get user balance
*/

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

// }))
//   .then(result => new Promise(((resolve, reject) => {
//     // Retrieve network ID
//     result.web3().version.getNetwork((err, networkId) => {
//       if (err) {
//         // If we can't find a networkId keep result the same and reject the promise
//         reject(new Error('Unable to retrieve network ID'));
//       } else {
//         // Assign the networkId property to our result and resolve promise
//         result = Object.assign({}, result, { networkId });
//         resolve(result);
//       }
//     });
//   })))
//   .then(result => new Promise(((resolve, reject) => {
//     // Retrieve coinbase
//     result.web3().eth.getCoinbase((err: Error, coinbase: string) => {
//       if (err) {
//         reject(new Error('Unable to retrieve coinbase'));
//       } else {
//         // eslint-disable-next-line no-param-reassign
//         result = Object.assign({}, result, { coinbase });
//         resolve(result);
//       }
//     });
//   })))
//   .then(result => new Promise(((resolve, reject) => {
//     // Retrieve balance for coinbase
//     result.web3().eth.getBalance(result.coinbase, (err, balance) => {
//       if (err) {
//         reject(new Error(`Unable to retrieve balance for address: ${result.coinbase}`));
//       } else {
//         result = Object.assign({}, result, { balance });
//         resolve(result);
//       }
//     });
//   })));
