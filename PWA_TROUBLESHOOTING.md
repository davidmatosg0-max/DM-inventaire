# 🔧 Solución de Problemas - PWA

## ⚠️ Error Común: MIME Type Incorrecto

### Error Completo:
```
[PWA] Error al registrar Service Worker: SecurityError: Failed to register a ServiceWorker with script: The script has an unsupported MIME type ('text/html').
```

### ¿Por qué ocurre?

Este error sucede cuando:
1. ❌ El archivo `sw.js` no existe en `/public/`
2. ❌ El servidor devuelve una página 404 en HTML
3. ❌ El servidor no está configurado para servir `.js` con el MIME type correcto
4. ❌ Estás en un entorno sin HTTPS (excepto localhost)

---

## ✅ Soluciones Implementadas

### 1. **Verificación Automática**

El código ahora verifica:
- ✅ Si el entorno es seguro (HTTPS o localhost)
- ✅ Si el archivo `sw.js` existe antes de registrar
- ✅ Si el MIME type es correcto (`application/javascript`)
- ✅ Manejo silencioso de errores (no rompe la app)

### 2. **PWA como Funcionalidad Opcional**

La PWA es **opcional** y no afecta el funcionamiento del sistema:
- ✅ Si falla, la app sigue funcionando normalmente
- ✅ Solo se muestra un log en consola
- ✅ El banner de instalación no aparece si PWA no está disponible

---

## 🔧 Configuración del Servidor

### Para Apache (.htaccess)

Ya creado en `/public/.htaccess`:

```apache
<IfModule mod_mime.c>
  AddType application/javascript js
  AddType application/javascript sw.js
  AddType application/manifest+json json
</IfModule>

<FilesMatch "sw\.js$">
  Header set Content-Type "application/javascript"
  Header set Service-Worker-Allowed "/"
</FilesMatch>
```

### Para Nginx

Agregar a tu configuración:

```nginx
location ~ \.js$ {
  add_header Content-Type application/javascript;
}

location = /sw.js {
  add_header Content-Type application/javascript;
  add_header Service-Worker-Allowed /;
  add_header Cache-Control "public, max-age=0, must-revalidate";
}

location = /manifest.json {
  add_header Content-Type application/manifest+json;
}
```

### Para Netlify

Renombrar `/public/_headers_pwa` a `/public/_headers`:

```bash
mv /public/_headers_pwa /public/_headers
```

El archivo ya contiene la configuración correcta.

### Para Vercel

Crear `/vercel.json`:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### Para Firebase Hosting

Agregar a `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Service-Worker-Allowed",
            "value": "/"
          }
        ]
      },
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      }
    ]
  }
}
```

---

## 🧪 Verificar que Funciona

### 1. Verificar que sw.js existe:

```bash
# Navegar a:
https://tu-dominio.com/sw.js

# Deberías ver el código JavaScript, no HTML
```

### 2. Verificar MIME type:

```bash
curl -I https://tu-dominio.com/sw.js

# Buscar:
Content-Type: application/javascript
```

### 3. Verificar en DevTools:

1. Abrir DevTools (F12)
2. Application → Service Workers
3. Ver si hay errores

### 4. Console Logs:

Si PWA está disponible:
```
[PWA] Service Worker registrado: https://...
```

Si NO está disponible (normal en algunos entornos):
```
[PWA] Service Worker no disponible en este entorno
```

---

## 🌐 Entornos Soportados

### ✅ Funcionará:
- HTTPS en producción
- localhost (desarrollo)
- 127.0.0.1 (desarrollo)
- Servidores con configuración correcta

### ❌ NO funcionará:
- HTTP en producción (sin SSL)
- Figma iframe preview (restricciones de seguridad)
- Algunos entornos embebidos
- Servidores sin configuración de MIME types

---

## 💡 ¿Cuándo se Activa PWA?

### Requisitos Mínimos:
1. ✅ HTTPS (o localhost)
2. ✅ Archivo `sw.js` disponible
3. ✅ MIME type correcto
4. ✅ Manifest válido
5. ✅ Navegador compatible

### Si NO se cumplen:
- ⚠️ La app funciona normal
- ⚠️ No hay banner de instalación
- ⚠️ No hay funcionalidad offline
- ⚠️ Log silencioso en consola

---

## 🚀 Desplegar con PWA

### Pasos Recomendados:

1. **Verificar archivos:**
   ```bash
   ls -la /public/sw.js
   ls -la /public/manifest.json
   ls -la /public/icon-*.svg
   ```

2. **Configurar servidor** (elegir según plataforma):
   - Apache: Usar `.htaccess`
   - Nginx: Actualizar config
   - Netlify: Renombrar `_headers_pwa` a `_headers`
   - Vercel: Crear `vercel.json`

3. **Deploy:**
   ```bash
   npm run build
   # Desplegar según tu plataforma
   ```

4. **Verificar:**
   - Abrir en HTTPS
   - Verificar console logs
   - Probar instalación

---

## 🔍 Debugging Avanzado

### Ver Service Workers Registrados:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrados:', registrations.length);
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('Estado:', reg.active?.state);
  });
});
```

### Desregistrar Service Worker:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Service Workers desregistrados');
});
```

### Limpiar Todo:

```javascript
// Desregistrar SW
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Limpiar caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Recargar
location.reload();
```

---

## 📱 Ambientes de Desarrollo vs Producción

### Desarrollo (localhost):
- ✅ PWA funciona en Chrome/Edge
- ✅ No requiere HTTPS
- ⚠️ Algunos navegadores pueden tener restricciones

### Producción (HTTPS):
- ✅ PWA funciona en todos los navegadores
- ✅ Instalación disponible
- ✅ Todas las funcionalidades

### Figma Preview (iframe):
- ❌ PWA NO disponible (restricciones de iframe)
- ✅ App funciona normal
- ℹ️ Normal ver el error en console

---

## 🎯 Recomendaciones

### Para Desarrollo:
1. Usar localhost o HTTPS
2. Ignorar errores en console si no es crítico
3. Probar PWA en build de producción

### Para Producción:
1. **Obligatorio:** HTTPS
2. **Configurar servidor** correctamente
3. **Generar iconos PNG** (mejor compatibilidad)
4. **Probar** en dispositivos reales

### Si PWA No Es Prioritaria:
- ✅ La implementación actual ya maneja errores
- ✅ La app funciona sin PWA
- ✅ Puedes ignorar los logs de "[PWA]"

---

## ❓ FAQs

**P: ¿La app funciona sin PWA?**  
R: Sí, completamente. PWA es una mejora opcional.

**P: ¿Por qué veo el error en Figma?**  
R: Figma iframe no permite Service Workers. Es normal.

**P: ¿Necesito arreglar el error?**  
R: No es urgente. El error es silencioso y no afecta la app.

**P: ¿Cuándo veré el banner de instalación?**  
R: Solo en HTTPS en producción con SW registrado correctamente.

**P: ¿Funciona en todos los navegadores?**  
R: Chrome, Edge, Safari 15.4+, Firefox, Samsung Internet. IE no soportado.

---

## 📚 Recursos

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [MDN Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Conclusión:** El error es esperado en entornos como Figma iframe. El código ahora maneja estos casos de forma elegante sin romper la aplicación. Para activar PWA completa, desplegar en HTTPS con configuración de servidor adecuada.
