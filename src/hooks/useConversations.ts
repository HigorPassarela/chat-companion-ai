import { useState, useCallback, useEffect } from "react";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

// 🔧 Use URL relativa (proxy vai redirecionar para localhost:5000)
const API_URL = "/api";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 📥 Carregar conversas
  const loadConversations = useCallback(async () => {
    console.log("🔄 Carregando conversas de:", `${API_URL}/conversations`);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Dados recebidos:", data);
      console.log("✅ Tipo:", typeof data);
      console.log("✅ É array?", Array.isArray(data));

      if (Array.isArray(data)) {
        setConversations(data);
        console.log(`✅ ${data.length} conversas carregadas`);
      } else if (data.conversations && Array.isArray(data.conversations)) {
        // Se vier dentro de um objeto { conversations: [...] }
        setConversations(data.conversations);
        console.log(`✅ ${data.conversations.length} conversas carregadas`);
      } else {
        console.warn("⚠️ Formato inesperado:", data);
        setConversations([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar conversas:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ➕ Criar nova conversa
  const newConversation = useCallback(async () => {
    console.log("➕ Criando nova conversa...");

    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova conversa" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Nova conversa criada:", data);

      await loadConversations();
      return data.id;
    } catch (error) {
      console.error("❌ Erro ao criar conversa:", error);
      return null;
    }
  }, [loadConversations]);

  // 🗑️ Deletar conversa
  const removeConversation = useCallback(
    async (id: number) => {
      console.log("🗑️ Deletando conversa:", id);

      try {
        const response = await fetch(`${API_URL}/conversations/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Conversa deletada");
        await loadConversations();

        if (currentConversationId === id) {
          setCurrentConversationId(null);
        }
      } catch (error) {
        console.error("❌ Erro ao deletar conversa:", error);
      }
    },
    [currentConversationId, loadConversations]
  );

  // ✏️ Renomear conversa
  const renameConversation = useCallback(
    async (id: number, newTitle: string) => {
      console.log("✏️ Renomeando conversa:", id);

      try {
        const response = await fetch(`${API_URL}/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Conversa renomeada");
        await loadConversations();
      } catch (error) {
        console.error("❌ Erro ao renomear conversa:", error);
      }
    },
    [loadConversations]
  );

  // 🚀 Carregar ao montar
  useEffect(() => {
    console.log("🚀 useConversations montado");
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    newConversation,
    removeConversation,
    renameConversation,
    loadConversations,
    loading,
  };
};