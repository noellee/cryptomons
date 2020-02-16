const self = module.exports = {
  CryptomonElement: {
    Fire: 0,
    Water: 1,
    Earth: 2,
    Electricity: 3,
    Air: 4,
  },
  CryptomonState: {
    Idle: 0,
    OnSale: 1,
    InAnOffer: 2,
    Shared: 3,
    ReadyToFight: 4,
    InAChallenge: 5,
  },
  assertThrowsAsync: async (fn, regExp) => {
    let f = () => {
    };
    try {
      await fn();
    }
    catch (e) {
      f = () => {
        throw e
      };
    } finally {
      assert.throws(f, regExp);
    }
  },
  assertBalanceIncrease: async (makeTx, account, increase) => {
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(account));
    const txResult = await makeTx();
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(account));

    const tx = await web3.eth.getTransaction(txResult.tx);
    const gasPrice = web3.utils.toBN(tx.gasPrice);
    const gasUsed = web3.utils.toBN(txResult.receipt.gasUsed);
    const gas = gasPrice.mul(gasUsed);
    assert.equal(
      balanceAfter.toString(),
      balanceBefore.sub(gas).add(web3.utils.toBN(increase)).toString(),
    );
  },
  clearBalance: async (contract, account) => {
    const balance = await contract.getBalance({ from: account });
    if (!balance.toNumber()) return;
    await self.assertBalanceIncrease(
      async () => await contract.withdrawFunds(balance, { from: account }),
      account, balance,
    );
  },
};
