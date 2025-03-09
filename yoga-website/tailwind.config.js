/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen",
        "Ubuntu",
        "Cantarell",
        "Fira Sans",
        "Droid Sans",
        "Helvetica Neue",
        "sans-serif",
      ],
    },
    extend: {},
  },
  plugins: [
    require("tailwindcss-animated"),
    plugin(function ({ addBase }) {
      addBase({
        h1: { fontSize: "2.25rem", fontWeight: "bold" }, // 36px
        h2: { fontSize: "1.875rem", fontWeight: "semibold" }, // 30px
        h3: { fontSize: "1.5rem", fontWeight: "medium" }, // 24px
        h4: { fontSize: "1.25rem", fontWeight: "normal" }, // 20px
        h5: { fontSize: "1.125rem" }, // 18px
        h6: { fontSize: "1rem" }, // 16px
      });
    }),
  ],
};
