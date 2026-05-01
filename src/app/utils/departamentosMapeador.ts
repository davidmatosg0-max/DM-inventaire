/**
 * Utilidad para mapear departamentos antiguos a los departamentos oficiales del sistema
 * 
 * DEPARTAMENTOS OFICIALES DEL SISTEMA:
 * 1. Entrepôt (Almacén)
 * 2. Comptoir (Mostrador)
 * 3. Cuisine (Cocina)
 * 4. Liaison (Enlace/Coordinación)
 * 5. PTC (Programa Trabajo Comunitario)
 * 6. Maintien (Mantenimiento)
 * 7. Recrutement (Reclutamiento)
 */

// Mapeo de departamentos antiguos a nuevos
export const mapearDepartamentoAntiguo = (departamentoViejo: string): string => {
  const mapeo: Record<string, string> = {
    // Mapeos directos
    'Entrepôt': 'Entrepôt',
    'Comptoir': 'Comptoir',
    'Cuisine': 'Cuisine',
    'Liaison': 'Liaison',
    'PTC': 'PTC',
    'Maintien': 'Maintien',
    'Recrutement': 'Recrutement',
    
    // Mapeos de variantes y sinónimos
    'Entreposage': 'Entrepôt',
    'Almacén': 'Entrepôt',
    'Warehouse': 'Entrepôt',
    
    'Mostrador': 'Comptoir',
    'Counter': 'Comptoir',
    
    'Cocina': 'Cuisine',
    'Kitchen': 'Cuisine',
    
    'Enlace': 'Liaison',
    'Coordinación': 'Liaison',
    'Coordination': 'Liaison',
    
    'Réception et Triage': 'Entrepôt',
    'Réception': 'Entrepôt',
    'Reception': 'Entrepôt',
    
    'Distribution': 'Comptoir',
    'Distribución': 'Comptoir',
    
    'Transport': 'Maintien',
    'Transporte': 'Maintien',
    
    'Administration': 'Recrutement',
    'Administración': 'Recrutement',
    'Recursos Humanos': 'Recrutement',
    'Human Resources': 'Recrutement',
    'RRHH': 'Recrutement'
  };
  
  return mapeo[departamentoViejo] || departamentoViejo;
};

// Obtener lista de departamentos oficiales para selectores
export const obtenerDepartamentosParaSelector = () => {
  return [
    'Entrepôt',
    'Comptoir',
    'Cuisine',
    'Liaison',
    'PTC',
    'Maintien',
    'Recrutement'
  ];
};

// Validar si un departamento es válido
export const esDepartamentoValido = (departamento: string): boolean => {
  const departamentosValidos = obtenerDepartamentosParaSelector();
  return departamentosValidos.includes(departamento);
};

// Obtener color de departamento
export const obtenerColorDepartamento = (departamento: string): string => {
  const colores: Record<string, string> = {
    'Entrepôt': '#1E73BE',
    'Comptoir': '#1E73BE',
    'Cuisine': '#FF9800',
    'Liaison': '#2d9561',
    'PTC': '#9C27B0',
    'Maintien': '#607D8B',
    'Recrutement': '#E91E63'
  };
  
  return colores[departamento] || '#666666';
};

// Obtener icono de departamento
export const obtenerIconoDepartamento = (departamento: string): string => {
  const iconos: Record<string, string> = {
    'Entrepôt': 'Warehouse',
    'Comptoir': 'Apple',
    'Cuisine': 'ChefHat',
    'Liaison': 'Users',
    'PTC': 'Briefcase',
    'Maintien': 'Car',
    'Recrutement': 'UserPlus'
  };
  
  return iconos[departamento] || 'Building2';
};

// Obtener descripción de departamento
export const obtenerDescripcionDepartamento = (departamento: string): string => {
  const descripciones: Record<string, string> = {
    'Entrepôt': 'Gestion des stocks et inventaire',
    'Comptoir': 'Distribution directe aux bénéficiaires',
    'Cuisine': 'Préparation de repas et recettes',
    'Liaison': 'Coordination avec les organismes',
    'PTC': 'Programme de travail communautaire',
    'Maintien': 'Maintenance et entretien',
    'Recrutement': 'Gestion des ressources humaines'
  };
  
  return descripciones[departamento] || '';
};

// Migrar datos de departamento antiguo
export const migrarDatosDepartamento = <T extends { departement?: string; departamento?: string }>(
  objeto: T
): T => {
  const departamentoActual = objeto.departement || objeto.departamento;
  
  if (departamentoActual) {
    const departamentoNuevo = mapearDepartamentoAntiguo(departamentoActual);
    
    return {
      ...objeto,
      departement: departamentoNuevo,
      departamento: departamentoNuevo
    };
  }
  
  return objeto;
};
