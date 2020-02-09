<template>
  <div id="app">
    <AccountBalance v-if="isReady()" />
    <h1>
      Cryptomons!
      <i class="tiny">Gotta catch'em all</i>
    </h1>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/marketplace">Marketplace</router-link>
    </div>
    <router-view v-if="isReady()"/>
    <h3 v-else>Loading...</h3>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Actions from '@/store/actions';
import Getters from '@/store/getters';
import AccountBalance from '@/components/AccountBalance.vue';

@Component({
  components: { AccountBalance },
})
export default class HelloWorld extends Vue {
  beforeCreate() {
    this.$store.dispatch(Actions.InitApp);
  }

  isReady() {
    return this.$store.getters[Getters.IsWeb3Available]();
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

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #c1c1c1;
}

#nav a.router-link-exact-active {
  color: #42b983;
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
