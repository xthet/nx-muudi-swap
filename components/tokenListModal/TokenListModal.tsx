interface props {
  offMe:Function
  tokens:any[]
}

export default function TokenListModal({ offMe, tokens }:props) {
  return (
    <div className="tlm-reactive" onClick={()=>{offMe()}}>
      {/* <div className="tlm">
        <ul>
          {tokens.map((token, index)=>{
            return (
              <li key={index}>{token.name}</li>
            )
          })}
        </ul>
      </div> */}
    </div>
  )
}
