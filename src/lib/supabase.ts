import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase! Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== TIPOS =====

export interface Message {
  id?: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  created_at?: string;
  files?: FileAttachment[];
}

export interface Conversation {
  id?: number;
  title: string;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
}

export interface FileAttachment {
  id?: number;
  message_id: number;
  filename: string;
  file_type: string;
  file_size: number;
  file_content?: string;
  file_url?: string;
  created_at?: string;
}

// ===== FUNÇÕES CRUD =====

/**
 * Criar nova conversa
 */
export async function createConversation(title = 'Nova Conversa'): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title })
    .select()
    .single();
  
  if (error) {
    console.error('[Supabase] Erro ao criar conversa:', error);
    throw error;
  }
  
  console.log('[Supabase] Conversa criada:', data.id);
  return data;
}

/**
 * Listar todas as conversas
 */
export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(count)
    `)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('[Supabase] Erro ao listar conversas:', error);
    throw error;
  }
  
  // Formatar dados
  const formatted = data.map(conv => ({
    ...conv,
    message_count: conv.messages[0]?.count || 0,
  }));
  
  console.log(`[Supabase] ${formatted.length} conversas carregadas`);
  return formatted;
}

/**
 * Buscar conversa por ID
 */
export async function getConversation(id: number): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('[Supabase] Erro ao buscar conversa:', error);
    return null;
  }
  
  return data;
}

/**
 * Atualizar título da conversa
 */
export async function updateConversationTitle(id: number, title: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', id);
  
  if (error) {
    console.error('[Supabase] Erro ao atualizar título:', error);
    throw error;
  }
  
  console.log('[Supabase] Título atualizado:', id);
}

/**
 * Deletar conversa
 */
export async function deleteConversation(id: number): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('[Supabase] Erro ao deletar conversa:', error);
    throw error;
  }
  
  console.log('[Supabase] Conversa deletada:', id);
}

/**
 * Salvar mensagem
 */
export async function saveMessage(message: Message): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
  
  if (error) {
    console.error('[Supabase] Erro ao salvar mensagem:', error);
    throw error;
  }
  
  // Atualizar updated_at da conversa
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', message.conversation_id);
  
  console.log('[Supabase] Mensagem salva:', data.id);
  return data;
}

/**
 * Buscar mensagens de uma conversa
 */
export async function getMessages(conversationId: number): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      files(*)
    `)
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });
  
  if (error) {
    console.error('[Supabase] Erro ao buscar mensagens:', error);
    throw error;
  }
  
  console.log(`[Supabase] ${data.length} mensagens carregadas`);
  return data;
}

/**
 * Salvar arquivo no Storage e criar registro no banco
 */
export async function saveFile(messageId: number, file: File): Promise<FileAttachment> {
  try {
    // 1. Upload do arquivo para Storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Obter URL público
    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);
    
    // 3. Ler conteúdo se for arquivo de texto
    let fileContent = null;
    const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension && textExtensions.includes(extension)) {
      fileContent = await file.text();
    }
    
    // 4. Salvar referência no banco
    const { data, error } = await supabase
      .from('files')
      .insert({
        message_id: messageId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_content: fileContent,
        file_url: urlData.publicUrl,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('[Supabase] Arquivo salvo:', data.id);
    return data;
  } catch (error) {
    console.error('[Supabase] Erro ao salvar arquivo:', error);
    throw error;
  }
}

/**
 * Buscar arquivo por ID de mensagem
 */
export async function getFilesByMessage(messageId: number): Promise<FileAttachment[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('message_id', messageId);
  
  if (error) {
    console.error('[Supabase] Erro ao buscar arquivos:', error);
    throw error;
  }
  
  return data;
}

/**
 * Testar conexão com Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('[Supabase] [OK] Conexão OK');
    return true;
  } catch (error) {
    console.error('[Supabase] [ERROR] Erro de conexão:', error);
    return false;
  }
}