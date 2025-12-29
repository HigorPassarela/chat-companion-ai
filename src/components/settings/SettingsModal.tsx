import React, { useState } from 'react';
import { X, User, Palette, MessageSquare, Bot, FolderOpen, Settings as SettingsIcon, Download, Upload, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserSettings } from '@/types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onResetSettings: () => void;
  onExportSettings: () => void;
  onImportSettings: (file: File) => Promise<void>;
}

type SettingsTab = 'profile' | 'appearance' | 'chat' | 'ai' | 'files' | 'advanced';

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  onExportSettings,
  onImportSettings,
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [importing, setImporting] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'ai', name: 'IA', icon: Bot },
    { id: 'files', name: 'Arquivos', icon: FolderOpen },
    { id: 'advanced', name: 'Avançado', icon: SettingsIcon },
  ] as const;

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      await onImportSettings(file);
      alert('Configurações importadas com sucesso!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao importar configurações');
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações? Esta ação não pode ser desfeita.')) {
      onResetSettings();
      alert('Configurações resetadas!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] max-h-[600px] m-4 flex overflow-hidden">
        
        {/* Sidebar de Tabs */}
        <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Configurações
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
          
          {/* Footer Actions */}
          <div className="p-2 border-t border-border space-y-2">
            <button
              onClick={onExportSettings}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              {importing ? 'Importando...' : 'Importar'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
            
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold">
              {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <ProfileSettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
            {activeTab === 'appearance' && (
              <AppearanceSettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
            {activeTab === 'chat' && (
              <ChatSettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
            {activeTab === 'ai' && (
              <AISettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
            {activeTab === 'files' && (
              <FilesSettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
            {activeTab === 'advanced' && (
              <AdvancedSettings 
                settings={settings} 
                onUpdate={onUpdateSettings} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentes de cada aba de configurações
const ProfileSettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Nome de usuário</label>
      <input
        type="text"
        value={settings.username}
        onChange={(e) => onUpdate({ username: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Digite seu nome"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Avatar (URL da imagem)</label>
      <input
        type="url"
        value={settings.avatar || ''}
        onChange={(e) => onUpdate({ avatar: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="https://exemplo.com/avatar.jpg"
      />
    </div>
  </div>
);

const AppearanceSettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Tema</label>
      <select
        value={settings.theme}
        onChange={(e) => onUpdate({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="dark">Escuro</option>
        <option value="light">Claro</option>
        <option value="auto">Automático</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Cor primária</label>
      <input
        type="color"
        value={settings.primaryColor}
        onChange={(e) => onUpdate({ primaryColor: e.target.value })}
        className="w-20 h-10 border border-border rounded-lg cursor-pointer"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Tamanho da fonte</label>
      <select
        value={settings.fontSize}
        onChange={(e) => onUpdate({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="small">Pequena</option>
        <option value="medium">Média</option>
        <option value="large">Grande</option>
      </select>
    </div>
  </div>
);

const ChatSettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">
        Velocidade de digitação da IA: {settings.typingSpeed}ms
      </label>
      <input
        type="range"
        min="10"
        max="200"
        step="10"
        value={settings.typingSpeed}
        onChange={(e) => onUpdate({ typingSpeed: Number(e.target.value) })}
        className="w-full"
      />
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id="autoScroll"
        checked={settings.autoScroll}
        onChange={(e) => onUpdate({ autoScroll: e.target.checked })}
        className="w-4 h-4"
      />
      <label htmlFor="autoScroll" className="text-sm font-medium">
        Auto-scroll das mensagens
      </label>
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id="autoRename"
        checked={settings.autoRenameConversations}
        onChange={(e) => onUpdate({ autoRenameConversations: e.target.checked })}
        className="w-4 h-4"
      />
      <label htmlFor="autoRename" className="text-sm font-medium">
        Auto-renomear conversas
      </label>
    </div>
  </div>
);

const AISettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">Modelo de IA</label>
      <select
        value={settings.aiModel}
        onChange={(e) => onUpdate({ aiModel: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="llama2">Llama 2</option>
        <option value="codellama">Code Llama</option>
        <option value="mistral">Mistral</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">
        Criatividade (Temperature): {settings.temperature}
      </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={settings.temperature}
        onChange={(e) => onUpdate({ temperature: Number(e.target.value) })}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Mais preciso</span>
        <span>Mais criativo</span>
      </div>
    </div>
  </div>
);

const FilesSettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">
        Tamanho máximo de arquivo: {(settings.maxFileSize / 1024 / 1024).toFixed(0)}MB
      </label>
      <input
        type="range"
        min="1"
        max="100"
        step="1"
        value={settings.maxFileSize / 1024 / 1024}
        onChange={(e) => onUpdate({ maxFileSize: Number(e.target.value) * 1024 * 1024 })}
        className="w-full"
      />
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id="autoDownload"
        checked={settings.autoDownloadSmallFiles}
        onChange={(e) => onUpdate({ autoDownloadSmallFiles: e.target.checked })}
        className="w-4 h-4"
      />
      <label htmlFor="autoDownload" className="text-sm font-medium">
        Auto-download de arquivos pequenos (&lt;1MB)
      </label>
    </div>
  </div>
);

const AdvancedSettings = ({ settings, onUpdate }: { settings: UserSettings; onUpdate: (s: Partial<UserSettings>) => void }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">URL do servidor backend</label>
      <input
        type="url"
        value={settings.backendUrl}
        onChange={(e) => onUpdate({ backendUrl: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="http://localhost:5000"
      />
    </div>
    
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id="debugMode"
        checked={settings.debugMode}
        onChange={(e) => onUpdate({ debugMode: e.target.checked })}
        className="w-4 h-4"
      />
      <label htmlFor="debugMode" className="text-sm font-medium">
        Modo debug (logs detalhados)
      </label>
    </div>
  </div>
);