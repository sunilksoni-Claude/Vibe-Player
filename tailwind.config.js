/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#003d5c',
        accent:    '#FF6F00',
        maroon:    '#6B1D1D',
        gold:      '#D4AF37',
        cream:     '#F5E6D3',
        'cream-2': '#E8D5C4',
        muted:     '#8B6F47',
        hover:     '#FF8C00',
      },
      fontFamily: {
        sans:    ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'ripple':   'ripple 0.6s ease-out',
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        ripple:    { '0%': { transform: 'scale(0)', opacity: '0.6' }, '100%': { transform: 'scale(4)', opacity: '0' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseGold: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
