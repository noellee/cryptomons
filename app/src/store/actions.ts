enum Actions {
  InitApp = 'initApp',
  InitStarterCryptomon = 'initStarterCryptomon',

  // Make fetch happen
  FetchOwnerStatus = 'fetchOwnerStatus',
  FetchCryptomonsByIds = 'fetchCryptomonsByIds',
  FetchCryptomonsByOwner = 'fetchCryptomonsByOwner',
  FetchCryptomonsByCoOwner = 'fetchCryptomonsByCoOwner',
  FetchMarketplaceCryptomons = 'fetchMarketplaceCryptomons',
  FetchBattlegroundCryptomons = 'fetchBattlegroundCryptomons',

  // Trading
  SellCryptomon = 'sellCryptomon',
  TakeOffMarket = 'takeOffMarket',
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
  Challenge = 'challenge',
  AcceptChallenge = 'acceptChallenge',
  RejectChallenge = 'rejectChallenge',
  WithdrawChallenge = 'withdrawChallenge',
}

export default Actions;
