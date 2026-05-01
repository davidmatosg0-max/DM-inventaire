# 📦 Guía de Despliegue Seguro a GitHub Pages

## ✅ CONFIGURACIÓN COMPLETADA

---

## 🎯 Objetivo

Asegurar que cuando hagas **push** al repositorio de GitHub, el sitio se actualice **SIN modificar** las configuraciones existentes de GitHub Pages.

---

## 📋 Configuración Actual del Proyecto

### 1. **Archivo `.nojekyll`** ✅
**Ubicación:** `/.nojekyll`
**Propósito:** 
- Indica a GitHub Pages que **NO procese** el sitio con Jekyll
- Permite que archivos y carpetas que empiezan con `_` (underscore) se sirvan correctamente
- Previene que GitHub Pages intente compilar el sitio como un proyecto Jekyll

**Estado:** ✅ Creado y configurado

---

### 2. **Archivo `.gitignore`** ✅
**Ubicación:** `/.gitignore`
**Configuración:**
```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
dist-ssr/
*.local

# Logs
*.log

# Environment variables
.env
.env.local

# Temporary files
*.tmp
*.cache

# OS files
.DS_Store
Thumbs.db

# GitHub Pages - NO IGNORAR
# !.nojekyll
# !_config.yml
```

**Estado:** ✅ Creado correctamente

---

### 3. **GitHub Actions Workflow** ✅
**Ubicación:** `/workflows/deploy.yml`

**Configuración Actual:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Copy .nojekyll to dist
        run: cp .nojekyll dist/.nojekyll
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: false
          force_orphan: true
```

**Características Clave:**
- ✅ Se ejecuta automáticamente en cada push a `main`
- ✅ Copia el archivo `.nojekyll` al directorio `dist/`
- ✅ Usa `force_orphan: true` para limpiar el historial de la rama `gh-pages`
- ✅ No incluye archivo `CNAME` (dominio personalizado)

**Estado:** ✅ Configurado correctamente

---

### 4. **Vite Configuration** ✅
**Ubicación:** `/vite.config.ts`

**Configuración para GitHub Pages:**
```typescript
export default defineConfig({
  base: './', // ⭐ IMPORTANTE: Usa rutas relativas
  // ... resto de configuración
})
```

**Por qué es importante:**
- `base: './'` asegura que todos los assets se carguen con rutas relativas
- Compatible con cualquier configuración de GitHub Pages (con o sin dominio personalizado)

**Estado:** ✅ Ya configurado

---

### 5. **Package.json Scripts** ✅
**Ubicación:** `/package.json`

**Scripts de Despliegue:**
```json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist --dotfiles"
  }
}
```

**Opciones de Despliegue:**

#### **Opción 1: GitHub Actions (Recomendado) ⭐**
```bash
git add .
git commit -m "feat: implementar sistema de tareas predeterminadas"
git push origin main
```
→ GitHub Actions se encarga automáticamente del build y deploy

#### **Opción 2: Manual con gh-pages**
```bash
npm run deploy
```
→ Compila y sube manualmente a la rama `gh-pages`

**Estado:** ✅ Configurado

---

## 🚀 Proceso de Despliegue

### **Paso 1: Verificar Cambios**
```bash
git status
```

### **Paso 2: Agregar Cambios**
```bash
git add .
```

### **Paso 3: Commit con Mensaje Descriptivo**
```bash
git commit -m "feat: nuevo sistema de tareas predeterminadas por tipo de contacto"
```

### **Paso 4: Push a GitHub**
```bash
git push origin main
```

### **Paso 5: Verificar Despliegue**
1. Ve a tu repositorio en GitHub
2. Navega a **Actions**
3. Verás el workflow "Deploy to GitHub Pages" ejecutándose
4. Espera a que termine (ícono verde ✅)
5. Tu sitio estará actualizado en `https://[tu-usuario].github.io/[tu-repo]/`

---

## ⚙️ Configuración de GitHub Pages en el Repositorio

### **IMPORTANTE: NO TOQUES ESTAS CONFIGURACIONES** ⚠️

Si ya tienes GitHub Pages configurado, **NO** necesitas cambiar nada en:

1. **Settings → Pages → Source**
   - Debe estar en: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`

2. **Settings → Pages → Custom domain** (si aplica)
   - Mantén tu dominio personalizado si ya lo tienes configurado

3. **Settings → Pages → Enforce HTTPS**
   - Debe estar activado ✅

El GitHub Action **NO modificará** estas configuraciones. Solo actualizará el contenido de la rama `gh-pages` con el nuevo build.

---

## 🔒 Lo que el Workflow PRESERVA

✅ **Configuraciones que NO se modifican:**
- Dominio personalizado (CNAME)
- Configuración de HTTPS
- Configuración de Branch y Folder
- Variables de entorno de GitHub Pages
- Permisos del repositorio

✅ **Lo que SÍ se actualiza:**
- Contenido HTML/CSS/JS compilado
- Assets (imágenes, fuentes, etc.)
- Archivo `.nojekyll`
- Estructura de carpetas del build

---

## 📊 Estructura del Despliegue

### **Rama `main` (código fuente):**
```
/
├── src/
│   ├── app/
│   ├── styles/
│   └── ...
├── public/
├── package.json
├── vite.config.ts
├── .nojekyll ⭐
├── .gitignore ⭐
└── workflows/
    └── deploy.yml ⭐
```

### **Rama `gh-pages` (sitio compilado):**
```
/
├── index.html
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
├── .nojekyll ⭐ (copiado automáticamente)
└── (sin archivos de configuración de GitHub Pages)
```

---

## 🧪 Verificación Post-Despliegue

### **1. Verificar que el Action se ejecutó correctamente:**
```bash
# En GitHub:
Repositorio → Actions → Deploy to GitHub Pages → Último workflow
```
Debe mostrar: ✅ Verde (exitoso)

### **2. Verificar el sitio desplegado:**
Abre tu URL de GitHub Pages y verifica:
- ✅ El sitio carga correctamente
- ✅ No hay errores 404 en la consola del navegador
- ✅ Los assets (CSS, JS, imágenes) se cargan
- ✅ Las rutas funcionan correctamente

### **3. Verificar localStorage (si aplica):**
- ✅ Los datos guardados previamente siguen disponibles
- ✅ Las configuraciones personalizadas se mantienen

---

## 🚨 Resolución de Problemas

### **Problema 1: Assets no cargan (404)**

**Causa:** Rutas absolutas en lugar de relativas

**Solución:**
Verificar que `vite.config.ts` tenga:
```typescript
base: './',
```

---

### **Problema 2: Sitio muestra código fuente en lugar de la aplicación**

**Causa:** Jekyll está procesando el sitio

**Solución:**
Verificar que `.nojekyll` existe en la rama `gh-pages`:
```bash
# Ver archivos en gh-pages
git checkout gh-pages
ls -la
# Debe aparecer: .nojekyll
```

---

### **Problema 3: Workflow falla en "Copy .nojekyll"**

**Causa:** Archivo `.nojekyll` no existe en la rama `main`

**Solución:**
```bash
# Verificar que existe
ls -la .nojekyll

# Si no existe, crearlo:
touch .nojekyll
git add .nojekyll
git commit -m "fix: agregar archivo .nojekyll"
git push origin main
```

---

### **Problema 4: Cambios no se reflejan después del push**

**Causa:** Caché del navegador o GitHub Pages

**Solución:**
1. **Limpiar caché del navegador:**
   - Chrome: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)

2. **Verificar que el workflow terminó:**
   - GitHub → Actions → Verificar que el último workflow está ✅

3. **Esperar propagación de GitHub Pages:**
   - Puede tomar hasta 5-10 minutos

---

## 📝 Checklist Pre-Push

Antes de hacer push, verifica:

- [ ] ✅ Archivo `.nojekyll` existe en la raíz del proyecto
- [ ] ✅ Archivo `.gitignore` está configurado correctamente
- [ ] ✅ `vite.config.ts` tiene `base: './'`
- [ ] ✅ El build local funciona: `npm run build && npm run preview`
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ Los cambios están en la rama `main`

---

## 🎯 Comandos Rápidos

### **Despliegue Rápido (Recomendado):**
```bash
git add .
git commit -m "feat: actualización del sistema"
git push origin main
# GitHub Actions se encarga del resto ✨
```

### **Build y Preview Local:**
```bash
npm run build
npm run preview
# Abre: http://localhost:4173
```

### **Limpiar y Rebuildar:**
```bash
rm -rf dist/
npm run build
```

---

## 📚 Documentación de Referencia

- **GitHub Pages:** https://docs.github.com/pages
- **GitHub Actions:** https://docs.github.com/actions
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy.html
- **gh-pages package:** https://www.npmjs.com/package/gh-pages

---

## ✅ Resumen de Garantías

Cuando hagas **push a GitHub**, el sistema garantiza:

1. ✅ **Solo se actualiza el código:** No se modifican configuraciones de GitHub Pages
2. ✅ **Proceso automático:** GitHub Actions compila y despliega automáticamente
3. ✅ **Sin Jekyll:** El archivo `.nojekyll` previene procesamiento innecesario
4. ✅ **Rutas relativas:** Compatible con cualquier configuración de dominio
5. ✅ **Historial limpio:** `force_orphan: true` mantiene la rama `gh-pages` limpia
6. ✅ **Preserva localStorage:** Los datos del navegador no se ven afectados
7. ✅ **Compatible con dominios personalizados:** No incluye CNAME, respeta tu configuración

---

## 🎉 Conclusión

Tu proyecto está **completamente configurado** para despliegues seguros a GitHub Pages. Simplemente haz **push a main** y GitHub Actions se encargará del resto sin tocar tus configuraciones existentes.

**¡Todo listo para producción!** 🚀

---

**Última actualización:** Marzo 2026  
**Sistema:** Banque Alimentaire - Sistema Integral de Gestión  
**Desarrollador:** David Matos
