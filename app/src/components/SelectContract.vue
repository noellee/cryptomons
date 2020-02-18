<template>
  <div>
    <Dialog
      v-if="isChangeDialogOpened"
      title="Change contract"
      @cancel="isChangeDialogOpened = false"
    >
      <form @submit="change" @submit.prevent @input="clearError">
        <label>
          Contract address:
          <input
            type="text"
            maxlength="42"
            v-model="newAddress"
            placeholder="0x0000000000000000000000000000000000000000"
            size="50"
          />
        </label>
        <div v-if="errorMessage" class="error-message">{{errorMessage}}</div>
        <div class="button-group">
          <button type="submit">Change</button>
        </div>
      </form>
    </Dialog>
    <div class="select-contract" v-if="isReady">
      <span>Contract: {{ contractAddress }}</span><br>
      <span @click="isChangeDialogOpened = true" class="change-button">change</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CryptomonGame } from '@/game';
import Dialog from '@/components/generic/Dialog.vue';
import Actions from '@/store/actions';
@Component({
  components: { Dialog },
})
export default class SelectContract extends Vue {
  isChangeDialogOpened: boolean = false;

  newAddress: string = '';

  errorMessage: string | null = null;

  get isReady(): boolean {
    const game = this.$store.state.game as CryptomonGame;
    return game !== null;
  }

  get contractAddress(): string {
    const game = this.$store.state.game as CryptomonGame;
    return game.contractAddress;
  }

  change() {
    const { web3 } = this.$store.state;
    if (!web3.utils.isAddress(this.newAddress)) {
      this.errorMessage = 'That doesn\nt seem like a valid address... try again.';
      return;
    }

    this.$store.dispatch(Actions.UpdateContractAddress, this.newAddress);
    this.isChangeDialogOpened = false;
  }

  clearError() {
    this.errorMessage = null;
  }
}
</script>

<style scoped>
.select-contract {
  position: fixed;
  right: 12px;
  bottom: 12px;
  border-radius: 4px;
  color: #e1e1e1;
  padding: 8px;
  opacity: 0.4;
  text-align: right;
  cursor: default;
  transition: 0.3s;
  z-index: -1;
}

.select-contract:hover {
  opacity: 0.7;
}

.select-contract a {
  color: #e1e1e1;
}

.change-button {
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.change-button:hover {
  color: #f2f2f2;
}

input {
  display: block;
}

.error-message {
  background: #fac8ca;
  border: 1px solid #c33638;
  border-radius: 2px;
  padding: 4px 8px;
  color: #c33638;
  margin-top: 8px;
}
</style>
