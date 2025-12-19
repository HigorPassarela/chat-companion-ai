import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-4 animate-fade-in-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent glow-sm">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="bg-ai-bubble px-4 py-3 rounded-2xl rounded-bl-md border border-border/50">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
};
