enum Element {
  Fire,
  Water,
  Earth,
  Electricity,
  Air,
}

export default class Cryptomon {
  public static Element = Element;

  private _health: number;

  private _strength: number;

  private _element: Element;

  constructor(element: Element, health: number, strength: number) {
    this._health = health;
    this._strength = strength;
    this._element = element;
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
