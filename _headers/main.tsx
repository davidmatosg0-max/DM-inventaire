# Headers pour tous les fichiers
/*
  # Headers de sécurité
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  
  # Headers CORS - Authorization explicite
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name
  Access-Control-Max-Age: 86400
  Access-Control-Allow-Credentials: true

# Cache pour assets statiques
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Cache pour images
/*.png
  Cache-Control: public, max-age=31536000, immutable
  
/*.jpg
  Cache-Control: public, max-age=31536000, immutable
  
/*.jpeg
  Cache-Control: public, max-age=31536000, immutable
  
/*.svg
  Cache-Control: public, max-age=31536000, immutable
  
/*.gif
  Cache-Control: public, max-age=31536000, immutable
  
/*.webp
  Cache-Control: public, max-age=31536000, immutable

# Cache pour fuentes
/*.woff
  Cache-Control: public, max-age=31536000, immutable
  
/*.woff2
  Cache-Control: public, max-age=31536000, immutable
  
/*.ttf
  Cache-Control: public, max-age=31536000, immutable
  
/*.eot
  Cache-Control: public, max-age=31536000, immutable

# Cache pour JS et CSS
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable
  
/assets/*.css
  Cache-Control: public, max-age=31536000, immutable

# Pas de cache pour le HTML principal
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
