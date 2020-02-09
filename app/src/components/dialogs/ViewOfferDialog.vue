<template>
  <Dialog
    title="Offer details"
    v-on:cancel="$emit('cancel')"
  >
    <div><b>Price:</b> {{priceInEth}} ETH</div>
    <div><b>Buyer:</b> {{offer.buyer}}</div>
    <div>
      <b>Offered Cryptomons:</b>&nbsp;
      <i v-if="offer.offeredCryptomons.length === 0">None</i>
    </div>
    <CryptomonList v-if="isReady" :simple="true" :cryptomons="offeredCryptomonsAsList" />
    <div class="button-group">
      <button v-on:click="acceptOffer()" v-if="isSeller">Accept</button>
      <button v-on:click="rejectOffer()" v-if="isSeller" class="bg-red">Reject</button>
      <button v-on:click="withdrawOffer()" v-if="isBuyer" class="bg-red">Withdraw</button>
    </div>
  </Dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import Dialog from '@/components/generic/Dialog.vue';
import { Cryptomon, Offer } from '@/game';
import Getters from '@/store/getters';
import Actions from '@/store/actions';
import CryptomonList from '@/components/CryptomonList.vue';

@Component({
  components: { CryptomonList, Dialog },
})
export default class ViewOfferDialog extends Vue {
  @Prop(Offer) offer!: Offer;

  @Prop(String) owner!: string;

  created() {
    if (!this.isReady) {
      this.loadMissingCryptomons();
    }
  }

  public get isReady() {
    return _.every(_.values(this.offeredCryptomons));
  }

  public get offeredCryptomons(): Record<number, Cryptomon | undefined> {
    const getCryptomonById = this.$store.getters[Getters.GetCryptomonById];
    return _(this.offer.offeredCryptomons)
      .map(id => [id, getCryptomonById(_.toNumber(id))])
      .keyBy(([id, val]) => id)
      .mapValues(([id, val]) => val)
      .value();
  }

  public get offeredCryptomonsAsList(): Cryptomon[] {
    return _.values(this.offeredCryptomons) as Cryptomon[];
  }

  public get priceInEth() {
    return this.$store.state.web3.utils.fromWei(this.offer.price, 'ether');
  }

  private async loadMissingCryptomons() {
    const missingIds = _(this.offeredCryptomons)
      .pickBy(val => !val)
      .keys()
      .map(_.toNumber)
      .value();
    await this.$store.dispatch(Actions.FetchCryptomonsById, missingIds);
  }

  public get isSeller() {
    return this.owner === this.$store.getters[Getters.DefaultAccount];
  }

  public get isBuyer() {
    return this.offer.buyer === this.$store.getters[Getters.DefaultAccount];
  }

  public async acceptOffer() {
    await this.$store.dispatch(Actions.AcceptOffer, this.offer.cryptomonId);
    this.$emit('offer-accepted');
  }

  public async rejectOffer() {
    await this.$store.dispatch(Actions.RejectOffer, this.offer.cryptomonId);
    this.$emit('offer-rejected');
  }

  public async withdrawOffer() {
    await this.$store.dispatch(Actions.WithdrawOffer, this.offer.cryptomonId);
    this.$emit('offer-withdrawn');
  }
}
</script>
