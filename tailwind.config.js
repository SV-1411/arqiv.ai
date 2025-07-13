/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#1e1a16', // dark wood
          100: '#2d251f',
          200: '#3b2e2a',
          300: '#4a3a34',
          400: '#58463f',
          500: '#655247',
        },
        accent: {
          500: '#c89b3c', // antique gold
          600: '#d4a84d',
        },
        parchment: {
          100: '#f5e9d0',
          200: '#efe0c2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['\"IBM Plex Mono\"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
