import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        muted: '#6b7280',
        line: '#e5e7eb',
        canvas: '#f8fafc',
        brand: '#2563eb',
        sky: '#0ea5e9',
        success: '#10b981',
        warning: '#f59e0b',
      },
      boxShadow: {
        panel: '0 16px 42px rgba(15, 23, 42, 0.08)',
        soft: '0 8px 24px rgba(37, 99, 235, 0.10)',
      },
      borderRadius: {
        panel: '24px',
      },
      keyframes: {
        'scan-line': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateY(128px)', opacity: '1' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
