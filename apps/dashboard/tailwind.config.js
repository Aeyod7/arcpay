/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004c22",
        "primary-container": "#166534",
        secondary: "#54615b",
        background: "#faf9f9",
        "surface-white": "#FFFFFF",
        "usdc-blue": "#2775CA"
      }
    },
  },
  plugins: [],
}
