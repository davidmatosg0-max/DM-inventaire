# 🔧 INSTRUCCIONES URGENTES: Limpiar Caché y LocalStorage

**Fecha**: 5 marzo 2026  
**Problema**: Error "Cannot destructure property 'label' of 'config[statut]' as it is undefined"  
**Causa**: Navegador usando versión antigua en caché

---

## ⚠️ IMPORTANTE: El código YA ESTÁ CORREGIDO

El archivo `/src/app/components/pages/Benevoles.tsx` ya tiene la corrección aplicada:

```typescript
// Helper: Render status badge with proper colors
const getStatusBadge = (statut: string) => {
  // Todos los estados posibles de bénévoles
  const statusConfigurations: Record<string, { label: string; color: string }> = {
    'actif': { label: 'Actif', color: 'bg-[#4CAF50] text-white' },
    'inactif': { label: 'Inactif', color: 'bg-[#999999] text-white' },
    'en pause': { label: 'En pause', color: 'bg-[#FFC107] text-[#333333]' },
    'en attente': { label: 'En attente', color: 'bg-[#FF9800] text-white' } // ✅ NUEVO
  };
  
  const config = statusConfigurations[statut];
  
  // Si el estado no existe, mostrar badge genérico
  if (!config) {
    console.warn(\`Estado desconocido: \${statut}\`);
    return <Badge className="bg-gray-400 text-white">{statut || 'N/A'}</Badge>;
  }
  
  return <Badge className={config.color}>{config.label}</Badge>;
};
```

---

## 🚨 SOLUCIÓN PASO A PASO

### Paso 1: Limpiar LocalStorage

Abre la **Consola del Navegador** (F12) y ejecuta:

```javascript
// Limpiar solo los bénévoles
localStorage.removeItem('benevoles');

// O limpiar TODO (recomendado)
localStorage.clear();

// Recargar página
location.reload();
```

### Paso 2: Limpiar Caché del Navegador

#### Opción A: Hard Refresh (RECOMENDADO)
**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

#### Opción B: Vaciar Caché Completo

**Chrome/Edge:**
1. Presiona `F12` para abrir DevTools
2. Clic derecho en el botón de refrescar 🔄
3. Selecciona **"Vaciar caché y recargar de manera forzada"**

**Firefox:**
1. `Ctrl + Shift + Delete`
2. Marca "Caché"
3. Clic en "Limpiar ahora"
4. Presiona `F5`

### Paso 3: Verificar que la versión es la correcta

Después de limpiar, verifica en la consola del navegador (F12 → Console) que aparezca:

```
Module Bénévoles - Version 2.1 (Fix: Support pour statut 'en attente')
```

Si ves advertencias como `Estado desconocido: ...`, significa que la nueva versión cargó correctamente pero hay datos viejos en localStorage.

---

## 🔍 DIAGNÓSTICO RÁPIDO

### Si el error PERSISTE después de Ctrl+Shift+R:

1. **Abrir DevTools** (F12)
2. **Ir a Application/Almacenamiento** → Local Storage
3. **Borrar MANUALMENTE** la clave `benevoles`
4. **Recargar** la página (F5)

### Si SIGUE fallando:

#### Método 1: Modo Incógnito
1. Abre una ventana de incógnito/privada (`Ctrl + Shift + N` en Chrome)
2. Ve a la aplicación
3. Si funciona en incógnito = problema de caché confirmado
4. Vuelve al navegador normal y limpia TODO:
   - Cookies
   - Caché
   - LocalStorage

#### Método 2: Reiniciar Servidor (si tienes acceso)
```bash
# Detener servidor (Ctrl + C)
# Limpiar build/cache
npm run clean   # o equivalente
rm -rf .next    # si es Next.js
rm -rf dist     # si es Vite

# Reinstalar y reiniciar
npm install
npm run dev
```

---

## ✅ VERIFICACIÓN DE ÉXITO

Después de limpiar correctamente, deberías ver:

### En la Lista de Bénévoles:
```
┌───────────────────────────────────────┐
│ Sophie Tremblay                       │
│ 🟠 En attente  ← Este badge naranja  │
│ Distribution                          │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ Marc Lefebvre                         │
│ 🟠 En attente  ← Este badge naranja  │
│ Collecte & Logistique                 │
└───────────────────────────────────────┘
```

### En la Consola (NO deberías ver):
- ❌ "Cannot destructure property 'label'"
- ❌ "TypeError"

### En la Consola (SÍ deberías ver si todo está bien):
- ✅ Sin errores rojos
- ✅ Posiblemente: "Module Bénévoles cargado correctamente"

---

## 🎯 RESUMEN EJECUTIVO

| Acción | Comando | Propósito |
|--------|---------|-----------|
| **1. Limpiar LocalStorage** | `localStorage.clear()` en consola | Borrar datos viejos |
| **2. Hard Refresh** | `Ctrl + Shift + R` | Forzar recarga sin caché |
| **3. Verificar versión** | Ver consola del navegador | Confirmar nueva versión |

---

## 🆘 SI NADA FUNCIONA

**Último recurso:**

1. Cierra TODAS las pestañas del navegador
2. Cierra el navegador completamente
3. Abre el navegador de nuevo
4. Ve directo a la aplicación
5. Presiona `Ctrl + Shift + R`

Si después de esto el error persiste, es posible que haya un problema con el servidor de desarrollo que no está sirviendo la versión actualizada del código.

---

**¿Listo?** Ejecuta `localStorage.clear()` en la consola y luego `Ctrl + Shift + R`. Deberías ver los dos bénévoles correctamente. 🎉
