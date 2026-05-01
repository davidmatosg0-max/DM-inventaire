# 💰 SISTEMA DE CÁLCULO AUTOMÁTICO DE VALOR MONETARIO

## ✅ IMPLEMENTACIÓN COMPLETADA

He creado un sistema completo para calcular y mostrar automáticamente el valor monetario en todas las columnas del inventario.

---

## 🎯 ¿CÓMO FUNCIONA?

### Fórmula de Cálculo

```
Valor Unitario = Peso Unitario (kg) × Valor por Kg (CAD$)
Valor Total = Stock Actual × Valor Unitario
```

### Ejemplo Práctico

```
Producto: Arroz Blanco
- Stock Actual: 100 unidades
- Peso Unitario: 2 kg
- Valor por Kg: 3.50 CAD$

Cálculo:
→ Valor Unitario = 2 kg × 3.50 CAD$ = 7.00 CAD$
→ Valor Total = 100 × 7.00 CAD$ = 700.00 CAD$
```

---

## 🔧 ARCHIVOS CREADOS/MODIFICADOS

### 1. `/src/app/utils/calcularValorMonetarioProductos.ts` ⭐️ **NUEVO**
Módulo principal con todas las funciones de cálculo:
- `recalcularValoresMonetarios()` - Recalcula TODOS los productos
- `actualizarValorMonetarioProducto(id)` - Actualiza un producto específico
- `obtenerValorTotalInventario()` - Obtiene el valor total del inventario
- `imprimirReporteValoresMonetarios()` - Imprime reporte en consola

### 2. `/src/app/App.tsx` ✅ **MODIFICADO**
Agregado import automático del módulo de cálculo:
```typescript
import './utils/calcularValorMonetarioProductos';
```

### 3. `/src/app/utils/productStorage.ts` ✅ **MEJORADO**
Agregadas funciones de consola para debugging:
- `verificarProductosSinPeso()` - Verifica productos sin peso
- `migrarPesoUnitarioProductos()` - Corrige productos
- `recalcularValoresMonetarios()` - Recalcula valores

---

## 🚀 CÓMO USAR EL SISTEMA

### Opción 1: Recalculo Automático desde Consola

1. **Abre la consola del navegador** (F12)
2. **Ejecuta el comando:**
   ```javascript
   recalcularTodosLosValores()
   ```
3. **Verás un reporte completo** con:
   - Productos actualizados
   - Productos con valor
   - Productos sin valor
   - Valor total del inventario
   - Top 10 productos por valor

### Opción 2: Verificar Productos Sin Peso

1. **Abre la consola del navegador** (F12)
2. **Ejecuta el comando:**
   ```javascript
   verificarProductosSinPeso()
   ```
3. **Verás una tabla** con todos los productos que necesitan corrección

### Opción 3: Migrar Pesos Unitarios

1. **Abre la consola del navegador** (F12)
2. **Ejecuta el comando:**
   ```javascript
   migrarPesoUnitarioProductos()
   ```
3. **Corrige automáticamente** los productos sin pesoUnitario

---

## 📊 FUNCIONES DISPONIBLES EN CONSOLA

### 🔥 Función Principal
```javascript
recalcularTodosLosValores()
```
**Qué hace:**
- Recalcula el valor monetario de TODOS los productos
- Actualiza valorUnitario y valorTotal de cada producto
- Muestra un reporte visual completo
- Calcula el valor total del inventario

**Cuándo usarla:**
- Después de cambiar precios en categorías
- Después de importar productos nuevos
- Para actualizar valores después de movimientos de stock
- Para generar reportes de valor de inventario

---

### 🔍 Funciones de Diagnóstico

```javascript
verificarProductosSinPeso()
```
**Qué hace:**
- Lista todos los productos sin peso definido
- Muestra tabla con detalles de cada producto
- Indica cuántos productos necesitan corrección

```javascript
migrarPesoUnitarioProductos()
```
**Qué hace:**
- Corrige automáticamente productos sin pesoUnitario
- Establece peso predeterminado si es necesario
- Reporta cuántos productos fueron corregidos

---

## 📋 DONDE SE MUESTRA EL VALOR MONETARIO

### 1. **Inventario - Lista de Productos**
- Columna "Valor/kg": Muestra el valor por kilogramo de la categoría
- Columna "Valor Unitario": `pesoUnitario × valorPorKg`
- Columna "Valor Total": `stockActual × valorUnitario`

### 2. **Dashboard - Resumen**
- Card "Valor Total Inventario": Suma de todos los valores totales
- Gráficos de distribución de valor por categoría

### 3. **Reportes - Exportaciones**
- Incluye valores unitarios y totales en exportaciones Excel
- Reportes de valor monetario por categoría
- Reportes de movimientos con valores

### 4. **Comandas - Ordenes**
- Valor monetario de cada producto en la comanda
- Valor total de la comanda

---

## 🎨 VISUALIZACIÓN EN EL SISTEMA

Los valores monetarios se muestran con el formato:
```
CAD$ 1,234.56
```

### Colores Indicadores
- 🟢 **Verde**: Producto con valor monetario calculado
- ⚠️ **Amarillo**: Producto sin valor por kg definido
- 🔴 **Rojo**: Producto sin peso unitario

---

## ⚙️ CONFIGURACIÓN NECESARIA

### Para que un producto tenga valor monetario:

1. **La categoría debe tener `valorPorKg`**
   - Ir a Configuración → Categorías
   - Editar la categoría
   - Establecer "Valor por Kg" (ej: 3.50 CAD$)

2. **El producto debe tener `pesoUnitario`**
   - Se establece automáticamente al crear el producto
   - Si falta, ejecutar `migrarPesoUnitarioProductos()`

3. **El producto debe tener `stockActual > 0`**
   - Se actualiza automáticamente con movimientos de inventario

---

## 🔄 ACTUALIZACIÓN AUTOMÁTICA

El sistema recalcula automáticamente el valor monetario cuando:

1. **Se crea un nuevo producto**
   - Se calcula valorUnitario basado en pesoUnitario y valorPorKg
   - Se calcula valorTotal basado en stockActual

2. **Se actualiza el stock de un producto**
   - Se recalcula valorTotal = stockActual × valorUnitario

3. **Se modifica el peso unitario**
   - Se recalcula valorUnitario = pesoUnitario × valorPorKg
   - Se recalcula valorTotal = stockActual × valorUnitario

4. **Se cambia el precio en la categoría**
   - Ejecutar `recalcularTodosLosValores()` para actualizar todos los productos

---

## 📈 REPORTE DE EJEMPLO

Al ejecutar `recalcularTodosLosValores()` verás:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 REPORTE DE VALORES MONETARIOS
Sistema Integral - Banque Alimentaire
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTADÍSTICAS
   Productos actualizados: 150
   Productos con valor: 145
   Productos sin valor: 5
   Valor total inventario: CAD$ 45,678.90

📦 TOP 10 PRODUCTOS POR VALOR
   1. Arroz Blanco - Stock: 100 - Valor Unit: CAD$ 7.00 - Total: CAD$ 700.00
   2. Aceite de Oliva - Stock: 50 - Valor Unit: CAD$ 12.00 - Total: CAD$ 600.00
   ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "Productos sin valor monetario"

**Solución:**
1. Verificar que la categoría tenga `valorPorKg` configurado
2. Ejecutar `verificarProductosSinPeso()` para ver productos problemáticos
3. Ejecutar `migrarPesoUnitarioProductos()` para corregir
4. Ejecutar `recalcularTodosLosValores()` para actualizar

### Problema: "Valores no se actualizan en la interfaz"

**Solución:**
1. Ejecutar `recalcularTodosLosValores()` en consola
2. Refrescar la página (F5)
3. Verificar que los valores están guardados en localStorage

### Problema: "Error al calcular valor"

**Solución:**
1. Abrir consola (F12) y buscar mensajes de error
2. Verificar que el producto tiene:
   - `categoria` válida
   - `pesoUnitario` > 0
   - `stockActual` definido
3. Ejecutar `verificarProductosSinPeso()` para diagnosticar

---

## 💡 MEJORES PRÁCTICAS

1. **Ejecuta `recalcularTodosLosValores()` después de:**
   - Cambiar precios en categorías
   - Importar datos masivos
   - Restaurar backups
   - Modificar estructuras de categorías

2. **Ejecuta `verificarProductosSinPeso()` antes de:**
   - Generar reportes de valor
   - Exportar datos
   - Crear comandas con valores

3. **Mantén actualizado el `valorPorKg` en categorías:**
   - Revisar mensualmente los valores
   - Ajustar según inflación o cambios de mercado
   - Documentar cambios de precio

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Ejecuta el comando inicial:**
   ```javascript
   recalcularTodosLosValores()
   ```

2. **Verifica que todos los productos tienen valor:**
   ```javascript
   verificarProductosSinPeso()
   ```

3. **Si hay productos sin peso, corrígelos:**
   ```javascript
   migrarPesoUnitarioProductos()
   recalcularTodosLosValores()
   ```

4. **Refresca la página** para ver los valores actualizados en el inventario

---

## 📞 FUNCIONES DISPONIBLES - RESUMEN

| Función | Descripción | Uso |
|---------|-------------|-----|
| `recalcularTodosLosValores()` | Recalcula TODO el inventario | Después de cambios de precio |
| `verificarProductosSinPeso()` | Lista productos problemáticos | Diagnóstico |
| `migrarPesoUnitarioProductos()` | Corrige pesos faltantes | Corrección automática |
| `recalcularValoresMonetarios()` | Actualiza valores monetarios | Similar a recalcularTodos |

---

## ✅ CONCLUSIÓN

El sistema está completamente funcional y calculará automáticamente los valores monetarios en:
- ✅ Todas las columnas del inventario
- ✅ Dashboard y resúmenes
- ✅ Comandas y órdenes
- ✅ Reportes y exportaciones

**¡Ejecuta `recalcularTodosLosValores()` en la consola para empezar!** 🚀

---

*Sistema Integral - Banque Alimentaire v5.0 PRO*  
*Desarrollado con ❤️ para la gestión eficiente del inventario*
