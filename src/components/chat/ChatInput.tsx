import { Send, Image as ImageIcon } from "lucide-react";
import { useState, KeyboardEvent, ClipboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string, imageFile?: File) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSend = () => {
    if((!message.trim() && !imageFile) || disabled) return;
    onSend(message.trim(), imageFile || undefined);
    setMessage("");
    setImageFile(null); 
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const handlePaste = (e:ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if(!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          setImageFile(blob);
          console.log("Imagem colada detectada:", blob);
        }
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-2">
      <div className="flex items-end gap-2">

        {/* 📎 Upload tradicional */}
        <label
          htmlFor="chat-image-upload"
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          title="Anexar imagem"
        >
          <ImageIcon className="w-5 h-5" />
          <input
            id="chat-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImageFile(file);
            }}
          />
        </label>

        {/* 🖊 Campo de texto com suporte a colar imagem */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}  // 👈 captura imagem colada
          placeholder="Digite ou cole uma imagem..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm px-3 py-2.5 resize-none focus:outline-none min-h-[44px] max-h-32"
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !imageFile)}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center transition-all hover:scale-105 hover:glow disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Preview da imagem colada ou anexada */}
      {imageFile && (
        <div className="mt-2 px-2 text-xs text-muted-foreground flex items-center gap-2">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="Preview"
            className="w-12 h-12 object-cover rounded"
          />
          <span>{imageFile.name || "Imagem colada"}</span>
          <button
            onClick={() => setImageFile(null)}
            className="text-red-500 hover:underline"
          >
            remover
          </button>
        </div>
      )}
    </div>
  );
};
