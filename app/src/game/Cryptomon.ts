export default class Cryptomon {
  private _health: number;

  private _strength: number;

  constructor(health: number, strength: number) {
    this._health = health;
    this._strength = strength;
  }

  public get health(): number {
    return this._health;
  }

  public get strength(): number {
    return this._strength;
  }
}
