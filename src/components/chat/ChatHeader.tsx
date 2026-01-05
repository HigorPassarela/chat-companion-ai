import { Bot, Wifi, WifiOff } from "lucide-react";
import { ClearChatButton } from "./ClearChatButton";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  online: boolean;
  onClearChat?: () => void;
  messageCount?: number;
}

export const ChatHeader = ({ online, onClearChat, messageCount = 0 }: ChatHeaderProps) => {
  return (
    <header className="glass border-b border-border/50 sticky top-0 z-10">
      <div className={cn(
        "max-w-3xl mx-auto px-4 py-3 flex items-center justify-between",
        "lg:px-4",
        "chat-header-mobile-padding"
      )}>
        {/* Logo e status */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <img
              src="/llama.svg"
              alt="OllamaCode Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-foreground truncate">OllamaCode</h1>
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              {online ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-green-500 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span className="text-red-500 font-medium">Offline</span>
                </>
              )}
              {messageCount > 0 && (
                <>
                  <span className="text-muted-foreground mx-1">•</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {messageCount} {messageCount === 1 ? "mensagem" : "mensagens"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botão de limpar */}
        {onClearChat && messageCount > 0 && (
          <div className="flex-shrink-0 ml-2">
            <ClearChatButton onClear={onClearChat} disabled={!online} />
          </div>
        )}
      </div>
    </header>
  );
};