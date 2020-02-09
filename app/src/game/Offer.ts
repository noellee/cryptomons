export default class Offer {
  public cryptomonId: number;

  public price: string;

  public buyer: string;

  public offeredCryptomons: number[];

  constructor(cryptomonId: number, buyer: string, price: string, offeredCryptomons: number[]) {
    this.cryptomonId = cryptomonId;
    this.buyer = buyer;
    this.price = price;
    this.offeredCryptomons = offeredCryptomons;
  }

  static fromResult(result: { id: number, buyer: string, price: string,
    offeredCryptomons: number[] }) {
    return new Offer(result.id, result.buyer, result.price, result.offeredCryptomons);
  }
}
