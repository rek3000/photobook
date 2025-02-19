'use client'

import { useEffect } from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
  }, [])

  return <>{children}</>
}
