# 🔍 VERIFICACIÓN PASO A PASO

## ✅ SIGUE ESTOS PASOS EXACTAMENTE

---

### **PASO 1: Verificar que Existen Contactos** 📋

1. Abre tu navegador
2. Presiona `F12` (abrir consola)
3. Pega este código:

```javascript
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const donadores = contactos.filter(c => c.tipo === 'donador' && c.departamentoId === '1' && c.activo);
const fournisseurs = contactos.filter(c => c.tipo === 'fournisseur' && c.departamentoId === '1' && c.activo);

console.log('✅ ESTADÍSTICAS:');
console.log('Total contactos:', contactos.length);
console.log('Donadores (activos, dept 1):', donadores.length);
console.log('Fournisseurs (activos, dept 1):', fournisseurs.length);

console.log('\n📦 FOURNISSEURS:');
console.table(fournisseurs.map(f => ({
  nombre: `${f.nombre} ${f.apellido}`,
  telefono: f.telefono,
  email: f.email,
  departamentoId: f.departamentoId,
  activo: f.activo
})));

console.log('\n🎁 DONADORES:');
console.table(donadores.map(d => ({
  nombre: `${d.nombre} ${d.apellido}`,
  telefono: d.telefono,
  email: d.email,
  departamentoId: d.departamentoId,
  activo: d.activo
})));
```

**RESULTADO ESPERADO:**
```
✅ ESTADÍSTICAS:
Total contactos: 10
Donadores (activos, dept 1): 3
Fournisseurs (activos, dept 1): 2
```

**SI VES "0" EN AMBOS:** No tienes contactos → **VE AL PASO 2**

**SI VES NÚMEROS > 0:** Tienes contactos → **VE AL PASO 3**

---

### **PASO 2: Crear Contactos de Prueba** ➕

Si no tienes contactos, créalos:

1. Ve a: **Inventaire → Gestion des Contacts Entrepôt**
2. Click: **+ Nouveau Contact**

**Contacto 1 - Fournisseur:**
- Tipo: **Fournisseur**
- Nombre: **Metro**
- Apellido: **Inc**
- Email: **contact@metro.ca**
- Teléfono: **514-555-1234**
- Estado: **✅ Activo**
- Click: **Guardar**

**Contacto 2 - Donateur:**
- Tipo: **Donateur**
- Nombre: **Jean**
- Apellido: **Dupont**
- Email: **jean.dupont@gmail.com**
- Teléfono: **514-555-9999**
- Estado: **✅ Activo**
- Click: **Guardar**

**Después de crear → VE AL PASO 3**

---

### **PASO 3: Verificar en el Formulario** 🎯

1. Ve a: **Inventaire** (módulo principal)
2. Click en el botón verde: **+ Nouvelle Entrée**
3. En el formulario, click en la pestaña: **"Informations Fournisseur"** (segunda pestaña)
4. En el campo **"Fournisseur / Donateur"**, click en el desplegable

**RESULTADO ESPERADO:**

Deberías ver algo como:

```
╔════════════════════════════════════════╗
║ 📦 Fournisseurs (1)                    ║
║   • Metro Inc • 514-555-1234           ║
╠════════════════════════════════════════╣
║ 🎁 Donateurs (1)                       ║
║   • Jean Dupont • 514-555-9999         ║
╚════════════════════════════════════════╝
```

---

### **PASO 4: Debugging Avanzado** 🔧

Si **NO VES LOS CONTACTOS**, ejecuta este script en la consola:

```javascript
// 🔍 DEBUGGING COMPLETO
console.log('═══════════════════════════════════════');
console.log('🔍 DEBUGGING COMPLETO');
console.log('═══════════════════════════════════════\n');

// 1. Ver todos los contactos
const todosContactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
console.log('1️⃣ Total contactos en sistema:', todosContactos.length);

// 2. Ver contactos por tipo
const porTipo = {
  donador: todosContactos.filter(c => c.tipo === 'donador').length,
  fournisseur: todosContactos.filter(c => c.tipo === 'fournisseur').length,
  benevole: todosContactos.filter(c => c.tipo === 'benevole').length,
  employé: todosContactos.filter(c => c.tipo === 'employé').length,
  otro: todosContactos.filter(c => !['donador', 'fournisseur', 'benevole', 'employé'].includes(c.tipo)).length
};
console.log('2️⃣ Contactos por tipo:', porTipo);

// 3. Ver contactos por departamento
const donadores = todosContactos.filter(c => c.tipo === 'donador');
const fournisseurs = todosContactos.filter(c => c.tipo === 'fournisseur');

console.log('\n3️⃣ DONADORES por departamento:');
donadores.forEach(d => {
  console.log(`  • ${d.nombre} ${d.apellido}`);
  console.log(`    → Dept ID: ${d.departamentoId} | Activo: ${d.activo}`);
});

console.log('\n4️⃣ FOURNISSEURS por departamento:');
fournisseurs.forEach(f => {
  console.log(`  • ${f.nombre} ${f.apellido}`);
  console.log(`    → Dept ID: ${f.departamentoId} | Activo: ${f.activo}`);
});

// 5. Identificar problemas
console.log('\n5️⃣ PROBLEMAS IDENTIFICADOS:');
const problemasId = [...donadores, ...fournisseurs].filter(c => c.departamentoId !== '1');
const problemasInactivos = [...donadores, ...fournisseurs].filter(c => !c.activo);

if (problemasId.length > 0) {
  console.log('❌ Contactos con departamentoId incorrecto:', problemasId.length);
  console.table(problemasId.map(c => ({
    nombre: `${c.nombre} ${c.apellido}`,
    tipo: c.tipo,
    departamentoId: c.departamentoId,
    DEBERIA_SER: '1'
  })));
}

if (problemasInactivos.length > 0) {
  console.log('❌ Contactos inactivos:', problemasInactivos.length);
  console.table(problemasInactivos.map(c => ({
    nombre: `${c.nombre} ${c.apellido}`,
    tipo: c.tipo,
    activo: c.activo,
    DEBERIA_SER: true
  })));
}

// 6. Filtro final (lo que debería ver el formulario)
const contactosFormulario = todosContactos.filter(c => 
  (c.tipo === 'donador' || c.tipo === 'fournisseur') && 
  c.departamentoId === '1' && 
  c.activo
);

console.log('\n6️⃣ CONTACTOS QUE DEBERÍA VER EN FORMULARIO:', contactosFormulario.length);
console.table(contactosFormulario.map(c => ({
  tipo: c.tipo,
  nombre: `${c.nombre} ${c.apellido}`,
  telefono: c.telefono
})));

console.log('\n═══════════════════════════════════════');
console.log('✅ DEBUGGING COMPLETADO');
console.log('═══════════════════════════════════════');
```

---

### **PASO 5: Soluciones según el Problema** 🛠️

#### **Problema A: departamentoId incorrecto**
```javascript
// Corregir IDs
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const corregidos = contactos.map(c => {
  if ((c.tipo === 'donador' || c.tipo === 'fournisseur') && c.departamentoId !== '1') {
    return { ...c, departamentoId: '1' };
  }
  return c;
});
localStorage.setItem('contactos_departamentos', JSON.stringify(corregidos));
alert('✅ IDs corregidos. RECARGA LA PÁGINA (F5)');
```

#### **Problema B: Contactos inactivos**
```javascript
// Activar contactos
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const activados = contactos.map(c => {
  if ((c.tipo === 'donador' || c.tipo === 'fournisseur') && !c.activo) {
    return { ...c, activo: true };
  }
  return c;
});
localStorage.setItem('contactos_departamentos', JSON.stringify(activados));
alert('✅ Contactos activados. RECARGA LA PÁGINA (F5)');
```

#### **Problema C: No hay contactos**
```javascript
// Reiniciar datos de ejemplo
localStorage.removeItem('datos_ejemplo_inicializados');
localStorage.removeItem('contactos_departamentos');
alert('✅ Datos reiniciados. RECARGA LA PÁGINA (F5)');
// Después de recargar, tendrás los contactos de ejemplo
```

---

### **PASO 6: Verificación Final** ✅

Después de aplicar cualquier solución:

1. **Recarga la página** (`F5`)
2. Ve a: **Inventaire → + Nouvelle Entrée**
3. Tab: **"Informations Fournisseur"**
4. Click en: **"Fournisseur / Donateur"**

**SI VES LOS CONTACTOS:** ✅ **¡PROBLEMA RESUELTO!**

**SI NO VES CONTACTOS:** Ejecuta este comando final:

```javascript
// Diagnóstico completo
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const validos = contactos.filter(c => 
  (c.tipo === 'donador' || c.tipo === 'fournisseur') && 
  c.departamentoId === '1' && 
  c.activo
);

if (validos.length === 0) {
  alert('❌ NO HAY CONTACTOS VÁLIDOS.\n\nOpciones:\n1. Crear contactos manualmente en Gestión de Contactos\n2. Reiniciar datos de ejemplo (ver Problema C)');
} else {
  alert(`✅ HAY ${validos.length} CONTACTOS VÁLIDOS.\n\n¿El formulario está abierto?\n¿Estás en la pestaña correcta?`);
  console.log('Contactos válidos encontrados:', validos);
}
```

---

## 📞 RESUMEN DE COMANDOS ÚTILES

### **Ver contactos:**
```javascript
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
console.table(contactos.filter(c => c.tipo === 'donador' || c.tipo === 'fournisseur'));
```

### **Corregir IDs + Activar:**
```javascript
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const corregidos = contactos.map(c => {
  if (c.tipo === 'donador' || c.tipo === 'fournisseur') {
    return { ...c, departamentoId: '1', activo: true };
  }
  return c;
});
localStorage.setItem('contactos_departamentos', JSON.stringify(corregidos));
location.reload();
```

### **Reiniciar todo:**
```javascript
localStorage.removeItem('datos_ejemplo_inicializados');
localStorage.removeItem('contactos_departamentos');
location.reload();
```

---

**¡EMPIEZA CON EL PASO 1!** 🚀
