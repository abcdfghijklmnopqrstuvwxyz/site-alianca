import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050303',
        ash: {
          DEFAULT: '#0d0a0a',
          light: '#171213',
        },
        bone: {
          DEFAULT: '#e8ddd0',
          muted: '#a89f95',
        },
        blood: {
          DEFAULT: '#8a0000',
          bright: '#c81414',
          dark: '#2b0000',
        },
        ember: {
          DEFAULT: '#ff3b1f',
          glow: '#ff6a3d',
        },
        gold: {
          DEFAULT: '#c9a35a',
          dim: '#7a6636',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 22px rgba(200,20,20,0.5)',
        'glow-lg': '0 0 55px rgba(200,20,20,0.45)',
        'glow-gold': '0 0 20px rgba(201,163,90,0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.85' },
          '50%': { opacity: '1' },
          '55%': { opacity: '0.9' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3.2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.7s ease-out both',
        flicker: 'flicker 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
