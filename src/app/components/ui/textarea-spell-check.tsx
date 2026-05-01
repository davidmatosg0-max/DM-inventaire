import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface TextareaSpellCheckProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  language?: 'fr' | 'en' | 'es' | 'ar';
  showSpellCheck?: boolean;
}

// Diccionario personalizado para términos del dominio
const customDictionary: Record<string, string[]> = {
  fr: [
    // Términos específicos del dominio
    'banque', 'alimentaire', 'organismes', 'bénéficiaires', 'denrées',
    'comptoir', 'commande', 'inventaire', 'départements', 'bénévole',
    'dons', 'distribution', 'entreposage', 'logistique', 'transport',
    'département', 'bénévoles', 'commandes', 'inventaires', 'volontaire',
    'volontaires', 'donation', 'donations', 'demande', 'demandes',
    'urgent', 'urgente', 'urgents', 'urgentes', 'nécessaire', 'nécessaires',
    'important', 'importante', 'importants', 'importantes',
    'produit', 'produits', 'livraison', 'livraisons', 'quantité', 'quantités',
    'bénévolat', 'organisé', 'organisée', 'organisés', 'organisées',
    // Palabras comunes en francés
    'bonjour', 'merci', 'svp', 'sil', 'vous', 'plaît', 'bien', 'très',
    'pour', 'avec', 'dans', 'plus', 'tout', 'tous', 'toute', 'toutes',
    'nous', 'avons', 'besoin', 'faire', 'être', 'avoir', 'aller',
    'pouvoir', 'vouloir', 'devoir', 'savoir', 'prendre', 'donner',
    'mettre', 'voir', 'venir', 'partir', 'sortir', 'entrer',
    'cette', 'cette', 'ceci', 'cela', 'celui', 'celle', 'ceux', 'celles',
    'quel', 'quelle', 'quels', 'quelles', 'lequel', 'laquelle',
    'comment', 'quand', 'pourquoi', 'où', 'combien',
    'aujourd', 'hui', 'demain', 'hier', 'maintenant', 'bientôt',
    'toujours', 'jamais', 'souvent', 'parfois', 'encore', 'déjà'
  ],
  en: [
    'food', 'bank', 'organizations', 'beneficiaries', 'commodities',
    'counter', 'order', 'inventory', 'departments', 'volunteer',
    'donations', 'distribution', 'storage', 'logistics', 'transport',
    'urgent', 'important', 'necessary', 'product', 'products',
    'delivery', 'quantity', 'quantities', 'request', 'requests'
  ],
  es: [
    'banco', 'alimentario', 'organismos', 'beneficiarios', 'alimentos',
    'mostrador', 'pedido', 'inventario', 'departamentos', 'voluntario',
    'donaciones', 'distribución', 'almacenamiento', 'logística', 'transporte',
    'urgente', 'importante', 'necesario', 'producto', 'productos',
    'entrega', 'cantidad', 'cantidades', 'solicitud', 'solicitudes'
  ],
  ar: [
    'بنك', 'غذائي', 'منظمات', 'مستفيدين', 'سلع',
    'عداد', 'طلب', 'مخزون', 'أقسام', 'متطوع'
  ]
};

// Correcciones comunes en francés
const commonCorrections: Record<string, string> = {
  // Errores comunes de escritura
  'comande': 'commande',
  'comandé': 'commandé',
  'comandes': 'commandes',
  'alimantaire': 'alimentaire',
  'alimantaires': 'alimentaires',
  'bénéficiere': 'bénéficiaire',
  'bénéficieres': 'bénéficiaires',
  'départment': 'département',
  'départments': 'départements',
  'bénévol': 'bénévole',
  'bénévols': 'bénévoles',
  'entreposge': 'entreposage',
  'logistike': 'logistique',
  'transpor': 'transport',
  'inventair': 'inventaire',
  'inventairs': 'inventaires',
  'distribusion': 'distribution',
  'comptwar': 'comptoir',
  'donasion': 'donation',
  'donasions': 'donations',
  'volantaire': 'volontaire',
  'volantaires': 'volontaires',
  'demende': 'demande',
  'demendes': 'demandes',
  'nésessaire': 'nécessaire',
  'nésessaires': 'nécessaires',
  'urjent': 'urgent',
  'urjente': 'urgente',
  'urjents': 'urgents',
  'urjentes': 'urgentes',
  'importent': 'important',
  'importente': 'importante',
  'importents': 'importants',
  'importentes': 'importantes',
  'livrezon': 'livraison',
  'quantiter': 'quantité',
  'quantiters': 'quantités',
  'bénévolet': 'bénévolat',
  // Errores comunes generales en francés
  'mesage': 'message',
  'mesages': 'messages',
  'envoyé': 'envoyé',
  'envoié': 'envoyé',
  'recue': 'reçu',
  'recus': 'reçus',
  'recu': 'reçu',
  'avoire': 'avoir',
  'alé': 'allé',
  'alée': 'allée',
  'fait': 'fait',
  'faite': 'faite',
  'ete': 'été',
  'étais': 'étais',
  'sait': 'sait',
  'savoir': 'savoir',
  'personn': 'personne',
  'personnes': 'personnes',
  'reponse': 'réponse',
  'reponses': 'réponses',
  'reponds': 'réponds',
  'repondre': 'répondre',
  'nouveaux': 'nouveau',
  'nouvaux': 'nouveau',
  'bonjur': 'bonjour',
  'bnjour': 'bonjour',
  'merçi': 'merci',
  'mercis': 'merci'
};

export function TextareaSpellCheck({
  value,
  onChange,
  language = 'fr',
  showSpellCheck = true,
  className,
  ...props
}: TextareaSpellCheckProps) {
  const [suggestions, setSuggestions] = useState<Array<{ word: string; originalWord: string; suggestions: string[]; position: number }>>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [isRestructuring, setIsRestructuring] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Verificar ortografía cuando el valor cambia
  useEffect(() => {
    if (!showSpellCheck || !value) {
      setSuggestions([]);
      return;
    }

    const checkSpelling = () => {
      const newSuggestions: Array<{ word: string; originalWord: string; suggestions: string[]; position: number }> = [];
      
      // Buscar palabras con regex que preserve la posición
      const wordRegex = /\b[a-zA-ZÀ-ÿ]+\b/g;
      let match;
      
      while ((match = wordRegex.exec(value)) !== null) {
        const originalWord = match[0];
        const cleanWord = originalWord.toLowerCase();
        const position = match.index;
        
        // Si la palabra está en el diccionario personalizado, no marcarla como error
        if (customDictionary[language]?.some(w => w.toLowerCase() === cleanWord)) {
          continue;
        }
        
        // Si la palabra tiene menos de 2 caracteres, ignorarla (antes era 3)
        if (cleanWord.length < 2) {
          continue;
        }

        // Verificar si hay una corrección común disponible
        if (commonCorrections[cleanWord]) {
          newSuggestions.push({
            word: cleanWord,
            originalWord: originalWord,
            suggestions: [commonCorrections[cleanWord]],
            position
          });
        }
      }

      setSuggestions(newSuggestions);
    };

    // Debounce para evitar verificaciones excesivas (reducido de 500 a 300ms)
    const timeout = setTimeout(checkSpelling, 300);
    return () => clearTimeout(timeout);
  }, [value, language, showSpellCheck]);

  const applySuggestion = (originalWord: string, suggestion: string) => {
    // Preservar el caso de la primera letra
    const firstCharUpper = originalWord[0] === originalWord[0].toUpperCase();
    const correctedWord = firstCharUpper 
      ? suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
      : suggestion;
    
    // Crear regex que escape caracteres especiales
    const escapedWord = originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Reemplazar todas las ocurrencias de la palabra
    const newValue = value.replace(new RegExp(`\\b${escapedWord}\\b`, 'gi'), correctedWord);
    
    // Crear un evento sintético simple y directo
    const syntheticEvent = {
      target: { value: newValue, name: props.name || '' },
      currentTarget: { value: newValue, name: props.name || '' }
    } as any;
    
    // Llamar al onChange del padre
    onChange(syntheticEvent);
    
    // Remover la sugerencia aplicada después de un pequeño delay
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s.originalWord !== originalWord));
    }, 100);
  };

  const dismissSuggestion = (originalWord: string) => {
    setSuggestions(suggestions.filter(s => s.originalWord !== originalWord));
  };

  const restructureParagraph = () => {
    if (!value.trim()) return;
    
    setIsRestructuring(true);
    
    // Aplicar todas las correcciones ortográficas primero
    let restructuredText = value;
    
    // Aplicar todas las correcciones del diccionario
    Object.entries(commonCorrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      restructuredText = restructuredText.replace(regex, (match) => {
        // Preservar mayúscula inicial
        if (match[0] === match[0].toUpperCase()) {
          return correct.charAt(0).toUpperCase() + correct.slice(1);
        }
        return correct;
      });
    });
    
    // Mejorar capitalización: primera letra de cada oración
    restructuredText = restructuredText.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (match, separator, letter) => {
      return separator + letter.toUpperCase();
    });
    
    // Asegurar capitalización al inicio si no hay
    if (restructuredText.length > 0) {
      restructuredText = restructuredText.charAt(0).toUpperCase() + restructuredText.slice(1);
    }
    
    // Mejorar puntuación: agregar punto final si no existe
    const lastChar = restructuredText.trim().slice(-1);
    if (lastChar && !['.', '!', '?'].includes(lastChar)) {
      restructuredText = restructuredText.trim() + '.';
    }
    
    // Corregir espacios múltiples
    restructuredText = restructuredText.replace(/\s+/g, ' ');
    
    // Corregir espacios antes de puntuación
    restructuredText = restructuredText.replace(/\s+([.,;:!?])/g, '$1');
    
    // Asegurar espacio después de puntuación
    restructuredText = restructuredText.replace(/([.,;:!?])([a-zA-ZÀ-ÿ])/g, '$1 $2');
    
    // Corregir comillas y apóstrofes
    restructuredText = restructuredText.replace(/\s+'/g, "'");
    restructuredText = restructuredText.replace(/'\s+/g, "' ");
    
    // Crear evento sintético
    const syntheticEvent = {
      target: { value: restructuredText, name: props.name || '' },
      currentTarget: { value: restructuredText, name: props.name || '' }
    } as any;
    
    onChange(syntheticEvent);
    
    // Limpiar sugerencias
    setSuggestions([]);
    
    setTimeout(() => {
      setIsRestructuring(false);
    }, 500);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        spellCheck={showSpellCheck}
        lang={language}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-lg resize-vertical min-h-[100px]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          suggestions.length > 0 && showSpellCheck && "border-yellow-400",
          className
        )}
        {...props}
      />
      
      {/* Indicador de corrección activa y botón de reestructurar */}
      {showSpellCheck && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {value.trim().length > 10 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={restructureParagraph}
              disabled={isRestructuring}
              className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200"
              title="Reestructurar y mejorar el texto"
            >
              <Sparkles className={cn("w-3 h-3 mr-1", isRestructuring && "animate-spin")} />
              Reestructurer
            </Button>
          )}
          
          {suggestions.length === 0 ? (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <CheckCircle2 className="w-3 h-3" />
              <span>Aucune erreur</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              <span>{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Panel de sugerencias */}
      {showSpellCheck && suggestions.length > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Corrections suggérées
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-600 line-through">
                      {suggestion.word}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-green-600">
                      {suggestion.suggestions[0]}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => applySuggestion(suggestion.originalWord, suggestion.suggestions[0])}
                    className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    Corriger
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissSuggestion(suggestion.originalWord)}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}