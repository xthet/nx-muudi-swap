interface props {
  offMe:Function
  tokens:any[]
}

export default function TokenListModal({ offMe, tokens }:props) {
  return (
    <div className="tlm-cont">
      <div className="tlm-reactive" onClick={()=>{offMe()}}>
      </div>
      <div className="tlm">
        <div className="tlm-box">
          <input type="text" className="tlm-search" placeholder="Search token name"/>
          <div className="tlm-grp">
            {tokens.slice(0,50).map((token, index)=>{
              return (
                <div key={index} className="tlm-tkn-grp">
                  <img src={token.logoURI} alt="tkn_img" className="tlm-tkn-img"/>
                  <span className="tlm-tkn-name">{token.name.length > 10 ? token.name.substring(0,10) + "..." : token.name}</span>
                  <span className="tlm-tkn-sym">{token.symbol}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="tlm-edge">
          <div className="tlm-trz"></div>
          <div className="tlm-trz-skw"></div>
        </div>
      </div>
    </div>
  )
}
