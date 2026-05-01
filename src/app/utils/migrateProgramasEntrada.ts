/**
 * 🔧 MIGRACIÓN DE PROGRAMAS DE ENTRADA
 * Corrige y estandariza los códigos de los programas de entrada
 * 
 * REGLAS DEFINITIVAS:
 * - DON = Todos los donadores (isDonateur=true)
 * - ACHAT = Todos los proveedores (isFournisseur=true)
 * - OCC = TODOS los partenaires (isDonateur=true OR isFournisseur=true)
 * - PRS = Solo participantes PRS (participaPRS=true)
 */

import { type ProgramaEntrada } from '../data/configuracionData';

const STORAGE_KEY = 'bancoAlimentos_programasEntrada';
const MIGRATION_FLAG = 'migracion_programas_entrada_v2';

/**
 * Programas estándar correctos
 */
const PROGRAMAS_ESTANDAR: ProgramaEntrada[] = [
  {
    id: 'prog-don',
    nombre: 'DON',
    codigo: 'DON',
    descripcion: 'Dons des donateurs exclusifs',
    color: '#2d9561',
    activo: true,
    icono: '🎁'
  },
  {
    id: 'prog-achat',
    nombre: 'ACHAT',
    codigo: 'ACH',
    descripcion: 'Achats auprès de fournisseurs exclusifs',
    color: '#1a4d7a',
    activo: true,
    icono: '🛒'
  },
  {
    id: 'prog-occ',
    nombre: 'OCC',
    codigo: 'OCC',
    descripcion: 'Achats occasionnels (tous fournisseurs)',
    color: '#f59e0b',
    activo: true,
    icono: '📦'
  },
  {
    id: 'prog-prs',
    nombre: 'PRS',
    codigo: 'PRS',
    descripcion: 'Programme de Récupération en Supermarchés',
    color: '#8b5cf6',
    activo: true,
    icono: '🏪'
  }
];

/**
 * Verifica si la migración ya se ejecutó
 */
export const yaMigradoProgramas = (): boolean => {
  return localStorage.getItem(MIGRATION_FLAG) === 'true';
};

/**
 * Marca la migración como ejecutada
 */
export const marcarMigracionProgramas = (): void => {
  localStorage.setItem(MIGRATION_FLAG, 'true');
};

/**
 * Ejecuta la migración de programas
 */
export const migrarProgramasEntrada = (): boolean => {
  try {
    console.log('🔧 Iniciando migración de programas de entrada...');
    
    // Obtener programas actuales
    const stored = localStorage.getItem(STORAGE_KEY);
    let programasActuales: ProgramaEntrada[] = [];
    
    if (stored) {
      try {
        programasActuales = JSON.parse(stored);
        console.log('📋 Programas actuales:', programasActuales);
      } catch (error) {
        console.error('❌ Error al parsear programas actuales:', error);
        programasActuales = [];
      }
    }
    
    // Crear un mapa de programas existentes por nombre
    const mapaExistentes = new Map<string, ProgramaEntrada>();
    programasActuales.forEach(p => {
      mapaExistentes.set(p.nombre.toUpperCase(), p);
    });
    
    // Migrar o crear programas estándar
    const programasMigrados: ProgramaEntrada[] = [];
    let cambios = false;
    
    PROGRAMAS_ESTANDAR.forEach(programaEstandar => {
      const existente = mapaExistentes.get(programaEstandar.nombre.toUpperCase());
      
      if (existente) {
        // Programa existe - verificar si necesita corrección
        if (existente.codigo.toUpperCase() !== programaEstandar.codigo.toUpperCase()) {
          console.log(`🔄 Corrigiendo código de ${existente.nombre}: "${existente.codigo}" → "${programaEstandar.codigo}"`);
          cambios = true;
        }
        
        // Usar el ID existente pero actualizar datos
        programasMigrados.push({
          ...programaEstandar,
          id: existente.id, // Preservar ID original
          activo: existente.activo // Preservar estado activo
        });
      } else {
        // Programa no existe - crear nuevo
        console.log(`➕ Creando programa nuevo: ${programaEstandar.nombre} (${programaEstandar.codigo})`);
        programasMigrados.push(programaEstandar);
        cambios = true;
      }
    });
    
    // Agregar programas personalizados que no están en estándar
    programasActuales.forEach(p => {
      const esEstandar = PROGRAMAS_ESTANDAR.some(
        pe => pe.nombre.toUpperCase() === p.nombre.toUpperCase()
      );
      
      if (!esEstandar) {
        console.log(`📌 Preservando programa personalizado: ${p.nombre} (${p.codigo})`);
        programasMigrados.push(p);
      }
    });
    
    if (cambios || programasActuales.length === 0) {
      // Guardar programas migrados
      localStorage.setItem(STORAGE_KEY, JSON.stringify(programasMigrados));
      console.log('✅ Migración completada. Programas actualizados:');
      console.table(programasMigrados.map(p => ({
        Nombre: p.nombre,
        Código: p.codigo,
        'Código Lower': p.codigo.toLowerCase(),
        Descripción: p.descripcion,
        Activo: p.activo
      })));
      return true;
    } else {
      console.log('✅ Programas ya están correctos, no se necesitan cambios');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error en migración de programas:', error);
    return false;
  }
};

/**
 * Resetea la migración (para testing)
 */
export const resetearMigracionProgramas = (): void => {
  localStorage.removeItem(MIGRATION_FLAG);
  console.log('🔄 Flag de migración de programas reseteado');
};

// 🆘 FUNCIÓN DE EMERGENCIA: Ejecutar migración manualmente desde consola
(window as any).migrarProgramasManual = () => {
  console.log('🔧 Ejecutando migración manual de programas...');
  
  // Resetear flag de migración
  resetearMigracionProgramas();
  
  // Ejecutar migración
  const resultado = migrarProgramasEntrada();
  
  if (resultado) {
    marcarMigracionProgramas();
    console.log('✅ Migración completada. RECARGA LA PÁGINA para ver los cambios.');
  } else {
    marcarMigracionProgramas();
    console.log('✅ Programas ya estaban correctos.');
  }
};

// 🆘 FUNCIÓN DE EMERGENCIA: Forzar programas estándar
(window as any).forzarProgramasEstandar = () => {
  console.log('⚠️ FORZANDO programas estándar (se perderán personalizaciones)...');
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(PROGRAMAS_ESTANDAR));
  resetearMigracionProgramas();
  marcarMigracionProgramas();
  
  console.log('✅ Programas estándar aplicados:');
  console.table(PROGRAMAS_ESTANDAR.map(p => ({
    Nombre: p.nombre,
    Código: p.codigo,
    Descripción: p.descripcion,
    Activo: p.activo
  })));
  console.log('🔄 RECARGA LA PÁGINA para ver los cambios.');
};

console.log('🆘 Funciones de emergencia cargadas:');
console.log('  - migrarProgramasManual()');
console.log('  - forzarProgramasEstandar()');
console.log('  - verProgramasEntrada()');
