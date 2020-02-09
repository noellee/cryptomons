const { CryptomonElement, CryptomonState } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame trade', accounts => {
  const seller = accounts[0];
  const buyer = accounts[1];
  let contract, pikaId;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    const cost = await contract.starterCryptomonCost();
    const pikaTx = await contract.initStarterCryptomon('pika', CryptomonElement.Electricity, { from: seller, value: cost });
    pikaId = pikaTx.logs[0].args.id.toNumber();
  });
  
  it('seller should be able to sell owned cryptomon', async () => {
    await contract.sell(pikaId, { from: seller });
    const pika = await contract.cryptomons(pikaId);
    assert.equal(pika.state, CryptomonState.OnSale);
  });

  it('make offer', async () => {
    await contract.makeOffer(pikaId, [], { from: buyer, value: 100 });
    const offer = await contract.offers(pikaId);
    assert.equal(offer.buyer, buyer);
    assert.equal(offer.price.toNumber(), 100);
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
    assert.equal(pika.owner, buyer);
    assert.equal(pika.state, CryptomonState.Idle);

    const sellerCryptomons = await contract.getCryptomonIdsByOwner(seller);
    const buyerCryptomons = await contract.getCryptomonIdsByOwner(buyer);
    assert.deepEqual(sellerCryptomons, []);
    assert.deepEqual(buyerCryptomons, [pika.id]);
  });
});