# 🔄 REFRESCAMIENTO AUTOMÁTICO DE CAMPOS AL CAMBIAR VARIANTES

## 🎯 Cambio Implementado

Se mejoró el comportamiento del formulario **Entrada Don/Achat** para que TODOS los campos se refresquen automáticamente cuando se cambia de variante O cuando se crea una nueva variante.

---

## ✅ Campos que se Refrescan Automáticamente

Cuando cambias de variante en el formulario O creas una nueva variante, ahora se resetean/actualizan los siguientes campos:

### 1. **Unidad** 🏷️
- Se actualiza con la unidad de la variante seleccionada
- Ejemplo: Si seleccionas "Tomate - CJA", la unidad cambia a "CJA"

### 2. **Peso** ⚖️
- Se actualiza con el peso unitario de la variante (si existe)
- Se resetea a 0 si es una variante nueva sin peso definido
- **EXCEPCIÓN:** Para paletas (PLT) siempre se resetea a 0 (requiere balanza)

### 3. **Cantidad** 📦
- Se resetea a 0 para nueva entrada
- Evita errores de mantener la cantidad anterior

### 4. **Fecha de Caducidad** 📅
- Se limpia completamente
- Permite ingresar fecha específica para cada entrada

### 5. **Lote** 🔖
- Se limpia completamente
- Cada entrada requiere su propio número de lote

### 6. **Detalles de Empaque** 📋
- Se limpia completamente
- Ejemplo: "24x500ml", "12x1kg", etc.

### 7. **Observaciones** 📝
- Se limpian completamente
- Permite notas específicas para cada entrada

### 8. **Temperatura** 🌡️
- Se resetea a vacío
- Opciones: Ambiente / Refrigerado / Congelado

### 9. **Icono** 🎨
- Se actualiza con el icono de la variante (si existe)
- Mantiene el icono anterior si la variante no tiene uno definido

---

## 🎬 Comportamiento Anterior vs Nuevo

### ❌ Comportamiento Anterior:
```
Usuario selecciona: "Tomate - CJA"
→ Llena campos: peso=5kg, cantidad=10, lote="ABC123"

Usuario cambia a: "Tomate - UND"
→ ❌ PROBLEMA: Los campos mantienen valores anteriores
→ peso=5kg (incorrecto), cantidad=10, lote="ABC123"
→ Confusión y posibles errores de registro
```

### ✅ Comportamiento Nuevo:
```
Usuario selecciona: "Tomate - CJA"
→ Llena campos: peso=5kg, cantidad=10, lote="ABC123"

Usuario cambia a: "Tomate - UND"
→ ✅ REFRESCAMIENTO AUTOMÁTICO
→ peso=0.5kg (peso unitario de UND), cantidad=0, lote=""
→ Campos limpios listos para nueva entrada
→ Sin confusión, sin errores
```

---

## 🔍 Ejemplo Práctico

### Escenario: Registro de Tomates

1. **Selecciona Producto:** Tomate
2. **Selecciona Variante:** CJA (Caja)
   - ✅ Unidad: CJA
   - ✅ Peso: 5 kg (peso de 1 caja)
   - ✅ Cantidad: 0
   - ✅ Fecha, lote, observaciones: vacíos

3. Usuario ingresa:
   - Cantidad: 10
   - Lote: "LOT-001"
   - Fecha: 2026-03-15

4. **Usuario cambia a:** UND (Unidad)
   - 🔄 **REFRESCAMIENTO AUTOMÁTICO:**
   - ✅ Unidad: UND
   - ✅ Peso: 0.5 kg (peso de 1 tomate)
   - ✅ Cantidad: 0 (resetada)
   - ✅ Lote: "" (limpiado)
   - ✅ Fecha: "" (limpiada)
   - ✅ Observaciones: "" (limpiadas)

5. Usuario puede ingresar valores nuevos sin confusión

---

## 💡 Ventajas del Cambio

### ✅ Previene Errores
- No mezclar datos de diferentes variantes
- No registrar pesos incorrectos
- No duplicar lotes o fechas

### ✅ Mejora la Experiencia
- Campos limpios para cada variante
- Interfaz más intuitiva
- Menos clicks de corrección

### ✅ Ahorra Tiempo
- No necesitas limpiar manualmente cada campo
- Menos errores = menos correcciones
- Flujo de trabajo más rápido

### ✅ Consistencia de Datos
- Cada entrada tiene datos coherentes
- Pesos correctos para cada unidad
- Trazabilidad precisa

---

## 🧪 Cómo Probar

### Paso 1: Abrir Formulario
1. Ve a **Inventario** → **Nueva Entrada**
2. Selecciona tipo: **Don** o **Achat**
3. Selecciona un donador/proveedor

### Paso 2: Seleccionar Producto con Variantes
1. Busca un producto que tenga múltiples variantes
2. Ejemplo: "Tomate" (tiene CJA, UND, SAC, etc.)

### Paso 3: Probar Cambio de Variantes
1. Selecciona variante: **CJA**
   - Observa que se llena el peso automáticamente
   - Ingresa cantidad: 10
   - Ingresa lote: "ABC"
   - Ingresa fecha: cualquier fecha

2. **Cambia variante a: UND**
   - 🔄 Observa el refrescamiento automático
   - ✅ Peso cambia automáticamente
   - ✅ Cantidad vuelve a 0
   - ✅ Lote se limpia
   - ✅ Fecha se limpia
   - ✅ Todos los campos limpios

3. **Cambia variante a: PLT (Paleta)**
   - ✅ Peso se resetea a 0 (requiere balanza)
   - ✅ Todos los demás campos limpios

### Paso 4: Verificar Consola
Abre la consola (F12) y verás mensajes como:
```
🔄 Variante cambiada: Tomate - UND - Refrescando campos...
⚖️ Peso de variante auto-actualizado: 0.5 kg para Tomate - UND
✅ Campos refrescados: unidad, peso, cantidad, fechaCaducidad, lote, detallesEmpaque, observaciones, temperatura, icono
```

### Paso 5: Probar Creación de Nueva Variante
1. Selecciona un producto y subcategoría
2. Haz clic en el botón **"+ Créer Variante"**
3. Completa el formulario:
   - Nombre: "Tomate - Granel"
   - Unidad: "kg"
   - Peso Unitario: 1
   - Icono: 🍅
4. **Guarda la nueva variante**
   - 🔄 Observa el refrescamiento automático
   - ✅ La nueva variante se selecciona automáticamente
   - ✅ Unidad se actualiza a "kg"
   - ✅ Peso se actualiza a 1 kg
   - ✅ Cantidad vuelve a 0
   - ✅ Todos los campos se limpian
5. Verás en la consola:
```
🆕 Nueva variante creada y campos refrescados: Tomate - Granel
   → Unidad: kg
   → Peso: 1 kg
```

---

## 🔧 Detalles Técnicos

### Archivo Modificado:
`/src/app/components/EntradaDonAchat.tsx`

### Hook useEffect:
```typescript
useEffect(() => {
  if (formData.varianteId && formData.categoria && formData.subcategoria) {
    // Buscar variante seleccionada
    const varianteObj = ...;
    
    if (varianteObj) {
      // Refrescar TODOS los campos
      setFormData(prev => ({
        ...prev,
        unidad: varianteObj.unidad || prev.unidad,
        peso: calcularPeso(varianteObj),
        cantidad: 0,
        fechaCaducidad: '',
        lote: '',
        detallesEmpaque: '',
        observaciones: '',
        temperatura: '',
        productoIcono: varianteObj.icono || prev.productoIcono
      }));
    }
  }
}, [formData.varianteId, ...]);
```

### Dependencias del useEffect:
- `formData.varianteId` - Trigger principal
- `formData.categoria`
- `formData.subcategoria`
- `categoriasDB`

---

## 📊 Campos que NO se Refrescan

Estos campos se mantienen porque son independientes de la variante:

- ✅ **Tipo de Entrada** (Don/Achat/PRS)
- ✅ **Donador/Proveedor**
- ✅ **Producto** (categoría base)
- ✅ **Subcategoría**

---

## 🎉 Resultado Final

Con este cambio, el formulario ahora:
- ✅ Es más intuitivo
- ✅ Previene errores
- ✅ Ahorra tiempo
- ✅ Mejora la calidad de datos
- ✅ Proporciona mejor experiencia de usuario

**¡Cada cambio de variante te da un formulario limpio y listo para nueva entrada! 🚀**