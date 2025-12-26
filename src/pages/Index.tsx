import { useEffect, useRef } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { MessageSquare, WifiOff, Sparkles } from "lucide-react";

const Index = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const { online } = useBackendStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll suave para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Sugestões de prompt para começar
  const suggestions = [
    "Explique o que é React Hooks",
    "Como fazer uma API REST em Python?",
    "Diferença entre let, const e var",
    "O que é TypeScript?",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <ChatHeader online={online} />

      {/* Alerta de conexão offline */}
      {!online && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-center py-2.5 text-sm flex items-center justify-center gap-2 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span className="font-medium">
            Servidor offline - Tentando reconectar...
          </span>
        </div>
      )}

      {/* Área principal de mensagens */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 ? (
              /* Estado vazio - Tela inicial */
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                {/* Ícone principal */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-accent-foreground" />
                  </div>
                </div>

                {/* Título e descrição */}
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Olá! Sou a OllamaCode
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-8">
                  {online
                    ? "Estou aqui para ajudar com programação, explicar conceitos e analisar código. Como posso ajudar você hoje?"
                    : "Aguardando conexão com o servidor para começar..."}
                </p>

                {/* Sugestões de prompts */}
                {online && (
                  <div className="w-full max-w-md space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                      Sugestões para começar
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isTyping}
                          className="group px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-left text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-border/50 hover:border-primary/30"
                        >
                          <span className="block truncate group-hover:text-primary transition-colors">
                            {suggestion}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Lista de mensagens */
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

                {/* Indicador de digitação */}
                {isTyping && <TypingIndicator />}

                {/* Referência para scroll automático */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer fixo com input */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput onSend={sendMessage} disabled={isTyping || !online} />

          {/* Aviso legal */}
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
            OllamaCode pode cometer erros. Verifique informações importantes.
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;