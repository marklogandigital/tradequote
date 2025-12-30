'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Quote {
  id: string
  client_name: string
  job_name: string
  total_cost: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setIsCheckingAuth(false)
      fetchQuotes()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }

  const fetchQuotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('quotes')
        .select('id, client_name, job_name, total_cost, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching quotes:', error)
        return
      }

      setQuotes(data || [])
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        alert(error.message)
        return
      }
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Quotes
            </h1>
            <p className="text-gray-600">View and manage all your quotes</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <Link
              href="/quote"
              className="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              New Quote
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-block px-6 py-4 bg-white text-gray-900 text-base font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quotes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first quote.
              </p>
              <Link
                href="/quote"
                className="inline-block px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
              >
                Create a quote
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quote/${quote.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {quote.job_name}
                      </h3>
                      <p className="text-gray-600 mb-2">{quote.client_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(quote.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(quote.total_cost)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

