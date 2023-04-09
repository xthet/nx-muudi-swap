import Head from "next/head"
import Image from "next/image"
import { Inter } from "next/font/google"
import { Swapper } from "@/components/exportComps"

export const getStaticProps = async () => {
  const response = await fetch("https://tokens.coingecko.com/uniswap/all.json").then(res=>res.json())

  return {
    props: {
      tkns: response
    }
  }
}

export default function Home({ tkns }:{tkns:any}) {
  return (
    <main className="hm">
      <Head>
        <title>{"muudiswap"}</title>
        <meta name="description" content="Muudiswap - a decentralized exchange platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/muudiswap__favicon.svg" />
      </Head>

      <Swapper tokens={tkns.tokens}/>
    </main>
  )
}
