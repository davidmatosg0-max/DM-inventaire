// Almacenamiento de idiomas personalizados en localStorage

export interface IdiomaPersonalizado {
  id: string;
  code: string;
  label: string;
  flag: string;
  color: string;
  fechaCreacion: string;
}

const STORAGE_KEY = 'idiomas_personalizados';

// Obtener todos los idiomas personalizados
export function obtenerIdiomasPersonalizados(): IdiomaPersonalizado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener idiomas personalizados:', error);
    return [];
  }
}

// Guardar un nuevo idioma personalizado
export function guardarIdiomaPersonalizado(idioma: Omit<IdiomaPersonalizado, 'id' | 'fechaCreacion'>): IdiomaPersonalizado {
  const idiomas = obtenerIdiomasPersonalizados();
  const nuevoIdioma: IdiomaPersonalizado = {
    ...idioma,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fechaCreacion: new Date().toISOString()
  };
  idiomas.push(nuevoIdioma);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(idiomas));
  return nuevoIdioma;
}

// Actualizar un idioma personalizado
export function actualizarIdiomaPersonalizado(id: string, idioma: Partial<Omit<IdiomaPersonalizado, 'id' | 'fechaCreacion'>>): void {
  const idiomas = obtenerIdiomasPersonalizados();
  const index = idiomas.findIndex(i => i.id === id);
  if (index !== -1) {
    idiomas[index] = { ...idiomas[index], ...idioma };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(idiomas));
  }
}

// Eliminar un idioma personalizado
export function eliminarIdiomaPersonalizado(id: string): void {
  const idiomas = obtenerIdiomasPersonalizados();
  const idiomasFiltrados = idiomas.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(idiomasFiltrados));
}

// Verificar si un código de idioma ya existe
export function existeCodigoIdioma(code: string, idiomasPredeterminados: string[]): boolean {
  const personalizados = obtenerIdiomasPersonalizados();
  const codigosPersonalizados = personalizados.map(i => i.code.toLowerCase());
  const codigosPredeterminados = idiomasPredeterminados.map(c => c.toLowerCase());
  
  return codigosPredeterminados.includes(code.toLowerCase()) || 
         codigosPersonalizados.includes(code.toLowerCase());
}
