<template>
  <div class="cryptomon-card">
    <h2>{{ cryptomon.name }}</h2>
    <img :src="image" :alt="cryptomon.primaryElementAsString" width="240px" />
    <ul>
      <li><span>Element:</span>{{ element }}</li>
      <li><span>Health:</span>{{ cryptomon.health }}</li>
      <li><span>Strength:</span>{{ cryptomon.strength }}</li>
    </ul>
    <CryptomonActions v-if="!simple" :cryptomon="cryptomon" />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { Cryptomon } from '@/game';
import CryptomonActions from '@/components/CryptomonActions.vue';
@Component({
  components: {
    CryptomonActions,
  },
})
export default class CryptomonCard extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  @Prop({ default: false }) readonly simple!: boolean;

  public get element() {
    const primaryElement = this.cryptomon.primaryElementAsString;
    const secondaryElement = this.cryptomon.secondaryElementAsString;
    if (primaryElement === secondaryElement) return primaryElement;
    return `${primaryElement} + ${secondaryElement}`;
  }

  public get image() {
    const primaryElement = this.cryptomon.primaryElementAsString.toLowerCase();
    const secondaryElement = this.cryptomon.secondaryElementAsString.toLowerCase();
    // eslint-disable-next-line import/no-dynamic-require,global-require
    return require(`@/assets/cryptomon-${primaryElement}-${secondaryElement}.png`);
  }
}
</script>

<style>
  .cryptomon-card {
    background: #f2f2f2;
    border-radius: 8px;
    display: inline-block;
    margin: 10px;
    padding: 10px;
    box-shadow: rgba(0,0,0,0.3) 2px 2px 6px;
    color: #2c3e50;
  }

  .cryptomon-card > h2 {
    margin-block-start: 0.4em;
    margin-block-end: 0.4em;
    text-align: center;
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
