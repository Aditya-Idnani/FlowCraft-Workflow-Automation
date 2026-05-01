"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type AuthContextType = {
  token: string | null
  user: any
  isAuthenticated: boolean
  login: (token: string, user: any) => void
  logout: () => void
  updateUser: (updates: Partial<any>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Restore from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  // Listen for Supabase auth changes (Google OAuth)
  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const supaUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
            provider: "google",
          }

          localStorage.setItem("token", session.access_token)
          localStorage.setItem("user", JSON.stringify(supaUser))
          setToken(session.access_token)
          setUser(supaUser)
          setIsAuthenticated(true)
        }

        if (event === "SIGNED_OUT") {
          localStorage.clear()
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = (token: string, user: any) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setToken(token)
    setUser(user)
    setIsAuthenticated(true)
  }

  const updateUser = (updates: Partial<any>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const logout = async () => {
    // Sign out from Supabase if connected
    if (supabase) {
      await supabase.auth.signOut()
    }

    localStorage.clear()
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
