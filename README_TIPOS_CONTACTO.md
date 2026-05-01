# 🎨 Sistema de Tipos de Contacto - Banque Alimentaire

## 🆕 CAMBIO IMPORTANTE

El sistema ha sido actualizado para **ELIMINAR todos los tipos de contacto predefinidos**.

### ✅ Nuevo Comportamiento:

1. **Ya NO hay tipos predefinidos** al iniciar la aplicación
2. El sistema comienza **VACÍO** de tipos de contacto
3. **Todos los tipos que crees se guardan PERMANENTEMENTE** en localStorage
4. Los tipos persisten incluso después de **reiniciar la aplicación**
5. Ya NO existe el botón "Rétablir les valeurs par défaut"

---

## 📋 ¿Qué cambió?

### Antes:
- ✗ El sistema venía con 6 tipos predefinidos (Bénévole, Donateur, Fournisseur, etc.)
- ✗ Diferencia entre tipos "predefinidos" y "personalizados"
- ✗ Botón para restablecer valores por defecto
- ✗ Botón para guardar configuración actual como predefinida

### Ahora:
- ✅ El sistema inicia **VACÍO** - sin tipos de contacto
- ✅ **Todos los tipos son iguales** - no hay diferencia entre predefinidos y personalizados
- ✅ **Todos los tipos se guardan permanentemente** automáticamente
- ✅ Interfaz simplificada - sin botones innecesarios

---

## 🚀 Cómo Crear Tipos de Contacto

### Paso 1: Ir a Gestion des Contacts
1. Abre cualquier módulo con contactos (Entrepôt, Comptoir, etc.)
2. Ve a **Gestion des Contacts**
3. Haz clic en **+ Ajouter un contact**

### Paso 2: Gestionar Tipos
1. En el formulario de contacto, busca la sección **"Type"**
2. Haz clic en el **icono de configuración (⚙️)** en la esquina superior derecha
3. Se abrirá el diálogo **"Gestion des Types de Contact"**

### Paso 3: Crear Nuevo Tipo
1. Haz clic en **"+ Ajouter un type"**
2. Completa el formulario:
   - **Code unique**: Código único sin espacios (ej: `directeur-general`)
   - **Étiquette**: Nombre descriptivo (ej: `Directeur Général`)
   - **Icône**: Selecciona un icono
   - **Couleur**: Elige color y fondo
3. Haz clic en **"Créer"**
4. ✅ El tipo se guarda **PERMANENTEMENTE** automáticamente

---

## 🗑️ Limpieza de Tipos Antiguos

Si tenías tipos predefinidos antiguos, necesitas limpiar el localStorage.

### Opción 1: Recarga la Aplicación (Automático)
1. Simplemente **recarga la página** con `F5`
2. El sistema eliminará automáticamente los tipos antiguos
3. Verás un mensaje en consola confirmando la limpieza

### Opción 2: Script Manual (Consola del Navegador)
1. Presiona `F12` para abrir la consola
2. Copia y pega el contenido de `/LIMPIAR_TIPOS_PREDEFINIDOS.js`
3. Presiona `Enter`
4. La página se recargará automáticamente

### Opción 3: Comando Rápido
```javascript
// Eliminar tipos predefinidos antiguos
localStorage.removeItem('banque_alimentaire_tipos_contacto_predefinidos');
console.log('✅ Tipos antiguos eliminados');
location.reload();
```

---

## 📊 Ejemplo: Crear Tipos Básicos

Aquí hay algunos ejemplos de tipos que podrías crear:

### Para Entrepôt:
```
1. Bénévole
   - Code: benevole
   - Icon: UserCheck
   - Color: Gris

2. Fournisseur
   - Code: fournisseur
   - Icon: Building2
   - Color: Azul

3. Donateur
   - Code: donateur
   - Icon: Heart
   - Color: Amarillo
```

### Para Comptoir:
```
1. Bénévole
   - Code: benevole
   - Icon: UserCheck
   - Color: Gris

2. Visiteur
   - Code: visiteur
   - Icon: UserPlus
   - Color: Verde

3. Responsable Santé
   - Code: responsable-sante
   - Icon: Stethoscope
   - Color: Rosa
```

---

## 🔧 Archivos Modificados

### 1. `/src/app/utils/tiposContactoStorage.ts`
- ✅ Eliminada constante `TIPOS_PREDEFINIDOS_INICIALES`
- ✅ Eliminada función `obtenerTiposPredefinidos()`
- ✅ Eliminada función `restablecerTiposPredefinidos()`
- ✅ Eliminada función `guardarConfiguracionActualComoPredeterminada()`
- ✅ Todos los tipos ahora se guardan con `isPredefined: true`

### 2. `/src/app/components/departamentos/FormularioContactoCompacto.tsx`
- ✅ Eliminado import de funciones obsoletas
- ✅ Eliminado botón "Enregistrer comme prédéfinis"
- ✅ Eliminado botón "Rétablir les valeurs par défaut"
- ✅ Eliminado badge "Prédéfini" en la lista de tipos

### 3. `/src/app/App.tsx`
- ✅ Agregada limpieza automática de tipos antiguos al cargar

---

## ⚠️ Importante: Primera Vez

Si es la primera vez que usas el sistema después de este cambio:

1. **NO verás ningún tipo de contacto** en el selector
2. Esto es **NORMAL** - debes crear tus propios tipos
3. Ve a la sección **"Gestion des Types de Contact"** (⚙️)
4. Crea los tipos que necesites para tu organización
5. Los tipos se guardarán **permanentemente**

---

## 💡 Ventajas del Nuevo Sistema

✅ **Personalización Total**: Crea solo los tipos que necesitas  
✅ **Persistencia Automática**: Todo se guarda sin botones extra  
✅ **Sin Confusión**: No hay diferencia entre predefinidos y personalizados  
✅ **Interfaz Limpia**: Menos botones, más simple  
✅ **Control Total**: Tú decides qué tipos existen en el sistema  

---

## 🆘 Solución de Problemas

### Problema: "No veo ningún tipo de contacto"
**Solución**: Esto es normal - crea tus propios tipos usando el botón ⚙️

### Problema: "Mis tipos no se guardan"
**Solución**: Verifica que el código sea único y no esté duplicado

### Problema: "Veo tipos antiguos todavía"
**Solución**: Ejecuta el script de limpieza o recarga la página

---

**Autor**: Sistema Integral de Gestión - Banque Alimentaire v2.1  
**Fecha**: 2026-02-19  
**Versión**: 2.0.0 - Sistema de Tipos Personalizado
