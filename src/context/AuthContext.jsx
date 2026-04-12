import { createContext, useContext, useState } from 'react'

const LOGIN_PASSWORD = 'Data@1234'
const ADMIN_KEY = '8f3c1f4f2f9c7f0d8f6d3c8a4e7b1a2c9d4e6f8a1b3c5d7e9f0a2b4c6d8e1f3'
const STORAGE_KEY = 'bbt_admin_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  function login(password) {
    if (password === LOGIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, adminKey: ADMIN_KEY }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
