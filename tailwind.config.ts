import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // One accent colour: Buya green
        accent: { DEFAULT: "#0F8B6D", dark: "#0B6B54", soft: "#E3F4EE" },
        ink: "#14201C",
        paper: "#F7F8F5",
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      borderRadius: { card: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
