import { User } from "lucide-react";
import { FileAttachment } from "./FileAttachment";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
  isNew?: boolean;
  files?: Array<{
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    file_url: string;
    file_content?: string;
  }>;
}

export const ChatMessage = ({
  content,
  role,
  imageUrl,
  isNew = false,
  files
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""} ${isNew ? "animate-fade-in-up" : ""
        }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-secondary" : "bg-gradient-to-br from-primary to-accent glow-sm"
          }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <img
            src="/llama.svg"
            alt="OllamaCode"
            className="w-5 h-5 object-contain"
          />
        )}
      </div>

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${isUser
            ? "bg-user-bubble text-foreground rounded-br-md"
            : "bg-ai-bubble text-foreground rounded-bl-md border border-border/50"
          }`}
      >
        {/* Mostrar arquivos anexados */}
        {files && files.length > 0 && (
          <div className="mb-3 space-y-2">
            {files.map((file) => (
              <FileAttachment
                key={file.id}
                filename={file.filename}
                fileType={file.file_type}
                fileSize={file.file_size}
                fileUrl={file.file_url}
                fileContent={file.file_content}
              />
            ))}
          </div>
        )}

        {/* Texto da mensagem */}
        {content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}

        {/* Imagem enviada (para compatibilidade com versões antigas) */}
        {imageUrl && !files?.length && (
          <img
            src={imageUrl}
            alt="Imagem enviada"
            className="mt-2 rounded-lg max-h-64 object-contain"
          />
        )}
      </div>
    </div>
  );
};