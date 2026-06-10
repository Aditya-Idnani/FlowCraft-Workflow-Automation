"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type AuthUser = {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  provider: string | null
}

type AuthContextType = {
  session: Session | null
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  updateUser: (updates: Partial<Pick<AuthUser, "name" | "avatar">>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null

  return {
    id: user.id,
    email: user.email ?? null,
    name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      null,
    avatar:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
      null,
    provider: user.app_metadata?.provider ?? null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setUser(toAuthUser(data.session?.user ?? null))
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(toAuthUser(nextSession?.user ?? null))
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const updateUser = async (updates: Partial<Pick<AuthUser, "name" | "avatar">>) => {
    if (!supabase || !session?.user) return

    const currentMeta = session.user.user_metadata ?? {}
    const nextMeta = {
      ...currentMeta,
      ...(updates.name !== undefined ? { full_name: updates.name, name: updates.name } : {}),
      ...(updates.avatar !== undefined ? { avatar_url: updates.avatar } : {}),
    }

    const { data, error } = await supabase.auth.updateUser({
      data: nextMeta,
    })

    if (error || !data.user) {
      return
    }

    setUser(toAuthUser(data.user))
  }

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = "/login"
  }

  const value = useMemo(
    () => ({
      session,
      token: session?.access_token ?? null,
      user,
      isAuthenticated: Boolean(session?.user),
      isLoading,
      logout,
      updateUser,
    }),
    [session, user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
