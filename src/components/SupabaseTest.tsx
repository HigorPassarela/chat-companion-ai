import { useEffect, useState } from "react";
import { testConnection } from "@/lib/supabase";

export const SupabaseTest = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');

  useEffect(() => {
    testConnection()
      .then((ok) => setStatus(ok ? 'success' : 'error'))
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'testing') {
    return <div className="text-yellow-500">Testando conexão com Supabase...</div>;
  }

  if (status === 'success') {
    return <div className="text-green-500">Supabase conectado!</div>;
  }

  return <div className="text-red-500">Erro ao conectar com Supabase</div>;
};