import { Bot, Wifi, WifiOff } from "lucide-react";
import { ClearChatButton } from "./ClearChatButton";

interface ChatHeaderProps {
  online: boolean;
  onClearChat?: () => void;
  messageCount?: number;
}

export const ChatHeader = ({ online, onClearChat, messageCount = 0 }: ChatHeaderProps) => {
  return (
    <header className="glass border-b border-border/50 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo e status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">OllamaCode</h1>
            <div className="flex items-center gap-1.5 text-xs">
              {online ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-500 font-medium">Offline</span>
                </>
              )}
              {messageCount > 0 && (
                <>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="text-muted-foreground">
                    {messageCount} {messageCount === 1 ? "mensagem" : "mensagens"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botão de limpar */}
        {onClearChat && messageCount > 0 && (
          <ClearChatButton onClear={onClearChat} disabled={!online} />
        )}
      </div>
    </header>
  );
};