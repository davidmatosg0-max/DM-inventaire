# Fix Dialog Descriptions - Solución de Errores de Accesibilidad

## Problema
Los componentes `DialogContent` con `aria-describedby` explícito requieren un `DialogDescription` correspondiente con el mismo ID, de lo contrario Radix UI lanza un warning.

## Solución Implementada

### 1. Optimización del Componente Dialog Base
- Modificado `/src/app/components/ui/dialog.tsx` para manejar mejor los casos sin descripción
- El componente ahora detecta automáticamente si existe un `DialogDescription` 
- Si no hay descripción Y no hay `aria-describedby` explícito, no pasa ningún valor (evita warnings)

### 2. Opciones para Componentes Existentes

#### Opción A: Remover aria-describedby innecesarios
```tsx
// ANTES:
<DialogContent aria-describedby="my-description">
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
  </DialogHeader>
</DialogContent>

// DESPUÉS:
<DialogContent>
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
  </DialogHeader>
</DialogContent>
```

#### Opción B: Agregar DialogDescription (Recomendado para Accesibilidad)
```tsx
<DialogContent aria-describedby="my-description">
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription id="my-description">
      Descripción del diálogo
    </DialogDescription>
  </DialogHeader>
</DialogContent>
```

#### Opción C: Usar DialogDescription Oculto (Screen Readers Only)
```tsx
<DialogContent aria-describedby="my-description">
  <DialogHeader>
    <DialogTitle>Título</DialogTitle>
    <DialogDescription id="my-description" className="sr-only">
      Descripción para lectores de pantalla
    </DialogDescription>
  </DialogHeader>
</DialogContent>
```

## Archivos que Requieren Actualización

Los siguientes archivos tienen `DialogContent` con `aria-describedby` pero sin `DialogDescription`:

1. `/src/app/components/VerificacionesRecientes.tsx` - línea 162
2. `/src/app/components/GestionAdressesQuartiers.tsx` - líneas 467, 531
3. `/src/app/components/FormularioEntrada.tsx` - líneas 437, 941

## Recomendación
Para máxima accesibilidad, usar la **Opción B** o **Opción C** en todos los diálogos, proporcionando contexto adicional para usuarios de lectores de pantalla.

## Estado
✅ Componente base optimizado
⏳ Pendiente: Actualizar componentes individuales
