// tailwind.config.js
module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {
         animation: {
           // Анимация, которая плавно перемещает фон
           gradient: 'gradient 5s ease infinite',
         },
         keyframes: {
           gradient: {
             '0%, 100%': { 'background-position': '0% 50%' },
             '50%': { 'background-position': '100% 50%' },
           },
         },
       },
     },
     plugins: [],
   }
   