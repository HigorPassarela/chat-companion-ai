import { useState, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  imageUrl?: string; 
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string, imageFile?: File) => {
    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Decidir qual endpoint usar
      let endpoint = "http://localhost:5000/chat";
      let requestBody: any = { pergunta: content };

      // Se houver arquivo, usar endpoint diferente e incluir conteúdo
      if (imageFile) {
        endpoint = "http://localhost:5000/chat-with-file";
        
        // Ler conteúdo do arquivo (se for texto)
        const fileContent = await readFileContent(imageFile);
        if (fileContent) {
          requestBody.file_content = fileContent;
        }
      }

      // Fazer requisição com streaming
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ⭐ IMPORTANTE!
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Processar streaming (Server-Sent Events)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantMessage = "";
      const assistantMessageId = (Date.now() + 1).toString();

      // Adicionar mensagem vazia do assistente
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          content: "",
          role: "assistant",
        },
      ]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              // Receber token individual
              if (data.token) {
                assistantMessage += data.token;
                
                // Atualizar mensagem em tempo real
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages.find(m => m.id === assistantMessageId);
                  if (lastMsg) {
                    lastMsg.content = assistantMessage;
                  }
                  return newMessages;
                });
              }

              // Verificar se terminou
              if (data.done) {
                setIsTyping(false);
              }

              // Tratar erros
              if (data.error) {
                console.error("[useChat] Erro do servidor:", data.error);
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages.find(m => m.id === assistantMessageId);
                  if (lastMsg) {
                    lastMsg.content = `❌ Erro: ${data.error}`;
                  }
                  return newMessages;
                });
                setIsTyping(false);
                break;
              }
            } catch (e) {
              // Ignorar linhas que não são JSON válido
              console.debug("[useChat] Linha ignorada:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("[useChat] Erro:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `❌ Erro ao conectar com o servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          role: "assistant",
        },
      ]);
      setIsTyping(false);
    }
  }, []);

  return { messages, isTyping, sendMessage };
};

// Função auxiliar para ler conteúdo de arquivo
async function readFileContent(file: File): Promise<string | null> {
  // Verificar se é arquivo de texto
  const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'html', 'css', 'tsx', 'ts', 'jsx'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension || !textExtensions.includes(extension)) {
    console.log("[readFileContent] Arquivo não é de texto:", file.name);
    return null;
  }

  try {
    const text = await file.text();
    console.log(`[readFileContent] Lido ${text.length} caracteres de ${file.name}`);
    return text;
  } catch (error) {
    console.error("[readFileContent] Erro ao ler arquivo:", error);
    return null;
  }
}