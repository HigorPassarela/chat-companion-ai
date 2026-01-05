import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Profile, AuthUser } from '@/lib/supabase'

interface AuthContextType {
    user: AuthUser | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, username?: string, full_name?: string) => Promise<{ error: AuthError | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<{ error: AuthError | null }>
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}

export const useAuthProvider = () => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    
}
