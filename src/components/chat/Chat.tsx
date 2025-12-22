import { useChat } from "../../hooks/useChat";
import { useBackendStatus } from "../../hooks/useBackendStatus";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

export const Chat = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const { online } = useBackendStatus();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader online={online} />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} content={m.content} />
        ))}
        {isTyping && <TypingIndicator />}
      </main>

      <div className="p-4 border-t border-border/50">
        <ChatInput onSend={sendMessage} disabled={isTyping || !online} />
      </div>
    </div>
  );
};