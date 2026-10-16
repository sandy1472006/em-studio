/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        em: {
          bg: '#0D1117',
          surface: '#141B24',
          'surface-light': '#1C2533',
          border: '#283341',
          'border-light': '#354559',
          'text-primary': '#E7EDF5',
          'text-secondary': '#98A6B7',
          'text-muted': '#6B7B8F',
          accent: '#55C8DD',
          'accent-hover': '#6DD4E7',
          'accent-muted': '#2A6B78',
          warning: '#D4A843',
          'warning-muted': '#7A6328',
          violet: '#9B7FD4',
          'violet-muted': '#5A4A7A',
          success: '#4CAF50',
          error: '#E57373',
          'positive-charge': '#E57373',
          'negative-charge': '#64B5F6',
          'e-field': '#55C8DD',
          'h-field': '#D4A843',
          'propagation': '#4CAF50',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
    },
  },
  plugins: [],
};
