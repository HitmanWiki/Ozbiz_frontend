/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fa',  100: '#dce6f4', 200: '#b4cae8', 300: '#7ca5d6',
          400: '#4a80c0', 500: '#2d5fa4', 600: '#1e4a8a', 700: '#163870',
          800: '#0f2a56', 900: '#0a1d3d', 950: '#060f20',
        },
        gold: {
          50: '#fdfbf3',  100: '#fbf3d9', 200: '#f5e4aa', 300: '#edcf72',
          400: '#e4b840', 500: '#c8971e', 600: '#a67a16', 700: '#855f11',
          800: '#6b4c10', 900: '#5a3e11',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.slate.700'),
            maxWidth: 'none',
            a: { color: theme('colors.navy.700'), '&:hover': { color: theme('colors.gold.600') } },
            h2: { color: theme('colors.navy.900'), fontFamily: 'Playfair Display, serif' },
            h3: { color: theme('colors.navy.900'), fontFamily: 'Playfair Display, serif' },
            strong: { color: theme('colors.navy.900') },
            blockquote: {
              borderLeftColor: theme('colors.gold.400'),
              color: theme('colors.slate.600'),
              fontStyle: 'italic',
            },
            code: {
              backgroundColor: theme('colors.slate.100'),
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.85em',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
