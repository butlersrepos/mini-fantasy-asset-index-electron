import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    root: path.join(__dirname, 'src/renderer'),
    publicDir: path.join(__dirname, 'public'),
    build: {
        outDir: path.join(__dirname, 'dist/renderer'),
        emptyOutDir: true,
        sourcemap: true
    },
    base: './',
    server: {
        port: 3000,
        strictPort: true,
        host: true, // Listen on all addresses
        hmr: {
            overlay: true
        }
    }
});
