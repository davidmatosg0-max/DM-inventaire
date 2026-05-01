/**
 * Corrector de Texto Multilingüe
 * 
 * Componente para corregir ortografía y gramática en español, inglés, árabe y francés.
 * Muestra la frase corregida, lista de correcciones y sugerencias.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  FileText,
  Languages,
  Sparkles,
  AlignLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

interface CorrectionResult {
  originalText: string;
  correctedText: string;
  corrections: Correction[];
  suggestions: string[];
  structuredText: string;
  language: string;
}

// Reglas de corrección para español
const spanishRules = [
  { pattern: /\brecivir\b/gi, replacement: 'recibir', explanation: 'Ortografía: b/v' },
  { pattern: /\bhaver\b/gi, replacement: 'haber', explanation: 'Ortografía: b/v' },
  { pattern: /\bhace(?=n|mos)\b/gi, replacement: 'hacer', explanation: 'Conjugación verbal' },
  { pattern: /\ba\s+sido\b/gi, replacement: 'ha sido', explanation: 'Verbo auxiliar "haber"' },
  { pattern: /\ba\s+ver\b/gi, replacement: 'a ver', explanation: 'Expresión correcta' },
  { pattern: /\bhaber\s+si\b/gi, replacement: 'a ver si', explanation: 'Expresión correcta' },
  { pattern: /\bde\s+acuerdo\b/gi, replacement: 'de acuerdo', explanation: 'Expresión correcta' },
  { pattern: /\btambien\b/gi, replacement: 'también', explanation: 'Falta tilde' },
  { pattern: /\besta(?=\s+[a-záéíóúñ])/gi, replacement: 'está', explanation: 'Falta tilde en verbo' },
  { pattern: /\bque\s+(\w+)\s+que\b/gi, replacement: 'que $1', explanation: 'Repetición innecesaria' },
  { pattern: /\bpara\s+que\s+para\b/gi, replacement: 'para que', explanation: 'Repetición innecesaria' },
  { pattern: /\bel\s+agua\b/gi, replacement: 'el agua', explanation: 'Correcto (sustantivo femenino con artículo masculino)' },
];

// Reglas de corrección para inglés
const englishRules = [
  { pattern: /\brecieve\b/gi, replacement: 'receive', explanation: 'Spelling: i before e except after c' },
  { pattern: /\bthier\b/gi, replacement: 'their', explanation: 'Spelling: ie/ei confusion' },
  { pattern: /\boccured\b/gi, replacement: 'occurred', explanation: 'Spelling: double consonant' },
  { pattern: /\baccommodate\b/gi, replacement: 'accommodate', explanation: 'Spelling: double m, double c' },
  { pattern: /\bdefinate\b/gi, replacement: 'definite', explanation: 'Spelling: i not a' },
  { pattern: /\bseperate\b/gi, replacement: 'separate', explanation: 'Spelling: a not e' },
  { pattern: /\bits\s+a\b/gi, replacement: "it's", explanation: "Contraction of 'it is'" },
  { pattern: /\byour\s+welcome\b/gi, replacement: "you're welcome", explanation: "Contraction of 'you are'" },
  { pattern: /\bshould\s+of\b/gi, replacement: 'should have', explanation: 'Correct verb form' },
  { pattern: /\bcould\s+of\b/gi, replacement: 'could have', explanation: 'Correct verb form' },
  { pattern: /\bthere\s+(\w+)\s+there\b/gi, replacement: 'there $1', explanation: 'Unnecessary repetition' },
];

// Reglas de corrección para árabe
const arabicRules = [
  { pattern: /\bاحسن\b/g, replacement: 'أحسن', explanation: 'همزة القطع' },
  { pattern: /\bاكبر\b/g, replacement: 'أكبر', explanation: 'همزة القطع' },
  { pattern: /\bالي\b/g, replacement: 'إلى', explanation: 'حرف جر' },
  { pattern: /\bهاذا\b/g, replacement: 'هذا', explanation: 'اسم إشارة' },
  { pattern: /\bهاذه\b/g, replacement: 'هذه', explanation: 'اسم إشارة' },
  { pattern: /\bاللذي\b/g, replacement: 'الذي', explanation: 'اسم موصول' },
  { pattern: /\bاللتي\b/g, replacement: 'التي', explanation: 'اسم موصول' },
  { pattern: /\bمعا\b/g, replacement: 'معاً', explanation: 'تنوين' },
];

// Reglas de corrección para francés
const frenchRules = [
  { pattern: /\bje\s+sus\b/gi, replacement: 'je suis', explanation: 'Conjugaison du verbe être' },
  { pattern: /\btu\s+es\s+content\b/gi, replacement: 'tu es content', explanation: 'Correct' },
  { pattern: /\btu\s+a\b/gi, replacement: 'tu as', explanation: 'Conjugaison du verbe avoir' },
  { pattern: /\bil\s+a\s+(?!été|fait|dit|vu)\b/gi, replacement: 'il a ', explanation: 'Conjugaison du verbe avoir (correct)' },
  { pattern: /\bpor\b/gi, replacement: 'pour', explanation: 'Orthographe: pour (pas por)' },
  { pattern: /\bpourqoi\b/gi, replacement: 'pourquoi', explanation: 'Orthographe: manque "u"' },
  { pattern: /\bparmis\b/gi, replacement: 'parmi', explanation: 'Orthographe: pas de "s"' },
  { pattern: /\bmalgres\b/gi, replacement: 'malgré', explanation: 'Orthographe: accent' },
  { pattern: /\bbiensur\b/gi, replacement: 'bien sûr', explanation: 'Orthographe: deux mots + accent' },
  { pattern: /\bje\s+vais\s+aller\b/gi, replacement: 'je vais', explanation: 'Futur proche: pas besoin de "aller"' },
  { pattern: /\bje\s+peut\b/gi, replacement: 'je peux', explanation: 'Conjugaison: 1ère personne' },
  { pattern: /\bsa\s+fait\b/gi, replacement: 'ça fait', explanation: 'Orthographe: ça (démonstratif)' },
  { pattern: /\bquand\s+meme\b/gi, replacement: 'quand même', explanation: 'Orthographe: accent circonflexe' },
  { pattern: /\ba\s+cause\b/gi, replacement: 'à cause', explanation: 'Orthographe: accent grave' },
  { pattern: /\bparceque\b/gi, replacement: 'parce que', explanation: 'Orthographe: deux mots' },
  { pattern: /\bpuisque\s+que\b/gi, replacement: 'puisque', explanation: 'Répétition: enlever "que"' },
  { pattern: /\btoi\s+aussi\b/gi, replacement: 'toi aussi', explanation: 'Correct' },
];

export function TextCorrector() {
  const { t, i18n } = useTranslation();
  
  // Estado
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'ar' | 'fr'>('fr');

  // Detectar idioma del texto
  const detectLanguage = (text: string): 'es' | 'en' | 'ar' => {
    // Detectar árabe por caracteres Unicode
    if (/[\u0600-\u06FF]/.test(text)) {
      return 'ar';
    }
    
    // Palabras comunes en español
    const spanishWords = /\b(el|la|los|las|de|del|que|para|con|por|como|muy|más|es|está|son|un|una)\b/gi;
    const spanishMatches = (text.match(spanishWords) || []).length;
    
    // Palabras comunes en inglés
    const englishWords = /\b(the|of|and|to|in|is|it|that|for|you|with|on|have|this|be|at)\b/gi;
    const englishMatches = (text.match(englishWords) || []).length;
    
    return spanishMatches > englishMatches ? 'es' : 'en';
  };

  // Aplicar correcciones según el idioma
  const applyCorrections = (text: string, language: 'es' | 'en' | 'ar' | 'fr'): CorrectionResult => {
    let correctedText = text;
    const corrections: Correction[] = [];
    
    // Seleccionar reglas según idioma
    const rules = language === 'es' 
      ? spanishRules 
      : language === 'en' 
      ? englishRules 
      : language === 'ar'
      ? arabicRules
      : frenchRules;
    
    // Aplicar cada regla
    rules.forEach(rule => {
      const matches = text.match(rule.pattern);
      if (matches) {
        matches.forEach(match => {
          if (!corrections.find(c => c.original === match)) {
            const correctedWord = match.replace(rule.pattern, rule.replacement);
            if (match !== correctedWord) {
              corrections.push({
                original: match,
                corrected: correctedWord,
                explanation: rule.explanation
              });
            }
          }
        });
        correctedText = correctedText.replace(rule.pattern, rule.replacement);
      }
    });
    
    // Generar sugerencias según el idioma
    const suggestions = generateSuggestions(correctedText, language);
    
    // Generar estructura mejorada del texto
    const structuredText = generateStructuredText(correctedText, language);
    
    return {
      originalText: text,
      correctedText,
      corrections,
      suggestions,
      structuredText,
      language
    };
  };

  // Generar sugerencias de mejora
  const generateSuggestions = (text: string, language: 'es' | 'en' | 'ar' | 'fr'): string[] => {
    const suggestions: string[] = [];
    
    if (language === 'es') {
      if (/[.!?]\s*[a-záéíóúñ]/.test(text)) {
        suggestions.push('Considere usar mayúscula después de punto');
      }
      if ((text.match(/,/g) || []).length > 5) {
        suggestions.push('Muchas comas, considere dividir en oraciones más cortas');
      }
      if (text.length > 200 && !/[.!?]/.test(text)) {
        suggestions.push('Texto largo sin puntuación, considere agregar puntos');
      }
      if (/\b(muy|mucho)\s+(muy|mucho)\b/gi.test(text)) {
        suggestions.push('Evite repetir intensificadores como "muy"');
      }
    } else if (language === 'en') {
      if (/[.!?]\s*[a-z]/.test(text)) {
        suggestions.push('Consider capitalizing after period');
      }
      if ((text.match(/,/g) || []).length > 5) {
        suggestions.push('Many commas, consider shorter sentences');
      }
      if (/\b(very|really)\s+(very|really)\b/gi.test(text)) {
        suggestions.push('Avoid repeating intensifiers like "very"');
      }
    } else if (language === 'fr') {
      if (/[.!?]\s*[a-zàâäæçéèêëïîôùûüÿœ]/.test(text)) {
        suggestions.push('Considérez utiliser une majuscule après le point');
      }
      if ((text.match(/,/g) || []).length > 5) {
        suggestions.push('Beaucoup de virgules, considérez des phrases plus courtes');
      }
      if (text.length > 200 && !/[.!?]/.test(text)) {
        suggestions.push('Texte long sans ponctuation, considérez ajouter des points');
      }
    } else if (language === 'ar') {
      if (text.length > 200 && !/[.،؛]/.test(text)) {
        suggestions.push('نص طويل بدون علامات ترقيم، فكر في إضافة نقاط');
      }
      if (!text.match(/[\u064B-\u0652]/)) {
        suggestions.push('فكر في إضافة التشكيل للوضوح');
      }
    }
    
    return suggestions;
  };

  // Generar estructura mejorada del texto
  const generateStructuredText = (text: string, language: 'es' | 'en' | 'ar' | 'fr'): string => {
    // Eliminar espacios múltiples
    let structured = text.replace(/\s+/g, ' ').trim();
    
    // Capitalizar después de punto (incluye caracteres franceses)
    if (language === 'fr') {
      structured = structured.replace(/([.!?])\s+([a-zàâäæçéèêëïîôùûüÿœ])/gi, (match, punctuation, letter) => {
        return punctuation + ' ' + letter.toUpperCase();
      });
    } else {
      structured = structured.replace(/([.!?])\s+([a-záéíóúñ])/gi, (match, punctuation, letter) => {
        return punctuation + ' ' + letter.toUpperCase();
      });
    }
    
    // Capitalizar primera letra
    structured = structured.charAt(0).toUpperCase() + structured.slice(1);
    
    // Dividir en oraciones
    const sentences = structured.split(/([.!?])\s+/);
    const formattedSentences: string[] = [];
    let currentSentence = '';
    
    sentences.forEach((part, index) => {
      if (part.match(/[.!?]/)) {
        currentSentence += part;
        formattedSentences.push(currentSentence.trim());
        currentSentence = '';
      } else {
        currentSentence += part;
      }
    });
    
    if (currentSentence.trim()) {
      formattedSentences.push(currentSentence.trim());
    }
    
    // Agrupar oraciones en párrafos (cada 3-4 oraciones)
    const paragraphs: string[] = [];
    for (let i = 0; i < formattedSentences.length; i += 3) {
      const paragraph = formattedSentences.slice(i, i + 3).join(' ');
      paragraphs.push(paragraph);
    }
    
    // Unir párrafos con doble salto de línea
    return paragraphs.join('\n\n');
  };

  // Procesar corrección
  const handleCorrect = () => {
    if (!inputText.trim()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simular procesamiento asíncrono
    setTimeout(() => {
      const detectedLanguage = selectedLanguage;
      const correctionResult = applyCorrections(inputText, detectedLanguage);
      setResult(correctionResult);
      setIsProcessing(false);
    }, 800);
  };

  // Limpiar formulario
  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  // Copiar texto corregido
  const handleCopy = () => {
    if (result?.correctedText) {
      copiarAlPortapapeles(result.correctedText);
      toast.success(t('textCorrector.copied', 'Texto copiado al portapapeles'));
    }
  };

  const getLanguageName = (lang: string) => {
    switch(lang) {
      case 'es': return 'Español';
      case 'en': return 'English';
      case 'ar': return 'العربية';
      case 'fr': return 'Français';
      default: return lang;
    }
  };

  return (
    <div className="space-y-6">
      {/* Entrada de texto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1a4d7a]" />
            {t('textCorrector.title', 'Corrección de Texto')}
          </CardTitle>
          <CardDescription>
            {t('textCorrector.description', 'Corrija ortografía y gramática en español, francés, inglés y árabe')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selector de idioma */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              {t('textCorrector.language', 'Idioma del Texto')}
            </Label>
            <div className="flex gap-2">
              <Button
                variant={selectedLanguage === 'es' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('es')}
                className={selectedLanguage === 'es' ? 'bg-[#1a4d7a] hover:bg-[#143d5f]' : ''}
              >
                Español
              </Button>
              <Button
                variant={selectedLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('en')}
                className={selectedLanguage === 'en' ? 'bg-[#1a4d7a] hover:bg-[#143d5f]' : ''}
              >
                English
              </Button>
              <Button
                variant={selectedLanguage === 'ar' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('ar')}
                className={selectedLanguage === 'ar' ? 'bg-[#1a4d7a] hover:bg-[#143d5f]' : ''}
                dir="rtl"
              >
                العربية
              </Button>
              <Button
                variant={selectedLanguage === 'fr' ? 'default' : 'outline'}
                onClick={() => setSelectedLanguage('fr')}
                className={selectedLanguage === 'fr' ? 'bg-[#1a4d7a] hover:bg-[#143d5f]' : ''}
              >
                Français
              </Button>
            </div>
          </div>

          {/* Área de texto */}
          <div className="space-y-2">
            <Label htmlFor="inputText">
              {t('textCorrector.inputLabel', 'Texto a Corregir')}
            </Label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('textCorrector.placeholder', 'Escriba o pegue el texto aquí...')}
              className={`w-full h-40 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] ${
                selectedLanguage === 'ar' ? 'text-right' : 'text-left'
              }`}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            />
            <p className="text-sm text-gray-500">
              {inputText.length} {t('textCorrector.characters', 'caracteres')}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              onClick={handleCorrect}
              disabled={!inputText.trim() || isProcessing}
              className="flex-1 bg-[#2d9561] hover:bg-[#257a4f]"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('textCorrector.processing', 'Procesando...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('textCorrector.correct', 'Corregir')}
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
            >
              {t('textCorrector.clear', 'Limpiar')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {result && (
        <>
          {/* Texto corregido */}
          <Card className="border-2 border-[#2d9561]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2d9561]" />
                  {t('textCorrector.correctedText', 'Texto Corregido')}
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50">
                  <Languages className="w-3 h-3 mr-1" />
                  {getLanguageName(result.language)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className={`p-4 bg-green-50 rounded-lg border border-green-200 ${
                result.language === 'ar' ? 'text-right' : 'text-left'
              }`} dir={result.language === 'ar' ? 'rtl' : 'ltr'}>
                <p className="text-gray-800 leading-relaxed">{result.correctedText}</p>
              </div>
              
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
              >
                {t('textCorrector.copy', 'Copiar Texto')}
              </Button>
            </CardContent>
          </Card>

          {/* Estructura Sugerida */}
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlignLeft className="w-5 h-5 text-purple-600" />
                  {t('textCorrector.structuredText', 'Estructura Sugerida')}
                </CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  Profesional
                </Badge>
              </div>
              <CardDescription>
                {t('textCorrector.structuredDescription', 'Texto reorganizado con párrafos y formato profesional')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className={`p-4 bg-purple-50 rounded-lg border border-purple-200 ${
                result.language === 'ar' ? 'text-right' : 'text-left'
              }`} dir={result.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="space-y-4">
                  {result.structuredText.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-800 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (result?.structuredText) {
                    copiarAlPortapapeles(result.structuredText);
                    toast.success(t('textCorrector.copiedStructured', 'Texto estructurado copiado al portapapeles'));
                  }
                }}
                variant="outline"
                size="sm"
              >
                {t('textCorrector.copyStructured', 'Copiar Texto Estructurado')}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de correcciones */}
          {result.corrections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#1a4d7a]" />
                  {t('textCorrector.corrections', 'Correcciones Realizadas')}
                  <Badge variant="secondary">{result.corrections.length}</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {result.corrections.map((correction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 bg-red-100 text-red-700 rounded font-medium ${
                            result.language === 'ar' ? 'text-right' : ''
                          }`}>
                            {correction.original}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 bg-green-100 text-green-700 rounded font-medium ${
                            result.language === 'ar' ? 'text-right' : ''
                          }`}>
                            {correction.corrected}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {correction.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sugerencias */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {t('textCorrector.suggestions', 'Sugerencias de Mejora')}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <Alert key={index} className="border-amber-200 bg-amber-50">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <AlertDescription className={`text-amber-700 ${
                        result.language === 'ar' ? 'text-right' : ''
                      }`} dir={result.language === 'ar' ? 'rtl' : 'ltr'}>
                        {suggestion}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sin correcciones */}
          {result.corrections.length === 0 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      {t('textCorrector.noCorrections', '¡Excelente!')}
                    </h3>
                    <p className="text-green-700">
                      {t('textCorrector.noCorrectionsDesc', 'No se encontraron errores en el texto.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}