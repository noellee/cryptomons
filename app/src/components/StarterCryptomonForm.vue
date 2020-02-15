<template>
  <div>
    <h2>Looks like you're new here!</h2>
    <form v-on:submit.prevent v-on:submit="initStarterCryptomon()">
      <label>
        <span>Give your new Cryptomon a name</span>
        <input type="text" v-model="name" placeholder="Name">
      </label>
      <span>Select the type:</span>
      <label class="radio-label" v-for="[i, elem] in allElements" v-bind:key="i">
        <input type="radio" v-model="element" v-bind:value="i" />
        {{ elem }}
      </label>
      <button type="submit">
        Get my starter Cryptomon ({{starterCost}} ETH)
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Actions from '@/store/actions';
import { CryptomonElement } from '@/game';

@Component
export default class StarterCryptomonForm extends Vue {
  name: string = '';

  element: CryptomonElement | null;

  starterCost: number | null;

  constructor() {
    super();
    this.starterCost = null;
    this.element = null;
  }

  // eslint-disable-next-line class-methods-use-this
  get allElements() {
    return Object.values(CryptomonElement)
      .filter(val => typeof val === 'string')
      .map((elem, i) => [i, elem]);
  }

  async created() {
    const cost = await this.$store.state.game.getStarterCryptomonCost();
    this.starterCost = this.$store.state.web3.utils.fromWei(cost);
  }

  async initStarterCryptomon() {
    const payload = {
      name: this.name,
      element: this.element,
    };
    await this.$store.dispatch(Actions.InitStarterCryptomon, payload);
  }
}
</script>

<style scoped>
form {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  font-size: larger;
}

form > * {
  display: block;
}

form label > span {
  display: block;
  margin: 0 auto;
}

form label {
  margin-bottom: 12px;
}

form input[type=text] {
  width: 100%;
}

form span {
  margin-bottom: 6px !important;
}

.radio-label {
  font-weight: bolder;
  font-size: medium;
  display: flex;
  background: #f2f2f2;
  border-radius: 4px;
  color: #14191f;
  align-items: center;
  cursor: pointer;
}

.radio-label input[type=radio] {
  margin: 12px;
}

.radio-label:hover {
  background: #42b983;
  color: #f2f2f2;
}

form button[type=submit] {
  margin: 16px auto;
}
</style>
