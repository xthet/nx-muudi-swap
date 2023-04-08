import { AlphaRouter } from "@uniswap/smart-order-router"
import { BigintIsh, CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core"
import { ethers, BigNumber } from "ethers"
import JSBI from "jsbi"
import ERC20ABI from "@/constants/abis/ERC20.json"
import { conn, oTx, tkn } from "@/types"
import { useContext } from "react"
import { ConnectionContext } from "@/contexts/connection"

const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"

export default function useAlphaRouter() {
  const { isConnected, signer, account, provider }:conn = useContext(ConnectionContext)!
  const chainId = 137
  const aRouter = new AlphaRouter({ chainId, provider })

  const wethTkn:tkn = {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"
  }

  const uniTkn:tkn = {
    name: "Uniswap Token",
    symbol: "UNI",
    decimals: 18,
    address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f"
  }

  const WETH = new Token(chainId, wethTkn.address, wethTkn.decimals, wethTkn.symbol, wethTkn.name)
  const UNI = new Token(chainId, uniTkn.address, uniTkn.decimals, uniTkn.symbol, uniTkn.name)

  const wethCtrt = new ethers.Contract(wethTkn.address, ERC20ABI.abi, signer)

  const uniCtrt = new ethers.Contract(uniTkn.address, ERC20ABI.abi, signer)

  async function getPrice(inputAmount:number, slippageAmount:BigintIsh, deadline:number, walletAddress:string){
    const percentSlippage = new Percent(slippageAmount, 100)
    const wei = ethers.utils.parseUnits(inputAmount.toString(), wethTkn.decimals)
    const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))
    const route = await aRouter.route(
      currencyAmount,
      UNI,
      TradeType.EXACT_INPUT,
      { recipient:walletAddress, slippageTolerance:percentSlippage, deadline:deadline, type:1 }
    )

    const transaction:oTx = {
      data:route!.methodParameters!.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: BigNumber.from(route!.methodParameters!.value),
      from: walletAddress,
      gasPrice: BigNumber.from(route!.gasPriceWei),
      gasLimit: ethers.utils.hexlify(1000000)
    }

    const quoteAmountOut = route!.quote.toFixed(6)
    const ratio = (parseInt(quoteAmountOut!) / inputAmount).toFixed(3)
    return [transaction, quoteAmountOut, ratio]
  }

  async function runSwap(transaction:oTx, signer:ethers.providers.JsonRpcSigner){
    const approvalAmount = ethers.utils.parseUnits("10", 18).toString()
    await wethCtrt.approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount)
    await signer.sendTransaction(transaction)
  }

  return {
    runSwap, getPrice, chainId, wethCtrt, uniCtrt
  }
}
