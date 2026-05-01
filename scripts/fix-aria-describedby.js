#!/usr/bin/env node

/**
 * Script para eliminar aria-describedby de DialogContent
 * cuando no hay un DialogDescription correspondiente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de archivos que SÍ tienen DialogDescription (no tocar)
const filesWithDescription = [
  '/src/app/components/departamentos/GestionContactosDepartamento.tsx', // Líneas 838, 929
  '/src/app/components/shared/IDDigitalGenerico.tsx', // Línea 92
  '/src/app/components/ui/command.tsx', // Línea 43
  '/src/app/components/liaison/GestionDemandes.tsx', // Línea 401
];

// Archivos a procesar (sin DialogDescription)
const filesToFix = [
  '/src/app/components/departamentos/FormularioContactoCompacto.tsx',
  '/src/app/components/inventario/DialogCrearOferta.tsx',
  '/src/app/components/inventario/DialogDistribuirProductos.tsx',
  '/src/app/components/inventario/DialogEnviarCocina.tsx',
  '/src/app/components/inventario/EditarEntradaDialog.tsx',
  '/src/app/components/inventario/FormularioContactoEntrepotCompacto.tsx',
  '/src/app/components/inventario/GestionUnidades.tsx',
  '/src/app/components/inventario/CarritoMejorado.tsx',
  '/src/app/components/inventario/ConversionUnidadesDialog.tsx',
  '/src/app/components/inventario/DialogAceptarOferta.tsx',
  '/src/app/components/inventario/ExportacionAvanzada.tsx',
  '/src/app/components/inventario/FormularioEntradaProductoCompacto.tsx',
  '/src/app/components/inventario/GestionVariantes.tsx',
  '/src/app/components/inventario/HistorialProductoDialog.tsx',
  '/src/app/components/inventario/PanierProductos.tsx',
  '/src/app/components/inventario/TransformarProductoDialog.tsx',
  '/src/app/components/inventario/ValidacionEntradasDialog.tsx',
  '/src/app/components/ui/language-selector.tsx',
  '/src/app/components/ui/task-selector.tsx',
  '/src/app/components/cuisine/EtiquetaReceta.tsx',
  '/src/app/components/cuisine/InventarioCocina.tsx',
  '/src/app/components/cuisine/OfertasDisponibles.tsx',
  '/src/app/components/organismos/FormularioOrganismoCompacto.tsx',
  '/src/app/components/organismos/MesDemandes.tsx',
  '/src/app/components/organismos/PerfilOrganismoDialog.tsx',
  '/src/app/components/transporte/FormularioChoferCompacto.tsx',
  '/src/app/components/transporte/FormularioVehiculoCompacto.tsx',
  '/src/app/components/transporte/GestionChoferes.tsx',
  '/src/app/components/transporte/GestionVehiculos.tsx',
  '/src/app/components/transporte/PlanificacionRutas.tsx',
  '/src/app/components/transporte/VerificacionVehiculo.tsx',
  '/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx',
  '/src/app/components/usuarios/GestionDepartamentos.tsx',
  '/src/app/components/usuarios/GestionRoles.tsx',
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  // Eliminar aria-describedby de DialogContent
  content = content.replace(
    /(<DialogContent[^>]*)\s+aria-describedby="[^"]+"/g,
    '$1'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Corregido: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  Sin cambios: ${filePath}`);
    return false;
  }
}

console.log('🔧 Eliminando aria-describedby innecesarios...\n');

let fixed = 0;
let skipped = 0;

filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixed++;
  } else {
    skipped++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Archivos corregidos: ${fixed}`);
console.log(`ℹ️  Archivos sin cambios: ${skipped}`);
console.log('='.repeat(60));

console.log('\n📝 Nota: Los siguientes archivos NO fueron modificados');
console.log('porque SÍ tienen DialogDescription:');
filesWithDescription.forEach(file => {
  console.log(`   - ${file}`);
});