# ⚡ Quick Start - Deploy en 5 Minutos

## 🎯 Objetivo

Tener tu Sistema de Gestión Banque Alimentaire funcionando en producción en menos de 5 minutos.

---

## 🚀 Opción 1: Vercel (MÁS RÁPIDO)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Login
```bash
vercel login
```

### Paso 3: Deploy
```bash
cd tu-proyecto
vercel --prod
```

**¡LISTO!** Tu app estará en: `https://tu-proyecto.vercel.app`

### Configuración Adicional (Opcional)
```bash
# En Vercel Dashboard
# Settings → Environment Variables → Agregar:
VITE_APP_MODE=production
VITE_ENABLE_SAMPLE_DATA=false
VITE_ENABLE_CONSOLE_LOGS=false

# Redeploy para aplicar cambios
```

---

## 🌐 Opción 2: Netlify

### Método A: Netlify CLI
```bash
# Instalar
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd tu-proyecto
npm run build
netlify deploy --prod
```

### Método B: Drag & Drop
```bash
# 1. Build local
npm run build

# 2. Ir a https://app.netlify.com/drop

# 3. Arrastrar carpeta 'dist'
```

**¡LISTO!** Tu app estará en: `https://tu-sitio.netlify.app`

---

## 📄 Opción 3: GitHub Pages

### Paso 1: Configurar repositorio
```bash
# En package.json, verificar que exista:
"homepage": "https://tu-usuario.github.io/tu-repo",
"scripts": {
  "deploy": "gh-pages -d dist --dotfiles"
}
```

### Paso 2: Deploy
```bash
npm run deploy
```

### Paso 3: Activar GitHub Pages
1. Ir a Settings → Pages de tu repositorio
2. Source: `gh-pages` branch
3. Save

**¡LISTO!** Tu app estará en: `https://tu-usuario.github.io/tu-repo`

---

## 🖥️ Opción 4: Servidor Propio (Ubuntu/Nginx)

### Setup Completo
```bash
# 1. Build local
npm run build

# 2. Copiar a servidor
scp -r dist/* usuario@tu-servidor:/var/www/banque-alimentaire/

# 3. SSH al servidor
ssh usuario@tu-servidor

# 4. Instalar Nginx (si no está)
sudo apt update
sudo apt install nginx

# 5. Configurar Nginx
sudo nano /etc/nginx/sites-available/banque-alimentaire
```

### Configuración Nginx
```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/banque-alimentaire;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Activar y Reiniciar
```bash
sudo ln -s /etc/nginx/sites-available/banque-alimentaire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

**¡LISTO!** Tu app estará en: `https://tudominio.com`

---

## ✅ Verificación Post-Deploy

### Checklist Rápido (2 minutos)

1. **Abrir sitio** en navegador
   - [ ] Página carga sin errores
   - [ ] No hay errores en consola (F12)

2. **Probar login**
   ```
   Usuario: David  o  Admin
   Contraseña: Lettycia26
   ```
   - [ ] Login funciona
   - [ ] Navegar entre módulos funciona

3. **Cambiar idiomas**
   - [ ] Francés ✅
   - [ ] Español ✅
   - [ ] Inglés ✅
   - [ ] Árabe ✅ (RTL)

4. **Portal Público**
   ```
   Clave: CAC-456ABC
   ```
   - [ ] Acceso funciona
   - [ ] Ver ofertas funciona

5. **Responsive**
   - [ ] Desktop ✅
   - [ ] Tablet ✅
   - [ ] Móvil ✅

---

## 🔧 Troubleshooting Rápido

### Problema: Página en blanco

**Solución:**
```bash
# 1. Abrir consola del navegador (F12)
# 2. Ver errores
# 3. Si dice "Failed to load resource":

# Para GitHub Pages, verificar en vite.config.ts:
base: './'

# Para otros, usar:
base: '/'

# 4. Rebuild y redeploy
npm run build
# ... deploy de nuevo
```

### Problema: Assets no cargan (404)

**Solución:**
```javascript
// En vite.config.ts
export default defineConfig({
  base: './', // Para rutas relativas
  // o
  base: '/tu-subdirectorio/', // Si está en subdirectorio
})
```

### Problema: Rutas no funcionan (404 en reload)

**Solución:**

**Vercel:** Ya configurado automáticamente ✅

**Netlify:** Ya configurado en `netlify.toml` ✅

**Apache:** Agregar en `.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Nginx:** Ya incluido en config arriba ✅

---

## 📊 Siguientes Pasos

### Inmediato (Hoy)
1. ✅ Deploy completado
2. [ ] Compartir URL con equipo
3. [ ] Probar todas las funcionalidades

### Esta Semana
1. [ ] Configurar dominio personalizado (opcional)
2. [ ] Configurar Google Analytics (opcional)
3. [ ] Setup monitoring (UptimeRobot)

### Este Mes
1. [ ] Recopilar feedback de usuarios
2. [ ] Planificar mejoras
3. [ ] Considerar backend real (Supabase/Firebase)

---

## 📞 Soporte

**Problemas con deploy?**
1. Ver `DEPLOY.md` para guía detallada
2. Revisar `PRODUCTION_CHECKLIST.md`
3. Contactar: dev@banquealimentaire.ca

---

## 🎉 ¡Felicitaciones!

Tu Sistema de Gestión Banque Alimentaire está ahora en producción.

**Características activas:**
- ✅ 12+ Módulos funcionales
- ✅ 4 Idiomas (FR/ES/EN/AR)
- ✅ Interfaz glassmorphism moderna
- ✅ 100% responsive
- ✅ Exportación PDF/Excel
- ✅ Portal público para organismos

**URLs Útiles:**
- Login: `/` o `/login`
- Dashboard: `/?page=dashboard`
- Portal Público: `/acceso-organismo`

**Credenciales por defecto:**
- Admin: David / Lettycia26
- Portal: CAC-456ABC

---

**Tiempo total:** ⏱️ 5 minutos  
**Complejidad:** ⭐ Fácil  
**Estado:** 🟢 Producción Ready

¡Disfruta tu sistema! 🚀
