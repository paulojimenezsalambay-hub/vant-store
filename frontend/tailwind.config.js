/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b0b',
        bone: '#f4efe6',
        gold: '#c9a96e',
        wine: '#5a1a2b'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        widest: '0.25em'
      }
    }
  },
  plugins: []
};
