# 🚀 Guía de Despliegue Rápido

## Pre-requisitos

✅ Node.js 18+ instalado  
✅ Git configurado  
✅ Cuenta en plataforma de hosting (Vercel/Netlify/GitHub Pages)

## 🏗️ Preparar para Producción

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.production

# Editar valores para producción
nano .env.production
```

**Configuración mínima:**
```env
VITE_APP_MODE=production
VITE_ENABLE_SAMPLE_DATA=false
VITE_ENABLE_CONSOLE_LOGS=false
```

### 2. Build de Producción

```bash
# Limpiar instalaciones previas
rm -rf node_modules dist

# Instalar dependencias
npm install

# Build optimizado
npm run build
```

### 3. Verificar Build Localmente

```bash
# Servidor de preview
npm run preview
```

Abrir http://localhost:4173 y verificar que todo funciona.

## ☁️ Deploy en Plataformas

### Opción 1: Vercel (Recomendado)

**Deploy con CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Deploy con Git:**
1. Push a GitHub/GitLab/Bitbucket
2. Ir a https://vercel.com
3. "New Project" → Importar repositorio
4. Configurar:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Framework Preset: `Vite`
5. Agregar variables de entorno
6. Deploy

**Variables de Entorno en Vercel:**
```
VITE_APP_MODE=production
VITE_ENABLE_SAMPLE_DATA=false
VITE_ENABLE_CONSOLE_LOGS=false
VITE_BASE_URL=/
```

### Opción 2: Netlify

**Deploy con CLI:**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Build y deploy
netlify deploy --prod
```

**Deploy con Git:**
1. Push a repositorio
2. Ir a https://netlify.com
3. "New site from Git"
4. Seleccionar repositorio
5. Configurar:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Agregar variables de entorno
7. Deploy

**Archivo netlify.toml (opcional):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### Opción 3: GitHub Pages

```bash
# Build y deploy
npm run deploy
```

**Configuración manual:**
1. Ir a Settings → Pages del repositorio
2. Source: Deploy from a branch
3. Branch: `gh-pages` → `/root`
4. Save

**IMPORTANTE:** En `vite.config.ts`, asegurar:
```typescript
base: './' // Para GitHub Pages
```

### Opción 4: Servidor Propio

**Nginx:**
```bash
# Build
npm run build

# Copiar archivos
scp -r dist/* usuario@servidor:/var/www/banque-alimentaire/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/banque-alimentaire
```

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/banque-alimentaire;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/banque-alimentaire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Apache:**
```bash
# Build
npm run build

# Copiar archivos
scp -r dist/* usuario@servidor:/var/www/banque-alimentaire/

# Crear .htaccess
nano dist/.htaccess
```

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Caché
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## 🔒 Post-Deploy: Lista de Verificación

- [ ] HTTPS está configurado
- [ ] Variables de entorno están correctas
- [ ] Logs de consola están deshabilitados
- [ ] Datos de ejemplo están deshabilitados (si es producción real)
- [ ] Navegación funciona correctamente
- [ ] Login funciona con credenciales
- [ ] Exportación de PDFs funciona
- [ ] Cambio de idiomas funciona (FR/ES/EN/AR)
- [ ] Estilos glassmorphism se ven correctos
- [ ] No hay errores en consola del navegador

## 🧪 Pruebas Post-Deploy

```bash
# Verificar enlaces
curl -I https://tudominio.com

# Verificar assets
curl -I https://tudominio.com/assets/index-[hash].js

# Lighthouse (performance)
npx lighthouse https://tudominio.com --view
```

## 🔄 Actualizar Deploy

```bash
# Hacer cambios en código
git add .
git commit -m "Descripción de cambios"
git push

# Para Vercel/Netlify: Deploy automático
# Para GitHub Pages:
npm run deploy

# Para servidor propio:
npm run build
scp -r dist/* usuario@servidor:/var/www/banque-alimentaire/
```

## 🆘 Solución de Problemas

### Error: Assets no cargan
- Verificar `base` en `vite.config.ts`
- Para subdirectorio: `base: '/subdirectorio/'`
- Para raíz: `base: '/'`
- Para GitHub Pages: `base: './'`

### Error: Página en blanco
1. Abrir consola del navegador (F12)
2. Verificar errores
3. Revisar rutas de assets
4. Verificar que build completó sin errores

### Error: 404 en rutas
- Configurar redirects/rewrites en servidor
- Ver sección de configuración Nginx/Apache arriba

### Error: Build muy grande
```bash
# Analizar bundle
npm install -D rollup-plugin-visualizer
npm run build
```

## 📊 Monitoreo

### Google Analytics (Opcional)
1. Obtener Tracking ID
2. Agregar a `.env`: `VITE_GA_TRACKING_ID=G-XXXXXXXXXX`
3. Implementar en código

### Sentry (Error Tracking)
1. Crear cuenta en sentry.io
2. Obtener DSN
3. Agregar a `.env`: `VITE_SENTRY_DSN=https://...`
4. Instalar: `npm install @sentry/react`

## 📝 Notas Adicionales

- **Caché del navegador:** Usuarios pueden necesitar Ctrl+F5 para ver cambios
- **CDN:** Considerar Cloudflare para mejor rendimiento global
- **Base de datos:** Si necesitas persistencia real, integrar backend (Supabase, Firebase, etc.)
- **Backups:** Configurar backups regulares de localStorage si usas datos reales

---

**¿Problemas?** Revisar logs en plataforma de hosting o abrir issue en repositorio.
