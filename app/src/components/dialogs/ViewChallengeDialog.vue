<template>
  <Dialog
    title="View challenge"
    v-on:cancel="$emit('close-dialog')"
  >
    <template v-if="isReady">
      <p>
        <b v-if="isReady">{{challenger.name}}</b>
        challenged <b>{{opponent.name}}</b> to a fight :o
      </p>

      <div class="challenge-details">
        <div class="card-container">
          <FightResultBadge v-if="result" :badge="result.challengerWon ? 'winner' : 'loser'" />
          <CryptomonCard :cryptomon="challenger" :simple="true"/>
        </div>
        <span class="vs">vs.</span>
        <div class="card-container">
          <FightResultBadge v-if="result" :badge="result.opponentWon ? 'winner' : 'loser'" />
          <CryptomonCard :cryptomon="opponent" :simple="true"/>
        </div>
      </div>

      <p v-if="!result && isOpponentOwner">Bet <b>{{stake}}</b> ETH?</p>
      <div v-if="!result && isOpponentOwner" class="button-group">
        <button @click="acceptChallenge">Challenge accepted.</button>
        <button @click="rejectChallenge" class="bg-red">Reject challenge</button>
      </div>
      <div v-if="!result && isChallengerOwner" class="button-group">
        <button @click="withdrawChallenge" class="bg-red">Withdraw from challenge</button>
      </div>
    </template>
    <p v-else>Loading...</p>
  </Dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import Dialog from '@/components/generic/Dialog.vue';
import Getters from '@/store/getters';
import { Cryptomon, CryptomonGame } from '@/game';
import Actions from '@/store/actions';
import CryptomonCard from '@/components/CryptomonCard.vue';
import FightResult from '@/game/FightResult';
import Challenge from '@/game/Challenge';
import FightResultBadge from '@/components/misc/FightResultBadge.vue';

@Component({
  components: { FightResultBadge, CryptomonCard, Dialog },
})
export default class ViewChallengeDialog extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  result: FightResult | null = null;

  challenge: Challenge | null = null;

  private _opponentId: string | null = null;

  private _challengerId: string | null = null;

  created() {
    this.init();
  }

  async init() {
    if (this.cryptomon.challenge) {
      this.challenge = this.cryptomon.challenge;
    } else {
      this.challenge = await this.findChallengeByChallengerId(this.cryptomon.id);
    }
    if (this.challenge === null) throw new TypeError();
    this._opponentId = this.challenge.opponentId;
    this._challengerId = this.challenge.challengerId;
    await this.loadMissingCryptomons();
  }

  public get isReady(): boolean {
    return !!this.challenger && !!this.opponent;
  }

  async findChallengeByChallengerId(id: string): Promise<Challenge> {
    const cached = this.$store.getters[Getters.GetChallengeByChallengerId](id);
    if (cached) return cached;
    const game = this.$store.state.game as CryptomonGame;
    const challenge = await game.findChallengeByChallengerId(id);
    if (!challenge) throw new TypeError();
    return challenge;
  }

  public get challenger(): Cryptomon | null {
    if (this._challengerId === null) return null;
    return this.$store.getters[Getters.GetCryptomonById](this._challengerId);
  }

  public get opponent(): Cryptomon | null {
    if (this._opponentId === null) return null;
    return this.$store.getters[Getters.GetCryptomonById](this._opponentId);
  }

  public get stake(): string {
    if (!this.challenge) return '0';
    return this.$store.state.web3.utils.fromWei(this.challenge.stake.toString(), 'ether');
  }

  public get defaultAccount(): string {
    return this.$store.getters[Getters.DefaultAccount];
  }

  public get isOpponentOwner(): boolean {
    return this.opponent?.owner === this.defaultAccount;
  }

  public get isChallengerOwner(): boolean {
    return this.challenger?.owner === this.defaultAccount;
  }

  public async loadMissingCryptomons() {
    if (!this._challengerId || !this._opponentId) throw new TypeError();
    const ids = [];
    if (!this.challenger) ids.push(this._challengerId);
    if (!this.opponent) ids.push(this._opponentId);
    await this.$store.dispatch(Actions.FetchCryptomonsByIds, ids);
  }

  public async acceptChallenge() {
    if (this.challenge === null || this._opponentId === null) throw new TypeError();
    const { stake } = this.challenge;
    const game = this.$store.state.game as CryptomonGame;
    game.onFightResult(this._opponentId, (result) => { this.result = result; });
    await this.$store.dispatch(Actions.AcceptChallenge, { id: this._opponentId, stake });
  }

  public async rejectChallenge() {
    if (this._opponentId === null) throw new TypeError();
    await this.$store.dispatch(Actions.RejectChallenge, this._opponentId);
    this.$emit('close-dialog');
  }

  public async withdrawChallenge() {
    if (this._opponentId === null) throw new TypeError();
    await this.$store.dispatch(Actions.WithdrawChallenge, this._opponentId);
    this.$emit('close-dialog');
  }
}
</script>

<style scoped>
  .challenge-details {
    display: flex;
    align-items: center;
  }

  .challenge-details .vs {
    font-size: larger;
    font-weight: bold;
    font-style: italic;
  }

  .card-container {
    position: relative;
  }
</style>
