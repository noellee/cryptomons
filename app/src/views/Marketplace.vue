<template>
  <div>
    <div v-if="isReady">
      <h2>Browse Marketplace</h2>
      <CryptomonList v-if="marketplaceCryptomons.length" :cryptomons="marketplaceCryptomons" />
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
export default class Marketplace extends Vue {
  async created() {
    if (!this.hasFetchedForOwner) {
      this.$store.dispatch(Actions.FetchCryptomonsByOwner);
    }
    if (!this.hasFetchedMarketplace) {
      this.$store.dispatch(Actions.FetchMarketplaceCryptomons);
    }
  }

  get isReady() {
    return this.hasFetchedForOwner && this.hasFetchedMarketplace;
  }

  get hasFetchedForOwner() {
    return this.$store.getters[Getters.HasFetchedForOwner](this.account);
  }

  get hasFetchedMarketplace() {
    return this.$store.getters[Getters.HasFetchedMarketplace];
  }

  get account() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  get marketplaceCryptomons() {
    const onSaleCryptomons: Cryptomon[] = this.$store.getters[Getters.MarketplaceCryptomons];
    const owner = this.$store.state.game.defaultAccount;
    return onSaleCryptomons.filter(c => c.owner !== owner);
  }
}
</script>
