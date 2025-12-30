import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        user: {
          bubble: "hsl(var(--user-bubble))",
        },
        ai: {
          bubble: "hsl(var(--ai-bubble))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        dynamic: {
          primary: "var(--dynamic-primary)",
          accent: "var(--dynamic-accent)",
        },
        settings: {
          sucess: "hsl(142 76% 36%)",
          warning: "hsl(38 92% 50%)",
          error: "hsl(0 84% 60%)",
          info: "hsl(217 91% 60%)"
        },
      },
      fontSize: {
        'settings-xs': ['var(--font-size-xs, 0.75rem)', { lineHeight: '1rem' }],
        'settings-sm': ['var(--font-size-sm, 0.875rem)', { lineHeight: '1.25rem' }],
        'settings-base': ['var(--font-size-base, 1rem)', { lineHeight: '1.5rem' }],
        'settings-lg': ['var(--font-size-lg, 1.125rem)', { lineHeight: '1.75rem' }],
        'settings-xl': ['var(--font-size-xl, 1.25rem)', { lineHeight: '1.75rem' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'settings-xs': 'var(--spacing-xs, 0.25rem)',
        'settings-sm': 'var(--spacing-sm, 0.5rem)',
        'settings-md': 'var(--spacing-md, 1rem)',
        'settings-lg': 'var(--spacing-lg, 1.5rem)',
        'settings-xl': 'var(--spacing-xl, 2rem)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "settings-slide-in": {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "color-transition": {
          from: { filter: "hue-rotate(0deg)" },
          to: { filter: "hue-rotate(360deg)" },
        },
        "pulse-success": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)"
          },
          "50%": {
            boxShadow: "0 0 0 10px rgba(34, 197, 94, 0)"
          },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "settings-slide-in": "settings-slide-in 0.3s ease-out",
        "color-transition": "color-transition 2s linear infinite",
        "pulse-success": "pulse-success 1s ease-in-out",
        "shake": "shake 0.5s ease-in-out",
      },
      transitionProperty: {
        'settings': 'color, background-color, border-color, font-size, padding, margin',
      },
      transitionDuration: {
        'settings': '300ms',
      },
      backdropBlur: {
        'settings': '8px',
      },
      boxShadow: {
        'settings-card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'settings-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'settings-focus': '0 0 0 3px var(--dynamic-primary, hsl(var(--primary)))',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities, theme }: any) {
      const newUtilities = {
        '.settings-transition': {
          transition: 'all 300ms ease-in-out',
        },
        '.settings-focus': {
          '&:focus': {
            outline: 'none',
            boxShadow: theme('boxShadow.settings-focus'),
          },
        },
        '.settings-card': {
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.settings-card'),
        },
        '.font-size-small': {
          fontSize: 'var(--font-size-sm, 0.875rem)',
          lineHeight: 'var(--line-height-sm, 1.25)',
        },
        '.font-size-medium': {
          fontSize: 'var(--font-size-base, 1rem)',
          lineHeight: 'var(--line-height-base, 1.5)',
        },
        '.font-size-large': {
          fontSize: 'var(--font-size-lg, 1.125rem)',
          lineHeight: 'var(--line-height-lg, 1.75)',
        },
      }

      addUtilities(newUtilities)
    }
  ],
} satisfies Config;