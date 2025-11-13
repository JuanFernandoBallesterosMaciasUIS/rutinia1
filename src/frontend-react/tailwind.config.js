/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        "background-light": "#F9FAFB",
        "background-dark": "#111827",
        "card-light": "#FFFFFF",
        "card-dark": "#1F2937",
        "text-light": "#1F2937",
        "text-dark": "#F9FAFB",
        "subtext-light": "#6B7280",
        "subtext-dark": "#9CA3AF",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        "large": "1.5rem"
      },
      screens: {
        'xs': '320px',  // Extra pequeño
        'sm': '640px',  // Pequeño
        'md': '768px',  // Medio
        'lg': '1024px', // Grande
        'xl': '1280px', // Extra grande
        '2xl': '1536px' // 2x Grande
      }
    },
  },
  plugins: [],
}
