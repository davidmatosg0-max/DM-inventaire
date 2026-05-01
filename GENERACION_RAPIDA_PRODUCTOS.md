# 📦 Generación Rápida de Productos

## Descripción General

Sistema de generación automática de productos desde categorías y subcategorías implementado en el módulo de Configuración del Banco de Alimentos.

## Características Principales

### ⚡ Generación Automática
Con un solo clic, el sistema crea productos completos con todos los datos necesarios:

- **Código único automático**: Se genera usando el formato `XXX-YYY-NNNN`
  - `XXX`: Primeras 3 letras de la categoría (en mayúsculas)
  - `YYY`: Primeras 3 letras de la subcategoría (en mayúsculas)
  - `NNNN`: Últimos 4 dígitos del timestamp para garantizar unicidad
  - Ejemplo: `FRU-MAN-7234` (Frutas → Manzanas)

- **Nombre del producto**: Usa el nombre de la subcategoría
- **Icono heredado**: Toma el icono de la subcategoría, o de la categoría si no existe
- **Unidad por defecto**: Hereda la unidad configurada en la subcategoría (ej: kg, und, L)
- **Peso unitario memorizado**: Si la subcategoría tiene un peso unitario definido, se hereda automáticamente al producto
- **Marcado como PRS**: Por defecto se marca como producto PRS
- **Estado activo**: El producto se crea activo y listo para usar

### 🚫 Prevención de Duplicados
El sistema previene la creación de productos duplicados:
- **Detección automática**: Verifica si ya existe un producto con el mismo nombre, categoría y subcategoría
- **Mensaje informativo**: Si el producto ya existe, muestra una alerta con el código del producto existente
- **Opción de ver**: Botón directo para ir a la pestaña de Inventario y ver el producto existente
- **Sin duplicados**: No se crean productos redundantes en el sistema

### 📊 Contador Visual
Cada subcategoría muestra un badge con la cantidad de productos generados:
- Badge azul con icono de paquete 📦
- Formato: "N producto(s)"
- Se actualiza automáticamente al generar nuevos productos
- Compatible con los 4 idiomas del sistema

### 🎨 Interfaz Intuitiva
- **Botón verde "+ Producto"** en cada subcategoría
- Alerta informativa al inicio de la sección explicando la funcionalidad
- Animaciones suaves en hover
- Mensajes de confirmación descriptivos con toast

## Cómo Usar

### Paso 1: Acceder a Configuración
1. Navegar al módulo **Configuración** desde el menú principal
2. Seleccionar la pestaña **Categorías y Subcategorías**

### Paso 2: Expandir una Categoría
1. Hacer clic en cualquier categoría para ver sus subcategorías
2. Las subcategorías se mostrarán en una lista expandible

### Paso 3: Generar Producto
1. Localizar la subcategoría deseada
2. Hacer clic en el botón verde **"+ Producto"**
3. El sistema generará automáticamente el producto
4. Aparecerá un mensaje de confirmación con los detalles del producto creado

### Paso 4: Verificar el Producto
1. El contador en la subcategoría se actualizará (+1 producto)
2. El producto estará disponible inmediatamente en la página de **Inventario**
3. Podrás ver y editar el producto desde el inventario

## Ejemplo Práctico

### Caso de Uso: Crear "Manzanas"

**Configuración inicial:**
- Categoría: "Frutas Frescas" (icono: 🍎, color: #4CAF50)
- Subcategoría: "Manzanas" (unidad: kg, icono: 🍏, peso unitario: 0.15 kg)

**Al hacer clic en "+ Producto":**
```
✅ Producto generado automáticamente: "Manzanas"
📦 Código: FRU-MAN-4521
📂 Categoría: Frutas Frescas
⚖️ Peso unitario: 0.15 kg
```

**Resultado:**
- **ID**: Generado automáticamente
- **Código**: FRU-MAN-4521
- **Nombre**: Manzanas
- **Categoría**: Frutas Frescas
- **Subcategoría**: Manzanas
- **Unidad**: kg
- **Peso unitario**: 0.15 kg (heredado de la subcategoría)
- **Icono**: 🍏
- **Estado**: Activo
- **Tipo**: PRS
- **Stock inicial**: 0 kg
- **Fecha creación**: 2026-02-04

### Caso de Uso 2: Prevención de Duplicados

**Escenario:** Un usuario intenta crear un producto "Manzanas" que ya existe en el inventario

**Al hacer clic en "+ Producto" por segunda vez:**
```
⚠️ Producto ya existe: "Manzanas"
📦 Código: FRU-MAN-4521
💾 Este producto ya existe en el inventario
[Botón: Ver]
```

**Resultado:**
- ❌ **No se crea un producto duplicado**
- ℹ️ **Mensaje informativo** mostrando el código del producto existente
- 👁️ **Opción para ver** el producto existente en Inventario (al hacer clic en "Ver")
- 🔒 **Integridad de datos** preservada sin duplicados

## Ventajas del Sistema

### ✅ Ahorro de Tiempo
- **Antes**: 5-7 pasos manuales para crear un producto
- **Ahora**: 1 solo clic

### ✅ Consistencia de Datos
- Todos los productos siguen el mismo formato de código
- Se heredan automáticamente las propiedades de la categoría
- No hay errores de captura manual

### ✅ Facilidad de Uso
- No requiere conocimientos técnicos
- Interfaz visual clara
- Mensajes descriptivos en cada paso

### ✅ Trazabilidad
- Código único garantizado
- Fecha de creación automática
- Relación clara con categoría y subcategoría

### ✅ Prevención de Duplicados
- Detección automática de productos existentes
- Evita confusión con múltiples productos idénticos
- Mantiene la integridad del inventario
- Facilita la gestión y búsqueda de productos

## Soporte Multilingüe

La funcionalidad está completamente traducida a 4 idiomas:

| Elemento | Español | Français | English | العربية |
|----------|---------|----------|---------|---------|
| Título | Generación Rápida de Productos | Génération Rapide de Produits | Quick Product Generation | إنشاء سريع للمنتجات |
| Botón | + Producto | + Produit | + Product | + منتج |
| Contador | N producto(s) | N produit(s) | N product(s) | N منتج(منتجات) |
| Producto generado | Producto generado automáticamente | Produit généré automatiquement | Product generated automatically | تم إنشاء المنتج تلقائياً |
| Ya existe | Producto ya existe | Le produit existe déjà | Product already exists | المنتج موجود بالفعل |
| Existe en inventario | Este producto ya existe en el inventario | Ce produit existe déjà dans l'inventaire | This product already exists in inventory | هذا المنتج موجود بالفعل في المخزون |
| Ver | Ver | Voir | View | عرض |

## Integración con Otros Módulos

### 📦 Inventario
- Los productos generados aparecen automáticamente
- Se pueden editar desde la página de Inventario
- Se pueden agregar stock, lote, y fecha de vencimiento

### 📋 Comandas
- Los productos generados están disponibles para comandas
- Se pueden distribuir a organismos
- Heredan el valor monetario de la categoría

### 📊 Reportes
- Los productos generados se incluyen en todos los reportes
- Se pueden filtrar por categoría/subcategoría
- Se rastrean desde su creación

## Almacenamiento

Todos los productos generados se guardan en:
- **LocalStorage**: Clave `productos_creados`
- **Formato**: JSON
- **Persistencia**: Los datos permanecen incluso al cerrar el navegador

## Limitaciones Conocidas

- No se pueden generar productos duplicados con el mismo nombre en la misma subcategoría (el código será único por timestamp)
- El stock inicial siempre es 0, debe actualizarse desde Inventario
- Los campos opcionales (lote, ubicación, vencimiento) deben completarse manualmente

## Próximas Mejoras Sugeridas

1. **Generación en lote**: Crear múltiples productos desde varias subcategorías
2. **Plantillas de productos**: Guardar configuraciones predefinidas
3. **Importación masiva**: Cargar productos desde CSV/Excel
4. **Sugerencias inteligentes**: IA para proponer nombres basados en la categoría

## Soporte Técnico

Para más información sobre esta funcionalidad:
- Revisar el código en: `/src/app/components/pages/Configuracion.tsx`
- Función principal: `handleGenerarProductoRapido()`
- Líneas: 869-906

---

**Versión**: 1.0.0  
**Fecha de implementación**: Febrero 2026  
**Autor**: Sistema Banco de Alimentos
