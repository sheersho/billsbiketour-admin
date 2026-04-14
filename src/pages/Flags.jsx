import { useState, useEffect } from 'react'
import { Flag, CreditCard, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { fetchFlags, updateFlags } from '../api/users'

export default function Flags() {
  const { adminKey } = useAuth()
  const [paymentsEnabled, setPaymentsEnabled] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFlags(adminKey)
        setPaymentsEnabled(data.payments_enabled)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [adminKey])

  async function handleToggle() {
    const next = !paymentsEnabled
    setSaving(true)
    try {
      const data = await updateFlags(adminKey, { payments_enabled: next })
      setPaymentsEnabled(data.payments_enabled)
      toast.success(`Payments ${data.payments_enabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Flags</h1>
        <p className="text-gray-500 text-sm mt-1">Toggle product features on and off</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <Flag className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Flags</h2>
            <p className="text-gray-500 text-xs mt-0.5">Changes take effect immediately</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading flags…</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/25">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between py-4 px-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Payments</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {paymentsEnabled ? 'Payment is required to access the tour' : 'Payment is not required'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={saving}
              aria-pressed={paymentsEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
                paymentsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  paymentsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
