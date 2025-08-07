/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'air-force': {
          blue: '#1E3A8A',
          silver: '#C0C0C0',
          dark: '#1F2937',
        }
      }
    },
  },
  plugins: [],
};