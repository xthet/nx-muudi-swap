interface props {
  offMe:Function
  newSlp:Function
  newDdln:Function
}

export default function SettingsModal({ offMe, newSlp, newDdln }:props) {
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
          <div className="sm-slp">
            <h5 className="sm-slp-title">{"Slippage tolerance"}</h5>
            <div>
              <button className="sm-slp-auto-btn">{"Auto"}</button>
              <div className="sm-slp-wrp">
                <input type="number" className="sm-slp-inpt"/>
                <span>{"%"}</span>
              </div>
              <small>{"This value may be a little to high"}</small>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
