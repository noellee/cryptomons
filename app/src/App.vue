<template>
  <div id="app">
    <AccountBalance v-if="isReady" />
    <LoadingOverlay v-if="isLoading">Transaction pending...</LoadingOverlay>
    <header>
      <img :src="require('@/assets/logo.png')" height="200px" id="logo" alt="Cryptomons logo">
      <div id="nav">
        <router-link to="/"><fa-icon icon="home" />Home</router-link>
        <router-link to="/marketplace"><fa-icon icon="store" />Marketplace</router-link>
        <router-link to="/battleground"><fa-icon icon="fist-raised" />Battleground</router-link>
      </div>
    </header>
    <router-view v-if="isReady"/>
    <h3 v-else>Loading...</h3>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Actions from '@/store/actions';
import Getters from '@/store/getters';
import AccountBalance from '@/components/AccountBalance.vue';
import Loader from '@/components/generic/Loader.vue';

@Component({
  components: { LoadingOverlay: Loader, AccountBalance },
})
export default class HelloWorld extends Vue {
  beforeCreate() {
    this.$store.dispatch(Actions.InitApp);
  }

  get isReady() {
    return this.$store.getters[Getters.IsWeb3Available];
  }

  get isLoading() {
    return this.$store.getters[Getters.IsLoading];
  }
}
</script>

<style>
.tiny {
  font-size: 0.5em;
}

body {
  background: #14191f;
}

#app {
  width: 90%;
  margin: 0 auto;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e1e1e1;
}

header {
  display: flex;
  align-items: center;
}

#logo {
}

#nav {
  margin-top: 7em;
}

#nav a {
  font-size: large;
  font-weight: bold;
  color: #f2f2f2;
  padding: 8px 16px;
  margin: 0 12px;
  border-radius: 4px;
  text-decoration: none;
}

#nav a.router-link-exact-active {
  background: #d8ac29;
  color: #f2f2f2;
}

#nav a > svg {
  margin-right: 8px;
}

button {
  background: #42b983;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: medium;
  font-weight: bold;
  color:  white;
  padding: 8px 16px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

button:disabled {
  cursor: default;
  opacity: 0.5;
}

button.secondary {
  background: #808080;
}

button.secondary:not([disabled]):hover {
  background: #919191;
}

button.bg-red {
  background: #c33638;
}

button.bg-red:not([disabled]):hover {
  background: #d73b3d;
}

button:not([disabled]):hover {
  background: #43c891;
}

button:active, button:focus {
  outline: none;
}

input {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  font-size: medium;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  box-sizing: border-box;
  background: #f2f2f2;
}

input:focus {
  outline-color: #42b983;
}
</style>
