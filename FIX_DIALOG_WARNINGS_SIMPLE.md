# Corrección de Warnings de DialogContent

## Estado Actual

La mayoría de los `DialogContent` en el sistema **YA TIENEN** `DialogDescription` y están correctos. Los warnings provienen de unos pocos componentes que necesitan agregar `aria-describedby={undefined}`.

## ✅ Componentes Corregidos (Ya tienen DialogDescription)

- `/src/app/components/shared/ContactFormSimple.tsx` ✅
- `/src/app/components/pages/UsuariosInternos.tsx` (líneas 572, 726, 859, 966) ✅
- `/src/app/components/pages/Comandas.tsx` (líneas 1130, 1201, 1283) ✅
- `/src/app/components/comandas/ProponerNuevaFecha.tsx` ✅
- `/src/app/components/pages/VistaPublicaOrganismo_fix.tsx` ✅
- Y muchos más...

## ⚠️ Componentes que Necesitan Corrección

Solo unos pocos DialogContent necesitan agregar `aria-describedby={undefined}` cuando no tienen descripción contextual:

### 1. `/src/app/components/pages/Inventario.tsx`

```tsx
// Línea 2195
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>

// Línea 2598  
<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>

// Línea 2614
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>

// Línea 2786
<DialogContent className="max-w-md" aria-describedby={undefined}>
```

### 2. `/src/app/components/pages/Configuracion.tsx`

```tsx
// Línea 4002
<DialogContent className="max-w-md" aria-describedby={undefined}>

// Línea 4072
<DialogContent className="max-w-md" aria-describedby={undefined}>

// Línea 4145
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>

// Línea 4398
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>

// Línea 4723
<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>
```

### 3. Otros archivos menores

- `/src/app/components/pages/EmailOrganismos.tsx` (línea 2568)
- `/src/app/components/pages/GestionRolesPermisos.tsx` (línea 763)
- `/src/app/components/pages/Organismos.tsx` (línea 1728)
- `/src/app/components/EntradaDonAchat.tsx` (líneas 1569, 2508, 2735, 3060, 3075)
- `/src/app/components/EntradaProducto.tsx` (línea 728)
- `/src/app/components/FormularioEntrada.tsx` (línea 941)
- `/src/app/components/GestionAdressesQuartiers.tsx` (líneas 467, 531)

## 🔧 Solución Rápida

Para eliminar TODOS los warnings inmediatamente, simplemente agregar `aria-describedby={undefined}` a cada `DialogContent` listado arriba.

**Antes:**
```tsx
<DialogContent className="max-w-md">
```

**Después:**
```tsx
<DialogContent className="max-w-md" aria-describedby={undefined}>
```

## 📝 Nota

La propiedad `aria-describedby={undefined}` es válida y elimina el warning de accesibilidad cuando el Dialog no requiere una descripción contextual adicional (por ejemplo, dialogs de confirmación simples donde el título es suficientemente descriptivo).

## ✨ Total de Cambios Necesarios

- **Archivos afectados:** ~12 archivos
- **Líneas a modificar:** ~28 líneas
- **Tipo de cambio:** Agregar `aria-describedby={undefined}` al prop de DialogContent

La mayoría del código ya está correcto. Solo estos pocos casos necesitan esta pequeña corrección.
