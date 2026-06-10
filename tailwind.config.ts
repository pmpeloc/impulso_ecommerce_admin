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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-input": "var(--surface-input)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        brand: "var(--brand)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        ai: "var(--ai)",
      },
      boxShadow: {
        brand: "0 0 24px rgba(99, 102, 241, 0.28)",
        panel: "0 2px 8px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
