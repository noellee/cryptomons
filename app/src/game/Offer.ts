export default class Offer {
  public cryptomonId: string;

  public price: string;

  public buyer: string;

  public offeredCryptomons: string[];

  constructor(cryptomonId: string, buyer: string, price: string, offeredCryptomons: string[]) {
    this.cryptomonId = cryptomonId;
    this.buyer = buyer;
    this.price = price;
    this.offeredCryptomons = offeredCryptomons;
  }

  static fromResult(result: { id: string, buyer: string, price: string,
    offeredCryptomons: string[] }) {
    return new Offer(result.id, result.buyer, result.price, result.offeredCryptomons);
  }
}
