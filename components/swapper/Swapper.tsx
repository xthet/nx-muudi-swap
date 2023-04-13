import { ConnectionContext } from "@/contexts/connection"
import useAlphaRouter from "@/hooks/useAlphaRouter"
import UNISWAP from "@uniswap/sdk"
import JSBI from "jsbi"
import { conn, gtkn, oTx } from "@/types"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faChevronDown, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState, useEffect } from "react"
import { TokenListModal } from "../exportComps"
import { BigNumber, ethers } from "ethers"
import ERC20 from "@/constants/abis/ERC20.json"
import UniswapRouterABI from "@/constants/abis/UniswapRouterV2.json"
import { UNISWAP_ROUTERV2_ADDRESS } from "@/constants/constants"
import { Fetcher, Token, Route, Trade, TokenAmount, TradeType, Percent } from "@uniswap/sdk"

const ethTkn:gtkn = {
  chainId: 1,
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  address: "",
  logoURI: "/assets/eth_logo.png"
}

export default function Swapper({ tokens }:{tokens:any[]}) {
  const { isConnected, signer, account, provider }:conn = useContext(ConnectionContext)!
  const [showTLM, setShowTLM] = useState(false)
  const [payRec, setPayRec] = useState("pay")
  const [currInpt, setCurrInpt] = useState("")
  const [payTkn, setPayTkn] = useState<gtkn>(ethTkn)
  const [recTkn, setRecTkn] = useState<gtkn|any>({})
  const [payVal, setPayVal] = useState("")
  const [recVal, setRecVal] = useState("")
  const [rprice, setRprice] = useState("")
  const [payUSDRate, setPayUSDRate] = useState("")
  const [recUSDRate, setRecUSDRate] = useState("")
  const [dloading, setDloading] = useState(false)
  const [pBal, setPBal] = useState("")
  const [ethPrice, setEthPrice] = useState("")

  async function findBalance(){
    const erc20Ctrt = new ethers.Contract(payTkn.address, ERC20.abi, signer)
    try {
      const max = await erc20Ctrt.balanceOf(account)
      setPBal(max.toString())
    } catch (error) {
      console.log(error)
    }
  }

  async function getQuote(value:string, type:string){
    setDloading(true)
    const exchangeList = "Uniswap_V3"
    if(payTkn.name && recTkn && recTkn.name && value && value != "0"){
      const params = {
        buyToken: recTkn.address,
        sellToken: payTkn.address,
        sellAmount: type == "pay" ? (Number(value) * Math.pow(10,payTkn.decimals)).toString() : "",
        buyAmount: type == "rec" ? (Number(value) * Math.pow(10,recTkn.decimals)).toString() : "",
        includedSources: exchangeList,
      }
      try {
        const response = await fetch(
          `https://api.0x.org/swap/v1/price?sellToken=${params.sellToken}&buyToken=${params.buyToken}&${type == "pay" ? "sellAmount=" + params.sellAmount : "buyAmount=" + params.buyAmount }&includedSources=${params.includedSources}`,
        ).then(res=>res.json()).then((data)=>{
          setPayUSDRate(Number((((Number(data.sellAmount) / (Math.pow(10,payTkn.decimals))) / Number(data.sellTokenToEthRate)) * Number(ethPrice)).toFixed(2)).toLocaleString())
          setRecUSDRate(Number((((Number(data.buyAmount) / (Math.pow(10,recTkn.decimals))) / Number(data.buyTokenToEthRate)) * Number(ethPrice)).toFixed(2)).toLocaleString())
          type == "pay" ? setRecVal((Number(data.buyAmount) / (Math.pow(10,recTkn.decimals))).toFixed(4)) : setPayVal((Number(data.sellAmount) / (Math.pow(10,payTkn.decimals))).toFixed(4))
          setRprice((type == "pay" ? 1 / Number(data.price) : Number(data.price)).toFixed(4))
        })
        setTimeout(()=>{setDloading(false)},1000)
      } catch (err) {
        console.error(err)
      }
    }
  }

  async function approveRouter(payTkn:gtkn, amount:string){
    if(payTkn.name == "Ethereum"){return true}
    const erc20 = new ethers.Contract(payTkn.address, ERC20.abi, signer)
    try {
      const approveTx = await erc20.approve(UNISWAP_ROUTERV2_ADDRESS, ethers.utils.parseUnits(amount, payTkn.decimals))
      await approveTx.wait(1)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async function swap(getTkn:gtkn, giveTkn:gtkn, amount:string, slippage = "50", type:"ETT"|"TET"|"EET"|"TEE"){
    const approved = await approveRouter(giveTkn, amount)
    const routerCtrt = new ethers.Contract(UNISWAP_ROUTERV2_ADDRESS, UniswapRouterABI.abi, signer)

    async function swapETT(){
      const rTkn = new Token(UNISWAP.ChainId.MAINNET, getTkn.address, getTkn.decimals)
      const pTkn = new Token(UNISWAP.ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
      const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
      const route = await new Route([pair], pTkn)
      let amountIn = ethers.utils.parseUnits(amount, giveTkn.decimals)
      const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
      const trade = new Trade(route, new TokenAmount(pTkn, JSBI.BigInt(amountIn)), TradeType.EXACT_INPUT)
      const amountOutMin = trade.minimumAmountOut(slipTol).raw
      const amountOutMinHex = BigNumber.from(amountOutMin.toString()).toHexString()
      const path = [pTkn.address, rTkn.address]
      const deadline = Math.floor(Date.now() / 1000) + (60 * 20) // 20mins

      // ETT
      const swapETT = await routerCtrt.swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline)
      const swapETTR = await swapETT.wait(1)
      console.log(swapETT, swapETTR)
    }

    async function swapTET(){
      const rTkn = new Token(UNISWAP.ChainId.MAINNET, getTkn.address, getTkn.decimals)
      const pTkn = new Token(UNISWAP.ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
      const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
      const route = await new Route([pair], pTkn)
      let amountOut = ethers.utils.parseUnits(amount, giveTkn.decimals)
      const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
      const trade = new Trade(route, new TokenAmount(pTkn, JSBI.BigInt(amountOut)), TradeType.EXACT_INPUT)
      const amountInMin = trade.maximumAmountIn(slipTol).raw
      const amountInMinHex = BigNumber.from(amountInMin.toString()).toHexString()
      const path = [pTkn.address, rTkn.address]
      const deadline = Math.floor(Date.now() / 1000) + (60 * 20) // 20mins

      // ETT
      const swapTET = await routerCtrt.swapExactTokensForTokens(amountInMin, amountOut, path, account, deadline)
      const swapTETR = await swapTET.wait(1)
      console.log(swapETT, swapTETR)
    }

    async function swapEET(){
      const rTkn = new Token(UNISWAP.ChainId.MAINNET, getTkn.address, getTkn.decimals)
      // const pTkn = new Token(UNISWAP.ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
      const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
      const route = await new Route([pair], pTkn)
      let amountOut = ethers.utils.parseUnits(amount, giveTkn.decimals)
      const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
      const trade = new Trade(route, new TokenAmount(pTkn, JSBI.BigInt(amountOut)), TradeType.EXACT_INPUT)
      const amountInMin = trade.maximumAmountIn(slipTol).raw
      const amountInMinHex = BigNumber.from(amountInMin.toString()).toHexString()
      const path = [pTkn.address, rTkn.address]
      const deadline = Math.floor(Date.now() / 1000) + (60 * 20) // 20mins

      // ETT
      const swapTET = await routerCtrt.swapExactTokensForTokens(amountInMin, amountOut, path, account, deadline)
      const swapTETR = await swapTET.wait(1)
      console.log(swapETT, swapTETR)
    }

    if(approved){ 
      try {
        switch(type){
        case "ETT":
          await swapETT()
        case "TET":
          await swapTET()
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(()=>{
    if(isConnected && payTkn && payTkn.address){
      findBalance()
      setRprice("")
    }
  },[isConnected, payTkn])

  useEffect(()=>{
    async function getEthPrice(){ try {
      const ethP = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd").then(res=>res.json()).then((data)=>{setEthPrice(data.ethereum.usd.toString())})
    } catch (error) {
      console.log(error)
    }}
    getEthPrice()
    setInterval(()=>{getEthPrice},300000)
  },[])

  useEffect(()=>{
    if(!payVal && recVal && currInpt == "pay"){
      setRecVal("")
      setRecUSDRate("")
      setPayUSDRate("")
    } 
    else if(!recVal && payVal && currInpt == "rec"){
      setPayVal("")
      setRecUSDRate("")
      setPayUSDRate("")
    }
  },[payVal, recVal])

  return (
    <div className="sw">
      <div className="sw-menu">
        <div className="trz-cont -trz-disa">
          <div className="trz-skw -skw-left -trz-left -trz-morph -trz-rml"></div>
          <div className="trz-str -trz-left -trz-morph -trz-rml"></div>
          <div className="sw-menu-swap">{"Swap"}</div>
        </div>
        <div className="trz-cont">
          <div className="trz-skw -skw-right -trz-right"></div>
          <div className="trz-str -trz-right"></div>
          <div className="sw-menu-settings">
            <FontAwesomeIcon icon={faSliders} className="sw-menu-settings-icon"/>
          </div>
        </div>
      </div>
      <div className="sw-swap-box">
        <div className="sw-input-cont-wrapper">
          <div className="sw-inpt-grp">
            <div className="sw-py-max-grp">
              <span className="sw-py">{"PAY"}</span>
              <span className="sw-max">{`${payTkn && pBal ? "MAX: " + pBal + " " + payTkn.symbol : ""}`}</span>
            </div>
            <div className="sw-inpt-cont">
              <div className="sw-inpt-box">
                <input type="number" className="sw-inpt" 
                  onChange={(e)=>{setPayVal(e.target.value); setCurrInpt("pay"); !dloading ? getQuote(e.target.value, "pay") : setTimeout(()=>{getQuote(e.target.value, "pay")},1000)}} 
                  value={payVal}
                  style={dloading && currInpt == "rec" ? { "opacity":"0.6" } : {}}
                />
                <div className="sw-tkn-sel">
                  <div className="sw-selected-tkn">
                    <img src={payTkn.logoURI} alt="tkn" className="sw-tkn-lg"/>
                    <span className="sw-tkn-name">{payTkn.symbol.substring(0,4)}</span>
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon" onClick={()=>{setShowTLM(true); setPayRec("pay")}}/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {payUSDRate ? "$" + payUSDRate : ""}
              </div>
            </div>
          </div>

          {showTLM && <TokenListModal offMe={()=>{setShowTLM(false)}} tokens={tokens} type={payRec} selTkn={payRec == "pay" ? setPayTkn : setRecTkn}/>}

          <div className="sw-inpt-grp">
            <div className="sw-py-max-grp">
              <span className="sw-py">{"RECEIVE"}</span>
              <span className="sw-py">{recTkn && recTkn.symbol && `${rprice && "1 "} ${recTkn.symbol.substring(0,4)} = ${rprice && Number(rprice).toFixed(4)} ${payTkn.symbol.substring(0,4)}`}</span>
            </div>
            <div className="sw-inpt-cont">
              <div className="sw-inpt-box">
                <input type="number" className="sw-inpt" 
                  onChange={(e)=>{setRecVal(e.target.value); setCurrInpt("rec"); !dloading ? getQuote(e.target.value, "rec") : setTimeout(()=>{getQuote(e.target.value, "rec")},1000)}} 
                  value={recVal}
                  style={dloading && currInpt == "pay" ? { "opacity":"0.6" } : {}}
                />
                <div className="sw-tkn-sel">
                  <div className="sw-selected-tkn">
                    {recTkn && recTkn.logoURI && recTkn.symbol ? <>
                      <img src={recTkn.logoURI} alt="tkn" className="sw-tkn-lg"/>
                      <span className="sw-tkn-name">{recTkn.symbol.substring(0,4)}</span>
                    </> : <span className="sw-tkn-noTkn">{"Select a token"}</span>}
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon" onClick={()=>{setShowTLM(true); setPayRec("rec")}}/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {recUSDRate ? "$" + recUSDRate : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="sw-swap-cta">
          <button className="sw-swap-btn" disabled={!isConnected}>
            {isConnected ? "SWAP" : "Connect wallet"}
          </button>
        </div>
      </div>
    </div>
  )
}
