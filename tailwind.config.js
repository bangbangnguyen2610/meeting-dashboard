/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors from dashboard-design skill
        positive: "#10B981",
        negative: "#EF4444",
        neutral: "#6B7280",
        warning: "#F59E0B",
        info: "#3B82F6",
      }
    },
  },
  plugins: [],
}
