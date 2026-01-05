import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase! Verifique o arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== TIPOS =====

// Tipos de autenticação
export interface Profile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

// Tipos existentes atualizados
export interface Message {
  id?: number;
  conversation_id: number;
  user_id?: string; 
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  created_at?: string;
  files?: FileAttachment[];
}

export interface Conversation {
  id: number;
  title: string;
  user_id?: string; 
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationInput {
  id?: number;
  title: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FileAttachment {
  id?: number;
  message_id: number;
  user_id?: string; 
  filename: string;
  file_type: string;
  file_size: number;
  file_content?: string;
  file_url?: string;
  created_at?: string;
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

/**
 * Obter usuário atual
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    profile: profile || undefined
  };
}

/**
 * Obter ID do usuário atual
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ===== FUNÇÕES CRUD ATUALIZADAS =====

/**
 * Gerar titulo inteligente com base na primeira mensagem
 */
export async function generateConversationTitle(message: string): Promise<string> {
  const cleanMessage = message.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');

  const patterns = [
    { regex: /^(o que é|o que são|oque é|oque são)\s+(.+)/i, format: (match: RegExpMatchArray) => `O que é ${match[2]}` },
    { regex: /^(como fazer|como criar|como|como posso)\s+(.+)/i, format: (match: RegExpMatchArray) => `Como ${match[2]}` },
    { regex: /^(por que|porque|pq)\s+(.+)/i, format: (match: RegExpMatchArray) => `Por que ${match[2]}` },
    { regex: /^(qual|quais)\s+(.+)/i, format: (match: RegExpMatchArray) => `Qual ${match[2]}` },
    { regex: /^(explique|explica|me explique)\s+(.+)/i, format: (match: RegExpMatchArray) => `Explicar ${match[2]}` },
    { regex: /^(diferença entre|diferenca entre|diff entre)\s+(.+)/i, format: (match: RegExpMatchArray) => `Diferença entre ${match[2]}` },
    { regex: /^(me ajude|ajuda|help)\s+(.+)/i, format: (match: RegExpMatchArray) => `Ajuda com ${match[2]}` },
    { regex: /^(tutorial|como usar)\s+(.+)/i, format: (match: RegExpMatchArray) => `Tutorial ${match[2]}` },
  ];

  // Encontrar um padrão
  for (const pattern of patterns) {
    const match = cleanMessage.match(pattern.regex);
    if (match) {
      let title = pattern.format(match);
      // Limita tamanho
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      return title;
    }
  }

  // Fallback para título genérico
  return cleanMessage.length > 50 
    ? cleanMessage.substring(0, 47) + '...' 
    : cleanMessage || 'Nova Conversa';
}

/**
 * Atualizar titulo automaticamente
 */
export async function autoUpdateConversationTitle(conversationId: number, firstMessage: string): Promise<void> {
  try {
    const newTitle = await generateConversationTitle(firstMessage);
    console.log('[Supabase] Auto-renomeando conversa:', conversationId, newTitle);
    await updateConversationTitle(conversationId, newTitle);
  } catch (error) {
    console.error('[Supabase] Erro ao auto-renomear conversa', error);
    throw error;
  }
}

/**
 * Criar nova conversa (com autenticação)
 */
export async function createConversation(title = 'Nova Conversa'): Promise<Conversation> {
  console.log('[Supabase] Criando conversa:', title);

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ 
      title,
      user_id: userId 
    })
    .select('id, title, user_id, created_at, updated_at')
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
 * Listar todas as conversas (filtradas por usuário)
 */
 export async function listConversations(): Promise<Conversation[]> {
  console.log('[Supabase] Listando conversas...');

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('[Supabase] Usuário não autenticado, retornando array vazio');
      return [];
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, user_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Erro ao listar conversas:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('[Supabase] Nenhuma conversa encontrada');
      return [];
    }

    const validConversations: Conversation[] = data
      .filter(conv => {
        const isValid = conv && 
          conv.id && 
          typeof conv.id === 'number' && 
          conv.title && 
          typeof conv.title === 'string' &&
          conv.created_at && 
          conv.updated_at;
        
        if (!isValid) {
          console.warn('[Supabase] Conversa inválida filtrada:', conv);
        }
        
        return isValid;
      })
      .map(conv => ({
        id: conv.id,
        title: conv.title,
        user_id: conv.user_id,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      } as Conversation));

    console.log(`[Supabase] ${validConversations.length} conversas carregadas`);
    return validConversations;

  } catch (error) {
    console.error('[Supabase] Erro completo:', error);
    throw error;
  }
}

/**
 * Buscar conversa por ID (com verificação de usuário)
 */
export async function getConversation(id: number): Promise<Conversation | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, user_id, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', userId) 
    .single();

  if (error) {
    console.error('[Supabase] Erro ao buscar conversa:', error);
    return null;
  }

  return data as Conversation;
}

/**
 * Atualizar título da conversa (com verificação de usuário)
 */
export async function updateConversationTitle(id: number, title: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('conversations')
    .update({
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId); 

  if (error) {
    console.error('[Supabase] Erro ao atualizar título:', error);
    throw error;
  }

  console.log('[Supabase] Título atualizado:', id);
}

/**
 * Deletar conversa (com verificação de usuário)
 */
export async function deleteConversation(id: number): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); 

  if (error) {
    console.error('[Supabase] Erro ao deletar conversa:', error);
    throw error;
  }

  console.log('[Supabase] Conversa deletada:', id);
}

/**
 * Salvar mensagem (com user_id)
 */
export async function saveMessage(message: Message): Promise<Message> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const messageWithUserId = {
    ...message,
    user_id: userId
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(messageWithUserId)
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
    .eq('id', message.conversation_id)
    .eq('user_id', userId); 

  console.log('[Supabase] Mensagem salva:', data.id);
  return data;
}

/**
 * Buscar mensagens de uma conversa (com verificação de usuário)
 */
export async function getMessages(conversationId: number): Promise<Message[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  // Primeiro verificar se a conversa pertence ao usuário
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error('Conversa não encontrada ou não pertence ao usuário');
  }

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
 * Salvar arquivo no Storage e criar registro no banco (com user_id)
 */
export async function saveFile(messageId: number, file: File): Promise<FileAttachment> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('[Supabase] Iniciando upload:', file.name);

    // 1. Gerar nome único para o arquivo (incluir userId no path)
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${userId}/${timestamp}_${cleanFileName}`;

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

    console.log('[Supabase] URL pública gerada');

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

    // 5. Salvar referência no banco (com user_id)
    console.log('[Supabase] Salvando referência no banco...');

    const { data, error } = await supabase
      .from('files')
      .insert({
        message_id: messageId,
        user_id: userId, 
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
 * Buscar arquivos por ID de mensagem (mantido igual)
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
 * Deletar arquivo do Storage e banco (com verificação de usuário)
 */
export async function deleteFile(fileId: number): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    // 1. Buscar informações do arquivo (verificar se pertence ao usuário)
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('file_url, user_id')
      .eq('id', fileId)
      .eq('user_id', userId)
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
        .remove([`${userId}/${fileName}`]);

      if (storageError) {
        console.warn('[Supabase] Erro ao deletar do storage:', storageError);
      }
    }

    // 4. Deletar registro do banco
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId); 

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
 * Testar conexão com Supabase (mantido igual)
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

// FUNÇÕES ESPECÍFICAS DE PERFIL

/**
 * Atualizar perfil do usuário
 */
export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('[Supabase] Erro ao atualizar perfil:', error);
    throw error;
  }

  console.log('[Supabase] Perfil atualizado');
}

/**
 * Buscar perfil do usuário atual
 */
export async function getProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Supabase] Erro ao buscar perfil:', error);
    return null;
  }

  return data;
}