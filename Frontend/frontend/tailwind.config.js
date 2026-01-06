/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRÍTICO: Las rutas de contenido
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Configuraciones de color para tu diseño
      colors: {
        'background-main': '#0b0f1a', // Fondo oscuro del dashboard
        'primary-yellow': '#f0b90b', // Amarillo de la marca
      }
    },
  },
  plugins: [],
}