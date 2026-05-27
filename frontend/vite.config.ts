import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: (() => {
    const rawBase = process.env.VITE_BASE_PATH;
    if (!rawBase) {
      return "/";
    }

    const withLeadingSlash = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
    return withLeadingSlash.endsWith("/")
      ? withLeadingSlash
      : `${withLeadingSlash}/`;
  })(),
});
