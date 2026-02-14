/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: { 50: '#f0ece4', 100: '#e8e2d8', 200: '#c8c4bc', 300: '#a3b5a8', 400: '#8a9e8f', 500: '#5a6e60', 600: '#3a4a40', 700: '#1e2a30', 800: '#131b2e', 900: '#0c1220', 950: '#080e1a' },
        sage: { 50: '#f0f4f1', 100: '#dce5de', 200: '#b8ccbc', 300: '#a3b5a8', 400: '#8a9e8f', 500: '#6b8270', 600: '#5a6e60', 700: '#4a5c4e', 800: '#3a4a3e', 900: '#2a382e' },
        pearl: { 50: '#f8f6f2', 100: '#f0ece4', 200: '#e8e2d8', 300: '#d8d0c4', 400: '#c0b8ac' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 8px 30px -4px rgba(0, 0, 0, 0.3)',
        'sage-glow': '0 0 20px rgba(138, 158, 143, 0.12)',
      },
    },
  },
  plugins: [],
}
