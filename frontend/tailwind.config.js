/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        card: '#1a1d27',
        accent: '#6366f1',
        good: '#22c55e',
        bad: '#ef4444',
        muted: '#6b7280',
        border: '#2d3148',
      },
    },
  },
  plugins: [],
}

