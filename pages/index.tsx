import { Swapper } from "@/components/exportComps"
import Head from "next/head"
import { useEffect, useState } from "react"

export const getStaticProps = async () => {
	const response = await fetch(
		"https://cdn.furucombo.app/furucombo.tokenlist.json"
	)
	const data = await response.json()

	if (!data) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	return {
		props: {
			tkns: data,
		},
	}
}

export default function Home({ tkns }: { tkns: any }) {
	return (
		<main className="hm">
			<Head>
				<title>{"muudiswap"}</title>
				<meta
					name="description"
					content="Muudiswap - a decentralized exchange platform"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/muudiswap__favicon.svg" />
			</Head>

			<Swapper tokens={tkns.tokens} />
		</main>
	)
}
