import Head from "next/head"
import Image from "next/image"
import { Inter } from "next/font/google"
import { Swapper } from "@/components/exportComps"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <main className="hm">
      <Head>
        <title>{"muudiswap"}</title>
        <meta name="description" content="Muudiswap - a decentralized exchange platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/muudiswap__favicon.svg" />
      </Head>

      <Swapper/>
    </main>
  )
}
