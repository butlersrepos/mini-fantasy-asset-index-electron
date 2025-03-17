/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,jsx,ts,tsx}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark': '#111111',
        'app-light': '#eeeeee',
      }
    },
  },
  plugins: [],
};
