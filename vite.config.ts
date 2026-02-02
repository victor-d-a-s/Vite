import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração simplificada para desenvolvimento no StackBlitz
export default defineConfig({
  plugins: [react()],
  base: '/',
  
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
  
  // Build básico (usado quando você fizer npm run build)
  build: {
    outDir: 'dist',
    sourcemap: true, // Útil para debug no StackBlitz
  },
});