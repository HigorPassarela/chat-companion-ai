import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isNew?: boolean;
}

export const ChatMessage = ({ content, role, isNew = false }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""} ${isNew ? "animate-fade-in-up" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary"
            : "bg-gradient-to-br from-primary to-accent glow-sm"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-user-bubble text-foreground rounded-br-md"
            : "bg-ai-bubble text-foreground rounded-bl-md border border-border/50"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
