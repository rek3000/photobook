'use client'

import { useEffect } from "react"
import { initializeDatabase } from "@/lib/db-init"
import { initializeStorage } from "@/lib/storage-init"

interface ClientProviderProps {
  children: React.ReactNode
}

export default function ClientProvider({
  children,
}: ClientProviderProps) {
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          initializeDatabase(),
          initializeStorage()
        ])
        console.log('Initialization completed')
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    init()
  }, [])

  return <>{children}</>
}
