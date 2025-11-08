/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        fontFamily: {
          'vazir': ['Vazir', 'sans-serif'],
          'iran-sans': ['Iranian Sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }