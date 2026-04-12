import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'bbt_theme'

function readTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readTheme)
  const dark = theme === 'dark'

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = dark ? 'dark' : 'light'

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage errors.
    }
  }, [dark, theme])

  function toggle() {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
