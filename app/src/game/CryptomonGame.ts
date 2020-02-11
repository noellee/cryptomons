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

  private _methods: any;

  private _starterCost: number | undefined;

  constructor(web3: Web3) {
    this._web3 = web3;
    this._contract = getContract(this._web3);

    // due to unknown reasons (maybe metamask related),
    // the default account isn't passed to contract calls
    // this is a workaround to avoid passing { from: ... } every time on contract calls
    const self = this;
    this._methods = new Proxy(this._contract.methods, {
      get(methods, methodName): any {
        return (...params: any[]) => {
          const method = methods[methodName](...params);
          const from = self.defaultAccount;
          return {
            call: async (options: any) => method.call({ from, ...options }),
            send: async (options: any) => method.send({ from, ...options }),
          };
        };
      },
    });
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
      this._starterCost = await this._methods.starterCryptomonCost().call();
    }
    return this._starterCost;
  }

  async getCryptomonIds(owner: string): Promise<number[]> {
    const ids: string[] = await this._methods.getCryptomonIdsByOwner(owner).call();
    return ids.map(id => +id);
  }

  async getCryptomonIdsByCoOwner(coOwner: string): Promise<number[]> {
    const ids: string[] = await this._methods.getCryptomonIdsByCoOwner(coOwner).call();
    return ids.map(id => +id);
  }

  async getCryptomonsByOwner(owner: string): Promise<Cryptomon[]> {
    const ids = await this.getCryptomonIds(owner);
    return this.getCryptomonsByIds(ids);
  }

  async getCryptomonsByCoOwner(coOwner: string): Promise<Cryptomon[]> {
    const ids = await this.getCryptomonIdsByCoOwner(coOwner);
    return this.getCryptomonsByIds(ids);
  }

  async isOwnerInitialized(ownerAddr?: string) {
    const owner = ownerAddr ?? this.defaultAccount;
    return this._methods.isOwnerInitialized(owner).call();
  }

  async getCryptomonById(id: number): Promise<Cryptomon> {
    const [cryptomonResult, offer] = await Promise.all([
      this._methods.cryptomons(id).call(),
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

  async getOffer(id: number): Promise<Offer | null> {
    const offer = await this._methods.offers(id).call();
    if (this._isEmptyAddress(offer.buyer)) return null;
    const count = await this._methods.getOfferedCryptomonsCount(id).call();
    const promises = Array(this._toNumber(count))
      .map((v, i) => this._methods.getOfferedCryptomonByIndex(id, i).call());
    const offeredCryptomons = (await Promise.all(promises)).map(this._toNumber.bind(this));
    return Offer.fromResult({ id, offeredCryptomons, ...offer });
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

  async getBattlegroundCryptomons() {
    const events = await this._contract.getPastEvents('CryptomonReadyToFight', { fromBlock: 0 });
    const ids = events
      .map(event => event.returnValues.id)
      .map(this._web3.utils.toBN)
      .map(id => id.toNumber());
    const cryptomons = await this.getCryptomonsByIds(ids);
    return cryptomons.filter(c => c.isReadyToFight || c.isInAChallenge);
  }

  // ///////////////////////////
  // Init starter
  // ///////////////////////////

  async initStarterCryptomon(name: string, element: CryptomonElement): Promise<void> {
    const value = await this.getStarterCryptomonCost();
    await this._methods.initStarterCryptomon(name, element).send({ value });
  }

  // ///////////////////////////
  // Trading
  // ///////////////////////////

  async sellCryptomon(id: number): Promise<void> {
    await this._methods.sell(id).send();
  }

  async makeOffer(offer: Offer): Promise<void> {
    const { cryptomonId, price: value, offeredCryptomons, buyer: from } = offer;
    await this._methods.makeOffer(cryptomonId, offeredCryptomons).send({ from, value });
  }

  async acceptOffer(id: number): Promise<void> {
    await this._methods.acceptOffer(id).send();
  }

  async rejectOffer(id: number): Promise<void> {
    await this._methods.rejectOffer(id).send();
  }

  async withdrawOffer(id: number): Promise<void> {
    await this._methods.withdrawOffer(id).send();
  }

  // ///////////////////////////
  // Breeding
  // ///////////////////////////

  async breed(parent1: number, parent2: number, name: string) {
    await this._methods.breed(parent1, parent2, name).send();
  }

  // ///////////////////////////
  // Sharing
  // ///////////////////////////

  async share(id: number, coOwner: string) {
    await this._methods.share(id, coOwner).send();
  }

  async endSharing(id: number) {
    await this._methods.endSharing(id).send();
  }

  // ///////////////////////////
  // Fighting
  // ///////////////////////////

  async readyToFight(id: number) {
    await this._methods.readyToFight(id).send();
  }

  async leaveFight(id: number) {
    await this._methods.leaveFight(id).send();
  }

  async challenge(opponentId: number, challengerId: number, stake: number) {
    await this._methods.challenge(opponentId, challengerId).send({ value: stake });
  }

  // UTILITY METHODS

  private _toNumber(bnString: string) {
    return this._web3.utils.toBN(bnString).toNumber();
  }

  private _isEmptyAddress(address: string) {
    return this._web3.utils.toBN(address).eq(this._web3.utils.toBN(0));
  }
}
