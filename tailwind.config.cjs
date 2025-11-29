module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      xs: '360px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1400px'
    },
    extend: {
      colors: {
        prospout: {
          50: '#f6fbff',
          100: '#eef7ff',
          200: '#d1e9ff',
          500: '#3b82f6'
        },
        // Vision UI Colors
        vision: {
          dark: '#0f172a',
          darker: '#0a0e27',
          card: 'rgba(15, 23, 42, 0.7)',
          cyan: '#00d9ff',
          purple: '#7928ca',
          orange: '#ff6b35',
          emerald: '#10b981',
          blue: '#3b82f6'
        }
      },
      backdropBlur: {
        xl: '20px'
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(0, 217, 255, 0.1)',
        'glow-purple': '0 0 30px rgba(121, 40, 202, 0.3), 0 0 60px rgba(121, 40, 202, 0.1)',
        'glow-orange': '0 0 30px rgba(255, 107, 53, 0.3), 0 0 60px rgba(255, 107, 53, 0.1)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)'
      }
    }
  },
  plugins: []
}
