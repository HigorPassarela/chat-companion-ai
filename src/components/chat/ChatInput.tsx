import { Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { useState, KeyboardEvent, ClipboardEvent, useRef, ChangeEvent } from "react";

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajustar altura do textarea automaticamente
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  };

  const handleSend = () => {
    if ((!message.trim() && !attachedFile) || disabled) return;
    
    onSend(message.trim(), attachedFile || undefined);
    setMessage("");
    setAttachedFile(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sem Shift = enviar
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          setAttachedFile(blob);
          console.log("[ChatInput] Imagem colada:", blob);
        }
      }
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      console.log("[ChatInput] Arquivo anexado:", file.name);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFile(file);
      console.log("[ChatInput] Arquivo arrastado:", file.name);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = (file: File) => file.type.startsWith("image/");
  const isTextFile = (file: File) => {
    const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? textExtensions.includes(extension) : false;
  };

  return (
    <div
      className={`glass rounded-2xl p-2 transition-all ${
        isDragging ? "ring-2 ring-primary" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Preview do arquivo anexado */}
      {attachedFile && (
        <div className="mb-2 px-2 py-2 bg-muted/50 rounded-xl flex items-center gap-3">
          {/* Preview visual */}
          {isImage(attachedFile) ? (
            <img
              src={URL.createObjectURL(attachedFile)}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          )}

          {/* Informações do arquivo */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {attachedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(attachedFile.size / 1024).toFixed(1)} KB
              {isTextFile(attachedFile) && " • Será analisado"}
            </p>
          </div>

          {/* Botão remover */}
          <button
            onClick={removeFile}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
            title="Remover arquivo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Área de input */}
      <div className="flex items-end gap-2">
        {/* Botão de anexar arquivo */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Anexar arquivo (imagem ou código)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          id="chat-file-upload"
          type="file"
          accept="image/*,.txt,.csv,.json,.py,.js,.jsx,.ts,.tsx,.html,.css"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Campo de texto */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            attachedFile
              ? "Faça uma pergunta sobre o arquivo..."
              : "Digite uma mensagem ou arraste um arquivo..."
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm px-3 py-2.5 resize-none focus:outline-none min-h-[44px] max-h-32 overflow-y-auto"
        />

        {/* Botão enviar */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !attachedFile)}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          title={disabled ? "Aguarde..." : "Enviar (Enter)"}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Dica visual quando arrastando */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-2xl border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
          <p className="text-primary font-medium">Solte o arquivo aqui</p>
        </div>
      )}

      {/* Contador de caracteres (opcional) */}
      {message.length > 500 && (
        <div className="mt-1 px-2 text-xs text-muted-foreground text-right">
          {message.length} / 2000 caracteres
        </div>
      )}
    </div>
  );
};