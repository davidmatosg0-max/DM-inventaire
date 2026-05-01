#!/usr/bin/env node

/**
 * Script para corregir automáticamente los warnings de accesibilidad en DialogContent
 * 
 * Corrección aplicada:
 * 1. Elimina aria-describedby de DialogContent cuando hay DialogDescription
 * 2. Elimina el atributo id de DialogDescription
 */

const fs = require('fs');
const path = require('path');

// Archivos a corregir (rutas relativas desde la raíz del proyecto)
const archivosAProcesar = [
  '/src/app/components/EntradaProducto.tsx',
  '/src/app/components/EnviarCredencialesID.tsx',
  '/src/app/components/FormularioEntrada.tsx',
  '/src/app/components/GestionAdressesQuartiers.tsx',
  '/src/app/components/NotificacionComanda.tsx',
  '/src/app/components/VerificacionesRecientes.tsx',
  '/src/app/components/comandas/ProponerNuevaFecha.tsx',
  '/src/app/components/comptoir/DemandesAide.tsx',
  '/src/app/components/comptoir/RendezVous.tsx',
  '/src/app/components/comptoir/TypesAide.tsx',
  '/src/app/components/conversion/ConversionDialog.tsx',
  '/src/app/components/conversion/HistorialConversiones.tsx',
  '/src/app/components/conversion/PlantillasConversion.tsx',
  '/src/app/components/cuisine/EtiquetaReceta.tsx',
  '/src/app/components/cuisine/InventarioCocina.tsx',
  '/src/app/components/cuisine/OfertasDisponibles.tsx',
  '/src/app/components/departamentos/FormularioContactoCompacto.tsx',
  '/src/app/components/departamentos/GestionContactosDepartamento.tsx',
  '/src/app/components/inventario/CarritoMejorado.tsx',
  '/src/app/components/inventario/ConversionUnidadesDialog.tsx',
  '/src/app/components/inventario/DialogAceptarOferta.tsx',
  '/src/app/components/inventario/DialogCrearOferta.tsx',
  '/src/app/components/inventario/DialogDistribuirProductos.tsx',
  '/src/app/components/inventario/DialogEnviarCocina.tsx',
  '/src/app/components/inventario/EditarEntradaDialog.tsx',
  '/src/app/components/inventario/ExportacionAvanzada.tsx',
  '/src/app/components/inventario/FormularioEntradaProductoCompacto.tsx',
  '/src/app/components/inventario/GestionUnidades.tsx',
  '/src/app/components/inventario/GestionVariantes.tsx',
  '/src/app/components/inventario/HistorialProductoDialog.tsx',
  '/src/app/components/inventario/PanierProductos.tsx',
  '/src/app/components/inventario/TransformarProductoDialog.tsx',
  '/src/app/components/inventario/ValidacionEntradasDialog.tsx',
  '/src/app/components/liaison/GestionDemandes.tsx',
  '/src/app/components/organismos/MesDemandes.tsx',
  '/src/app/components/shared/IDDigitalGenerico.tsx',
  '/src/app/components/transporte/GestionChoferes.tsx',
  '/src/app/components/transporte/GestionVehiculos.tsx',
  '/src/app/components/transporte/PlanificacionRutas.tsx',
  '/src/app/components/transporte/VerificacionVehiculo.tsx',
  '/src/app/components/ui/command.tsx',
  '/src/app/components/ui/language-selector.tsx',
  '/src/app/components/ui/task-selector.tsx',
  '/src/app/components/usuarios/GestionDepartamentos.tsx',
  '/src/app/components/usuarios/GestionRoles.tsx',
];

console.log('🔧 Iniciando corrección de accesibilidad en DialogContent...\n');

let archivosCorregidos = 0;
let archivosConError = 0;

archivosAProcesar.forEach(archivoRelativo => {
  const archivoPath = path.join(process.cwd(), archivoRelativo);
  
  try {
    if (!fs.existsSync(archivoPath)) {
      console.log(`⚠️  Archivo no encontrado: ${archivoRelativo}`);
      archivosConError++;
      return;
    }

    let contenido = fs.readFileSync(archivoPath, 'utf-8');
    let cambiosRealizados = 0;

    // Paso 1: Eliminar aria-describedby de DialogContent
    const regexAriaDescribedby = /(<DialogContent[^>]*)\s+aria-describedby="[^"]+"/g;
    const contenidoModificado1 = contenido.replace(regexAriaDescribedby, (match, grupo1) => {
      cambiosRealizados++;
      return grupo1;
    });

    // Paso 2: Eliminar id de DialogDescription
    const regexDialogDescriptionId = /(<DialogDescription)\s+id="[^"]+"/g;
    const contenidoModificado2 = contenidoModificado1.replace(regexDialogDescriptionId, (match, grupo1) => {
      cambiosRealizados++;
      return grupo1;
    });

    if (cambiosRealizados > 0) {
      fs.writeFileSync(archivoPath, contenidoModificado2, 'utf-8');
      console.log(`✅ ${archivoRelativo} - ${cambiosRealizados} corrección(es) aplicada(s)`);
      archivosCorregidos++;
    } else {
      console.log(`ℹ️  ${archivoRelativo} - Sin cambios necesarios`);
    }

  } catch (error) {
    console.error(`❌ Error procesando ${archivoRelativo}:`, error.message);
    archivosConError++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Archivos corregidos: ${archivosCorregidos}`);
console.log(`   ❌ Archivos con error: ${archivosConError}`);
console.log(`   📝 Total procesados: ${archivosAProcesar.length}`);
console.log(`\n✨ Corrección completada!\n`);
