/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        game: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        'card-green': '#2d6a4f',
        'card-red':   '#c1121f',
      },
    },
  },
  plugins: [],
};
