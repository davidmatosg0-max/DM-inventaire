# 🔄 Guía de Actualizaciones de Versión

## Cómo actualizar la versión de la aplicación

Cada vez que realices cambios importantes en la aplicación, sigue estos pasos para actualizar la versión y notificar a los usuarios:

### 📝 Paso 1: Actualizar la información de versión

Edita el archivo `/src/app/version.ts`:

```typescript
export const APP_VERSION = {
  version: '2.5.4',  // 👈 Incrementa la versión aquí
  releaseDate: '2026-03-16',  // 👈 Actualiza la fecha
  buildNumber: 254,  // 👈 Incrementa el número de build
  environment: 'production'
};
```

### 📋 Paso 2: Agregar notas de la versión

Agrega un nuevo objeto al array `RELEASE_NOTES` al **inicio** del array (para que sea el primero):

```typescript
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '2.5.4',  // 👈 Nueva versión
    date: '2026-03-16',
    type: 'minor',  // 👈 'major' | 'minor' | 'patch' | 'hotfix'
    title: {
      fr: 'Titre de la mise à jour en français',
      es: 'Título de la actualización en español',
      en: 'Update title in English',
      ar: 'عنوان التحديث بالعربية'
    },
    description: {
      fr: 'Description détaillée en français',
      es: 'Descripción detallada en español',
      en: 'Detailed description in English',
      ar: 'وصف مفصل بالعربية'
    },
    changes: [
      {
        type: 'feature',  // 👈 'feature' | 'improvement' | 'bugfix' | 'security'
        description: {
          fr: '🆕 Nouvelle fonctionnalité en français',
          es: '🆕 Nueva funcionalidad en español',
          en: '🆕 New feature in English',
          ar: '🆕 ميزة جديدة بالعربية'
        }
      },
      {
        type: 'improvement',
        description: {
          fr: '⚡ Amélioration en français',
          es: '⚡ Mejora en español',
          en: '⚡ Improvement in English',
          ar: '⚡ تحسين بالعربية'
        }
      },
      {
        type: 'bugfix',
        description: {
          fr: '🔧 Correction de bug en français',
          es: '🔧 Corrección de error en español',
          en: '🔧 Bug fix in English',
          ar: '🔧 إصلاح خطأ بالعربية'
        }
      }
    ],
    breaking: false,  // 👈 true si hay cambios que rompen compatibilidad
    critical: false   // 👈 true si es una actualización crítica de seguridad
  },
  // ... versiones anteriores
];
```

### 🎯 Tipos de Versión

- **major (X.0.0)**: Cambios importantes que rompen compatibilidad
- **minor (0.X.0)**: Nuevas funcionalidades sin romper compatibilidad
- **patch (0.0.X)**: Correcciones de bugs y mejoras menores
- **hotfix**: Corrección urgente de problemas críticos

### 🏷️ Tipos de Cambios

- **feature**: Nueva funcionalidad (🆕)
- **improvement**: Mejora de funcionalidad existente (⚡)
- **bugfix**: Corrección de errores (🔧)
- **security**: Actualización de seguridad (🔒)

### ⚠️ Flags Especiales

- **breaking: true**: Muestra una notificación de advertencia (amarilla)
- **critical: true**: Muestra una notificación de error (roja) con mayor duración

### 📱 Ejemplo de Notificación

Cuando el usuario abra la aplicación después de una actualización, verá automáticamente:

```
✨ Nouvelle version 2.5.4
━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Sistema de Notificaciones de Actualizaciones

📦 Version 2.5.3 → 2.5.4
📅 2026-03-16

Se agregó un sistema inteligente de notificaciones que detecta y explica 
todas las actualizaciones en tiempo real.

🆕 Notificaciones automáticas para todas las modificaciones
⚡ Interfaz de notificaciones con colores personalizados
🔧 Corrección de claves duplicadas en gráficos
🔒 Mejoras de seguridad en el almacenamiento

                                                   [👍 OK]
```

### 🔍 Ver Historial de Versiones

El componente `VersionHistory` muestra todas las versiones anteriores:

```typescript
import { VersionHistory } from './components/VersionHistory';

// Usar en cualquier parte de la app
<VersionHistory />
```

### 🚀 Checklist de Actualización

- [ ] Actualizar `APP_VERSION.version`
- [ ] Actualizar `APP_VERSION.releaseDate`
- [ ] Incrementar `APP_VERSION.buildNumber`
- [ ] Agregar nueva entrada en `RELEASE_NOTES` al inicio del array
- [ ] Completar título en los 4 idiomas (fr, es, en, ar)
- [ ] Completar descripción en los 4 idiomas
- [ ] Listar todos los cambios con su tipo correcto
- [ ] Establecer flags `breaking` y `critical` si aplica
- [ ] Probar que la notificación se muestre correctamente
- [ ] Mantener solo las últimas 5 versiones en el historial

### 💡 Consejos

1. **Emojis**: Usa emojis relevantes al inicio de cada descripción para hacerla más visual
2. **Claridad**: Sé específico sobre qué cambió y por qué
3. **Idiomas**: Asegúrate de traducir correctamente a todos los idiomas
4. **Orden**: Mantén las versiones ordenadas de más reciente a más antigua
5. **Limpieza**: Elimina versiones muy antiguas para mantener el array limpio (máximo 5-10 versiones)

### 🐛 Solución de Problemas

**La notificación no aparece:**
- Verifica que la versión nueva sea mayor que la anterior
- Limpia localStorage: `localStorage.removeItem('banco_alimentos_app_version')`
- Recarga la página

**La notificación aparece en cada recarga:**
- Verifica que `localStorage.setItem(VERSION_STORAGE_KEY, currentVersion)` se esté ejecutando
- Revisa la consola del navegador para errores

**Texto no traducido:**
- Asegúrate de tener todos los idiomas (fr, es, en, ar) en cada campo de texto
- El sistema usa 'fr' como fallback si falta un idioma
