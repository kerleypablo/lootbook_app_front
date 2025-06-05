/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
        colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)'
      }
    },
  },
  plugins: [],
}