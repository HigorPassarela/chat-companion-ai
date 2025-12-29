import { useState, useCallback, useEffect } from "react";
import { 
  listConversations,
  createConversation,
  deleteConversation,
  updateConversationTitle,
  testConnection,
  type Conversation 
} from "@/lib/supabase";

interface UseConversationsReturn {
  conversations: Conversation[];
  currentConversationId: number | null;
  loading: boolean;
  error: string | null;
  newConversation: () => Promise<number | null>;
  removeConversation: (id: number) => Promise<void>;
  renameConversation: (id: number, newTitle: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  setCurrentConversationId: (id: number | null) => void;
}

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Teste de conexão detalhado
  const checkConnection = useCallback(async () => {
    console.log("🔍 TESTE DE CONEXÃO SUPABASE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Verifica variáveis de ambiente
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log("📋 Variáveis de ambiente:");
      console.log("   VITE_SUPABASE_URL:", supabaseUrl ? `✅ ${supabaseUrl}` : "❌ FALTANDO");
      console.log("   VITE_SUPABASE_ANON_KEY:", supabaseKey ? `✅ ${supabaseKey.substring(0, 20)}...` : "❌ FALTANDO");
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("❌ Variáveis de ambiente do Supabase não configuradas corretamente");
      }
      
      // Teste de conexão básica
      console.log("🔌 Testando conexão básica...");
      const isConnected = await testConnection();
      
      if (!isConnected) {
        throw new Error("Falha na conexão com Supabase");
      }
      
      console.log("✅ Conexão com Supabase estabelecida");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return true;
      
    } catch (err) {
      console.error("❌ FALHA NO TESTE DE CONEXÃO:", err);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return false;
    }
  }, []);

  // 📥 Carregar conversas do Supabase
  const loadConversations = useCallback(async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 loadConversations INICIADO");
    
    setLoading(true);
    setError(null);

    try {
      // Primeiro testa conexão
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error("Falha na conexão com Supabase - verifique as variáveis de ambiente");
      }

      console.log("📡 Executando listConversations()...");
      const data = await listConversations();
      
      console.log("✅ Resposta recebida do Supabase:");
      console.log("   - Tipo:", typeof data);
      console.log("   - É array?", Array.isArray(data));
      console.log("   - Quantidade:", data?.length || 0);
      console.log("   - Dados completos:", data);
      
      if (!Array.isArray(data)) {
        console.warn("⚠️ Dados não são um array:", data);
        setConversations([]);
        return;
      }
      
      // ✅ CORREÇÃO: Validação simplificada sem type guard complexo
      const validConversations: Conversation[] = [];
      
      for (const conv of data) {
        // Verifica se a conversa tem todos os campos obrigatórios
        if (conv && 
            typeof conv.id === 'number' && 
            conv.id > 0 && 
            typeof conv.title === 'string' &&
            conv.created_at &&
            conv.updated_at) {
          
          validConversations.push({
            id: conv.id,
            title: conv.title,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            message_count: conv.message_count
          });
        } else {
          console.warn("⚠️ Conversa inválida filtrada:", conv);
        }
      }
      
      console.log("✅ Conversas válidas:", validConversations.length);
      console.log("✅ setConversations chamado com:", validConversations);
      
      setConversations(validConversations);
      
      // Auto-selecionar primeira conversa se não há seleção atual
      if (!currentConversationId && validConversations.length > 0) {
        console.log("🎯 Auto-selecionando primeira conversa:", validConversations[0].id);
        setCurrentConversationId(validConversations[0].id);
      }
      
    } catch (err) {
      console.error("❌ ERRO COMPLETO em loadConversations:", err);
      console.error("❌ Stack trace:", err instanceof Error ? err.stack : 'N/A');
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setConversations([]);
    } finally {
      setLoading(false);
      console.log("✅ Loading finalizado");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  }, [currentConversationId, checkConnection]);

  // 🆕 Criar nova conversa
  const newConversation = useCallback(async (): Promise<number | null> => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("➕ newConversation INICIADO");
    
    setError(null);

    try {
      console.log("📡 Criando conversa no Supabase...");
      
      const newConv = await createConversation("Nova Conversa");
      
      console.log("✅ Conversa criada no Supabase:", newConv);
      
      // Recarrega a lista completa para garantir sincronia
      await loadConversations();
      
      // Seleciona a nova conversa
      if (newConv.id) {
        setCurrentConversationId(newConv.id);
        console.log("🎯 Nova conversa selecionada:", newConv.id);
      }
      
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return newConv.id;
      
    } catch (err) {
      console.error("❌ ERRO ao criar conversa:", err);
      setError(err instanceof Error ? err.message : 'Erro ao criar conversa');
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return null;
    }
  }, [loadConversations]);

  // 🗑️ Deletar conversa
  const removeConversation = useCallback(async (id: number): Promise<void> => {
    console.log("🗑️ Deletando conversa:", id);
    setError(null);

    try {
      await deleteConversation(id);
      console.log("✅ Conversa deletada do Supabase");
      
      // Recarrega lista
      await loadConversations();
      
      // Limpa seleção se era a conversa atual
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        console.log("🎯 Conversa atual limpa");
      }
      
    } catch (err) {
      console.error("❌ ERRO ao deletar conversa:", err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar conversa');
    }
  }, [currentConversationId, loadConversations]);

  // ✏️ Renomear conversa
  const renameConversation = useCallback(async (id: number, newTitle: string): Promise<void> => {
    console.log("✏️ Renomeando conversa:", id, "para:", newTitle);
    setError(null);

    try {
      await updateConversationTitle(id, newTitle);
      console.log("✅ Conversa renomeada no Supabase");
      
      // Recarrega lista
      await loadConversations();
      
    } catch (err) {
      console.error("❌ ERRO ao renomear conversa:", err);
      setError(err instanceof Error ? err.message : 'Erro ao renomear conversa');
    }
  }, [loadConversations]);

  // 🚀 Inicialização
  useEffect(() => {
    console.log("🚀 useConversations montado - iniciando carregamento...");
    loadConversations();
  }, []); // SEM dependências para evitar loops infinitos

  // 📊 Debug detalhado do estado
  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 ESTADO ATUAL DO useConversations:");
    console.log("   - Conversas:", conversations.length);
    console.log("   - Conversa atual:", currentConversationId);
    console.log("   - Loading:", loading);
    console.log("   - Erro:", error);
    console.log("   - Lista completa:", conversations.map(c => `ID: ${c.id}, Título: ${c.title}`));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }, [conversations, currentConversationId, loading, error]);

  return {
    conversations,
    currentConversationId,
    loading,
    error,
    newConversation,
    removeConversation,
    renameConversation,
    loadConversations,
    setCurrentConversationId,
  };
};