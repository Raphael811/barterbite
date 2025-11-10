/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify all files that should be scanned for Tailwind CSS classes
  content: [
    "./src//*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
