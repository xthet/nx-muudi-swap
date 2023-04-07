import { faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function Swapper() {
  return (
    <div className="sw">
      <div className="sw-menu">
        <div className="tr-cont">
          <div className="sk-b"></div>
          <div className="st-b"></div>
          <div className="st-text">{"Swap"}</div>
        </div>
        {/* <div className="sw-menu-swap">{"Swap"}</div> */}
        <div className="sw-menu-settings">
          <FontAwesomeIcon icon={faSliders} className="sw-menu-settings-icon"/>

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
        <div className="sw-swap-cta">
          <button className="sw-swap-btn">
            {"Swap"}
          </button>
        </div>
      </div>
      
    </div>
  )
}
