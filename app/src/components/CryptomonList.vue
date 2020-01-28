<template>
  <div class="cryptomon-list">
    <CryptomonCard
      v-for="cryptomon in cryptomons"
      v-bind:key="cryptomon.id"
      :cryptomon="cryptomon"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator';
import Component from 'vue-class-component';
import { Cryptomon } from '@/game';
import CryptomonCard from './CryptomonCard.vue';

@Component({
  components: { CryptomonCard },
})
export default class CryptomonList extends Vue {
  @Prop(Array) cryptomons!: Cryptomon[];
}
</script>
