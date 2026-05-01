export interface Departamento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
  contacto?: {
    nombre: string;
    email: string;
    telefono: string;
    cargo: string;
    foto?: string;
  };
}

const STORAGE_KEY = 'departamentos_banco_alimentos';

// Departamentos de ejemplo basados en la imagen
const departamentosEjemplo: Departamento[] = [
  {
    id: '1',
    codigo: 'ENTREPOT',
    nombre: 'Entrepôt',
    descripcion: 'Gestion des stocks et inventaire',
    icono: 'Warehouse',
    color: '#1E73BE',
    activo: true,
    orden: 1
  },
  {
    id: '2',
    codigo: 'COMPTOIR',
    nombre: 'Comptoir',
    descripcion: 'Distribution directe aux bénéficiaires',
    icono: 'Apple',
    color: '#1E73BE',
    activo: true,
    orden: 2
  },
  {
    id: '3',
    codigo: 'CUISINE',
    nombre: 'Cuisine',
    descripcion: 'Préparation de repas et recettes',
    icono: 'ChefHat',
    color: '#1E73BE',
    activo: true,
    orden: 3
  },
  {
    id: '4',
    codigo: 'LIAISON',
    nombre: 'Liaison',
    descripcion: 'Coordination avec les organismes',
    icono: 'Users',
    color: '#1E73BE',
    activo: true,
    orden: 4
  },
  {
    id: '5',
    codigo: 'PTC',
    nombre: 'PTC',
    descripcion: 'Programme de travail communautaire',
    icono: 'Briefcase',
    color: '#1E73BE',
    activo: true,
    orden: 5
  },
  {
    id: '6',
    codigo: 'MAINTIEN',
    nombre: 'Maintien',
    descripcion: 'Maintenance et entretien',
    icono: 'Car',
    color: '#1E73BE',
    activo: true,
    orden: 6
  },
  {
    id: '7',
    codigo: 'RECRUTEMENT',
    nombre: 'Recrutement',
    descripcion: 'Gestion des ressources humaines',
    icono: 'UserPlus',
    color: '#1E73BE',
    activo: true,
    orden: 7
  }
];

export function inicializarDepartamentos(): void {
  const departamentosGuardados = localStorage.getItem(STORAGE_KEY);
  if (!departamentosGuardados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departamentosEjemplo));
  } else {
    // Migración: Actualizar ícono de Cuisine si aún usa Utensils
    const departamentos = JSON.parse(departamentosGuardados);
    let needsUpdate = false;
    
    const departamentosActualizados = departamentos.map((dep: Departamento) => {
      if (dep.codigo === 'CUISINE' && dep.icono === 'Utensils') {
        needsUpdate = true;
        return { ...dep, icono: 'ChefHat' };
      }
      return dep;
    });
    
    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departamentosActualizados));
    }
  }
}

export function obtenerDepartamentos(): Departamento[] {
  const departamentosGuardados = localStorage.getItem(STORAGE_KEY);
  if (departamentosGuardados !== null) {
    const departamentos = JSON.parse(departamentosGuardados);
    return departamentos.sort((a: Departamento, b: Departamento) => a.orden - b.orden);
  } else {
    // Solo inicializar la primera vez
    inicializarDepartamentos();
    const nuevos = localStorage.getItem(STORAGE_KEY);
    const departamentos = nuevos ? JSON.parse(nuevos) : [];
    return departamentos.sort((a: Departamento, b: Departamento) => a.orden - b.orden);
  }
}

export function obtenerDepartamentoPorId(id: string): Departamento | undefined {
  const departamentos = obtenerDepartamentos();
  return departamentos.find(d => d.id === id);
}

export function guardarDepartamento(departamento: Omit<Departamento, 'id'>): Departamento {
  const departamentos = obtenerDepartamentos();
  // Generar un ID único más robusto
  const nuevoDepartamento: Departamento = {
    ...departamento,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  departamentos.push(nuevoDepartamento);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(departamentos));
  return nuevoDepartamento;
}

export function actualizarDepartamento(id: string, departamentoActualizado: Partial<Departamento>): boolean {
  const departamentos = obtenerDepartamentos();
  const index = departamentos.findIndex(d => d.id === id);
  
  if (index !== -1) {
    departamentos[index] = {
      ...departamentos[index],
      ...departamentoActualizado
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departamentos));
    return true;
  }
  return false;
}

export function eliminarDepartamento(id: string): boolean {
  const departamentos = obtenerDepartamentos();
  const departamentosFiltrados = departamentos.filter(d => d.id !== id);
  
  if (departamentosFiltrados.length < departamentos.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departamentosFiltrados));
    return true;
  }
  return false;
}

export function cambiarEstadoDepartamento(id: string, activo: boolean): boolean {
  return actualizarDepartamento(id, { activo });
}