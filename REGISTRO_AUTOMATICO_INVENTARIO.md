# 📦 Sistema de Registro Automático de Inventario

## 🎯 Resumen Ejecutivo

**TODAS las entradas de productos (Don/Achat) se registran AUTOMÁTICAMENTE en el inventario** desde cualquier parte del sistema.

No es necesario hacer ningún registro manual adicional. El sistema se encarga de TODO.

---

## ✅ ¿Qué se Registra Automáticamente?

Cuando se registra una entrada Don/Achat desde **CUALQUIER** módulo del sistema, se hacen automáticamente **3 acciones**:

### 1. 📝 Guardar en el Historial de Entradas
- Se guarda en `localStorage` bajo la clave `banco_alimentos_entradas_inventario`
- Incluye toda la información: donador, producto, cantidades, temperaturas, lotes, etc.
- Persistente y recuperable

### 2. 📦 Actualizar el Inventario de Productos
- **Si el producto YA EXISTE**: Se actualiza su stock sumando la cantidad
- **Si el producto NO EXISTE**: Se crea automáticamente con toda su información
- Se guarda en `localStorage` bajo la clave `banco_alimentos_productos`
- También se actualiza en memoria (`mockProductos`) para visualización inmediata

### 3. 📊 Registrar el Movimiento
- Se crea un registro de movimiento de entrada
- Se guarda en `mockMovimientos` para trazabilidad
- Incluye referencia al documento original

---

## 🔧 Componentes que Registran Entradas

### 1. **EntradaDonAchat.tsx** (Principal)
```typescript
// Ubicación: /src/app/components/EntradaDonAchat.tsx
// Línea: 175
guardarEntrada(entradaData);
```

**Características:**
- ✅ Registra entradas Don, Achat, y otros programas
- ✅ Permite seleccionar donadores/proveedores registrados
- ✅ Permite agregar donadores/proveedores personalizados
- ✅ Permite seleccionar productos existentes
- ✅ Permite agregar productos nuevos
- ✅ Registra temperatura, lote, fecha de caducidad, observaciones

### 2. **Inventario.tsx - Formulario de Entrada**
```typescript
// Ubicación: /src/app/components/pages/Inventario.tsx
// Línea: 244
guardarEntrada({ ... });
```

**Características:**
- ✅ Registro manual desde el módulo de Inventario
- ✅ Soporte para múltiples items en una sola entrada
- ✅ Integración con categorías PRS
- ✅ Historial de entradas previas para reutilización

### 3. **Inventario.tsx - Panier de Produits**
```typescript
// Ubicación: /src/app/components/pages/Inventario.tsx
// Línea: 282 (ACTUALIZADO)
guardarEntrada({ ... }); // Para cada item del panier
```

**Características:**
- ✅ Selección de productos existentes para entrada rápida
- ✅ Registro en lote desde el carrito
- ✅ Ahora también guarda en localStorage (NUEVO)

---

## 🔄 Flujo de Registro Automático

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO REGISTRA ENTRADA DON/ACHAT                     │
│  (Desde cualquier módulo)                               │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  guardarEntrada(entradaData)                            │
│  (/src/app/utils/entradaInventarioStorage.ts)          │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────────┐   ┌──────────────────────┐
│ 1. GUARDAR        │   │ 2. REGISTRAR EN      │
│    ENTRADA        │   │    INVENTARIO        │
│                   │   │                      │
│ localStorage:     │   │ registrarEnInventario│
│ 'banco_alimentos_ │   │ (función auxiliar)   │
│  entradas_        │   │                      │
│  inventario'      │   └──────────┬───────────┘
└───────────────────┘              │
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐      ┌────────────────────┐
        │ CASO A:            │      │ CASO B:            │
        │ Producto EXISTE    │      │ Producto NO EXISTE │
        │                    │      │                    │
        │ • Actualizar stock │      │ • Crear producto   │
        │ • localStorage     │      │ • localStorage     │
        │ • mockProductos    │      │ • mockProductos    │
        └────────┬───────────┘      └────────┬───────────┘
                 │                           │
                 └───────────┬───────────────┘
                             ▼
                ┌────────────────────────────┐
                │ 3. REGISTRAR MOVIMIENTO    │
                │                            │
                │ mockMovimientos.unshift()  │
                │ (Entrada registrada)       │
                └────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ ✅ COMPLETADO              │
                │                            │
                │ • Entrada guardada         │
                │ • Inventario actualizado   │
                │ • Movimiento registrado    │
                │ • TODO persistente en      │
                │   localStorage             │
                └────────────────────────────┘
```

---

## 💾 Estructura de Datos

### EntradaInventario
```typescript
{
  id: string;                    // Auto-generado: ENT-{timestamp}-{random}
  fecha: string;                 // ISO string
  tipoEntrada: string;          // 'don', 'achat', etc.
  programaNombre: string;        // "Donación", "Compra", etc.
  programaCodigo: string;        // "DON", "ACHAT", etc.
  programaColor: string;         // "#4CAF50", "#1E73BE", etc.
  programaIcono: string;         // "🎁", "🛒", etc.
  
  // Información del donador/proveedor
  donadorId: string;
  donadorNombre: string;
  donadorEsCustom: boolean;
  
  // Información del producto
  productoId: string;
  nombreProducto: string;
  categoria?: string;
  subcategoria?: string;
  productoCategoria?: string;
  productoSubcategoria?: string;
  productoIcono?: string;
  productoCodigo?: string;
  
  // Cantidades
  cantidad: number;
  unidad: string;              // "kg", "Caja", "Unidad", etc.
  pesoUnidad: number;          // kg por unidad
  pesoTotal: number;           // cantidad × pesoUnidad
  
  // Temperatura
  temperatura: 'ambiente' | 'refrigerado' | 'congelado';
  
  // Detalles opcionales
  lote?: string;
  fechaCaducidad?: string;
  observaciones?: string;
  
  // Metadata
  creadoPor?: string;
  fechaCreacion: string;       // Auto-generado
  activo: boolean;             // Auto-generado: true
}
```

### ProductoCreado (localStorage)
```typescript
{
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  stockActual: number;         // ✅ Se actualiza automáticamente
  stockMinimo: number;
  unidad: string;
  peso: number;
  lote: string;                // ✅ Se actualiza con cada entrada
  fechaVencimiento: string;    // ✅ Se actualiza con cada entrada
  icono: string;
  ubicacion: string;
  esPRS: boolean;
  activo: boolean;
  fechaCreacion: string;
}
```

---

## 🚀 Casos de Uso

### Caso 1: Registrar Donación Nueva
```typescript
// Usuario abre "Entrada Don/Achat"
// Selecciona tipo: Don
// Selecciona donador: Carrefour
// Selecciona producto: Arroz Blanco (existente)
// Cantidad: 50 kg
// Submit

// RESULTADO AUTOMÁTICO:
// ✅ Entrada guardada en historial
// ✅ Stock de "Arroz Blanco" +50 kg
// ✅ Movimiento registrado
// ✅ Todo persistente en localStorage
```

### Caso 2: Registrar Producto Nuevo desde Don/Achat
```typescript
// Usuario abre "Entrada Don/Achat"
// Selecciona tipo: Achat
// Selecciona proveedor: Distribuidora ABC
// Producto: No existe → Ingresa manualmente "Aceite de Oliva Premium"
// Categoría: Aceites y Condimentos
// Cantidad: 20 Cajas × 5 kg/caja = 100 kg
// Submit

// RESULTADO AUTOMÁTICO:
// ✅ Entrada guardada en historial
// ✅ Producto "Aceite de Oliva Premium" CREADO automáticamente
// ✅ Stock inicial: 20 Cajas (100 kg)
// ✅ Movimiento registrado
// ✅ Todo persistente en localStorage
```

### Caso 3: Registrar desde Panier de Produits
```typescript
// Usuario abre módulo Inventario
// Pestaña "Gestion de l'Inventaire"
// Sub-pestaña "Panier de Produits"
// Agrega al carrito: Leche (30), Pan (50), Manzanas (25)
// Click "Registrar Entrada"

// RESULTADO AUTOMÁTICO:
// ✅ 3 entradas guardadas en historial
// ✅ Stock de Leche +30
// ✅ Stock de Pan +50
// ✅ Stock de Manzanas +25
// ✅ 3 movimientos registrados
// ✅ Todo persistente en localStorage
```

---

## 🔍 Verificación del Sistema

### Ver Entradas en Console
```javascript
// Abrir DevTools → Console
import { obtenerEntradasActivas } from './utils/entradaInventarioStorage';
console.log(obtenerEntradasActivas());
```

### Ver Productos en Console
```javascript
// Abrir DevTools → Console
import { obtenerProductosActivos } from './utils/productStorage';
console.log(obtenerProductosActivos());
```

### Ver localStorage Directamente
```javascript
// Abrir DevTools → Console
localStorage.getItem('banco_alimentos_entradas_inventario');
localStorage.getItem('banco_alimentos_productos');
```

---

## 📋 Funciones Disponibles

### entradaInventarioStorage.ts
```typescript
// Lectura
obtenerTodasLasEntradas()           // Todas las entradas
obtenerEntradasActivas()            // Solo activas
obtenerEntradaPorId(id)             // Una específica
obtenerEntradasPorTipo(tipo)        // Filtrar por tipo
obtenerEntradasPorFechas(inicio, fin) // Filtrar por fechas
obtenerEntradasPorProducto(id)      // Filtrar por producto
obtenerEntradasPorDonador(id)       // Filtrar por donador
obtenerEstadisticasEntradas()       // Estadísticas generales

// Escritura
guardarEntrada(entrada)             // ✅ REGISTRA TODO AUTOMÁTICAMENTE
actualizarEntrada(id, datos)        // Actualizar entrada existente
eliminarEntrada(id)                 // Soft delete
eliminarEntradaPermanente(id)       // Eliminar permanentemente

// Utilidades
exportarEntradasJSON()              // Exportar a JSON
importarEntradasJSON(json)          // Importar desde JSON
limpiarTodasLasEntradas()           // Limpiar todas
```

### productStorage.ts
```typescript
// Lectura
obtenerProductos()                  // Todos los productos
obtenerProductosActivos()           // Solo activos
obtenerProductoPorId(id)            // Uno específico
buscarProductos(query)              // Buscar por texto

// Escritura (NO necesitas llamarlas manualmente)
guardarProducto(producto)           // ✅ Se llama automáticamente
actualizarProducto(id, datos)       // ✅ Se llama automáticamente
eliminarProducto(id)                // Eliminar producto

// Utilidades
limpiarProductos()                  // Limpiar todos
```

---

## ⚠️ Notas Importantes

### ✅ LO QUE SÍ SE HACE AUTOMÁTICAMENTE:
- ✅ Guardar entrada en historial
- ✅ Crear/actualizar producto en inventario
- ✅ Actualizar stock
- ✅ Registrar movimiento
- ✅ Persistir en localStorage
- ✅ Actualizar mockProductos en memoria

### ❌ LO QUE NO NECESITAS HACER MANUALMENTE:
- ❌ NO llames a `guardarProducto()` manualmente
- ❌ NO llames a `actualizarProducto()` manualmente
- ❌ NO actualices `mockProductos` manualmente
- ❌ NO registres movimientos manualmente

### 🎯 LO ÚNICO QUE NECESITAS HACER:
```typescript
import { guardarEntrada } from '../utils/entradaInventarioStorage';

// Llamar esta función con los datos de la entrada
guardarEntrada({
  fecha: new Date().toISOString(),
  tipoEntrada: 'don',
  // ... resto de datos
});

// ✅ LISTO! El sistema hace TODO automáticamente
```

---

## 🔄 Sincronización entre Sistemas

El sistema mantiene sincronizados:

1. **localStorage** (`banco_alimentos_productos`) → Persistente
2. **mockProductos** (memoria) → Temporal, para visualización
3. **Entradas históricas** (`banco_alimentos_entradas_inventario`) → Persistente

Cuando se registra una entrada:
1. Se guarda en localStorage (persistente)
2. Se actualiza mockProductos (memoria)
3. Al recargar la página, los productos se cargan desde localStorage

---

## 📊 Estadísticas

```typescript
import { obtenerEstadisticasEntradas } from './utils/entradaInventarioStorage';

const stats = obtenerEstadisticasEntradas();
console.log(stats);

// Resultado:
{
  total: 125,
  porTipo: {
    don: 85,
    achat: 30,
    otros: 10
  },
  pesoTotal: 5432.50, // kg
  porTemperatura: {
    ambiente: 70,
    refrigerado: 35,
    congelado: 20
  }
}
```

---

## 🎉 Conclusión

**El sistema está COMPLETAMENTE AUTOMATIZADO.**

Simplemente registra entradas Don/Achat desde cualquier módulo usando el botón correspondiente, y el sistema se encarga de:
- ✅ Guardar el historial
- ✅ Actualizar el inventario
- ✅ Crear productos nuevos si es necesario
- ✅ Registrar movimientos
- ✅ Persistir todo en localStorage

**¡No necesitas hacer nada más!** 🚀
