import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        coursaty: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-subtle": "var(--color-surface-subtle)",
          primary: "var(--color-primary)",
          "primary-light": "var(--color-primary-light)",
          "primary-hover": "var(--color-primary-hover)",
          accent: "var(--color-accent)",
          text: "var(--color-text)",
          muted: "var(--color-text-muted)",
          light: "var(--color-text-light)",
          border: "var(--color-border)",
          danger: "var(--color-danger)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06)",
        overlay: "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
};

export default config;
