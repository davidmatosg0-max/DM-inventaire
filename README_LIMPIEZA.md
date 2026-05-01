# 🗑️ Limpieza de Contactos - Módulo Comptoir (OBSOLETO)

## ⚠️ NOTA IMPORTANTE - RESTRICCIÓN ELIMINADA

**Este documento está obsoleto desde el 2026-02-19.**

La restricción que limitaba los tipos de contacto "Fournisseur" y "Donateur" solo al módulo Entrepôt ha sido **eliminada**. 

### ✅ NUEVO COMPORTAMIENTO:

**TODOS los departamentos ahora pueden crear y gestionar contactos de cualquier tipo**, incluyendo:
- ✅ Donateur
- ✅ Fournisseur
- ✅ Bénévole
- ✅ Responsable de Santé
- ✅ Partenaire
- ✅ Visiteur
- ✅ Employé

### Arquitectura de Departamentos (Actualizada):
- **Entrepôt** (ID: 2) → ✅ Puede crear: Todos los tipos de contacto
- **Comptoir** (ID: 4) → ✅ Puede crear: Todos los tipos de contacto
- **Direction** (ID: 1) → ✅ Puede crear: Todos los tipos de contacto
- **Achats** (ID: 3) → ✅ Puede crear: Todos los tipos de contacto
- **Otros departamentos** → ✅ Pueden crear: Todos los tipos de contacto

---

## 📜 Contenido Original (Solo para referencia histórica)

### ⚠️ Problema (RESUELTO)
~~Los contactos de ejemplo de tipo **Fournisseur** y **Donateur** siguen visibles en el módulo Comptoir porque ya están guardados en el `localStorage` del navegador.~~

## 📌 REGLA DE NEGOCIO CRÍTICA (OBSOLETA - Ya no aplica)

~~**SOLO el módulo Entrepôt (departamentoId='2') puede crear y gestionar contactos de tipo Fournisseur y Donateur.**~~

~~Todos los demás departamentos (Direction, Achats, Comptoir, etc.) **NO** tienen acceso a estos tipos de contactos.~~

### Arquitectura de Departamentos:
- **Entrepôt** (ID: 2) → ✅ Puede crear: Donateurs, Fournisseurs, Bénévoles, etc.
- **Comptoir** (ID: 4) → ❌ Solo puede crear: Bénévoles, Responsable-Santé, Partenaire, Visiteur
- **Direction** (ID: 1) → ❌ Solo puede crear: Bénévoles, Responsable-Santé, Partenaire, Visiteur
- **Achats** (ID: 3) → ❌ Solo puede crear: Bénévoles, Responsable-Santé, Partenaire, Visiteur

## ✅ Soluciones Disponibles

### Opción 1: Limpieza Automática (Recomendada)
La aplicación ahora ejecuta automáticamente la limpieza al cargar:
1. **Recarga la página** con `Ctrl+R` o `F5`
2. La función `eliminarFournisseursYDonateurs()` se ejecutará automáticamente
3. Los contactos fournisseur y donateur serán eliminados

### Opción 2: Archivo HTML (Interfaz Visual)
1. Abre el archivo `/limpieza-contactos-comptoir.html` en tu navegador
2. Verás las estadísticas actuales de contactos
3. Haz clic en el botón "🗑️ Supprimer Fournisseurs et Donateurs"
4. Confirma la acción
5. Recarga tu aplicación

### Opción 3: Script de Consola (Manual)
1. Abre la aplicación en tu navegador
2. Presiona `F12` o `Ctrl+Shift+I` para abrir la consola del navegador
3. Copia y pega el contenido del archivo `/LIMPIAR_CONTACTOS_COMPTOIR.js`
4. Presiona `Enter`
5. La página se recargará automáticamente

### Opción 4: Consola del Navegador (Comando Rápido)
Abre la consola del navegador y ejecuta:

```javascript
// Eliminar contactos fournisseur y donateur del departamento 2
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const filtrados = contactos.filter(c => !(c.departamentoId === '2' && (c.tipo === 'fournisseur' || c.tipo === 'donador')));
localStorage.setItem('contactos_departamentos', JSON.stringify(filtrados));
console.log(`Eliminados: ${contactos.length - filtrados.length} contactos`);
location.reload();
```

## 🔧 Cambios Implementados

### 1. Archivo: `/src/app/utils/contactosDepartamentoStorage.ts`
- ✅ Eliminados todos los contactos de ejemplo fournisseur y donateur del case '2'
- ✅ Agregada función `eliminarFournisseursYDonateurs(departamentoId = '2')`
- ✅ Solo quedan 2 contactos bénévoles en los ejemplos

### 2. Archivo: `/src/app/App.tsx`
- ✅ Importada la función `eliminarFournisseursYDonateurs`
- ✅ Se ejecuta automáticamente al cargar la aplicación
- ✅ Se ejecuta después de `inicializarContactosEjemplo()`

### 3. Herramientas Creadas
- ✅ `/limpieza-contactos-comptoir.html` - Interfaz visual con estadísticas
- ✅ `/LIMPIAR_CONTACTOS_COMPTOIR.js` - Script ejecutable en consola
- ✅ `README_LIMPIEZA.md` - Este archivo con instrucciones

## 📊 Resultado Esperado

### Antes de la Limpieza:
- **Fournisseurs**: 6 contactos
- **Donateurs**: 10 contactos
- **Total a eliminar**: 16 contactos

### Después de la Limpieza:
- **Fournisseurs**: 0 contactos ❌
- **Donateurs**: 0 contactos ❌
- **Bénévoles**: 2 contactos ✅

## 🔍 Verificación

Para verificar que la limpieza funcionó:
1. Abre el módulo **Comptoir** (ID Digital)
2. Ve a **Gestion des Contacts**
3. Verifica que solo aparezcan contactos de tipo **Bénévole**
4. No deberían aparecer contactos **Fournisseur** ni **Donateur**

## 🆘 Si los contactos siguen apareciendo:

1. **Limpia la caché del navegador**:
   - Chrome/Edge: `Ctrl+Shift+Del` → Seleccionar "Datos almacenados en caché" → Eliminar
   - Firefox: `Ctrl+Shift+Del` → Seleccionar "Caché" → Eliminar

2. **Verifica en la consola**:
   ```javascript
   // Ver contactos del departamento 2
   const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
   const dept2 = contactos.filter(c => c.departamentoId === '2');
   console.table(dept2.map(c => ({ 
     nombre: c.nombre, 
     apellido: c.apellido, 
     tipo: c.tipo 
   })));
   ```

3. **Ejecuta la limpieza manualmente**:
   - Usa cualquiera de las 4 opciones mencionadas arriba

## ✨ Mantenimiento Futuro

Para evitar que se creen contactos de ejemplo en el futuro:
- Los contactos fournisseur y donateur fueron eliminados del código de inicialización
- La función `eliminarFournisseursYDonateurs()` se ejecuta automáticamente
- Los nuevos contactos deben crearse manualmente desde el módulo

---

**Autor**: Sistema Integral de Gestión - Banque Alimentaire v2.1  
**Fecha**: 2026-02-19  
**Versión**: 1.0.0