export interface UserSettings {
  // Perfil
  username: string;
  avatar?: string;

  // Aparência
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';

  // Chat
  typingSpeed: number; // ms entre tokens
  autoScroll: boolean;
  soundEnabled: boolean;
  maxHistoryMessages: number;
  autoRenameConversations: boolean;

  // IA
  aiModel: string;
  temperature: number; // 0-1
  maxResponseLength: number;
  preferredLanguage: string;

  // Arquivos
  maxFileSize: number; // bytes
  allowedFileTypes: string[];
  autoDownloadSmallFiles: boolean;
  downloadPath: string;

  // Avançado
  backendUrl: string;
  requestTimeout: number;
  debugMode: boolean;
}

export const defaultSettings: UserSettings = {
  // Perfil
  username: 'Usuário',

  // Aparência
  theme: 'dark',
  primaryColor: '#00d4aa',
  accentColor: '#00b4d8',
  fontSize: 'medium',

  // Chat
  typingSpeed: 50,
  autoScroll: true,
  soundEnabled: false,
  maxHistoryMessages: 100,
  autoRenameConversations: true,

  // IA
  aiModel: 'llama2',
  temperature: 0.7,
  maxResponseLength: 2000,
  preferredLanguage: 'pt-BR',

  // Arquivos
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'md', 'pdf', 'jpg', 'png'],
  autoDownloadSmallFiles: false,
  downloadPath: 'Downloads',

  // Avançado
  backendUrl: 'http://localhost:5000',
  requestTimeout: 30000,
  debugMode: false,
};