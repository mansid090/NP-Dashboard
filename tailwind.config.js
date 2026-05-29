/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        np: {
          navy:   '#1B2B3A',
          blue:   '#1579be',
          'blue-dark': '#0e5a94',
          'blue-light': '#e8f2f8',
          orange: '#F26522',
          'orange-light': '#fef3ec',
          bg:     '#F5F7FA',
          card:   '#FFFFFF',
          border: '#E2E8F0',
          text:   '#1E293B',
          muted:  '#64748B',
          success:'#16A34A',
          warning:'#D97706',
          error:  '#DC2626',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px rgba(21,121,190,0.12), 0 8px 28px rgba(0,0,0,0.08)',
        header: '0 2px 12px rgba(0,0,0,0.15)',
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-once': 'pulse 0.6s ease-in-out 1',
        'gauge-fill': 'gaugeFill 1.2s ease-out forwards',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        gaugeFill:{ from: { strokeDashoffset: '267' }, to: {} },
      },
    },
  },
  plugins: [],
}
