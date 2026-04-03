/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          surface: '#111111',
          card: '#1a1a1a',
          text: '#ffffff',
          'text-secondary': '#e5e5e5',
          'text-muted': '#a3a3a3',
        },
        light: {
          bg: '#ffffff',
          surface: '#f5f5f5',
          card: '#ffffff',
          text: '#000000',
          'text-secondary': '#333333',
          'text-muted': '#666666',
        }
      }
    },
  },
  plugins: [],
};

