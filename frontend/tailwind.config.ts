import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg:      "#0a0e1a",
          card:    "#0f1629",
          border:  "#1e2d4a",
          accent:  "#0ea5e9", // Blue Primary
          secondary: "#f97316", // Orange Secondary
          green:   "#10b981",
          red:     "#ef4444",
          yellow:  "#f59e0b",
          purple:  "#8b5cf6",
          text:    "#94a3b8",
          heading: "#e2e8f0",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(to right, #1e2d4a1a 1px, transparent 1px), linear-gradient(to bottom, #1e2d4a1a 1px, transparent 1px)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}
export default config
