const { CryptomonElement } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame breeding', accounts => {
  let contract, owner, pikaId, charId;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    const seller = accounts[0];
    const buyer = accounts[1];
    owner = buyer;
    const cost = await contract.starterCryptomonCost();

    const pikaTx = await contract.initStarterCryptomon('pika',
      CryptomonElement.Electricity,
      { from: seller, value: cost });
    const charTx = await contract.initStarterCryptomon('char',
      CryptomonElement.Fire,
      { from: buyer, value: cost });

    pikaId = pikaTx.logs[0].args.id.toNumber();
    charId = charTx.logs[0].args.id.toNumber();

    await contract.sell(pikaId, { from: seller });
    await contract.makeOffer(pikaId, [], { from: buyer, value: 100 });
    await contract.acceptOffer(pikaId, { from: seller });
  });

  it('should breed', async () => {
    const breedTx = await contract.breed(pikaId, charId, 'baby', { from: owner });
    const babyId = breedTx.logs[0].args.id;
    const baby = await contract.cryptomons(babyId);
    const ownedCryptomons = await contract.getCryptomonIdsByOwner(owner);
    assert.equal(baby.owner, owner);
    assert.deepInclude(ownedCryptomons, babyId);
  });
});