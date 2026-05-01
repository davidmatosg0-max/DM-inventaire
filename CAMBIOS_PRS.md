# Sistema de Restricción de Categorías PRS

## Cambios Implementados

### 1. Verificación del Programa PRS
- Se agregó lógica para verificar si existe un programa de entrada llamado "PRS" que esté activo
- Ubicación: Línea ~232 en `/src/app/components/pages/Configuracion.tsx`

```typescript
const existeProgramaPRS = programasEntrada.some(
  programa => programa.nombre.toUpperCase() === 'PRS' && programa.activo
);
```

### 2. Filtrado de Categorías
- Se creó una variable `categoriasVisibles` que filtra las categorías según disponibilidad del programa PRS
- Las categorías con "prs" (case-insensitive) en su descripción solo se muestran si existe el programa PRS
- Ubicación: Línea ~237 en `/src/app/components/pages/Configuracion.tsx`

```typescript
const categoriasVisibles = categorias.filter(categoria => {
  const esPRS = categoria.descripcion?.toLowerCase().includes('prs');
  if (esPRS) {
    return existeProgramaPRS;
  }
  return true;
});
```

### 3. Actualización de Vistas
Se reemplazó `categorias` por `categoriasVisibles` en los siguientes lugares:

- ✅ Línea 1220: Selector de categorías en formulario de subcategorías
- ✅ Línea 1622: Listado de categorías en pestaña "Categorías y Subcategorías"
- ✅ Línea 2090-2097: Listado de categorías en pestaña "Valores Monetarios"
- ✅ Línea 2743: Selector de categorías en formulario de productos/variantes

### 4. Mensajes Informativos
Se agregaron mensajes informativos en ambas pestañas (líneas 1604 y 2072):
- Aparecen cuando NO existe el programa PRS pero HAY categorías PRS
- Color ámbar con icono de paquete
- Explican que las categorías PRS están ocultas y cómo verlas

### 5. Badges Visuales
Se agregaron badges morados "🔒 PRS" en:
- ✅ Línea 1651-1655: Categorías en vista principal
- ✅ Línea 2111-2119: Categorías en vista de valores monetarios
- Aparecen cuando una categoría contiene "prs" en su descripción

### 6. Advertencias en Formularios
Se agregaron advertencias en formularios de creación/edición de categorías:
- ✅ Línea 1432-1441: Formulario en pestaña "Categorías y Subcategorías"
- ✅ Línea 1982-1991: Formulario en pestaña "Valores Monetarios"
- Aparecen automáticamente cuando se escribe "prs" en la descripción
- Informan que la categoría solo será visible con programa PRS activo

## Funcionamiento

### Escenario 1: Sin Programa PRS
- Categorías con "prs" en descripción: **OCULTAS**
- Mensaje informativo: **VISIBLE**
- Categorías normales: **VISIBLES**

### Escenario 2: Con Programa PRS Activo
- Categorías con "prs" en descripción: **VISIBLES** (con badge 🔒 PRS)
- Mensaje informativo: **OCULTO**
- Categorías normales: **VISIBLES**

### Escenario 3: Programa PRS Inactivo
- Categorías con "prs" en descripción: **OCULTAS**
- Mensaje informativo: **VISIBLE**
- Categorías normales: **VISIBLES**

## Verificación de Cambios

Total de usos de `categoriasVisibles`: 6
Total de mensajes informativos: 2
Total de badges PRS: 2
Total de advertencias en formularios: 2

Todos los cambios han sido aplicados correctamente al archivo.
