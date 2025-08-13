/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6c5ffc',
        darkBg: '#1f2937',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -60%)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -50%)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translate(-50%, -50%)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -60%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        fadeOut: 'fadeOut 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}

