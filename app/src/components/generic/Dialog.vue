<template>
  <div class="dialog-background" v-on:click="$emit('cancel')">
    <div class="dialog" v-on:click="$event.stopPropagation()">
      <h2>{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue } from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {
  @Prop(String) title!: string;
}
</script>

<style>
  .dialog-background {
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
  }

  .dialog {
    background: #e1e1e1;
    border-radius: 8px;
    box-shadow: rgba(0,0,0,0.4) 0 0 8px;
    align-self: center;
    padding: 20px 24px;
    text-align: left;
  }

  .dialog > h2 {
    margin: 0;
  }

  .dialog .button-group {
    margin-top: 12px;
    display: flex;
  }

  .dialog .button-group button {
    flex-grow: 1;
    margin: 0 4px;
  }

  .dialog .button-group button:first-child {
    margin-left: 0;
  }

  .dialog .button-group button:last-child {
    margin-right: 0;
  }
</style>
