/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './emails/**/*.html'
  ],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
};