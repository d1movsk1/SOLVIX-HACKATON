/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', 'sans-serif'],
        serif:   ['"Lora"', 'Georgia', 'serif'],
        mono:    ['monospace'],
      },
      fontSize: {
        // Поголеми базни фонтови низ целата апп
        xs:   ['0.8rem',  { lineHeight: '1.5' }],
        sm:   ['0.95rem', { lineHeight: '1.6' }],
        base: ['1.05rem', { lineHeight: '1.7' }],
        lg:   ['1.2rem',  { lineHeight: '1.6' }],
        xl:   ['1.35rem', { lineHeight: '1.5' }],
        '2xl':['1.6rem',  { lineHeight: '1.3' }],
        '3xl':['2rem',    { lineHeight: '1.2' }],
        '4xl':['2.5rem',  { lineHeight: '1.1' }],
        '5xl':['3.2rem',  { lineHeight: '1.05' }],
        '6xl':['4rem',    { lineHeight: '1' }],
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
