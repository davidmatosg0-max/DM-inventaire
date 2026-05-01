# Banque Alimentaire - Sistema de Gestión Integral

> 🚀 **Estado:** ✅ Listo para Producción | **Versión:** 2.1.0 | **Última actualización:** Febrero 2026

---

## 📚 Documentación

**¿Primera vez aquí?** → Ver [Índice de Documentación Completo](./DOCS_INDEX.md)

**Guías Rápidas:**
- 🚀 [Deploy en 5 minutos](./QUICK_START.md)
- 📖 [Guía de Lanzamiento](./LANZAMIENTO.md)
- ✅ [Checklist de Producción](./PRODUCTION_CHECKLIST.md)
- 🔒 [Guía de Seguridad](./SECURITY.md)
- 📊 [Estado del Proyecto](./STATUS.md)

---

## 🌟 Características Principales

Sistema integral de gestión para bancos de alimentos que incluye:

- **Panel Principal (Dashboard)**: Métricas en tiempo real y análisis de datos
- **Inventario**: Gestión completa de productos y stock
- **Comandas**: Sistema de pedidos para organismos
- **Organismos**: Administración de organizaciones beneficiarias
- **Transporte**: Gestión de vehículos, rutas y entregas
- **Reportes**: Generación de informes y exportación de datos
- **Usuarios/Roles**: Control de acceso y permisos
- **Comptoir (Portal Público)**: Acceso para organismos externos
- **Mensajería**: Comunicación interna con corrección de texto
- **Bénévoles**: Gestión de voluntarios
- **Cuisine**: Gestión de recetas y producción culinaria

## 🎨 Características de Diseño

- **Multilingüe**: Español, Francés, Inglés, Árabe (con soporte RTL)
- **Glassmorphism**: Interfaz moderna con efectos de vidrio
- **Responsive**: Optimizado para desktop, tablet y móvil
- **Accesibilidad**: Cumple estándares WCAG
- **Tema**: Azul marino (#1a4d7a) y verde (#2d9561)
- **Tipografías**: Montserrat (títulos), Roboto (cuerpo)

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm

### Instalación

\`\`\`bash
# Clonar el repositorio
git clone [URL_DEL_REPO]

# Instalar dependencias
npm install
# o
pnpm install

# Iniciar servidor de desarrollo
npm run dev
\`\`\`

El servidor se iniciará en `http://localhost:5173`

### Variables de Entorno

Copiar `.env.example` a `.env.local` y ajustar valores:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Configuraciones importantes para producción:
- `VITE_APP_MODE=production`
- `VITE_ENABLE_SAMPLE_DATA=false`
- `VITE_ENABLE_CONSOLE_LOGS=false`

## 📦 Build para Producción

### Build Estándar

\`\`\`bash
npm run build
\`\`\`

Esto genera los archivos optimizados en la carpeta `dist/`.

### Build Optimizado

El sistema incluye optimizaciones automáticas:
- ✅ Code splitting automático
- ✅ Tree shaking
- ✅ Minificación con esbuild
- ✅ Compresión de assets
- ✅ Lazy loading de componentes

### Verificar Build

\`\`\`bash
# Vista previa del build
npm run preview
\`\`\`

## 🌐 Despliegue

### GitHub Pages

\`\`\`bash
npm run deploy
\`\`\`

### Vercel

1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

**Configuración Vercel:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: `Vite`

### Netlify

1. Conectar repositorio en Netlify
2. Configurar build settings:

\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"
\`\`\`

### Servidor Propio (Apache/Nginx)

#### Nginx

\`\`\`nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/banque-alimentaire/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
\`\`\`

#### Apache

\`\`\`apache
<VirtualHost *:80>
    ServerName tudominio.com
    DocumentRoot /var/www/banque-alimentaire/dist

    <Directory /var/www/banque-alimentaire/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Rewrite para SPA
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Caché para assets estáticos
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
</VirtualHost>
\`\`\`

## 🔒 Seguridad

### Recomendaciones para Producción

1. **HTTPS**: Siempre usar SSL/TLS en producción
2. **Variables de Entorno**: No exponer credenciales
3. **Headers de Seguridad**: Configurar headers apropiados
4. **CORS**: Configurar políticas restrictivas si usas backend

### Headers de Seguridad Recomendados

\`\`\`nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
\`\`\`

## 👥 Acceso al Sistema

### Usuarios de Prueba

El sistema incluye datos de ejemplo para pruebas:

**Usuario Administrador:**
- Usuario: `David` / `Admin`
- Contraseña: `Lettycia26`

**Portal Público (Organismos):**
- Clave de Acceso: `CAC-456ABC`
- Organismo: Centre d'Aide Communautaire Exemple

### Limpiar Datos de Ejemplo

Para empezar con datos limpios en producción:

\`\`\`javascript
// En la consola del navegador:
localStorage.clear();
location.reload();
\`\`\`

O cambiar la variable de entorno:
\`\`\`
VITE_ENABLE_SAMPLE_DATA=false
\`\`\`

## 📊 Monitoreo

### Logs de Consola

En producción, los logs están deshabilitados por defecto. Para habilitar:

\`\`\`
VITE_ENABLE_CONSOLE_LOGS=true
\`\`\`

### Error Tracking

El sistema incluye ErrorBoundary para capturar errores. Para tracking avanzado, integrar Sentry:

1. Instalar Sentry: `npm install @sentry/react`
2. Configurar en `.env`: `VITE_SENTRY_DSN=tu_dsn`
3. Descomentar código de Sentry en `ErrorBoundary.tsx`

## 🛠️ Mantenimiento

### Actualizar Dependencias

\`\`\`bash
# Verificar actualizaciones
npm outdated

# Actualizar dependencias
npm update

# Auditoría de seguridad
npm audit
npm audit fix
\`\`\`

### Limpiar Build

\`\`\`bash
rm -rf dist
rm -rf node_modules
npm install
npm run build
\`\`\`

## 📱 PWA (Progressive Web App)

El sistema puede convertirse en PWA para instalación en dispositivos. Para habilitar:

1. Instalar: `npm install vite-plugin-pwa`
2. Agregar configuración en `vite.config.ts`
3. Crear `manifest.json` y service worker

## 🌍 Internacionalización

### Agregar Nuevo Idioma

1. Crear archivo en `/src/i18n/locales/[codigo].json`
2. Agregar traducciones
3. Registrar en `/src/i18n/config.ts`

### Idiomas Soportados

- 🇫🇷 Francés (fr) - Predeterminado
- 🇪🇸 Español (es)
- 🇬🇧 Inglés (en)
- 🇸🇦 Árabe (ar) - Con soporte RTL

## 🐛 Solución de Problemas

### Build Falla

\`\`\`bash
# Limpiar caché
rm -rf node_modules/.vite
npm run build
\`\`\`

### Assets No Cargan

Verificar `base` en `vite.config.ts`:
- GitHub Pages: `base: './'`
- Dominio propio: `base: '/'`

### Errores de Chunk

Si hay errores de chunks faltantes, verificar configuración de `manualChunks` en `vite.config.ts`.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: info@banquealimentaire.ca
- Teléfono: +1-514-555-0100

## 📄 Licencia

Copyright © 2026 Banque Alimentaire. Todos los derechos reservados.

---

**Versión:** 2.1  
**Última Actualización:** Febrero 2026  
**Estado:** ✅ Listo para Producción