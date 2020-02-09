enum Actions {
  InitApp = 'initApp',
  InitStarterCryptomon = 'initStarterCryptomon',

  // Make fetch happen
  FetchOwnerStatus = 'fetchOwnerStatus',
  FetchCryptomonsById = 'fetchCryptomonsById',
  FetchCryptomonsByOwner = 'fetchCryptomonsByOwner',
  FetchMarketplaceCryptomons = 'fetchMarketplaceCryptomons',

  // Trading
  SellCryptomon = 'sellCryptomon',
  MakeOffer = 'makeOffer',
  AcceptOffer = 'acceptOffer',
  RejectOffer = 'rejectOffer',
  WithdrawOffer = 'withdrawOffer',
}

export default Actions;
