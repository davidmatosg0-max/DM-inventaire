# 🔧 Nota Técnica: Navegación desde Toast

## Situación Actual

El toast de advertencia de producto duplicado tiene una acción con botón "Ver" que intenta llamar a `setActiveTab('inventario')`, pero esta función no está disponible en el componente `Configuracion.tsx`.

## Código Actual (Líneas 887-892)

```typescript
action: {
  label: t('common.view'),
  onClick: () => {
    setActiveTab('inventario');
  }
}
```

## Soluciones Posibles

### Opción 1: Eliminar la Acción (MÁS SIMPLE) ✅

```typescript
if (productoExistente) {
  toast.warning(`⚠️ ${t('configuration.productAlreadyExists')}: \"${nombre}\"`, {
    description: `📦 ${t('common.code')}: ${productoExistente.codigo} | 💾 ${t('configuration.productExistsInInventory')}`,
    duration: 6000
    // Sin action
  });
  return;
}
```

**Ventajas:**
- Simple y funciona inmediatamente
- No requiere cambios en la arquitectura
- El mensaje es suficientemente claro

**Desventajas:**
- No hay navegación directa al inventario

### Opción 2: Agregar Prop al Componente

```typescript
interface ConfiguracionProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function Configuracion({ onNavigateToTab }: ConfiguracionProps) {
  // ...
  
  if (productoExistente) {
    toast.warning(`⚠️ ${t('configuration.productAlreadyExists')}: \"${nombre}\"`, {
      description: `📦 ${t('common.code')}: ${productoExistente.codigo}`,
      duration: 6000,
      action: onNavigateToTab ? {
        label: t('common.view'),
        onClick: () => onNavigateToTab('inventario')
      } : undefined
    });
    return;
  }
}
```

**Ventajas:**
- Permite navegación cuando el componente padre lo soporte
- Mantiene el componente desacoplado

**Desventajas:**
- Requiere cambios en el componente padre
- Más complejo de implementar

### Opción 3: Usar React Router

```typescript
import { useNavigate } from 'react-router';

// ...dentro del componente
const navigate = useNavigate();

if (productoExistente) {
  toast.warning(`⚠️ ${t('configuration.productAlreadyExists')}: \"${nombre}\"`, {
    description: `📦 ${t('common.code')}: ${productoExistente.codigo}`,
    duration: 6000,
    action: {
      label: t('common.view'),
      onClick: () => navigate('/inventario')
    }
  });
  return;
}
```

**Ventajas:**
- Navegación directa a la ruta del inventario
- Usa el sistema de routing del sistema

**Desventajas:**
- Depende de React Router
- Necesita configuración de rutas

## Recomendación

**Para implementación inmediata**: Usar **Opción 1** (eliminar la acción)

El mensaje es suficientemente claro y el usuario puede navegar manualmente al inventario si lo necesita.

**Para mejora futura**: Implementar **Opción 2** cuando se refactorice la arquitectura de componentes.

## Código para Implementar Opción 1

Reemplazar líneas 883-894 con:

```typescript
// Si ya existe un producto con las mismas características, mostrar aviso
if (productoExistente) {
  toast.warning(`⚠️ ${t('configuration.productAlreadyExists')}: \"${nombre}\"`, {
    description: `📦 ${t('common.code')}: ${productoExistente.codigo} | 💾 ${t('configuration.productExistsInInventory')}`,
    duration: 6000
  });
  return;
}
```

## Estado

⚠️ **Pendiente**: Remover líneas 887-892 (action con setActiveTab)  
✅ **Funcional**: La validación de duplicados funciona correctamente  
✅ **Mensaje**: Se muestra correctamente el toast de advertencia
