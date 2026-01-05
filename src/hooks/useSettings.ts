import { useState, useEffect, useCallback } from 'react';
import { UserSettings, defaultSettings } from '@/types/settings';
import { json } from 'stream/consumers';

const SETTINGS_KEY = 'ollamacode-settings';

const hexToHsl = (hex: string): string => {
  const cleanHex = hex.replace('#', '');

  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(1 * 100)}%`;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((settingsToApply: UserSettings) => {
    const root = document.documentElement;

    try {
      root.classList.remove('dark', 'light');
      if (settingsToApply.theme === 'dark') {
        root.classList.add('dark');
      } else if (settingsToApply.theme === 'light') {
        root.classList.add('light');
      } else if (settingsToApply.theme === 'auto') {
        const prefersDark = window.matchMedia(('prefers-color-scheme: dark')).matches;
        root.classList.toggle('dark', prefersDark);
      }

      root.classList.remove('font-small', 'font-large');
      if (settingsToApply.fontSize === 'small') {
        root.classList.add('font-small');
      } else if (settingsToApply.fontSize === 'large') {
        root.classList.add('font-large');
      }

      const primaryHsl = hexToHsl(settingsToApply.primaryColor);
      const accentHsl = hexToHsl(settingsToApply.accentColor);

      root.style.setProperty('--dynamic-primary', primaryHsl);
      root.style.setProperty('--dynamic-accent', accentHsl);

      root.style.setProperty('--typing-speed', `${settingsToApply.typingSpeed}ms`);

      console.log('Configs aplicadas com sucesso');
    } catch (error) {
      console.error('Erro ao aplicar configs', error);
    }
  }, []);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const mergedSettings = { ...defaultSettings, ...parsed };
        setSettings({ ...defaultSettings, ...parsed });
        applySettings(mergedSettings);
      } else {
        applySettings(defaultSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      applySettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        if (settings.theme === 'auto') {
          applySettings(settings);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme, settings, applySettings]);

  // Salvar configurações
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        applySettings(updated);
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
      return updated;
    });
  }, [applySettings]);

  // Resetar configurações
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(SETTINGS_KEY);
      applySettings(defaultSettings);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    }
  }, [applySettings]);

  // Exportar configurações
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ollamacode-settings-${new Date().toISOString().split('T')[0]}.json`;
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

          const validatedSettings = { ...defaultSettings, ...imported };

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

  const getSetting = useCallback(<K extends keyof UserSettings>(key: K): UserSettings[K] => {
    return settings[key];
  }, [settings]);

  const isModified = useCallback((key: keyof UserSettings) => {
    return settings[key] !== defaultSettings[key];
  }, [settings]);

  const hasModifications = useCallback(() => {
    return JSON.stringify(settings) !== JSON.stringify(defaultSettings);
  }, [settings]);

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    applySettings,
    getSetting,
    isModified,
    hasModifications,
  };
};