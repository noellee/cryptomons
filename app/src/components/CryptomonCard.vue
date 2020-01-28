<template>
  <div class="cryptomon-card">
    <img :src="image" :alt="cryptomon.elementAsString" width="240px" />
    <ul>
      <li><span>Element:</span>{{ cryptomon.elementAsString }}</li>
      <li><span>Health:</span>{{ cryptomon.health }}</li>
      <li><span>Strength:</span>{{ cryptomon.strength }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
/* eslint-disable global-require */

import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { Cryptomon } from '@/game';

@Component
export default class CryptomonList extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  public get image() {
    switch (+this.cryptomon.element) {
      case Cryptomon.Element.Fire:
        return require('@/assets/cryptomon-fire.png');
      case Cryptomon.Element.Water:
        return require('@/assets/cryptomon-water.png');
      case Cryptomon.Element.Earth:
        return require('@/assets/cryptomon-earth.png');
      case Cryptomon.Element.Electricity:
        return require('@/assets/cryptomon-electricity.png');
      case Cryptomon.Element.Air:
        return require('@/assets/cryptomon-air.png');
      default:
        throw new TypeError('Unknown element');
    }
  }
}
</script>

<style scoped>
  .cryptomon-card {
    background: #f2f2f2;
    border-radius: 8px;
    display: inline-block;
    margin: 10px;
    padding: 10px;
    box-shadow: #000000 2px 2px 4px;
    color: #2c3e50;
  }

  .cryptomon-card > img {
    display: block;
  }

  .cryptomon-card > ul {
    list-style: none;
    margin: 8px 8px 0 8px;
    padding: 0;
    text-align: left;
  }

  .cryptomon-card > ul > li > span {
    font-weight: bold;
    width: 40%;
    display: inline-block;
  }
</style>
