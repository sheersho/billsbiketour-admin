import { useEffect, useState } from 'react'
import { Users, UserCheck, Activity, RefreshCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchUsers } from '../api/users'

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    indigo: 'bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 ring-indigo-500/30',
    green: 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30',
    amber: 'bg-amber-600/15 text-amber-600 dark:text-amber-400 ring-amber-500/30',
  }
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

const statusStyles = {
  active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30',
  expired: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25',
  unpaid: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-red-500/25',
}

function ActivityRow({ session: s }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0 text-indigo-500 dark:text-indigo-400 font-semibold text-xs">
        {(s.email ?? '?')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.email ?? '—'}</p>
        <p className="text-xs text-gray-500">started {s.created_at.slice(0, 10)}</p>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusStyles[s.status] ?? statusStyles.expired}`}>
        {s.status}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const { adminKey } = useAuth()
  const [sessions, setSessions] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers(adminKey)
      .then(data => {
        setSessions(data.sessions ?? [])
        setTotal(data.total)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const activeCount = sessions.filter(s => s.status === 'active').length
  const expiredCount = sessions.filter(s => s.status === 'expired').length
  const unpaidCount = sessions.filter(s => s.status === 'unpaid').length
  const recent = sessions.slice(0, 6)

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your bike tour platform</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} label="Total Sessions" value={loading ? null : total} color="indigo" />
        <StatCard icon={UserCheck} label="Active" value={loading ? null : activeCount} color="green" />
        <StatCard icon={Activity} label="Expired / Unpaid" value={loading ? null : expiredCount + unpaidCount} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent users */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 dark:text-white font-semibold">Recent Users</h2>
            <Link to="/users" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-sm transition">
              View all →
            </Link>
          </div>
          <div>
            {loading ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm py-4">Loading...</p>
            ) : recent.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm py-4">No users yet</p>
            ) : (
              recent.map(s => <ActivityRow key={s.session_id} session={s} />)
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h2 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/renew-access"
              className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl transition group"
            >
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-600/30 transition">
                <RefreshCcw className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">Renew Access</p>
                <p className="text-gray-500 text-xs">Send new JWT token</p>
              </div>
            </Link>
            <Link
              to="/users"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition group"
            >
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">Manage Users</p>
                <p className="text-gray-500 text-xs">View & filter all users</p>
              </div>
            </Link>
          </div>

          {(expiredCount + unpaidCount) > 0 && !loading && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/25 rounded-xl">
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                {expiredCount + unpaidCount} session{expiredCount + unpaidCount > 1 ? 's' : ''} need attention
              </p>
              <p className="text-amber-600 dark:text-amber-600 text-xs mt-0.5">{expiredCount} expired · {unpaidCount} unpaid</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
