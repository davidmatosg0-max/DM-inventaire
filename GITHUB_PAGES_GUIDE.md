# 🚀 Guía de Despliegue en GitHub Pages

## Configuración Completa para GitHub Pages

### ⚠️ **IMPORTANTE: Necesitas saber el nombre de tu repositorio**

GitHub Pages necesita conocer la URL base de tu aplicación. Por ejemplo:
- Si tu repo es: `https://github.com/tu-usuario/banco-alimentos`
- Tu app estará en: `https://tu-usuario.github.io/banco-alimentos/`

---

## 📝 Paso 1: Configurar el Repositorio

### A. Actualiza `vite.config.ts`

Necesitas agregar la propiedad `base` con el nombre de tu repositorio:

```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/nombre-de-tu-repositorio/', // 👈 CAMBIA ESTO
  plugins: [
    react(),
    tailwindcss(),
  ],
  // ... resto de la configuración
})
```

**Ejemplo:** Si tu repo es `banco-alimentos-sistema`:
```typescript
base: '/banco-alimentos-sistema/',
```

**NOTA:** Si tu repo es `tu-usuario.github.io` (sitio personal), usa:
```typescript
base: '/',
```

---

## 📦 Paso 2: Instalar gh-pages

```bash
npm install --save-dev gh-pages
```

**Ya está configurado en package.json:**
```json
{
  "scripts": {
    "build": "vite build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

---

## 🚀 Paso 3: Desplegar

### Opción A: Usando npm run deploy (Recomendado)

```bash
npm run deploy
```

Este comando:
1. ✅ Ejecuta el build automáticamente (`predeploy`)
2. ✅ Crea/actualiza la rama `gh-pages`
3. ✅ Sube el contenido de `/dist` a esa rama

### Opción B: Manual

```bash
# 1. Hacer el build
npm run build

# 2. Desplegar manualmente
npx gh-pages -d dist
```

---

## ⚙️ Paso 4: Configurar GitHub Pages en tu Repositorio

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**, selecciona:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click en **Save**
6. ¡Espera 1-2 minutos!

Tu app estará disponible en:
```
https://tu-usuario.github.io/nombre-repo/
```

---

## ✅ Archivos Configurados

### 1. `/index.html` - Script de redirección
```html
<!-- Script para manejar rutas SPA en GitHub Pages -->
<script type="text/javascript">
  // Single Page Apps for GitHub Pages
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

### 2. `/public/404.html` - Página 404 personalizada
Redirige automáticamente las rutas desconocidas a `index.html`

### 3. `.gitignore` - Archivos ignorados
Excluye `node_modules`, `dist`, etc.

---

## 🔧 Solución de Problemas

### Problema 1: Página en blanco o error 404

**Causa:** No configuraste `base` en `vite.config.ts`

**Solución:**
```typescript
export default defineConfig({
  base: '/nombre-de-tu-repo/', // 👈 Asegúrate de incluir las barras
  // ...
})
```

### Problema 2: CSS no carga o assets 404

**Causa:** Mismo que arriba, el `base` está mal configurado

**Solución:** Verifica que `base` coincida exactamente con el nombre de tu repositorio

### Problema 3: Las rutas no funcionan (inventario, comandas, etc.)

**Causa:** Falta configurar el script de redirección

**Solución:** Ya está configurado en `/index.html` y `/public/404.html`

### Problema 4: "gh-pages not found"

**Solución:**
```bash
npm install --save-dev gh-pages
```

---

## 📋 Checklist Pre-Despliegue

Antes de desplegar, verifica:

- [ ] ✅ Agregaste `base: '/nombre-repo/'` en `vite.config.ts`
- [ ] ✅ Instalaste `gh-pages` como dev dependency
- [ ] ✅ Los archivos `/index.html` y `/public/404.html` tienen los scripts de redirección
- [ ] ✅ Tu código está subido a GitHub
- [ ] ✅ Has hecho commit de todos los cambios

---

## 🔄 Actualizar el Despliegue

Cada vez que hagas cambios:

```bash
# 1. Commit tus cambios
git add .
git commit -m "Actualización"
git push origin main

# 2. Redesplegar
npm run deploy
```

---

## 🌐 URLs de Ejemplo

Si tu usuario es `juanperez` y tu repo es `banco-alimentos`:

- **Repositorio:** `https://github.com/juanperez/banco-alimentos`
- **App desplegada:** `https://juanperez.github.io/banco-alimentos/`
- **Configuración vite.config.ts:**
  ```typescript
  base: '/banco-alimentos/',
  ```

---

## 🎯 Comando Rápido

```bash
# Todo en uno: build + deploy
npm run deploy
```

---

## 📞 Soporte Adicional

Si después de seguir estos pasos tienes problemas, verifica:

1. **Consola del navegador (F12):** Busca errores de rutas 404
2. **GitHub Actions:** Verifica si hay errores en la pestaña Actions
3. **Settings → Pages:** Confirma que está configurado correctamente

---

## 🎉 ¡Listo!

Una vez configurado correctamente, tu sistema de Banque Alimentaire estará disponible públicamente en GitHub Pages.

**Recuerda:** GitHub Pages es gratis pero público. Si necesitas privacidad, considera Netlify/Vercel (también gratis con autenticación).
