import { ConnectionContext } from "@/contexts/connection"
import useAlphaRouter from "@/hooks/useAlphaRouter"
import { conn, oTx } from "@/types"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faChevronDown, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useState } from "react"
import { TokenListModal } from "../exportComps"

export default function Swapper({ tokens }:{tokens:any[]}) {
  const { isConnected, signer, account }:conn = useContext(ConnectionContext)!
  const [showTLM, setShowTLM] = useState(false)

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
                  <FontAwesomeIcon icon={faChevronDown} className="sw-tkn-sel-icon"/>
                </div>
              </div>
              <div className="sw-doll-eq">
                {"$1,072.32"}
              </div>
            </div>
          </div>

          {showTLM && <TokenListModal offMe={()=>{setShowTLM(false)}} tokens={tokens}/>}

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
