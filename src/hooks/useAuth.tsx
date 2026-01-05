// hooks/useAuth.tsx
import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from "react";
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Profile, AuthUser } from '@/lib/supabase'

interface AuthContextType {
    user: AuthUser | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, username?: string, full_name?: string) => Promise<{ error: AuthError | null }>
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
    signOut: () => Promise<{ error: AuthError | null }>
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<any>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}

export const useAuthProvider = (): AuthContextType => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    
    // 🔥 CONTADOR DE RENDERS
    const renderCount = useRef(0)
    renderCount.current++
    console.log('🔄 [useAuthProvider] Render #', renderCount.current)

    const loadUserProfile = async (authUser: User): Promise<void> => {
        try {
            console.log('[Auth] 👤 === INÍCIO loadUserProfile ===')
            console.log('[Auth] 👤 ID do usuário:', authUser.id)
            console.log('[Auth] 📧 Email do usuário:', authUser.email)
            console.log('[Auth] 📅 Email confirmado:', authUser.email_confirmed_at)
            console.log('[Auth] 🕐 Created at:', authUser.created_at)
    
            // 🔥 QUERY COM LOGS DETALHADOS - USAR let EM VEZ DE const
            console.log('[Auth] 📡 Fazendo query na tabela profiles...')
            
            const queryStart = Date.now()
            let { data: profile, error } = await supabase // 🔥 MUDANÇA: let em vez de const
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single()
            const queryTime = Date.now() - queryStart
    
            console.log('[Auth] ⏱️ Query executada em:', queryTime, 'ms')
            console.log('[Auth] 📊 Resultado da query:', { 
                profile: profile ? 'ENCONTRADO' : 'NULL', 
                error: error ? error.code : 'NENHUM',
                profileData: profile
            })
    
            if (error) {
                console.error('[Auth] ❌ Erro na query profiles:', error)
                console.log('[Auth] 🔍 Detalhes do erro:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                
                if (error.code === 'PGRST116') {
                    console.log('[Auth] 🔧 Perfil não encontrado (PGRST116), tentando criar...')
                    
                    // Tentar criar o perfil
                    const createStart = Date.now()
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authUser.id,
                            email: authUser.email!,
                            username: authUser.email!.split('@')[0],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select()
                        .single()
                    const createTime = Date.now() - createStart
    
                    console.log('[Auth] ⏱️ Criação executada em:', createTime, 'ms')
                    console.log('[Auth] 🆕 Resultado da criação:', { 
                        newProfile: newProfile ? 'CRIADO' : 'NULL',
                        createError: createError ? createError.code : 'NENHUM',
                        profileData: newProfile
                    })
    
                    if (createError) {
                        console.error('[Auth] ❌ Erro ao criar perfil:', createError)
                        console.log('[Auth] 🔍 Detalhes do erro de criação:', {
                            code: createError.code,
                            message: createError.message,
                            details: createError.details
                        })
                    } else {
                        console.log('[Auth] ✅ Perfil criado com sucesso!')
                        // 🔥 CORREÇÃO: Agora profile pode ser reatribuído
                        profile = newProfile
                        error = null // Limpar o erro também
                        console.log('[Auth] ✅ Usando perfil recém-criado')
                    }
                }
            }
    
            console.log('[Auth] 🏗️ Construindo userData...')
            const userData: AuthUser = {
                id: authUser.id,
                email: authUser.email!,
                profile: profile || undefined
            }
    
            console.log('[Auth] 📝 Definindo usuário no estado...')
            console.log('[Auth] 👤 UserData final:', {
                id: userData.id,
                email: userData.email,
                hasProfile: !!userData.profile,
                profileUsername: userData.profile?.username
            })
            
            setUser(userData)
            console.log('[Auth] ✅ setUser chamado com sucesso')
    
        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado ao carregar perfil:', error)
            console.log('[Auth] 🔍 Stack trace:', error instanceof Error ? error.stack : 'N/A')
            
            // Criar usuário básico mesmo com erro
            const basicUser = {
                id: authUser.id,
                email: authUser.email!,
                profile: undefined
            }
            
            console.log('[Auth] 🔧 Criando usuário básico:', basicUser)
            setUser(basicUser)
            console.log('[Auth] ✅ setUser (básico) chamado')
            
        } finally {
            console.log('[Auth] 🏁 === FIM loadUserProfile ===')
            console.log('[Auth] 🛑 Chamando setLoading(false)...')
            setLoading(false)
            console.log('[Auth] ✅ setLoading(false) executado')
        }
    }

    const refreshUser = async (): Promise<void> => {
        console.log('[Auth] 🔄 refreshUser chamado')
        if (session?.user) {
            console.log('[Auth] 🔄 Sessão existe, recarregando perfil...')
            await loadUserProfile(session.user)
        } else {
            console.log('[Auth] 🔄 Nenhuma sessão para refresh')
        }
    }

    // 🔥 USEEFFECT COM LOGS DETALHADOS
    useEffect(() => {
        let mounted = true
        console.log('[Auth] 🎬 === INÍCIO useEffect ===')
        console.log('[Auth] 🎬 mounted:', mounted)

        const initialize = async () => {
            try {
                console.log('[Auth] 🚀 === INÍCIO initialize ===')
                console.log('[Auth] 🏃 mounted check:', mounted)
                
                console.log('[Auth] 📡 Chamando supabase.auth.getSession()...')
                const sessionStart = Date.now()
                const { data: { session }, error } = await supabase.auth.getSession()
                const sessionTime = Date.now() - sessionStart
                
                console.log('[Auth] ⏱️ getSession executado em:', sessionTime, 'ms')
                console.log('[Auth] 📡 Resposta getSession:', { 
                    session: session ? 'ENCONTRADA' : 'NULL', 
                    error: error ? error.message : 'NENHUM',
                    userId: session?.user?.id,
                    userEmail: session?.user?.email
                })
                
                if (!mounted) {
                    console.log('[Auth] 🛑 Componente desmontado durante getSession, saindo...')
                    return
                }
                
                if (error) {
                    console.error('[Auth] ❌ Erro na sessão:', error)
                    console.log('[Auth] 🛑 Parando loading devido ao erro')
                    if (mounted) setLoading(false)
                    return
                }

                console.log('[Auth] 📋 Definindo sessão no estado...')
                setSession(session)
                console.log('[Auth] ✅ setSession executado')
                
                if (session?.user) {
                    console.log('[Auth] 👤 Usuário encontrado na sessão, carregando perfil...')
                    console.log('[Auth] 📊 Dados do usuário da sessão:', {
                        id: session.user.id,
                        email: session.user.email,
                        confirmed: session.user.email_confirmed_at ? 'SIM' : 'NÃO'
                    })
                    
                    await loadUserProfile(session.user)
                    console.log('[Auth] ✅ loadUserProfile (initialize) concluído')
                } else {
                    console.log('[Auth] ❌ Nenhum usuário na sessão')
                    console.log('[Auth] 📝 Definindo user como null...')
                    setUser(null)
                    console.log('[Auth] ✅ setUser(null) executado')
                    
                    if (mounted) {
                        console.log('[Auth] 🛑 Parando loading (sem usuário)')
                        setLoading(false)
                        console.log('[Auth] ✅ setLoading(false) executado')
                    }
                }

            } catch (error) {
                console.error('[Auth] 💥 Erro na inicialização:', error)
                console.log('[Auth] 🔍 Stack trace:', error instanceof Error ? error.stack : 'N/A')
                
                if (mounted) {
                    console.log('[Auth] 🧹 Limpando estado devido ao erro...')
                    setUser(null)
                    setSession(null)
                    console.log('[Auth] 🛑 Parando loading devido ao erro')
                    setLoading(false)
                    console.log('[Auth] ✅ Cleanup executado')
                }
            }
            console.log('[Auth] 🏁 === FIM initialize ===')
        }

        console.log('[Auth] 🚀 Chamando initialize()...')
        initialize()

        // Listener de mudanças
        console.log('[Auth] 👂 Configurando onAuthStateChange listener...')
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] 🔄 === INÍCIO onAuthStateChange ===')
                console.log('[Auth] 🔄 Evento recebido:', event)
                console.log('[Auth] 🔄 Sessão no evento:', session ? 'PRESENTE' : 'NULL')
                console.log('[Auth] 🔄 mounted check:', mounted)
                
                if (!mounted) {
                    console.log('[Auth] 🛑 onAuthStateChange: componente desmontado, ignorando evento')
                    return
                }

                console.log('[Auth] 📋 Definindo nova sessão do evento...')
                setSession(session)
                console.log('[Auth] ✅ setSession (evento) executado')
                
                if (event === 'SIGNED_IN' && session?.user) {
                    console.log('[Auth] ✅ === SIGNED_IN DETECTADO ===')
                    console.log('[Auth] 👤 Dados do usuário logado:', {
                        id: session.user.id,
                        email: session.user.email,
                        confirmed: session.user.email_confirmed_at ? 'SIM' : 'NÃO'
                    })
                    await loadUserProfile(session.user)
                    console.log('[Auth] ✅ loadUserProfile (SIGNED_IN) concluído')
                } else if (event === 'SIGNED_OUT') {
                    console.log('[Auth] 👋 === SIGNED_OUT DETECTADO ===')
                    setUser(null)
                    setLoading(false)
                    console.log('[Auth] ✅ Logout processado')
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    console.log('[Auth] 🔄 === TOKEN_REFRESHED DETECTADO ===')
                    await loadUserProfile(session.user)
                    console.log('[Auth] ✅ Token refresh processado')
                } else {
                    console.log('[Auth] 🔄 Evento não mapeado:', event, '- parando loading')
                    setLoading(false)
                    console.log('[Auth] ✅ Loading parado para evento não mapeado')
                }
                
                console.log('[Auth] 🏁 === FIM onAuthStateChange ===')
            }
        )

        console.log('[Auth] ✅ Listener configurado com sucesso')

        return () => {
            console.log('[Auth] 🧹 === CLEANUP useEffect ===')
            console.log('[Auth] 🧹 Definindo mounted = false')
            mounted = false
            console.log('[Auth] 🧹 Cancelando subscription...')
            subscription.unsubscribe()
            console.log('[Auth] ✅ Cleanup concluído')
        }
    }, [])

    const signUp = async (
        email: string,
        password: string,
        username?: string,
        fullName?: string
    ): Promise<{ error: AuthError | null }> => {
        console.log('[Auth] 📝 === INÍCIO signUp ===')
        console.log('[Auth] 📝 Email:', email)
        console.log('[Auth] 📝 Username:', username)
        console.log('[Auth] 📝 FullName:', fullName)

        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: {
                  emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL
                    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
                    : `${window.location.origin}/auth/callback`,
                  data: {
                    username: username || email.split('@')[0],
                    full_name: fullName || ''
                  }
                }
              })

            if (error) {
                console.error('[Auth] ❌ Erro no registro:', error.message)
                console.log('[Auth] 🔍 Detalhes do erro de registro:', error)
            } else {
                console.log('[Auth] ✅ Registro realizado com sucesso')
            }

            return { error }
        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado no registro:', error)
            return { error: error as AuthError }
        }
    }

    const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
        console.log('[Auth] 🔐 === INÍCIO signIn ===')
        console.log('[Auth] 🔐 Email:', email)

        try {
            const loginStart = Date.now()
            const { error, data } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password
            })
            const loginTime = Date.now() - loginStart

            console.log('[Auth] ⏱️ Login executado em:', loginTime, 'ms')
            console.log('[Auth] 📊 Resultado do login:', {
                error: error ? error.message : 'NENHUM',
                user: data.user ? 'PRESENTE' : 'NULL',
                session: data.session ? 'PRESENTE' : 'NULL'
            })

            if (error) {
                console.error('[Auth] ❌ Erro no login:', error.message)
                console.log('[Auth] 🔍 Detalhes do erro de login:', error)
                return { error }
            }

            if (data.user) {
                console.log('[Auth] ✅ Login bem-sucedido para:', data.user.email)
                console.log('[Auth] 👤 Dados do usuário logado:', {
                    id: data.user.id,
                    email: data.user.email,
                    confirmed: data.user.email_confirmed_at ? 'SIM' : 'NÃO'
                })
            }

            console.log('[Auth] 🏁 === FIM signIn ===')
            return { error: null }
        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado no login:', error)
            return { error: error as AuthError }
        }
    }

    const signOut = async (): Promise<{ error: AuthError | null }> => {
        console.log('[Auth] 👋 === INÍCIO signOut ===')

        try {
            const { error } = await supabase.auth.signOut()

            if (error) {
                console.error('[Auth] ❌ Erro no logout:', error.message)
            } else {
                console.log('[Auth] ✅ Logout realizado com sucesso')
                console.log('[Auth] 🧹 Limpando estado local...')
                setUser(null)
                setSession(null)
                console.log('[Auth] ✅ Estado limpo')
            }

            return { error }
        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado no logout:', error)
            return { error: error as AuthError }
        }
    }

    const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
        console.log('[Auth] 📧 === INÍCIO resetPassword ===')
        console.log('[Auth] 📧 Email:', email)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) {
                console.error('[Auth] ❌ Erro no reset:', error.message)
            } else {
                console.log('[Auth] ✅ Email de reset enviado')
            }

            return { error }
        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado no reset:', error)
            return { error: error as AuthError }
        }
    }

    const updateProfile = async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
        console.log('[Auth] 👤 === INÍCIO updateProfile ===')
        console.log('[Auth] 👤 Updates:', updates)

        if (!user) {
            console.log('[Auth] ❌ Usuário não autenticado para update')
            return { error: new Error('Usuário não autenticado') }
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) {
                console.error('[Auth] ❌ Erro ao atualizar perfil:', error)
                throw error
            }

            if (session?.user) {
                console.log('[Auth] 🔄 Recarregando perfil após update...')
                await loadUserProfile(session.user)
            }

            console.log('[Auth] ✅ Perfil atualizado com sucesso')
            return { error: null }

        } catch (error) {
            console.error('[Auth] 💥 Erro inesperado na atualização:', error)
            return { error: error as Error }
        }
    }

    console.log('[Auth] 📊 Estado atual do provider:', {
        user: user ? 'PRESENTE' : 'NULL',
        userEmail: user?.email,
        session: session ? 'PRESENTE' : 'NULL',
        loading
    })

    return {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshUser
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    console.log('🏭 [AuthProvider] === RENDERIZANDO PROVIDER ===')
    const auth = useAuthProvider()
    console.log('🏭 [AuthProvider] Auth state obtido:', {
        loading: auth.loading,
        user: auth.user ? 'PRESENTE' : 'NULL',
        email: auth.user?.email
    })

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export const useRequireAuth = () => {
    const { user, loading } = useAuth()

    return {
        isAuthenticated: !!user,
        isLoading: loading,
        user
    }
}

export const useUser = () => {
    const { user } = useAuth()
    return user
}

export const useProfile = () => {
    const { user } = useAuth()
    return user?.profile || null
}