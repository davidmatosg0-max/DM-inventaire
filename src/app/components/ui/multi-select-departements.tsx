import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown, Building } from 'lucide-react';
import { useBranding } from '../../../hooks/useBranding';
import { Badge } from './badge';
import { Button } from './button';

interface DepartmentOption {
  id: string;
  label: string;
}

interface MultiSelectDepartementsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[] | DepartmentOption[];
  placeholder?: string;
  maxHeight?: string;
}

export function MultiSelectDepartements({
  value = [],
  onChange,
  options,
  placeholder = 'Sélectionner des départements',
  maxHeight = '300px'
}: MultiSelectDepartementsProps) {
  const branding = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Asegurar que value siempre sea un array
  const safeValue = Array.isArray(value) ? value : [];
  
  // Log para depuración
  useEffect(() => {
    console.log('🔍 MultiSelectDepartements - Props recibidas:', {
      value,
      safeValue,
      valueLength: safeValue.length,
      optionsCount: options.length
    });
  }, [value, safeValue, options]);

  // Normalizar options para trabajar con objetos { id, label }
  const normalizedOptions: DepartmentOption[] = options.map(opt => 
    typeof opt === 'string' ? { id: opt, label: opt } : opt
  );

  // Crear un mapa para buscar etiquetas rápidamente
  const optionMap = new Map(normalizedOptions.map(opt => [opt.id, opt.label]));

  // Obtener la etiqueta de un ID
  const getLabel = (id: string): string => optionMap.get(id) || id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId: string) => {
    if (safeValue.includes(optionId)) {
      onChange(safeValue.filter(v => v !== optionId));
    } else {
      onChange([...safeValue, optionId]);
    }
  };

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(safeValue.filter(v => v !== optionId));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="min-h-[44px] w-full px-3 py-2 border border-[#E0E0E0] rounded-lg bg-white cursor-pointer hover:border-[#1a4d7a] transition-colors flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1 items-center">
          {safeValue.length === 0 ? (
            <span className="text-[#999999] text-sm">{placeholder}</span>
          ) : (
            safeValue.map(deptId => (
              <Badge
                key={deptId}
                variant="outline"
                className="text-xs flex items-center gap-1 px-2 py-1"
                style={{
                  borderColor: branding.primaryColor,
                  color: branding.primaryColor,
                  backgroundColor: `${branding.primaryColor}10`
                }}
              >
                <Building className="w-3 h-3" />
                {getLabel(deptId)}
                <button
                  onClick={(e) => removeOption(deptId, e)}
                  className="ml-1 hover:bg-white/50 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {safeValue.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Effacer tout"
            >
              <X className="w-4 h-4 text-[#999999]" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#666666] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-xl overflow-hidden"
          style={{ maxHeight }}
        >
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-[#999999] text-sm">
                Aucun département disponible
              </div>
            ) : (
              normalizedOptions.map(option => {
                const isSelected = safeValue.includes(option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors"
                    style={isSelected ? { backgroundColor: `${branding.primaryColor}10` } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#333333]">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {safeValue.length > 0 && (
            <div className="border-t border-[#E0E0E0] p-2 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>{safeValue.length} département{safeValue.length > 1 ? 's' : ''} sélectionné{safeValue.length > 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 text-xs"
                >
                  Tout effacer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}