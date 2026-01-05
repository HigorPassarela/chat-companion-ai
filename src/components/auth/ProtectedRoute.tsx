import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from './AuthModal'
import { useState, useEffect } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true)
    } else if (user) {
      setShowAuthModal(false)
    }
  }, [user, loading])

  // Loading inicial
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    return (
      <>
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">OllamaCode</h1>
            <p className="text-muted-foreground mb-6">
              Sua IA assistente para programação. Entre ou crie uma conta para começar.
            </p>
            
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Entrar / Criar Conta
            </button>
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    )
  }

  // Usuário autenticado
  return <>{children}</>
}