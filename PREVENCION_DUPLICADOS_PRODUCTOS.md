# 🚫 Sistema de Prevención de Duplicados

## Fecha: Febrero 2026
## Versión: 2.0.0 (Actualizada - Incluye Unidad y Peso Unitario)

## Descripción General

El sistema de generación rápida de productos ahora incluye **detección automática de duplicados** para evitar crear productos con las mismas características en el inventario.

## Funcionamiento

### Validación Automática

Cuando un usuario intenta generar un producto, el sistema verifica:

1. **Nombre del producto** (debe coincidir exactamente)
2. **Categoría** (debe coincidir exactamente)
3. **Subcategoría** (debe coincidir exactamente)
4. **Unidad** (kg, litros, unidades, etc.) ✨ **NUEVO v2.0**
5. **Peso Unitario** (1kg, 5kg, 500g, etc.) ✨ **NUEVO v2.0**
6. **Estado activo** (solo considera productos activos)

Si encuentra un producto que cumple con **todas** estas condiciones, el sistema lo considera un duplicado.

**💡 Ventaja v2.0**: Ahora puedes crear productos con el mismo nombre pero diferentes presentaciones (ej: "Arroz 1kg" vs "Arroz 5kg")

### Flujo de Detección

```typescript
const nombre = subcategoria.nombre;
const unidad = subcategoria.unidad || 'kg';
const pesoUnitario = subcategoria.pesoUnitario;

const productoExistente = productos.find(
  p => p.nombre === nombre && 
       p.categoria === categoria.nombre && 
       p.subcategoria === subcategoria.nombre &&
       p.unidad === unidad &&
       p.pesoUnitario === pesoUnitario &&
       p.activo === true
);

if (productoExistente) {
  // Mostrar alerta y no crear duplicado
  return;
}
```

## Mensaje al Usuario

### Cuando se Detecta un Duplicado

El sistema muestra un toast de advertencia con:

**🟡 Tipo:** Warning (advertencia)

**📋 Contenido:**
```
⚠️ Producto ya existe: "Arroz"
📦 Código: GRA-ARR-4521
⚖️ 1kg
💾 Este producto ya existe en el inventario
```

**⏱️ Duración:** 6 segundos (más tiempo que un mensaje normal para que el usuario pueda leerlo)

### Cuando se Crea Exitosamente

Si no hay duplicados, muestra el mensaje estándar:

**🟢 Tipo:** Success (éxito)

**📋 Contenido:**
```
✅ Producto generado automáticamente: "Arroz"
📦 Código: GRA-ARR-4521
📂 Categoría: Granos y Cereales
```

**⏱️ Duración:** 5 segundos

## Casos de Uso

### Caso 1: Producto Completamente Nuevo ✅

**Escenario:**
- Subcategoría: "Peras"
- No existe ningún producto "Peras" en Frutas Frescas

**Resultado:**
- ✅ Se crea el producto
- ✅ Mensaje de éxito
- ✅ Contador se incrementa

### Caso 2: Producto Ya Existe (Duplicado Exacto) ⚠️

**Escenario:**
- Subcategoría: "Arroz" (unidad: kg, peso: 1)
- Ya existe producto "Arroz" con kg y peso 1 (código: GRA-ARR-4521)

**Resultado:**
- ❌ NO se crea producto duplicado
- ⚠️ Mensaje de advertencia con código, peso y unidad del existente
- 🔢 Contador NO se incrementa

### Caso 3: Mismo Nombre, Diferente Presentación ✅ **NUEVO v2.0**

**Escenario:**
- Existe: "Arroz" con unidad: kg, peso: 1
- Crear: "Arroz" con unidad: kg, peso: 5

**Resultado:**
- ✅ Se crea el producto (son presentaciones diferentes)
- ✅ Mensaje de éxito
- ℹ️ Se consideran productos diferentes porque tienen diferente peso unitario

**Ejemplo Real:**
```
✅ Arroz 1kg  (GRA-ARR-4521)
✅ Arroz 5kg  (GRA-ARR-4522)
✅ Arroz 10kg (GRA-ARR-4523)
```

### Caso 4: Mismo Nombre, Diferente Unidad ✅ **NUEVO v2.0**

**Escenario:**
- Existe: "Manzanas" con unidad: kg
- Crear: "Manzanas" con unidad: unidades

**Resultado:**
- ✅ Se crea el producto (son unidades diferentes)
- ✅ Mensaje de éxito
- ℹ️ Permite vender el mismo producto por peso o por unidad

### Caso 5: Mismo Nombre, Diferente Categoría ✅

**Escenario:**
- Subcategoría: "Manzanas" en **Frutas Frescas**
- Ya existe producto "Manzanas" en **Frutas Procesadas**

**Resultado:**
- ✅ Se crea el producto (son categorías diferentes)
- ✅ Mensaje de éxito
- ℹ️ Se consideran productos diferentes porque están en categorías distintas

### Caso 6: Producto Inactivo Existente ✅

**Escenario:**
- Subcategoría: "Naranjas"
- Existe producto "Naranjas" pero está marcado como **inactivo**

**Resultado:**
- ✅ Se crea el producto (el existente está inactivo)
- ✅ Mensaje de éxito
- ℹ️ Permite "reemplazar" productos inactivos con nuevos activos

## Beneficios

### 🎯 Integridad de Datos
- Evita productos duplicados **exactos** en el sistema
- Permite gestionar diferentes presentaciones del mismo producto
- Mantiene el inventario limpio y organizado
- Facilita búsquedas y reportes

### 📦 Gestión de Presentaciones **NUEVO v2.0**
- Crea "Arroz 1kg", "Arroz 5kg", "Arroz 10kg" como productos independientes
- Cada presentación tiene su propio código, stock y precio
- Refleja cómo realmente se gestionan los productos en un banco de alimentos

### 👤 Experiencia de Usuario
- Mensaje claro cuando intenta crear un duplicado **exacto**
- Información del producto existente (código, peso, unidad)
- Flexibilidad para crear diferentes presentaciones

### 🔍 Trazabilidad
- El usuario sabe exactamente qué producto existe
- Puede verificar y editar el existente si lo necesita
- Evita confusión entre productos idénticos

### ⚡ Eficiencia
- No pierde tiempo creando duplicados exactos
- Permite crear variantes con un solo clic
- Mantiene el contador de productos preciso

## Implementación Técnica

### Archivo
`/src/app/components/pages/Configuracion.tsx`

### Función
`handleGenerarProductoRapido()`

### Código Relevante

```typescript
const handleGenerarProductoRapido = (categoria: Categoria, subcategoria: Subcategoria) => {
  // Usar el nombre de la subcategoría como nombre del producto
  const nombre = subcategoria.nombre;
  const unidad = subcategoria.unidad || 'kg';
  const pesoUnitario = subcategoria.pesoUnitario;
  
  // Verificar si ya existe un producto con las mismas características
  const productoExistente = productos.find(
    p => p.nombre === nombre && 
         p.categoria === categoria.nombre && 
         p.subcategoria === subcategoria.nombre &&
         p.unidad === unidad &&
         p.pesoUnitario === pesoUnitario &&
         p.activo === true
  );
  
  // Si ya existe un producto con las mismas características, mostrar aviso
  if (productoExistente) {
    toast.warning(`⚠️ ${t('configuration.productAlreadyExists')}: "${nombre}"`, {
      description: `📦 ${t('common.code')}: ${productoExistente.codigo} | ⚖️ ${productoExistente.pesoUnitario || ''}${productoExistente.unidad || ''} | 💾 ${t('configuration.productExistsInInventory')}`,
      duration: 6000
    });
    return; // No crear el producto duplicado
  }
  
  // ... resto del código para crear el producto
};
```

## Traducciones Implementadas

### Claves de Traducción

| Clave | Uso |
|-------|-----|
| `configuration.productAlreadyExists` | Título del mensaje de advertencia |
| `configuration.productExistsInInventory` | Descripción explicativa |
| `common.view` | Etiqueta del botón de acción |

### Traducciones por Idioma

#### Español
```json
{
  "productAlreadyExists": "Producto ya existe",
  "productExistsInInventory": "Este producto ya existe en el inventario"
}
```

#### English
```json
{
  "productAlreadyExists": "Product already exists",
  "productExistsInInventory": "This product already exists in inventory"
}
```

#### Français
```json
{
  "productAlreadyExists": "Le produit existe déjà",
  "productExistsInInventory": "Ce produit existe déjà dans l'inventaire"
}
```

#### العربية (Árabe)
```json
{
  "productAlreadyExists": "المنتج موجود بالفعل",
  "productExistsInInventory": "هذا المنتج موجود بالفعل في المخزون"
}
```

## Consideraciones Especiales

### ¿Por qué solo productos activos?

La validación solo considera productos **activos** porque:

1. **Productos inactivos** pueden ser productos descontinuados o temporalmente fuera de uso
2. Permite "reemplazar" productos inactivos con nuevos activos
3. Mantiene flexibilidad en la gestión del catálogo
4. Los usuarios pueden reactivar el producto inactivo si lo prefieren

### ¿Se pueden crear diferentes presentaciones? **NUEVO v2.0**

**¡SÍ!** Esta es la gran mejora de la versión 2.0:

- **"Arroz 1kg"** y **"Arroz 5kg"** son productos diferentes
- **"Manzanas kg"** y **"Manzanas unidades"** son productos diferentes
- Cada uno tiene su propio código, stock, precio y distribución

**Ejemplo práctico:**
```
Subcategoría 1: "Arroz" (unidad: kg, peso: 1)
  → Genera: "Arroz" | GRA-ARR-4521 | 1kg
  
Subcategoría 2: "Arroz" (unidad: kg, peso: 5)
  → Genera: "Arroz" | GRA-ARR-4522 | 5kg
  
Ambos coexisten en el inventario ✅
```

### Validación de Peso Unitario

- Si `pesoUnitario` es `null` o `undefined` en ambos → se consideran iguales
- Si uno es `null` y otro es `1` → se consideran diferentes
- La comparación es **estricta** (===)

### Validación de Unidad

- Si `unidad` es `undefined`, se usa `'kg'` por defecto
- La comparación es **case-sensitive**: "kg" ≠ "Kg"
- "kilogramos" ≠ "kg" (son textos diferentes)

## Testing Recomendado

### Test 1: Crear Producto Nuevo
1. ✅ Crear subcategoría "Bananas" (kg, 1)
2. ✅ Hacer clic en "+ Producto"
3. ✅ Verificar mensaje de éxito
4. ✅ Verificar que aparece en Inventario

### Test 2: Intentar Duplicado Exacto
1. ✅ Con producto "Bananas" (kg, 1) ya creado
2. ✅ Hacer clic nuevamente en "+ Producto"
3. ✅ Verificar mensaje de advertencia con peso/unidad
4. ✅ Verificar que NO se crea duplicado

### Test 3: Crear Diferentes Presentaciones **NUEVO**
1. ✅ Crear "Arroz" (kg, 1) → Éxito (GRA-ARR-4521)
2. ✅ Crear "Arroz" (kg, 5) → Éxito (GRA-ARR-4522)
3. ✅ Verificar que ambos existen en Inventario
4. ✅ Verificar que tienen códigos diferentes

### Test 4: Diferentes Unidades **NUEVO**
1. ✅ Crear "Manzanas" (kg, 1) → Éxito
2. ✅ Crear "Manzanas" (unidades, null) → Éxito
3. ✅ Verificar que ambos coexisten
4. ✅ Verificar que son productos independientes

### Test 5: Mismo Nombre, Diferente Categoría
1. ✅ Crear "Manzanas" en "Frutas Frescas"
2. ✅ Crear "Manzanas" en "Frutas Procesadas"
3. ✅ Verificar que ambos se crean exitosamente
4. ✅ Verificar que son productos independientes

### Test 6: Producto Inactivo
1. ✅ Crear producto "Uvas"
2. ✅ Desactivar producto "Uvas" desde Inventario
3. ✅ Volver a "+ Producto" para "Uvas"
4. ✅ Verificar que permite crear nuevo (el anterior está inactivo)

## Posibles Mejoras Futuras

### 1. Detección de Similares
- Detectar nombres similares (ej: "Manzana" vs "Manzanas")
- Usar algoritmos de similitud de texto
- Sugerir productos similares existentes

### 2. Normalización de Unidades
- Convertir "kilogramos" a "kg" automáticamente
- Detectar equivalencias (1000g = 1kg)
- Sugerir estandarización

### 3. Historial de Intentos
- Registrar cuando se intenta crear duplicados
- Útil para análisis de uso del sistema
- Identificar patrones de confusión de usuarios

### 4. Navegación Directa
- Botón para ir directamente al producto existente en Inventario
- Abrir modal de edición desde el mensaje
- Facilitar correcciones rápidas

---

## Historial de Versiones

### v2.0.0 (Actual) - Febrero 2026
- ✅ Agregada validación de **Unidad**
- ✅ Agregada validación de **Peso Unitario**
- ✅ Permite crear diferentes presentaciones del mismo producto
- ✅ Mensaje actualizado con peso y unidad
- ✅ Documentación completa actualizada

### v1.0.0 - Febrero 2026
- ✅ Validación inicial de nombre, categoría, subcategoría y estado
- ✅ Mensaje de advertencia básico
- ✅ Traducciones en 4 idiomas
- ✅ Documentación inicial

---

**Versión**: 2.0.0  
**Estado**: ✅ Implementado y Funcional  
**Fecha**: Febrero 2026  
**Autor**: Sistema Banco de Alimentos
