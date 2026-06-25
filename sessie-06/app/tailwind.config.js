/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rijk: {
          50: '#eef4fb',
          100: '#d9e6f6',
          500: '#154273',
          600: '#0f335a',
          700: '#0b2747',
        },
      },
    },
  },
  plugins: [],
}

