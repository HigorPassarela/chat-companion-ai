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
  id: number;           
  title: string;
  created_at: string;  
  updated_at: string;   
  message_count?: number;
}

export interface ConversationInput {
  id?: number;
  title: string;
  created_at?: string;
  updated_at?: string;
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
  console.log('[Supabase] Criando conversa:', title);
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title })
    .select('id, title, created_at, updated_at')
    .single();
  
  if (error) {
    console.error('[Supabase] Erro ao criar conversa:', error);
    throw error;
  }
  
  if (!data || !data.id) {
    throw new Error('Conversa criada mas sem ID retornado');
  }
  
  console.log('[Supabase] Conversa criada:', data.id);
  return data as Conversation;
}

/**
 * Listar todas as conversas
 */
export async function listConversations(): Promise<Conversation[]> {
  console.log('[Supabase] Listando conversas...');
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('[Supabase] Erro ao listar conversas:', error);
      throw error;
    }
    
    if (!data) {
      console.log('[Supabase] Nenhum dado retornado');
      return [];
    }
    
    // Filtra apenas conversas válidas
    const validConversations = data.filter((conv): conv is Conversation => {
      const isValid = conv && 
                     typeof conv.id === 'number' && 
                     conv.id > 0 && 
                     typeof conv.title === 'string' &&
                     conv.created_at &&
                     conv.updated_at;
      
      if (!isValid) {
        console.warn('[Supabase] Conversa inválida filtrada:', conv);
      }
      
      return isValid;
    });
    
    console.log(`[Supabase] ${validConversations.length} conversas carregadas`);
    return validConversations;
    
  } catch (error) {
    console.error('[Supabase] Erro completo:', error);
    throw error;
  }
}

/**
 * Buscar conversa por ID
 */
export async function getConversation(id: number): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('[Supabase] Erro ao buscar conversa:', error);
    return null;
  }
  
  return data as Conversation;
}

/**
 * Atualizar título da conversa
 */
export async function updateConversationTitle(id: number, title: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ 
      title,
      updated_at: new Date().toISOString()
    })
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
    console.log('[Supabase] Iniciando upload:', file.name);
    
    // 1. Gerar nome único para o arquivo
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanFileName}`;
    
    console.log('[Supabase] Fazendo upload como:', fileName);
    
    // 2. Upload do arquivo para Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('[Supabase] Erro no upload:', uploadError);
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }
    
    console.log('[Supabase] Upload realizado:', uploadData.path);
    
    // 3. Obter URL público
    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);
    
    console.log('[Supabase] 🔗 URL pública gerada');
    
    // 4. Ler conteúdo se for arquivo de texto
    let fileContent = null;
    const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'md', 'xml', 'yml', 'yaml'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension && textExtensions.includes(extension)) {
      try {
        fileContent = await file.text();
        console.log('[Supabase] Conteúdo extraído:', fileContent.length, 'caracteres');
      } catch (textError) {
        console.warn('[Supabase] Erro ao ler conteúdo:', textError);
      }
    }
    
    // 5. Salvar referência no banco
    console.log('[Supabase] Salvando referência no banco...');
    
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
    
    if (error) {
      console.error('[Supabase] Erro ao salvar no banco:', error);
      throw new Error(`Erro ao salvar referência: ${error.message}`);
    }
    
    console.log('[Supabase] Arquivo salvo com sucesso! ID:', data.id);
    return data;
    
  } catch (error) {
    console.error('[Supabase] ERRO COMPLETO no saveFile:', error);
    
    // Mensagens de erro mais amigáveis
    if (error instanceof Error) {
      if (error.message.includes('Bucket not found')) {
        throw new Error('Bucket de arquivos não encontrado. Verifique a configuração do Storage.');
      }
      if (error.message.includes('Row Level Security')) {
        throw new Error('Erro de permissão. Verifique as políticas RLS do Storage.');
      }
      if (error.message.includes('File size')) {
        throw new Error('Arquivo muito grande. Limite máximo excedido.');
      }
      if (error.message.includes('not allowed')) {
        throw new Error('Tipo de arquivo não permitido.');
      }
    }
    
    throw error;
  }
}

/**
 * Buscar arquivos por ID de mensagem
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
  
  return data || [];
}

/**
 * Deletar arquivo do Storage e banco
 */
export async function deleteFile(fileId: number): Promise<void> {
  try {
    // 1. Buscar informações do arquivo
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('file_url')
      .eq('id', fileId)
      .single();
    
    if (fetchError) {
      console.error('[Supabase] Erro ao buscar arquivo:', fetchError);
      throw fetchError;
    }
    
    // 2. Extrair nome do arquivo da URL
    const fileName = fileData.file_url.split('/').pop();
    
    if (fileName) {
      // 3. Deletar do Storage
      const { error: storageError } = await supabase.storage
        .from('chat-files')
        .remove([fileName]);
      
      if (storageError) {
        console.warn('[Supabase] Erro ao deletar do storage:', storageError);
      }
    }
    
    // 4. Deletar registro do banco
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) {
      console.error('[Supabase] Erro ao deletar do banco:', dbError);
      throw dbError;
    }
    
    console.log('[Supabase] Arquivo deletado:', fileId);
    
  } catch (error) {
    console.error('[Supabase] Erro ao deletar arquivo:', error);
    throw error;
  }
}

/**
 * Testar conexão com Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('[Supabase] Testando conexão...');
    
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('[Supabase] Erro de conexão:', error);
      return false;
    }
    
    console.log('[Supabase] Conexão OK');
    return true;
  } catch (error) {
    console.error('[Supabase] Erro de conexão completo:', error);
    return false;
  }
}