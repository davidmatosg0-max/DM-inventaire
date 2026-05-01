import React, { useState } from 'react';
import { Card } from '../ui/card';
import { SelecteurDepartementsMultiple } from './SelecteurDepartementsMultiple';
import { useBranding } from '../../../hooks/useBranding';

export function DemoSelecteurDepartements() {
  const branding = useBranding();
  const [selectedDefault, setSelectedDefault] = useState<string[]>([]);
  const [selectedCompact, setSelectedCompact] = useState<string[]>([]);
  const [selectedUltraCompact, setSelectedUltraCompact] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className="text-4xl font-bold"
            style={{ 
              color: branding.primaryColor,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Sélection Multiple de Départements
          </h1>
          <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Trois variantes modernes et élégantes pour votre système
          </p>
        </div>

        {/* Variante Default */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 
              className="text-xl font-bold mb-1"
              style={{ 
                color: branding.primaryColor,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Variante Default
            </h2>
            <p className="text-sm text-gray-600">
              Cards grandes en grid 2 columnas con animations premium
            </p>
          </div>
          <SelecteurDepartementsMultiple
            selectedIds={selectedDefault}
            onChange={setSelectedDefault}
            variant="default"
            gridCols={2}
            showPills={true}
          />
        </Card>

        {/* Variante Ultra Minimalista Pills */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 
              className="text-xl font-bold mb-1"
              style={{ 
                color: branding.secondaryColor,
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Variante Pills Minimaliste (La plus compacte)
            </h2>
            <p className="text-sm text-gray-600">
              Pills ultra compactos con flex-wrap - Implementado en FormularioContactoCompacto
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] mb-1 flex items-center gap-0.5 text-gray-700 opacity-70">
              <span className="font-semibold">Depts</span>
              {selectedCompact.length > 0 && (
                <span 
                  className="ml-1 px-1 rounded-full text-white font-bold"
                  style={{ 
                    backgroundColor: branding.primaryColor,
                    fontSize: '8px',
                    lineHeight: '12px'
                  }}
                >
                  {selectedCompact.length}
                </span>
              )}
            </div>
            
            {/* Pills ultra minimalistes */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: '1', nombre: 'Direction', color: '#1a4d7a' },
                { id: '2', nombre: 'Entrepôt', color: '#2d9561' },
                { id: '3', nombre: 'Achats', color: '#F59E0B' },
                { id: '4', nombre: 'Comptoir', color: '#8B5CF6' },
                { id: '5', nombre: 'Finance', color: '#EC4899' },
                { id: '6', nombre: 'Communication', color: '#10B981' },
                { id: '7', nombre: 'Transport', color: '#EF4444' },
                { id: '8', nombre: 'Qualité', color: '#3B82F6' },
              ].map(dept => {
                const isSelected = selectedCompact.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedCompact(prev =>
                        prev.includes(dept.id)
                          ? prev.filter(id => id !== dept.id)
                          : [...prev, dept.id]
                      );
                    }}
                    className={`
                      px-1.5 py-0.5 rounded transition-all duration-100
                      ${isSelected 
                        ? 'ring-1 ring-white/40' 
                        : 'hover:ring-1 border'
                      }
                    `}
                    style={{
                      backgroundColor: isSelected ? dept.color : 'white',
                      borderColor: isSelected ? dept.color : `${dept.color}40`,
                      fontSize: '10px',
                      lineHeight: '14px',
                      color: isSelected ? 'white' : dept.color,
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600
                    }}
                  >
                    {dept.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Variante Ultra Compacta (Pills) */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 
              className="text-xl font-bold mb-1"
              style={{ 
                color: '#F59E0B',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Variante Ultra-Compacta (Pills)
            </h2>
            <p className="text-sm text-gray-600">
              Pills horizontales pour sidebars et espaces très limités
            </p>
          </div>
          <SelecteurDepartementsMultiple
            selectedIds={selectedUltraCompact}
            onChange={setSelectedUltraCompact}
            variant="compact"
            showPills={false}
          />
        </Card>

        {/* Comparación de tamaños */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ 
              color: branding.primaryColor,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            📊 Comparación de Espacements
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold" style={{ color: branding.primaryColor }}>
                {selectedDefault.length}
              </div>
              <div className="text-xs text-gray-600">Default</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold" style={{ color: branding.secondaryColor }}>
                {selectedCompact.length}
              </div>
              <div className="text-xs text-gray-600">Compacta (Grid 3)</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                {selectedUltraCompact.length}
              </div>
              <div className="text-xs text-gray-600">Ultra-Compacta</div>
            </div>
          </div>
        </Card>

        {/* Características */}
        <Card className="p-6">
          <h3 
            className="text-lg font-bold mb-4"
            style={{ 
              color: branding.primaryColor,
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            ✨ Nouvelles Caractéristiques - Pills Minimalistes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                <span className="text-sm font-medium">Flex-wrap fluide (adaptable)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                <span className="text-sm font-medium">Pas de checkbox (minimaliste)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                <span className="text-sm font-medium">Padding ultra mini (px-1.5 py-0.5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                <span className="text-sm font-medium">Gap 4px minimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                <span className="text-sm font-medium">Icône 10px (w-2.5 h-2.5)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm font-medium">Texte 10px minuscule</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm font-medium">Label "Depts" ultra court</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm font-medium">Badge intégré dans label</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm font-medium">Transitions 100ms ultrarapide</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm font-medium">Ring seulement (pas de shadow)</span>
              </div>
            </div>
          </div>
          
          {/* Comparaison visuelle */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-bold mb-3" style={{ color: branding.primaryColor }}>
              🎯 Économie d'Espace Maximale
            </h4>
            <div className="grid grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-blue-50">
                <div className="font-bold text-lg" style={{ color: branding.primaryColor }}>80%</div>
                <div className="text-gray-600 mt-1">Hauteur réduite</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <div className="font-bold text-lg" style={{ color: branding.secondaryColor }}>∞</div>
                <div className="text-gray-600 mt-1">Colonnes flex</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <div className="font-bold text-lg" style={{ color: '#F59E0B' }}>100ms</div>
                <div className="text-gray-600 mt-1">Plus rapide</div>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <div className="font-bold text-lg" style={{ color: '#8B5CF6' }}>0</div>
                <div className="text-gray-600 mt-1">Résumé séparé</div>
              </div>
              <div className="p-3 rounded-lg bg-pink-50">
                <div className="font-bold text-lg" style={{ color: '#EC4899' }}>10px</div>
                <div className="text-gray-600 mt-1">Texte mini</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}