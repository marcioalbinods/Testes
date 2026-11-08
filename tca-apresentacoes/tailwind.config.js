/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), sunk: v('sunk'), ink: v('ink'), muted: v('muted'), line: v('line'),
        brand: v('brand'), 'brand-ink': v('brand-ink'), violet: v('violet'), coral: v('coral'), mint: v('mint'), sun: v('sun'),
        danger: v('danger'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
        body: ['"Atkinson Hyperlegible"', 'Verdana', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
};
