import { ethers } from "ethers"
import { MetaMaskInpageProvider } from "@metamask/providers"
import { useRouter } from "next/router"
import { createContext, ReactNode, useState, useEffect } from "react"
import { conn } from "@/types"

interface props{
  children: ReactNode
}

declare global{
  interface Window {
    ethereum?: MetaMaskInpageProvider | any
  }
}

const ConnectionContext = createContext<conn | null>(null)

function ConnectionProvider ({ children }:props) {
  const router = useRouter()
  const [hasMetamask, setHasMetamask] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState("31337")
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | (() => ethers.providers.JsonRpcSigner) | null>(null)
  const [account, setAccount] = useState("0x0")
  const [balance, setBalance] = useState("00")

  async function connect()
  {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        setIsConnected(true)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = await provider.getSigner()
        setSigner(signer)
        const { chainId } = await provider.getNetwork()
        setChainId(chainId.toString())
      } catch (e) {
        console.log(e)
      }
    } else {
      setIsConnected(false)
    }
  }

  async function updateUI()
  {
    if(typeof window.ethereum !== "undefined")
    {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if(accounts.length)
        {
          setIsConnected(true)
          const provider = new ethers.providers.Web3Provider(window.ethereum)
          const balance = await provider.getBalance(accounts[0])
          const signer = await provider.getSigner()
          setSigner(signer)
          const { chainId } = await provider.getNetwork()
          if(chainId.toString() !== "43113")
          {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xa869" }],
            })
            console.log("You have switched to the right network")
          }
          setAccount(accounts[0])
          setBalance(ethers.utils.formatEther(balance))
          setChainId(chainId.toString())
        }
        else{setIsConnected(false)}

      } catch (e) {
        console.log(e)
      }

      window.ethereum.on("chainChanged", () => {
        updateUI()
      })
      window.ethereum.on("accountsChanged", () => {
        updateUI()
      })
    }
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true)
      updateUI()
    }else{if(confirm("You need a Metamask wallet to use this site,\nWould you like to install Metamask")){
      router.push("https://metamask.io/")
    }else{alert("Please install Metamask ;)")}}
  }, [account, chainId])

  const payload:conn = { hasMetamask, isConnected, chainId, signer, account, connect, balance }

  return (
    <ConnectionContext.Provider value={payload}>
      {children}
    </ConnectionContext.Provider>
  )
}

export { ConnectionContext, ConnectionProvider }