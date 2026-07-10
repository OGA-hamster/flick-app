/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#2B1B34",
          light: "#3E2A4A",
          dark: "#1C1024",
        },
        lime: "#C6F135",
        coral: "#FF6F91",
        cream: "#FFF8F0",
        ink: "#120A17",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "28px",
      },
    },
  },
  plugins: [],
};
