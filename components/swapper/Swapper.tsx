import { ConnectionContext } from "@/contexts/connection"
import useAlphaRouter from "@/hooks/useAlphaRouter"
import { conn, oTx } from "@/types"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faChevronDown, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { TokenListModal } from "../exportComps"

export default function Swapper({ tokens }:{tokens:Object[]}) {
  const { isConnected, signer, account }:conn = useContext(ConnectionContext)!
  const [showTLM, setShowTLM] = useState(false)
  // const { runSwap, getPrice, uniCtrt, wethCtrt } = useAlphaRouter()
  // const [loading, setLoading] = useState(false)
  // const [inputAmount, setInputAmount] = useState(0)
  // const [outputAmount, setOutputAmount] = useState<any>(0)
  // const [slippageAmount, setSlippageAmount] = useState(2)
  // const [deadlineMinutes, setDeadlineMinutes] = useState(10)
  // const [transaction, setTransaction] = useState<oTx|any>(null)
  // const [ratio, setRatio] = useState<any>()
  // const [wethAmount, setWethAmount] = useState("")
  // const [uniAmount, setUniAmount] = useState("")


  // async function getSwapPrice(inputAmount:number){
  //   setLoading(true)
  //   setInputAmount(inputAmount)
  //   const swap = await getPrice(
  //     inputAmount, 
  //     slippageAmount, 
  //     Math.floor(Date.now() / 1000 + (deadlineMinutes * 60)), 
  //     account
  //   )
  //   setTransaction(swap[0])
  //   setOutputAmount(swap[1])
  //   setRatio(swap[2])
  //   setLoading(false)
  // }

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
              <span className="sw-max">{"MAX: 0.32 WETH"}</span>
            </div>
            <div className="sw-inpt-cont">
              <div className="sw-inpt-box">
                <input type="number" className="sw-inpt"/>
                <div className="sw-tkn-sel">
                  <div className="sw-selected-tkn" onClick={()=>{setShowTLM(true)}}>
                    <FontAwesomeIcon icon={faEthereum} className="sw-token-lg"/>
                    <span className="sw-tkn-name">{"ETH"}</span>
                  </div>
                  {showTLM && <TokenListModal/>}
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon"/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {"$1,072.32"}
              </div>
            </div>
          </div>

          <div className="sw-inpt-grp">
            <div className="sw-py-max-grp">
              <span className="sw-py">{"RECEIVE"}</span>
              <span className="sw-py">{"1 ETH = 3 UNI"}</span>
            </div>
            <div className="sw-inpt-cont">
              <div className="sw-inpt-box">
                <input type="number" className="sw-inpt"/>
                <div className="sw-tkn-sel">
                  <div className="sw-selected-tkn">
                    <FontAwesomeIcon icon={faEthereum} className="sw-token-lg"/>
                    <span className="sw-tkn-name">{"ETH"}</span>
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon"/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {"$3,072.32"}
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
