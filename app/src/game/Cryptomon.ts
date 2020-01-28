import CryptomonElement from './CryptomonElement';

export default class Cryptomon {
  private _id: number;

  private _name: string;

  private _health: number;

  private _strength: number;

  private _element: CryptomonElement;

  constructor(id: number, name: string, element: CryptomonElement, health: number,
    strength: number) {
    this._id = id;
    this._name = name;
    this._health = health;
    this._strength = strength;
    this._element = element;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
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

  static fromResult(result: {id: number, name: string, element: CryptomonElement, health: number,
    strength: number}) {
    return new Cryptomon(result.id, result.name, result.element, result.health, result.strength);
  }
}
