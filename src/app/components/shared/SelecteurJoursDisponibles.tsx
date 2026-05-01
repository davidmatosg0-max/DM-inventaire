/**
 * SelecteurJoursDisponibles - Composant réutilisable pour sélectionner les jours et horaires disponibles
 * 
 * Fonctionnalités:
 * - Sélection de jours de la semaine avec boutons AM/PM/TODO
 * - Interface visuelle intuitive avec badges colorés
 * - Réutilisable dans tous les formulaires du système
 */

import React, { useMemo, useCallback } from 'react';
import { CalendarDays, Sun, Moon, Clock } from 'lucide-react';

export interface JourDisponible {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

interface SelecteurJoursDisponiblesProps {
  joursDisponibles?: JourDisponible[];
  joursSelectionnes?: JourDisponible[]; // Alias pour compatibilité
  onChange: (nouveauxJours: JourDisponible[]) => void;
  label?: string;
  description?: string;
  showIcon?: boolean;
  className?: string;
}

const JOURS_SEMAINE = [
  { jour: 'Lundi', short: 'Lun' },
  { jour: 'Mardi', short: 'Mar' },
  { jour: 'Mercredi', short: 'Mer' },
  { jour: 'Jeudi', short: 'Jeu' },
  { jour: 'Vendredi', short: 'Ven' },
  { jour: 'Samedi', short: 'Sam' },
  { jour: 'Dimanche', short: 'Dim' }
];

export function SelecteurJoursDisponibles({
  joursDisponibles,
  joursSelectionnes,
  onChange,
  label = 'Jours disponibles (Cliquez pour sélectionner l\'horaire)',
  description = 'Sélectionnez les jours et horaires pendant lesquels vous êtes disponible.',
  showIcon = true,
  className = ''
}: SelecteurJoursDisponiblesProps) {

  // Usar joursSelectionnes comme alias si existe, sino joursDisponibles
  const jours = useMemo(() => {
    return joursSelectionnes || joursDisponibles || [];
  }, [joursSelectionnes, joursDisponibles]);

  // Función para seleccionar/deseleccionar un horario específico
  const handleSelectHoraire = useCallback((jourName: string, newHoraire: 'AM' | 'PM' | 'AM/PM') => {
    const existing = jours.find(j => j.jour === jourName);
    
    let nouveauxJours: JourDisponible[];
    
    if (!existing) {
      // Agregar nuevo día con el horario seleccionado
      nouveauxJours = [...jours, { jour: jourName, horaire: newHoraire }];
    } else if (existing.horaire === newHoraire) {
      // Si ya está seleccionado el mismo horario, deseleccionar (remover día)
      nouveauxJours = jours.filter(j => j.jour !== jourName);
    } else {
      // Cambiar al nuevo horario
      nouveauxJours = jours.map(j => 
        j.jour === jourName ? { ...j, horaire: newHoraire } : j
      );
    }
    
    onChange(nouveauxJours);
  }, [jours, onChange]);

  const handleReinitialiser = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange([]);
  }, [onChange]);

  // Obtener el horario actual de un día
  const getHoraireForJour = useCallback((jourName: string): 'AM' | 'PM' | 'AM/PM' | null => {
    const jourData = jours.find(j => j.jour === jourName);
    return jourData?.horaire || null;
  }, [jours]);
  
  return (
    <div className={className}>
      {/* Header opcional con icono */}
      {showIcon && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC107] to-[#FFA000] flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#333333]">Disponibilité</h3>
        </div>
      )}

      {/* Label y descripción */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#333333] mb-1">Jours et Horaires</h3>
        <p className="text-xs text-[#666666]">Cliquez sur AM, PM ou Journée complète</p>
      </div>

      {/* Grid de días - 7 columnas */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {JOURS_SEMAINE.map(({ jour, short }) => {
          const currentHoraire = getHoraireForJour(jour);
          const isSelected = currentHoraire !== null;
          
          return (
            <div
              key={jour}
              className={`
                rounded-lg border-2 p-2 transition-all
                ${isSelected ? 'border-[#1a4d7a] bg-blue-50' : 'border-gray-200 bg-white'}
              `}
            >
              {/* Nombre del día */}
              <div className={`
                text-center text-xs font-bold mb-2 pb-1.5 border-b
                ${isSelected ? 'text-[#1a4d7a] border-[#1a4d7a]/20' : 'text-gray-600 border-gray-200'}
              `}>
                {short}
              </div>
              
              {/* Botones de horario */}
              <div className="flex flex-col gap-1">
                {/* Botón AM */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectHoraire(jour, 'AM');
                  }}
                  className={`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${currentHoraire === 'AM' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }
                  `}
                  title="Matin"
                >
                  <Sun className="w-2.5 h-2.5" />
                  <span>AM</span>
                </button>

                {/* Botón PM */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectHoraire(jour, 'PM');
                  }}
                  className={`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${currentHoraire === 'PM' 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                    }
                  `}
                  title="Après-midi"
                >
                  <Moon className="w-2.5 h-2.5" />
                  <span>PM</span>
                </button>

                {/* Botón TODO (AM/PM) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectHoraire(jour, 'AM/PM');
                  }}
                  className={`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${currentHoraire === 'AM/PM' 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600'
                    }
                  `}
                  title="Journée complète"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[9px]">JOUR</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500 flex items-center justify-center">
            <Sun className="w-2 h-2 text-white" />
          </div>
          <span className="text-gray-600 font-medium">AM (Matin)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500 flex items-center justify-center">
            <Moon className="w-2 h-2 text-white" />
          </div>
          <span className="text-gray-600 font-medium">PM (Après-midi)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500 flex items-center justify-center">
            <Clock className="w-2 h-2 text-white" />
          </div>
          <span className="text-gray-600 font-medium">Journée complète</span>
        </div>
        <button
          type="button"
          onClick={handleReinitialiser}
          className="text-blue-600 hover:text-blue-700 hover:underline ml-auto cursor-pointer font-semibold"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

// Hook personalizado pour manejar el estado de los días disponibles
export function useJoursDisponibles(initialValue: JourDisponible[] = []) {
  const [joursDisponibles, setJoursDisponibles] = React.useState<JourDisponible[]>(initialValue);

  const handleChange = React.useCallback((nouveauxJours: JourDisponible[]) => {
    setJoursDisponibles(nouveauxJours);
  }, []);

  return [joursDisponibles, handleChange, setJoursDisponibles] as const;
}
