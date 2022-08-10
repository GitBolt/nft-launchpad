module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": {
          "main": "#0E2C97",
          "dark": "#03379E",
          "light": "#4576D9"
        },
        "bg": {
          "main": "#FFFFFF",
          "light": "#F1F2F7",
        },
        "gray": {
          "100": "#1A1A1A",
          "200": "#929292",
          "300": "#666666",
          "400": "#8C8C8C",
          "500": "#B3B3B3",
          "600": "#D9D9D9",
          "700": "#F2F2F2"
        },
        "success": {
          "light": "#AFF0E1",
          "dark": "#2C705F"
        },
        "error": {
          "light": "#FF6262",
          "dark": "#C62828"
        },
        "gradiant": {
          "start": "#580AFF",
          "end": "#0AD3FF"
        },
        "twitter": {
          "dark": "#122C3D",
          "light": "#1DA1F2"
        },
        "label": "var(--label)",
        "label2": "var(--label2)",
        "stroke": "var(--stroke)",
        "stroke2": "var(--stroke2)",
      },
    },
    dropShadow: {
      'main': '0px 3px 8px rgba(0, 0, 0, 0.15)',
      '4xl': [
          '0 35px 35px rgba(0, 0, 0, 0.25)',
          '0 45px 65px rgba(0, 0, 0, 0.15)'
      ]
    },
  },
  plugins: [],
}