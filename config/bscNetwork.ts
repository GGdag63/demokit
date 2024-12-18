import { defineChain } from "@reown/appkit/networks";

export const bscMainnet = defineChain({
  id: 56, // BSC Mainnet Chain ID
  caipNetworkId: "eip155:56", // CAIP-2 uyumlu ağ kimliği
  chainNamespace: "eip155",
  name: "Binance Smart Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Binance Coin",
    symbol: "BNB",
  },
  rpcUrls: {
    default: {
      http: ["https://bsc-dataseed.binance.org/"], // BSC RPC URL'si
    },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://bscscan.com" }, // BSC Blok Gezgini
  },
});

export const bscTestnet = defineChain({
  id: 97, // BSC Testnet Chain ID
  caipNetworkId: "eip155:97", // CAIP-2 uyumlu ağ kimliği
  chainNamespace: "eip155",
  name: "Binance Smart Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Test Binance Coin",
    symbol: "tBNB", // Testnet BNB Simgesi
  },
  rpcUrls: {
    default: {
      http: ["https://data-seed-prebsc-1-s1.binance.org:8545/"], // BSC Testnet RPC URL'si
    },
  },
  blockExplorers: {
    default: { name: "BscScan Testnet", url: "https://testnet.bscscan.com" }, // BSC Testnet Blok Gezgini
  },
});