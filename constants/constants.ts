import { gtkn } from "@/types"

export const UNISWAP_ROUTERV2_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"

export const ethTkn:gtkn = {
  chainId: 1,
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  address: "",
  logoURI: "/assets/eth_logo.png"
}

export const defTkn:gtkn = {
  chainId: 0,
  name: "Select a token",
  symbol: "Select a token",
  decimals: 0,
  address: "",
  logoURI: ""
}