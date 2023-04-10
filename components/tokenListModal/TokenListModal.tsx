import { gtkn } from "@/types"
import { useState, useEffect } from "react"
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
  const [tknArr, setTknArr] = useState<gtkn[]>([])

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: loading,
    hasNextPage: hasNext,
    disabled: !!error,
    onLoadMore: ()=>{offset >= 4060 ? setHasNext(false) : setOffset(prev=>prev + 50)},
    rootMargin: "0px 0px 400px 0px"
  })

  function findInput(val:string){
    let qTknsArr:gtkn[] = tokens.filter(token=>{
      if(val == ""){return token}
      else if(token.name.toLowerCase() == val.toLowerCase() || token.symbol.toLowerCase() == val.toLowerCase()){
        return token
      }
      else if(token.name.toLowerCase().includes(val.toLowerCase()) || token.symbol.toLowerCase().includes(val.toLowerCase())){
        return token
      }
    })

    setTknArr(qTknsArr)
  }

  useEffect(()=>{
    if(tokens){
      setTknArr(tokens.sort((a,b)=>{return a.name.localeCompare(b.name)}))
    }
  },[tokens])

  return (
    <div className="tlm-cont">
      <div className="tlm-reactive" onClick={()=>{offMe()}}>
      </div>
      <div className="tlm">
        <div className="tlm-box">
          <input type="text" className="tlm-search" placeholder="Search token name" onChange={(e)=>{findInput(e.target.value)}}/>
          <div className="tlm-grp" ref={rootRef}>
            {tknArr.slice(0,offset).map((token, index)=>{
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
                {"..."}
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
