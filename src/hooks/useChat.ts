// src/hooks/useChat.ts
import { useState, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };

    // adiciona a mensagem do usuário ao estado
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // 🔹 Requisição POST ao backend Flask
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: content }),
      });

      const data = await response.json();

      // 🔹 Mensagem da IA vinda da resposta do Flask
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.resposta || "Erro ao processar resposta.",
        role: "assistant",
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("[useChat] Erro:", error);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), 
          content: "Erro ao conectar com o servidor.", 
          role: "assistant" },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  return { messages, isTyping, sendMessage };
};