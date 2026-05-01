# 🚨 SOLUCIÓN INMEDIATA: Donadores No Aparecen en Formulario

## 📋 **Problema Actual**

Los contactos tipo **Donateur** (donador) y **Fournisseur** (proveedor) creados en el módulo de Inventario **NO aparecen** en el selector del formulario de Nueva Entrada de Producto.

---

## 🔍 **PASO 1: Diagnosticar el Problema**

### **Opción A: Usar Herramienta de Diagnóstico (RECOMENDADO)**

1. **Abre el archivo** `/diagnostico-contactos.html` en tu navegador
   - Ruta: Raíz del proyecto → `diagnostico-contactos.html`
   - Doble click para abrir en el navegador

2. **La herramienta te mostrará:**
   - ✅ Cuántos contactos tienes en total
   - ✅ Cuántos donadores y fournisseurs existen
   - ✅ Qué `departamentoId` tienen (debe ser `'1'`)
   - ✅ Si están activos o inactivos
   - ❌ Problemas detectados

3. **Identifica el problema:**
   - Si dice "Donadores (Dept 2) ❌: X contactos" → **Problema de ID**
   - Si dice "Donadores Activos: 0" → **Problema de estado**
   - Si dice "Total Contactos: 0" → **No hay contactos creados**

---

### **Opción B: Verificar Manualmente en la Consola del Navegador**

1. **Abre la consola** del navegador (F12)

2. **Ejecuta este código:**

```javascript
// Obtener contactos de localStorage
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');

// Filtrar donadores y fournisseurs
const donadores = contactos.filter(c => c.tipo === 'donador');
const fournisseurs = contactos.filter(c => c.tipo === 'fournisseur');

// Verificar departamentoId
const donadoresDept1 = donadores.filter(c => c.departamentoId === '1');
const donadoresDept2 = donadores.filter(c => c.departamentoId === '2');

console.log('📊 DIAGNÓSTICO:');
console.log('Total contactos:', contactos.length);
console.log('Donadores total:', donadores.length);
console.log('  → Con departamentoId=1 (correcto):', donadoresDept1.length);
console.log('  → Con departamentoId=2 (incorrecto):', donadoresDept2.length);
console.log('Fournisseurs total:', fournisseurs.length);
console.log('\n📋 Donadores encontrados:');
donadores.forEach(d => {
  console.log(`  • ${d.nombre} ${d.apellido} - Dept: ${d.departamentoId} - Activo: ${d.activo}`);
});
```

3. **Interpreta los resultados:**
   - Si `donadoresDept2.length > 0` → **Tienes contactos con ID incorrecto**
   - Si `donadores.length === 0` → **No hay donadores creados**
   - Si todos tienen `activo: false` → **Los contactos están inactivos**

---

## 🔧 **PASO 2: Aplicar la Solución**

### **PROBLEMA 1: Contactos con departamentoId incorrecto ('2' en lugar de '1')**

#### **Solución Automática (RECOMENDADO):**

1. **Abre** `/diagnostico-contactos.html` en tu navegador
2. Click en botón: **"🔧 Corregir Automáticamente TODOS los IDs"**
3. Confirma la acción
4. **RECARGA LA PÁGINA** de tu aplicación

#### **Solución Manual (Consola del Navegador):**

```javascript
// Script de corrección rápida
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
let corregidos = 0;

const contactosCorregidos = contactos.map(contacto => {
  // Corregir donadores y fournisseurs con departamentoId '2'
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
      contacto.departamentoId === '2') {
    corregidos++;
    return { ...contacto, departamentoId: '1' }; // ✅ Cambiar a '1'
  }
  return contacto;
});

// Guardar cambios
localStorage.setItem('contactos_departamentos', JSON.stringify(contactosCorregidos));

console.log(`✅ Corregidos ${corregidos} contactos`);
console.log('🔄 RECARGA LA PÁGINA para ver los cambios');
```

**Después de ejecutar:** Presiona `Ctrl + R` o `F5` para recargar la página.

---

### **PROBLEMA 2: No hay contactos creados**

#### **Solución:**

1. Ve a: **Inventaire → Gestion des Contacts Entrepôt**
2. Click en: **"+ Nouveau Contact"**
3. Llena el formulario:
   - **Tipo de Contacto:** Selecciona "Donateur" o "Fournisseur"
   - **Nombre:** (requerido)
   - **Apellido:** (requerido)
   - **Email:** (requerido)
   - **Teléfono:** (requerido)
   - **Estado:** Asegúrate de que esté **ACTIVO** ✅
4. **Guardar**
5. Ve al formulario de **Nueva Entrada** y verifica que aparezca

---

### **PROBLEMA 3: Contactos inactivos**

#### **Solución:**

1. Ve a: **Inventaire → Gestion des Contacts Entrepôt**
2. Busca el contacto que quieres activar
3. Click en **"✏️ Modifier"**
4. Marca la casilla **"Contact actif"** ✅
5. **Guardar**

---

## ✅ **PASO 3: Verificar que Funciona**

### **Prueba Final:**

1. Ve a: **Inventaire → Nueva Entrada** (botón verde "Nouvelle Entrée")
2. En el formulario, ve a la pestaña: **"Informations Fournisseur"**
3. Click en el campo: **"Fournisseur / Donateur"**
4. **DEBERÍAS VER:**
   - 📦 **Fournisseurs (X)** → Lista de proveedores
   - 🎁 **Donateurs (X)** → Lista de donadores

### **Si AÚN NO aparecen:**

```javascript
// Ejecuta este debug en la consola
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const contactosEntrepot = contactos.filter(c => c.departamentoId === '1');
const donadoresYFournisseurs = contactosEntrepot.filter(c => 
  c.tipo === 'fournisseur' || c.tipo === 'donador'
);

console.log('🔍 Contactos en Entrepôt (dept=1):', contactosEntrepot.length);
console.log('🔍 Donadores/Fournisseurs activos:', 
  donadoresYFournisseurs.filter(c => c.activo).length
);
console.log('📋 Lista completa:');
donadoresYFournisseurs.forEach(c => {
  console.log(`  ${c.activo ? '✅' : '❌'} ${c.tipo}: ${c.nombre} ${c.apellido} (Dept: ${c.departamentoId})`);
});
```

---

## 🚀 **PASO 4: Desplegar Correcciones a GitHub Pages**

Una vez verificado que todo funciona **localmente**:

### **1. Verificar cambios:**
```bash
git status
```

### **2. Agregar archivos:**
```bash
git add .
```

### **3. Commit:**
```bash
git commit -m "fix: corregir departamentoId de contactos Entrepôt (1 en lugar de 2)"
```

### **4. Push:**
```bash
git push origin main
```

### **5. Esperar despliegue:**
- Ve a tu repositorio en GitHub
- Click en **Actions**
- Espera a que el workflow termine (ícono verde ✅)

### **6. Limpiar caché del navegador en producción:**
- Abre tu sitio desplegado
- Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)

---

## 📊 **Resumen de Valores Correctos**

| Campo | Valor Correcto | Valor Incorrecto |
|-------|----------------|------------------|
| `departamentoId` | `'1'` ✅ | `'2'` ❌ |
| `tipo` | `'donador'` o `'fournisseur'` | Otros tipos |
| `activo` | `true` ✅ | `false` ❌ |
| `nombre` | Debe existir | No puede estar vacío |
| `apellido` | Debe existir | No puede estar vacío |
| `email` | Debe existir | No puede estar vacío |

---

## 🆘 **Solución de Emergencia**

Si nada funciona, ejecuta este script completo:

```javascript
// 🚨 SCRIPT DE EMERGENCIA - Corrige TODOS los problemas comunes

const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
let cambios = 0;

const contactosCorregidos = contactos.map(contacto => {
  let modificado = false;
  const contactoNuevo = { ...contacto };
  
  // Corregir departamentoId
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
      contacto.departamentoId !== '1') {
    contactoNuevo.departamentoId = '1';
    modificado = true;
    console.log(`✅ Corregido dept ID: ${contacto.nombre} ${contacto.apellido}`);
  }
  
  // Activar si está inactivo
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
      !contacto.activo) {
    contactoNuevo.activo = true;
    modificado = true;
    console.log(`✅ Activado: ${contacto.nombre} ${contacto.apellido}`);
  }
  
  if (modificado) cambios++;
  return contactoNuevo;
});

if (cambios > 0) {
  localStorage.setItem('contactos_departamentos', JSON.stringify(contactosCorregidos));
  console.log(`✅ ${cambios} contactos corregidos`);
  console.log('🔄 RECARGA LA PÁGINA AHORA');
  alert(`✅ ${cambios} contactos corregidos.\n\nRECARGA LA PÁGINA (F5) para ver los cambios.`);
} else {
  console.log('✅ No se encontraron problemas');
}
```

---

## 📞 **Contacto de Soporte**

Si después de seguir todos estos pasos el problema persiste:

1. **Ejecuta el diagnóstico completo** en `/diagnostico-contactos.html`
2. **Toma un screenshot** de los resultados
3. **Exporta los datos** usando el botón "Exportar Backup"
4. **Comparte** el screenshot y el archivo JSON para análisis

---

## ✅ **Checklist de Verificación**

- [ ] Ejecuté el diagnóstico (`/diagnostico-contactos.html`)
- [ ] Identifiqué el problema específico
- [ ] Apliqué la solución correcta
- [ ] Verifiqué en el formulario de Nueva Entrada
- [ ] Los contactos ahora aparecen correctamente
- [ ] Hice commit y push de los cambios
- [ ] Verifiqué en producción (GitHub Pages)

---

**Fecha de Creación:** Marzo 2026  
**Sistema:** Banque Alimentaire - Sistema Integral de Gestión  
**Archivo de Diagnóstico:** `/diagnostico-contactos.html`  
**Archivo de Migración:** `/migrar-contactos-entrepot.html`
