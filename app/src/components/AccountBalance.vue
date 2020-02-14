<template>
  <div class="account-balance">
    <span>{{ account }}</span>
    <span><b>{{ walletBalance }} ETH</b></span>
    <span>
      <b>{{ gameBalance }} ETH</b> to &nbsp;
      <span @click="withdraw" class="withdraw-button">withdraw</span>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Web3 from 'web3';
import Getters from '@/store/getters';
import { CryptomonGame } from '@/game';

@Component
export default class AccountBalance extends Vue {
  private walletBalanceInWei: string | null = null;

  private gameBalanceInWei: string | null = null;

  private web3: Web3 | null = null;

  async created() {
    this.web3 = this.$store.state.web3;
    if (!this.web3) throw new TypeError();
    const refreshBalance = this.refreshBalance.bind(this);
    refreshBalance();
    this.web3.eth.subscribe('newBlockHeaders', async (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        refreshBalance();
      }
    });
  }

  async refreshBalance(): Promise<void> {
    if (!this.web3) throw new TypeError();
    this.walletBalanceInWei = await this.web3.eth.getBalance(this.account);
    const game = this.$store.state.game as CryptomonGame;
    this.gameBalanceInWei = await game.getBalance();
  }

  // eslint-disable-next-line class-methods-use-this
  async withdraw() {
    if (!this.gameBalanceInWei) throw new TypeError();
    const game = this.$store.state.game as CryptomonGame;
    await game.withdrawFunds(this.gameBalanceInWei);
  }

  get account(): string {
    return this.$store.getters[Getters.DefaultAccount];
  }

  get walletBalance(): number {
    if (!this.walletBalanceInWei || !this.web3) return 0;
    const wei = this.web3.utils.fromWei(this.walletBalanceInWei);
    return Math.round(+wei * 1e5) / 1e5;
  }

  get gameBalance(): number {
    if (!this.gameBalanceInWei || !this.web3) return 0;
    const wei = this.web3.utils.fromWei(this.gameBalanceInWei);
    return Math.round(+wei * 1e5) / 1e5;
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

.withdraw-button {
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
  color: #237bff;
}

.withdraw-button:hover {
  color: #66a6ff;
}
</style>
