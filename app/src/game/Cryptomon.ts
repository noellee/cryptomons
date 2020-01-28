enum Element {
  Fire,
  Water,
  Earth,
  Electricity,
  Air,
}

export default class Cryptomon {
  public static Element = Element;

  private _id: number;

  private _health: number;

  private _strength: number;

  private _element: Element;

  constructor(id: number, element: Element, health: number, strength: number) {
    this._id = id;
    this._health = health;
    this._strength = strength;
    this._element = element;
  }

  public get id(): number {
    return this._id;
  }

  public get element(): Element {
    return this._element;
  }

  public get elementAsString(): string {
    return Element[this.element];
  }

  public get health(): number {
    return this._health;
  }

  public get strength(): number {
    return this._strength;
  }
}
