/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2b1f4a',
        grape: { DEFAULT: '#7340d9', light: '#9b6bff', dark: '#4a2a9e' },
        bubble: { DEFAULT: '#ff5fa2', light: '#ff8fc7' },
        lime: { DEFAULT: '#7ee04a', dark: '#4fae2a' },
        sun: { DEFAULT: '#ffc93c', light: '#fff07a' },
        aqua: { DEFAULT: '#32d1e5', dark: '#1a9fb3' },
        tangerine: '#ff8a3d',
        cream: '#fff7e8',
        night: '#231a52',
      },
      fontFamily: {
        game: ['Fredoka', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        chunky: '0 6px 0 #2b1f4a',
        'chunky-sm': '0 4px 0 #2b1f4a',
        soft: '0 10px 30px rgba(43,31,74,0.18)',
      },
      borderRadius: { blob: '2rem' },
    },
  },
  plugins: [],
};
