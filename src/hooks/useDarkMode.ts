import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface UseDarkModeReturn {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    isFirstVisit: boolean;
    setFirstVisitComplete: () => void;
}

export const useDarkMode = (): UseDarkModeReturn => {
    const [theme, setThemeState] = useState<Theme>('light');
    const [isFirstVisit, setIsFirstVisit] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log('Inicializando tema...');

        const savedTheme = localStorage.getItem('theme') as Theme;
        const hasVisited = localStorage.getItem('hasVisitedBefore');

        console.log('Tema salvo:', savedTheme);
        console.log('Já visitou:', hasVisited);

        if (!hasVisited) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            console.log('Primeira visita, prefere dark:', prefersDark);
            setIsFirstVisit(true);
            setThemeState(prefersDark ? 'dark' : 'light');
        } else if (savedTheme) {
            console.log('Usando tema salvo:', savedTheme);
            setThemeState(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            console.log('Fallback, prefere dark:', prefersDark);
            setThemeState(prefersDark ? 'dark' : 'light');
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            console.log('Aplicando tema:', theme);

            document.documentElement.classList.remove('light', 'dark');
            document.body.classList.remove('light', 'dark');

            document.documentElement.classList.add(theme);
            document.body.classList.add(theme);

            localStorage.setItem('theme', theme);

            console.log('Classes aplicadas:', document.documentElement.classList.toString());
        }
    }, [theme, isLoaded]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        console.log('Alternando tema de', theme, 'para', newTheme);
        setThemeState(newTheme);
    };

    const setTheme = (newTheme: Theme) => {
        console.log('Definindo tema para:', newTheme);
        setThemeState(newTheme);
    };

    const setFirstVisitComplete = () => {
        console.log('Primeira visita completa');
        localStorage.setItem('hasVisitedBefore', 'true');
        setIsFirstVisit(false);
    };

    return {
        theme,
        toggleTheme,
        setTheme,
        isFirstVisit,
        setFirstVisitComplete
    };
};