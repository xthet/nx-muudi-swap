import { faWallet } from "@fortawesome/free-solid-svg-icons"
import { Logo } from "../exportComps"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


export default function Navbar() {
  return (
    <nav className="nv">
      <div className="nv-wrapper">
        <Logo className="nv-logo"/>
        <button className="nv-conn-btn">
          <FontAwesomeIcon icon={faWallet} className="nv-wallet-icon"/>
          {"Connect"}
        </button>
      </div>
    </nav>
  )
}
