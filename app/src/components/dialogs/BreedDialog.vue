<template>
  <Dialog
    title="Breed"
    v-on:cancel="$emit('cancel')"
  >
    <form v-on:submit="breed()" v-on:submit.prevent>
      <p>Select one of your Cryptomons to breed with <b>{{cryptomon.name}}</b></p>
      <label>
        <span>Name the newborn Cryptomon: </span>
        <input type="text" v-model="name" placeholder="Name">
      </label>
      <label class="radio-label" v-for="cryptomon in breedableCryptomons" :key="cryptomon.id">
        <input type="radio" v-model="selectedCryptomon" :value="cryptomon.id" />
        <span>
            <b>{{ cryptomon.name }}</b>
            [{{ cryptomon.primaryElementAsString }}]
            [Health: {{ cryptomon.health }}]
            [Strength: {{ cryptomon.strength}}]
          </span>
      </label>
      <div class="button-group">
        <button type="submit">Breed!</button>
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
export default class BreedDialog extends Vue {
  @Prop(Cryptomon) cryptomon!: Cryptomon;

  selectedCryptomon: string | null = null;

  name: string = '';

  public get breedableCryptomons(): Cryptomon[] {
    const defaultAccount = this.$store.getters[Getters.DefaultAccount];
    const getCryptomonsByOwner = this.$store.getters[Getters.GetCryptomonsByOwner];
    const getCryptomonsByCoOwner = this.$store.getters[Getters.GetCryptomonsByCoOwner];
    const ownedCryptomons: Cryptomon[] = getCryptomonsByOwner(defaultAccount);
    const coOwnedCryptomons: Cryptomon[] = getCryptomonsByCoOwner(defaultAccount);
    return _(ownedCryptomons)
      .concat(coOwnedCryptomons)
      .filter(c => c.canBreed)
      .filter(c => c.id !== this.cryptomon.id)
      .value();
  }

  public async breed(): Promise<void> {
    const parent1 = this.cryptomon.id;
    const parent2 = this.selectedCryptomon;
    const { name } = this;
    await this.$store.dispatch(Actions.Breed, { parent1, parent2, name });
    this.$emit('breed');
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
