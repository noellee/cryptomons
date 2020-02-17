import Vue from 'vue';
import Vuex, { ActionHandler } from 'vuex';
import Web3 from 'web3';
import _ from 'lodash';
import { getWeb3 } from '@/utils';
import Getters from '@/store/getters';
import Actions from '@/store/actions';
import { Cryptomon, CryptomonElement, CryptomonGame, Offer } from '@/game';
import Challenge from '@/game/Challenge';

Vue.use(Vuex);

interface RootState {
  isLoading: boolean
  ownerIsInitialized: boolean
  cryptomons: Record<string, Cryptomon>
  fetchedOwners: string[]
  hasFetchedMarketplace: boolean,
  hasFetchedBattleground: boolean,
  web3: Web3 | null
  game: CryptomonGame | null
}

type Updater = (cryptomon: Cryptomon) => void;

// set state to loading during the span of the action
function useLoader(action: ActionHandler<RootState, RootState>)
  : ActionHandler<RootState, RootState> {
  return async (injectee, payload) => {
    injectee.commit('updateIsLoading', true);
    try {
      // @ts-ignore
      await action.call(this, injectee, payload);
    } catch (e) {
      throw e;
    } finally {
      injectee.commit('updateIsLoading', false);
    }
  };
}

export default new Vuex.Store<RootState>({
  state: {
    isLoading: false,
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
    [Getters.GetCryptomonById]: state => (id: string) => state.cryptomons[id],
    [Getters.GetCryptomonsByOwner]: state => (owner: string) => (
      _.filter(state.cryptomons, c => c.owner === owner)
    ),
    [Getters.GetCryptomonsByCoOwner]: state => (coOwner: string) => (
      _.filter(state.cryptomons, c => c.coOwner === coOwner)
    ),
    [Getters.GetChallengeByChallengerId]: state => (id: string) => (
      _(state.cryptomons)
        .map(c => c.challenge).filter().find(c => (c as Challenge).challengerId === id)
    ),
    [Getters.MarketplaceCryptomons]: state => _.values(state.cryptomons).filter(c => c.isOnSale),
    [Getters.BattlegroundCryptomons]: state => (
      _.values(state.cryptomons).filter(c => c.isReadyToFight || c.isInAChallenge)
    ),
    [Getters.IsWeb3Available]: state => state.web3 !== null,
    [Getters.IsOwnerInitialized]: state => state.ownerIsInitialized,
    [Getters.IsLoading]: state => state.isLoading,
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
    updateCryptomon: (state, payload: { id: string, updater: Updater }) => {
      const cryptomon = state.cryptomons[payload.id];
      if (cryptomon === undefined) return;
      payload.updater(cryptomon);
      state.cryptomons = {
        ...state.cryptomons,
      };
    },
    loadWeb3: (state, web3: Web3) => {
      state.web3 = web3;
      state.game = new CryptomonGame(web3);
    },
    updateIsLoading: (state, isLoading: boolean) => {
      state.isLoading = isLoading;
    },
  },
  actions: {
    [Actions.InitApp]: async ({ getters, commit }) => {
      if (!getters.isWeb3Available) {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0]; // eslint-disable-line prefer-destructuring
        console.log(`Using account ${web3.eth.defaultAccount}`);
        commit('loadWeb3', web3);
      }
    },
    [Actions.InitStarterCryptomon]: useLoader(async ({ state, commit, dispatch },
      payload: { name: string, element: CryptomonElement }) => {
      if (!state.game) throw new TypeError();
      await state.game.initStarterCryptomon(payload.name, payload.element);
      commit('updateOwnerStatus', true);
      dispatch(Actions.FetchCryptomonsByOwner);
    }),

    // ///////////////////////////
    // Fetching stuff
    // ///////////////////////////

    [Actions.FetchOwnerStatus]: async ({ state, commit }) => {
      if (!state.game) throw new TypeError();
      const isInitialized = await state.game.isOwnerInitialized();
      commit('updateOwnerStatus', isInitialized);
    },
    [Actions.FetchCryptomonsByIds]: async ({ state, commit }, ids: string[]) => {
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
      const cryptomons = await state.game.getMarketplaceCryptomons();
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

    [Actions.SellCryptomon]: useLoader(async ({ state, commit }, payload: { id: string }) => {
      if (!state.game) throw new TypeError();
      await state.game.sellCryptomon(payload.id);
      const updater: Updater = (cryptomon) => { cryptomon.isOnSale = true; };
      commit('updateCryptomon', { id: payload.id, updater });
    }),
    [Actions.TakeOffMarket]: useLoader(async ({ state, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.takeOffMarket(id);
      const updater: Updater = (cryptomon) => { cryptomon.isOnSale = false; };
      commit('updateCryptomon', { id, updater });
    }),
    [Actions.MakeOffer]: useLoader(async ({ state, commit }, offer: Offer) => {
      if (!state.game) throw new TypeError();
      await state.game.makeOffer(offer);
      commit('updateOffer', { id: offer.cryptomonId, offer });
      const updater: Updater = (cryptomon) => { cryptomon.isInAnOffer = true; };
      offer.offeredCryptomons.forEach((offered) => {
        commit('updateCryptomon', { id: offered, updater });
      });
    }),
    [Actions.AcceptOffer]: useLoader(async ({ state, commit, dispatch }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.acceptOffer(id);

      const sellerCryptomon = state.cryptomons[id];
      const { offer } = sellerCryptomon;
      if (!offer) throw new TypeError();

      await dispatch(Actions.FetchCryptomonsByIds, [id, ...offer.offeredCryptomons]);
    }),
    [Actions.RejectOffer]: useLoader(async ({ state, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.rejectOffer(id);

      const sellerCryptomon = state.cryptomons[id];
      const { offer } = sellerCryptomon;
      if (!offer) throw new TypeError();

      commit('updateOffer', { id, offer: null });
      const updater: Updater = (cryptomon) => { cryptomon.isInAnOffer = false; };
      offer.offeredCryptomons.forEach((offered) => {
        commit('updateCryptomon', { id: offered, updater });
      });
    }),
    [Actions.WithdrawOffer]: useLoader(async ({ state, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.withdrawOffer(id);

      const sellerCryptomon = state.cryptomons[id];
      const { offer } = sellerCryptomon;
      if (!offer) throw new TypeError();

      commit('updateOffer', { id, offer: null });
      const updater: Updater = (cryptomon) => { cryptomon.isInAnOffer = false; };
      offer.offeredCryptomons.forEach((offered) => {
        commit('updateCryptomon', { id: offered, updater });
      });
    }),

    // ///////////////////////////
    // Breeding
    // ///////////////////////////

    [Actions.Breed]: useLoader(async ({ state, dispatch },
      payload: { parent1: string, parent2: string, name: string}) => {
      if (!state.game) throw new TypeError();
      await state.game.breed(payload.parent1, payload.parent2, payload.name);
      await dispatch(Actions.FetchCryptomonsByOwner);
    }),

    // ///////////////////////////
    // Sharing
    // ///////////////////////////

    [Actions.Share]: useLoader(async ({ state, dispatch },
      payload: { id: string, coOwner: string }) => {
      if (!state.game) throw new TypeError();
      await state.game.share(payload.id, payload.coOwner);
      await dispatch(Actions.FetchCryptomonsByOwner);
    }),
    [Actions.EndSharing]: useLoader(async ({ state, dispatch }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.endSharing(id);
      await dispatch(Actions.FetchCryptomonsByOwner);
    }),

    // ///////////////////////////
    // Fighting
    // ///////////////////////////

    [Actions.ReadyToFight]: useLoader(async ({ state, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.readyToFight(id);
      const updater: Updater = (cryptomon) => { cryptomon.isReadyToFight = true; };
      commit('updateCryptomon', { id, updater });
    }),
    [Actions.LeaveFight]: useLoader(async ({ state, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.leaveFight(id);
      const updater: Updater = (cryptomon) => { cryptomon.isReadyToFight = false; };
      commit('updateCryptomon', { id, updater });
    }),
    [Actions.Challenge]: useLoader(async ({ state, dispatch },
      payload: { opponentId: string, challengerId: string, stake: number }) => {
      if (!state.game) throw new TypeError();
      await state.game.challenge(payload.opponentId, payload.challengerId, payload.stake);
      await dispatch(Actions.FetchCryptomonsByIds, [payload.opponentId, payload.challengerId]);
    }),
    [Actions.AcceptChallenge]: useLoader(async ({ state, getters, commit },
      payload: { id: string, stake: string }) => {
      if (!state.game) throw new TypeError();
      await state.game.acceptChallenge(payload.id, payload.stake);
      const opponent: Cryptomon = getters[Getters.GetCryptomonById](payload.id);
      const challengerId = opponent.challenge?.challengerId;
      const updater: Updater = (cryptomon) => {
        cryptomon.isReadyToFight = false;
        cryptomon.challenge = null;
      };
      commit('updateCryptomon', { id: opponent.id, updater });
      commit('updateCryptomon', { id: challengerId, updater });
    }),
    [Actions.RejectChallenge]: useLoader(async ({ state, getters, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.rejectChallenge(id);
      const opponent: Cryptomon = getters[Getters.GetCryptomonById](id);
      const challengerId = opponent.challenge?.challengerId;
      const updater: Updater = (cryptomon) => {
        cryptomon.isReadyToFight = true;
        cryptomon.challenge = null;
      };
      commit('updateCryptomon', { id, updater });
      commit('updateCryptomon', { id: challengerId, updater });
    }),
    [Actions.WithdrawChallenge]: useLoader(async ({ state, getters, commit }, id: string) => {
      if (!state.game) throw new TypeError();
      await state.game.withdrawChallenge(id);
      const opponent: Cryptomon = getters[Getters.GetCryptomonById](id);
      const challengerId = opponent.challenge?.challengerId;
      const updater: Updater = (cryptomon) => {
        cryptomon.isReadyToFight = true;
        cryptomon.challenge = null;
      };
      commit('updateCryptomon', { id, updater });
      commit('updateCryptomon', { id: challengerId, updater });
    }),
  },
});
