/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Dark mode desteği için
  theme: {
    extend: {
      colors: {
        primary: "#6d28d9", // Senin index.html'deki özel rengin
        "primary-focus": "#5b21b6",
        "background-light": "#ffffff",
        "background-dark": "#181820",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Eğer yüklü değilse hata verebilir, npm install @tailwindcss/forms gerekebilir.
    // Hata alırsan bu satırı silip tekrar dene.
  ],
}