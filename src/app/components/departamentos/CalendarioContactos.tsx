import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckSquare,
  Filter,
  Sun,
  Moon,
  Eye
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ContactoDepartamento, TipoContacto } from '../../utils/contactosDepartamentoStorage';
import { obtenerTareasPersonalizadas, type TareaPersonalizada } from '../../utils/tareasPersonalizadasStorage';

interface CalendarioContactosProps {
  contactos: ContactoDepartamento[];
  onVerDetalle: (contacto: ContactoDepartamento) => void;
  getTipoConfig: (tipo: TipoContacto) => {
    color: string;
    icon: any;
    label: string;
    bgColor: string;
  };
  departamentoNombre?: string; // NUEVO: nombre del departamento para mostrar
  departamentoId?: string; // NUEVO: ID del departamento para tareas específicas
}

// Definición de tareas predeterminadas (base)
const TAREAS_PREDETERMINADAS_BASE = [
  { codigo: 'accueil', label: 'Accueil et orientation', icon: '🤝', color: '#1a4d7a' },
  { codigo: 'distribution', label: 'Distribution alimentaire', icon: '📦', color: '#2d9561' },
  { codigo: 'inventaire', label: 'Gestion d\'inventaire', icon: '📋', color: '#F59E0B' },
  { codigo: 'transport', label: 'Transport et logistique', icon: '🚛', color: '#8B5CF6' },
  { codigo: 'comptoir', label: 'Service au comptoir', icon: '🏪', color: '#EC4899' },
  { codigo: 'cuisine', label: 'Préparation cuisine', icon: '👨‍🍳', color: '#10B981' },
  { codigo: 'nettoyage', label: 'Entretien et nettoyage', icon: '🧹', color: '#6B7280' },
  { codigo: 'admin', label: 'Tâches administratives', icon: '📊', color: '#3B82F6' }
];

export function CalendarioContactos({ contactos, onVerDetalle, getTipoConfig, departamentoNombre, departamentoId }: CalendarioContactosProps) {
  const branding = useBranding();
  const [filtroTarea, setFiltroTarea] = useState<string>('todas');
  const [mostrarSoloDisponibles, setMostrarSoloDisponibles] = useState(true);
  const [tareasDisponibles, setTareasDisponibles] = useState<Array<{codigo: string, label: string, icon: string, color: string}>>([]);

  // Cargar tareas dinámicas
  useEffect(() => {
    cargarTareas();
  }, [departamentoId, contactos]);

  const cargarTareas = () => {
    // Obtener tareas personalizadas
    const tareasPersonalizadas = obtenerTareasPersonalizadas(departamentoId);
    
    // Obtener todas las tareas únicas de los contactos
    const tareasEnUso = new Set<string>();
    contactos.forEach(contacto => {
      if (contacto.tareas && Array.isArray(contacto.tareas)) {
        contacto.tareas.forEach(tarea => tareasEnUso.add(tarea));
      }
    });

    // Combinar tareas predeterminadas con personalizadas
    const todasLasTareas = [
      ...TAREAS_PREDETERMINADAS_BASE,
      ...tareasPersonalizadas.map(t => ({
        codigo: t.code,
        label: t.label,
        icon: t.icon,
        color: t.color
      }))
    ];

    // Filtrar solo las tareas que están en uso
    const tareasActivas = todasLasTareas.filter(t => tareasEnUso.has(t.codigo));

    // Eliminar duplicados por código
    const tareasUnicas = tareasActivas.reduce((acc, tarea) => {
      if (!acc.find(t => t.codigo === tarea.codigo)) {
        acc.push(tarea);
      }
      return acc;
    }, [] as typeof tareasActivas);

    setTareasDisponibles(tareasUnicas);
  };

  const diasSemana = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Filtrar contactos según tarea seleccionada
  const contactosFiltrados = contactos.filter(contacto => {
    if (!contacto.activo) return false;
    
    if (filtroTarea === 'todas') return true;
    
    return contacto.tareas?.includes(filtroTarea);
  });

  // Obtener contactos para un día y horario específico
  const obtenerContactosPorDiaHorario = (dia: string, periodo: 'am' | 'pm') => {
    return contactosFiltrados.filter(contacto => {
      if (!contacto.disponibilidades) return false;
      
      const disponibilidadDia = contacto.disponibilidades.find(d => d.jour === dia);
      if (!disponibilidadDia) return false;
      
      return disponibilidadDia[periodo];
    });
  };

  // Obtener etiqueta de tarea con estilo
  const getTareaLabel = (codigoTarea: string) => {
    const tarea = tareasDisponibles.find(t => t.codigo === codigoTarea);
    return tarea || { codigo: codigoTarea, label: codigoTarea, color: '#6B7280' };
  };

  // Contar horas totales de la semana para un contacto
  const contarHorasSemana = (contacto: ContactoDepartamento) => {
    if (!contacto.disponibilidades) return 0;
    
    let horasTotal = 0;
    contacto.disponibilidades.forEach(dia => {
      if (dia.am) horasTotal += 4; // 4 horas AM
      if (dia.pm) horasTotal += 4; // 4 horas PM
    });
    
    return horasTotal;
  };

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="card-glass rounded-xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <CalendarIcon className="w-5 h-5" style={{ color: branding.primaryColor }} />
              Calendrier des Horaires
              {departamentoNombre && (
                <Badge 
                  className="ml-2 text-white font-medium"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  {departamentoNombre}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-[#666666] mt-1">
              Vue hebdomadaire des disponibilités et tâches assignées
              {departamentoNombre && ` - Département ${departamentoNombre}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Select value={filtroTarea} onValueChange={setFiltroTarea}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par tâche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toutes les tâches</SelectItem>
                {tareasDisponibles.map(tarea => (
                  <SelectItem key={tarea.codigo} value={tarea.codigo}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tarea.color }} />
                      {tarea.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={mostrarSoloDisponibles ? 'default' : 'outline'}
              onClick={() => setMostrarSoloDisponibles(!mostrarSoloDisponibles)}
              style={mostrarSoloDisponibles ? { backgroundColor: branding.primaryColor } : {}}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Disponibles uniquement
            </Button>
          </div>
        </div>

        {/* Resumen de contactos filtrados */}
        <div className="mt-4 p-3 bg-white/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#666666]">
              <strong>{contactosFiltrados.length}</strong> contact{contactosFiltrados.length !== 1 ? 's' : ''} trouvé{contactosFiltrados.length !== 1 ? 's' : ''}
            </span>
            {filtroTarea !== 'todas' && (
              <Badge style={{ backgroundColor: getTareaLabel(filtroTarea).color }}>
                {getTareaLabel(filtroTarea).label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda de tareas */}
      <div className="card-glass rounded-xl shadow-lg p-4">
        <h4 className="text-sm font-semibold text-[#333333] mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4" style={{ color: branding.primaryColor }} />
          Légende des tâches
        </h4>
        <div className="flex flex-wrap gap-2">
          {tareasDisponibles.map(tarea => (
            <Badge
              key={tarea.codigo}
              variant="outline"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{ 
                borderColor: tarea.color,
                color: tarea.color
              }}
              onClick={() => setFiltroTarea(tarea.codigo)}
            >
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tarea.color }} />
              {tarea.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Calendario Semanal */}
      <div className="card-glass rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b-2" style={{ borderColor: branding.primaryColor }}>
                <th className="p-3 text-left bg-white/80" style={{ width: '100px' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: branding.primaryColor }} />
                    <span className="font-semibold text-[#333333]">Horaire</span>
                  </div>
                </th>
                {diasSemana.map(dia => (
                  <th key={dia} className="p-3 text-center bg-white/80" style={{ minWidth: '140px' }}>
                    <div className="font-semibold text-[#333333]">{dia}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Fila AM */}
              <tr className="border-b hover:bg-white/30 transition-colors">
                <td className="p-3 bg-amber-50/50 border-r">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-semibold text-amber-900">Matin</div>
                      <div className="text-xs text-amber-700">8h - 12h</div>
                    </div>
                  </div>
                </td>
                {diasSemana.map(dia => {
                  const contactosDia = obtenerContactosPorDiaHorario(dia, 'am');
                  return (
                    <td key={`${dia}-am`} className="p-2 align-top">
                      {contactosDia.length === 0 ? (
                        <div className="text-center text-xs text-[#999999] py-4">
                          Aucun contact
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contactosDia.map(contacto => {
                            const config = getTipoConfig(contacto.tipo);
                            return (
                              <Card
                                key={contacto.id}
                                className="p-2 hover:shadow-md transition-shadow cursor-pointer border-l-2"
                                style={{ borderLeftColor: config.color }}
                                onClick={() => onVerDetalle(contacto)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: config.color }}>
                                    {contacto.foto ? (
                                      <img src={contacto.foto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                                        <User className="w-3 h-3" style={{ color: config.color }} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-[#333333] truncate">
                                      {contacto.nombre} {contacto.apellido}
                                    </div>
                                    {contacto.cargo && (
                                      <div className="text-[10px] text-[#666666] truncate">
                                        {contacto.cargo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {contacto.tareas && contacto.tareas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {contacto.tareas.slice(0, 2).map(tarea => {
                                      const tareaInfo = getTareaLabel(tarea);
                                      return (
                                        <div
                                          key={tarea}
                                          className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium"
                                          style={{ backgroundColor: tareaInfo.color }}
                                        >
                                          {tareaInfo.label}
                                        </div>
                                      );
                                    })}
                                    {contacto.tareas.length > 2 && (
                                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-gray-300 text-gray-700">
                                        +{contacto.tareas.length - 2}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Fila PM */}
              <tr className="border-b hover:bg-white/30 transition-colors">
                <td className="p-3 bg-indigo-50/50 border-r">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-indigo-900">Après-midi</div>
                      <div className="text-xs text-indigo-700">13h - 17h</div>
                    </div>
                  </div>
                </td>
                {diasSemana.map(dia => {
                  const contactosDia = obtenerContactosPorDiaHorario(dia, 'pm');
                  return (
                    <td key={`${dia}-pm`} className="p-2 align-top">
                      {contactosDia.length === 0 ? (
                        <div className="text-center text-xs text-[#999999] py-4">
                          Aucun contact
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contactosDia.map(contacto => {
                            const config = getTipoConfig(contacto.tipo);
                            return (
                              <Card
                                key={contacto.id}
                                className="p-2 hover:shadow-md transition-shadow cursor-pointer border-l-2"
                                style={{ borderLeftColor: config.color }}
                                onClick={() => onVerDetalle(contacto)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: config.color }}>
                                    {contacto.foto ? (
                                      <img src={contacto.foto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                                        <User className="w-3 h-3" style={{ color: config.color }} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-[#333333] truncate">
                                      {contacto.nombre} {contacto.apellido}
                                    </div>
                                    {contacto.cargo && (
                                      <div className="text-[10px] text-[#666666] truncate">
                                        {contacto.cargo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {contacto.tareas && contacto.tareas.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {contacto.tareas.slice(0, 2).map(tarea => {
                                      const tareaInfo = getTareaLabel(tarea);
                                      return (
                                        <div
                                          key={tarea}
                                          className="text-[9px] px-1.5 py-0.5 rounded text-white font-medium"
                                          style={{ backgroundColor: tareaInfo.color }}
                                        >
                                          {tareaInfo.label}
                                        </div>
                                      );
                                    })}
                                    {contacto.tareas.length > 2 && (
                                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-gray-300 text-gray-700">
                                        +{contacto.tareas.length - 2}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de horas semanales */}
      <div className="card-glass rounded-xl shadow-lg p-4">
        <h4 className="text-sm font-semibold text-[#333333] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: branding.primaryColor }} />
          Résumé des heures hebdomadaires
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contactosFiltrados.slice(0, 6).map(contacto => {
            const horasSemana = contarHorasSemana(contacto);
            const config = getTipoConfig(contacto.tipo);
            return (
              <Card
                key={contacto.id}
                className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-2"
                style={{ borderLeftColor: config.color }}
                onClick={() => onVerDetalle(contacto)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: config.color }}>
                      {contacto.foto ? (
                        <img src={contacto.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
                          <User className="w-4 h-4" style={{ color: config.color }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#333333] truncate">
                        {contacto.nombre} {contacto.apellido}
                      </div>
                      <div className="text-xs text-[#666666]">
                        {contacto.cargo || config.label.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-lg font-bold" style={{ color: branding.primaryColor }}>
                      {horasSemana}h
                    </div>
                    <div className="text-[10px] text-[#999999]">
                      / semaine
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {contactosFiltrados.length > 6 && (
          <div className="text-center mt-3">
            <Button variant="outline" size="sm">
              <Eye className="w-3 h-3 mr-2" />
              Voir tous ({contactosFiltrados.length} contacts)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}