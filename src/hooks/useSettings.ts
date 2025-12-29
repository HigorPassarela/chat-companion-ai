import { useState, useEffect, useCallback } from 'react';
import { UserSettings, defaultSettings } from '@/types/settings';

const SETTINGS_KEY = 'ollamacode-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Mesclar com configurações padrão para garantir que novas configurações existam
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar configurações
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
      return updated;
    });
  }, []);

  // Resetar configurações
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    }
  }, []);

  // Exportar configurações
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ollamacode-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [settings]);

  // Importar configurações
  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          updateSettings(imported);
          resolve();
        } catch (error) {
          reject(new Error('Arquivo de configurações inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, [updateSettings]);

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
};