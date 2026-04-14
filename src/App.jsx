import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import RenewAccess from './pages/RenewAccess'
import Flags from './pages/Flags'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="renew-access" element={<RenewAccess />} />
        <Route path="flags" element={<Flags />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ThemedToaster() {
  const { dark } = useTheme()
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: dark
          ? { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' }
          : { background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' },
        success: { iconTheme: { primary: '#10b981', secondary: dark ? '#f9fafb' : '#111827' } },
        error: { iconTheme: { primary: '#ef4444', secondary: dark ? '#f9fafb' : '#111827' } },
      }}
    />
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ThemedToaster />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
