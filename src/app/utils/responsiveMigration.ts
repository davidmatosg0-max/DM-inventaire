/**
 * Script de Migración Automática a Responsive Design
 * Este archivo documenta los cambios necesarios en cada componente
 */

export const RESPONSIVE_MIGRATIONS = {
  // ==================== FORMULARIO CONTACTO COMPACTO ====================
  FormularioContactoCompacto: {
    file: '/src/app/components/departamentos/FormularioContactoCompacto.tsx',
    changes: [
      {
        lineApprox: 457,
        before: 'className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"',
        after: 'className="w-full h-full sm:w-[95vw] sm:h-[95vh] md:w-[90vw] md:h-[90vh] max-w-none overflow-hidden p-0 m-0 rounded-none sm:rounded-xl"',
        description: 'Dialog principal - Responsive completo'
      },
      {
        lineApprox: 462,
        before: 'className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm"',
        after: 'className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-3 sm:px-4 md:px-6 py-2 sm:py-3 shadow-sm"',
        description: 'Header - Padding responsive'
      },
      {
        lineApprox: 463,
        before: 'style={{ fontFamily: \'Montserrat, sans-serif\', fontWeight: 600, fontSize: \'1.25rem\' }}',
        after: 'style={{ fontFamily: \'Montserrat, sans-serif\', fontWeight: 600 }} className="text-base sm:text-lg md:text-xl"',
        description: 'Título - Texto responsive'
      },
      {
        lineApprox: 464,
        before: 'className="w-5 h-5 inline mr-2"',
        after: 'className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2"',
        description: 'Icono - Tamaño responsive'
      },
      {
        lineApprox: 472,
        before: 'className="flex-1 overflow-hidden flex"',
        after: 'className="flex-1 overflow-hidden flex flex-col md:flex-row"',
        description: 'Layout principal - Columna en móvil, fila en desktop'
      },
      {
        lineApprox: 474,
        before: 'className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin"',
        after: 'className="w-full md:w-64 lg:w-72 border-b-2 md:border-b-0 md:border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-3 sm:p-4 overflow-y-auto scrollbar-thin max-h-[200px] md:max-h-none"',
        description: 'Sidebar - Horizontal en móvil con altura limitada'
      },
      {
        lineApprox: 584,
        before: 'className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin"',
        after: 'className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 scrollbar-thin"',
        description: 'Contenido - Padding responsive'
      },
      {
        lineApprox: 585,
        before: 'className="max-w-2xl mx-auto space-y-6"',
        after: 'className="max-w-full sm:max-w-2xl mx-auto space-y-4 sm:space-y-6"',
        description: 'Container interno - Ancho responsive'
      },
      {
        lineApprox: 644,
        before: 'className="grid grid-cols-2 gap-4"',
        after: 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"',
        description: 'Grid nombre/apellido - 1 col móvil, 2 desktop'
      },
      {
        lineApprox: 780,
        before: 'className="grid grid-cols-4 gap-2"',
        after: 'className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2"',
        description: 'Días de la semana - 3 cols móvil, 7 desktop'
      }
    ]
  },

  // ==================== FORMULARIO ENTRADA ====================
  FormularioEntrada: {
    file: '/src/app/components/FormularioEntrada.tsx',
    changes: [
      {
        lineApprox: 437,
        before: 'className="max-w-6xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-white to-gray-50"',
        after: 'className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl mx-4 sm:mx-auto max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-white to-gray-50"',
        description: 'Dialog entrada - Responsive completo'
      },
      {
        lineApprox: 439,
        before: 'className="px-8 pt-6 pb-4 border-b bg-white/80 backdrop-blur-sm shrink-0"',
        after: 'className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b bg-white/80 backdrop-blur-sm shrink-0"',
        description: 'Header - Padding responsive'
      },
      {
        lineApprox: 456,
        before: 'className="px-8 py-6 flex-1 overflow-y-auto space-y-6"',
        after: 'className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex-1 overflow-y-auto space-y-4 sm:space-y-6"',
        description: 'Contenido - Padding y spacing responsive'
      },
      {
        lineApprox: 473,
        before: 'className="grid grid-cols-2 gap-5"',
        after: 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5"',
        description: 'Grid info básica - 1 col móvil'
      },
      {
        lineApprox: 546,
        before: 'className="grid grid-cols-2 gap-5"',
        after: 'className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5"',
        description: 'Grid producto - 1 col móvil'
      },
      {
        lineApprox: 710,
        before: 'className="grid grid-cols-3 gap-5"',
        after: 'className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5"',
        description: 'Grid cantidades - 1 col móvil, 3 desktop'
      },
      {
        lineApprox: 820,
        before: 'className="grid grid-cols-3 gap-5"',
        after: 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5"',
        description: 'Grid detalles - 1 col móvil, 2 tablet, 3 desktop'
      },
      {
        lineApprox: 903,
        before: 'className="flex justify-between gap-3 border-t px-8 py-5 bg-gradient-to-r from-white to-gray-50 shrink-0"',
        after: 'className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 border-t px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-white to-gray-50 shrink-0"',
        description: 'Footer botones - Columna en móvil, fila en desktop'
      },
      {
        lineApprox: 910,
        before: 'className="h-11 px-6 border-gray-300 hover:bg-gray-50"',
        after: 'className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base border-gray-300 hover:bg-gray-50"',
        description: 'Botón cancelar - Full width móvil'
      },
      {
        lineApprox: 920,
        before: 'className="h-11 px-6 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-all"',
        after: 'className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-all"',
        description: 'Botón guardar y agregar - Full width móvil'
      },
      {
        lineApprox: 928,
        before: 'className="h-11 px-8 bg-gradient-to-r from-[#1E73BE] to-[#1557a0] hover:from-[#1557a0] hover:to-[#0d3a6e] shadow-lg hover:shadow-xl transition-all"',
        after: 'className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-[#1E73BE] to-[#1557a0] hover:from-[#1557a0] hover:to-[#0d3a6e] shadow-lg hover:shadow-xl transition-all"',
        description: 'Botón guardar - Full width móvil'
      }
    ]
  },

  // ==================== PÁGINA INVENTARIO ====================
  Inventario: {
    file: '/src/app/components/pages/Inventario.tsx',
    changes: [
      {
        lineApprox: 1387,
        before: 'className="w-[180px]"',
        after: 'className="w-full sm:w-[180px]"',
        description: 'Select filtro - Full width móvil'
      },
      {
        lineApprox: 2195,
        before: 'className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin"',
        after: 'className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto scrollbar-thin"',
        description: 'Dialog compartir - Responsive'
      }
    ]
  },

  // ==================== PÁGINA COMANDAS ====================
  Comandas: {
    file: '/src/app/components/pages/Comandas.tsx',
    changes: [
      {
        lineApprox: 651,
        before: 'className="w-[200px]"',
        after: 'className="w-full sm:w-[200px]"',
        description: 'Select estado - Full width móvil'
      },
      {
        lineApprox: 1067,
        before: 'className="max-w-2xl"',
        after: 'className="w-full sm:max-w-md md:max-w-2xl mx-4 sm:mx-auto"',
        description: 'Dialog notificaciones - Responsive'
      }
    ]
  },

  // ==================== PÁGINA CONFIGURACIÓN ====================
  Configuracion: {
    file: '/src/app/components/pages/Configuracion.tsx',
    changes: [
      {
        lineApprox: 2926,
        before: 'className="max-w-3xl max-h-[90vh] overflow-y-auto"',
        after: 'className="w-full sm:max-w-2xl md:max-w-3xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto"',
        description: 'Dialog producto PRS - Responsive'
      },
      {
        lineApprox: 4002,
        before: 'className="max-w-md"',
        after: 'className="w-full sm:max-w-md mx-4 sm:mx-auto"',
        description: 'Dialog eliminar - Responsive'
      }
    ]
  }
};

/**
 * Función para generar comando sed que aplica los cambios
 */
export function generateSedCommands() {
  Object.entries(RESPONSIVE_MIGRATIONS).forEach(([component, config]) => {
    console.log(`\n# ========== ${component} ==========`);
    console.log(`# File: ${config.file}\n`);
    
    config.changes.forEach((change, index) => {
      console.log(`# Change ${index + 1}: ${change.description}`);
      console.log(`sed -i 's/${escapeForSed(change.before)}/${escapeForSed(change.after)}/g' ${config.file}`);
      console.log('');
    });
  });
}

function escapeForSed(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\//g, '\\/')
    .replace(/"/g, '\\"')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/!/g, '\\!')
    .replace(/\$/g, '\\$');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateSedCommands();
}
