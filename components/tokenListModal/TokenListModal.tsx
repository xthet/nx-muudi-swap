import popTokens from "@/constants/popTokens.json"
import { gtkn } from "@/types"
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import useInfiniteScroll from "react-infinite-scroll-hook"
import { useMediaQuery } from "react-responsive"

interface props {
	offMe: Function
	tokens: gtkn[]
	insetTkn: gtkn
	selTkn: Function
}

export default function TokenListModal({
	offMe,
	tokens,
	insetTkn,
	selTkn,
}: props) {
	const isVSmallScreen = useMediaQuery({ query: "(max-width: 600px)" })
	const [loading, setLoading] = useState(false)
	const [hasNext, setHasNext] = useState(true)
	const [error, setError] = useState(false)
	const [offset, setOffset] = useState(50)
	const [tknArr, setTknArr] = useState<gtkn[]>([])

	const [sentryRef, { rootRef }] = useInfiniteScroll({
		loading: loading,
		hasNextPage: hasNext,
		disabled: !!error,
		onLoadMore: () => {
			offset >= 4060 ? setHasNext(false) : setOffset((prev) => prev + 50)
		},
		rootMargin: "0px 0px 400px 0px",
	})
	function findInput(val: string) {
		let exactArr: gtkn[] = []
		let qTknsArr: gtkn[] = tokens.filter((token) => {
			if (val == "") {
				return token
			} else if (
				token.name.toLowerCase() == val.toLowerCase() ||
				token.symbol.toLowerCase() == val.toLowerCase() ||
				token.address.toLowerCase() == val.toLowerCase()
			) {
				exactArr.push(token)
			} else if (
				token.name.toLowerCase().includes(val.toLowerCase()) ||
				token.symbol.toLowerCase().includes(val.toLowerCase())
			) {
				return token
			}
		})
		setTknArr([...exactArr, ...qTknsArr])
	}

	function checkClickedTkn(tkn: gtkn) {
		if (tkn.name.toLowerCase() !== insetTkn.name.toLowerCase()) {
			selTkn(tkn)
			offMe()
		}
	}

	useEffect(() => {
		if (tokens.length > 0) {
			setTknArr(
				tokens.sort((a, b) => {
					return a.name.localeCompare(b.name)
				})
			)
		}
	}, [tokens])

	return (
		<>
			<div
				className="tlm-reactive"
				onClick={() => {
					offMe()
				}}
			></div>
			<div className="tlm">
				<div className="tlm-box">
					<p className="tlm-title">
						{"Select a token"}
						<FontAwesomeIcon
							icon={faXmark}
							className="tlm-x-icon"
							onClick={() => {
								offMe()
							}}
						/>
					</p>
					<div className="tlm-search">
						<FontAwesomeIcon
							icon={faMagnifyingGlass}
							className="tlm-search-icon"
						/>
						<input
							type="text"
							className="tlm-inpt"
							placeholder="Search token name or paste address"
							onChange={(e) => {
								findInput(e.target.value)
							}}
						/>
					</div>
					<div className="tlm-pop-tkns-wrp">
						{popTokens.popTkns.map((popTkn: gtkn, index) => {
							return (
								<span
									key={index}
									className={`tlm-pop-tkn ${
										popTkn.name == insetTkn.name && "--tkn-disabled"
									}`}
									onClick={() => {
										checkClickedTkn(popTkn)
									}}
								>
									<img src={popTkn.logoURI} alt=".." />
									<p>{popTkn.symbol.substring(0, 5)}</p>
								</span>
							)
						})}
					</div>
					<div className="tlm-grp" ref={rootRef}>
						{tknArr.slice(0, offset).map((token, index) => {
							return (
								<div
									key={index}
									className={`tlm-tkn-grp ${
										token.name == insetTkn.name && "--tkn-disabled"
									}`}
									onClick={() => {
										checkClickedTkn(token)
									}}
								>
									<img src={token.logoURI} alt=".." className="tlm-tkn-img" />
									<span className="tlm-tkn-name">
										{token.name.length > 10
											? token.name.substring(0, 10) + "..."
											: token.name}
									</span>
									<span className="tlm-tkn-sym">{token.symbol}</span>
								</div>
							)
						})}
						{(loading || hasNext) && <div ref={sentryRef}>{"..."}</div>}
					</div>
				</div>
				{!isVSmallScreen && (
					<div className="tlm-edge">
						<div className="tlm-trz"></div>
						<div className="tlm-trz-skw"></div>
						<div className="tlm-trz-txt">{"412 tokens"}</div>
					</div>
				)}
			</div>
		</>
	)
}
