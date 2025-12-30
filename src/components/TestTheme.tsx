import { useDarkMode } from "@/hooks/useDarkMode";

const TestTheme = () => {
    const {theme, toggleTheme, isFirstVisit} = useDarkMode();

    console.log('Theme atual:', theme);
    console.log('Primeira visita:', isFirstVisit);
    console.log('Classes do HTML:', document.documentElement.classList.toString());

    return (
        <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border rounded shadow">
          <p>Tema: {theme}</p>
          <p>Primeira visita: {isFirstVisit ? 'Sim' : 'Não'}</p>
          <button 
            onClick={toggleTheme}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            Toggle Theme
          </button>
        </div>
      );
    };
    
    export default TestTheme;