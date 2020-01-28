import CryptomonElement from './CryptomonElement';

export default class Cryptomon {
  private _id: number;

  private _health: number;

  private _strength: number;

  private _element: CryptomonElement;

  constructor(id: number, element: CryptomonElement, health: number, strength: number) {
    this._id = id;
    this._health = health;
    this._strength = strength;
    this._element = element;
  }

  public get id(): number {
    return this._id;
  }

  public get element(): CryptomonElement {
    return this._element;
  }

  public get elementAsString(): string {
    return CryptomonElement[this.element];
  }

  public get health(): number {
    return this._health;
  }

  public get strength(): number {
    return this._strength;
  }
}
