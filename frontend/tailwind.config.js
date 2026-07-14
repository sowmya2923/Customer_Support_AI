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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bbdffd',
          300: '#7cc4fa',
          400: '#36a7f5',
          500: '#0c8de7',
          600: '#0270c5',
          700: '#0359a0',
          800: '#074c84',
          900: '#0c406e',
          950: '#082849',
        },
      },
    },
  },
  plugins: [],
}
