import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        charcoal: "hsl(var(--charcoal))",
        steel: "hsl(var(--steel))",
        electric: "hsl(var(--electric))",
        "deep-blue": "hsl(var(--deep-blue))",
        "section-cream": "hsl(var(--section-cream))",
        "surface-warm-mid": "hsl(var(--surface-warm-mid))",
        "surface-warm-dark": "hsl(var(--surface-warm-dark))",
        "primary-deep": "hsl(var(--primary-deep))",
        "accent-teal": "hsl(var(--accent-teal))",
        "accent-mint": "hsl(var(--accent-mint))",
        "accent-taupe": "hsl(var(--accent-taupe))",
        "accent-taupe-light": "hsl(var(--accent-taupe-light))",
        "accent-olive": "hsl(var(--accent-olive))",
        "nav-active": "hsl(var(--nav-active))",
        "nav-active-hover": "hsl(var(--nav-active-hover))",
        "nav-link": "hsl(var(--nav-link))",
        "nav-link-hover": "hsl(var(--nav-link-hover))",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
