import { Send } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if(!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");  
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="glass rounded-2xl p-2">
      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm px-3 py-2.5 resize-none focus:outline-none min-h-[44px] max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center transition-all hover:scale-105 hover:glow disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
