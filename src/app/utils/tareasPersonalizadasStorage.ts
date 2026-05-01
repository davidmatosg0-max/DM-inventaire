// Almacenamiento de tareas personalizadas en localStorage

export interface TareaPersonalizada {
  id: string;
  code: string;
  label: string;
  icon: string;
  color: string;
  departamentoId?: string; // Asociar tareas a departamentos específicos
  tipoContacto?: string; // NUEVO: Asociar tareas predeterminadas por tipo de contacto (donateur, fournisseur, benevole, etc.)
}

const STORAGE_KEY = 'tareasPersonalizadas';

// Obtener tareas filtradas por departamento y tipo de contacto
export function obtenerTareasPersonalizadas(departamentoId?: string, tipoContacto?: string): TareaPersonalizada[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const todasTareas = data ? JSON.parse(data) : [];
    
    // Filtrar por departamento y tipo de contacto
    return todasTareas.filter((t: TareaPersonalizada) => {
      // Si tiene tipoContacto específico, solo mostrarlo para ese tipo
      if (t.tipoContacto && tipoContacto && t.tipoContacto !== tipoContacto) {
        return false;
      }
      
      // Filtro por departamento (tareas globales o del departamento específico)
      if (departamentoId) {
        return !t.departamentoId || t.departamentoId === departamentoId;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error al obtener tareas personalizadas:', error);
    return [];
  }
}

export function guardarTareaPersonalizada(
  tarea: Omit<TareaPersonalizada, 'id'>, 
  departamentoId?: string, 
  tipoContacto?: string
): void {
  try {
    const tareas = obtenerTodasTareas(); // Obtener todas las tareas sin filtro
    const nuevaTarea: TareaPersonalizada = {
      ...tarea,
      id: `tarea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      departamentoId, // Asociar al departamento
      tipoContacto // NUEVO: Asociar al tipo de contacto
    };
    tareas.push(nuevaTarea);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al guardar tarea personalizada:', error);
  }
}

// NUEVO: Función auxiliar para obtener todas las tareas sin filtros
function obtenerTodasTareas(): TareaPersonalizada[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener todas las tareas:', error);
    return [];
  }
}

export function actualizarTareaPersonalizada(id: string, tareaActualizada: Omit<TareaPersonalizada, 'id'>): void {
  try {
    const tareas = obtenerTodasTareas();
    const index = tareas.findIndex(t => t.id === id);
    if (index !== -1) {
      tareas[index] = { ...tareaActualizada, id, departamentoId: tareas[index].departamentoId, tipoContacto: tareas[index].tipoContacto };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    }
  } catch (error) {
    console.error('Error al actualizar tarea personalizada:', error);
  }
}

export function eliminarTareaPersonalizada(id: string): void {
  try {
    const tareas = obtenerTodasTareas();
    const tareasFiltradas = tareas.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareasFiltradas));
  } catch (error) {
    console.error('Error al eliminar tarea personalizada:', error);
  }
}

export function existeCodigoTarea(codigo: string, codigosPredefinidos: string[]): boolean {
  const tareas = obtenerTodasTareas();
  const todosLosCodigos = [
    ...codigosPredefinidos,
    ...tareas.map(t => t.code)
  ];
  return todosLosCodigos.includes(codigo);
}

// NUEVO: Función para actualizar/sobrescribir tarea predeterminada del sistema por tipo de contacto
export function guardarTareaPredeterminadaPorTipo(
  codeOriginal: string,
  nuevaTarea: Omit<TareaPersonalizada, 'id'>,
  tipoContacto: string
): void {
  try {
    const tareas = obtenerTodasTareas();
    
    // Buscar si ya existe una versión personalizada para este código y tipo de contacto
    const indexExistente = tareas.findIndex(t => 
      t.code === nuevaTarea.code && t.tipoContacto === tipoContacto
    );
    
    if (indexExistente !== -1) {
      // Actualizar la existente
      tareas[indexExistente] = {
        ...nuevaTarea,
        id: tareas[indexExistente].id,
        tipoContacto
      };
    } else {
      // Crear nueva tarea predeterminada para este tipo
      const tareaNueva: TareaPersonalizada = {
        ...nuevaTarea,
        id: `tarea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tipoContacto
      };
      tareas.push(tareaNueva);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al guardar tarea predeterminada por tipo:', error);
  }
}