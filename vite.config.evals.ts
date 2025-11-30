import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        // Enable SSR mode for Node.js targeting
        ssr: true,
        outDir: 'dist/evals',
        target: 'node18',
        rollupOptions: {
            // Specify multiple entry points
            input: {
                'd2-eval': path.resolve(__dirname, 'evals/d2-eval.ts'),
            },
            output: {
                format: 'es',
                entryFileNames: '[name].mjs',
            },
        },
    },
});
