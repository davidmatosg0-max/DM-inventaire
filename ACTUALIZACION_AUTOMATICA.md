# 🔄 Sistema de Actualización Automática de Versiones

## Resumen

El sistema ahora actualiza automáticamente la pestaña **Versions** cada vez que se despliega una nueva actualización de la página, sin necesidad de recargar manualmente.

## Características

### 1. Detección Automática de Actualizaciones

El sistema verifica automáticamente cada 30 segundos si hay una nueva versión disponible y actualiza la interfaz en tiempo real.

### 2. Script de Actualización Automática

Se creó un script Node.js (`/scripts/update-version.js`) que:

- ✅ Incrementa automáticamente el número de versión
- ✅ Actualiza la fecha de lanzamiento al día actual
- ✅ Incrementa el buildNumber
- ✅ Actualiza el primer registro en RELEASE_NOTES con la fecha actual

#### Uso del Script

```bash
# Actualización automática (incrementa patch)
node scripts/update-version.js

# Actualización patch (0.0.X)
node scripts/update-version.js patch

# Actualización minor (0.X.0)
node scripts/update-version.js minor

# Actualización major (X.0.0)
node scripts/update-version.js major
```

### 3. Hook de Actualización Automática

El hook `useAutoVersionUpdate` monitorea cambios en la versión:

```typescript
const { currentVersion, shouldRefresh, checkForVersionUpdate } = useAutoVersionUpdate();
```

**Funcionalidades:**

- 🔍 Verifica cada 30 segundos si hay actualizaciones
- 📡 Detecta cambios desde otras pestañas (usando Storage Events)
- 🔄 Fuerza actualización de la interfaz cuando detecta cambios
- 💾 Sincroniza versión con localStorage

### 4. Componente VersionHistory Mejorado

El componente ahora incluye:

- ✨ Detección automática de nuevas versiones
- 🔄 Botón de actualización que aparece cuando hay cambios
- 📊 Indicador visual de actualización disponible
- ⚡ Recarga automática de datos sin refrescar la página

## Flujo de Actualización

```
1. Desarrollador hace cambios
   ↓
2. Ejecuta: node scripts/update-version.js
   ↓
3. Script actualiza /src/app/version.ts
   - Incrementa buildNumber
   - Actualiza releaseDate
   - Incrementa version (patch/minor/major)
   ↓
4. Se despliega la aplicación
   ↓
5. Hook useAutoVersionUpdate detecta cambio
   ↓
6. Componente VersionHistory se actualiza automáticamente
   ↓
7. Usuario ve la nueva versión sin recargar
```

## Integración con el Deployment

### Opción 1: Integrar en el proceso de build

Agrega al `package.json`:

```json
{
  "scripts": {
    "prebuild": "node scripts/update-version.js",
    "build": "vite build"
  }
}
```

### Opción 2: Ejecutar manualmente antes de desplegar

```bash
# 1. Actualizar versión
node scripts/update-version.js

# 2. Actualizar RELEASE_NOTES en /src/app/version.ts con los cambios

# 3. Hacer commit y deploy
git add .
git commit -m "chore: actualizar versión"
git push
```

## Verificación

Para verificar que el sistema funciona:

1. **En Consola del Navegador:**
   ```javascript
   // Ver versión actual
   console.log(localStorage.getItem('banco_alimentos_app_version'));
   
   // Forzar verificación
   // (El hook verifica automáticamente cada 30 segundos)
   ```

2. **En la Interfaz:**
   - Abre Configuración → Pestaña "Versions"
   - El banner superior muestra la versión actual
   - Si hay actualización, aparece botón "Actualizar" 🔄

## Actualizar el Historial de Versiones

Cada vez que incrementas la versión, debes actualizar manualmente el array `RELEASE_NOTES` en `/src/app/version.ts`:

```typescript
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.5.X', // Nueva versión
    date: '2026-03-XX', // Fecha actual
    type: 'patch', // o 'minor', 'major', 'hotfix'
    title: {
      fr: 'Título en francés',
      es: 'Título en español',
      en: 'Title in English',
      ar: 'عنوان بالعربية'
    },
    description: {
      fr: 'Descripción detallada en francés...',
      es: 'Descripción detallada en español...',
      en: 'Detailed description in English...',
      ar: 'وصف تفصيلي بالعربية...'
    },
    changes: [
      {
        type: 'feature', // o 'improvement', 'bugfix', 'security'
        description: {
          fr: '🆕 Nueva característica en francés',
          es: '🆕 Nueva característica en español',
          en: '🆕 New feature in English',
          ar: '🆕 ميزة جديدة بالعربية'
        }
      }
      // ... más cambios
    ],
    breaking: false, // true si rompe compatibilidad
    critical: false  // true si es actualización crítica
  },
  // ... versiones anteriores
];
```

## Tipos de Cambios

### Iconos de Tipo de Cambio

- 🆕 **feature** - Nueva funcionalidad (azul)
- ⚡ **improvement** - Mejora de funcionalidad existente (verde)
- 🔧 **bugfix** - Corrección de errores (amarillo)
- 🔒 **security** - Mejora de seguridad (rojo)

### Tipos de Versión

- **major** (X.0.0) - Cambios importantes que rompen compatibilidad
- **minor** (0.X.0) - Nuevas características sin romper compatibilidad
- **patch** (0.0.X) - Correcciones de errores y mejoras menores
- **hotfix** - Corrección urgente de bug crítico

## Notificaciones de Actualización

El sistema usa `useVersionCheck` para mostrar notificaciones cuando detecta una nueva versión:

- ✨ **Actualización Normal** - Notificación verde con detalles
- ⚠️ **Actualización Importante** (breaking) - Notificación amarilla
- 🚨 **Actualización Crítica** - Notificación roja con advertencia

## Monitoreo y Debugging

### Funciones de Consola Disponibles

```javascript
// Ver estado del sistema de versiones
console.log('Versión actual:', localStorage.getItem('banco_alimentos_app_version'));
console.log('Última verificación:', localStorage.getItem('version_last_checked'));

// Forzar recarga de versión
location.reload();
```

### Logs Automáticos

El sistema registra automáticamente en consola:

```
🔄 Nueva versión detectada: 2.5.3 → 2.5.4
✅ Versión actualizada en localStorage
```

## Sincronización Multi-Pestaña

Si un usuario tiene múltiples pestañas abiertas:

1. Una pestaña detecta la actualización
2. El cambio se propaga automáticamente a todas las pestañas usando Storage Events
3. Todas las pestañas muestran la nueva versión sin recargar

## Beneficios

✅ **Sin Recarga Manual** - Los usuarios ven actualizaciones automáticamente
✅ **Sincronización Multi-Pestaña** - Cambios visibles en todas las pestañas
✅ **Notificaciones Inteligentes** - Alertas según criticidad de actualización
✅ **Historial Completo** - Registro detallado de todas las versiones
✅ **Multilingüe** - Soporte completo para FR, ES, EN, AR
✅ **Deployment Automatizado** - Script integrable en CI/CD

## Recomendaciones

1. **Siempre actualiza RELEASE_NOTES** cuando cambias la versión
2. **Ejecuta el script antes de cada deployment** para mantener versión sincronizada
3. **Usa semantic versioning** correctamente (major.minor.patch)
4. **Documenta cambios críticos** con `critical: true`
5. **Marca breaking changes** con `breaking: true`

---

**Última actualización**: 16/03/2026
**Versión del Sistema**: 2.5.4 con Actualización Automática
