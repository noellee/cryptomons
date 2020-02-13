export default class Challenge {
  public opponentId: string;

  public challengerId: string;

  public stake: string;

  constructor(opponentId: string, challengerId: string, stake: string) {
    this.opponentId = opponentId;
    this.challengerId = challengerId;
    this.stake = stake;
  }

  static fromResult(result: { opponentId: string, challengerId: string, stake: string }) {
    return new Challenge(result.opponentId, result.challengerId, result.stake);
  }
}
