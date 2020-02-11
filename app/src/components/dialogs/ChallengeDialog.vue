<template>
  <Dialog
    title="Challenge"
    v-on:cancel="$emit('cancel')"
  >
    <form v-on:submit="challenge" v-on:submit.prevent>
      <p>Challenge <b>{{cryptomon.name}}</b> to a fight</p>
      <label class="price-input">
        Stake a bet:
        <input type="number" step=".00000000000001" v-model="stake"/>
        <b>ETH</b>
      </label>
      <p>Choose your fighter:</p>
      <label class="radio-label" v-for="cryptomon in readyCryptomons" v-bind:key="cryptomon.id">
        <input type="radio" v-model="selectedCryptomon" v-bind:value="cryptomon.id" />
        <span>
            <b>{{ cryptomon.name }}</b>
            [{{ cryptomon.primaryElementAsString }}]
            [Health: {{ cryptomon.health }}]
            [Strength: {{ cryptomon.strength}}]
          </span>
      </label>
      <div class="button-group">
        <button type="submit">Challenge!</button>
        <button class="bg-red" v-on:click="$emit('cancel')">Cancel</button>
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import Dialog from '@/components/generic/Dialog.vue';
import Getters from '@/store/getters';
import { Cryptomon } from '@/game';
import Actions from '@/store/actions';

@Component({
  components: { Dialog },
})
export default class ChallengeDialog extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  selectedCryptomon: number | null = null;

  name: string = '';

  stake: number = 1;

  public get readyCryptomons() {
    const defaultAccount = this.$store.getters[Getters.DefaultAccount];
    const getCryptomonsByOwner = this.$store.getters[Getters.GetCryptomonsByOwner];
    return getCryptomonsByOwner(defaultAccount).filter((c: Cryptomon) => c.isReadyToFight);
  }

  public async challenge() {
    const opponentId = this.cryptomon.id;
    const challengerId = this.selectedCryptomon;
    const { stake } = this;
    if (challengerId === null) return;
    await this.$store.dispatch(Actions.Challenge, { opponentId, challengerId, stake });
    this.$emit('challenge');
  }
}
</script>

<style scoped>
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

  .radio-label:not(:first-child):not(:last-child) {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .radio-label input[type=radio] {
    margin: 12px;
  }

  .radio-label span {
    margin-right: 12px;
  }

  .radio-label:hover {
    background: #42b983;
    color: #f2f2f2;
  }
</style>
