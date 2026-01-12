import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Eric the Dragon
        eric: {
          green: "#2D7D46",
          belly: "#A8D5A2",
          gold: "#FFD700",
          eyes: "#FF6B35",
        },
        // World of Lettoria
        lettoria: {
          dorp: "#F4E4BC",
          velden: "#FFE066",
          woud: "#1B4332",
          toppen: "#AED9E0",
          zee: "#1A759F",
          kasteel: "#9B5DE5",
        },
        // UI
        perkament: "#FEF9EF",
        succes: "#27AE60",
        fout: "#E74C3C",
        accent: "#F39C12",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
