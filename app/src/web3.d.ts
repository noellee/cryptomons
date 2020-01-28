import { provider } from 'web3-core';

export {};

declare global {
    interface Window { ethereum: provider }
}
