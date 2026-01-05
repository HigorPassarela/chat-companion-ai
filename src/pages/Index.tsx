import { useEffect, useRef, useState, useCallback } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Sidebar } from "@/components/chat/Sidebar";
import { SidebarToggle } from "@/components/chat/SidebarToggle";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, WifiOff, Sparkles, AlertTriangle, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 🔥 LÓGICA DE AUTENTICAÇÃO NO INÍCIO
  // Se está carregando
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground mb-4">Carregando autenticação...</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clique aqui se demorar muito
          </button>
        </div>
      </div>
    )
  }

  // Se não está autenticado
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
              Entre ou crie uma conta para começar.
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

  // 🔥 RESTO DO CÓDIGO QUANDO AUTENTICADO
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 1024;
    return true;
  });

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    newConversation,
    removeConversation,
    renameConversation,
    loadConversations,
    loading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

  const {
    settings,
    loading: settingsLoading,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    currentConversationId: chatConversationId,
    setCurrentConversationId: setChatConversationId,
  } = useChat(currentConversationId || undefined);

  const { online } = useBackendStatus();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Função de logout
  const handleLogout = useCallback(async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
    }
  }, [signOut]);

  // sync conversation id between hooks
  useEffect(() => {
    if (setChatConversationId) setChatConversationId(currentConversationId);
  }, [currentConversationId, setChatConversationId]);

  // responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((s) => !s);
      }
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      if (e.key === "Escape" && showSettings) {
        setShowSettings(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setShowDebugPanel((s) => !s);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, showSettings]);

  // autoscroll per settings
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, settings.autoScroll]);

  // reload conversations after sending messages
  useEffect(() => {
    if (!isTyping && messages.length > 0 && loadConversations) loadConversations();
  }, [isTyping, messages.length, loadConversations]);

  const suggestions = [
    "Explique o que é React Hooks",
    "Como fazer uma API REST em Python?",
    "Diferença entre let, const e var",
    "O que é TypeScript?",
  ];

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      try {
        if (!currentConversationId) {
          const newId = await newConversation();
          if (newId) setCurrentConversationId(newId);
          else return;
        }
        sendMessage(suggestion);
        if (window.innerWidth < 1024) setSidebarOpen(false);
      } catch (err) {
        console.error("Erro ao processar sugestão:", err);
      }
    },
    [currentConversationId, newConversation, setCurrentConversationId, sendMessage]
  );

  const handleNewConversation = useCallback(async () => {
    try {
      const newId = await newConversation();
      if (newId) setCurrentConversationId(newId);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (err) {
      console.error("Erro ao criar nova conversa:", err);
    }
  }, [newConversation, setCurrentConversationId]);

  const handleSelectConversation = useCallback(
    (id: number) => {
      setCurrentConversationId(id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    },
    [setCurrentConversationId]
  );

  const handleDeleteConversation = useCallback(
    (id: number) => {
      if (window.confirm("Tem certeza que deseja deletar esta conversa?")) {
        removeConversation(id);
      }
    },
    [removeConversation]
  );

  const handleRenameConversation = useCallback(
    (id: number, newTitle: string) => {
      renameConversation(id, newTitle);
    },
    [renameConversation]
  );

  const handleClearChat = useCallback(() => {
    if (currentConversationId) {
      if (window.confirm("Deseja deletar a conversa atual?")) {
        removeConversation(currentConversationId);
        setCurrentConversationId(null);
      }
    }
  }, [currentConversationId, removeConversation]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((s) => !s);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleRetryConnection = useCallback(() => {
    if (loadConversations) loadConversations();
  }, [loadConversations]);

  return (
    <div className="h-screen bg-background flex relative overflow-hidden">
      <SidebarToggle isOpen={sidebarOpen} onToggle={handleToggleSidebar} />

      <Sidebar
        conversations={Array.isArray(conversations) ? conversations : []}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenSettings={handleOpenSettings}
        username={user?.profile?.username || user?.email || 'Usuário'}
        userAvatar={user?.profile?.avatar_url}
        loading={conversationsLoading}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          "w-full lg:w-auto min-w-0 h-full"
        )}
      >
        <div className="flex-shrink-0">
          {/* Header com info do usuário */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Logado como: <span className="font-medium text-foreground">{user?.profile?.username || user?.email}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>

          <ChatHeader
            online={online}
            onClearChat={handleClearChat}
            messageCount={messages.length}
          />

          {!online && (
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 text-center py-2.5 text-sm flex items-center justify-center gap-2 animate-pulse">
              <WifiOff className="w-4 h-4" />
              <span className="font-medium">Servidor offline - Tentando reconectar...</span>
            </div>
          )}

          {conversationsError && (
            <div className="bg-red-500/10 border-b border-red-500/20 text-red-600 text-center py-2.5 text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Erro ao carregar conversas: {conversationsError}</span>
              <button
                onClick={handleRetryConnection}
                className="ml-2 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="h-full max-w-3xl mx-auto flex flex-col min-h-0">
            <div
              ref={messagesContainerRef}
              className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-6 scroll-smooth messages-container",
                settings.fontSize === "small" && "text-sm",
                settings.fontSize === "large" && "text-lg"
              )}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-3 h-3 text-accent-foreground" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Olá, {user?.profile?.username || user?.email?.split('@')[0]}! 
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mb-8 px-4">
                    {online
                      ? "Estou aqui para ajudar com programação, explicar conceitos e analisar código. Como posso ajudar você hoje?"
                      : "Aguardando conexão com o servidor para começar..."}
                  </p>

                  {online && !conversationsError && (
                    <div className="w-full max-w-md space-y-3 px-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Sugestões para começar
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(s)}
                            disabled={isTyping || conversationsLoading}
                            className="group px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-left text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md"
                          >
                            <span className="block truncate group-hover:text-primary transition-colors">{s}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 text-xs text-muted-foreground/70 flex items-center gap-2 flex-wrap justify-center">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">Ctrl</kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">B</kbd>
                    </div>
                    <span>para abrir/fechar o menu</span>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id || index}
                      content={message.content}
                      role={message.role}
                      imageUrl={message.imageUrl}
                      files={message.files}
                      isNew={index === messages.length - 1}
                    />
                  ))}

                  {isTyping && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
        </main>

        <div className="flex-shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ChatInput onSend={sendMessage} disabled={isTyping || !online || !!conversationsError} />

            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>OllamaCode pode cometer erros. Verifique informações importantes.</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
            </p>
          </div>
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => setShowDebugPanel((s) => !s)}
          className={cn(
            "fixed bottom-4 left-4 z-[99] w-10 h-10 rounded-full bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 text-white text-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95",
            showDebugPanel && "bg-primary/80 border-primary"
          )}
          title={`${showDebugPanel ? "Ocultar" : "Mostrar"} painel de debug (Ctrl+Shift+D)`}
        >
          {showDebugPanel ? "🐛" : "👤"}
        </button>
      )}

      {showDebugPanel && (
        <div className="fixed bottom-4 right-4 z-[100] bg-black/95 text-white px-4 py-3 rounded-lg text-xs font-mono shadow-2xl border border-primary/50 backdrop-blur-sm">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-white/20">
              <span className="text-primary font-bold">🐛 DEBUG PANEL</span>
              <button onClick={() => setShowDebugPanel(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-gray-400">Usuário:</span>
              <span className="text-green-400">{user?.email || 'Não logado'}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> <span className="sm:hidden">XS (&lt;640px)</span></div>

            <div className="flex items-center gap-2 text-[10px]"><span className="text-gray-400">Sidebar:</span><span className={sidebarOpen ? "text-green-400" : "text-red-400"}>{sidebarOpen ? "Aberta" : "Fechada"}</span></div>

            <div className="flex items-center gap-2 text-[10px]"><span className="text-gray-400">Conversas:</span><span className={conversationsError ? "text-red-400" : conversationsLoading ? "text-yellow-400" : conversations?.length > 0 ? "text-green-400" : "text-gray-400"}>{conversationsLoading ? "⏳ Carregando..." : conversationsError ? "❌ Erro" : `${conversations?.length || 0}`}</span></div>

            <div className="flex items-center gap-2 text-[10px]"><span className="text-gray-400">Backend:</span><span className={online ? "text-green-400" : "text-red-400"}>{online ? "Online" : "Offline"}</span></div>

            <div className="flex items-center gap-2 text-[10px]"><span className="text-gray-400">Atual:</span><span className="text-blue-400">{currentConversationId ? `#${currentConversationId}` : "Nenhuma"}</span></div>

            <div className="text-[10px] text-gray-400">{typeof window !== "undefined" && `${window.innerWidth}px × ${window.innerHeight}px`}</div>

            <div className="text-[9px] text-gray-500 pt-1 border-t border-white/10 space-y-0.5"><div><kbd className="px-1 bg-white/10 rounded">Ctrl+B</kbd> Toggle Sidebar</div><div><kbd className="px-1 bg-white/10 rounded">Ctrl+Shift+D</kbd> Toggle Debug</div></div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        onExportSettings={exportSettings}
        onImportSettings={importSettings}
      />
    </div>
  );
};

export default Index;