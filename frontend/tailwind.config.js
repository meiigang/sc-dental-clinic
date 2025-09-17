/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-light': 'var(--blue-light)',
        'blue-primary': 'var(--blue-primary)',
        'blue-dark': 'var(--blue-dark)',
        'blue-accent': 'var(--blue-accent)',
        // add more custom colors as needed
      },
    },
  },
  plugins: [],
};
