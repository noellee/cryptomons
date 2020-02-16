const { CryptomonElement, CryptomonState, assertThrowsAsync, clearBalance } = require('./utils.js');

const CryptomonsGame = artifacts.require('CryptomonsGame');

contract('CryptomonsGame fighting', accounts => {
  let contract, opponentOwner, challengerOwner, opponentId, challengerId;
  const stake = 12345;

  before(async () => {
    contract = await CryptomonsGame.deployed();
    opponentOwner = accounts[0];
    challengerOwner = accounts[1];

    const cost = await contract.starterCryptomonCost();

    const pikaTx = await contract.initStarterCryptomon('pika',
      CryptomonElement.Electricity,
      { from: opponentOwner, value: cost });
    const charTx = await contract.initStarterCryptomon('char',
      CryptomonElement.Fire,
      { from: challengerOwner, value: cost });

    opponentId = pikaTx.logs[0].args.id.toNumber();
    challengerId = charTx.logs[0].args.id.toNumber();
  });

  it('battleground should be empty at first', async () => {
    const battleground = await contract.getBattleground();
    assert.equal(battleground.length, 0);
  });

  it('should be able to get ready to fight', async () => {
    await contract.readyToFight(opponentId, { from: opponentOwner });
    await contract.readyToFight(challengerId, { from: challengerOwner });
    const opponent = await contract.cryptomons(opponentId);
    const challenger = await contract.cryptomons(challengerId);
    assert.equal(opponent.state, CryptomonState.ReadyToFight);
    assert.equal(challenger.state, CryptomonState.ReadyToFight);

    const battleground = (await contract.getBattleground()).map(id => id.toNumber());
    assert(battleground.includes(opponentId));
    assert(battleground.includes(challengerId));
  });

  it('should be able to leave fight', async () => {
    await contract.leaveFight(challengerId, { from: challengerOwner });
    const challenger = await contract.cryptomons(challengerId);
    assert.equal(challenger.state, CryptomonState.Idle);

    const battleground = (await contract.getBattleground()).map(id => id.toNumber());
    assert(!battleground.includes(challengerId));
  });

  it('should not be able to challenge if challenger is not ready to fight', async () => {
    const tryToChallenge = async () => {
      await contract.challenge(opponentId, challengerId, { from: challengerOwner });
    };
    assertThrowsAsync(tryToChallenge);
  });

  it('should not be able to challenge your own cryptomons', async () => {
    const tryToChallenge = async () => {
      await contract.challenge(opponentId, challengerId, { from: opponentOwner });
    };
    assertThrowsAsync(tryToChallenge);
  });

  describe('challenge interaction', async () => {
    before(async () => {
      await contract.readyToFight(challengerId, { from: challengerOwner });
    });

    beforeEach('should be able to challenge if challenger is ready to fight', async () => {
      await contract.challenge(opponentId, challengerId, { from: challengerOwner, value: stake });

      const opponent = await contract.cryptomons(opponentId);
      const challenger = await contract.cryptomons(challengerId);
      const challenge = await contract.challenges(opponentId);

      assert.equal(opponent.state, CryptomonState.InAChallenge);
      assert.equal(challenger.state, CryptomonState.InAChallenge);

      assert.equal(challenge.challengerId.toNumber(), challenger.id.toNumber());
      assert.equal(challenge.stake, stake);
    });

    it('opponent should be able to reject challenge', async () => {
      await contract.rejectChallenge(opponentId, { from: opponentOwner });

      const opponent = await contract.cryptomons(opponentId);
      const challenger = await contract.cryptomons(challengerId);
      assert.equal(opponent.state, CryptomonState.ReadyToFight);
      assert.equal(challenger.state, CryptomonState.ReadyToFight);

      // refund
      const challengerBalance = await contract.getBalance({ from: challengerOwner });
      assert.equal(challengerBalance.toNumber(), stake);
    });

    it('challenger should be able to withdraw challenge', async () => {
      await contract.withdrawChallenge(opponentId, { from: challengerOwner });

      const opponent = await contract.cryptomons(opponentId);
      const challenger = await contract.cryptomons(challengerId);
      assert.equal(opponent.state, CryptomonState.ReadyToFight);
      assert.equal(challenger.state, CryptomonState.ReadyToFight);

      // refund
      const challengerBalance = await contract.getBalance({ from: challengerOwner });
      assert.equal(challengerBalance.toNumber(), stake);
    });

    it('opponent should be able to accept challenge', async () => {
      const tx = await contract.acceptChallenge(opponentId, { from: opponentOwner, value: stake });
      const { winnerId, winnerOwner } = tx.logs[0].args;

      if (winnerId === opponentId)
        assert.equal(winnerOwner, opponentOwner);
      if (winnerId === challengerId)
        assert.equal(winnerOwner, challengerOwner);
      
      const winnerBalance = await contract.getBalance({ from: winnerOwner });
      assert.equal(winnerBalance.toNumber(), stake * 2);

      const opponent = await contract.cryptomons(opponentId);
      const challenger = await contract.cryptomons(challengerId);
      assert.equal(opponent.state, CryptomonState.Idle);
      assert.equal(challenger.state, CryptomonState.Idle);

      const battleground = (await contract.getBattleground()).map(id => id.toNumber());
      assert(!battleground.includes(opponentId));
      assert(!battleground.includes(challengerId));
    });

    afterEach('clear balance', async () => {
      await Promise.all([
        clearBalance(contract, opponentOwner),
        clearBalance(contract, challengerOwner),
      ]);
    });
  });
});