import { Sparkles } from "lucide-react";

export const ChatHeader = () => {
  return (
    <header className="glass border-b border-border/50 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm text-2xl">
          🦙
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Ollama
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
          </h1>
          <p className="text-xs text-muted-foreground">codellama:7b</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>
    </header>
  );
};