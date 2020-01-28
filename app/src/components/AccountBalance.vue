<template>
  <div class="account-balance">
    <span>{{ account }}</span>
    <span><b>{{ balance }} ETH</b></span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class AccountBalance extends Vue {
  balance: number | null = null;

  account: string | null = null;

  async created() {
    const { web3 } = this.$store.state;
    this.account = web3.eth.defaultAccount;
    this.balance = web3.utils.fromWei(await web3.eth.getBalance(this.account));
  }
}
</script>

<style scoped>
.account-balance {
  position: fixed;
  right: 12px;
  top: 12px;
  background: #e1e1e1;
  border-radius: 4px;
  color: #14191f;
  padding: 8px;
  opacity: 0.6;
  text-align: right;
  cursor: default;
  transition: 0.3s;
}

.account-balance:hover {
  opacity: 0.9;
}

.account-balance > span {
  display: block;
  width: 160px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.account-balance:hover > span {
  text-overflow: clip;
  width: auto;
  white-space: nowrap;
  overflow: hidden;
}
</style>
