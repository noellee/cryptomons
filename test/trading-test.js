const { CryptomonElement, CryptomonState, assertBalanceIncrease } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame trade', accounts => {
  const seller = accounts[0];
  const buyer = accounts[1];
  const offerPrice = 12345;
  let contract, pikaId, charId;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    const cost = await contract.starterCryptomonCost();
    const pikaTx = await contract.initStarterCryptomon('pika',
      CryptomonElement.Electricity,
      { from: seller, value: cost });
    const charTx = await contract.initStarterCryptomon('char',
      CryptomonElement.Fire,
      { from: buyer, value: cost });
    pikaId = pikaTx.logs[0].args.id.toNumber();
    charId = charTx.logs[0].args.id.toNumber();
  });

  it('seller should be able to sell owned cryptomon', async () => {
    await contract.sell(pikaId, { from: seller });
    const pika = await contract.cryptomons(pikaId);
    assert.equal(pika.state, CryptomonState.OnSale);
  });

  describe('offer interaction', async () => {

    beforeEach('make offer', async () => {
      await contract.makeOffer(pikaId, [charId], { from: buyer, value: offerPrice });
      const offer = await contract.offers(pikaId);
      let char = await contract.cryptomons(charId);
      assert.equal(offer.buyer, buyer);
      assert.equal(offer.price.toNumber(), offerPrice);
      assert.equal(char.state, CryptomonState.InAnOffer);
    });

    it('seller should be able to reject offers', async () => {
      await contract.rejectOffer(pikaId, { from: seller });

      const pika = await contract.cryptomons(pikaId);
      const char = await contract.cryptomons(charId);
      assert.equal(pika.owner, seller);
      assert.equal(pika.state, CryptomonState.OnSale);  // still on sale
      assert.equal(char.owner, buyer);
      assert.equal(char.state, CryptomonState.Idle);

      // refund
      const buyerBalance = await contract.getBalance({ from: buyer });
      assert.equal(buyerBalance.toNumber(), offerPrice);
    });

    it('buyer should be able to withdraw', async () => {
      await contract.withdrawOffer(pikaId, { from: buyer });

      const pika = await contract.cryptomons(pikaId);
      const char = await contract.cryptomons(charId);
      assert.equal(pika.owner, seller);
      assert.equal(pika.state, CryptomonState.OnSale);  // still on sale
      assert.equal(char.owner, buyer);
      assert.equal(char.state, CryptomonState.Idle);

      // refund
      const buyerBalance = await contract.getBalance({ from: buyer });
      assert.equal(buyerBalance.toNumber(), offerPrice);
    });

    it('seller should be able to accept offers', async () => {
      await contract.acceptOffer(pikaId, { from: seller });

      const pika = await contract.cryptomons(pikaId);
      const char = await contract.cryptomons(charId);
      assert.equal(pika.owner, buyer);
      assert.equal(pika.state, CryptomonState.Idle);
      assert.equal(char.owner, seller);
      assert.equal(char.state, CryptomonState.Idle);

      const sellerCryptomons = await contract.getCryptomonIdsByOwner(seller);
      const buyerCryptomons = await contract.getCryptomonIdsByOwner(buyer);
      assert.deepEqual(sellerCryptomons, [char.id]);
      assert.deepEqual(buyerCryptomons, [pika.id]);

      // fund transfer
      const sellerBalance = await contract.getBalance({ from: seller });
      assert.equal(sellerBalance.toNumber(), offerPrice);
    });

    afterEach('offer should be gone after interaction', async () => {
      const offer = await contract.offers(pikaId);
      assert(web3.utils.toBN(offer.buyer).eq(web3.utils.toBN(0)));
    });

    afterEach('clear balance', async () => {
      const withdrawPromise = async (account) => {
        const balance = await contract.getBalance({ from: account });
        if (!balance.toNumber()) return;
        await assertBalanceIncrease(
          async () => await contract.withdrawFunds(balance, { from: account }),
          account, offerPrice,
        );
      };
      await Promise.all([
        withdrawPromise(buyer),
        withdrawPromise(seller),
      ]);
    });
  });
});