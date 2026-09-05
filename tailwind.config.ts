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
        primary: "#670718",
        "on-primary": "#ffffff",
        "primary-container": "#9c1a30",
        "on-primary-container": "#ffa6b4",
        "primary-fixed": "#ffd4db",
        "primary-fixed-dim": "#ffa7b5",
        "on-primary-fixed": "#400010",
        "on-primary-fixed-variant": "#8c1126",
        secondary: "#46645b",
        "on-secondary": "#ffffff",
        "secondary-container": "#c8eade",
        "on-secondary-container": "#4c6a61",
        "secondary-fixed": "#c8eade",
        "secondary-fixed-dim": "#adcec2",
        "on-secondary-fixed": "#012019",
        "on-secondary-fixed-variant": "#2f4c44",
        tertiary: "#443931",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5c5047",
        "on-tertiary-container": "#d3c3b7",
        "tertiary-fixed": "#f1dfd3",
        "tertiary-fixed-dim": "#d4c3b8",
        "on-tertiary-fixed": "#221a13",
        "on-tertiary-fixed-variant": "#50453c",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        // Warm cream palette — shifted from near-neutral off-white toward a
        // clearly creamy editorial tone. The whole surface ladder now sits
        // on the warm side of the spectrum; `surface-container-lowest` is
        // the "paper" color that used to be pure white on cards.
        background: "#f2ede0",
        "on-background": "#1b1c1a",
        surface: "#f2ede0",
        "on-surface": "#1b1c1a",
        "surface-variant": "#ddd7c8",
        "on-surface-variant": "#544340",
        "surface-dim": "#d4cfbf",
        "surface-bright": "#f7f2e4",
        "surface-container-lowest": "#f7f2e4",
        "surface-container-low": "#ede8d7",
        "surface-container": "#e7e2cf",
        "surface-container-high": "#e0dcc9",
        "surface-container-highest": "#dad6c3",
        "surface-tint": "#ac243a",
        outline: "#87726f",
        "outline-variant": "#dac1bd",
        "inverse-surface": "#2f312f",
        "inverse-on-surface": "#ece7d9",
        "inverse-primary": "#ffa7b5",
      },
      fontFamily: {
        headline: ["Noto Serif", "serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
