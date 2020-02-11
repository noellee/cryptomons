import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';
import { getWeb3 } from '@/utils';
import Getters from '@/store/getters';
import Actions from '@/store/actions';
import { Cryptomon, CryptomonElement, CryptomonGame, Offer } from '@/game';

Vue.use(Vuex);

interface RootState {
  ownerIsInitialized: boolean
  cryptomons: Record<number, Cryptomon>
  fetchedOwners: string[]
  hasFetchedMarketplace: boolean,
  hasFetchedBattleground: boolean,
  web3: Web3 | null
  game: CryptomonGame | null
}

type Updater = (cryptomon: Cryptomon) => void;

export default new Vuex.Store<RootState>({
  state: {
    ownerIsInitialized: false,
    cryptomons: {},
    fetchedOwners: [],
    hasFetchedMarketplace: false,
    hasFetchedBattleground: false,
    web3: null,
    game: null,
  },
  getters: {
    [Getters.HasFetchedForOwner]: state => (owner: string) => state.fetchedOwners.includes(owner),
    [Getters.HasFetchedMarketplace]: state => state.hasFetchedMarketplace,
    [Getters.HasFetchedBattleground]: state => state.hasFetchedBattleground,
    [Getters.GetCryptomonById]: state => (id: number) => state.cryptomons[id],
    [Getters.GetCryptomonsByOwner]: state => (owner: string) => (
      _.filter(state.cryptomons, c => c.owner === owner)
    ),
    [Getters.GetCryptomonsByCoOwner]: state => (coOwner: string) => (
      _.filter(state.cryptomons, c => c.coOwner === coOwner)
    ),
    [Getters.MarketplaceCryptomons]: state => _.values(state.cryptomons).filter(c => c.isOnSale),
    [Getters.BattlegroundCryptomons]: state => (
      _.values(state.cryptomons).filter(c => c.isReadyToFight || c.isInAChallenge)
    ),
    [Getters.IsWeb3Available]: state => () => state.web3 !== null,
    [Getters.IsOwnerInitialized]: state => state.ownerIsInitialized,
    [Getters.DefaultAccount]: state => state.game?.defaultAccount,
  },
  mutations: {
    updateOwnerStatus: (state, isInitialized: boolean) => {
      state.ownerIsInitialized = isInitialized;
    },
    updateHasFetchedMarketplace: (state, hasFetched: boolean) => {
      state.hasFetchedMarketplace = hasFetched;
    },
    updateHasFetchedBattleground: (state, hasFetched: boolean) => {
      state.hasFetchedBattleground = hasFetched;
    },
    addFetchedOwner: (state, payload: { owner: string }) => {
      state.fetchedOwners.push(payload.owner);
    },
    updateOffer: ((state, payload: { id: number, offer: Offer | null }) => {
      state.cryptomons[payload.id].offer = payload.offer;
    }),
    updateCryptomons: (state, payload: { cryptomons: Cryptomon[] }) => {
      state.cryptomons = {
        ...state.cryptomons,
        ..._.keyBy(payload.cryptomons, c => c.id),
      };
    },
    updateCryptomon: (state, payload: { id: number, updater: Updater}) => {
      const cryptomon = state.cryptomons[payload.id];
      if (cryptomon === undefined) throw new TypeError();
      payload.updater(cryptomon);
      state.cryptomons = {
        ...state.cryptomons,
      };
    },
    loadWeb3: (state, web3: Web3) => {
      state.web3 = web3;
      state.game = new CryptomonGame(web3);
    },
  },
  actions: {
    [Actions.InitApp]: async ({ getters, commit }) => {
      if (!getters.isWeb3Available()) {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0]; // eslint-disable-line prefer-destructuring
        console.log(`Using account ${web3.eth.defaultAccount}`);
        commit('loadWeb3', web3);
      }
    },
    [Actions.InitStarterCryptomon]: async ({ state, commit },
      payload: { name: string, element: CryptomonElement }) => {
      if (!state.game) throw new TypeError();
      await state.game.initStarterCryptomon(payload.name, payload.element);
      commit('updateOwnerStatus', true);
    },

    // ///////////////////////////
    // Fetching stuff
    // ///////////////////////////

    [Actions.FetchOwnerStatus]: async ({ state, commit }) => {
      if (!state.game) throw new TypeError();
      const isInitialized = await state.game.isOwnerInitialized();
      commit('updateOwnerStatus', isInitialized);
    },
    [Actions.FetchCryptomonsById]: async ({ state, commit }, ids: number[]) => {
      if (!state.game) throw new TypeError();
      const cryptomons = await state.game.getCryptomonsByIds(ids);
      commit('updateCryptomons', { cryptomons });
    },
    [Actions.FetchCryptomonsByOwner]: async ({ state, commit }, owner: string | undefined) => {
      if (!state.game) throw new TypeError();
      const ownerAddr = owner || state.game.defaultAccount;
      const cryptomons = await state.game.getCryptomonsByOwner(ownerAddr);
      commit('updateCryptomons', { cryptomons });
      commit('addFetchedOwner', { owner: ownerAddr });
    },
    [Actions.FetchCryptomonsByCoOwner]: async ({ state, commit }, coOwner: string | undefined) => {
      if (!state.game) throw new TypeError();
      const coOwnerAddr = coOwner || state.game.defaultAccount;
      const cryptomons = await state.game.getCryptomonsByCoOwner(coOwnerAddr);
      commit('updateCryptomons', { cryptomons });
    },
    [Actions.FetchMarketplaceCryptomons]: async ({ state, commit }) => {
      if (!state.game) throw new TypeError();
      const cryptomons = await state.game.getMarketplaceCryptomons(20);
      commit('updateCryptomons', { cryptomons });
      commit('updateHasFetchedMarketplace', true);
    },
    [Actions.FetchBattlegroundCryptomons]: async ({ state, commit }) => {
      if (!state.game) throw new TypeError();
      const cryptomons = await state.game.getBattlegroundCryptomons();
      commit('updateCryptomons', { cryptomons });
      commit('updateHasFetchedBattleground', true);
    },

    // ///////////////////////////
    // Trading
    // ///////////////////////////

    [Actions.SellCryptomon]: async ({ state, commit }, payload: { id: number }) => {
      if (!state.game) throw new TypeError();
      await state.game.sellCryptomon(payload.id);
      const updater: Updater = (cryptomon) => { cryptomon.isOnSale = true; };
      commit('updateCryptomon', { id: payload.id, updater });
    },
    [Actions.MakeOffer]: async ({ state, commit }, offer: Offer) => {
      if (!state.game) throw new TypeError();
      await state.game.makeOffer(offer);
      commit('updateOffer', { id: offer.cryptomonId, offer });
    },
    [Actions.AcceptOffer]: async ({ state, commit, dispatch }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.acceptOffer(id);

      const sellerCryptomon = state.cryptomons[id];
      const { offer } = sellerCryptomon;
      if (!offer) throw new TypeError();

      dispatch(Actions.FetchCryptomonsById, [id, ...offer.offeredCryptomons]);
    },
    [Actions.RejectOffer]: async ({ state, commit }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.rejectOffer(id);
      commit('updateOffer', { id, offer: null });
    },
    [Actions.WithdrawOffer]: async ({ state, commit }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.withdrawOffer(id);
      commit('updateOffer', { id, offer: null });
    },

    // ///////////////////////////
    // Breeding
    // ///////////////////////////

    [Actions.Breed]: async ({ state, dispatch },
      payload: { parent1: number, parent2: number, name: string}) => {
      if (!state.game) throw new TypeError();
      await state.game.breed(payload.parent1, payload.parent2, payload.name);
      dispatch(Actions.FetchCryptomonsByOwner);
    },

    // ///////////////////////////
    // Sharing
    // ///////////////////////////

    [Actions.Share]: async ({ state, dispatch },
      payload: { id: number, coOwner: string }) => {
      if (!state.game) throw new TypeError();
      await state.game.share(payload.id, payload.coOwner);
      dispatch(Actions.FetchCryptomonsByOwner);
    },
    [Actions.EndSharing]: async ({ state, dispatch }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.endSharing(id);
      dispatch(Actions.FetchCryptomonsByOwner);
    },

    // ///////////////////////////
    // Fighting
    // ///////////////////////////

    [Actions.ReadyToFight]: async ({ state, commit }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.readyToFight(id);
      const updater: Updater = (cryptomon) => { cryptomon.isReadyToFight = true; };
      commit('updateCryptomon', { id, updater });
    },
    [Actions.LeaveFight]: async ({ state, commit }, id: number) => {
      if (!state.game) throw new TypeError();
      await state.game.leaveFight(id);
      const updater: Updater = (cryptomon) => { cryptomon.isReadyToFight = false; };
      commit('updateCryptomon', { id, updater });
    },
    [Actions.Challenge]: async ({ state, commit },
      payload: { opponentId: number, challengerId: number, stake: number }) => {
      if (!state.game) throw new TypeError();
      await state.game.challenge(payload.opponentId, payload.challengerId, payload.stake);
      const updater: Updater = (cryptomon) => { cryptomon.isInAChallenge = false; };
      commit('updateCryptomon', { id: payload.opponentId, updater });
      commit('updateCryptomon', { id: payload.challengerId, updater });
    },
  },
});
