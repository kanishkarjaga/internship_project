/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6ecff',
          200: '#c9d6ff',
          400: '#5e7cff',
          600: '#3b5bf5',
          700: '#2e49c8',
          900: '#15225c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(20, 33, 92, 0.25)',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
