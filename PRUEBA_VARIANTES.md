# 🧪 GUÍA DE PRUEBA - Creación de Variantes y Refrescamiento de Campos

## 🎯 Objetivo
Verificar que al crear una nueva variante, TODOS los campos del formulario se refrescan automáticamente, especialmente el campo **Unidad**.

---

## 📋 Prueba 1: Variante con Paleta (PLT)

### Pasos:
1. Ve a **Inventario** → **Nueva Entrada**
2. Selecciona:
   - Tipo: **Don**
   - Donador: Cualquiera
   - Producto: **Tomate** (o cualquier producto con subcategoría)
3. Haz clic en **"+ Créer Variante"** (botón morado)
4. Completa el formulario:
   ```
   Nombre: Tomate - Paleta Grande
   Código: TOM-PLT-GDE
   Icono: 🍅
   Unidad: Paleta (PLT)  ← SELECCIONA ESTO
   Peso Unitario: 500
   ```
5. Haz clic en **"Créer Variante"**

###✅ Resultado Esperado:
- Diálogo se cierra
- **Campo "Unidad" debe mostrar: PLT** ✅
- Campo "Peso" debe mostrar: 0 (las paletas requieren balanza)
- Campo "Cantidad" debe estar en: 0
- Todos los demás campos deben estar vacíos

### 🔍 Verificar en Consola (F12):
```
🆕 Nueva variante creada: Tomate - Paleta Grande
   → ID: var-1234567890
   → Unidad guardada: PLT
   → Peso guardado: 500 kg
🔄 Seleccionando variante: var-1234567890
🔄 Variante cambiada: Tomate - Paleta Grande - Refrescando campos...
⚠️ Variante PALETA - Peso manual/balanza requerido
✅ Campos refrescados: unidad, peso, cantidad, fechaCaducidad, lote, detallesEmpaque, observaciones, temperatura, icono
```

---

## 📋 Prueba 2: Variante con Caja (CJA)

### Pasos:
1. Mismo flujo anterior
2. Crear variante:
   ```
   Nombre: Tomate - Caja x12
   Unidad: Caja (CJA)  ← SELECCIONA ESTO
   Peso Unitario: 6
   Icono: 📦
   ```
3. Guardar

### ✅ Resultado Esperado:
- **Campo "Unidad" debe mostrar: CJA** ✅
- **Campo "Peso" debe mostrar: 6** ✅
- Campo "Cantidad" debe estar en: 0
- Todos los demás campos deben estar vacíos

### 🔍 Verificar en Consola:
```
🆕 Nueva variante creada: Tomate - Caja x12
   → ID: var-1234567891
   → Unidad guardada: CJA
   → Peso guardado: 6 kg
🔄 Seleccionando variante: var-1234567891
🔄 Variante cambiada: Tomate - Caja x12 - Refrescando campos...
⚖️ Peso de variante auto-actualizado: 6 kg para Tomate - Caja x12
✅ Campos refrescados: unidad, peso, cantidad, fechaCaducidad, lote, detallesEmpaque, observaciones, temperatura, icono
```

---

## 📋 Prueba 3: Variante con Kilogramo (kg)

### Pasos:
1. Crear variante:
   ```
   Nombre: Tomate - Granel
   Unidad: Kilogramo (kg)  ← SELECCIONA ESTO
   Peso Unitario: 1
   Icono: ⚖️
   ```
2. Guardar

### ✅ Resultado Esperado:
- **Campo "Unidad" debe mostrar: kg** ✅
- **Campo "Peso" debe mostrar: 1** ✅
- Campo "Cantidad" debe estar en: 0

---

## 📋 Prueba 4: Variante SIN Peso Unitario

### Pasos:
1. Crear variante:
   ```
   Nombre: Tomate - Especial
   Unidad: Unidad (UND)  ← SELECCIONA ESTO
   Peso Unitario: (DEJAR VACÍO)
   Icono: 🍅
   ```
2. Guardar

### ✅ Resultado Esperado:
- **Campo "Unidad" debe mostrar: UND** ✅
- **Campo "Peso" debe mostrar: 0** ✅ (para entrada manual)
- Campo "Cantidad" debe estar en: 0

### 🔍 Verificar en Consola:
```
🆕 Nueva variante creada: Tomate - Especial
   → Unidad guardada: UND
   → Peso guardado: 0 kg
🆕 Variante nueva detectada: Tomate - Especial - Peso resetado a 0 para entrada manual
```

---

## 📋 Prueba 5: Cambiar Entre Variantes Existentes

### Pasos:
1. Después de crear varias variantes, cambia entre ellas usando el Select de Variante
2. Cambia de "Tomate - PLT" a "Tomate - CJA"

### ✅ Resultado Esperado:
- Al cambiar a "Tomate - CJA":
  - **Unidad cambia a: CJA** ✅
  - **Peso cambia a: 6** ✅
  - Cantidad resetea a: 0
  - Todos los campos se limpian

- Al cambiar a "Tomate - PLT":
  - **Unidad cambia a: PLT** ✅
  - **Peso cambia a: 0** ✅
  - Cantidad resetea a: 0

---

## ❌ Errores Posibles y Soluciones

### Error 1: Campo Unidad queda vacío
**Causa**: El select de nueva variante está guardando el nombre en lugar de la abreviatura
**Solución**: Ya está corregido - el select ahora usa `value={unidad.abreviatura}`

### Error 2: Peso no se actualiza
**Causa**: El useEffect no se está ejecutando
**Solución**: Ya está corregido - usamos un delay de 100ms para asegurar que React procese la actualización

### Error 3: Campos no se limpian
**Causa**: Falta el reset de campos en el useEffect
**Solución**: Ya está corregido - el useEffect resetea TODOS los campos

---

## 🔧 Debugging

### Si algo no funciona:

1. **Abre la Consola (F12)**
   - Busca los logs que empiezan con 🆕, 🔄, ✅
   - Verifica que diga "Unidad guardada: PLT" (o la unidad que seleccionaste)

2. **Verifica el valor guardado**
   - En la consola, escribe:
   ```javascript
   const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
   console.log(categorias);
   ```
   - Busca tu variante recién creada
   - Verifica que el campo `unidad` tenga la abreviatura correcta (PLT, CJA, kg)

3. **Verifica el Select de Unidad**
   - Inspecciona el elemento con las DevTools
   - El valor debe ser la abreviatura, no el nombre completo

---

## ✅ Lista de Verificación Final

Marca cada item después de probarlo:

- [ ] ✅ Crear variante con PLT → Campo unidad muestra "PLT"
- [ ] ✅ Crear variante con CJA → Campo unidad muestra "CJA"
- [ ] ✅ Crear variante con kg → Campo unidad muestra "kg"
- [ ] ✅ Crear variante con UND → Campo unidad muestra "UND"
- [ ] ✅ Crear variante con SAC → Campo unidad muestra "SAC"
- [ ] ✅ Crear variante con BN → Campo unidad muestra "BN"
- [ ] ✅ Cambiar entre variantes → Unidad se actualiza correctamente
- [ ] ✅ Peso se actualiza según la variante
- [ ] ✅ Cantidad se resetea a 0
- [ ] ✅ Campos opcionales se limpian

---

## 🎉 Si Todo Funciona

Deberías ver:
- ✅ Campo **Unidad** SIEMPRE se rellena con la abreviatura correcta
- ✅ Campo **Peso** se actualiza según la variante (0 para PLT)
- ✅ Campo **Cantidad** se resetea a 0
- ✅ Todos los campos opcionales se limpian
- ✅ El icono se actualiza
- ✅ La experiencia es fluida y sin errores

---

**Si encuentras algún problema, envíame los logs de la consola con los emojis 🆕 🔄 ✅ para que pueda investigar.**
