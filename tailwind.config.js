/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Shorif Sans', 'Bangla', 'Siyam Rupali', 'AdorshoLipi', 'sans-serif'],
        mixed: ['Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Shorif Sans', 'Bangla', 'Siyam Rupali', 'AdorshoLipi', 'Inter', 'system-ui', 'sans-serif'],
        bn: ['Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Shorif Sans', 'Bangla', 'Siyam Rupali', 'AdorshoLipi', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
