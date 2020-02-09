<template>
  <div class="cryptomon-card">
    <MakeOfferDialog
      v-if="!simple && isMakeOfferDialogOpened"
      :cryptomon-id="cryptomon.id"
      @offer-made="closeMakeOfferDialog()"
      @cancel-offer="closeMakeOfferDialog()"
    />
    <ViewOfferDialog
      v-if="!simple && isViewOfferDialogOpened"
      :offer="cryptomon.offer"
      :owner="cryptomon.owner"
      @offer-accepted="closeViewOfferDialog()"
      @offer-rejected="closeViewOfferDialog()"
      @offer-withdrawn="closeViewOfferDialog()"
      @cancel="closeViewOfferDialog()"
    />
    <BreedDialog
      v-if="!simple && isBreedOfferDialogOpened"
      :cryptomon="cryptomon"
      @breed="closeBreedDialog"
      @cancel="closeBreedDialog"
    />
    <h2>{{ cryptomon.name }}</h2>
    <img :src="image" :alt="cryptomon.elementAsString" width="240px" />
    <ul>
      <li><span>Element:</span>{{ cryptomon.elementAsString }}</li>
      <li><span>Health:</span>{{ cryptomon.health }}</li>
      <li><span>Strength:</span>{{ cryptomon.strength }}</li>
    </ul>
    <DropdownButtonGroup v-if="!simple && isOwner && cryptomon.isIdle" dropdown-text="More options">
      <IconButton @click="sell()" :icon="['fab', 'ethereum']">Sell</IconButton>
      <IconButton @click="readyForBattle()" icon="fist-raised">Ready for battle</IconButton>
      <IconButton @click="openBreedDialog()" icon="baby">Breed</IconButton>
    </DropdownButtonGroup>
    <div v-else-if="!simple" class="actions">
      <IconButton v-if="canBuy" icon="comments-dollar" @click="openMakeOfferDialog()">
        Make offer
      </IconButton>
      <IconButton v-else-if="cryptomon.offer" icon="eye" @click="openViewOfferDialog()">
        View offer
      </IconButton>
      <button v-else-if="cryptomon.isInAnOffer" disabled class="secondary">Is in an offer</button>
      <button v-else-if="cryptomon.isOnSale" disabled class="secondary">Pending offer</button>
      <button v-else disabled class="secondary">Unavailable</button>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable global-require */

import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { Cryptomon, CryptomonElement } from '@/game';
import Actions from '@/store/actions';
import MakeOfferDialog from '@/components/MakeOfferDialog.vue';
import Getters from '@/store/getters';
import DropdownButtonGroup from '@/components/generic/DropdownButtonGroup.vue';
import IconButton from '@/components/generic/IconButton.vue';
import BreedDialog from '@/components/BreedDialog.vue';
@Component({
  components: {
    BreedDialog,
    IconButton,
    DropdownButtonGroup,
    ViewOfferDialog: () => import('@/components/ViewOfferDialog.vue'),
    MakeOfferDialog,
  },
})
export default class CryptomonCard extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  @Prop({ default: false }) readonly simple!: boolean;

  isMakeOfferDialogOpened: boolean = false;

  isViewOfferDialogOpened: boolean = false;

  isBreedOfferDialogOpened: boolean = false;

  public get isOwner() {
    return this.cryptomon.owner === this.$store.getters[Getters.DefaultAccount];
  }

  public get canBuy() {
    return !this.isOwner
      && this.cryptomon.isOnSale
      && !this.cryptomon.offer;
  }

  public get image() {
    switch (+this.cryptomon.element) {
      case CryptomonElement.Fire:
        return require('@/assets/cryptomon-fire.png');
      case CryptomonElement.Water:
        return require('@/assets/cryptomon-water.png');
      case CryptomonElement.Earth:
        return require('@/assets/cryptomon-earth.png');
      case CryptomonElement.Electricity:
        return require('@/assets/cryptomon-electricity.png');
      case CryptomonElement.Air:
        return require('@/assets/cryptomon-air.png');
      default:
        throw new TypeError('Unknown element');
    }
  }

  public sell() {
    const { id } = this.cryptomon;
    this.$store.dispatch(Actions.SellCryptomon, { id });
  }

  // eslint-disable-next-line class-methods-use-this
  public readyForBattle() {
    // todo
  }

  public openMakeOfferDialog() {
    this.isMakeOfferDialogOpened = true;
  }

  public closeMakeOfferDialog() {
    this.isMakeOfferDialogOpened = false;
  }

  public openViewOfferDialog() {
    this.isViewOfferDialogOpened = true;
  }

  public closeViewOfferDialog() {
    this.isViewOfferDialogOpened = false;
  }

  public openBreedDialog() {
    this.isBreedOfferDialogOpened = true;
  }

  public closeBreedDialog() {
    this.isBreedOfferDialogOpened = false;
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

  .cryptomon-card > .actions {
    width: 100%;
    display: flex;
    margin-top: 8px;
  }

  .cryptomon-card > .actions button {
    flex-grow: 1;
  }
</style>
