<template>
  <div id="loader">
    <span class="loader-text"><slot /></span>
    <fa-icon icon="circle-notch" spin size="lg" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class Loader extends Vue {
}
</script>
<style>
#loader {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 4em;
}

#loader .loader-text {
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0,0,0,0.6);
  margin-bottom: 20px;
}

#loader > * {
  margin: 0 auto;
}
</style>
