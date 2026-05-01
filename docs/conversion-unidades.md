# Sistema de Conversión de Unidades - Banco de Alimentos

## Descripción General

El sistema de conversión de unidades permite transformar productos de una unidad a otra (por ejemplo, de Paleta a Caja), manteniendo la integridad del inventario y el seguimiento del peso.

## Flujo de Conversión

### 1. Iniciar Conversión
El usuario selecciona un producto y hace clic en el botón de conversión de unidades (icono ⇄).

### 2. Configurar Conversión
- **Unidad Origen**: Se establece automáticamente desde el producto seleccionado
- **Unidad Destino**: El usuario selecciona de las opciones disponibles
- **Cantidad a Convertir**: Cantidad del producto origen a convertir
- **Factor de Conversión**: Número de unidades destino por cada unidad origen

### 3. Cálculos Automáticos

#### Cálculo de Cantidad Destino
```
Cantidad Destino = Cantidad Origen × Factor de Conversión
```

**Ejemplo**: 
- 1 Paleta × 20 = 20 Cajas

#### Cálculo de Peso
```
Peso Total Origen = pesoRegistrado o peso del producto
Peso por Unidad Origen = Peso Total Origen / Stock Actual
Peso Total Convertido = Peso por Unidad Origen × Cantidad Origen
Peso Unitario Destino = Peso Total Convertido / Cantidad Destino
```

**Ejemplo**:
- Producto: Paleta de Arroz con 500 kg total y 5 paletas en stock
- Peso por Paleta = 500 kg / 5 = 100 kg
- Si convierto 1 Paleta (100 kg) a 20 Cajas
- Peso por Caja = 100 kg / 20 = 5 kg

### 4. Actualización del Inventario

#### Producto Origen
- Se reduce el `stockActual` por la cantidad convertida
```
Nuevo Stock Origen = Stock Actual - Cantidad Origen
```

#### Producto Destino

##### Si el producto destino YA EXISTE:
- Se suma la cantidad convertida al stock existente
- Se actualiza el peso total y peso unitario
```
Nuevo Stock Destino = Stock Actual + Cantidad Destino
Nuevo Peso Total = Peso Registrado + Peso Total Convertido
```

##### Si el producto destino NO EXISTE:
- Se crea un nuevo producto con:
  - Nombre: `{Nombre Original} ({Unidad Destino})`
  - Código: `{Código Original}-{Unidad Destino}`
  - Unidad: Unidad destino seleccionada
  - Stock: Cantidad destino calculada
  - Peso: Peso total convertido
  - Peso Unitario: Peso unitario calculado
  - Campos heredados: categoría, subcategoría, ubicación, lote, fecha de vencimiento, etc.
  - Campos especiales:
    - `productoOrigenId`: ID del producto origen
    - `esConversion`: true (marca que es un producto resultado de conversión)

## Unidades Disponibles

### Paleta (Pallet)
- Puede convertirse a: Caja, Unidad, Saco
- Factor predeterminado:
  - Paleta → Caja: 20
  - Paleta → Unidad: 480 (20 cajas × 24 unidades)
  - Paleta → Saco: 40

### Caja (Box)
- Puede convertirse a: Unidad, Saco
- Factor predeterminado:
  - Caja → Unidad: 24
  - Caja → Saco: 2

### Unidad
- Unidad base (puede convertirse a cualquier otra)

### Saco
- Unidad especial (puede convertirse a cualquier otra)

## Ejemplos de Uso

### Ejemplo 1: Paleta a Cajas
**Datos Iniciales**:
- Producto: Arroz Integral (Paleta)
- Stock: 5 Paletas
- Peso Total: 500 kg (100 kg por paleta)

**Conversión**:
- Cantidad a convertir: 1 Paleta
- Factor: 20 Cajas por Paleta
- Resultado: 20 Cajas

**Resultado en Inventario**:
1. **Arroz Integral (Paleta)**:
   - Stock: 5 → 4 Paletas
   
2. **Arroz Integral (Caja)** [NUEVO]:
   - Stock: 20 Cajas
   - Peso Total: 100 kg
   - Peso Unitario: 5 kg/Caja

### Ejemplo 2: Caja a Unidades
**Datos Iniciales**:
- Producto: Leche en Polvo (Caja)
- Stock: 10 Cajas
- Peso Total: 120 kg (12 kg por caja)

**Conversión**:
- Cantidad a convertir: 5 Cajas
- Factor: 24 Unidades por Caja
- Resultado: 120 Unidades

**Resultado en Inventario**:
1. **Leche en Polvo (Caja)**:
   - Stock: 10 → 5 Cajas
   
2. **Leche en Polvo (Unidad)** [NUEVO]:
   - Stock: 120 Unidades
   - Peso Total: 60 kg (5 cajas × 12 kg)
   - Peso Unitario: 0.5 kg/Unidad

### Ejemplo 3: Conversión Múltiple con Producto Existente
**Datos Iniciales**:
- Producto: Frijoles (Paleta) - 3 Paletas, 300 kg
- Ya existe: Frijoles (Caja) - 10 Cajas, 50 kg

**Primera Conversión**:
- 1 Paleta → 20 Cajas
- Resultado: Frijoles (Caja) = 30 Cajas, 150 kg

**Segunda Conversión**:
- 1 Paleta adicional → 20 Cajas
- Resultado: Frijoles (Caja) = 50 Cajas, 250 kg

## Validaciones

### Antes de la Conversión
1. ✅ Cantidad a convertir debe ser > 0
2. ✅ Factor de conversión debe ser > 0
3. ✅ Debe seleccionarse una unidad destino
4. ✅ Cantidad a convertir ≤ Stock actual disponible

### Durante la Conversión
1. ✅ Se verifica que el producto origen exista en localStorage
2. ✅ Se calculan todos los pesos correctamente
3. ✅ Se evitan productos duplicados usando deduplicación

### Después de la Conversión
1. ✅ El stock origen se reduce correctamente
2. ✅ El producto destino se crea o actualiza
3. ✅ Los pesos se mantienen consistentes
4. ✅ La página se recarga para mostrar los cambios

## Campos de Producto Relacionados

```typescript
type ProductoCreado = {
  // ... otros campos
  peso: number;                    // Peso total del producto
  pesoRegistrado?: number;         // Peso total registrado (prioritario)
  pesoUnitario?: number;           // Peso de una unidad
  productoOrigenId?: string;       // ID del producto origen (si es conversión)
  esConversion?: boolean;          // Indica si es resultado de conversión
  // ... otros campos
}
```

## Archivos Involucrados

1. **`/src/app/components/inventario/ConversionUnidadesDialog.tsx`**
   - Interfaz de usuario para configurar la conversión
   - Cálculo de cantidades y pesos
   - Validaciones del formulario

2. **`/src/app/components/pages/Inventario.tsx`**
   - Función `abrirConversionUnidades()`: Prepara el producto para conversión
   - Función `handleConversionUnidades()`: Ejecuta la conversión y actualiza el inventario

3. **`/src/app/utils/productStorage.ts`**
   - Tipo `ProductoCreado`: Define la estructura del producto
   - Función `guardarProducto()`: Guarda nuevos productos con deduplicación
   - Función `actualizarProducto()`: Actualiza productos existentes
   - Función `obtenerProductos()`: Obtiene productos con deduplicación automática

## Mejoras Futuras

1. **Historial de Conversiones**: Registrar todas las conversiones realizadas
2. **Reversión de Conversiones**: Permitir deshacer conversiones
3. **Conversiones Encadenadas**: Paleta → Caja → Unidad en una sola operación
4. **Factores Personalizados**: Guardar factores de conversión por producto
5. **Validación de Pesos**: Advertir si los pesos no cuadran
6. **Exportar Conversiones**: Generar reportes de conversiones realizadas

## Notas Importantes

- ⚠️ Las conversiones son **irreversibles** actualmente
- ⚠️ Siempre se recarga la página después de una conversión para evitar inconsistencias
- ⚠️ Los productos convertidos heredan todos los metadatos del producto origen
- ⚠️ El peso total se conserva en las conversiones (suma de origen y destino)
