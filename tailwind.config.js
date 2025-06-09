/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        text: '#1a1a1a',
        primary: '#1d4ed8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    'text-primary',
    'bg-primary',
    'text-background',
    'bg-background',
    'text-text',
    'bg-text'
  ]
}