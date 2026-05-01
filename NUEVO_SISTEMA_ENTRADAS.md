# Nuevo Sistema de Registro de Entradas

## Resumen

Se ha creado un nuevo formulario de registro de entradas (`FormularioEntrada.tsx`) que simplifica el proceso de registrar entradas de inventario y generar productos automáticamente.

## Características Principales

### 1. **Formulario Simplificado**
- Diseño organizado en 4 secciones claras:
  - 📋 Información Básica (Tipo de Entrada, Donador/Proveedor)
  - 📦 Información del Producto (Categoría, Subcategoría)
  - 📊 Cantidades (Cantidad, Unidad, Peso)
  - 📝 Detalles Adicionales (Temperatura, Fecha Caducidad, Lote, Observaciones)

### 2. **Creación de Subcategorías desde Categorías**
- Las subcategorías se crean directamente desde las categorías (no desde productos)
- Botón "Nueva" junto al selector de subcategorías
- Dialog simple con campos:
  - Nombre (requerido)
  - Ícono (hereda de categoría si se deja vacío)
  - Peso Unitario (opcional, se calcula automáticamente si es 0)
  - Descripción (opcional)
- Se guardan en la estructura de categorías en localStorage

### 3. **Generación Automática de Productos en Inventario**
- **Lógica Inteligente:**
  - Si ya existe un producto con la misma categoría y subcategoría:
    - Se actualiza el stock sumando la cantidad
    - Se actualiza el peso sumando el peso total
    - Se actualizan lote y fecha de caducidad si se proporcionan
  - Si no existe:
    - Se crea un nuevo producto automáticamente
    - Código generado: `[3 letras categoría]-[timestamp]`
    - Nombre: `[Categoría] - [Subcategoría]`
    - Hereda ícono y peso unitario de la subcategoría
    - Se inicializa con los datos de la entrada

### 4. **Cálculo Automático de Peso**
- Al seleccionar categoría, subcategoría y cantidad:
  - Si la subcategoría tiene peso unitario definido
  - Calcula automáticamente: `peso = cantidad × pesoUnitario`
  - Muestra indicador visual ✓ "Peso calculado automáticamente"

### 5. **Registro de Entrada**
- Guarda la entrada en el historial con todos los detalles
- Vincula al producto generado/actualizado
- Incluye información del programa (icono, color)
- Incluye información del donador

## Archivos Modificados

### Nuevos Archivos
- `/src/app/components/FormularioEntrada.tsx` - Nuevo componente de formulario

### Archivos Modificados
- `/src/app/utils/categoriaStorage.ts` - Añadida función `agregarSubcategoria()`
- `/src/app/components/pages/Inventario.tsx`:
  - Import actualizado: `FormularioEntrada` en lugar de `EntradaDonAchat`
  - Botón "Nueva Entrada" reemplaza al componente antiguo
  - Estado `formularioEntradaOpen` para controlar el dialog

## Flujo de Uso

1. **Abrir Formulario:** Click en "Nueva Entrada" en la pestaña Entradas
2. **Información Básica:**
   - Seleccionar tipo de entrada (Achat, Don, CPN, etc.)
   - Seleccionar donador/proveedor
3. **Producto:**
   - Seleccionar categoría
   - Seleccionar subcategoría (o crear nueva con el botón "Nueva")
4. **Cantidades:**
   - Ingresar cantidad
   - Seleccionar unidad
   - El peso se calcula automáticamente (o se puede ingresar manualmente)
5. **Detalles:** (Opcionales)
   - Temperatura, fecha de caducidad, lote, observaciones
6. **Guardar:** Click en "Guardar Entrada"

## Validaciones

El formulario valida:
- ✓ Tipo de entrada (requerido)
- ✓ Donador/proveedor (requerido)
- ✓ Categoría (requerido)
- ✓ Subcategoría (requerido)
- ✓ Cantidad > 0 (requerido)
- ✓ Unidad (requerido)

## Ventajas del Nuevo Sistema

1. **Más Simple:** Menos pasos para registrar una entrada
2. **Más Inteligente:** Actualiza productos existentes automáticamente
3. **Más Rápido:** Cálculo automático de pesos
4. **Más Claro:** Organización visual por secciones
5. **Más Flexible:** Permite crear subcategorías sobre la marcha
6. **Más Consistente:** Siempre genera productos con la misma estructura

## Estructura de Datos

### Subcategoría (en Categoría)
```typescript
{
  id: string;
  nombre: string;
  icono?: string;
  activa: boolean;
  pesoUnitario?: number;
  descripcion?: string;
}
```

### Producto Generado
```typescript
{
  id: string;
  codigo: string; // Ej: FRU-123456
  nombre: string; // Ej: "Frutas y Verduras - Manzanas"
  categoria: string;
  subcategoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string; // "Almacén Principal"
  lote: string;
  fechaVencimiento: string;
  esPRS: boolean;
  activo: boolean;
  icono: string;
  peso: number;
  pesoUnitario: number;
  fechaCreacion: string;
}
```

### Entrada Registrada
```typescript
{
  id: string;
  fecha: string;
  tipo: string; // 'achat', 'don', 'cpn'
  tipoProgramaNombre: string;
  tipoProgramaIcono: string;
  donadorProveedor: string;
  productoId: string;
  productoNombre: string;
  productoCodigo: string;
  categoria: string;
  subcategoria: string;
  cantidad: number;
  unidad: string;
  peso: number;
  temperatura: string;
  lote: string;
  fechaCaducidad: string;
  observaciones: string;
  icono: string;
}
```

## Próximas Mejoras Sugeridas

- [ ] Añadir búsqueda/filtro en selectores de categoría y subcategoría
- [ ] Permitir duplicar entradas anteriores
- [ ] Añadir vista previa antes de guardar
- [ ] Exportar entradas a Excel/PDF
- [ ] Añadir fotos a las entradas
- [ ] Escaneo de códigos de barras
