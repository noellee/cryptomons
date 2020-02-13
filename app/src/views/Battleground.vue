<template>
  <div>
    <div v-if="isReady">
      <h2>Cryptomons ready to fight</h2>
      <CryptomonList v-if="battlegroundCryptomons.length" :cryptomons="battlegroundCryptomons" />
      <p v-else><i>Nothing to see right now :(</i></p>
    </div>
    <h3 v-else>Loading...</h3>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Actions from '@/store/actions';
import Getters from '@/store/getters';
import CryptomonList from '@/components/CryptomonList.vue';
import { Cryptomon } from '@/game';

  @Component({
    components: { CryptomonList },
  })
export default class Battleground extends Vue {
  async created() {
    if (!this.hasFetchedForOwner) {
      this.$store.dispatch(Actions.FetchCryptomonsByOwner);
    }
    if (!this.hasFetchedBattleground) {
      this.$store.dispatch(Actions.FetchBattlegroundCryptomons);
    }
  }

  get isReady() {
    return this.hasFetchedForOwner && this.hasFetchedBattleground;
  }

  get hasFetchedForOwner() {
    return this.$store.getters[Getters.HasFetchedForOwner](this.account);
  }

  get hasFetchedBattleground() {
    return this.$store.getters[Getters.HasFetchedBattleground];
  }

  get account() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  get battlegroundCryptomons() {
    const readyCryptomons: Cryptomon[] = this.$store.getters[Getters.BattlegroundCryptomons];
    return readyCryptomons; // .filter(c => c.owner !== this.account);
  }
}
</script>
