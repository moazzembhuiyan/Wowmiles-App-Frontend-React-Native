/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: '#4145B6',
        navy: '#2E347E',
        canvas: '#F8F9FB',
        ink: '#202638',
        muted: '#7C8494',
        line: '#E5E8EF',
        gold: '#C48B21',
      },
    },
  },
  plugins: [],
};
