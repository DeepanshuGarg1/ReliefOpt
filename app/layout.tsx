import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import {InitialLoader} from "./providers/InitialLoader";
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'ReliefOpt - Disaster Resource Allocation Engine',
  description: 'ML-Driven Disaster Resource Allocation and Command Center Platform',
}

export const viewport: Viewport = {
  themeColor: '#064e3b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <InitialLoader>{children}</InitialLoader>
      </body>
    </html>
  )
}
