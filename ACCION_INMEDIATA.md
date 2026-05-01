# 🚨 ACCIÓN INMEDIATA REQUERIDA

## ❌ PROBLEMA
Los contactos donadores y fournisseurs **NO APARECEN** en el formulario de Nueva Entrada de Producto.

---

## ✅ SOLUCIÓN EN 3 PASOS (2 MINUTOS)

### **PASO 1: Abrir Herramienta de Corrección** 🔧

1. **Abre el archivo:** `/CORREGIR-AHORA.html`
2. **Método:** Haz doble click en el archivo
3. **Se abrirá** en tu navegador

---

### **PASO 2: Ejecutar Corrección** ⚡

1. **Click en el botón gigante:** `🔧 CORREGIR AHORA`
2. **Espera 2 segundos**
3. **La página se recargará automáticamente**

---

### **PASO 3: Verificar** ✓

1. **Ve a:** Inventaire → Nueva Entrada (botón verde "Nouvelle Entrée")
2. **Click en tab:** "Informations Fournisseur"
3. **Click en campo:** "Fournisseur / Donateur"
4. **DEBERÍAS VER:** Lista con tus contactos

---

## 🎯 ¿QUÉ HACE LA CORRECCIÓN?

```
1. Lee contactos de localStorage
2. Busca donadores/fournisseurs con departamentoId='2'
3. Cambia a departamentoId='1' (ID correcto de Entrepôt)
4. Activa contactos inactivos
5. Guarda cambios
6. Recarga la página automáticamente
```

---

## 📊 RESULTADO ESPERADO

Después de ejecutar la corrección, cuando abras el formulario verás:

```
📦 Fournisseurs (X)
  • Nombre del proveedor 1
  • Nombre del proveedor 2
  ...

🎁 Donateurs (X)
  • Nombre del donador 1
  • Nombre del donador 2
  ...
```

---

## 🆘 SI AÚN NO FUNCIONA

### **Opción A: Script Manual en Consola**

1. Presiona `F12` (abrir consola del navegador)
2. Pega este código:

```javascript
// SCRIPT DE CORRECCIÓN MANUAL
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
let corregidos = 0;

const contactosActualizados = contactos.map(contacto => {
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
      contacto.departamentoId !== '1') {
    corregidos++;
    return { ...contacto, departamentoId: '1', activo: true };
  }
  return contacto;
});

if (corregidos > 0) {
  localStorage.setItem('contactos_departamentos', JSON.stringify(contactosActualizados));
  console.log(`✅ ${corregidos} contactos corregidos`);
  alert(`✅ Corrección completada: ${corregidos} contactos.\n\nRECARGA LA PÁGINA (F5)`);
} else {
  console.log('No hay contactos para corregir');
  alert('No se encontraron contactos para corregir.\n\n¿Has creado contactos tipo Donateur o Fournisseur?');
}
```

3. Presiona `Enter`
4. Recarga la página (`F5`)

---

### **Opción B: Verificar que Existen Contactos**

```javascript
// VERIFICAR SI HAY CONTACTOS
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
console.log('Total contactos:', contactos.length);
console.log('Donadores:', contactos.filter(c => c.tipo === 'donador').length);
console.log('Fournisseurs:', contactos.filter(c => c.tipo === 'fournisseur').length);

// Ver contactos
contactos.filter(c => c.tipo === 'donador' || c.tipo === 'fournisseur').forEach(c => {
  console.log(`${c.tipo}: ${c.nombre} ${c.apellido} - Dept: ${c.departamentoId} - Activo: ${c.activo}`);
});
```

**Si dice "Total contactos: 0"** → No tienes contactos creados, ve a:
**Inventaire → Gestion des Contacts Entrepôt → + Nouveau Contact**

---

### **Opción C: Crear Contacto de Prueba**

1. Ve a: **Inventaire → Gestion des Contacts Entrepôt**
2. Click: **+ Nouveau Contact**
3. Llena:
   - **Tipo:** Donateur
   - **Nombre:** Test
   - **Apellido:** Donateur
   - **Email:** test@test.com
   - **Teléfono:** 5145551234
   - **Estado:** ✅ Activo
4. **Guardar**
5. Ve al formulario de Nueva Entrada y verifica

---

## 🚀 DESPUÉS DE CORREGIR

Una vez que funciona localmente, **haz commit y push:**

```bash
git add .
git commit -m "fix: corrección automática contactos Entrepôt al iniciar app"
git push origin main
```

Espera el deploy automático en GitHub Actions (1-2 minutos).

---

## 📞 DEBUGGING ADICIONAL

### **Ver Estado Actual de Contactos:**

```javascript
// Ejecutar en consola (F12)
const contactos = JSON.parse(localStorage.getItem('contactos_departamentos') || '[]');
const donadores = contactos.filter(c => c.tipo === 'donador');
const fournisseurs = contactos.filter(c => c.tipo === 'fournisseur');

console.table(donadores.map(d => ({
  nombre: `${d.nombre} ${d.apellido}`,
  tipo: d.tipo,
  departamentoId: d.departamentoId,
  activo: d.activo,
  OK: d.departamentoId === '1' && d.activo ? '✅' : '❌'
})));

console.table(fournisseurs.map(f => ({
  nombre: `${f.nombre} ${f.apellido}`,
  tipo: f.tipo,
  departamentoId: f.departamentoId,
  activo: f.activo,
  OK: f.departamentoId === '1' && f.activo ? '✅' : '❌'
})));
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Abrí `/CORREGIR-AHORA.html` en el navegador
- [ ] Click en el botón "CORREGIR AHORA"
- [ ] Esperé a que se recargue la página
- [ ] Fui a Inventaire → Nueva Entrada → Tab Fournisseur
- [ ] ¿Aparecen los contactos? 
  - ✅ **SÍ** → Problema resuelto, hacer commit y push
  - ❌ **NO** → Seguir a Opción A o B

---

## 💡 EXPLICACIÓN TÉCNICA

### **¿Por qué departamentoId='1'?**

Según `/src/app/utils/departamentosStorage.ts`:

```typescript
{
  id: '1',              // ← Entrepôt (CORRECTO)
  codigo: 'ENTREPOT',
  nombre: 'Entrepôt'
}
```

El formulario busca en `departamentoId='1'`, pero algunos contactos se guardaron con `'2'`.

---

## 🎯 RESUMEN

1. **Problema:** Contactos con ID='2' en lugar de '1'
2. **Solución:** Abrir `/CORREGIR-AHORA.html` y click en botón
3. **Resultado:** Contactos aparecen en formulario
4. **Deploy:** Hacer commit y push

---

**¡EMPIEZA AHORA!** ⬇️

**Paso 1:** Abre `/CORREGIR-AHORA.html` en tu navegador 🚀
