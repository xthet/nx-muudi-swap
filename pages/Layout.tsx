import { Footer, Navbar } from "@/components/exportComps"
import { ReactNode } from "react"

export default function Layout({ children }:{children:ReactNode}) {
  return (
    <main className="p-page">
      <Navbar/>
      <div className="p-full">
        {children}
      </div>
      <Footer/>
    </main>
  )
}
