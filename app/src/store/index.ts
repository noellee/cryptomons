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
  web3: Web3 | null
  game: CryptomonGame | null
}

export default new Vuex.Store<RootState>({
  state: {
    ownerIsInitialized: false,
    cryptomons: {},
    fetchedOwners: [],
    hasFetchedMarketplace: false,
    web3: null,
    game: null,
  },
  getters: {
    [Getters.HasFetchedForOwner]: state => (owner: string) => state.fetchedOwners.includes(owner),
    [Getters.HasFetchedMarketplace]: state => state.hasFetchedMarketplace,
    [Getters.GetCryptomonById]: state => (id: number) => state.cryptomons[id],
    [Getters.GetCryptomonsByOwner]: state => (owner: string) => (
      _.filter(state.cryptomons, c => c.owner === owner)
    ),
    [Getters.MarketplaceCryptomons]: state => _.values(state.cryptomons).filter(c => c.isOnSale),
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
    addFetchedOwner: (state, payload: { owner: string }) => {
      state.fetchedOwners.push(payload.owner);
    },
    updateOffer: ((state, payload: { id: number, offer: Offer | null }) => {
      state.cryptomons[payload.id].offer = payload.offer;
    }),
    updateCryptomons: (state, payload: { cryptomons: Cryptomon[] }) => {
      console.log(payload.cryptomons);
      state.cryptomons = {
        ...state.cryptomons,
        ..._.keyBy(payload.cryptomons, c => c.id),
      };
    },
    sellCryptomon: (state, payload: { id: number }) => {
      const cryptomon = state.cryptomons[payload.id];
      if (cryptomon === undefined) throw new TypeError();
      cryptomon.isOnSale = true;
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

    // Fetching stuff

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
    [Actions.FetchMarketplaceCryptomons]: async ({ state, commit }) => {
      if (!state.game) throw new TypeError();
      const cryptomons = await state.game.getMarketplaceCryptomons(20);
      commit('updateCryptomons', { cryptomons });
      commit('updateHasFetchedMarketplace', true);
    },

    // Trading

    [Actions.SellCryptomon]: async ({ state, commit }, payload: { id: number }) => {
      if (!state.game) throw new TypeError();
      await state.game.sellCryptomon(payload.id);
      commit('sellCryptomon', { id: payload.id });
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

  },
});
