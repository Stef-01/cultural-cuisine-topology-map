/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          card: '#111118',
          hover: '#1a1a24',
        },
        text: {
          DEFAULT: '#e8e4dd',
          dim: '#a89f94',
          muted: '#6b6560',
        },
        accent: {
          DEFAULT: '#d4a574',
          hover: '#e0b58a',
          dim: 'rgba(212, 165, 116, 0.15)',
        },
        gi: {
          low: '#6a9968',
          medium: '#d4a574',
          high: '#c17d5d',
          vhigh: '#c94c4c',
        },
        cuisine: {
          indian: '#e07b39',
          mexican: '#c94c4c',
          japanese: '#4e8d7c',
          mediterranean: '#7ba05b',
          ethiopian: '#c6783e',
          thai: '#d4a017',
          korean: '#8b5e83',
          westAfrican: '#b87333',
          peruvian: '#5b7ea0',
          middleEastern: '#a0785b',
        }
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
