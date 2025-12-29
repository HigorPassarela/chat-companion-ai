// Crie este arquivo temporariamente para testar
import { supabase } from '@/lib/supabase';

export const testSupabaseConnection = async () => {
  console.log("🔍 TESTE COMPLETO DO SUPABASE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Teste 1: Verificar variáveis de ambiente
  console.log("📋 Variáveis de ambiente:");
  console.log("   VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ Definida" : "❌ Não definida");
  console.log("   VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Não definida");
  
  // Teste 2: Conexão básica
  try {
    console.log("🔌 Testando conexão básica...");
    const { data, error } = await supabase.from('conversations').select('count').limit(1);
    
    if (error) {
      console.error("❌ Erro na conexão:", error);
      return false;
    }
    
    console.log("✅ Conexão OK");
  } catch (err) {
    console.error("❌ Erro de conexão:", err);
    return false;
  }
  
  // Teste 3: Query simples
  try {
    console.log("📊 Testando query de conversas...");
    const { data, error } = await supabase
      .from('conversations')
      .select('*');
    
    console.log("📊 Resultado da query:");
    console.log("   Erro:", error);
    console.log("   Dados:", data);
    console.log("   Quantidade:", data?.length || 0);
    
    if (error) {
      console.error("❌ Erro na query:", error);
      return false;
    }
    
    console.log("✅ Query executada com sucesso");
    return true;
    
  } catch (err) {
    console.error("❌ Erro na query:", err);
    return false;
  }
};