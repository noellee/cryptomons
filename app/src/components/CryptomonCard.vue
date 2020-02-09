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
      v-if="!simple && isBreedDialogOpened"
      :cryptomon="cryptomon"
      @breed="closeBreedDialog"
      @cancel="closeBreedDialog"
    />
    <ShareDialog
      v-if="!simple && isShareDialogOpened"
      :cryptomon="cryptomon"
      @share="closeShareDialog"
      @cancel="closeShareDialog"
    />
    <h2>{{ cryptomon.name }}</h2>
    <img :src="image" :alt="cryptomon.primaryElementAsString" width="240px" />
    <ul>
      <li><span>Element:</span>{{ element }}</li>
      <li><span>Health:</span>{{ cryptomon.health }}</li>
      <li><span>Strength:</span>{{ cryptomon.strength }}</li>
    </ul>
    <div v-if="!simple">
    <DropdownButtonGroup v-if="isOwner && cryptomon.isIdle" dropdown-text="More options">
      <IconButton @click="sell" :icon="['fab', 'ethereum']">Sell</IconButton>
      <IconButton @click="readyForBattle" icon="fist-raised">Ready for battle</IconButton>
      <IconButton @click="openBreedDialog" icon="baby">Breed</IconButton>
      <IconButton @click="openShareDialog" icon="handshake">Share</IconButton>
    </DropdownButtonGroup>
    <DropdownButtonGroup
      v-else-if="isOwnerOrCoOwner && cryptomon.isShared"
      dropdown-text="More options"
    >
      <IconButton @click="openBreedDialog" icon="baby">Breed</IconButton>
      <IconButton @click="endSharing" icon="heart-broken" v-if="isOwner">Un-share</IconButton>
    </DropdownButtonGroup>
    <div v-else class="actions">
      <IconButton v-if="canBuy" icon="comments-dollar" @click="openMakeOfferDialog">
        Make offer
      </IconButton>
      <IconButton v-else-if="cryptomon.offer" icon="eye" @click="openViewOfferDialog">
        View offer
      </IconButton>
      <button v-else-if="cryptomon.isInAnOffer" disabled class="secondary">Is in an offer</button>
      <button v-else-if="cryptomon.isOnSale" disabled class="secondary">Pending offer</button>
      <button v-else disabled class="secondary">Unavailable</button>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import { Cryptomon, CryptomonElement } from '@/game';
import Actions from '@/store/actions';
import MakeOfferDialog from '@/components/dialogs/MakeOfferDialog.vue';
import Getters from '@/store/getters';
import DropdownButtonGroup from '@/components/generic/DropdownButtonGroup.vue';
import IconButton from '@/components/generic/IconButton.vue';
import BreedDialog from '@/components/dialogs/BreedDialog.vue';
import ShareDialog from '@/components/dialogs/ShareDialog.vue';
@Component({
  components: {
    ShareDialog,
    BreedDialog,
    IconButton,
    DropdownButtonGroup,
    ViewOfferDialog: () => import('@/components/dialogs/ViewOfferDialog.vue'),
    MakeOfferDialog,
  },
})
export default class CryptomonCard extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  @Prop({ default: false }) readonly simple!: boolean;

  isMakeOfferDialogOpened: boolean = false;

  isViewOfferDialogOpened: boolean = false;

  isBreedDialogOpened: boolean = false;

  isShareDialogOpened: boolean = false;

  get defaultAccount() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  public get isOwner() {
    return this.cryptomon.owner === this.defaultAccount;
  }

  public get isOwnerOrCoOwner() {
    return this.isOwner || this.cryptomon.coOwner === this.defaultAccount;
  }

  public get canBuy() {
    return !this.isOwner
      && this.cryptomon.isOnSale
      && !this.cryptomon.offer;
  }

  public get element() {
    const primaryElement = this.cryptomon.primaryElementAsString;
    const secondaryElement = this.cryptomon.secondaryElementAsString;
    if (primaryElement === secondaryElement) return primaryElement;
    return `${primaryElement}, ${secondaryElement}`;
  }

  public get image() {
    const primaryElement = this.cryptomon.primaryElementAsString.toLowerCase();
    const secondaryElement = this.cryptomon.secondaryElementAsString.toLowerCase();
    // eslint-disable-next-line import/no-dynamic-require,global-require
    return require(`@/assets/cryptomon-${primaryElement}-${secondaryElement}.png`);
  }

  public async sell() {
    const { id } = this.cryptomon;
    await this.$store.dispatch(Actions.SellCryptomon, { id });
  }

  public async endSharing() {
    await this.$store.dispatch(Actions.EndSharing, this.cryptomon.id);
  }

  // eslint-disable-next-line class-methods-use-this
  public readyForBattle() {
    // todo
  }

  // Open and closing dialogs

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
    this.isBreedDialogOpened = true;
  }

  public closeBreedDialog() {
    this.isBreedDialogOpened = false;
  }

  public openShareDialog() {
    this.isShareDialogOpened = true;
  }

  public closeShareDialog() {
    this.isShareDialogOpened = false;
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

  .cryptomon-card .actions {
    width: 100%;
    display: flex;
    margin-top: 8px;
  }

  .cryptomon-card .actions button {
    flex-grow: 1;
  }
</style>
