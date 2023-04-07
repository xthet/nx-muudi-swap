import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Logo } from "../exportComps"
import { faGithubSquare } from "@fortawesome/free-brands-svg-icons"

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft-wrapper">
        <Logo className="ft-logo"/>
        <span className="ft-info-lg">{"©2023 muudiswap • All Rights Reserved."}</span>
        <div className="ft-info-sm">
          <span>{"©2023 muudiswap"}</span> 
          <span>{"All Rights Reserved"}</span>
        </div>
        <FontAwesomeIcon icon={faGithubSquare} className="ft-git-icon"/>
      </div>
    </footer>
  )
}
