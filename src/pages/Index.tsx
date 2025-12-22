import { useEffect, useRef } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const { online } = useBackendStatus(); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader online={online} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Comece uma conversa
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Digite uma mensagem abaixo para começar a conversar com a OllamaCode.
                  Estou aqui para ajudar!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    role={message.role}
                    isNew={index === messages.length - 1}
                  />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput onSend={sendMessage} disabled={isTyping} />
          <p className="text-center text-xs text-muted-foreground mt-3">
            OllamaCode pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;