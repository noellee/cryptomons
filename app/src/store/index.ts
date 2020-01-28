import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';
import { getWeb3 } from '@/utils';
import Getters from '@/store/getters';
import Actions from '@/store/actions';
import { Cryptomon, CryptomonGame } from '@/game';

Vue.use(Vuex);

interface RootState {
  cryptomons: Record<string, Cryptomon[]>
  web3: Web3 | null
  game: CryptomonGame | null
}

export default new Vuex.Store<RootState>({
  state: {
    cryptomons: {},
    web3: null,
    game: null,
  },
  getters: {
    [Getters.HasFetchedForOwner]: state => (owner: string) => state.cryptomons[owner] !== undefined,
    [Getters.GetCryptomons]: state => (owner: string) => state.cryptomons[owner] ?? [],
    [Getters.IsWeb3Available]: state => () => state.web3 !== null,
    [Getters.DefaultAccount]: state => state.game?.defaultAccount,
  },
  mutations: {
    updateCryptomons: (state, payload: { owner: string, cryptomons: Cryptomon[]}) => {
      state.cryptomons = {
        ...state.cryptomons,
        [payload.owner]: payload.cryptomons,
      };
    },
    loadWeb3: (state, web3: Web3) => {
      state.web3 = web3;
      state.game = new CryptomonGame(web3);
    },
  },
  actions: {
    [Actions.FetchCryptomons]: async ({ state, commit }, owner: string | undefined) => {
      if (!state.game) throw new TypeError();
      const ownerAddr = owner || state.game.defaultAccount;
      const cryptomons = await state.game.getAllCryptomons(ownerAddr);
      commit('updateCryptomons', { owner: ownerAddr, cryptomons });
    },
    [Actions.InitApp]: async ({ getters, commit }) => {
      if (!getters.isWeb3Available()) {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0]; // eslint-disable-line prefer-destructuring
        console.log(`Using account ${web3.eth.defaultAccount}`);
        commit('loadWeb3', web3);
      }
    },
    [Actions.InitStarterCryptomons]: async ({ state }) => {
      if (!state.game) throw new TypeError();
      await state.game.initStarterCryptomons();
    },
  },
  modules: {
  },
});
