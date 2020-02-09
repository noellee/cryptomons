import CryptomonElement from './CryptomonElement';
import CryptomonState from './CryptomonState';
import Offer from './Offer';

export default class Cryptomon {
  public readonly id: number;

  public readonly name: string;

  public readonly health: number;

  public readonly strength: number;

  public readonly element: CryptomonElement;

  public owner: string;

  public offer: Offer | null = null;

  private _state: CryptomonState;

  constructor(id: number, name: string, element: CryptomonElement, state: CryptomonState,
    health: number, strength: number, owner: string) {
    this.id = id;
    this.name = name;
    this.health = health;
    this.strength = strength;
    this.element = element;
    this._state = state;
    this.owner = owner;
  }

  public get elementAsString(): string {
    return CryptomonElement[this.element];
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

  static fromResult(result: {id: number, name: string, element: CryptomonElement,
    state: CryptomonState, health: number, strength: number, owner: string}) {
    return new Cryptomon(
      result.id, result.name, result.element, result.state, result.health, result.strength,
      result.owner,
    );
  }
}
