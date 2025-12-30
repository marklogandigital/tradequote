'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsLoggedIn(false)
    }
  }

  if (isLoggedIn === null) {
    return (
      <main className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">
            TradeQuote
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            Quick quotes for trades
          </p>
          <div className="pt-8 space-y-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-block px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

