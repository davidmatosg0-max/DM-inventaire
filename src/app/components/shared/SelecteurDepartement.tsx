import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';
import { Building2 } from 'lucide-react';

interface SelecteurDepartementProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  incluirTodos?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Selector de Departamentos
 * 
 * Componente reutilizable que carga automáticamente los departamentos oficiales del sistema
 * y los presenta en un selector (dropdown).
 * 
 * USO:
 * ```tsx
 * <SelecteurDepartement
 *   value={formData.departamento}
 *   onValueChange={(value) => setFormData({ ...formData, departamento: value })}
 *   placeholder="Sélectionner un département"
 *   incluirTodos={false}
 * />
 * ```
 */
export function SelecteurDepartement({
  value,
  onValueChange,
  placeholder = 'Sélectionner un département',
  incluirTodos = false,
  required = false,
  disabled = false,
  className = ''
}: SelecteurDepartementProps) {
  const departamentos = obtenerDepartamentos();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {incluirTodos && (
          <SelectItem value="all">
            Tous les départements
          </SelectItem>
        )}
        {departamentos.map((dept) => (
          <SelectItem key={dept.id} value={dept.nombre}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" style={{ color: dept.color }} />
              <span>{dept.nombre}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Hook para obtener departamentos
 * 
 * USO:
 * ```tsx
 * const departamentos = useDepartamentos();
 * ```
 */
export function useDepartamentos() {
  return obtenerDepartamentos();
}

/**
 * Hook para obtener solo los nombres de departamentos
 * 
 * USO:
 * ```tsx
 * const nombresDepartamentos = useNombresDepartamentos();
 * ```
 */
export function useNombresDepartamentos() {
  const departamentos = obtenerDepartamentos();
  return departamentos.map(d => d.nombre);
}
