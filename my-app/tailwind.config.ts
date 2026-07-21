import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'mri-blue': '#1E3A8A',    // Deep slate blue
        'mri-teal': '#0F766E',    // Muted clinical teal
        'mri-cyan': '#0369A1',    // Muted cyan
        'mri-glow': '#2563EB',    // Standard medical blue (no glow)
        'glass-bg': '#FFFFFF',
        'glass-border': '#E2E8F0',
        'tissue-gm': '#8B5CF6',   // violet
        'tissue-wm': '#FCD34D',   // warm sand
        'tissue-csf': '#2DD4BF',  // teal
      }
    },
  },
  plugins: [],
};
export default config;
