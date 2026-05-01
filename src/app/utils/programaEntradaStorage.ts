/**
 * Sistema de Almacenamiento de Programas de Entrada
 * Gestiona el almacenamiento persistente en localStorage de programas de entrada
 */

import { programasEntradaIniciales, type ProgramaEntrada } from '../data/configuracionData';

const STORAGE_KEY = 'bancoAlimentos_programasEntrada';

/**
 * Inicializa el almacenamiento con datos por defecto si no existen
 */
function inicializarStorage(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programasEntradaIniciales));
  } else {
    // Sincronizar nuevos programas desde programasEntradaIniciales
    sincronizarProgramas();
  }
}

/**
 * Sincroniza programas nuevos desde programasEntradaIniciales al localStorage existente
 */
function sincronizarProgramas(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  
  try {
    const programasGuardados: ProgramaEntrada[] = JSON.parse(stored);
    const idsExistentes = new Set(programasGuardados.map(p => p.id));
    
    // Agregar programas nuevos que no existen en localStorage
    let cambios = false;
    programasEntradaIniciales.forEach(programaInicial => {
      if (!idsExistentes.has(programaInicial.id)) {
        programasGuardados.push(programaInicial);
        cambios = true;
      } else {
        // Actualizar icono de programas existentes si cambió
        const programaExistente = programasGuardados.find(p => p.id === programaInicial.id);
        if (programaExistente && programaExistente.icono !== programaInicial.icono) {
          programaExistente.icono = programaInicial.icono;
          cambios = true;
        }
      }
    });
    
    // Guardar solo si hubo cambios
    if (cambios) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(programasGuardados));
    }
  } catch (error) {
    console.error('Error al sincronizar programas:', error);
  }
}

/**
 * Obtiene todos los programas de entrada desde localStorage
 */
export function obtenerProgramasEntrada(): ProgramaEntrada[] {
  inicializarStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return programasEntradaIniciales;
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error al parsear programas de entrada:', error);
    return programasEntradaIniciales;
  }
}

/**
 * Guarda un nuevo programa de entrada
 */
export function guardarProgramaEntrada(programa: Omit<ProgramaEntrada, 'id'>): ProgramaEntrada {
  const programas = obtenerProgramasEntrada();
  
  const nuevoPrograma: ProgramaEntrada = {
    id: Date.now().toString(),
    ...programa
  };
  
  programas.push(nuevoPrograma);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programas));
  
  // Disparar evento de actualización
  window.dispatchEvent(new Event('programas-actualizados'));
  
  return nuevoPrograma;
}

/**
 * Actualiza un programa de entrada existente
 */
export function actualizarProgramaEntrada(id: string, datos: Partial<ProgramaEntrada>): ProgramaEntrada | null {
  const programas = obtenerProgramasEntrada();
  const index = programas.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  programas[index] = { ...programas[index], ...datos };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programas));
  
  // Disparar evento de actualización
  window.dispatchEvent(new Event('programas-actualizados'));
  
  return programas[index];
}

/**
 * Elimina un programa de entrada
 */
export function eliminarProgramaEntrada(id: string): boolean {
  const programas = obtenerProgramasEntrada();
  const filtered = programas.filter(p => p.id !== id);
  
  if (filtered.length === programas.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  // Disparar evento de actualización
  window.dispatchEvent(new Event('programas-actualizados'));
  
  return true;
}

/**
 * Obtiene programas de entrada activos
 */
export function obtenerProgramasActivos(): ProgramaEntrada[] {
  return obtenerProgramasEntrada().filter(p => p.activo);
}

/**
 * Obtiene un programa de entrada por código
 */
export function obtenerProgramaPorCodigo(codigo: string): ProgramaEntrada | null {
  const programas = obtenerProgramasEntrada();
  return programas.find(p => p.codigo.toLowerCase() === codigo.toLowerCase()) || null;
}

/**
 * Obtiene un programa de entrada por ID
 */
export function obtenerProgramaPorId(id: string): ProgramaEntrada | null {
  const programas = obtenerProgramasEntrada();
  return programas.find(p => p.id === id) || null;
}

/**
 * Obtiene los tipos de entrada disponibles (códigos en minúscula)
 * Estos son los valores válidos para el campo tipoEntrada en EntradaInventario
 */
export function obtenerTiposEntradaDisponibles(): string[] {
  const programas = obtenerProgramasActivos();
  return programas.map(p => p.codigo.toLowerCase());
}

/**
 * Valida si un tipo de entrada es válido
 */
export function estipoEntradaValido(tipoEntrada: string): boolean {
  const tiposValidos = obtenerTiposEntradaDisponibles();
  return tiposValidos.includes(tipoEntrada.toLowerCase());
}

/**
 * Obtiene la información completa de un programa basándose en el tipo de entrada
 */
export function obtenerProgramaPorTipoEntrada(tipoEntrada: string): ProgramaEntrada | null {
  const programas = obtenerProgramasActivos();
  return programas.find(p => p.codigo.toLowerCase() === tipoEntrada.toLowerCase()) || null;
}

/**
 * Limpiar todos los programas de entrada del localStorage
 */
export function limpiarProgramasEntrada(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Programas de entrada limpiados del localStorage');
  } catch (error) {
    console.error('Error al limpiar programas de entrada:', error);
  }
}

// 🆘 FUNCIÓN DE DEBUG: Ver programas en consola
(window as any).verProgramasEntrada = () => {
  const programas = obtenerProgramasEntrada();
  console.log('📋 PROGRAMAS DE ENTRADA CONFIGURADOS:');
  console.table(programas.map(p => ({
    ID: p.id,
    Nombre: p.nombre,
    Código: p.codigo,
    'Código Lower': p.codigo.toLowerCase(),
    Descripción: p.descripcion,
    Color: p.color,
    Icono: p.icono,
    Activo: p.activo
  })));
  return programas;
};

console.log('🆘 Función de debug cargada: verProgramasEntrada()');