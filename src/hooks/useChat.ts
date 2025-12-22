// src/hooks/useChat.ts
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
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append("pergunta", content);
      if (imageFile) formData.append("image", imageFile); 

      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
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