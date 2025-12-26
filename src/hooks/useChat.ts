import { useState, useCallback, useEffect } from "react";
import {
  supabase,
  saveMessage,
  getMessages,
  createConversation,
  saveFile,
  type Message as DBMessage,
} from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
  timestamp: number;
}

export const useChat = (initialConversationId?: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(
    initialConversationId || null
  );

  // 💾 Carregar mensagens do Supabase ao mudar conversa
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]); // Limpar se não houver conversa
    }
  }, [currentConversationId]); // 👈 Reage a mudanças no ID

  const loadMessages = async (convId: number) => {
    try {
      console.log(`[useChat] Carregando mensagens da conversa ${convId}`);
      const data = await getMessages(convId);
      
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id!.toString(),
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
        imageUrl: msg.files?.[0]?.file_url || undefined,
      }));
      
      setMessages(formattedMessages);
      console.log(`[useChat] ${formattedMessages.length} mensagens carregadas`);
    } catch (error) {
      console.error("[useChat] Erro ao carregar mensagens:", error);
      setMessages([]); // Limpar em caso de erro
    }
  };

  const sendMessage = useCallback(
    async (content: string, imageFile?: File) => {
      try {
        // Criar conversa se não existir
        let convId = currentConversationId;
        if (!convId) {
          const conversation = await createConversation();
          convId = conversation.id!;
          setCurrentConversationId(convId);
          console.log(`[useChat] Nova conversa criada: ${convId}`);
        }

        const timestamp = Date.now();

        // Adicionar mensagem do usuário na UI
        const userMessage: Message = {
          id: timestamp.toString(),
          content,
          role: "user",
          imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
          timestamp,
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        // Salvar mensagem do usuário no Supabase
        const savedUserMessage = await saveMessage({
          conversation_id: convId,
          role: "user",
          content,
          timestamp,
        });

        // Salvar arquivo se houver
        let fileContent = null;
        if (imageFile && savedUserMessage.id) {
          await saveFile(savedUserMessage.id, imageFile);
          
          // Ler conteúdo se for texto
          const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css'];
          const extension = imageFile.name.split('.').pop()?.toLowerCase();
          if (extension && textExtensions.includes(extension)) {
            fileContent = await imageFile.text();
          }
        }

        // Chamar backend Python para gerar resposta
        const endpoint = fileContent
          ? "http://localhost:5000/chat-with-file"
          : "http://localhost:5000/chat";

        const requestBody = fileContent
          ? { pergunta: content, file_content: fileContent }
          : { pergunta: content };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        // Processar streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let assistantMessage = "";
        const assistantMessageId = (timestamp + 1).toString();

        // Adicionar mensagem vazia do assistente
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            content: "",
            role: "assistant",
            timestamp: timestamp + 1,
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

                if (data.token) {
                  assistantMessage += data.token;

                  // Atualizar UI em tempo real
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages.find((m) => m.id === assistantMessageId);
                    if (lastMsg) {
                      lastMsg.content = assistantMessage;
                    }
                    return newMessages;
                  });
                }

                if (data.done) {
                  // Salvar resposta completa no Supabase
                  await saveMessage({
                    conversation_id: convId!,
                    role: "assistant",
                    content: assistantMessage,
                    timestamp: timestamp + 1,
                  });
                  setIsTyping(false);
                  console.log("[useChat] Resposta salva no Supabase");
                }

                if (data.error) {
                  console.error("[useChat] Erro do servidor:", data.error);
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages.find((m) => m.id === assistantMessageId);
                    if (lastMsg) {
                      lastMsg.content = `❌ Erro: ${data.error}`;
                    }
                    return newMessages;
                  });
                  setIsTyping(false);
                  break;
                }
              } catch (e) {
                console.debug("[useChat] Linha ignorada:", line);
              }
            }
          }
        }
      } catch (error) {
        console.error("[useChat] Erro:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: `❌ Erro ao conectar: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`,
            role: "assistant",
            timestamp: Date.now(),
          },
        ]);
        setIsTyping(false);
      }
    },
    [currentConversationId]
  );

  const clearHistory = useCallback(async () => {
    setMessages([]);
    setCurrentConversationId(null);
    console.log("[useChat] Histórico local limpo");
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    currentConversationId,
    setCurrentConversationId,
  };
};