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
          blue: '#004B86',
          'blue-dark': '#003660',
          'blue-light': '#E9F1F7',
          orange: '#FAA100',
          'orange-hover': '#E59400',
          bg: '#E6EDF9',
          card: '#FFFFFF',
          muted: '#6B7280',
          dark: '#111827',
        }
      },
      borderRadius: {
        'card': '14px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
