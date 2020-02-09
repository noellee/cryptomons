enum Actions {
  InitApp = 'initApp',
  InitStarterCryptomon = 'initStarterCryptomon',

  // Make fetch happen
  FetchOwnerStatus = 'fetchOwnerStatus',
  FetchCryptomonsById = 'fetchCryptomonsById',
  FetchCryptomonsByOwner = 'fetchCryptomonsByOwner',
  FetchCryptomonsByCoOwner = 'fetchCryptomonsByCoOwner',
  FetchMarketplaceCryptomons = 'fetchMarketplaceCryptomons',

  // Trading
  SellCryptomon = 'sellCryptomon',
  MakeOffer = 'makeOffer',
  AcceptOffer = 'acceptOffer',
  RejectOffer = 'rejectOffer',
  WithdrawOffer = 'withdrawOffer',

  // Breed
  Breed = 'breed',

  // Sharing
  Share = 'share',
  EndSharing = 'endSharing',
}

export default Actions;
