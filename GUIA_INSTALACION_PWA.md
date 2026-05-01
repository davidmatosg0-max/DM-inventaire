# 📱 Guía de Instalación Local - PWA Banque Alimentaire

## 🎯 Descripción

El sistema Banque Alimentaire ahora incluye soporte completo para **Progressive Web App (PWA)**, permitiendo instalar la aplicación localmente en cualquier dispositivo (computadora, tablet, smartphone) para:

- ✅ **Acceso rápido** sin abrir el navegador
- ✅ **Funcionamiento offline** con caché inteligente
- ✅ **Experiencia nativa** similar a una app instalada
- ✅ **Actualizaciones automáticas** cuando hay nuevas versiones
- ✅ **Notificaciones push** (próximamente)

---

## 🚀 Instalación

### 📱 **En Dispositivos Móviles (Android/iOS)**

#### Android (Chrome, Edge, Samsung Internet)
1. Abra el sistema en su navegador
2. Aparecerá un **banner de instalación** automáticamente
3. Presione el botón **"Instalar"**
4. Confirme la instalación
5. ¡Listo! El icono aparecerá en su pantalla de inicio

**Instalación Manual (Android):**
1. Toque el menú **⋮** (tres puntos) en el navegador
2. Seleccione **"Agregar a pantalla de inicio"** o **"Instalar app"**
3. Confirme la instalación

#### iOS (iPhone/iPad - Safari)
1. Abra el sistema en Safari
2. Presione el botón de **Compartir** (📤) en la barra inferior
3. Desplácese y seleccione **"Agregar a pantalla de inicio"**
4. Ingrese un nombre (opcional) y presione **"Agregar"**
5. ¡Listo! El icono aparecerá en su pantalla de inicio

---

### 💻 **En Computadoras (Windows/Mac/Linux)**

#### Chrome, Edge, Brave
1. Visite el sistema en su navegador
2. Aparecerá un banner o icono de instalación en la barra de direcciones (+)
3. Haga clic en **"Instalar"**
4. Confirme la instalación
5. La app se abrirá en una ventana independiente

**Instalación Manual:**
1. Haga clic en el menú **⋮** (tres puntos)
2. Seleccione **"Instalar Banque Alimentaire..."**
3. Confirme la instalación

#### Firefox
1. Haga clic en el menú **☰** (tres líneas)
2. Busque la opción **"Instalar esta aplicación"**
3. Confirme la instalación

---

## 🎨 Iconos de la Aplicación

El sistema está configurado con:
- **Icono 192x192**: Para pantallas pequeñas y medianas
- **Icono 512x512**: Para pantallas de alta resolución
- **Colores del sistema**: 
  - 🔵 Azul marino primario: `#1a4d7a`
  - 🟢 Verde elegante secundario: `#2d9561`

### 📝 Crear Iconos Personalizados

Si desea personalizar los iconos:

1. **Cree dos imágenes PNG:**
   - `icon-192x192.png` (192 x 192 píxeles)
   - `icon-512x512.png` (512 x 512 píxeles)

2. **Guárdelos en:**
   ```
   /public/icon-192x192.png
   /public/icon-512x512.png
   ```

3. **Herramientas recomendadas:**
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Canva, Figma, Photoshop, etc.

---

## ⚙️ Características Técnicas

### Service Worker Implementado

El sistema incluye un Service Worker completo (`/public/sw.js`) que:

1. **Cache inteligente:**
   - Caché de recursos esenciales al instalar
   - Caché runtime para contenido dinámico
   - Estrategia "Network First" con fallback a caché

2. **Actualizaciones automáticas:**
   - Detecta nuevas versiones automáticamente
   - Muestra notificación al usuario
   - Actualiza sin perder datos

3. **Modo offline:**
   - Funciona sin conexión a internet
   - Sirve contenido desde caché local
   - Sincronización automática al reconectar

### Manifest PWA

Configuración completa en `/public/manifest.json`:

```json
{
  "name": "Banque Alimentaire - Système de Gestion",
  "short_name": "Banque Alimentaire",
  "display": "standalone",
  "theme_color": "#1a4d7a",
  "background_color": "#ffffff",
  "orientation": "portrait-primary",
  "lang": "fr-CA"
}
```

### Componente PWAInstaller

El componente React (`/src/app/components/PWAInstaller.tsx`) gestiona:
- ✅ Banner de instalación inteligente
- ✅ Detección automática de plataforma (iOS/Android/Desktop)
- ✅ Instrucciones específicas para iOS
- ✅ Notificaciones de actualización
- ✅ Soporte multilingüe (FR/ES/EN/AR)

---

## 🌐 Soporte Multilingüe

El instalador está traducido en los 4 idiomas del sistema:

- 🇫🇷 **Francés**: "Installer l'Application"
- 🇪🇸 **Español**: "Instalar Aplicación"
- 🇬🇧 **Inglés**: "Install Application"
- 🇸🇦 **Árabe**: "تثبيت التطبيق" (con soporte RTL)

---

## 📊 Ventajas de la Instalación

### Para Usuarios
- ⚡ **Inicio más rápido**: No necesita abrir el navegador
- 📱 **Pantalla completa**: Más espacio para trabajar
- 🔔 **Notificaciones**: Reciba alertas importantes
- 💾 **Espacio de almacenamiento**: Datos guardados localmente
- 🌐 **Funciona offline**: Acceso incluso sin internet

### Para el Sistema
- 🚀 **Mejor rendimiento**: Recursos cacheados
- 📈 **Mayor engagement**: Usuarios instalan = más uso
- 🔄 **Actualizaciones controladas**: Sin forzar recarga
- 📊 **Métricas mejoradas**: Seguimiento de instalaciones

---

## 🔧 Desinstalación

### Android
1. Mantenga presionado el icono de la app
2. Seleccione **"Desinstalar"** o arrastre a la papelera
3. Confirme la desinstalación

### iOS
1. Mantenga presionado el icono de la app
2. Seleccione **"Eliminar app"**
3. Confirme **"Eliminar de pantalla de inicio"**

### Windows/Mac/Linux
1. Abra la app instalada
2. Vaya al menú **⋮** (tres puntos)
3. Seleccione **"Desinstalar..."**
4. Confirme la desinstalación

**O desde el navegador:**
- Chrome/Edge: `chrome://apps` → Clic derecho → "Desinstalar"

---

## 🆘 Solución de Problemas

### El banner de instalación no aparece
- ✅ Asegúrese de usar HTTPS (o localhost)
- ✅ Espere 3 segundos después de cargar la página
- ✅ Verifique que no haya ocultado el banner anteriormente
- ✅ Limpie el caché del navegador

### La app no funciona offline
- ✅ Verifique que el Service Worker esté registrado (F12 → Application → Service Workers)
- ✅ Asegúrese de haber visitado la app al menos una vez con internet
- ✅ Algunos recursos externos pueden no estar disponibles offline

### Error al instalar
- ✅ Use la versión más reciente del navegador
- ✅ Verifique que el dispositivo tenga espacio de almacenamiento
- ✅ Intente desde otro navegador compatible

### Limpiar caché manualmente
```javascript
// Abrir consola del navegador (F12) y ejecutar:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
location.reload();
```

---

## 🔐 Seguridad

- ✅ Solo funciona en HTTPS (excepto localhost)
- ✅ Service Worker aislado por dominio
- ✅ Datos locales encriptados por el navegador
- ✅ Sin acceso a datos de otras apps

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+ (Android/Desktop)
- ✅ Edge 90+ (Windows/Mac)
- ✅ Safari 15.4+ (iOS/macOS)
- ✅ Firefox 90+ (Android/Desktop)
- ✅ Samsung Internet 14+
- ✅ Opera 76+

### Sistemas Operativos
- ✅ Android 5.0+
- ✅ iOS 15.4+
- ✅ Windows 10+
- ✅ macOS 11+
- ✅ Linux (todas las distribuciones modernas)

---

## 📚 Recursos Adicionales

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

## 🎯 Próximas Mejoras

- [ ] Notificaciones push para alertas críticas
- [ ] Sincronización en segundo plano
- [ ] Compartir contenido del sistema
- [ ] Accesos directos personalizados
- [ ] Modo oscuro automático según hora del día
- [ ] Soporte para tablets en modo landscape mejorado

---

## ✨ Desarrollado por

**Sistema Integral de Gestión - Banque Alimentaire v5.0 PRO**  
Con soporte PWA completo y multilingüe (FR/ES/EN/AR)

---

**Fecha de implementación:** Marzo 2026  
**Versión PWA:** 1.0.0
