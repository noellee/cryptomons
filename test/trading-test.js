const { CryptomonElement, CryptomonState } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame trade', accounts => {
  const seller = accounts[0];
  const buyer = accounts[1];
  let contract, pikaId, charId;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    const cost = await contract.starterCryptomonCost();
    const pikaTx = await contract.initStarterCryptomon('pika', CryptomonElement.Electricity, { from: seller, value: cost });
    const charTx = await contract.initStarterCryptomon('char', CryptomonElement.Fire, { from: buyer, value: cost });
    pikaId = pikaTx.logs[0].args.id.toNumber();
    charId = charTx.logs[0].args.id.toNumber();
  });
  
  it('seller should be able to sell owned cryptomon', async () => {
    await contract.sell(pikaId, { from: seller });
    const pika = await contract.cryptomons(pikaId);
    assert.equal(pika.state, CryptomonState.OnSale);
  });

  describe('offer interaction', async () => {

    beforeEach(async () => {
      await contract.makeOffer(pikaId, [charId], { from: buyer, value: 100 });
      const offer = await contract.offers(pikaId);
      let char = await contract.cryptomons(charId);
      assert.equal(offer.buyer, buyer);
      assert.equal(offer.price.toNumber(), 100);
      assert.equal(char.state, CryptomonState.InAnOffer);
    });

    it('seller should be able to reject offers', async () => {
      const buyerBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(buyer));
      await contract.rejectOffer(pikaId, { from: seller });
      const buyerBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(buyer));

      const pika = await contract.cryptomons(pikaId);
      const char = await contract.cryptomons(charId);
      assert.equal(pika.owner, seller);
      assert.equal(pika.state, CryptomonState.OnSale);  // still on sale
      assert.equal(char.owner, buyer);
      assert.equal(char.state, CryptomonState.Idle);
      
      // refund
      assert(buyerBalanceAfter.sub(buyerBalanceBefore).toString(), '100');
    });

    it('buyer should be able to withdraw', async () => {
      const buyerBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(buyer));
      const withdrawOfferTx = await contract.withdrawOffer(pikaId, { from: buyer });
      const buyerBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(buyer));

      const pika = await contract.cryptomons(pikaId);
      const char = await contract.cryptomons(charId);
      assert.equal(pika.owner, seller);
      assert.equal(pika.state, CryptomonState.OnSale);  // still on sale
      assert.equal(char.owner, buyer);
      assert.equal(char.state, CryptomonState.Idle);

      // refund
      const tx = await web3.eth.getTransaction(withdrawOfferTx.tx);
      const gasPrice = web3.utils.toBN(tx.gasPrice);
      const gasUsed = web3.utils.toBN(withdrawOfferTx.receipt.gasUsed);
      const gas = gasPrice.mul(gasUsed);
      assert.equal(
        buyerBalanceAfter.toString(),
        buyerBalanceBefore.sub(gas).add(web3.utils.toBN(100)).toString(),
      );
    }); 

    it('seller should be able to accept offers', async () => {
      const sellerBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(seller));
      const acceptOfferTx = await contract.acceptOffer(pikaId, { from: seller });
      const sellerBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(seller));
      
      const tx = await web3.eth.getTransaction(acceptOfferTx.tx);
      const gasPrice = web3.utils.toBN(tx.gasPrice);
      const gasUsed = web3.utils.toBN(acceptOfferTx.receipt.gasUsed);
      const gas = gasPrice.mul(gasUsed);
      assert.equal(
        sellerBalanceAfter.toString(),
        sellerBalanceBefore.sub(gas).add(web3.utils.toBN(100)).toString(),
      );

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
    });
  });
});