const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./src/**/*.svelte"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "10xl": "9rem",
        "11xl": "11rem",
      },
      height: {
        100: "25rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
