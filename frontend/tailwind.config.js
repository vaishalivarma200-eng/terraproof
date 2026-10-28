/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        moss: {
          50: '#f4faf7',
          100: '#e6f4ee',
          200: '#cce9dd',
          300: '#a3d6c3',
          400: '#71bca2',
          500: '#4da084',
          600: '#3a8169',
          700: '#2f6755',
          800: '#275244',
          900: '#22443a',
          950: '#0f2620',
        },
        calm: {
          50: '#f6faf9',
          100: '#ebf4f2',
          200: '#d7eae6',
          300: '#b8dad3',
          400: '#92c4ba',
          500: '#71a99f',
          800: '#14312b',
          900: '#0d241f',
          950: '#071613',
        }
      }
    },
  },
  plugins: [],
}
