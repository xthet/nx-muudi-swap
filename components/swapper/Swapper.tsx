export default function Swapper() {
  return (
    <div className="sw">
      <div className="sw-menu">
        <div className="sw-menu-swap">{"Swap"}</div>
        <div className="sw-menu-settings">
          {/* fontawesomeicon */}
        </div>
      </div>
      <div className="sw-swap-box">
        <div className="sw-input-cont-wrapper">
          <div className="sw-input-box">
            <input type="text" className="sw-inpt"/>
            <div className="sw-token-select">
              {/* faethicon */}
              <span>{"ETH"}</span>
              {/* fadropicon */}
            </div>
          </div>
          <div className="sw-input-box">
            <input type="text" className="sw-inpt"/>
            <div className="sw-token-select">
              {/* faethicon */}
              <span>{"ETH"}</span>
              {/* fadropicon */}
            </div>
          </div>
        </div>
        <button>{"Swap"}</button>
      </div>
      
    </div>
  )
}
