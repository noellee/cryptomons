<template>
  <div class="home">
    <div v-if="isReady">
      <div v-if="isNewUser">
        <h3>Looks like you're new here!</h3>
        <button v-on:click="initStarterCryptomon()">
          Get my starter Cryptomon ({{starterCost}} ETH)
        </button>
      </div>
      <div v-else>
        <CryptomonList :cryptomons="allMyCryptomons" />
      </div>
    </div>
    <h3 v-else>Loading...</h3>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Actions from '@/store/actions';
import Getters from '@/store/getters';
import CryptomonList from '@/components/CryptomonList.vue';
@Component({
  components: { CryptomonList },
})
export default class Home extends Vue {
  starterCost: number | null;

  constructor() {
    super();
    this.starterCost = null;
  }

  async created() {
    if (!this.isReady) {
      this.$store.dispatch(Actions.FetchOwnerStatus);
      this.$store.dispatch(Actions.FetchCryptomons);
    }
    const cost = await this.$store.state.game.getStarterCryptomonCost();
    this.starterCost = this.$store.state.web3.utils.fromWei(cost);
  }

  get isReady() {
    return this.$store.getters[Getters.HasFetchedForOwner](this.account);
  }

  get account() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  get allMyCryptomons() {
    return this.$store.getters[Getters.GetCryptomons](this.account);
  }

  get isNewUser() {
    return !this.$store.getters[Getters.OwnerIsInitialized];
  }

  async initStarterCryptomon() {
    await this.$store.dispatch(Actions.InitStarterCryptomon);
    await this.$store.dispatch(Actions.FetchCryptomons);
  }
}
</script>
