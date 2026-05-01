import React from 'react';
import { UserPlus, Star, Phone, Mail } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import type { PersonaResponsable } from '../../utils/personasResponsablesStorage';

interface PersonasAutorizadasSectionProps {
  personas: PersonaResponsable[];
  organismoNombre: string;
}

export function PersonasAutorizadasSection({ personas, organismoNombre }: PersonasAutorizadasSectionProps) {
  if (personas.length === 0) {
    return (
      <div className=\"p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed\">
        <UserPlus className=\"w-12 h-12 text-gray-400 mx-auto mb-3\" />
        <p className=\"text-[#666666] font-medium mb-1\">
          No hay personas autorizadas registradas
        </p>
        <p className=\"text-sm text-[#999999]\">
          El organismo aún no ha registrado personas autorizadas para recoger comandas
        </p>
      </div>
    );
  }

  return (
    <div className=\"space-y-4\">
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
        {personas.map(persona => (
          <Card 
            key={persona.id} 
            className={`border-2 ${persona.esPrincipal ? 'border-[#4CAF50] bg-green-50' : 'border-gray-200'}`}
          >
            <CardContent className=\"pt-4\">
              <div className=\"flex items-start justify-between mb-3\">
                <div className=\"flex-1\">
                  <div className=\"flex items-center gap-2 mb-1\">
                    <h4 className=\"font-bold text-[#333333]\" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {persona.nombreCompleto}
                    </h4>
                    {persona.esPrincipal && (
                      <Badge className=\"bg-[#4CAF50] text-white flex items-center gap-1\">
                        <Star className=\"w-3 h-3 fill-white\" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  {persona.cargo && (
                    <p className=\"text-sm text-[#666666] mb-2\">{persona.cargo}</p>
                  )}
                </div>
              </div>

              <div className=\"space-y-2\">
                <div className=\"flex items-center gap-2 text-sm\">
                  <Phone className=\"w-4 h-4 text-[#1E73BE]\" />
                  <span className=\"text-[#333333]\">{persona.telefono}</span>
                </div>
                <div className=\"flex items-center gap-2 text-sm\">
                  <Mail className=\"w-4 h-4 text-[#1E73BE]\" />
                  <span className=\"text-[#333333]\">{persona.email}</span>
                </div>
                {persona.notas && (
                  <div className=\"mt-2 p-2 bg-white rounded text-xs text-[#666666] border\">
                    {persona.notas}
                  </div>
                )}
              </div>

              <div className=\"mt-3 pt-3 border-t text-xs text-[#999999]\">
                Agregado el {new Date(persona.fechaCreacion).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen */}
      <Card className=\"bg-blue-50 border-blue-200\">
        <CardContent className=\"pt-6\">
          <div className=\"flex items-center justify-between\">
            <div>
              <p className=\"font-medium text-[#333333]\">Total de Personas Autorizadas</p>
              <p className=\"text-sm text-[#666666]\">
                {personas.filter(p => p.esPrincipal).length > 0 
                  ? `Contacto principal: ${personas.find(p => p.esPrincipal)?.nombreCompleto}`
                  : 'Sin contacto principal designado'}
              </p>
            </div>
            <div className=\"text-right\">
              <p className=\"font-bold text-[#1E73BE]\" style={{ fontSize: '1.5rem' }}>
                {personas.length}
              </p>
              <p className=\"text-sm text-[#666666]\">
                {personas.length === 1 ? 'persona' : 'personas'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
