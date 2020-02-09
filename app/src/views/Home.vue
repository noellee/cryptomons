<template>
  <div class="home">
    <div v-if="isReady">
      <StarterCryptomonForm v-if="isNewUser" />
      <div v-else>
        <h2>My Cryptomons</h2>
        <CryptomonList :cryptomons="ownedCryptomons" />
        <h2>My co-owned Cryptomons</h2>
        <CryptomonList :cryptomons="coOwnedCryptomons" />
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
import StarterCryptomonForm from '@/components/StarterCryptomonForm.vue';

@Component({
  components: { StarterCryptomonForm, CryptomonList },
})
export default class Home extends Vue {
  async created() {
    if (!this.isReady) {
      this.$store.dispatch(Actions.FetchOwnerStatus);
      this.$store.dispatch(Actions.FetchCryptomonsByOwner);
      this.$store.dispatch(Actions.FetchCryptomonsByCoOwner);
    }
  }

  get isReady() {
    return this.$store.getters[Getters.HasFetchedForOwner](this.account);
  }

  get account() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  get ownedCryptomons() {
    return this.$store.getters[Getters.GetCryptomonsByOwner](this.account);
  }

  get coOwnedCryptomons() {
    return this.$store.getters[Getters.GetCryptomonsByCoOwner](this.account);
  }

  get isNewUser() {
    return !this.$store.getters[Getters.IsOwnerInitialized] && this.ownedCryptomons.length === 0;
  }
}
</script>
