import Web3 from 'web3';
// @ts-ignore
import { Contract } from 'web3-eth-contract'; // eslint-disable-line import/no-unresolved
import getContract from '@/contracts/CryptomonsGameContract';
import Cryptomon from './Cryptomon';

export default class CryptomonGame {
  private _web3: Web3;

  private _contract: Contract;

  constructor(web3: Web3) {
    this._web3 = web3;
    this._contract = getContract(this._web3);
  }

  get defaultAccount(): string {
    const account = this._web3.eth.defaultAccount;
    if (!account) {
      throw new TypeError('No default account specified.');
    }
    return account;
  }

  async getCryptomonCount(owner: string): Promise<number> {
    return this._contract.methods.getCryptomonCount(owner).call();
  }

  async getAllCryptomons(owner: string): Promise<Cryptomon[]> {
    const count = await this.getCryptomonCount(owner);
    const promises = [];
    for (let i = 0; i < count; i++) {
      const promise = this._contract.methods.getCryptomon(owner, i).call();
      promises.push(promise);
    }
    return (await Promise.all(promises))
      .map(({ health, strength }) => new Cryptomon(health, strength));
  }
}
