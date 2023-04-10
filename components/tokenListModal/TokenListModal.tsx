import { gtkn } from "@/types"
import { useState } from "react"
import useInfiniteScroll from "react-infinite-scroll-hook"

interface props {
  offMe:Function
  tokens:gtkn[]
  type:string
  selTkn:Function
}

export default function TokenListModal({ offMe, tokens, type, selTkn }:props) {
  const [loading, setLoading] = useState(false)
  const [hasNext, setHasNext] = useState(true)
  const [error, setError] = useState(false)
  const [offset, setOffset] = useState(50)

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: loading,
    hasNextPage: hasNext,
    disabled: !!error,
    onLoadMore: ()=>{offset >= 4060 ? setHasNext(false) : setOffset(prev=>prev + 50)},
    rootMargin: "0px 0px 400px 0px"
  })

  return (
    <div className="tlm-cont">
      <div className="tlm-reactive" onClick={()=>{offMe()}}>
      </div>
      <div className="tlm">
        <div className="tlm-box">
          <input type="text" className="tlm-search" placeholder="Search token name"/>
          <div className="tlm-grp" ref={rootRef}>
            {tokens.slice(0,offset).map((token, index)=>{
              return (
                <div key={index} className="tlm-tkn-grp" onClick={()=>{selTkn(token); offMe()}}>
                  <img src={token.logoURI} alt="tkn_img" className="tlm-tkn-img"/>
                  <span className="tlm-tkn-name">{token.name.length > 10 ? token.name.substring(0,10) + "..." : token.name}</span>
                  <span className="tlm-tkn-sym">{token.symbol}</span>
                </div>
              )
            })}
            {(loading || hasNext) && (
              <div ref={sentryRef}>
                {"Loading..."}
              </div>
            )
            }
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
