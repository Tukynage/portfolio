/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
   "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontSize: {
      xs : '0.6rem'
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        "theme-tirage": {
          // Bases — papier baryté, galerie d'art
          "base-100": "#FAF9F6",
          "base-200": "#F1EDE4",
          "base-300": "#E3DBCE",
          "base-content": "#1C1816",
          // Accents — Kodak orange mat, cognac, sage
          "primary": "#C45020",
          "primary-content": "#FFFFFF",
          "secondary": "#7A5840",
          "secondary-content": "#FFF5EC",
          "accent": "#4E7566",
          "accent-content": "#F0FFF8",
          // Neutral — pour footers / overlays sombres
          "neutral": "#28221E",
          "neutral-content": "#F0EDE6",
          // Status
          "info": "#2D6BA4",
          "info-content": "#EDF4FF",
          "success": "#2A7A4E",
          "success-content": "#EDFFF5",
          "warning": "#B86A00",
          "warning-content": "#FFF8E6",
          "error": "#B52D2D",
          "error-content": "#FFF0F0",
          // Arrondi premium
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.375rem",
          "--rounded-badge": "1rem",
        },
      },
      {
        "theme-negatif": {
          // Bases — chambre noire, brun très profond, jamais de noir pur
          "base-100": "#18100A",
          "base-200": "#221610",
          "base-300": "#301E14",
          "base-content": "#F4E4C8",
          // Accents — orange vif, magenta rubis, or-ambre
          "primary": "#F07030",
          "primary-content": "#1A0C04",
          "secondary": "#C0405A",
          "secondary-content": "#FFEEF2",
          "accent": "#E8A430",
          "accent-content": "#1A0C04",
          // Neutral — profondeur maximale pour les zones d'ombre
          "neutral": "#100A06",
          "neutral-content": "#F4E4C8",
          // Status
          "info": "#60A8E8",
          "info-content": "#081828",
          "success": "#50C87A",
          "success-content": "#051A0D",
          "warning": "#F0A020",
          "warning-content": "#1A0C00",
          "error": "#F04060",
          "error-content": "#1A0408",
          // Arrondi premium
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.375rem",
          "--rounded-badge": "1rem",
        },
      },
    ],
  },
}

