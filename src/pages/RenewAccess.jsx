import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RefreshCcw, Mail, CheckCircle, AlertCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const API_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/admin/renew-access`

export default function RenewAccess() {
  const location = useLocation()
  const { adminKey } = useAuth()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { success, message }
  const [history, setHistory] = useState([])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ email: trimmed }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = { message: res.ok ? 'Access renewed successfully.' : 'Request failed.' }
      }

      if (res.ok) {
        const msg = data.message ?? 'Access renewed and email sent successfully.'
        setResult({ success: true, message: msg })
        toast.success('Access renewed!')
        setHistory(prev => [
          { email: trimmed, success: true, time: new Date().toLocaleTimeString(), id: Date.now() },
          ...prev.slice(0, 9),
        ])
        setEmail('')
      } else {
        const msg = data.message ?? data.error ?? `Error ${res.status}: Request failed.`
        setResult({ success: false, message: msg })
        toast.error('Failed to renew access')
        setHistory(prev => [
          { email: trimmed, success: false, time: new Date().toLocaleTimeString(), id: Date.now() },
          ...prev.slice(0, 9),
        ])
      }
    } catch (err) {
      const msg = err.message === 'Failed to fetch'
        ? 'Network error — could not reach the server.'
        : err.message
      setResult({ success: false, message: msg })
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Renew Access</h1>
        <p className="text-gray-500 text-sm mt-1">Send a new JWT token via email for expired tours</p>
      </div>

      {/* Main form card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <RefreshCcw className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Renew Tour Access</h2>
            <p className="text-gray-500 text-xs mt-0.5">A fresh JWT token will be emailed to the user</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              User Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-200 dark:disabled:bg-indigo-900 disabled:text-indigo-400 dark:disabled:text-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Renewal Email
              </>
            )}
          </button>
        </form>

        {/* Result banner */}
        {result && (
          <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border ${
            result.success
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
            )}
            <p className="text-sm">{result.message}</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm">Recent Requests (this session)</h3>
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2.5">
                  {item.success ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${item.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.success ? 'Sent' : 'Failed'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-600">{item.time}</span>
                  <button
                    onClick={() => setEmail(item.email)}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-600 dark:text-gray-400 font-medium">What happens: </span>
          A POST request is sent to the backend with the user's email. The server generates a new JWT token and sends it to the user's inbox, restoring access to their expired tour.
        </p>
      </div>
    </div>
  )
}
