import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

interface props {
  offMe:Function
  newSlp:Function
  newDdln:Function
}

export default function SettingsModal({ offMe, newSlp, newDdln }:props) {
  const defSlp = "50"
  const defDdln = Math.floor(Date.now() / 1000) + (60 * 20) // 20mins
  const [showSlpInfo, setShowSlpInfo] = useState(false)
  const [showTxdInfo, setShowTxdInfo] = useState(false)
  const [slpVal, setSlpVal] = useState("")
  const [autoSlp, setAutoSlp] = useState(true)

  function checkSlp(val:string){
    setSlpVal(val)
    if(val && Number(val)){
      setAutoSlp(false)
      newSlp((Number(val) * 100).toString())
    }else{
      setAutoSlp(true)
      newSlp(defSlp)
    }
  }

  function checkDdln(val:string){
    if(val && Number(val)){
      newDdln(Math.floor(Date.now() / 1000) + (60 * Number(val)))
    }else{
      newDdln(defDdln)
    }
  }

  return (
    <>
      <div className="sm-reactive" onClick={()=>{offMe()}}></div>
      <div className="sm-modal">
        <div className="sm-edge">
          <div className="sm-trz"></div>
          <div className="sm-trz-skw"></div>
          <div className="sm-trz-txt">{"Settings"}</div>
        </div>
        <div className="sm-box">
          <div className="sm-func">
            <div className="sm-func-hd">
              <h5 className="sm-func-title">{"Slippage tolerance"}</h5>
              <FontAwesomeIcon icon={faCircleInfo} className="sm-func-info-icon" 
                onMouseEnter={()=>{setShowSlpInfo(true)}} onMouseLeave={()=>{setShowSlpInfo(false)}}
              />
              {showSlpInfo && <div className="sm-func-info">
                {"Your transaction will revert if the price changes unfavorably past this percentage"}
              </div>}
            </div>
            <div className="sm-slp-wrp">
              <button className={`sm-slp-auto-btn ${!autoSlp && "--no-auto-slp"}`} onClick={()=>{setAutoSlp(true); setSlpVal(""); newSlp(defSlp)}}>{"Auto"}</button>
              <div className="sm-slp-inpt-wrp">
                <div className="sm-slp-inpt-grp">
                  <input type="number" className="sm-slp-inpt" placeholder="0.5" onChange={(e)=>{checkSlp(e.target.value)}} value={slpVal}/>
                  <span>{"%"}</span>
                </div>
                {/* <small>{"This value may be a little to high"}</small> */}
              </div>
            </div>
          </div>
          <div className="sm-func">
            <div className="sm-func-hd">
              <h5 className="sm-func-title">{"Transaction deadline"}</h5>
              <FontAwesomeIcon icon={faCircleInfo} className="sm-func-info-icon" 
                onMouseEnter={()=>{setShowTxdInfo(true)}} onMouseLeave={()=>{setShowTxdInfo(false)}}
              />              
              {showTxdInfo && <div className="sm-func-info">
                {"Your transaction will revert if it is pending for more than this period of time."}
              </div>}
            </div>
            <div className="sm-txd-wrp">
              <input type="number" className="sm-txd-inpt" placeholder="20" onChange={(e)=>{checkDdln(e.target.value)}}/>
              <span>{"minutes"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
