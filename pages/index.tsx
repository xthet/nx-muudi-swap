import { Swapper } from "@/components/exportComps"
import Head from "next/head"

export const getStaticProps = async () => {
  const response = await fetch("https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link")
  const data = await response.json()

  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      tkns: data
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
