const { CryptomonElement, CryptomonState, assertThrowsAsync } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame sharing', accounts => {
  let contract, owner, coOwner, pikaId, charId;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    owner = accounts[0];
    coOwner = accounts[1];

    const cost = await contract.starterCryptomonCost();

    const pikaTx = await contract.initStarterCryptomon('pika',
      CryptomonElement.Electricity,
      { from: owner, value: cost });
    const charTx = await contract.initStarterCryptomon('char',
      CryptomonElement.Fire,
      { from: coOwner, value: cost });

    pikaId = pikaTx.logs[0].args.id.toNumber();
    charId = charTx.logs[0].args.id.toNumber();
  });

  it('owner should not be able to share with themselves', async () => {
    const tryToShare = async () => {
      await contract.share(pikaId, owner, { from: owner });
    };
    assertThrowsAsync(tryToShare, /revert/);
  });

  it('owner should be able to share', async () => {
    await contract.share(pikaId, coOwner, { from: owner });
    const pika = await contract.cryptomons(pikaId);
    assert.equal(pika.state, CryptomonState.Shared);
  });

  it('should have a co-owner', async () => {
    const pika = await contract.cryptomons(pikaId);
    assert.equal(pika.coOwner, coOwner);

    const coOwned = await contract.getCryptomonIdsByCoOwner(coOwner);
    assert.deepEqual(coOwned.map(id => id.toNumber()), [pikaId]);
  });

  it('co-owner should be able to use shared cryptomon to breed', async () => {
    const breedTx = await contract.breed(pikaId, charId, 'sharekira', { from: coOwner });
    const babyId = breedTx.logs[0].args.id;
    const baby = await contract.cryptomons(babyId);
    assert.equal(baby.name, 'sharekira');
    assert.equal(baby.owner, coOwner);
  });
  
  it('cannot trade now', async () => {
    const tryToTrade = async () => {
      await contract.sell(pikaId, { from: owner });
    };
    assertThrowsAsync(tryToTrade, /revert/);
  });

  it('cannot use in an offer now', async () => {
    await contract.sell(charId, { from: coOwner });
    const tryToMakeOffer = async () => {
      await contract.makeOffer(charId, [pikaId], { from: owner });
    };
    assertThrowsAsync(tryToMakeOffer, /revert/);
  });

  it('cannot fight now', async () => {
    // todo
  });

  it('cannot be shared again by owner', async () => {
    const tryToShare = async () => {
      await contract.share(pikaId, accounts[3], { from: owner });
    };
    assertThrowsAsync(tryToShare, /revert/);
  });

  it('cannot be shared by co-owner', async () => {
    const tryToShare = async () => {
      await contract.share(pikaId, accounts[3], { from: coOwner });
    };
    assertThrowsAsync(tryToShare, /revert/);
  });

  it('owner should be able to revoke co-ownership', async () => {
    await contract.endSharing(pikaId, { from: owner });

    const pika = await contract.cryptomons(pikaId);
    assert(web3.utils.toBN(pika.coOwner).isZero());
    assert.equal(pika.state, CryptomonState.Idle);

    const coOwned = await contract.getCryptomonIdsByCoOwner(coOwner);
    assert.deepEqual(coOwned, []);
  });
});