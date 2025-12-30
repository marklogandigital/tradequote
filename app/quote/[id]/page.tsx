'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Quote {
  id: string
  client_name: string
  job_name: string
  notes: string | null
  labour_hours: number
  labour_rate: number
  labour_cost: number
  materials_total: number
  total_cost: number
  created_at: string
}

interface QuoteItem {
  id: string
  material_name: string
  quantity: number
  unit: string
  price_per_unit: number
  line_total: number
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

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
      if (params.id) {
        fetchQuote(params.id as string)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    }
  }

  const fetchQuote = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch quote
      const { data, error } = await supabase
        .from('quotes')
        .select('id, client_name, job_name, notes, labour_hours, labour_rate, labour_cost, materials_total, total_cost, created_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching quote:', error)
        setError('Quote not found')
        setIsLoading(false)
        return
      }

      setQuote(data)

      // Fetch quote items
      const { data: itemsData, error: itemsError } = await supabase
        .from('quote_items')
        .select('id, material_name, quantity, unit, price_per_unit, line_total')
        .eq('quote_id', id)
        .order('material_name', { ascending: true })

      if (itemsError) {
        console.error('Error fetching quote items:', itemsError)
        // Continue anyway - quote is loaded
      } else {
        setQuoteItems(itemsData || [])
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      setError('Failed to load quote')
    } finally {
      setIsLoading(false)
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
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const handleDelete = async () => {
    if (!quote) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this quote? This cannot be undone.'
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Delete the quote (quote_items will be cascade deleted)
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quote.id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting quote:', deleteError)
        alert('Failed to delete quote. Please try again.')
        setIsDeleting(false)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('Failed to delete quote. Please try again.')
      setIsDeleting(false)
    }
  }

  if (isCheckingAuth || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading quote...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !quote) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Back to dashboard
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">{error || 'Quote not found'}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-0">
            Quote Details
          </h1>
          <div className="flex gap-3">
            <Link
              href={`/quote/${params.id}/edit`}
              className="inline-block px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              Edit Quote
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-block px-6 py-3 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Quote'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">
          {/* Quote Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quote Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Client Name
                </p>
                <p className="text-lg text-gray-900">{quote.client_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Job Name
                </p>
                <p className="text-lg text-gray-900">{quote.job_name}</p>
              </div>
              {quote.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Notes
                  </p>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Date Created
                </p>
                <p className="text-lg text-gray-900">{formatDate(quote.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Labour Section */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Labour
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Hours</p>
                  <p className="text-lg text-gray-900">
                    {quote.labour_hours.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Hourly Rate</p>
                  <p className="text-lg text-gray-900">
                    {formatCurrency(quote.labour_rate)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-gray-600">Labour cost</span>
                <span className="text-lg font-medium text-gray-900">
                  {formatCurrency(quote.labour_cost)}
                </span>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Materials
            </h2>
            {quoteItems.length === 0 ? (
              <p className="text-gray-600">No materials added to this quote.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Material</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Unit</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Price/Unit</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">{item.material_name}</td>
                          <td className="py-3 px-4 text-right text-gray-900">{item.quantity.toFixed(2)}</td>
                          <td className="py-3 px-4 text-gray-600">{item.unit}</td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {formatCurrency(item.price_per_unit)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            {formatCurrency(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Materials subtotal</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(quote.materials_total)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Total Section */}
          <div className="pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Total
            </h2>
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Labour cost</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formatCurrency(quote.labour_cost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Materials total</span>
                  <span className="text-lg font-medium text-gray-900">
                    {formatCurrency(quote.materials_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                  <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(quote.total_cost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
