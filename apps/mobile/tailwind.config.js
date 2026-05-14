/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#F5F5F2",
        surface: "#FAFAF8",
        ink: "#111111",
        "ink-secondary": "rgba(0,0,0,0.45)",
        "ink-tertiary": "rgba(0,0,0,0.28)",
        border: "rgba(0,0,0,0.06)",
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
