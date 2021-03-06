import Web3 from 'web3';
import { Contract } from 'web3-eth-contract'; // eslint-disable-line import/no-extraneous-dependencies
import { TransactionReceipt } from 'web3-core';
import Cryptomon from './Cryptomon';
import CryptomonElement from './CryptomonElement';
import Offer from './Offer';
import Challenge from './Challenge';
import FightResult from '@/game/FightResult';

const cryptomonsGameArtifact = require('@/../../build/contracts/CryptomonsGame.json');

function getContractAddress(network: string): string {
  switch (network) {
    case '3': // Ropsten
      return '0x096318cd9b9ac55a28ddcfe6fb78978286228bfa';
    default:
      return cryptomonsGameArtifact.networks[network]?.address;
  }
}

function getContract(web3: Web3, address?: string): Contract {
  const { abi } = cryptomonsGameArtifact;
  // @ts-ignore
  address = getContractAddress(web3.currentProvider.networkVersion) || address;
  console.log(`Using contract at: ${address}`);
  return new web3.eth.Contract(abi, address);
}

export default class CryptomonGame {
  private _web3: Web3;

  private _contract: Contract;

  private _methods: any;

  private _starterCost: string | undefined;

  constructor(web3: Web3, contractAddress: string | null) {
    this._web3 = web3;
    this._contract = getContract(
      this._web3,
      contractAddress === null ? undefined : contractAddress,
    );

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
            send: async (options: any) => new Promise((resolve, reject) => {
              method.send({ from, ...options })
                .once('confirmation', (confirmation: any, receipt: TransactionReceipt) => {
                  resolve(receipt);
                })
                .on('error', reject);
            }),
          };
        };
      },
    });
  }

  get contractAddress(): string {
    return this._contract.options?.address;
  }

  get defaultAccount(): string {
    const account = this._web3.eth.defaultAccount;
    if (!account) {
      throw new TypeError('No default account specified.');
    }
    return account;
  }

  async getStarterCryptomonCost(): Promise<string> {
    if (this._starterCost === undefined) {
      this._starterCost = await this._methods.starterCryptomonCost().call();
    }
    if (this._starterCost === undefined) throw new TypeError(); // still undefined after fetching
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

  async isOwnerInitialized(ownerAddr?: string): Promise<boolean> {
    const owner = ownerAddr ?? this.defaultAccount;
    return this._methods.isOwnerInitialized(owner).call();
  }

  async getCryptomonById(id: string): Promise<Cryptomon> {
    const cryptomonResult = await this._methods.cryptomons(id).call();
    const cryptomon = Cryptomon.fromResult({ ...cryptomonResult });
    if (cryptomon.isInAChallenge) {
      cryptomon.challenge = await this.getChallenge(id);
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
    const offeredCryptomons = await this._methods.getOfferedCryptomons(id).call();
    return Offer.fromResult({ id, offeredCryptomons, ...offer });
  }

  async getChallenge(id: string): Promise<Challenge | null> {
    const challenge = await this._methods.challenges(id).call();
    return this._isZero(challenge.stake)
      ? null
      : Challenge.fromResult({ ...challenge, opponentId: id });
  }

  async getMarketplaceCryptomons(): Promise<Cryptomon[]> {
    const marketplace = await this._methods.getMarketplace().call();
    return this.getCryptomonsByIds(marketplace);
  }

  async getBattlegroundCryptomons(): Promise<Cryptomon[]> {
    const battleground = await this._methods.getBattleground().call();
    return this.getCryptomonsByIds(battleground);
  }

  // ///////////////////////////
  // Game balance
  // ///////////////////////////

  async getBalance(): Promise<string> {
    return this._methods.getBalance().call();
  }

  async withdrawFunds(amount: string): Promise<void> {
    await this._methods.withdrawFunds(amount).send();
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

  async takeOffMarket(id: string): Promise<void> {
    await this._methods.takeOffMarket(id).send();
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

  async breed(parent1: string, parent2: string, name: string): Promise<void> {
    await this._methods.breed(parent1, parent2, name).send();
  }

  // ///////////////////////////
  // Sharing
  // ///////////////////////////

  async share(id: string, coOwner: string): Promise<void> {
    await this._methods.share(id, coOwner).send();
  }

  async endSharing(id: string): Promise<void> {
    await this._methods.endSharing(id).send();
  }

  // ///////////////////////////
  // Fighting
  // ///////////////////////////

  async readyToFight(id: string): Promise<void> {
    await this._methods.readyToFight(id).send();
  }

  async leaveFight(id: string): Promise<void> {
    await this._methods.leaveFight(id).send();
  }

  async challenge(opponentId: string, challengerId: string, stake: number): Promise<void> {
    await this._methods.challenge(opponentId, challengerId).send({ value: stake });
  }

  async acceptChallenge(id: string, stake: string): Promise<void> {
    await this._methods.acceptChallenge(id).send({ value: stake });
  }

  async rejectChallenge(id: string): Promise<void> {
    await this._methods.rejectChallenge(id).send();
  }

  async withdrawChallenge(id: string): Promise<void> {
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

  private _isZero(value: string): boolean {
    return this._web3.utils.toBN(value).isZero();
  }
}
