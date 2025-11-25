import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/core/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Halloween theme colors - Requirements 12.4
        halloween: {
          purple: '#8B5CF6',
          'purple-dark': '#6D28D9',
          'purple-light': '#A78BFA',
          green: '#22C55E',
          'green-dark': '#16A34A',
          'green-light': '#4ADE80',
          orange: '#F97316',
          'orange-dark': '#EA580C',
          'orange-light': '#FB923C',
          black: '#0A0A0A',
          'black-light': '#1A1A2E',
        },
        // Tech-themed colors for web designer
        primary: '#8B5CF6',
        secondary: '#6366F1',
        accent: '#22C55E',
        // Dark mode backgrounds - Requirements 12.1
        background: '#0A0A0A',
        surface: '#1A1A2E',
        'surface-elevated': '#252542',
        'text-primary': '#FAFAFA',
        'text-muted': '#A1A1AA',
      },
      fontFamily: {
        // Spooky font for headings - Requirements 12.5
        heading: ['var(--font-creepster)', 'cursive'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        // Neon glow shadows for Halloween effect
        'neon-purple': '0 0 5px #8B5CF6, 0 0 10px #8B5CF6, 0 0 20px #8B5CF6',
        'neon-green': '0 0 5px #22C55E, 0 0 10px #22C55E, 0 0 20px #22C55E',
        'neon-orange': '0 0 5px #F97316, 0 0 10px #F97316, 0 0 20px #F97316',
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.3)',
        'glow-md': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-lg': '0 0 30px rgba(139, 92, 246, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '75%': { opacity: '0.9' },
        },
      },
      backgroundImage: {
        'gradient-halloween': 'linear-gradient(135deg, #8B5CF6 0%, #F97316 100%)',
        'gradient-spooky': 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
