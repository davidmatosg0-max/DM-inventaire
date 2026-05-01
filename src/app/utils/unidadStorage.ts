// Utilidad para gestionar unidades de medida en localStorage

export type Unidad = {
  id: string;
  nombre: string;
  abreviatura: string;
  icono?: string;
  pesoUnidad?: number; // Peso de la unidad vacía en kg (tara)
};

const STORAGE_KEY = 'banco_alimentos_unidades';

// Unidades por defecto
const unidadesIniciales: Unidad[] = [
  { id: '1', nombre: 'Paleta', abreviatura: 'PLT', icono: '📦' },
  { id: '2', nombre: 'Caja', abreviatura: 'CJA', icono: '📦' },
  { id: '3', nombre: 'Unidad', abreviatura: 'UND', icono: '🏷️' },
  { id: '4', nombre: 'Saco', abreviatura: 'SAC', icono: '💼' },
  { id: '5', nombre: 'Bac Noir', abreviatura: 'BN', icono: '⚫' },
  { id: '6', nombre: 'Kilogramo', abreviatura: 'kg', icono: '⚖️' },
  { id: '7', nombre: 'Benne de plastique', abreviatura: 'BNN-P', icono: '🗑️' },
  { id: '8', nombre: 'Benne de bois', abreviatura: 'BNN-B', icono: '🪵' },
];

// Inicializar unidades si no existen
export function inicializarUnidades(): void {
  if (typeof window === 'undefined') return;
  
  const unidadesExistentes = localStorage.getItem(STORAGE_KEY);
  if (!unidadesExistentes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unidadesIniciales));
  } else {
    // Migración: Agregar nuevas unidades benne si no existen
    try {
      const unidades = JSON.parse(unidadesExistentes) as Unidad[];
      let actualizado = false;
      
      // Verificar y agregar Benne de plastique
      if (!unidades.find(u => u.id === '7' || u.abreviatura === 'BNN-P')) {
        unidades.push({ id: '7', nombre: 'Benne de plastique', abreviatura: 'BNN-P', icono: '🗑️' });
        actualizado = true;
      }
      
      // Verificar y agregar Benne de bois
      if (!unidades.find(u => u.id === '8' || u.abreviatura === 'BNN-B')) {
        unidades.push({ id: '8', nombre: 'Benne de bois', abreviatura: 'BNN-B', icono: '🪵' });
        actualizado = true;
      }
      
      if (actualizado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unidades));
        console.log('✅ Unidades benne agregadas exitosamente');
      }
    } catch (error) {
      console.error('Error en migración de unidades:', error);
    }
  }
}

// Obtener todas las unidades
export function obtenerUnidades(): Unidad[] {
  if (typeof window === 'undefined') return unidadesIniciales;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      inicializarUnidades();
      return unidadesIniciales;
    }
    
    const unidades = JSON.parse(data) as Unidad[];
    return unidades;
  } catch (error) {
    console.error('Error al obtener unidades:', error);
    return unidadesIniciales;
  }
}

// Guardar o actualizar una unidad
export function guardarUnidad(unidad: Unidad): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const unidades = obtenerUnidades();
    const index = unidades.findIndex(u => u.id === unidad.id);
    
    if (index >= 0) {
      // Actualizar existente
      unidades[index] = unidad;
    } else {
      // Agregar nueva
      unidades.push(unidad);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unidades));
    
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('unidadesActualizadas', { detail: unidades }));
    
    return true;
  } catch (error) {
    console.error('Error al guardar unidad:', error);
    return false;
  }
}

// Eliminar una unidad
export function eliminarUnidad(id: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const unidades = obtenerUnidades();
    const unidadesFiltradas = unidades.filter(u => u.id !== id);
    
    if (unidadesFiltradas.length === unidades.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unidadesFiltradas));
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('unidadesActualizadas', { detail: unidadesFiltradas }));
    
    return true;
  } catch (error) {
    console.error('Error al eliminar unidad:', error);
    return false;
  }
}

// Obtener una unidad por ID
export function obtenerUnidadPorId(id: string): Unidad | null {
  const unidades = obtenerUnidades();
  return unidades.find(u => u.id === id) || null;
}

// Obtener una unidad por abreviatura
export function obtenerUnidadPorAbreviatura(abreviatura: string): Unidad | null {
  const unidades = obtenerUnidades();
  return unidades.find(u => u.abreviatura.toUpperCase() === abreviatura.toUpperCase()) || null;
}

// Validar si una abreviatura ya existe (excepto para el ID especificado)
export function existeAbreviatura(abreviatura: string, excluirId?: string): boolean {
  const unidades = obtenerUnidades();
  return unidades.some(u => 
    u.abreviatura.toUpperCase() === abreviatura.toUpperCase() && 
    u.id !== excluirId
  );
}

// Exportar unidades como array para selectores
export function obtenerUnidadesParaSelector(): { id: string; nombre: string; abreviatura: string }[] {
  const unidades = obtenerUnidades();
  return unidades.map(u => ({
    id: u.id,
    nombre: u.nombre,
    abreviatura: u.abreviatura
  }));
}