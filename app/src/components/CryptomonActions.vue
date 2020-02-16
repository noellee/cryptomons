<template>
  <div>
    <MakeOfferDialog
      v-if="isMakeOfferDialogOpened"
      :cryptomon-id="cryptomon.id"
      @offer-made="closeMakeOfferDialog"
      @cancel-offer="closeMakeOfferDialog"
    />
    <ViewOfferDialog
      v-if="isViewOfferDialogOpened"
      :offer="cryptomon.offer"
      :owner="cryptomon.owner"
      @offer-accepted="closeViewOfferDialog"
      @offer-rejected="closeViewOfferDialog"
      @offer-withdrawn="closeViewOfferDialog"
      @cancel="closeViewOfferDialog"
    />
    <BreedDialog
      v-if="isBreedDialogOpened"
      :cryptomon="cryptomon"
      @breed="closeBreedDialog"
      @cancel="closeBreedDialog"
    />
    <ShareDialog
      v-if="isShareDialogOpened"
      :cryptomon="cryptomon"
      @share="closeShareDialog"
      @cancel="closeShareDialog"
    />
    <ChallengeDialog
      v-if="isChallengeDialogOpened"
      :cryptomon="cryptomon"
      @challenge="closeChallengeDialog"
      @cancel="closeChallengeDialog"
    />
    <ViewChallengeDialog
      v-if="isViewChallengeDialogOpened"
      :cryptomon="cryptomon"
      @close-dialog="closeViewChallengeDialog"
    />

    <DropdownButtonGroup dropdown-text="More options">
    <!--Idle and owned-->
    <template v-if="isOwner && cryptomon.isIdle">
      <IconButton @click="sell" :icon="['fab', 'ethereum']">Sell</IconButton>
      <IconButton @click="readyToFight" icon="fist-raised">Ready to fight</IconButton>
      <IconButton @click="openBreedDialog" icon="baby">Breed</IconButton>
      <IconButton @click="openShareDialog" icon="handshake">Share</IconButton>
    </template>

    <!--Shared and (co-)owned-->
    <template v-else-if="isOwnerOrCoOwner && cryptomon.isShared">
      <IconButton @click="openBreedDialog" icon="baby">Breed</IconButton>
      <IconButton @click="endSharing" icon="heart-broken" v-if="isOwner">Un-share</IconButton>
    </template>

    <!--Ready to fight-->
    <template v-else-if="cryptomon.isReadyToFight">
      <IconButton v-if="isOwner" @click="leaveFight" icon="door-open" class="bg-red">
        Leave fight
      </IconButton>
      <IconButton v-else @click="openChallengeDialog" icon="fist-raised">Challenge</IconButton>
    </template>

    <!--In a challenge-->
    <template v-else-if="cryptomon.isInAChallenge">
      <IconButton @click="openViewChallengeDialog" icon="eye">View challenge</IconButton>
    </template>

    <!--On sale-->
    <template v-else-if="cryptomon.isOnSale">
      <IconButton v-if="cryptomon.offer" icon="eye" @click="openViewOfferDialog">
        View offer
      </IconButton>
      <IconButton v-else-if="isOwner" icon="door-open" @click="takeOffMarket" class="bg-red">
        Take off market
      </IconButton>
      <IconButton v-else icon="comments-dollar" @click="openMakeOfferDialog">
        Make offer
      </IconButton>
    </template>

    <!--Involved in an offer-->
    <button v-else-if="cryptomon.isInAnOffer" disabled class="secondary">Pending offer</button>

    <!--Otherwise-->
    <button v-else disabled class="secondary">Unavailable</button>
    </DropdownButtonGroup>
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
import ChallengeDialog from '@/components/dialogs/ChallengeDialog.vue';

@Component({
  components: {
    ShareDialog,
    BreedDialog,
    IconButton,
    DropdownButtonGroup,
    ViewOfferDialog: () => import('@/components/dialogs/ViewOfferDialog.vue'),
    MakeOfferDialog,
    ChallengeDialog,
    ViewChallengeDialog: () => import('@/components/dialogs/ViewChallengeDialog.vue'),
  },
})
export default class CryptomonActions extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  isMakeOfferDialogOpened: boolean = false;

  isViewOfferDialogOpened: boolean = false;

  isBreedDialogOpened: boolean = false;

  isShareDialogOpened: boolean = false;

  isChallengeDialogOpened: boolean = false;

  isViewChallengeDialogOpened: boolean = false;

  get defaultAccount() {
    return this.$store.getters[Getters.DefaultAccount];
  }

  public get isOwner() {
    return this.cryptomon.owner === this.defaultAccount;
  }

  public get isOwnerOrCoOwner() {
    return this.isOwner || this.cryptomon.coOwner === this.defaultAccount;
  }

  // ///////////////////////////
  // Trading
  // ///////////////////////////

  public async sell() {
    const { id } = this.cryptomon;
    await this.$store.dispatch(Actions.SellCryptomon, { id });
  }

  public async takeOffMarket() {
    const { id } = this.cryptomon;
    await this.$store.dispatch(Actions.TakeOffMarket, id);
  }

  // ///////////////////////////
  // Sharing
  // ///////////////////////////

  public async endSharing() {
    await this.$store.dispatch(Actions.EndSharing, this.cryptomon.id);
  }

  // ///////////////////////////
  // Fighting
  // ///////////////////////////

  public async readyToFight() {
    await this.$store.dispatch(Actions.ReadyToFight, this.cryptomon.id);
  }

  public async leaveFight() {
    await this.$store.dispatch(Actions.LeaveFight, this.cryptomon.id);
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

  public openChallengeDialog() {
    this.isChallengeDialogOpened = true;
  }

  public closeChallengeDialog() {
    this.isChallengeDialogOpened = false;
  }

  public openViewChallengeDialog() {
    this.isViewChallengeDialogOpened = true;
  }

  public closeViewChallengeDialog() {
    this.isViewChallengeDialogOpened = false;
  }
}
</script>

<style scoped>
  .actions {
    width: 100%;
    display: flex;
    margin-top: 8px;
  }

  .actions button {
    flex-grow: 1;
  }
</style>
