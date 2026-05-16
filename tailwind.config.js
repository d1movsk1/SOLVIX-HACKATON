/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink:       { DEFAULT: '#1a1612', soft: '#4a4540', muted: '#8a8480' },
        parchment: { DEFAULT: '#f0e8d0', 2: '#e8dfc8', 3: '#d4c9a8' },
        gold:      { DEFAULT: '#b8963e', light: '#d4b06a', dim: '#7a6128' },
        riznica: {
          red:   '#8b2e2e',
          green: '#2e5e3e',
        },
      },
      borderRadius: { xl2: '1rem', xl3: '1.25rem' },
      boxShadow: {
        card:  '0 2px 8px rgba(26,22,18,.08)',
        lift:  '0 8px 32px rgba(26,22,18,.14)',
        modal: '0 20px 60px rgba(26,22,18,.22)',
      },
    },
  },
  plugins: [],
}
