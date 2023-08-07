import ERC20 from "@/constants/abis/ERC20.json"
import UniswapRouterABI from "@/constants/abis/UniswapRouterV2.json"
import { UNISWAP_ROUTERV2_ADDRESS, defTkn, ethTkn } from "@/constants/constants"
import { ConnectionContext } from "@/contexts/connection"
import { conn, gtkn } from "@/types"
import {
	faChevronDown,
	faGear,
	faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	Fetcher,
	Percent,
	Route,
	Token,
	TokenAmount,
	Trade,
	TradeType,
	WETH,
	ChainId,
} from "@uniswap/sdk"
import { BigNumber, ethers } from "ethers"
import JSBI from "jsbi"
import { useContext, useEffect, useState } from "react"
import { SettingsModal, TokenListModal } from "../exportComps"

export default function Swapper({ tokens }: { tokens: any[] }) {
	const { isConnected, signer, account, provider }: conn =
		useContext(ConnectionContext)!
	const [disableSwap, setDisableSwap] = useState(false)
	const [showTLM, setShowTLM] = useState(false)
	const [showSM, setShowSM] = useState(false)
	const [payRec, setPayRec] = useState("pay")
	const [currInpt, setCurrInpt] = useState("")
	const [payTkn, setPayTkn] = useState<gtkn>(ethTkn)
	const [recTkn, setRecTkn] = useState<gtkn>(defTkn)
	const [payVal, setPayVal] = useState("")
	const [recVal, setRecVal] = useState("")
	const [rprice, setRprice] = useState("")
	const [payUSDRate, setPayUSDRate] = useState("")
	const [recUSDRate, setRecUSDRate] = useState("")
	const [dloading, setDloading] = useState(false)
	const [pBal, setPBal] = useState("")
	const [ethPrice, setEthPrice] = useState("")
	const [defSlp, setDefSlp] = useState("50")
	const [defDeadline, SetDefDeadline] = useState(
		Math.floor(Date.now() / 1000) + 60 * 20
	)
	const [NMFP, setNMFP] = useState(false)

	async function checkSwap() {
		switch (currInpt) {
			case "pay": // pay exact
				if (payTkn.name == "Ethereum") {
					await swap(recTkn, payTkn, payVal, "EET")
				} else if (recTkn.name == "Ethereum") {
					await swap(recTkn, payTkn, payVal, "ETETH")
				} else {
					await swap(recTkn, payTkn, payVal, "ETT")
				}
			case "rec":
				if (recTkn.name == "Ethereum") {
					await swap(recTkn, payTkn, recVal, "TEE")
				} else if (payTkn.name == "Ethereum") {
					await swap(recTkn, payTkn, recVal, "ETHET")
				} else {
					await swap(recTkn, payTkn, recVal, "TET")
				}
		}
	}

	async function findBalance() {
		const erc20Ctrt = new ethers.Contract(payTkn.address, ERC20.abi, signer)
		try {
			const max = await erc20Ctrt.balanceOf(account)
			setPBal(max.toString())
		} catch (error) {
			console.log(error)
		}
	}

	async function getQuote(value: string, type: string) {
		setDloading(true)
		const exchangeList = "Uniswap_V3"
		if (payTkn.name && recTkn && recTkn.name && value && value != "0") {
			const params = {
				buyToken: recTkn.address ? recTkn.address : recTkn.symbol,
				sellToken: payTkn.address ? payTkn.address : payTkn.symbol,
				sellAmount:
					type == "pay"
						? (Number(value) * Math.pow(10, payTkn.decimals)).toString()
						: "",
				buyAmount:
					type == "rec"
						? (Number(value) * Math.pow(10, recTkn.decimals)).toString()
						: "",
				includedSources: exchangeList,
			}
			try {
				const response = await fetch(
					`https://api.0x.org/swap/v1/price?sellToken=${
						params.sellToken
					}&buyToken=${params.buyToken}&${
						type == "pay"
							? "sellAmount=" + params.sellAmount
							: "buyAmount=" + params.buyAmount
					}&includedSources=${params.includedSources}`,
					{ headers: { "0x-api-key": process.env.NEXT_PUBLIC_0X_API_KEY! } }
				)
					.then((res) => res.json())
					.then((data) => {
						if (data.validationErrors) {
							setNMFP(true)
						} else {
							setNMFP(false)
						}
						setPayUSDRate(
							(
								Number(
									(
										(Number(data.sellAmount) /
											Math.pow(10, payTkn.decimals) /
											Number(data.sellTokenToEthRate)) *
										Number(ethPrice)
									).toFixed(2)
								) || ""
							).toLocaleString()
						)
						setRecUSDRate(
							(
								Number(
									(
										(Number(data.buyAmount) /
											Math.pow(10, recTkn.decimals) /
											Number(data.buyTokenToEthRate)) *
										Number(ethPrice)
									).toFixed(2)
								) || ""
							).toLocaleString()
						)
						type == "pay"
							? setRecVal(
									(
										Number(data.buyAmount) / Math.pow(10, recTkn.decimals)
									).toFixed(4) || ""
							  )
							: setPayVal(
									(
										Number(data.sellAmount) / Math.pow(10, payTkn.decimals)
									).toFixed(4) || ""
							  )
						setRprice(
							(type == "pay"
								? 1 / Number(data.price)
								: Number(data.price)
							).toFixed(4) || ""
						)
					})
				setTimeout(() => {
					setDloading(false)
				}, 1000)
			} catch (err) {
				console.error(err)
			}
		}
	}

	async function approveRouter(payTkn: gtkn, amount: string) {
		if (payTkn.name == "Ethereum") {
			return true
		}
		const erc20 = new ethers.Contract(payTkn.address, ERC20.abi, signer)
		try {
			const approveTx = await erc20.approve(
				UNISWAP_ROUTERV2_ADDRESS,
				ethers.utils.parseUnits(amount, payTkn.decimals)
			)
			await approveTx.wait(1)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	async function swap(
		getTkn: gtkn,
		giveTkn: gtkn,
		amount: string,
		type: "ETT" | "TET" | "EET" | "TEE" | "ETHET" | "ETETH",
		slippage = defSlp,
		deadline = defDeadline
	) {
		setDisableSwap(true)
		const approved = await approveRouter(giveTkn, amount)
		const routerCtrt = new ethers.Contract(
			UNISWAP_ROUTERV2_ADDRESS,
			UniswapRouterABI.abi,
			signer
		)

		async function swapETT() {
			const rTkn = new Token(ChainId.MAINNET, getTkn.address, getTkn.decimals)
			const pTkn = new Token(ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountIn = ethers.utils.parseUnits(amount, giveTkn.decimals)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(pTkn, JSBI.BigInt(amountIn)),
				TradeType.EXACT_INPUT
			)
			const amountOutMin = trade.minimumAmountOut(slipTol).raw
			const amountOutMinHex = BigNumber.from(amountOutMin.toString())
			const path = [pTkn.address, rTkn.address]

			// ETT
			const swapETT = await routerCtrt.swapExactTokensForTokens(
				amountIn,
				amountOutMinHex,
				path,
				account,
				deadline
			)
			const swapETTR = await swapETT.wait(1)
			console.log(swapETT, swapETTR)
		}

		async function swapTET() {
			const rTkn = new Token(ChainId.MAINNET, getTkn.address, getTkn.decimals)
			const pTkn = new Token(ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountOut = ethers.utils.parseUnits(amount, getTkn.decimals)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(rTkn, JSBI.BigInt(amountOut)),
				TradeType.EXACT_OUTPUT
			)
			const amountInMax = trade.maximumAmountIn(slipTol).raw
			const amountInMaxHex = BigNumber.from(amountInMax.toString())
			const path = [pTkn.address, rTkn.address]

			// TET
			const swapTET = await routerCtrt.swapTokensForExactTokens(
				amountOut,
				amountInMaxHex,
				path,
				account,
				deadline
			)
			const swapTETR = await swapTET.wait(1)
			console.log(swapTETR, swapTET)
		}

		async function swapEET() {
			const rTkn = new Token(ChainId.MAINNET, getTkn.address, getTkn.decimals)
			const pTkn = WETH[rTkn.chainId]
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountIn = ethers.utils.parseEther(amount)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(pTkn, JSBI.BigInt(amountIn)),
				TradeType.EXACT_INPUT
			)
			const amountOutMin = trade.minimumAmountOut(slipTol).raw
			const amountOutMinHex = BigNumber.from(amountOutMin.toString())
			const path = [pTkn.address, rTkn.address]
			const value = trade.inputAmount.raw
			const valueHex = BigNumber.from(value.toString())

			// EET
			const swapEET = await routerCtrt.swapExactETHForTokens(
				amountOutMinHex,
				path,
				account,
				deadline,
				{ value: valueHex }
			)
			const swapEETR = await swapEET.wait(1)
			console.log(swapEETR, swapEET)
		}

		async function swapTEE() {
			const pTkn = new Token(ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
			const rTkn = WETH[pTkn.chainId]
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountOut = ethers.utils.parseEther(amount)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(rTkn, JSBI.BigInt(amountOut)),
				TradeType.EXACT_OUTPUT
			)
			const amountInMax = trade.maximumAmountIn(slipTol).raw
			const amountInMaxHex = BigNumber.from(amountInMax.toString())
			const path = [pTkn.address, rTkn.address]

			// TEE
			const swapTEE = await routerCtrt.swapTokensForExactETH(
				amountOut,
				amountInMaxHex,
				path,
				account,
				deadline
			)
			const swapTEER = await swapTEE.wait(1)
			console.log(swapTEER, swapTEE)
		}

		async function swapETHET() {
			const rTkn = new Token(ChainId.MAINNET, getTkn.address, getTkn.decimals)
			const pTkn = WETH[rTkn.chainId]
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountOut = ethers.utils.parseUnits(amount, getTkn.decimals)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(rTkn, JSBI.BigInt(amountOut)),
				TradeType.EXACT_OUTPUT
			)
			const amountInMax = trade.maximumAmountIn(slipTol).raw
			const amountInMaxHex = BigNumber.from(amountInMax.toString())
			const path = [pTkn.address, rTkn.address]

			// ETHET
			const swapETHET = await routerCtrt.swapETHForExactTokens(
				amountOut,
				path,
				account,
				deadline,
				{ value: amountInMaxHex }
			)
			const swapETHETR = await swapETHET.wait(1)
			console.log(swapETHETR, swapETHET)
		}

		async function swapETETH() {
			const pTkn = new Token(ChainId.MAINNET, giveTkn.address, giveTkn.decimals)
			const rTkn = WETH[pTkn.chainId]
			const pair = await Fetcher.fetchPairData(rTkn, pTkn, provider)
			const route = await new Route([pair], pTkn)
			let amountIn = ethers.utils.parseUnits(amount, giveTkn.decimals)
			const slipTol = new Percent(slippage, "10000") // 0.5% slipTol
			const trade = new Trade(
				route,
				new TokenAmount(pTkn, JSBI.BigInt(amountIn)),
				TradeType.EXACT_INPUT
			)
			const amountOutMin = trade.minimumAmountOut(slipTol).raw
			const amountOutMinHex = BigNumber.from(amountOutMin.toString())
			const path = [pTkn.address, rTkn.address]

			// ETETH
			const swapETETH = await routerCtrt.swapExactTokensForETH(
				amountIn,
				amountOutMinHex,
				path,
				account,
				deadline
			)
			const swapETETHR = await swapETETH.wait(1)
			console.log(swapETETH, swapETETHR)
		}

		if (approved && provider && signer) {
			try {
				switch (type) {
					case "ETT":
						await swapETT()
					case "TET":
						await swapTET()
					case "EET":
						await swapEET()
					case "TEE":
						await swapTEE()
					case "ETETH":
						await swapETETH()
					case "ETHET":
						await swapETHET()
				}
			} catch (error) {
				console.log(error)
				setDisableSwap(false)
			}
		}
	}

	useEffect(() => {
		if (isConnected && payTkn && payTkn.address) {
			findBalance()
			setRprice("")
		}
	}, [isConnected, payTkn])

	useEffect(() => {
		async function getEthPrice() {
			try {
				const ethP = await fetch(
					"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
				)
					.then((res) => res.json())
					.then((data) => {
						setEthPrice(data.ethereum.usd.toString())
					})
			} catch (error) {
				console.log(error)
			}
		}
		getEthPrice()
		setInterval(() => {
			getEthPrice
		}, 300000)
	}, [])

	useEffect(() => {
		if (!payVal && recVal && currInpt == "pay") {
			setRecVal("")
			setRecUSDRate("")
			setPayUSDRate("")
			setRprice("")
		} else if (!recVal && payVal && currInpt == "rec") {
			setPayVal("")
			setRecUSDRate("")
			setPayUSDRate("")
			setRprice("")
		}
	}, [payVal, recVal])

	useEffect(() => {
		if (currInpt == "pay") {
			getQuote(payVal, "pay")
		} else if (currInpt == "rec") {
			getQuote(recVal, "rec")
		}
	}, [payTkn, recTkn])

	return (
		<div className="sw">
			<div className="sw-menu">
				<div className="trz-cont -trz-disa">
					<div className="trz-skw -skw-left -trz-left -trz-morph -trz-rml"></div>
					<div className="trz-str -trz-left -trz-morph -trz-rml"></div>
					<div className="sw-menu-swap">{"Swap"}</div>
				</div>
				<div className="trz-cont">
					<div className="trz-skw -skw-right -trz-right"></div>
					<div className="trz-str -trz-right"></div>
					<div
						className="sw-menu-settings"
						onClick={() => {
							setShowSM(true)
						}}
					>
						<FontAwesomeIcon icon={faGear} className="sw-menu-settings-icon" />
					</div>
				</div>
			</div>

			{showSM && (
				<SettingsModal
					offMe={() => {
						setShowSM(false)
					}}
					newSlp={(val: string) => {
						setDefSlp(val)
					}}
					newDdln={(val: number) => {
						SetDefDeadline(val)
					}}
				/>
			)}

			<div className="sw-swap-box">
				<div className="sw-input-cont-wrapper">
					<div className="sw-inpt-grp">
						<div className="sw-py-max-grp">
							<span className="sw-py">{"PAY"}</span>
							<span className="sw-max">
								{`${
									payTkn && pBal ? "MAX: " + pBal + " " + payTkn.symbol : ""
								}`}
							</span>
						</div>
						<div className="sw-inpt-cont">
							<div className="sw-inpt-box">
								<input
									type="number"
									className="sw-inpt"
									onChange={(e) => {
										setPayVal(e.target.value)
										setCurrInpt("pay")
										!dloading
											? getQuote(e.target.value, "pay")
											: setTimeout(() => {
													getQuote(e.target.value, "pay")
											  }, 1000)
									}}
									value={payVal}
									style={
										dloading && currInpt == "rec" ? { opacity: "0.6" } : {}
									}
								/>
								<div className="sw-tkn-sel">
									<div className="sw-selected-tkn">
										<img src={payTkn.logoURI} alt="tkn" className="sw-tkn-lg" />
										<span className="sw-tkn-name">
											{payTkn.symbol.substring(0, 4)}
										</span>
									</div>
									<FontAwesomeIcon
										icon={faChevronDown}
										className="sw-tkn-sel-icon"
										onClick={() => {
											setShowTLM(true)
											setPayRec("pay")
										}}
									/>
								</div>
							</div>
							<div className="sw-doll-eq">
								{payUSDRate ? "$" + payUSDRate : ""}
							</div>
						</div>
					</div>

					{showTLM && (
						<TokenListModal
							offMe={() => {
								setShowTLM(false)
							}}
							tokens={tokens}
							selTkn={payRec == "pay" ? setPayTkn : setRecTkn}
							insetTkn={payRec == "pay" ? recTkn : payTkn}
						/>
					)}

					<div className="sw-inpt-grp">
						<div className="sw-py-max-grp">
							<span className="sw-py">{"RECEIVE"}</span>
							{NMFP ? (
								<span className="sw-py">{"NO MARKET FOR PAIR"}</span>
							) : (
								<span className="sw-py">
									{recTkn.symbol !== "Select a token" &&
										`${rprice && "1 "} 
                ${recTkn.symbol.substring(0, 4)} ${rprice ? "=" : ":"} ${
											rprice && rprice !== "NaN"
												? Number(rprice).toFixed(4)
												: ""
										} 
                ${payTkn.symbol.substring(0, 4)}`}
								</span>
							)}
						</div>
						<div className="sw-inpt-cont">
							<div className="sw-inpt-box">
								<input
									type="number"
									className="sw-inpt"
									onChange={(e) => {
										setRecVal(e.target.value)
										setCurrInpt("rec")
										!dloading
											? getQuote(e.target.value, "rec")
											: setTimeout(() => {
													getQuote(e.target.value, "rec")
											  }, 1000)
									}}
									value={recVal}
									style={
										dloading && currInpt == "pay" ? { opacity: "0.6" } : {}
									}
								/>
								<div className="sw-tkn-sel">
									<div className="sw-selected-tkn">
										{recTkn.name !== "Select a token" ? (
											<>
												<img
													src={recTkn.logoURI}
													alt="tkn"
													className="sw-tkn-lg"
												/>
												<span className="sw-tkn-name">
													{recTkn.symbol.substring(0, 4)}
												</span>
											</>
										) : (
											<span className="sw-tkn-noTkn">{"Select a token"}</span>
										)}
									</div>
									<FontAwesomeIcon
										icon={faChevronDown}
										className="sw-tkn-sel-icon"
										onClick={() => {
											setShowTLM(true)
											setPayRec("rec")
										}}
									/>
								</div>
							</div>
							<div className="sw-doll-eq">
								{recUSDRate ? "$" + recUSDRate : ""}
							</div>
						</div>
					</div>
				</div>
				<div className="sw-swap-cta">
					<button
						className="sw-swap-btn"
						disabled={!isConnected || disableSwap}
						onClick={() => {
							checkSwap()
						}}
					>
						{isConnected ? "SWAP" : "Connect wallet"}
					</button>
				</div>
			</div>
		</div>
	)
}
