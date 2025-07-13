import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import '@mysten/dapp-kit/dist/index.css';

import { SuiProvider } from "./provider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CertiSui - Decentralized Document Management",
  description: "Secure document storage, sharing, and verification on the blockchain",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SuiProvider>
          {children}
        </SuiProvider>
      </body>
    </html>
  )
}
