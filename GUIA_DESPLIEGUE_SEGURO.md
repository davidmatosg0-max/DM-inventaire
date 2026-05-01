# 🔒 Guía de Despliegue Seguro - Banque Alimentaire

## ✅ Resumen Rápido

**¿Los datos desaparecen al actualizar código en GitHub?**
> **NO** - Los datos están en el navegador (localStorage), no en GitHub ni en el servidor.

---

## 📊 Cómo Funciona el Sistema de Datos

### **Datos en el Navegador (localStorage)**

Tu sistema almacena TODOS los datos en el navegador del usuario usando `localStorage`:

```
┌─────────────────────────────────────┐
│   NAVEGADOR DEL USUARIO             │
│                                     │
│  localStorage:                      │
│  ├─ usuarios_banco_alimentos        │
│  ├─ organismos_banco_alimentos      │
│  ├─ comandas_banco_alimentos        │
│  ├─ inventario_banco_alimentos      │
│  ├─ ofertas_banco_alimentos         │
│  ├─ transporte_banco_alimentos      │
│  └─ configuraciones...              │
└─────────────────────────────────────┘
         ↑
         │ Los datos PERMANECEN aquí
         │ incluso después de actualizar
         │ el código en GitHub
```

### **Código en GitHub/Servidor**

```
┌─────────────────────────────────────┐
│   GITHUB / SERVIDOR                 │
│                                     │
│  ├─ src/                            │
│  │  ├─ components/                  │
│  │  ├─ pages/                       │
│  │  └─ utils/                       │
│  ├─ package.json                    │
│  └─ index.html                      │
└─────────────────────────────────────┘
         ↑
         │ Solo código que se actualiza
         │ SIN datos de usuarios
```

---

## 🚀 Proceso de Actualización Segura

### **Paso 1: Verificar cambios**

```bash
# Ver qué archivos vas a actualizar
git status

# Ver los cambios específicos
git diff
```

### **Paso 2: Hacer commit**

```bash
# Agregar archivos modificados
git add .

# O agregar archivos específicos
git add src/app/components/GuideCompletModules.tsx
git add src/app/components/pages/VistaPublicaOrganismo_fix.tsx

# Hacer commit con mensaje descriptivo
git commit -m "feat: Actualizar Guide Complet con nuevos módulos (Entrepôt, Cuisine, Liaison, Recrutement)"
```

### **Paso 3: Push a GitHub**

```bash
# Enviar cambios a GitHub
git push origin main
```

### **Paso 4: Despliegue automático**

Si usas plataformas como **Vercel**, **Netlify**, o **GitHub Pages**:

1. ✅ El código se actualiza automáticamente
2. ✅ Los usuarios ven la nueva versión
3. ✅ Los datos en localStorage NO se tocan
4. ✅ Las sesiones activas continúan normalmente

---

## ⚠️ Casos donde SÍ podrías perder datos

### **1. Cambiar nombres de claves localStorage**

❌ **EVITAR:**
```typescript
// ANTES
localStorage.setItem('usuarios_banco_alimentos', ...)

// DESPUÉS (DIFERENTE NOMBRE)
localStorage.setItem('users_new', ...)  // ❌ Perdería los datos anteriores
```

✅ **SOLUCIÓN:**
```typescript
// Usar el sistema de migración incluido
// Ver: /src/app/utils/dataMigration.ts
```

### **2. Cambiar estructura de datos sin migración**

❌ **EVITAR:**
```typescript
// Si cambias la estructura de objetos sin migración
// Ejemplo: agregar campo obligatorio sin valor por defecto
```

✅ **SOLUCIÓN:**
```typescript
// Usar runDataMigrations() para transformar datos
// Ya está integrado en App.tsx
```

### **3. Usuario limpia caché del navegador**

⚠️ **INEVITABLE:**
- Si el usuario hace "Borrar datos de navegación"
- Si usa modo incógnito
- Si cambia de navegador/dispositivo

✅ **SOLUCIÓN:**
```typescript
// Usar el componente BackupManager para descargar backups
// Ver: /src/app/components/BackupManager.tsx
```

---

## 🛡️ Sistema de Protección Implementado

### **1. Migración Automática de Datos**

Archivo: `/src/app/utils/dataMigration.ts`

```typescript
// Se ejecuta automáticamente al cargar la app
runDataMigrations();
```

**Funcionalidades:**
- ✅ Versionado de esquema de datos
- ✅ Migraciones automáticas entre versiones
- ✅ Renombrado seguro de claves
- ✅ Transformación de estructuras

### **2. Sistema de Backups**

Componente: `/src/app/components/BackupManager.tsx`

**Permite a los usuarios:**
- 💾 Descargar backup completo en JSON
- 📤 Restaurar desde archivo de backup
- 🔍 Inspeccionar tamaño y contenido de datos
- 📊 Ver qué se guarda automáticamente

**Integración sugerida:**
Agregar a la página de Configuración para que los usuarios puedan hacer backups manuales.

### **3. Logs de Consola**

Al cargar la app, verás en consola:

```
✅ Sistema inicializado - Versión: 1.0.0
📦 Backup creado - Tamaño: 245.67 KB
🔍 Inspección de localStorage:
═══════════════════════════════════════
📝 usuarios_banco_alimentos: 5.23 KB
📝 organismos_banco_alimentos: 12.45 KB
...
```

---

## 📋 Checklist de Actualización

Antes de hacer `git push`, verifica:

- [ ] ¿Cambiaste nombres de claves localStorage? → Crear migración
- [ ] ¿Cambiaste estructura de datos? → Agregar transformación
- [ ] ¿Son solo cambios de UI/funcionalidad? → ✅ Push seguro
- [ ] ¿Agregaste nuevos campos a objetos? → Usar valores por defecto
- [ ] ¿Probaste localmente? → Verificar que todo funciona

---

## 🔧 Comandos Útiles de Consola

### **Ver todos los datos guardados:**

```javascript
// En la consola del navegador (F12)
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(key, ':', value?.length, 'caracteres');
}
```

### **Descargar backup desde consola:**

```javascript
import { downloadBackup } from './utils/dataMigration';
downloadBackup();
```

### **Ver versión de datos:**

```javascript
console.log('Versión:', localStorage.getItem('data_schema_version'));
```

### **Limpiar datos y empezar de nuevo (CUIDADO):**

```javascript
// ⚠️ Esto BORRA todo - hacer backup primero
localStorage.clear();
location.reload();
```

---

## 🌐 Plataformas de Despliegue

### **Vercel**
```bash
# Conectar con GitHub
vercel

# Deploys automáticos en cada push a main
```

### **Netlify**
```bash
# Conectar con GitHub desde panel web
# Configurar: Build command: npm run build
# Publish directory: dist
```

### **GitHub Pages**
```bash
# Agregar a package.json:
"homepage": "https://tuusuario.github.io/banque-alimentaire",

# Script de deploy:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Ejecutar:
npm run deploy
```

---

## 💡 Mejores Prácticas

### **1. Hacer backups regulares**
- Antes de actualizar versiones importantes
- Mensualmente para datos críticos
- Después de importar datos grandes

### **2. Versionado semántico**
```bash
# Cambios menores (UI, textos)
git commit -m "fix: Corregir texto en botón"

# Nuevas funcionalidades
git commit -m "feat: Agregar módulo Cuisine"

# Cambios que rompen compatibilidad
git commit -m "BREAKING CHANGE: Nueva estructura de datos"
```

### **3. Testing antes de deploy**
```bash
# Probar localmente
npm run dev

# Verificar que todo funciona
# - Login
# - Crear/editar datos
# - Navegación entre páginas
# - Todas las funcionalidades críticas
```

### **4. Monitoreo post-deploy**
- Verificar que la app carga correctamente
- Revisar consola del navegador (errores)
- Probar funcionalidades principales
- Verificar que datos persisten tras recargar

---

## 🆘 Solución de Problemas

### **Problema: "Los datos desaparecieron"**

**Posibles causas:**
1. Usuario borró caché del navegador
2. Usuario cambió de navegador/dispositivo
3. Cambio en nombres de claves localStorage
4. Error en migración de datos

**Soluciones:**
1. Restaurar desde backup (si existe)
2. Verificar consola para errores
3. Revisar versión de datos: `localStorage.getItem('data_schema_version')`
4. Contactar soporte con logs de consola

### **Problema: "Datos corruptos"**

**Solución:**
```javascript
// Borrar clave específica
localStorage.removeItem('clave_problematica');

// O restaurar desde backup
// Usar componente BackupManager
```

### **Problema: "localStorage lleno"**

Límite típico: **5-10 MB** por dominio

**Solución:**
```javascript
// Limpiar datos antiguos
localStorage.removeItem('datos_antiguos');

// O exportar a archivo y limpiar
```

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar consola del navegador** (F12 → Console)
2. **Verificar Network tab** (errores de carga)
3. **Inspeccionar localStorage** (Application → Local Storage)
4. **Descargar backup** antes de intentar arreglar
5. **Contactar soporte** con:
   - Mensaje de error exacto
   - Pasos para reproducir
   - Versión del navegador
   - Logs de consola

---

## ✨ Conclusión

**Tu sistema está SEGURO para actualizaciones:**

✅ Los datos están en el navegador del usuario
✅ El código se actualiza sin afectar datos
✅ Sistema de migraciones protege contra cambios
✅ Backups permiten recuperación
✅ Versionado mantiene compatibilidad

**¡Actualiza con confianza! 🚀**

---

*Última actualización: 2026-03-09*
*Versión del sistema: 1.0.0*
