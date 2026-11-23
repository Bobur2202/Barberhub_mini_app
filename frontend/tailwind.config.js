/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0F172A',
          'blue-dark': '#020617',
          'blue-light': '#F1F5F9',
          orange: '#D97706',
          'orange-hover': '#B45309',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#64748B',
          dark: '#0F172A',
        }
      },
      borderRadius: {
        'card': '16px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
