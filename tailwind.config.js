/** @type {import('tailwindcss').Config} */
export default {
  content: ['./renderer/**/*.{js,jsx,ts,tsx}', './styles/**/*.css'],
  theme: {
    extend: {
      colors: {
        base: '#111218',
        panel: '#171923',
        panelSoft: '#1d2030',
        border: '#2a2f45',
        textMain: '#e8ebf8',
        textMuted: '#99a1bf',
        accent: '#6e7bff'
      }
    }
  },
  plugins: []
};
