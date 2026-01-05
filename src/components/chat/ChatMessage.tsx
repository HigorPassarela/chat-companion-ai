import React from "react";
import { User } from "lucide-react";
import 'highlight.js/styles/github-dark.css';
import { FileAttachment } from "./FileAttachment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

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
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""} ${isNew ? "animate-fade-in-up" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-secondary" : "bg-gradient-to-br from-primary to-accent glow-sm"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <img src="/llama.svg" alt="OllamaCode" className="w-5 h-5 object-contain" />
        )}
      </div>

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-user-bubble text-foreground rounded-br-md"
            : "bg-ai-bubble text-foreground rounded-bl-md border border-border/50"
        }`}
      >
        {/* Arquivos anexados (se houver) */}
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

        {/* Markdown rendering (suporta **bold**, `inline code`, ```code blocks```, lists, links etc.) */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
            components={{
              // links abrem em nova aba com segurança
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />
              ),
              // custom renderer para code (inline e block)
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                if (!inline && match) {
                  // bloco de código com linguagem: rehype-highlight já fará highlight
                  return (
                    <pre className="bg-black/20 p-3 rounded-md overflow-auto text-sm"><code className={className} {...props}>{String(children).replace(/\n$/, "")}</code></pre>
                  );
                }
                // código inline: estilo simples
                return (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              // opcional: customizar listas/paragraphs se quiser
            }}
          >
            {content || ""}
          </ReactMarkdown>
        </div>

        {/* Imagem enviada (compatibilidade) */}
        {imageUrl && !files?.length && (
          <img src={imageUrl} alt="Imagem enviada" className="mt-2 rounded-lg max-h-64 object-contain" />
        )}
      </div>
    </div>
  );
};