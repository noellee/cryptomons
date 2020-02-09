import Web3 from 'web3';
// @ts-ignore
import { Contract } from 'web3-eth-contract'; // eslint-disable-line import/no-extraneous-dependencies
import getContract from '@/contracts/CryptomonsGameContract';
import Cryptomon from './Cryptomon';
import CryptomonElement from './CryptomonElement';
import Offer from './Offer';

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

  async getCryptomonIds(owner: string): Promise<number[]> {
    const ids: string[] = await this._contract.methods.getCryptomonIdsByOwner(owner).call();
    return ids.map(id => +id);
  }

  async getCryptomonsByOwner(owner: string): Promise<Cryptomon[]> {
    const ids = await this.getCryptomonIds(owner);
    return this.getCryptomonsByIds(ids);
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

  async sellCryptomon(id: number): Promise<void> {
    const from = this.defaultAccount;
    await this._contract.methods.sell(id).send({ from });
  }

  async getCryptomonById(id: number): Promise<Cryptomon> {
    const [cryptomonResult, offer] = await Promise.all([
      this._contract.methods.cryptomons(id).call(),
      this.getOffer(id),
    ]);
    const cryptomon = Cryptomon.fromResult({ ...cryptomonResult, id });
    cryptomon.offer = offer;
    return cryptomon;
  }

  async getCryptomonsByIds(ids: number[]): Promise<Cryptomon[]> {
    const promises = ids.map(this.getCryptomonById.bind(this));
    return Promise.all(promises);
  }

  async getMarketplaceCryptomons(max: number): Promise<Cryptomon[]> {
    const events = await this._contract.getPastEvents('CryptomonPutOnSale', { fromBlock: 0 });
    const ids = events
      .map(event => event.returnValues.id)
      .map(this._web3.utils.toBN)
      .map(id => id.toNumber());
    const cryptomons = await this.getCryptomonsByIds(ids);
    return cryptomons.filter(c => c.isOnSale); // check if they're still on sale
  }

  async makeOffer(offer: Offer): Promise<void> {
    const { cryptomonId, price: value, offeredCryptomons, buyer: from } = offer;
    await this._contract.methods.makeOffer(cryptomonId, offeredCryptomons).send({ from, value });
  }

  async getOffer(id: number): Promise<Offer | null> {
    const offer = await this._contract.methods.offers(id).call();
    if (this._isEmptyAddress(offer.buyer)) return null;
    const count = await this._contract.methods.getOfferedCryptomonsCount(id).call();
    const promises = Array(count)
      .map((v, i) => this._contract.methods.getOfferedCryptomonByIndex(id, i).call());
    const offeredCryptomons = (await Promise.all(promises)).map(this._toNumber.bind(this));
    return Offer.fromResult({ id, offeredCryptomons, ...offer });
  }

  async acceptOffer(id: number): Promise<void> {
    const from = this.defaultAccount;
    await this._contract.methods.acceptOffer(id).send({ from });
  }

  async rejectOffer(id: number): Promise<void> {
    const from = this.defaultAccount;
    await this._contract.methods.rejectOffer(id).send({ from });
  }

  async withdrawOffer(id: number): Promise<void> {
    const from = this.defaultAccount;
    await this._contract.methods.withdrawOffer(id).send({ from });
  }

  // UTILITY METHODS

  private _toNumber(bnString: string) {
    return this._web3.utils.toBN(bnString).toNumber();
  }

  private _isEmptyAddress(address: string) {
    return this._web3.utils.toBN(address).eq(this._web3.utils.toBN(0));
  }
}
