import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  // Relative base so the production build is self-contained:
  // dist/index.html can be opened directly or served from any sub-path.
  base: "./",
  plugins: [react()],
})
