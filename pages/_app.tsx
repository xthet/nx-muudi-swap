import "@/styles/globals.sass"
import type { AppProps } from "next/app"
import Layout from "./Layout"
import { ConnectionProvider } from "@/contexts/connection"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConnectionProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConnectionProvider>
  )
}
