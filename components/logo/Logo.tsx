import Link from "next/link"

interface logoprops{
  className: string
}

export default function Logo({ className }: logoprops) {
  return (
    <Link href="/">
      <div className={className}>
        <img src="/assets/muudiswap_logo.svg" alt="logo" />
        <p>{"muudiswap"}</p>
      </div>
    </Link>
  )
}