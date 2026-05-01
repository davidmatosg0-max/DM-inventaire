import React, { useState, useEffect } from 'react';
import { Languages, Plus, Trash2, Pencil } from 'lucide-react';
import { useBranding } from '../../../hooks/useBranding';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { toast } from 'sonner';
import {
  obtenerIdiomasPersonalizados,
  guardarIdiomaPersonalizado,
  actualizarIdiomaPersonalizado,
  eliminarIdiomaPersonalizado,
  existeCodigoIdioma,
  type IdiomaPersonalizado
} from '../../utils/idiomasPersonalizadosStorage';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  predefinedLanguages?: Array<{
    code: string;
    label: string;
    flag: string;
    color: string;
  }>;
}

export function LanguageSelector({ 
  selectedLanguages, 
  onChange,
  predefinedLanguages 
}: LanguageSelectorProps) {
  const branding = useBranding();
  const [idiomasPersonalizados, setIdiomasPersonalizados] = useState<IdiomaPersonalizado[]>([]);
  const [dialogNuevoIdioma, setDialogNuevoIdioma] = useState(false);
  const [nuevoIdioma, setNuevoIdioma] = useState({ code: '', label: '', flag: '', color: branding.primaryColor });
  const [idiomaEditando, setIdiomaEditando] = useState<string | null>(null);

  const defaultLanguages = predefinedLanguages || [
    { code: 'fr', label: 'Français', flag: '🇫🇷', color: branding.primaryColor },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', color: '#F59E0B' },
    { code: 'en', label: 'English', flag: '🇬🇧', color: branding.secondaryColor },
    { code: 'es', label: 'Español', flag: '🇪🇸', color: '#8B5CF6' }
  ];

  useEffect(() => {
    cargarIdiomasPersonalizados();
  }, []);

  const cargarIdiomasPersonalizados = () => {
    const idiomasData = obtenerIdiomasPersonalizados();
    setIdiomasPersonalizados(idiomasData);
  };

  const toggleIdioma = (code: string) => {
    const nuevosIdiomas = selectedLanguages.includes(code)
      ? selectedLanguages.filter(i => i !== code)
      : [...selectedLanguages, code];
    onChange(nuevosIdiomas);
  };

  const handleAgregarIdioma = () => {
    if (!nuevoIdioma.code.trim() || !nuevoIdioma.label.trim()) {
      toast.error('Le code et le nom de la langue sont obligatoires');
      return;
    }

    const codigosPredefinidos = defaultLanguages.map(l => l.code);
    if (existeCodigoIdioma(nuevoIdioma.code, codigosPredefinidos)) {
      toast.error('Ce code de langue existe déjà');
      return;
    }

    guardarIdiomaPersonalizado(nuevoIdioma);
    toast.success('Langue ajoutée avec succès');
    cargarIdiomasPersonalizados();
    setDialogNuevoIdioma(false);
    setNuevoIdioma({ code: '', label: '', flag: '', color: branding.primaryColor });
  };

  const handleEliminarIdiomaPersonalizado = (id: string, code: string) => {
    eliminarIdiomaPersonalizado(id);
    // Remover el código del array de idiomas seleccionados si estaba seleccionado
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter(i => i !== code));
    }
    toast.success('Langue supprimée avec succès');
    cargarIdiomasPersonalizados();
  };

  const handleActualizarIdiomaPersonalizado = (id: string) => {
    actualizarIdiomaPersonalizado(id, nuevoIdioma);
    toast.success('Langue mise à jour avec succès');
    cargarIdiomasPersonalizados();
    setDialogNuevoIdioma(false);
    setNuevoIdioma({ code: '', label: '', flag: '', color: branding.primaryColor });
    setIdiomaEditando(null);
  };

  const todosLosIdiomas = [
    ...defaultLanguages,
    ...idiomasPersonalizados.map(i => ({
      code: i.code,
      label: i.label,
      flag: i.flag,
      color: i.color,
      isCustom: true,
      customId: i.id
    }))
  ];

  return (
    <div>
      <Label className="mb-3 block flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Languages className="w-4 h-4" style={{ color: branding.primaryColor }} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>Langues parlées</span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setDialogNuevoIdioma(true);
            setIdiomaEditando(null);
            setNuevoIdioma({ code: '', label: '', flag: '', color: branding.primaryColor });
          }}
          className="gap-1"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          <Plus className="w-3 h-3" />
          <span className="text-xs">Ajouter</span>
        </Button>
      </Label>

      {/* Idiomas seleccionados con opciones de quitar */}
      {selectedLanguages.length > 0 && (
        <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-blue-900 flex items-center gap-1">
              <Languages className="w-3 h-3" />
              {selectedLanguages.length} langue{selectedLanguages.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-red-600 hover:text-red-800 hover:underline font-medium"
            >
              Tout supprimer
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedLanguages.map((code, idx) => {
              const idioma = todosLosIdiomas.find((i: any) => i.code === code);
              if (!idioma) return null;
              return (
                <div
                  key={`selected-lang-${idx}-${code}`}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium shadow-sm"
                  style={{ backgroundColor: idioma.color }}
                >
                  <span className="text-xs">{idioma.flag || '🌐'}</span>
                  <span>{idioma.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleIdioma(code)}
                    className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    title="Retirer cette langue"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {todosLosIdiomas.map((idioma: any) => {
          const isSelected = selectedLanguages.includes(idioma.code);
          return (
            <div key={idioma.code} className="relative group">
              <button
                type="button"
                onClick={() => toggleIdioma(idioma.code)}
                className={`w-full group relative p-1.5 border-2 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                  isSelected 
                    ? 'scale-105 shadow-lg' 
                    : 'hover:scale-102 hover:shadow-md'
                }`}
                style={{
                  borderColor: isSelected ? idioma.color : '#E0E0E0',
                  backgroundColor: isSelected ? `${idioma.color}15` : 'white',
                }}
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                {/* Contenido */}
                <div className="relative flex flex-col items-center gap-0.5">
                  <span 
                    className={`text-lg transition-transform duration-300 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {idioma.flag || '🌐'}
                  </span>
                  <span 
                    className="text-[9px] font-semibold transition-colors leading-tight"
                    style={{ 
                      color: isSelected ? idioma.color : '#666666',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  >
                    {idioma.label}
                  </span>
                </div>
                
                {/* Checkmark animado */}
                {isSelected && (
                  <div 
                    className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full flex items-center justify-center animate-scaleIn"
                    style={{ backgroundColor: idioma.color }}
                  >
                    <svg 
                      className="w-2 h-2 text-white" 
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="3" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Botones de editar/eliminar para idiomas personalizados */}
              {idioma.isCustom && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idiomaData = idiomasPersonalizados.find(i => i.id === idioma.customId);
                      if (idiomaData) {
                        setNuevoIdioma({
                          code: idiomaData.code,
                          label: idiomaData.label,
                          flag: idiomaData.flag,
                          color: idiomaData.color
                        });
                        setIdiomaEditando(idioma.customId);
                        setDialogNuevoIdioma(true);
                      }
                    }}
                    className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-blue-600 z-10"
                    title="Modifier cette langue"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarIdiomaPersonalizado(idioma.customId, idioma.code);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-10"
                    title="Supprimer cette langue"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog Nuevo Idioma */}
      <Dialog open={dialogNuevoIdioma} onOpenChange={(open) => {
        setDialogNuevoIdioma(open);
        if (!open) {
          setIdiomaEditando(null);
          setNuevoIdioma({ code: '', label: '', flag: '', color: branding.primaryColor });
        }
      }}>
        <DialogContent className="max-w-md" aria-describedby="new-language-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {idiomaEditando ? (
                <>
                  <Pencil className="w-5 h-5 inline mr-2" style={{ color: branding.primaryColor }} />
                  Modifier la langue
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5 inline mr-2" style={{ color: branding.primaryColor }} />
                  Ajouter une nouvelle langue
                </>
              )}
            </DialogTitle>
            <DialogDescription id="new-language-description">
              {idiomaEditando 
                ? 'Modifiez les informations de la langue personnalisée'
                : 'Créez un nouveau sélecteur de langue personnalisé avec code, nom, drapeau et couleur'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="lang-code">Code de langue *</Label>
              <Input
                id="lang-code"
                value={nuevoIdioma.code}
                onChange={(e) => setNuevoIdioma({ ...nuevoIdioma, code: e.target.value })}
                placeholder="Ex: it, pt, de, zh"
                maxLength={5}
              />
              <p className="text-xs text-gray-500 mt-1">2-5 caractères recommandés</p>
            </div>

            <div>
              <Label htmlFor="lang-label">Nom de la langue *</Label>
              <Input
                id="lang-label"
                value={nuevoIdioma.label}
                onChange={(e) => setNuevoIdioma({ ...nuevoIdioma, label: e.target.value })}
                placeholder="Ex: Italiano, Português"
              />
            </div>

            <div>
              <Label htmlFor="lang-flag">Drapeau (emoji)</Label>
              {/* Selector visual de banderas */}
              <div className="mb-2 p-3 border-2 border-gray-200 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '🇫🇷', '🇬🇧', '🇪🇸', '🇩🇪', '🇮🇹', '🇵🇹', '🇳🇱', '🇧🇪',
                    '🇨🇦', '🇺🇸', '🇲🇽', '🇧🇷', '🇦🇷', '🇨🇴', '🇨🇱', '🇵🇪',
                    '🇨🇳', '🇯🇵', '🇰🇷', '🇮🇳', '🇵🇰', '🇧🇩', '🇻🇳', '🇹🇭',
                    '🇸🇦', '🇦🇪', '🇪🇬', '🇲🇦', '🇩🇿', '🇹🇳', '🇱🇧', '🇮🇶',
                    '🇷🇺', '🇵🇱', '🇺🇦', '🇷🇴', '🇬🇷', '🇹🇷', '🇨🇿', '🇭🇺',
                    '🇿🇦', '🇳🇬', '🇰🇪', '🇪🇹', '🇬🇭', '🇨🇮', '🇸🇳', '🇨🇲',
                    '🇦🇺', '🇳🇿', '🇵🇭', '🇮🇩', '🇲🇾', '🇸🇬', '🇱🇰', '🇲🇲',
                    '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇮🇸', '🇮🇪', '🇨🇭', '🇦🇹',
                    '🌐', '🏳️', '🏴', '🚩'
                  ].map((flag) => (
                    <button
                      key={flag}
                      type="button"
                      onClick={() => setNuevoIdioma({ ...nuevoIdioma, flag })}
                      className={`text-2xl p-2 rounded hover:bg-white transition-all border-2 ${
                        nuevoIdioma.flag === flag ? 'border-blue-500 bg-white scale-110' : 'border-transparent'
                      }`}
                      title={flag}
                    >
                      {flag}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                id="lang-flag"
                value={nuevoIdioma.flag}
                onChange={(e) => setNuevoIdioma({ ...nuevoIdioma, flag: e.target.value })}
                placeholder="Ex: 🇮🇹, 🇵🇹, 🇩🇪"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez un drapeau ci-dessus ou saisissez un emoji
              </p>
            </div>

            <div>
              <Label htmlFor="lang-color">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="lang-color"
                  type="color"
                  value={nuevoIdioma.color}
                  onChange={(e) => setNuevoIdioma({ ...nuevoIdioma, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={nuevoIdioma.color}
                  onChange={(e) => setNuevoIdioma({ ...nuevoIdioma, color: e.target.value })}
                  placeholder="#1a4d7a"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <Label className="text-xs text-gray-500 mb-2 block">Aperçu</Label>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="p-2 border-2 rounded-lg"
                  style={{
                    borderColor: nuevoIdioma.color,
                    backgroundColor: `${nuevoIdioma.color}15`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">
                      {nuevoIdioma.flag || '🌐'}
                    </span>
                    <span 
                      className="text-xs font-semibold"
                      style={{ 
                        color: nuevoIdioma.color,
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      {nuevoIdioma.label || 'Langue'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogNuevoIdioma(false);
                setNuevoIdioma({ code: '', label: '', flag: '', color: branding.primaryColor });
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => idiomaEditando ? handleActualizarIdiomaPersonalizado(idiomaEditando) : handleAgregarIdioma()}
              className="text-white"
              style={{ backgroundColor: branding.secondaryColor }}
            >
              {idiomaEditando ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Mettre à jour
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}