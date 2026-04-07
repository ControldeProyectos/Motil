/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        motil: {
          dark: '#1a2744',
          navy: '#1e3560',
          blue: '#2563eb',
        }
      },
    },
  },
  plugins: [],
}

