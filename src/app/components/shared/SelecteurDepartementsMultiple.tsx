import React from 'react';
import { Check, Building2 } from 'lucide-react';
import { Label } from '../ui/label';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';

interface SelecteurDepartementsMultipleProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  showCounter?: boolean;
  showPills?: boolean;
  gridCols?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'ultra-compact';
}

export function SelecteurDepartementsMultiple({
  selectedIds = [],
  onChange,
  label = 'Départements affectés',
  showCounter = true,
  showPills = true,
  gridCols = 2,
  variant = 'default'
}: SelecteurDepartementsMultipleProps) {
  const branding = useBranding();
  const departamentos = obtenerDepartamentos()
    .filter(dept => dept.activo)
    .sort((a, b) => a.orden - b.orden);

  const handleToggle = (deptId: string) => {
    const newIds = selectedIds.includes(deptId)
      ? selectedIds.filter(id => id !== deptId)
      : [...selectedIds, deptId];
    onChange(newIds);
  };

  if (variant === 'compact') {
    // Versión compacta con pills
    return (
      <div>
        <Label className="text-xs mb-2 block flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} />
          {label}
        </Label>
        <div className="flex flex-wrap gap-2">
          {departamentos.map(dept => {
            const isSelected = selectedIds.includes(dept.id);
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleToggle(dept.id)}
                className={`
                  group relative px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 ease-in-out
                  flex items-center gap-1.5
                  ${isSelected 
                    ? 'shadow-md scale-105' 
                    : 'hover:scale-105 hover:shadow-sm border border-gray-200'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? dept.color : 'white',
                  color: isSelected ? 'white' : dept.color,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <span 
                  className={`
                    w-1.5 h-1.5 rounded-full transition-all duration-200
                    ${isSelected ? 'bg-white' : ''}
                  `}
                  style={{
                    backgroundColor: isSelected ? 'white' : dept.color
                  }}
                />
                <span className="leading-none">{dept.nombre}</span>
                {isSelected && (
                  <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
        {showCounter && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: branding.primaryColor }}>
            <div className="flex items-center gap-1">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center font-semibold text-white text-[10px]"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {selectedIds.length}
              </div>
              <span className="font-medium">
                Département{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'ultra-compact') {
    // Versión ultra compacta con pills
    return (
      <div>
        <Label className="text-xs mb-2 block flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5" style={{ color: branding.primaryColor }} />
          {label}
        </Label>
        <div className="flex flex-wrap gap-2">
          {departamentos.map(dept => {
            const isSelected = selectedIds.includes(dept.id);
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleToggle(dept.id)}
                className={`
                  group relative px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 ease-in-out
                  flex items-center gap-1.5
                  ${isSelected 
                    ? 'shadow-md scale-105' 
                    : 'hover:scale-105 hover:shadow-sm border border-gray-200'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? dept.color : 'white',
                  color: isSelected ? 'white' : dept.color,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <span 
                  className={`
                    w-1.5 h-1.5 rounded-full transition-all duration-200
                    ${isSelected ? 'bg-white' : ''}
                  `}
                  style={{
                    backgroundColor: isSelected ? 'white' : dept.color
                  }}
                />
                <span className="leading-none">{dept.nombre}</span>
                {isSelected && (
                  <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
        {showCounter && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: branding.primaryColor }}>
            <div className="flex items-center gap-1">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center font-semibold text-white text-[10px]"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {selectedIds.length}
              </div>
              <span className="font-medium">
                Département{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        )}
      </div>
    );
  }

  // Versión por defecto con cards grandes
  return (
    <div>
      <Label className="text-xs mb-3 block flex items-center gap-2">
        <Building2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
        <span className="font-semibold">{label}</span>
      </Label>
      
      {/* Grid de Departamentos */}
      <div className={`grid grid-cols-${gridCols} gap-3`}>
        {departamentos.map(dept => {
          const isSelected = selectedIds.includes(dept.id);
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => handleToggle(dept.id)}
              className={`
                group relative overflow-hidden
                px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                flex items-center gap-3
                ${isSelected 
                  ? 'shadow-lg transform scale-[1.02]' 
                  : 'hover:scale-[1.02] hover:shadow-md border-2 border-gray-200/60'
                }
              `}
              style={{
                backgroundColor: isSelected ? dept.color : 'white',
              }}
            >
              {/* Efecto de brillo en hover */}
              <div 
                className={`
                  absolute inset-0 opacity-0 group-hover:opacity-10 
                  transition-opacity duration-300
                  bg-gradient-to-r from-white via-transparent to-white
                `}
              />
              
              {/* Checkbox animado */}
              <div 
                className={`
                  relative flex-shrink-0 w-5 h-5 rounded-md
                  transition-all duration-300
                  flex items-center justify-center
                  ${isSelected 
                    ? 'bg-white/30 backdrop-blur-sm border-2 border-white/50' 
                    : 'border-2'
                  }
                `}
                style={{
                  borderColor: isSelected ? 'white' : dept.color
                }}
              >
                <Check 
                  className={`
                    w-3 h-3 transition-all duration-300
                    ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                  `}
                  style={{ color: isSelected ? 'white' : dept.color }}
                />
              </div>

              {/* Texto del departamento */}
              <div className="flex-1 text-left">
                <div 
                  className={`
                    text-sm font-semibold leading-tight
                    transition-colors duration-300
                  `}
                  style={{ 
                    color: isSelected ? 'white' : dept.color,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {dept.nombre}
                </div>
              </div>

              {/* Indicador de estado */}
              <div 
                className={`
                  flex-shrink-0 w-2 h-2 rounded-full
                  transition-all duration-300
                  ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                `}
                style={{
                  backgroundColor: 'white',
                  boxShadow: isSelected ? '0 0 8px rgba(255,255,255,0.5)' : 'none'
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Contador y resumen */}
      {showCounter && selectedIds.length > 0 && (
        <div 
          className="mt-4 px-4 py-3 rounded-xl backdrop-blur-sm"
          style={{ 
            backgroundColor: `${branding.primaryColor}10`,
            border: `1px solid ${branding.primaryColor}30`
          }}
        >
          <div className="flex items-center gap-3">
            {/* Badge con número */}
            <div 
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md"
              style={{ 
                backgroundColor: branding.primaryColor,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {selectedIds.length}
            </div>
            
            {/* Texto descriptivo */}
            <div className="flex-1">
              <span 
                className="text-sm font-semibold"
                style={{ 
                  color: branding.primaryColor,
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Département{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Pills de departamentos seleccionados */}
            {showPills && (
              <div className="flex flex-wrap gap-1.5">
                {selectedIds.map(deptId => {
                  const dept = departamentos.find(d => d.id === deptId);
                  if (!dept) return null;
                  return (
                    <div
                      key={deptId}
                      className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-sm"
                      style={{ 
                        backgroundColor: dept.color,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {dept.nombre}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}