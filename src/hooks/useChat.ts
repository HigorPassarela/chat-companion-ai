import { useState, useCallback } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const AI_RESPONSES = [
  "Olá! Como posso ajudá-lo hoje? Estou aqui para responder suas perguntas e auxiliar no que precisar.",
  "Essa é uma ótima pergunta! Deixe-me pensar sobre isso... Com base nas informações disponíveis, posso dizer que existem várias abordagens para isso.",
  "Interessante! Posso ver que você está explorando um tópico fascinante. Gostaria de saber mais sobre o contexto para dar uma resposta mais precisa.",
  "Entendi perfeitamente o que você precisa. Aqui está uma explicação detalhada que pode ajudá-lo a entender melhor esse assunto.",
  "Fico feliz em ajudar! Com base na sua pergunta, tenho algumas sugestões que podem ser úteis para você.",
  "Excelente ponto! Isso me faz pensar em várias possibilidades. Vou compartilhar alguns insights relevantes.",
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        role: "assistant",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, delay);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
  };
};
