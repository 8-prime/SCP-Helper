/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#e0e0e0',
        'background': '#121212',
        'primary': '#EA074F',
        'secondary': '#2A2A2A',
        'accent': '#595959',
       },       
    },
  },
  plugins: [],
}

