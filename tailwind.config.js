/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffffffeb",
        secondary: "#BABABA",
        accent: "#191e39", // Fixed: Removed double ##
        cards: "#1f2023",
        cards2: "#a4a4a421",
        cards3: "#2b2b2be2",
        hoverbg: "#8a8a8a",
        headerCard: "#1f2023",
        energybar: "#1D1D1D",
        btn: "#fff",
        btn2: "#1f2023",
        btn3: "#5A4420",
        btn4: '#fff',
        taskicon: "#6b69699c",
        divider: "#f3ba2f",
        borders: "#42361c",
        borders2: "rgb(54, 54, 54)",
        accent2: "#bcbcbc",
        cardtext: "#e7e7e7",
        lime: "#e1f75c",
        dimtext: "#ffffff71",
        divider2: "#554f3f",
        divider3: "#393D43",
        modal: "#303030",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        robotoMono: ["'Roboto Mono'", "monospace"],
        publicSans: ["'Public Sans'", "sans-serif"],
        monserrat: ["Montserrat", "sans-serif"],
        syne: ["Syne", "sans-serif"],
        orkney: ["Orkney", "sans-serif"],
        cerebri: ["'Cerebri Sans'", "sans-serif"]
      },
    },
    screens: {
      xs: "480px",
      ss: "600px",
      sm: "768px",
      ms: "1024px",
      md: "1140px",
      lg: "1200px",
      xl: "1700px",
    },
  },
  plugins: [], // Removed require('tailwindcss') from here as it causes a loop
};