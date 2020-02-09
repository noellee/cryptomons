<template>
  <button @click="$emit('click')">
    <slot></slot>
    <fa-icon v-bind:class="`button-icon-${position}`" :icon="icon"></fa-icon>
  </button>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';

@Component
export default class IconButton extends Vue {
  @Prop([String, Array]) icon!: string | string[];

  @Prop({ default: 'left' }) position!: 'left' | 'right';
}
</script>

<style>
  button > .button-icon-right {
    position: absolute;
    right: 24px;
    top: 11px;
  }

  button > .button-icon-left {
    position: absolute;
    left: 24px;
    top: 11px;
  }
</style>
