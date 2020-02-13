import { EventData } from 'web3-eth-contract'; // eslint-disable-line import/no-extraneous-dependencies

export default class FightResult {
  private _opponentId: string;

  private _challengerId: string;

  private _winnerId: string;

  private _winnerOwner: string;

  constructor(opponentId: string, challengerId: string, winnerId: string, winnerOwner: string) {
    this._opponentId = opponentId;
    this._challengerId = challengerId;
    this._winnerId = winnerId;
    this._winnerOwner = winnerOwner;
  }

  static fromEvent(event: EventData) {
    const { opponentId, challengerId, winnerId, winnerOwner } = event.returnValues;
    return new FightResult(opponentId, challengerId, winnerId, winnerOwner);
  }

  public get challengerWon(): boolean {
    return this._challengerId === this._winnerId;
  }

  public get opponentWon(): boolean {
    return this._opponentId === this._winnerId;
  }
}
