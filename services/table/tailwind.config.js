/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./src/pages**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#29295F",
        secondary: "#F16729",
        accent: "#f2f2f9",
      },
      fontFamily: {
        sans: ["Lexend", "sans-serif"],
      },
      height: {
        inherit: "inherit",
      },
    },
  },
};
