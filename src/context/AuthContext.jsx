import { createContext, useContext, useState } from 'react'

const LOGIN_PASSWORD = 'Data@1234'
const ADMIN_KEY = 'a3a47c8879f69bf0b5b804f964b40acff516fcfe8689633f88f94e3be2b46095'
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
