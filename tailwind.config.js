/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Enhanced Purple Color Palette
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#5B21B6',
          light: '#C4B5FD'
        },
        secondary: {
          DEFAULT: '#4C1D95',
          dark: '#312e81',
          light: '#A78BFA'
        },
        accent: {
          DEFAULT: '#A855F7',
          dark: '#7C3AED',
          light: '#E9D5FF'
        },
        // New purple variations
        lavender: '#C4B5FD',
        neon: '#A855F7',
        deepViolet: '#5B21B6',
        softPurple: '#E9D5FF',
        mediumPurple: '#A78BFA',
        darkPurple: '#4C1D95',
        purpleGray: '#6B46C1',
        // Text colors
        textPrimary: '#F8FAFC',
        textSecondary: '#E2E8F0',
        textMuted: '#CBD5E1',
        textAccent: '#DDD6FE',
        // Status colors
        success: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#86EFAC'
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FCD34D'
        },
        error: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#FCA5A5'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(91, 33, 182, 0.9) 50%, rgba(76, 29, 149, 1) 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)',
        'gradient-nebula': 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.4) 50%, rgba(124, 58, 237, 0.5) 100%)',
        'gradient-purple-dark': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #6b21a8 100%)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { 
            'box-shadow': '0 0 20px rgba(139, 92, 246, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            'box-shadow': '0 0 30px rgba(168, 85, 247, 0.8)',
            transform: 'scale(1.05)'
          }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};