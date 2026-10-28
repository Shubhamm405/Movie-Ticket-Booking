import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext(null)

const API_URL =
  import.meta.env.VITE_API_URL || 'https://cinebook-backend-92ez.onrender.com'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cinebook_token') || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinebook_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Verify token on initial load
  useEffect(() => {
    let active = true

    async function verifyToken() {
      if (!token) {
        setCheckingAuth(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Session expired')
        }

        const data = await response.json()
        if (active) {
          const verifiedUser = {
            id: data._id || data.id,
            name: data.name,
            email: data.email,
            role: data.role || 'user',
          }
          setUser(verifiedUser)
          localStorage.setItem('cinebook_user', JSON.stringify(verifiedUser))
        }
      } catch (err) {
        if (active) {
          console.warn('Auth token verification failed:', err.message)
          logout()
        }
      } finally {
        if (active) setCheckingAuth(false)
      }
    }

    verifyToken()

    return () => {
      active = false
    }
  }, [token])

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed. Please check your credentials.',
        }
      }

      const loggedUser = {
        id: data.user?.id || data.user?._id,
        name: data.user?.name || 'CineBook User',
        email: data.user?.email || email,
        role: data.user?.role || 'user',
      }

      setToken(data.token)
      setUser(loggedUser)
      localStorage.setItem('cinebook_token', data.token)
      localStorage.setItem('cinebook_user', JSON.stringify(loggedUser))
      closeAuthModal()

      return { success: true, user: loggedUser }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Could not connect to authentication server.',
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed.',
        }
      }

      // Automatically log the user in after registration
      return await login(email, password)
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Could not connect to registration server.',
      }
    }
  }

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('cinebook_token')
    localStorage.removeItem('cinebook_user')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        checkingAuth,
        authModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        apiUrl: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
