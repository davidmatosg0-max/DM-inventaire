/**
 * Script de Corrección: Agregar aria-describedby={undefined} a DialogContent
 * 
 * Este script agrega aria-describedby={undefined} a todos los DialogContent
 * que no tienen un DialogDescription asociado para eliminar warnings de accesibilidad.
 */

// LISTA DE ARCHIVOS Y LÍNEAS A CORREGIR:

// Los siguientes DialogContent necesitan aria-describedby={undefined}:

/**
 * /src/app/components/pages/Inventario.tsx
 * - Línea 2195: Dialog Compartir Lista
 * - Línea 2598: Dialog Guía Conversiones  
 * - Línea 2614: Dialog Crear Variante
 * - Línea 2786: Dialog Localización
 */

/**
 * /src/app/components/pages/Configuracion.tsx
 * - Línea 4002: Dialog Eliminar Categoría
 * - Línea 4072: Dialog Eliminar Subcategoría
 * - Línea 4145: Dialog Crear Variante
 * - Línea 4398: Dialog Editar Variante
 * - Línea 4723: Dialog Configuración Email
 */

/**
 * /src/app/components/pages/Comandas.tsx
 * - Línea 1130: Dialog Imprimir Etiqueta
 * - Línea 1201: Dialog Imprimir Comanda Completa
 * - Línea 1283: Dialog Ver Solicitud
 */

/**
 * /src/app/components/pages/EmailOrganismos.tsx
 * - Línea 2568: Dialog Clave Generada
 */

/**
 * /src/app/components/pages/GestionRolesPermisos.tsx
 * - Línea 763: Dialog Permisos de Rol
 */

/**
 * /src/app/components/pages/Organismos.tsx
 * - Línea 1728: Dialog Envío Email
 */

/**
 * /src/app/components/pages/UsuariosInternos.tsx
 * - Línea 572: Dialog Perfil Donador/Vendedor
 * - Línea 726: Dialog Nueva Transacción
 * - Línea 859: Dialog Gestión Departamentos
 * - Línea 966: Dialog Confirmación Eliminación
 */

/**
 * /src/app/components/EntradaDonAchat.tsx
 * - Línea 1569: Dialog Seleccionar Donador
 * - Línea 2508: Dialog Nueva Subcategoría
 * - Línea 2735: Dialog Nueva Variante
 * - Línea 3060: Dialog Gestión Unidades
 * - Línea 3075: Dialog Ayuda Impresión
 */

/**
 * /src/app/components/EntradaProducto.tsx
 * - Línea 728: Dialog Confirmación Imprimir
 */

/**
 * /src/app/components/FormularioEntrada.tsx
 * - Línea 941: Dialog Nueva Subcategoría
 */

/**
 * /src/app/components/GestionAdressesQuartiers.tsx
 * - Línea 467: Dialog Ville
 * - Línea 531: Dialog Quartier
 */

/**
 * /src/app/components/comandas/ProponerNuevaFecha.tsx
 * - Ya tiene DialogDescription ✅
 */

// SOLUCIÓN APLICADA:

// Cambiar:
// <DialogContent className="max-w-md">

// Por:
// <DialogContent className="max-w-md" aria-describedby={undefined}>

// Esto elimina el warning de accesibilidad cuando no hay DialogDescription disponible.

export const CAMBIOS_NECESARIOS = {
  '/src/app/components/pages/Inventario.tsx': [
    { linea: 2195, cambio: '<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 2598, cambio: '<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 2614, cambio: '<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 2786, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/Configuracion.tsx': [
    { linea: 4002, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
    { linea: 4072, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
    { linea: 4145, cambio: '<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 4398, cambio: '<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 4723, cambio: '<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/Comandas.tsx': [
    { linea: 1130, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
    { linea: 1201, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
    { linea: 1283, cambio: '<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/EmailOrganismos.tsx': [
    { linea: 2568, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/GestionRolesPermisos.tsx': [
    { linea: 763, cambio: '<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/Organismos.tsx': [
    { linea: 1728, cambio: '<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/pages/UsuariosInternos.tsx': [
    { linea: 572, cambio: '<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby={undefined}>' },
    { linea: 726, cambio: '<DialogContent className="max-w-lg" aria-describedby={undefined}>' },
    { linea: 859, cambio: '<DialogContent className="max-w-2xl" aria-describedby={undefined}>' },
    { linea: 966, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/EntradaDonAchat.tsx': [
    { linea: 1569, cambio: '<DialogContent className="max-w-2xl max-h-[600px]" aria-describedby={undefined}>' },
    { linea: 2508, cambio: '<DialogContent className="max-w-2xl" aria-describedby={undefined}>' },
    { linea: 2735, cambio: '<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>' },
    { linea: 3060, cambio: '<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>' },
    { linea: 3075, cambio: '<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/EntradaProducto.tsx': [
    { linea: 728, cambio: '<DialogContent className="max-w-md" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/FormularioEntrada.tsx': [
    { linea: 941, cambio: '<DialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50" aria-describedby={undefined}>' },
  ],
  
  '/src/app/components/GestionAdressesQuartiers.tsx': [
    { linea: 467, cambio: '<DialogContent className="max-w-2xl" aria-describedby={undefined}>' },
    { linea: 531, cambio: '<DialogContent className="max-w-2xl" aria-describedby={undefined}>' },
  ]
};

// TOTAL: 28 archivos a modificar

// NOTA: Los siguientes ya tienen DialogDescription o aria-describedby y están correctos:
// - /src/app/components/shared/ContactFormSimple.tsx ✅
// - /src/app/components/pages/VistaPublicaOrganismo_fix.tsx ✅  
// - /src/app/components/comandas/ProponerNuevaFecha.tsx ✅

console.log('Total de cambios necesarios:', Object.values(CAMBIOS_NECESARIOS).reduce((sum, arr) => sum + arr.length, 0));

export default CAMBIOS_NECESARIOS;
