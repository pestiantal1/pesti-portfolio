import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Primary color - main brand tone
        primary: {
          DEFAULT: '#0d1321', // Rich Black
          100: '#030407',
          200: '#05080d',
          300: '#080b14',
          400: '#0a0f1a',
          500: '#0d1321',
          600: '#283963',
          700: '#4260a6',
          800: '#7a92ca',
          900: '#bdc9e5'
        },
        // Secondary color - supporting accents
        secondary: {
          DEFAULT: '#1d2d44', // Prussian Blue
          100: '#06090e',
          200: '#0c121b',
          300: '#111b29',
          400: '#172436',
          500: '#1d2d44',
          600: '#36547e',
          700: '#517bb5',
          800: '#8ba7cd',
          900: '#c5d3e6'
        },
        
        // Accent color - for CTAs and interactive elements
        accent: {
          DEFAULT: '#3e5c76', // Payne's Gray
          100: '#0c1217',
          200: '#19242f',
          300: '#253746',
          400: '#31495e',
          500: '#3e5c76',
          600: '#547da0',
          700: '#7d9eba',
          800: '#a8bed1',
          900: '#d4dfe8'
        },
        
        // Neutral colors - backgrounds, text, borders
        neutral: {
          DEFAULT: '#748cab', // Silver Lake Blue
          100: '#151c24',
          200: '#2b3747',
          300: '#40536b',
          400: '#566e8f',
          500: '#748cab',
          600: '#8fa2bc',
          700: '#abb9cd',
          800: '#c7d1dd',
          900: '#e3e8ee'
        },
        
        // Additional light neutral for backgrounds
        light: {
          DEFAULT: '#f0ebd8', // Eggshell
          100: '#413919',
          200: '#837133',
          300: '#bca654',
          400: '#d6c895',
          500: '#f0ebd8',
          600: '#f2eedf',
          700: '#f6f2e7',
          800: '#f9f7ef',
          900: '#fcfbf7'
        }
      },
      fontFamily: {
        // Set Inter as the primary font
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        // Monospace font for code and typing animation
        mono: ['SF Mono', 'JetBrains Mono', 'Menlo', 'monospace'],
        // Optional display font for specific headings or accents
        display: ['Poppins', 'system-ui', 'sans-serif'],
        // Add a specific class for Inter
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography(),
  ],
}

export default config