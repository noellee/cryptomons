import CryptomonElement from './CryptomonElement';
import CryptomonState from './CryptomonState';
import Offer from './Offer';

export default class Cryptomon {
  public readonly id: number;

  public readonly name: string;

  public readonly health: number;

  public readonly strength: number;

  public readonly primaryElement: CryptomonElement;

  public readonly secondaryElement: CryptomonElement;

  public owner: string;

  public coOwner: string;

  public offer: Offer | null = null;

  private _state: CryptomonState;

  constructor(id: number, name: string, primaryElement: CryptomonElement,
    secondaryElement: CryptomonElement, state: CryptomonState, health: number, strength: number,
    owner: string, coOwner: string) {
    this.id = id;
    this.name = name;
    this.health = health;
    this.strength = strength;
    this.primaryElement = primaryElement;
    this.secondaryElement = secondaryElement;
    this._state = state;
    this.owner = owner;
    this.coOwner = coOwner;
  }

  public get primaryElementAsString(): string {
    return CryptomonElement[this.primaryElement];
  }

  public get secondaryElementAsString(): string {
    return CryptomonElement[this.secondaryElement];
  }

  public get isInAnOffer(): boolean {
    return this._state === CryptomonState.InAnOffer;
  }

  public get isIdle(): boolean {
    return this._state === CryptomonState.Idle;
  }

  public get isOnSale(): boolean {
    return this._state === CryptomonState.OnSale;
  }

  public set isOnSale(value) {
    this._state = value ? CryptomonState.OnSale : CryptomonState.Idle;
  }

  public get isShared(): boolean {
    return this._state === CryptomonState.Shared;
  }

  public get canBreed(): boolean {
    return this.isIdle || this.isShared;
  }

  static fromResult(result: {id: number, name: string, primaryElement: CryptomonElement,
    secondaryElement: CryptomonElement, state: CryptomonState, health: number, strength: number,
    owner: string, coOwner: string }) {
    return new Cryptomon(
      result.id, result.name, result.primaryElement, result.secondaryElement, result.state,
      result.health, result.strength, result.owner, result.coOwner,
    );
  }
}
