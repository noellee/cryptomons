import Web3 from 'web3';
// @ts-ignore
import { Contract } from 'web3-eth-contract'; // eslint-disable-line import/no-extraneous-dependencies
import getContract from '@/contracts/CryptomonsGameContract';
import Cryptomon from './Cryptomon';
import CryptomonElement from './CryptomonElement';

export default class CryptomonGame {
  private _web3: Web3;

  private _contract: Contract;

  private _starterCost: number | undefined;

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

  async getStarterCryptomonCost() {
    if (this._starterCost === undefined) {
      this._starterCost = await this._contract.methods.starterCryptomonCost().call();
    }
    return this._starterCost;
  }

  async getCryptomonCount(owner: string): Promise<number> {
    return this._contract.methods.getCryptomonCountByOwner(owner).call();
  }

  async getCryptomonIds(owner: string): Promise<number[]> {
    const ids: string[] = await this._contract.methods.getCryptomonIdsByOwner(owner).call();
    return ids.map(id => +id);
  }

  async getAllCryptomons(owner: string): Promise<Cryptomon[]> {
    const ids = await this.getCryptomonIds(owner);
    const promises = ids.map(id => this._contract.methods.getCryptomon(id).call());
    return (await Promise.all(promises))
      .map(({ id, element, health, strength }) => new Cryptomon(id, element, health, strength));
  }

  async initStarterCryptomon(name: string, element: CryptomonElement): Promise<void> {
    const value = await this.getStarterCryptomonCost();
    const from = this.defaultAccount;
    await this._contract.methods.initStarterCryptomon(name, element).send({ from, value });
  }

  async isOwnerInitialized(ownerAddr?: string) {
    const owner = ownerAddr ?? this.defaultAccount;
    return this._contract.methods.isOwnerInitialized(owner).call();
  }
}
