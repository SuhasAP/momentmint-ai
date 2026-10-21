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
        // Elite Studio Palette
        porcelain: {
          DEFAULT: "#F8F6F0",
          50: "#FCFBF8",
          100: "#F8F6F0",
          200: "#F0ECE1",
          300: "#E7E2D1",
        },
        botanical: {
          DEFAULT: "#214737",
          50: "#F0F5F2",
          100: "#DCE5D8",
          600: "#2B5A46",
          700: "#214737",
          800: "#17372B",
          900: "#0F261D",
        },
        forest: {
          DEFAULT: "#17372B",
          800: "#17372B",
          900: "#0E241C",
          950: "#081611",
        },
        sage: {
          DEFAULT: "#DCE5D8",
          50: "#F4F7F3",
          100: "#DCE5D8",
          200: "#C4D4BE",
          300: "#A8BFA0",
        },
        terracotta: {
          DEFAULT: "#C87960",
          50: "#FAF1EE",
          100: "#F4DFD8",
          400: "#D98E78",
          500: "#C87960",
          600: "#B6644B",
        },
        champagne: {
          DEFAULT: "#E9DFC9",
          50: "#FAF7F1",
          100: "#E9DFC9",
          200: "#D8C7A5",
          300: "#C6B082",
        },
        charcoal: {
          DEFAULT: "#222820",
          900: "#222820",
          800: "#363E34",
          700: "#4D564A",
          500: "#697168",
        },
        studioBorder: "#E7E3D9",

        // Backward-compatible semantic tokens
        ivory: {
          DEFAULT: "#F8F6F0",
          50: "#FFFFFF",
          100: "#FDFCF9",
          200: "#F7F5EE",
          300: "#EFECE1",
          400: "#DDD7C4",
        },
        midnight: {
          DEFAULT: "#17372B",
          950: "#081611",
          900: "#17372B",
          800: "#214737",
          700: "#363E34",
          600: "#4D564A",
        },
        coral: {
          DEFAULT: "#C87960",
          50: "#FAF1EE",
          100: "#F4DFD8",
          400: "#D98E78",
          500: "#C87960",
          600: "#B6644B",
        },
        violet: {
          DEFAULT: "#214737",
          50: "#F0F5F2",
          100: "#DCE5D8",
          500: "#2B5A46",
          600: "#214737",
          700: "#17372B",
        },
      },
      fontFamily: {
        serif: [
          "'Cormorant Garamond'",
          "Georgia",
          "Cambria",
          "'Times New Roman'",
          "serif",
        ],
        sans: [
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 55, 43, 0.04), 0 1px 2px -1px rgba(23, 55, 43, 0.02)",
        soft: "0 4px 20px -2px rgba(23, 55, 43, 0.05), 0 2px 6px -1px rgba(23, 55, 43, 0.02)",
        elevated: "0 12px 35px -4px rgba(23, 55, 43, 0.08), 0 4px 12px -2px rgba(23, 55, 43, 0.04)",
        champagne: "0 0 20px -2px rgba(233, 223, 201, 0.45)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
