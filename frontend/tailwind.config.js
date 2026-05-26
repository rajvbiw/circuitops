/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gada: {
          dark: "#0A192F",
          bg: "#172A45",
          accent: "#FBBF24", // Yellow/Gold
          accentHover: "#F59E0B",
          textLight: "#E6F1FF",
          textMuted: "#8892B0",
          cardBg: "#112240",
          cardBorder: "#233554",
          success: "#10B981",
          danger: "#EF4444"
        },
        circuit: {
          dark: "#0A192F",
          bg: "#172A45",
          accent: "#FBBF24",
          accentHover: "#F59E0B",
          textLight: "#E6F1FF",
          textMuted: "#8892B0",
          cardBg: "#112240",
          cardBorder: "#233554",
          success: "#10B981",
          danger: "#EF4444"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
