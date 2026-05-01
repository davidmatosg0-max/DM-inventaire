# Headers para Netlify/Vercel
# Configuración correcta de MIME types para PWA

# Service Worker
/sw.js
  Content-Type: application/javascript
  Service-Worker-Allowed: /
  Cache-Control: public, max-age=0, must-revalidate

# Manifest
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=86400

# Iconos SVG
/*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000

# Iconos PNG
/*.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000

# Todos los archivos JS
/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

# HTML
/*.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate
