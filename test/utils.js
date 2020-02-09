module.exports = {
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
  },
  assertThrowsAsync: async (fn, regExp) => {
    let f = () => {};
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
  }
};
