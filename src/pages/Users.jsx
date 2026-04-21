import { useState, useEffect } from 'react'
import { Search, RefreshCcw, UserCheck, UserX, RefreshCw, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchUsers } from '../api/users'

const FILTERS = ['all', 'active', 'expired', 'unpaid']

function initials(email) {
  return (email ?? '?')[0].toUpperCase()
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30',
    expired: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25',
    unpaid: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-red-500/25',
  }
  const Icon = status === 'active' ? UserCheck : status === 'unpaid' ? AlertCircle : UserX
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] ?? styles.expired}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}

function formatEntry(entry_point) {
  return entry_point?.replace(/_/g, ' ') ?? '—'
}

export default function Users() {
  const { adminKey } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUsers(adminKey)
      setSessions(data.sessions ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = sessions.filter(s => {
    const matchesSearch = (s.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and view all ride sessions</p>
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Entry</th>
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Stop</th>
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Started</th>
                <th className="text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Expires</th>
                <th className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                    No sessions found
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.session_id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex-shrink-0">
                          {initials(s.email)}
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.email ?? '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-900 dark:text-white capitalize">{formatEntry(s.entry_point)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{s.entry_source?.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {s.current_stop_id ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{s.created_at.slice(0, 10)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {s.unlock_expires_at ? (
                        <>
                          <span>{s.unlock_expires_at.slice(0, 10)}</span>
                          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-600">{s.unlock_expires_at.slice(11, 16)} UTC</span>
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/renew-access"
                        state={{ email: s.email }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 px-3 py-1.5 rounded-lg transition"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Renew
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">No sessions found</div>
          ) : (
            filtered.map(s => (
              <div key={s.session_id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex-shrink-0">
                      {initials(s.email)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.email ?? '—'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{formatEntry(s.entry_point)} · {s.entry_source?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <Link
                    to="/renew-access"
                    state={{ email: s.email }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-600/10 px-2.5 py-1.5 rounded-lg flex-shrink-0"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Renew
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs items-center">
                  <StatusBadge status={s.status} />
                  {s.current_stop_id != null && (
                    <span className="text-gray-500">stop {s.current_stop_id}</span>
                  )}
                  {s.unlock_expires_at && (
                    <span className="text-gray-500">expires {s.unlock_expires_at.slice(0, 10)} <span className="text-gray-400 dark:text-gray-600">{s.unlock_expires_at.slice(11, 16)} UTC</span></span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && (
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-3">{filtered.length} session{filtered.length !== 1 ? 's' : ''} shown</p>
      )}
    </div>
  )
}
