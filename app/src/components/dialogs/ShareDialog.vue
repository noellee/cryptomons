<template>
  <Dialog
    title="Share with a co-owner"
    @cancel="$emit('cancel')"
  >
    <form @submit="share()" @submit.prevent @input="clearError">
      <label>
        <p>Who do you want to share <b>{{cryptomon.name}}</b> with?</p>
        <input
          type="text"
          maxlength="42"
          v-model="coOwner"
          placeholder="0x0000000000000000000000000000000000000000"
          size="50"
        />
      </label>
      <div v-if="errorMessage" class="error-message">{{errorMessage}}</div>
      <div class="button-group">
        <button type="submit">Share!</button>
        <button class="bg-red" @click="$emit('cancel')">Cancel</button>
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';
import Dialog from '@/components/generic/Dialog.vue';
import { Cryptomon } from '@/game';
import Getters from '@/store/getters';
import Actions from '@/store/actions';

@Component({
  components: { Dialog },
})
export default class BreedDialog extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  coOwner: string = '';

  errorMessage: string | null = null;

  public async share() {
    const { web3 } = this.$store.state;
    if (!web3.utils.isAddress(this.coOwner)) {
      this.errorMessage = 'That doesn\nt seem like a valid address... try again.';
      return;
    }

    const defaultAccount = this.$store.getters[Getters.DefaultAccount];
    if (defaultAccount.toLowerCase() === this.coOwner.toLowerCase()) {
      this.errorMessage = 'Can\'t share with yourself.';
      return;
    }

    await this.$store.dispatch(Actions.Share, { id: this.cryptomon.id, coOwner: this.coOwner });
    this.$emit('share');
  }

  clearError() {
    this.errorMessage = null;
  }
}
</script>

<style scoped>
input {
  width: 100%;
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
