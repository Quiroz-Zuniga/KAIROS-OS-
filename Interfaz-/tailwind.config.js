/** @type {import('tailwindcss').Config} */
export default {
  content: ["./*.{html,js}", "./src/**/*.{html,js}", "./resources/**/*.{html,js}"],
  theme: {
    extend: {
      colors: { uphos: {
        blue: '#181858', deep: '#101050', night: '#11113F', medium: '#303070', lavender: '#6666A0',
        gold: '#E8A810', accent: '#E8B010', 'gold-light': '#F2C13D', 'gold-soft': '#F8D978', cream: '#FFF2BF'
      } }
    },
  },
  plugins: []
}
