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
        'mri-blue': '#002B5B',
        'mri-teal': '#00A896',
        'mri-cyan': '#02C39A',
        'mri-glow': '#0284c7', // sky-600
        'glass-bg': 'rgba(255, 255, 255, 0.7)',
        'glass-border': 'rgba(255, 255, 255, 0.3)',
        'tissue-gm': '#b794f6',   // violet
        'tissue-wm': '#f0d3a0',   // warm sand
        'tissue-csf': '#52e8d4',  // teal
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
        'hero-glow': 'radial-gradient(ellipse 900px 500px at 15% -10%, rgba(82,232,212,0.06), transparent 60%), radial-gradient(ellipse 900px 600px at 100% 10%, rgba(183,148,246,0.05), transparent 55%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'sweep': 'sweep 5s ease-in-out infinite',
        'pulse-fast': 'pulseFast 1.6s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(2, 195, 154, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(2, 195, 154, 0.8)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sweep: {
          '0%': { top: '-40%' },
          '50%': { top: '100%' },
          '100%': { top: '-40%' },
        },
        pulseFast: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      }
    },
  },
  plugins: [],
};
export default config;
