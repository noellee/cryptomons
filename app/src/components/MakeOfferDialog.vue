<template>
  <Dialog
    title="Make offer"
    v-on:cancel="$emit('cancel-offer')"
  >
    <form v-on:submit="makeOffer()" v-on:submit.prevent>
      <label class="price-input">
        I am willing to pay:
        <input type="number" step=".00000000000001" v-model="price"/>
        <b>ETH</b>
      </label>
      <p>I am willing to sacrifice:</p>
      <label class="checkbox-label" v-for="cryptomon in myIdleCryptomons" v-bind:key="cryptomon.id">
        <input type="checkbox" v-model="selectedCryptomons" v-bind:value="cryptomon.id" />
        <span>
          <b>{{ cryptomon.name }}</b>
          [{{ cryptomon.elementAsString }}]
          [Health: {{ cryptomon.health }}]
          [Strength: {{ cryptomon.strength}}]
        </span>
      </label>
      <div class="button-group">
        <button type="submit">Make offer!</button>
        <button class="bg-red" v-on:click="$emit('cancel-offer')">Cancel</button>
      </div>
    </form>
  </Dialog>
</template>
<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import Dialog from '@/components/Dialog.vue';
import { Cryptomon, Offer } from '@/game';
import Actions from '@/store/actions';
import Getters from '@/store/getters';

@Component({
  components: { Dialog },
})
export default class MakeOfferDialog extends Vue {
  @Prop(Number) cryptomonId!: number;

  price: number = 1.00000;

  selectedCryptomons: number[] = [];

  public async makeOffer() {
    const defaultAccount = this.$store.getters[Getters.DefaultAccount];
    const priceInWei = this.$store.state.web3.utils.toWei(this.price.toString(), 'ether');
    const offer = new Offer(this.cryptomonId, defaultAccount, priceInWei, this.selectedCryptomons);
    await this.$store.dispatch(Actions.MakeOffer, offer);
    this.$emit('offer-made');
  }

  public get myIdleCryptomons() {
    const defaultAccount = this.$store.getters[Getters.DefaultAccount];
    const getCryptomonsByOwner = this.$store.getters[Getters.GetCryptomonsByOwner];
    const cryptomons: Cryptomon[] = getCryptomonsByOwner(defaultAccount);
    return cryptomons.filter(c => c.isIdle);
  }
}
</script>
<style scoped>
  label.price-input {
    display: flex;
    align-items: center;
  }

  label.price-input > * {
    margin: 0 8px;
  }

  label.price-input > input {
    flex-grow: 1;
  }

  .checkbox-label {
    font-size: medium;
    display: flex;
    background: #f2f2f2;
    border-radius: 4px;
    color: #14191f;
    align-items: center;
    cursor: pointer;
  }

  .checkbox-label input[type=checkbox] {
    margin: 12px;
  }

  .checkbox-label:hover {
    background: #d3d3d3;
    /*color: #f2f2f2;*/
  }
</style>
