/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#e8e8ed",
        card: { DEFAULT: "#12121a", foreground: "#e8e8ed" },
        primary: { DEFAULT: "#22d3ee", foreground: "#0a0a0f" },
        secondary: { DEFAULT: "#1e1e2a", foreground: "#e8e8ed" },
        muted: { DEFAULT: "#1e1e2a", foreground: "#8888a0" },
        accent: { DEFAULT: "#1a1a26", foreground: "#e8e8ed" },
        destructive: { DEFAULT: "#ef4444", foreground: "#ffffff" },
        border: "#2a2a3a",
        input: "#2a2a3a",
        ring: "#22d3ee",
      },
    },
  },
  plugins: [],
};
