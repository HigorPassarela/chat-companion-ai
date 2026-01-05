import React from 'react';
import { useDarkMode } from '@/hooks/useDarkMode';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, isFirstVisit, setFirstVisitComplete } = useDarkMode();

    const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
        setTheme(selectedTheme);
        setFirstVisitComplete();
    };

    if(!isFirstVisit){
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
              Bem-vindo! 🎨
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Escolha o tema que mais combina com você
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeSelect('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="bg-white border rounded p-3 mb-3 shadow-sm">
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-100 rounded mb-1"></div>
                  <div className="h-1 bg-gray-100 rounded"></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ☀️ Tema Claro
                </span>
              </button>
    
              <button
                onClick={() => handleThemeSelect('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-3 shadow-sm">
                  <div className="h-2 bg-gray-600 rounded mb-2"></div>
                  <div className="h-2 bg-gray-700 rounded mb-1"></div>
                  <div className="h-1 bg-gray-700 rounded"></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  🌙 Tema Escuro
                </span>
              </button>
            </div>
    
            <button
              onClick={() => handleThemeSelect(theme)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      );
    };
    
    export default ThemeSelector;
