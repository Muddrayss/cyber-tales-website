/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#34485D', // Updated primary
        'primary-light': '#50687A', // New primary light
        secondary: '#007688', // Updated secondary
        'secondary-light': '#00B4D8', // Adjusted secondary light
        tertiary: '#1D2E43', // New tertiary based on darker shade
        accent: '#00897B', // Updated accent
        highlight: '#FFF100', // Unchanged or adjust as needed
        background: '#FFFFFF', // Unchanged
        surface: '#F1FAEE', // Unchanged
        error: '#E63946', // Unchanged
        'on-primary': '#FFFFFF', // Suitable for primary
        'on-secondary': '#FFFFFF', // Suitable for secondary
        'on-background': '#1D3557', // Adjusted for better visibility
        'on-surface': '#1D3557', // Unchanged
        'on-error': '#FFFFFF', // Unchanged
      },
    },
  },
  plugins: [require('flowbite/plugin'), require('@tailwindcss/aspect-ratio')],
};
