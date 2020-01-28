<template>
  <div class="home">
    <button v-on:click="fetchCryptomons()">fetch</button>
    {{ allCryptomons }}
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class HelloWorld extends Vue {
  fetchCryptomons() {
    this.$store.dispatch('fetchCryptomons');
  }

  get allCryptomons() {
    return this.$store.getters.getAllCryptomons();
  }
}
</script>
