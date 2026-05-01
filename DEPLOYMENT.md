# 🚀 Guía de Deployment

Guía completa para desplegar el Sistema de Gestión para Banco de Alimentos en diferentes plataformas.

## 📋 Tabla de Contenidos

- [Preparación](#preparación)
- [Build de Producción](#build-de-producción)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [AWS](#aws)
- [Docker](#docker)
- [Servidor VPS](#servidor-vps)
- [Variables de Entorno](#variables-de-entorno)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)

## 🛠️ Preparación

### 1. Verificar el Código

```bash
# Verificar que no haya errores de TypeScript
pnpm tsc --noEmit

# Verificar ESLint
pnpm lint

# Ejecutar tests (si los tienes)
pnpm test

# Verificar build local
pnpm build
pnpm preview
```

### 2. Actualizar Variables de Entorno

Copia `.env.example` a `.env.production` y configura los valores para producción:

```bash
cp .env.example .env.production
```

Edita `.env.production` con valores reales:
- URLs de APIs
- Claves de servicios externos
- Configuración de analytics
- etc.

### 3. Optimización

- ✅ Verificar que las imágenes estén optimizadas
- ✅ Revisar que no haya console.logs en producción
- ✅ Verificar que los assets estén minimizados
- ✅ Configurar caché headers correctamente
- ✅ Habilitar compresión gzip/brotli

## 📦 Build de Producción

```bash
# Build optimizado
pnpm build

# El build se genera en /dist
# Tamaño aproximado: 500KB-2MB (gzipped)
```

### Verificar el Build

```bash
# Previsualizar el build localmente
pnpm preview

# Abrir en http://localhost:4173
```

### Análisis del Bundle

Para ver el tamaño de los módulos:

```bash
# Instalar herramienta de análisis
pnpm add -D rollup-plugin-visualizer

# Generar reporte
pnpm build -- --mode analyze
```

## ☁️ Vercel

### Deployment con CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### Deployment con GitHub

1. **Conectar Repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Click "New Project"
   - Importa tu repositorio de GitHub

2. **Configuración:**
   ```
   Framework Preset: Vite
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

3. **Variables de Entorno:**
   - Ve a Settings → Environment Variables
   - Agrega todas las variables de `.env.production`

4. **Dominios:**
   - Ve a Settings → Domains
   - Agrega tu dominio personalizado
   - Configura DNS según instrucciones

### vercel.json

Crea `vercel.json` en la raíz:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🌐 Netlify

### Deployment con CLI

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Inicializar
netlify init

# Deploy a preview
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### Deployment con GitHub

1. **Conectar Repositorio:**
   - Ve a [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Conecta GitHub y selecciona tu repositorio

2. **Configuración de Build:**
   ```
   Build command: pnpm build
   Publish directory: dist
   ```

3. **Variables de Entorno:**
   - Ve a Site settings → Build & deploy → Environment
   - Agrega todas las variables necesarias

### netlify.toml

Crea `netlify.toml` en la raíz:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## ☁️ AWS

### S3 + CloudFront

#### 1. Crear Bucket S3

```bash
aws s3 mb s3://banco-alimentos-app --region us-east-1
```

#### 2. Configurar Bucket para Hosting

```bash
aws s3 website s3://banco-alimentos-app \
  --index-document index.html \
  --error-document index.html
```

#### 3. Subir Build

```bash
# Build
pnpm build

# Sync con S3
aws s3 sync dist/ s3://banco-alimentos-app \
  --delete \
  --cache-control max-age=31536000 \
  --exclude "index.html" \
  --exclude "*.json"

# index.html sin caché
aws s3 cp dist/index.html s3://banco-alimentos-app/index.html \
  --cache-control no-cache,no-store,must-revalidate
```

#### 4. Configurar CloudFront

1. Crear distribución CloudFront
2. Origin: Tu bucket S3
3. Default Root Object: `index.html`
4. Error Pages: Redirigir 404 → `/index.html` (200)
5. Habilitar HTTPS con certificado ACM

#### Script de Deploy

```bash
#!/bin/bash
# deploy-aws.sh

echo "Building..."
pnpm build

echo "Uploading to S3..."
aws s3 sync dist/ s3://banco-alimentos-app \
  --delete \
  --cache-control max-age=31536000 \
  --exclude "index.html"

aws s3 cp dist/index.html s3://banco-alimentos-app/index.html \
  --cache-control no-cache

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

## 🐳 Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Comandos Docker

```bash
# Build
docker build -t banco-alimentos .

# Run
docker run -d -p 80:80 --name banco-alimentos-app banco-alimentos

# Logs
docker logs -f banco-alimentos-app

# Stop
docker stop banco-alimentos-app

# Con docker-compose
docker-compose up -d
docker-compose down
```

## 🖥️ Servidor VPS

### Ubuntu/Debian

#### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar nginx
sudo apt install -y nginx

# Instalar PM2 (process manager)
npm install -g pm2
```

#### 2. Clonar Repositorio

```bash
cd /var/www
sudo git clone https://github.com/tu-usuario/banco-alimentos.git
cd banco-alimentos
sudo chown -R $USER:$USER /var/www/banco-alimentos
```

#### 3. Build

```bash
pnpm install
pnpm build
```

#### 4. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/banco-alimentos
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/banco-alimentos/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/banco-alimentos /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

#### 5. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

## 🔐 Variables de Entorno

### Vercel

```bash
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
# ... más variables
```

### Netlify

```bash
netlify env:set VITE_API_URL "https://api.tudominio.com"
netlify env:set VITE_SUPABASE_URL "https://xxx.supabase.co"
```

### Docker

En `.env.production`:
```env
VITE_API_URL=https://api.tudominio.com
VITE_SUPABASE_URL=https://xxx.supabase.co
```

Luego en docker-compose:
```yaml
services:
  app:
    env_file:
      - .env.production
```

## 🔄 CI/CD

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Monitoring

### Sentry (Error Tracking)

```bash
pnpm add @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics

Google Analytics 4:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## ✅ Checklist de Deployment

- [ ] Build exitoso localmente
- [ ] Tests pasando (si los hay)
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS habilitado
- [ ] Dominio configurado correctamente
- [ ] Caché configurada
- [ ] Compresión gzip/brotli habilitada
- [ ] Security headers configurados
- [ ] Analytics configurado
- [ ] Error tracking configurado (Sentry)
- [ ] Backup strategy definida
- [ ] Monitoreo de uptime configurado
- [ ] CDN configurado (si aplica)
- [ ] Documentación actualizada

## 🆘 Troubleshooting

### Build falla

```bash
# Limpiar cache y reinstalar
rm -rf node_modules dist
pnpm install
pnpm build
```

### Rutas no funcionan (404)

Verificar que el servidor esté configurado para SPA routing (redirigir todo a index.html).

### Variables de entorno no funcionan

Verificar que tengan el prefijo `VITE_` y que estén en el archivo correcto.

### Performance lento

- Verificar que gzip esté habilitado
- Optimizar imágenes
- Habilitar CDN
- Configurar cache headers

---

¿Preguntas? Abre un issue en GitHub o contacta a soporte@bancoalimentos.org
