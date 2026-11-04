import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In development the browser calls /api on the Vite origin; Vite forwards it to the Express server.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
