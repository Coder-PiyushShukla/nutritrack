/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#174A3A',
          deep: '#10362A',
          dark: '#0D2B22',
          surface: '#174A3A',
          light: '#235C4A',
        },
        ivory: {
          DEFAULT: '#F6F4EA',
          light: '#FCFBF6',
          dark: '#EBE7D8',
          muted: '#DFDBC9',
        },
        lime: {
          DEFAULT: '#C6E86B',
          hover: '#B5DC51',
          bright: '#D4F27C',
          muted: '#A9CE47',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(23, 74, 58, 0.06)',
        'lift': '0 12px 32px -4px rgba(23, 74, 58, 0.12)',
        'lime-glow': '0 0 25px -4px rgba(198, 232, 107, 0.45)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      }
    },
  },
  plugins: [],
}
