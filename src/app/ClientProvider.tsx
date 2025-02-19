'use client'

import { useEffect } from "react"
import initializeDatabase from "@/lib/db-init"

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializeDatabase()
        if (!success) {
          console.error('Failed to initialize database')
        }
      } catch (err) {
        console.error('Error during database initialization:', err)
      }
    }

    init()
  }, [])

  return children
}
