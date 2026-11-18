import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spark: {
          amber: {
            DEFAULT: "#FFB020",
            50: "#FFF8EB",
            100: "#FFEFC6",
            200: "#FFDF8A",
            300: "#FFC94D",
            400: "#FFB020",
            500: "#F59E0B",
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
          },
          indigo: {
            DEFAULT: "#1E1B4B",
            50: "#EEF2FF",
            100: "#E0E7FF",
            200: "#C7D2FE",
            300: "#A5B4FC",
            400: "#818CF8",
            500: "#6366F1",
            600: "#4F46E5",
            700: "#4338CA",
            800: "#312E81",
            900: "#1E1B4B",
          },
          cyan: {
            DEFAULT: "#22D3EE",
            400: "#22D3EE",
            500: "#06B6D4",
            600: "#0891B2",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        spark: "0 8px 24px -8px rgba(255, 176, 32, 0.25)",
        card: "0 4px 16px -4px rgba(30, 27, 75, 0.08)",
      },
      keyframes: {
        "spark-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bloom: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "spark-pulse": "spark-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.25s ease-out",
        bloom: "bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;