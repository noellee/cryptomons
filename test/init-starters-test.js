const { CryptomonElement } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame init', async accounts => {
  var contract;

  before(async () => {
    contract = await CryptomonsGame.deployed();
  });

  it('should init', async () => {
    const cost = await contract.starterCryptomonCost();
    const transaction = await contract.initStarterCryptomon(
      'pika',
      CryptomonElement.Electricity,
      { from: accounts[0], value: cost }
    );

    assert.equal(transaction.logs[0].event, 'StarterCryptomonCreated');

    const pikaId = transaction.logs[0].args.id;
    const pika = await contract.cryptomons(pikaId);

    assert.equal(pika.name, 'pika');
    assert.equal(pika.primaryElement, CryptomonElement.Electricity);
    assert.equal(pika.secondaryElement, CryptomonElement.Electricity);
    assert.equal(pika.owner, accounts[0]);
  });

  it('should update totalCryptomons', async () => {
    const totalCryptomons = await contract.totalCryptomons();
    assert.equal(totalCryptomons, 1);
  });

  it('should update owner isInitialized', async () => {
    const isInitialized = await contract.isOwnerInitialized.call(accounts[0]);
    assert(isInitialized);
  });

  it('should update owned Cryptomons', async () => {
    const ids = await contract.getCryptomonIdsByOwner(accounts[0]);
    assert.equal(ids.length, 1);
  });
});
