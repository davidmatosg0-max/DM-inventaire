// Datos compartidos de configuración del sistema

export type ProgramaEntrada = {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  color: string;
  activo: boolean;
  icono?: string;
};

// Pesos unitarios por tipo de unidad
export type PesosUnidad = {
  PLT?: number; // Paleta
  CJA?: number; // Caja
  UND?: number; // Unidad
  SAC?: number; // Saco
  BN?: number;  // Bac Noir
  kg?: number;  // Kilogramo
};

// Variante de una subcategoría (diferentes presentaciones del mismo producto)
export type Variante = {
  id: string;
  nombre: string; // Ej: "Grande", "500ml", "Marca A", "Orgánico"
  codigo?: string; // Código específico de la variante
  icono?: string;
  activa: boolean;
  unidad?: string; // Unidad de medida específica de esta variante (Paleta, Caja, Unidad, Saco, etc.)
  valorPorKg?: number; // Valor específico si difiere del producto base
  pesoUnitario?: number; // Peso específico de esta variante
  pesosUnidad?: PesosUnidad; // Pesos específicos para esta variante
  descripcion?: string;
  stockMinimo?: number; // Stock mínimo para alertas
};

export type Subcategoria = {
  id: string;
  nombre: string;
  icono?: string;
  activa: boolean;
  valorPorKg?: number;
  unidad?: string; // Unidad de medida por defecto (PLT, CJA, UND, SAC, BN, kg)
  pesoUnitario?: number; // DEPRECATED: Peso en kg de una unidad (mantener por compatibilidad)
  pesosUnidad?: PesosUnidad; // Nuevo: Pesos específicos para cada tipo de unidad
  descripcion?: string;
  variantes?: Variante[]; // Variantes del producto (opcional)
  stockMinimo?: number; // Stock mínimo para alertas
};

export type Categoria = {
  id: string;
  nombre: string;
  icono: string;
  activa: boolean;
  valorPorKg?: number;
  valorMonetario?: number; // Valor monetario base de la categoría (CAD$ por kg)
  subcategorias?: Subcategoria[];
  color?: string;
  descripcion?: string;
};

export const programasEntradaIniciales: ProgramaEntrada[] = [];

export const categoriasIniciales: Categoria[] = [];