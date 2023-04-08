import { BigNumber, ethers } from "ethers"

export interface conn{
  hasMetamask: boolean
  isConnected: boolean
  chainId: string
  signer: JsonRpcSigner | (() => JsonRpcSigner) | any
  provider: ethers.providers.Web3Provider
  account: string
  connect: () => Promise<void>
  balance: string
}

export interface tkn{
  name:string
  symbol:string
  decimals:number
  address:string
}

export interface oTx{
  data: string
  to: string
  value: BigNumber
  from: string
  gasPrice: BigNumber
  gasLimit: string
}