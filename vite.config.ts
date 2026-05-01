import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// Build: 16-03-2026-OPTIMIZACION-IMPRESION - Eliminados delays, impresión instantánea

const excelSupportPackages = [
  'archiver',
  'archiver-utils',
  'compress-commons',
  'crc32-stream',
  'dayjs',
  'duplexer2',
  'fast-csv',
  'lazystream',
  'readable-stream',
  'saxes',
  'tar-stream',
  'unzipper',
  'uuid',
  'zip-stream',
]

function isNodeModule(id: string, pkg: string) {
  return id.includes(`/node_modules/${pkg}/`)
}

export default defineConfig({
  base: './', // Usa rutas relativas para GitHub Pages
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimización para producción
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Cambiar a true para debugging en producción si es necesario
    // Usar esbuild (incluido por defecto en Vite) en lugar de terser (no instalado)
    minify: 'esbuild',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar vendor chunks para mejor caching
          if (isNodeModule(id, 'react') || isNodeModule(id, 'react-dom')) {
            return 'react-vendor'
          }

          if (
            isNodeModule(id, '@radix-ui/react-dialog') ||
            isNodeModule(id, '@radix-ui/react-dropdown-menu') ||
            isNodeModule(id, '@radix-ui/react-select') ||
            isNodeModule(id, '@radix-ui/react-tabs')
          ) {
            return 'ui-vendor'
          }

          if (isNodeModule(id, 'recharts')) {
            return 'chart-vendor'
          }

          if (isNodeModule(id, 'date-fns') || isNodeModule(id, 'clsx') || isNodeModule(id, 'tailwind-merge')) {
            return 'utils-vendor'
          }

          if (isNodeModule(id, 'react-hook-form')) {
            return 'form-vendor'
          }

          if (isNodeModule(id, 'i18next') || isNodeModule(id, 'react-i18next')) {
            return 'i18n-vendor'
          }

          if (isNodeModule(id, 'exceljs')) {
            return 'excel-core'
          }

          if (isNodeModule(id, 'jszip') || isNodeModule(id, 'pako')) {
            return 'excel-zip'
          }

          if (excelSupportPackages.some((pkg) => isNodeModule(id, pkg))) {
            return 'excel-support'
          }
        },
        // Nombres de archivo optimizados para caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Aumentar límite de advertencia de tamaño de chunks a 1MB
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales
    cssCodeSplit: true,
    reportCompressedSize: false, // Más rápido en CI/CD
    emptyOutDir: true,
  },
  // Optimizaciones de servidor de desarrollo
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  // Vista previa de producción
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
})