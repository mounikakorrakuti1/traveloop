/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        /* Raw palette — usable as Tailwind classes */
        eggshell:  "#F4F1DE",
        peach:     "#E07A5F",
        indigo:    "#3D405B",
        teal:      "#81B29A",
        apricot:   "#F2CC8F",
        /* Legacy compat */
        primary: { DEFAULT: "#3D405B", light: "#4A4D6B", dark: "#2A2D47" },
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body:    ["Inter",  "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.618rem",
      },
    },
  },
  plugins: [],
};
