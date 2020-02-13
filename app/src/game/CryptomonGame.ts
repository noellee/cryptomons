import Web3 from 'web3';
// @ts-ignore
import { Contract } from 'web3-eth-contract'; // eslint-disable-line import/no-extraneous-dependencies
import getContract from '@/contracts/CryptomonsGameContract';
import Cryptomon from './Cryptomon';
import CryptomonElement from './CryptomonElement';
import Offer from './Offer';
import Challenge from './Challenge';
import FightResult from '@/game/FightResult';

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

  async getCryptomonIds(owner: string): Promise<string[]> {
    return this._methods.getCryptomonIdsByOwner(owner).call();
  }

  async getCryptomonIdsByCoOwner(coOwner: string): Promise<string[]> {
    return this._methods.getCryptomonIdsByCoOwner(coOwner).call();
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

  async getCryptomonById(id: string): Promise<Cryptomon> {
    const cryptomonResult = await this._methods.cryptomons(id).call();
    const cryptomon = Cryptomon.fromResult({ ...cryptomonResult, id });
    if (cryptomon.isInAChallenge) {
      cryptomon.challenge = await this.getChallenge(id.toString());
    } else if (cryptomon.isOnSale) {
      cryptomon.offer = await this.getOffer(id);
    }
    return cryptomon;
  }

  async getCryptomonsByIds(ids: string[]): Promise<Cryptomon[]> {
    const promises = ids.map(this.getCryptomonById.bind(this));
    return Promise.all(promises);
  }

  async getOffer(id: string): Promise<Offer | null> {
    const offer = await this._methods.offers(id).call();
    if (this._isZero(offer.buyer)) return null;
    const count = await this._methods.getOfferedCryptomonsCount(id).call();
    const promises = Array(this._toNumber(count))
      .map((v, i) => this._methods.getOfferedCryptomonByIndex(id, i).call());
    const offeredCryptomons = (await Promise.all(promises)).map(this._toNumber.bind(this));
    return Offer.fromResult({ id, offeredCryptomons, ...offer });
  }

  async getChallenge(id: string): Promise<Challenge | null> {
    const challenge = await this._methods.challenges(id).call();
    return this._isZero(challenge.stake)
      ? null
      : Challenge.fromResult({ ...challenge, opponentId: id });
  }

  async getMarketplaceCryptomons(max: number): Promise<Cryptomon[]> {
    const events = await this._contract.getPastEvents('CryptomonPutOnSale', { fromBlock: 0 });
    const ids = events.map(event => event.returnValues.id);
    const cryptomons = await this.getCryptomonsByIds(ids);
    return cryptomons.filter(c => c.isOnSale); // check if they're still on sale
  }

  async getBattlegroundCryptomons() {
    const events = await this._contract.getPastEvents('CryptomonReadyToFight', { fromBlock: 0 });
    const ids = events.map(event => event.returnValues.id);
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

  async sellCryptomon(id: string): Promise<void> {
    await this._methods.sell(id).send();
  }

  async makeOffer(offer: Offer): Promise<void> {
    const { cryptomonId, price: value, offeredCryptomons, buyer: from } = offer;
    await this._methods.makeOffer(cryptomonId, offeredCryptomons).send({ from, value });
  }

  async acceptOffer(id: string): Promise<void> {
    await this._methods.acceptOffer(id).send();
  }

  async rejectOffer(id: string): Promise<void> {
    await this._methods.rejectOffer(id).send();
  }

  async withdrawOffer(id: string): Promise<void> {
    await this._methods.withdrawOffer(id).send();
  }

  // ///////////////////////////
  // Breeding
  // ///////////////////////////

  async breed(parent1: string, parent2: string, name: string) {
    await this._methods.breed(parent1, parent2, name).send();
  }

  // ///////////////////////////
  // Sharing
  // ///////////////////////////

  async share(id: string, coOwner: string) {
    await this._methods.share(id, coOwner).send();
  }

  async endSharing(id: string) {
    await this._methods.endSharing(id).send();
  }

  // ///////////////////////////
  // Fighting
  // ///////////////////////////

  async readyToFight(id: string) {
    await this._methods.readyToFight(id).send();
  }

  async leaveFight(id: string) {
    await this._methods.leaveFight(id).send();
  }

  async challenge(opponentId: string, challengerId: string, stake: number) {
    await this._methods.challenge(opponentId, challengerId).send({ value: stake });
  }

  async acceptChallenge(id: string, stake: string) {
    await this._methods.acceptChallenge(id).send({ value: stake });
  }

  async rejectChallenge(id: string) {
    await this._methods.rejectChallenge(id).send();
  }

  async withdrawChallenge(id: string) {
    await this._methods.withdrawChallenge(id).send();
  }

  async waitForFightResult(cryptomonId: string): Promise<any> {
    const options = {
      fromBlock: 'latest',
      filter: {
        opponentId: cryptomonId,
      },
    };
    return new Promise(((resolve, reject) => {
      this._contract.once('Fight', options, ((error, event) => {
        if (error) reject(error);
        resolve(event);
      }));
    }));
  }

  async onFightResult(cryptomonId: string, callback: (result: FightResult) => any) {
    const event = await this.waitForFightResult(cryptomonId);
    callback(FightResult.fromEvent(event));
  }

  async findChallengeByChallengerId(id: string): Promise<Challenge | null> {
    const opponentId = await this.findOpponentIdByChallengerId(id);
    return this.getChallenge(opponentId);
  }

  async findOpponentIdByChallengerId(id: string): Promise<string> {
    const options = {
      fromBlock: 0,
      filter: { challengerId: id },
    };
    const events = await this._contract.getPastEvents('ChallengeCreated', options);
    const event = events[events.length - 1];
    return event.returnValues.opponentId;
  }

  // UTILITY METHODS

  private _toNumber(bnString: string) {
    return this._web3.utils.toBN(bnString).toNumber();
  }

  private _isZero(value: string) {
    return this._web3.utils.toBN(value).isZero();
  }
}
