<template>
  <div class="home">
    <div v-if="isReady">
      <div v-if="isNewUser">
        <p>Looks like you're new here!</p>
        <button v-on:click="initStarterCryptomons()">Get my starter Cryptomons</button>
      </div>
      <div v-else>
        <CryptomonList :cryptomons="allMyCryptomons" />
      </div>
    </div>
    <h4 v-else>Loading...</h4>
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
  created() {
    if (!this.isReady) {
      this.$store.dispatch(Actions.FetchCryptomons);
    }
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
    return this.allMyCryptomons.length === 0;
  }

  async initStarterCryptomons() {
    await this.$store.dispatch(Actions.InitStarterCryptomons);
    await this.$store.dispatch(Actions.FetchCryptomons);
  }
}
</script>
