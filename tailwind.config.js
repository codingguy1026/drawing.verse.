/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@devup-ui/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // DevUpUI Theme Colors
        dv: {
          background: "var(--dv-background, #ffffff)",
          panel: "var(--dv-panel, #f8f9fa)",
          panel2: "var(--dv-panel2, rgba(248,249,250,0.6))",
          border: "var(--dv-border, rgba(0,0,0,0.10))",
          text: "var(--dv-text, #1a1a1a)",
          muted: "var(--dv-muted, rgba(26,26,26,0.60))",
          brand: "var(--dv-brand, #7C3AED)",
          brand2: "var(--dv-brand2, #EC4899)",
          good: "var(--dv-good, #34D399)",
          danger: "var(--dv-danger, #F87171)",
        },
      },
    },
  },

  plugins: [],
};

module.exports = config;

