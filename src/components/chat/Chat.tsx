import { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import { useBackendStatus } from "../../hooks/useBackendStatus";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSquare, WifiOff } from "lucide-react";

export const Chat = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const { online } = useBackendStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader online={online} />

      {/* Alerta quando offline */}
      {!online && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-center py-2 text-sm flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>Servidor offline - Tentando reconectar...</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Estado vazio */}
          {messages.length === 0 ? (
            <div className="h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Comece uma conversa
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Digite uma mensagem abaixo para começar a conversar com a OllamaCode.
                {!online && " (Aguardando conexão com o servidor...)"}
              </p>
            </div>
          ) : (
            <>
              {/* Lista de mensagens */}
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  imageUrl={message.imageUrl}
                  isNew={index === messages.length - 1}
                />
              ))}
              
              {/* Indicador de digitação */}
              {isTyping && <TypingIndicator />}
              
              {/* Referência para auto-scroll */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Footer com input */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput 
            onSend={sendMessage} 
            disabled={isTyping || !online} 
          />
          <p className="text-center text-xs text-muted-foreground mt-3">
            OllamaCode pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </footer>
    </div>
  );
};