import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2015",
    rollupOptions: {
      output: {
        // Customize the output file names
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
