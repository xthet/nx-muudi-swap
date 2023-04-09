import { faWallet } from "@fortawesome/free-solid-svg-icons"
import { Logo } from "../exportComps"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { conn } from "@/types"
import { useContext } from "react"
import { ConnectionContext } from "@/contexts/connection"
import { truncateStr } from "@/utils/truncateStr"


export default function Navbar() {
  const { isConnected, signer, account, connect }:conn = useContext(ConnectionContext)!

  return (
    <nav className="nv">
      <div className="nv-wrapper">
        <Logo className="nv-logo"/>
        <button className="nv-conn-btn" onClick={()=>{!isConnected && connect()}}>
          <FontAwesomeIcon icon={faWallet} className="nv-wallet-icon"/>
          {!isConnected ? "Connect" : truncateStr(account, 10)}
        </button>
      </div>
    </nav>
  )
}
