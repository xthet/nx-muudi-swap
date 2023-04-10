import { ConnectionContext } from "@/contexts/connection"
import useAlphaRouter from "@/hooks/useAlphaRouter"
import { conn, gtkn, oTx } from "@/types"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faChevronDown, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState, useEffect } from "react"
import { TokenListModal } from "../exportComps"
import { ethers } from "ethers"
import ERC20 from "@/constants/abis/ERC20.json"

const ethTkn:gtkn = {
  chainId: 1,
  name: "Ethereum",
  symbol: "ETH",
  decimals: 18,
  address: "",
  logoURI: "/assets/eth_logo.png"
}

export default function Swapper({ tokens }:{tokens:any[]}) {
  const { isConnected, signer, account }:conn = useContext(ConnectionContext)!
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
    if(payTkn.name && recTkn && recTkn.name && value){
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

  useEffect(()=>{
    if(isConnected && payTkn && payTkn.address){
      findBalance()
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
    if(!dloading){
      currInpt == "pay" && getQuote(payVal, "pay") 
      currInpt == "rec" && getQuote(payVal, "rec")
    }
  },[dloading])

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
                  onChange={(e)=>{setPayVal(e.target.value); setCurrInpt("pay")}} 
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
              <span className="sw-py">{recTkn && recTkn.symbol && `${rprice && "1"} ${recTkn.symbol.substring(0,4)} = ${Number(rprice).toFixed(4)} ${payTkn.symbol.substring(0,4)}`}</span>
            </div>
            <div className="sw-inpt-cont">
              <div className="sw-inpt-box">
                <input type="number" className="sw-inpt" 
                  onChange={(e)=>{setRecVal(e.target.value); setCurrInpt("rec")}} 
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
