<template>
  <img class="badge" :src="imageUrl" :alt="badge">
</template>

<script lang="ts">
/* eslint-disable global-require */

import { Prop, Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';

type BadgeType = 'winner' | 'loser';

@Component
export default class FightResultBadge extends Vue {
  @Prop(String) badge!: BadgeType;

  get imageUrl() {
    switch (this.badge) {
      case 'winner':
        return require('@/assets/winner-badge.png');
      case 'loser':
        return require('@/assets/loser-badge.png');
      default:
        throw new TypeError();
    }
  }
}
</script>

<style scoped>
.badge {
  transform: rotate(-15deg);
  width: 200px;
  position: absolute;
  right: -40px;
  bottom: -40px;
  z-index: 9;
}
</style>
