import { useEffect, useRef, useState, useCallback } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Sidebar } from "@/components/chat/Sidebar";
import { SidebarToggle } from "@/components/chat/SidebarToggle";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { MessageSquare, WifiOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  // 📱 Sidebar responsivo: fecha no mobile, abre no desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    newConversation,
    removeConversation,
    renameConversation,
    loadConversations,
    loading: conversationsLoading,
  } = useConversations();

  // 🐛 DEBUG - Log das conversas
  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏠 INDEX.TSX - Estado das Conversas:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Conversas:", conversations);
    console.log("📊 Tipo:", typeof conversations);
    console.log("📊 É Array?", Array.isArray(conversations));
    console.log("📊 Quantidade:", conversations?.length || 0);
    console.log("📊 Loading:", conversationsLoading);
    console.log("📊 Current ID:", currentConversationId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (conversations && conversations.length > 0) {
      console.log("✅ Primeira conversa:", conversations[0]);
    } else {
      console.log("❌ Nenhuma conversa encontrada!");
    }
  }, [conversations, conversationsLoading, currentConversationId]);

  const {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    setCurrentConversationId: setChatConversationId,
  } = useChat(currentConversationId || undefined);

  const { online } = useBackendStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 🔄 Sincronizar IDs entre hooks
  useEffect(() => {
    setChatConversationId(currentConversationId);
  }, [currentConversationId, setChatConversationId]);

  // 📱 Ajustar sidebar ao redimensionar janela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Desktop: aberto
      } else {
        setSidebarOpen(false); // Mobile: fechado
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ⌨️ Atalho de teclado: Ctrl/Cmd + B para toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // ESC para fechar sidebar no mobile
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  // 📜 Auto-scroll suave para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 🔄 Recarregar conversas após enviar mensagem
  useEffect(() => {
    if (!isTyping && messages.length > 0) {
      loadConversations();
    }
  }, [isTyping, messages.length, loadConversations]);

  // 💡 Sugestões de prompt para começar
  const suggestions = [
    "Explique o que é React Hooks",
    "Como fazer uma API REST em Python?",
    "Diferença entre let, const e var",
    "O que é TypeScript?",
  ];

  // 🎯 Handlers otimizados com useCallback
  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      console.log("💡 Sugestão clicada:", suggestion);
      
      // Criar nova conversa se não houver uma selecionada
      if (!currentConversationId) {
        console.log("➕ Criando nova conversa...");
        const newId = await newConversation();
        if (newId) {
          console.log("✅ Nova conversa criada com ID:", newId);
          setCurrentConversationId(newId);
        }
      }
      sendMessage(suggestion);

      // Fechar sidebar no mobile após selecionar sugestão
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    [currentConversationId, newConversation, setCurrentConversationId, sendMessage]
  );

  const handleNewConversation = useCallback(async () => {
    console.log("🆕 Botão New Chat clicado");
    const newId = await newConversation();
    if (newId) {
      console.log("✅ Nova conversa criada com ID:", newId);
      setCurrentConversationId(newId);
    } else {
      console.log("❌ Falha ao criar nova conversa");
    }

    // Fechar sidebar no mobile após criar conversa
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [newConversation, setCurrentConversationId]);

  const handleSelectConversation = useCallback(
    (id: number) => {
      console.log("📌 Conversa selecionada:", id);
      setCurrentConversationId(id);

      // Fechar sidebar no mobile após selecionar conversa
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    [setCurrentConversationId]
  );

  const handleClearChat = useCallback(() => {
    if (
      currentConversationId &&
      window.confirm("Tem certeza que deseja deletar esta conversa?")
    ) {
      console.log("🗑️ Deletando conversa:", currentConversationId);
      removeConversation(currentConversationId);
    }
  }, [currentConversationId, removeConversation]);

  const handleToggleSidebar = useCallback(() => {
    console.log("🔄 Toggle sidebar:", !sidebarOpen);
    setSidebarOpen((prev) => !prev);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* 🔘 Botão toggle - Posiciona corretamente */}
      <SidebarToggle isOpen={sidebarOpen} onToggle={handleToggleSidebar} />

      {/* 📂 Sidebar */}
      <Sidebar
        conversations={conversations || []}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={removeConversation}
        onRenameConversation={renameConversation}
        loading={conversationsLoading}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 📱 Área principal - Ajusta margem conforme sidebar */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          "w-full lg:w-auto min-w-0"
        )}
      >
        {/* 🎯 Header com contador e botão de limpar */}
        <ChatHeader
          online={online}
          onClearChat={handleClearChat}
          messageCount={messages.length}
        />

        {/* ⚠️ Alerta de conexão offline */}
        {!online && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-center py-2.5 text-sm flex items-center justify-center gap-2 animate-pulse">
            <WifiOff className="w-4 h-4" />
            <span className="font-medium">
              Servidor offline - Tentando reconectar...
            </span>
          </div>
        )}

        {/* 💬 Área principal de mensagens */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-3xl mx-auto flex flex-col">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
            >
              {messages.length === 0 ? (
                /* 🌟 Estado vazio - Tela inicial */
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                  {/* Ícone principal */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-3 h-3 text-accent-foreground" />
                    </div>
                  </div>

                  {/* Título e descrição */}
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Olá! Sou a OllamaCode
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mb-8 px-4">
                    {online
                      ? "Estou aqui para ajudar com programação, explicar conceitos e analisar código. Como posso ajudar você hoje?"
                      : "Aguardando conexão com o servidor para começar..."}
                  </p>

                  {/* 💡 Sugestões de prompts */}
                  {online && (
                    <div className="w-full max-w-md space-y-3 px-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Sugestões para começar
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isTyping}
                            className="group px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-left text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md"
                          >
                            <span className="block truncate group-hover:text-primary transition-colors">
                              {suggestion}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 💡 Dica do atalho de teclado */}
                  <div className="mt-8 text-xs text-muted-foreground/70 flex items-center gap-2 flex-wrap justify-center">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">
                        Ctrl
                      </kbd>
                      <span>+</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">
                        B
                      </kbd>
                    </div>
                    <span>para abrir/fechar o menu</span>
                  </div>
                </div>
              ) : (
                /* 📝 Lista de mensagens */
                <>
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      content={message.content}
                      role={message.role}
                      imageUrl={message.imageUrl}
                      isNew={index === messages.length - 1}
                    />
                  ))}

                  {/* ⏳ Indicador de digitação */}
                  {isTyping && <TypingIndicator />}

                  {/* 📍 Referência para scroll automático */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>
        </main>

        {/* 📝 Footer fixo com input */}
        <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ChatInput onSend={sendMessage} disabled={isTyping || !online} />

            {/* ⚠️ Aviso legal */}
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>
                OllamaCode pode cometer erros. Verifique informações
                importantes.
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
            </p>
          </div>
        </footer>
      </div>

      {/* 🐛 DEBUG - Indicador de Breakpoint (Remover em produção) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-[100] bg-black/90 text-white px-4 py-3 rounded-lg text-xs font-mono shadow-2xl border border-primary/30">
          <div className="space-y-1.5">
            {/* Indicador de Breakpoint */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="sm:hidden">XS (&lt;640px)</span>
              <span className="hidden sm:inline md:hidden">SM (≥640px)</span>
              <span className="hidden md:inline lg:hidden">MD (≥768px)</span>
              <span className="hidden lg:inline xl:hidden">LG (≥1024px)</span>
              <span className="hidden xl:inline 2xl:hidden">
                XL (≥1280px)
              </span>
              <span className="hidden 2xl:inline">2XL (≥1536px)</span>
            </div>

            {/* Status do Sidebar */}
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-gray-400">Sidebar:</span>
              <span className={sidebarOpen ? "text-green-400" : "text-red-400"}>
                {sidebarOpen ? "✅ Aberta" : "❌ Fechada"}
              </span>
            </div>

            {/* 🆕 ADICIONE: Contador de conversas */}
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-gray-400">Conversas:</span>
              <span className="text-blue-400">
                {conversations?.length || 0}
              </span>
            </div>

            {/* Largura da janela */}
            <div className="text-[10px] text-gray-400">
              {typeof window !== "undefined" &&
                `${window.innerWidth}px × ${window.innerHeight}px`}
            </div>

            {/* Dica de atalho */}
            <div className="text-[9px] text-gray-500 pt-1 border-t border-white/10">
              Pressione{" "}
              <kbd className="px-1 bg-white/10 rounded">Ctrl+B</kbd> para
              toggle
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;