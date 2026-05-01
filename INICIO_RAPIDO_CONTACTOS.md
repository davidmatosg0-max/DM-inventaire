# 🚀 INICIO RÁPIDO - Ver Contactos de Ejemplo

## ⚡ Solución Rápida (30 segundos)

### Paso 1: Abrir Consola del Navegador
Presiona **F12** o clic derecho → "Inspeccionar" → pestaña "Console"

### Paso 2: Reiniciar Datos (COPIA Y PEGA TODO)
Copia y pega este comando completo:
```javascript
// Limpiar y recargar datos
localStorage.removeItem('datos_ejemplo_inicializados');
localStorage.removeItem('contactos_departamentos');
console.log('✅ Flags limpiados, recargando página...');
setTimeout(() => location.reload(), 500);
```

### Paso 3: Esperar la Recarga
La página se recargará automáticamente y verás en la consola:
```
✅ Usuarios Internos cargados: 10
   → Bénévoles: 3
   → Employés: 2
   → Donateurs: 3
   → Fournisseurs: 2
```

### Paso 4: Ver los Contactos
Opción A: **Desde Départements**
1. Ve al módulo **"Départements"** (pantalla principal)
2. Haz clic en **"Entrepôt"**
3. ¡Verás los contactos! 🎉

Opción B: **Desde el Menú**
1. Usa el menú lateral
2. Ve a **"Gestion des Contacts"** o **"Contactos Almacén"**
3. ¡Verás los contactos! 🎉

---

## 📋 Qué Verás

### En el módulo Entrepôt:

**Contadores superiores:**
- 🎁 Donateur: **3** contactos
- 🛒 Fournisseur: **2** contactos
- 👥 Bénévole: **3** contactos
- 👔 Employé: **2** contactos

**Total: 10 contactos predefinidos**

---

## 🔍 Ejemplos de Contactos

### Donateurs (Donadores)
1. **Supermarchés Metro** - Metro Plus Laval
2. **IGA Laval** - IGA Extra
3. **Boulangerie Le Fournil** - Artisan

### Fournisseurs (Proveedores)
1. **Distribution Alimentaire QC** - Distribución mayorista
2. **Aliments Secs Laval** - Proveedor alimentario

### Bénévoles (Voluntarios)
1. **Sophie Martin** - 8h/semana - Cocina
2. **Luc Morin** - 12h/semana - Transporte
3. **Isabelle Côté** - 10h/semana - Almacén

### Employés (Empleados)
1. **Jean Tremblay** - Coordinador de Almacén
2. **Claire Lefebvre** - Directora Administrativa

---

## ❓ ¿No se muestran los contactos?

### Diagnóstico Rápido
Ejecuta este comando en la consola:
```javascript
console.log('Contactos cargados:', JSON.parse(localStorage.getItem('contactos_departamentos') || '[]').length);
```

**Resultado esperado:** Debe mostrar `10`

Si muestra `0`, ejecuta:
```javascript
localStorage.clear(); location.reload();
```

---

## 🎯 Acceso Rápido desde otros módulos

Los contactos también están disponibles en:
- ✅ **Entrada Don/Achat** (seleccionar donador/proveedor)
- ✅ **Entrada PRS** (seleccionar participante)
- ✅ **Commandas** (al crear/editar)
- ✅ **Transporte** (asignar conductores)

---

## 📞 Contacto de Prueba Recomendado

**Para pruebas rápidas, usa:**

**Donador:**
- Nombre: **Supermarchés Metro**
- Email: dons@metro.ca
- Teléfono: (514) 555-0201

**Bénévole:**
- Nombre: **Sophie Martin**
- Email: sophie.martin@email.com
- Teléfono: (514) 555-0101

---

## 💡 Tip Pro

Para agregar más contactos de prueba:
1. Ve a **Entrepôt** en Départements
2. Clic en **"+ Nouveau Contact"**
3. Completa el formulario
4. ¡Listo! Se guardará automáticamente

---

**¿Todo listo? ¡Empieza a usar el sistema! 🚀**