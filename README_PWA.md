# 📱 PWA - Instalación Local de la App

## ✅ Implementación Completada

El sistema **Banque Alimentaire** ahora es una **Progressive Web App (PWA)** totalmente funcional que puede instalarse localmente en cualquier dispositivo.

---

## 🎯 Archivos Implementados

### 1. **Service Worker** (`/public/sw.js`)
✅ Cache inteligente de recursos  
✅ Estrategia Network First con fallback  
✅ Sincronización en segundo plano  
✅ Soporte para notificaciones push  
✅ Limpieza automática de caches antiguos  

### 2. **Manifest PWA** (`/public/manifest.json`)
✅ Configuración completa de la app  
✅ Iconos 192x192 y 512x512  
✅ Colores del sistema (#1a4d7a y #2d9561)  
✅ Shortcuts de acceso rápido  
✅ Screenshots para app stores  

### 3. **Componente Instalador** (`/src/app/components/PWAInstaller.tsx`)
✅ Banner de instalación automático  
✅ Detección de plataforma (iOS/Android/Desktop)  
✅ Instrucciones específicas para iOS  
✅ Notificaciones de actualización  
✅ Soporte multilingüe (FR/ES/EN/AR)  

### 4. **Traducciones PWA**
✅ Francés (`fr.json`)  
✅ Español (`es.json`)  
✅ Inglés (`en.json`)  
✅ Árabe (`ar.json`) con RTL  

### 5. **Meta Tags PWA** (`/index.html`)
✅ Apple Mobile Web App tags  
✅ Theme color dinámico  
✅ Viewport optimizado  
✅ Status bar translúcido  

---

## 🚀 Uso

### Instalación Automática

1. **Los usuarios verán un banner** automáticamente después de 3 segundos
2. **Click en "Instalar"** para agregar la app al dispositivo
3. **¡Listo!** El icono aparecerá en la pantalla de inicio

### Instalación Manual

#### 📱 Android/Chrome
- Menú ⋮ → "Agregar a pantalla de inicio"

#### 🍎 iOS/Safari
- Compartir 📤 → "Agregar a pantalla de inicio"

#### 💻 Desktop
- Icono + en barra de direcciones → "Instalar"

---

## 🌐 Traducciones

### Claves agregadas a todos los idiomas:

```json
"pwa": {
  "installTitle": "...",
  "installDescription": "...",
  "install": "...",
  "later": "...",
  "installed": "...",
  "installing": "...",
  "updateAvailable": "...",
  "updateDescription": "...",
  "reload": "...",
  "iosInstallTitle": "...",
  "iosInstallSteps": "...",
  "iosStep1": "...",
  "iosStep2": "...",
  "iosStep3": "..."
}
```

---

## 🎨 Iconos Personalizados

### Crear iconos propios:

1. **Tamaños requeridos:**
   - 192x192 píxeles
   - 512x512 píxeles

2. **Colores del sistema:**
   - Azul: `#1a4d7a`
   - Verde: `#2d9561`

3. **Formato:** PNG con transparencia

4. **Ubicación:**
   ```
   /public/icon-192x192.png
   /public/icon-512x512.png
   ```

5. **Herramientas:**
   - [PWA Builder](https://www.pwabuilder.com/imageGenerator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

---

## 📊 Características Implementadas

### ✅ Offline Support
- Funciona sin conexión a internet
- Cache inteligente de recursos
- Sincronización automática al reconectar

### ✅ Actualizaciones Automáticas
- Detecta nuevas versiones
- Notifica al usuario
- Actualiza en segundo plano

### ✅ Instalación Inteligente
- Banner contextual
- Instrucciones por plataforma
- Persistencia de preferencias

### ✅ Experiencia Nativa
- Pantalla completa
- Sin barra de navegador
- Inicio rápido desde el home screen

---

## 🔧 Configuración

### Personalizar colores del tema:

**Editar `/public/manifest.json`:**
```json
{
  "theme_color": "#1a4d7a",
  "background_color": "#ffffff"
}
```

**Actualizar `/index.html`:**
```html
<meta name="theme-color" content="#1a4d7a" />
```

### Personalizar nombre de la app:

**En `/public/manifest.json`:**
```json
{
  "name": "Tu Nombre Personalizado",
  "short_name": "Nombre Corto"
}
```

---

## 🐛 Depuración

### ⚠️ Error Común en Entornos Embebidos

Si ves este error en la consola:
```
[PWA] Error al registrar Service Worker: SecurityError: The script has an unsupported MIME type ('text/html').
```

**✅ Esto es NORMAL en:**
- Figma iframe preview
- Entornos embebidos sin HTTPS
- Algunos servidores sin configuración correcta

**💡 Solución:**
- El código maneja el error automáticamente
- La app funciona sin PWA
- Ver [`PWA_TROUBLESHOOTING.md`](./PWA_TROUBLESHOOTING.md) para configuración del servidor

### Ver Service Worker registrado:

1. Abrir DevTools (F12)
2. Application → Service Workers
3. Ver estado y caché

### Limpiar caché manualmente:

```javascript
// En consola del navegador:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});

caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

location.reload();
```

### Probar instalación:

1. Abrir en modo incógnito
2. Esperar 3 segundos
3. Verificar que aparezca el banner

---

## 📱 Compatibilidad

✅ Chrome 90+ (Android/Desktop)  
✅ Edge 90+ (Windows/Mac)  
✅ Safari 15.4+ (iOS/macOS)  
✅ Firefox 90+ (Android/Desktop)  
✅ Samsung Internet 14+  
✅ Opera 76+  

---

## 🎯 Próximas Mejoras

- [ ] Notificaciones push en tiempo real
- [ ] Sincronización periódica en segundo plano
- [ ] Compartir contenido del sistema
- [ ] Accesos directos dinámicos
- [ ] Modo oscuro según hora del día
- [ ] Soporte para widgets (futuro)

---

## 📚 Documentación Completa

Ver [`GUIA_INSTALACION_PWA.md`](./GUIA_INSTALACION_PWA.md) para:
- Guía de instalación detallada
- Solución de problemas
- Casos de uso
- Mejores prácticas

---

## ✨ Resultado

Los usuarios ahora pueden:

1. ✅ **Instalar la app** con un solo click
2. ✅ **Usarla offline** sin internet
3. ✅ **Recibir actualizaciones** automáticamente
4. ✅ **Acceso rápido** desde el home screen
5. ✅ **Experiencia nativa** en cualquier dispositivo

---

**Implementado:** Marzo 2026  
**Versión PWA:** 1.0.0  
**Sistema:** Banque Alimentaire v5.0 PRO