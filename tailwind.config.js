/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#1a1612',
          soft: '#4a4540',
          muted: '#8a8480',
        },
        parchment: {
          DEFAULT: '#f5f0e8',
          2: '#ede8dc',
          3: '#e2dcd0',
        },
        gold: {
          DEFAULT: '#b8963e',
          light: '#d4b06a',
          dim: '#7a6128',
        },
        riznica: {
          red: '#8b2e2e',
          green: '#2e5e3e',
        },
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(26,22,18,.08)',
        lift: '0 8px 32px rgba(26,22,18,.14)',
        modal: '0 20px 60px rgba(26,22,18,.22)',
      },
      animation: {
        pulse2: 'pulse 2s cubic-bezier(.4,0,.6,1) infinite',
      },
       fontSize: {
        'xs':  ['0.85rem',  { lineHeight: '1.4' }],
        'sm':  ['1rem',     { lineHeight: '1.5' }],
        'base':['1.1rem',   { lineHeight: '1.6' }],
        'lg':  ['1.2rem',   { lineHeight: '1.6' }],
        'xl':  ['1.35rem',  { lineHeight: '1.5' }],
        '2xl': ['1.6rem',   { lineHeight: '1.4' }],
        '3xl': ['1.95rem',  { lineHeight: '1.3' }],
        '4xl': ['2.4rem',   { lineHeight: '1.2' }],
        '5xl': ['3rem',     { lineHeight: '1.1' }],
        '6xl': ['3.6rem',   { lineHeight: '1.05' }],
        '7xl': ['4.2rem',   { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
}
