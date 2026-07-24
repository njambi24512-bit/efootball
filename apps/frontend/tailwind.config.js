module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: '#0B1220',
          light: '#121B2E',
          lighter: '#1A2540'
        },
        turf: {
          DEFAULT: '#2F8F5B',
          dark: '#1F5D3A'
        },
        chalk: '#F1F3F0',
        floodlight: '#E8B34C',
        slate: {
          card: '#9BA6B3'
        },
        card: '#D6483F'
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      letterSpacing: {
        wider2: '0.08em'
      }
    }
  },
  plugins: []
};
