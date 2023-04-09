import { ConnectionContext } from "@/contexts/connection"
import useAlphaRouter from "@/hooks/useAlphaRouter"
import { conn, gtkn, oTx } from "@/types"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faChevronDown, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { TokenListModal } from "../exportComps"

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
  const [payTkn, setPayTkn] = useState<gtkn>(ethTkn)
  const [recTkn, setRecTkn] = useState<gtkn|any>({})

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
                  <div className="sw-selected-tkn">
                    <img src={payTkn.logoURI} alt="tkn" className="sw-tkn-lg"/>
                    <span className="sw-tkn-name">{payTkn.symbol.substring(0,4)}</span>
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon" onClick={()=>{setShowTLM(true); setPayRec("pay")}}/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {"$1,072.32"}
              </div>
            </div>
          </div>

          {showTLM && <TokenListModal offMe={()=>{setShowTLM(false)}} tokens={tokens} type={payRec} selTkn={payRec == "pay" ? setPayTkn : setRecTkn}/>}

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
                    {recTkn && recTkn.logoURI && recTkn.symbol ? <>
                      <img src={recTkn.logoURI} alt="tkn" className="sw-tkn-lg"/>
                      <span className="sw-tkn-name">{recTkn.symbol.substring(0,4)}</span>
                    </> : <span className="sw-tkn-noTkn">{"Select a token"}</span>}
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon" onClick={()=>{setShowTLM(true); setPayRec("rec")}}/>
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
