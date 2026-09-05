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
        primary: "#69251b",
        "on-primary": "#ffffff",
        "primary-container": "#873b2f",
        "on-primary-container": "#ffb3a6",
        "primary-fixed": "#ffdad4",
        "primary-fixed-dim": "#ffb4a7",
        "on-primary-fixed": "#3e0502",
        "on-primary-fixed-variant": "#783025",
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
        background: "#f7f2e4",
        "on-background": "#1b1c1a",
        surface: "#f7f2e4",
        "on-surface": "#1b1c1a",
        "surface-variant": "#e3ddcb",
        "on-surface-variant": "#544340",
        "surface-dim": "#dbd5c1",
        "surface-bright": "#fbf7e9",
        "surface-container-lowest": "#fbf7e9",
        "surface-container-low": "#f3eeda",
        "surface-container": "#ede8d2",
        "surface-container-high": "#e7e2cb",
        "surface-container-highest": "#e1dcc5",
        "surface-tint": "#96473a",
        outline: "#87726f",
        "outline-variant": "#dac1bd",
        "inverse-surface": "#2f312f",
        "inverse-on-surface": "#f2ecdc",
        "inverse-primary": "#ffb4a7",
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
