#!/usr/bin/env node

/**
 * Script para corregir problemas de accesibilidad en DialogContent
 * 
 * Este script:
 * 1. Busca patrones de DialogContent con aria-describedby
 * 2. Busca DialogDescription con id explícito  
 * 3. Elimina aria-describedby de DialogContent cuando hay DialogDescription
 * 4. Elimina id de DialogDescription (se maneja automáticamente)
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  '/src/app/components/pages/Departamentos.tsx',
  '/src/app/components/pages/EmailOrganismos.tsx',
  '/src/app/components/pages/Etiquetas.tsx',
  '/src/app/components/pages/GestionRolesPermisos.tsx',
  '/src/app/components/pages/ModeloComanda.tsx',
  '/src/app/components/pages/OfertasOrganismo.tsx',
  '/src/app/components/pages/Organismos.tsx',
  '/src/app/components/pages/Usuarios.tsx',
  '/src/app/components/pages/UsuariosInternos.tsx',
  '/src/app/components/pages/VistaPublicaOrganismo_fix.tsx',
  '/src/app/components/EntradaDonAchat.tsx',
  '/src/app/components/benevoles/FormularioNouveauBenevole.tsx',
  '/src/app/components/comptoir/FormularioBeneficiarioCompacto.tsx',
  '/src/app/components/departamentos/FormularioContactoCompacto.tsx',
  '/src/app/components/inventario/FormularioContactoEntrepotCompacto.tsx',
  '/src/app/components/inventario/FormularioEntradaProductoCompacto.tsx',
  '/src/app/components/inventario/PanierProductos.tsx',
  '/src/app/components/organismos/FormularioOrganismoCompacto.tsx',
  '/src/app/components/organismos/PerfilOrganismoDialog.tsx',
  '/src/app/components/transporte/FormularioChoferCompacto.tsx',
  '/src/app/components/transporte/FormularioVehiculoCompacto.tsx',
  '/src/app/components/usuarios/FormularioUsuarioInternoCompacto.tsx',
];

function fixDialogAccessibility(content) {
  // Patrón 1: DialogContent con aria-describedby seguido de DialogDescription con id
  // Captura el aria-describedby y el id para removerlos
  const pattern1 = /(<DialogContent[^>]*)\s+aria-describedby="([^"]+)"([^>]*>[\s\S]*?<DialogDescription)\s+id="\2"/g;
  content = content.replace(pattern1, '$1$3');
  
  // Patrón 2: DialogDescription con id pero sin el aria-describedby anterior (casos individuales)
  // Nota: Solo eliminar id si está dentro de un Dialog que ya tiene DialogContent sin aria-describedby
  const pattern2 = /(<DialogDescription)\s+id="[^"]+"(\s|>)/g;
  content = content.replace(pattern2, '$1$2');
  
  return content;
}

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const fixedContent = fixDialogAccessibility(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Sin cambios: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Iniciando corrección de accesibilidad de Dialog...\n');
  
  let fixed = 0;
  let unchanged = 0;
  let errors = 0;
  
  for (const file of filesToFix) {
    const result = processFile(file);
    if (result === true) fixed++;
    else if (result === false) unchanged++;
    else errors++;
  }
  
  console.log('\n📊 Resumen:');
  console.log(`   ✅ Archivos corregidos: ${fixed}`);
  console.log(`   ℹ️  Sin cambios: ${unchanged}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Total procesados: ${filesToFix.length}`);
}

main();
