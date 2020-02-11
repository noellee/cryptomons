enum Actions {
  InitApp = 'initApp',
  InitStarterCryptomon = 'initStarterCryptomon',

  // Make fetch happen
  FetchOwnerStatus = 'fetchOwnerStatus',
  FetchCryptomonsById = 'fetchCryptomonsById',
  FetchCryptomonsByOwner = 'fetchCryptomonsByOwner',
  FetchCryptomonsByCoOwner = 'fetchCryptomonsByCoOwner',
  FetchMarketplaceCryptomons = 'fetchMarketplaceCryptomons',
  FetchBattlegroundCryptomons = 'fetchBattlegroundCryptomons',

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

  // Fighting
  ReadyToFight = 'readyToFight',
  LeaveFight = 'leaveFight',
}

export default Actions;
