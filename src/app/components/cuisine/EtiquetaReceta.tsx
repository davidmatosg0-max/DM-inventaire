import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Printer, Download, X, Calendar, Clock, Package, ChefHat, AlertCircle } from 'lucide-react';
import { type Receta } from '../../utils/recetaStorage';
import { Label } from '../ui/label';

// Tipos de etiquetas soportadas
type TipoEtiqueta = 'dymo-large' | 'dymo-medium' | 'brother-large' | 'brother-medium' | 'standard' | 'dymo-small' | 'full-info';

interface ConfigEtiqueta {
  nombre: string;
  ancho: string;
  alto: string;
  descripcion: string;
  fontSize: {
    titulo: string;
    label: string;
    value: string;
    ingredientes: string;
  };
  padding: string;
}

const CONFIGURACIONES_ETIQUETAS: Record<TipoEtiqueta, ConfigEtiqueta> = {
  'dymo-large': {
    nombre: 'Dymo LabelWriter Large (54×101mm)',
    ancho: '54mm',
    alto: '101mm',
    descripcion: 'Compatible: Dymo LabelWriter 450/4XL',
    fontSize: {
      titulo: '14pt',
      label: '7pt',
      value: '10pt',
      ingredientes: '8pt'
    },
    padding: '0.3cm'
  },
  'dymo-medium': {
    nombre: 'Dymo Medium (89×36mm)',
    ancho: '89mm',
    alto: '36mm',
    descripcion: 'Compatible: Dymo LabelWriter 450 Address',
    fontSize: {
      titulo: '10pt',
      label: '5pt',
      value: '7pt',
      ingredientes: '6pt'
    },
    padding: '0.2cm'
  },
  'dymo-small': {
    nombre: 'Dymo Small (54×25mm)',
    ancho: '54mm',
    alto: '25mm',
    descripcion: 'Compatible: Dymo LabelWriter Mini',
    fontSize: {
      titulo: '8pt',
      label: '5pt',
      value: '6pt',
      ingredientes: '6pt'
    },
    padding: '0.15cm'
  },
  'brother-large': {
    nombre: 'Brother QL Large (62×100mm)',
    ancho: '62mm',
    alto: '100mm',
    descripcion: 'Compatible: Brother QL-700/800/820NWB',
    fontSize: {
      titulo: '14pt',
      label: '7pt',
      value: '10pt',
      ingredientes: '8pt'
    },
    padding: '0.3cm'
  },
  'brother-medium': {
    nombre: 'Brother QL Medium (62×29mm)',
    ancho: '62mm',
    alto: '29mm',
    descripcion: 'Compatible: Brother QL-570/700',
    fontSize: {
      titulo: '9pt',
      label: '5pt',
      value: '7pt',
      ingredientes: '6pt'
    },
    padding: '0.2cm'
  },
  'standard': {
    nombre: 'Standard (10×15cm)',
    ancho: '10cm',
    alto: '15cm',
    descripcion: 'Formato estándar para impresoras convencionales',
    fontSize: {
      titulo: '20pt',
      label: '10pt',
      value: '14pt',
      ingredientes: '11pt'
    },
    padding: '1cm'
  },
  'full-info': {
    nombre: 'Information Complète (21×29.7cm) - A4',
    ancho: '21cm',
    alto: '29.7cm',
    descripcion: '📋 TOUS les ingrédients visibles - Format A4',
    fontSize: {
      titulo: '18pt',
      label: '9pt',
      value: '11pt',
      ingredientes: '10pt'
    },
    padding: '0.8cm'
  }
};

interface EtiquetaRecetaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receta: Receta | null;
  lote?: string;
  fechaElaboracion?: string;
  fechaCaducidad?: string;
  cantidadProducida?: number;
}

export function EtiquetaReceta({
  open,
  onOpenChange,
  receta,
  lote,
  fechaElaboracion,
  fechaCaducidad,
  cantidadProducida
}: EtiquetaRecetaProps) {
  const etiquetaRef = useRef<HTMLDivElement>(null);
  const [tipoEtiqueta, setTipoEtiqueta] = useState<TipoEtiqueta>('standard');

  if (!receta) return null;

  // Calcular fecha de caducidad si no se proporciona
  const fechaElab = fechaElaboracion || new Date().toISOString();
  const fechaCad = fechaCaducidad || new Date(
    new Date(fechaElab).getTime() + receta.productoElaborado.diasConservacion * 24 * 60 * 60 * 1000
  ).toISOString();

  const loteGenerado = lote || `LOT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  const cantidadFinal = cantidadProducida || receta.productoElaborado.cantidad;

  // Función para convertir tamaños a mm
  const parseSize = (size: string): number => {
    const value = parseFloat(size);
    const unit = size.replace(value.toString(), '');
    // Convertir todo a mm para comparar
    if (unit === 'cm') return value * 10;
    if (unit === 'mm') return value;
    return value;
  };

  // Función para calcular configuración adaptativa
  const calcularConfigAdaptativa = () => {
    const baseConfig = CONFIGURACIONES_ETIQUETAS[tipoEtiqueta];
    const numIngredientes = receta.ingredientes.length;
    
    // Calcular tamaño total del texto de ingredientes
    const textoIngredientes = receta.ingredientes
      .map(ing => `${ing.productoNombre} (${ing.cantidad} ${ing.unidad})`)
      .join(', ');
    const longitudTexto = textoIngredientes.length;

    // Calcular área disponible en mm
    const anchoMM = parseSize(baseConfig.ancho);
    const altoMM = parseSize(baseConfig.alto);
    const paddingMM = parseSize(baseConfig.padding);
    const esHorizontal = anchoMM > altoMM;

    // Área disponible para ingredientes (después de título, info, separadores)
    const areaOcupadaPorOtros = esHorizontal ? altoMM * 0.45 : altoMM * 0.50; // ~45-50% usado por otros elementos
    const altoDisponible = altoMM - areaOcupadaPorOtros - (paddingMM * 2);
    const anchoDisponible = anchoMM - (paddingMM * 2);

    // Calcular tamaño óptimo de fuente para ingredientes
    let fontSizeIngredientes = parseFloat(baseConfig.fontSize.ingredientes);
    let lineHeight = 1.7;
    let paddingAjustado = baseConfig.padding;

    // Estimar líneas necesarias (aproximado: 60-70 caracteres por línea en promedio)
    const caracteresPorLinea = Math.floor(anchoDisponible / (fontSizeIngredientes * 0.3));
    const lineasNecesarias = Math.ceil(longitudTexto / caracteresPorLinea);
    const altoNecesario = lineasNecesarias * fontSizeIngredientes * lineHeight * 0.35; // 0.35 es conversión pt a mm aproximada

    // Si no cabe, reducir tamaño de fuente
    if (altoNecesario > altoDisponible) {
      const factor = altoDisponible / altoNecesario;
      fontSizeIngredientes = Math.max(4, fontSizeIngredientes * factor * 0.9); // Mínimo 4pt
      lineHeight = Math.max(1.3, lineHeight * 0.95); // Reducir line-height también
      
      // Si aún no cabe, reducir padding
      if (factor < 0.7) {
        const paddingNum = parseSize(baseConfig.padding);
        paddingAjustado = `${Math.max(1, paddingNum * 0.7)}${baseConfig.padding.includes('cm') ? 'cm' : 'mm'}`;
      }
    }

    // Ajustar otros elementos si hay muchos ingredientes
    let fontSizeTitulo = parseFloat(baseConfig.fontSize.titulo);
    let fontSizeLabel = parseFloat(baseConfig.fontSize.label);
    let fontSizeValue = parseFloat(baseConfig.fontSize.value);

    if (numIngredientes > 15) {
      const factorReduccion = Math.max(0.7, 1 - (numIngredientes - 15) * 0.02);
      fontSizeTitulo = Math.max(6, fontSizeTitulo * factorReduccion);
      fontSizeLabel = Math.max(4, fontSizeLabel * factorReduccion);
      fontSizeValue = Math.max(5, fontSizeValue * factorReduccion);
    }

    return {
      ...baseConfig,
      fontSize: {
        titulo: `${fontSizeTitulo}pt`,
        label: `${fontSizeLabel}pt`,
        value: `${fontSizeValue}pt`,
        ingredientes: `${fontSizeIngredientes}pt`
      },
      padding: paddingAjustado,
      lineHeight: lineHeight.toString()
    };
  };

  // Obtener configuración adaptativa
  const config = calcularConfigAdaptativa();

  // Determinar si es un formato pequeño
  const esFormatoCompacto = ['dymo-medium', 'dymo-small', 'brother-medium'].includes(tipoEtiqueta);
  
  // Determinar si es el formato de información completa
  const esFormatoCompleto = tipoEtiqueta === 'full-info';

  // Determinar si debe ser horizontal (ancho > alto)
  const anchoNum = parseSize(config.ancho);
  const altoNum = parseSize(config.alto);
  const esHorizontal = anchoNum > altoNum;

  const handleImprimir = () => {
    const contenidoEtiqueta = etiquetaRef.current;
    if (!contenidoEtiqueta) return;

    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;

    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Étiquette - ${receta.nombre}</title>
          <style>
            @page {
              size: ${config.ancho} ${config.alto};
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.3;
              color: #000;
              background: white;
            }
            .etiqueta-horizontal {
              width: ${config.ancho};
              height: ${config.alto};
              padding: ${config.padding};
              display: flex;
              flex-direction: row;
              gap: 4px;
              border: 3px solid #000;
            }
            .etiqueta-vertical {
              width: ${config.ancho};
              height: ${config.alto};
              padding: ${config.padding};
              display: flex;
              flex-direction: column;
              border: 3px solid #000;
            }
            .nombre-receta {
              font-size: ${config.fontSize.titulo};
              font-weight: bold;
              text-align: center;
              padding: ${esHorizontal ? '4px' : '12px'};
              background: #4CAF50;
              color: white;
              border-radius: 6px;
            }
            .nombre-vertical {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
            }
            .col-izquierda {
              flex-shrink: 0;
              width: 30%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .col-derecha {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .info-item {
              margin-bottom: ${esHorizontal ? '2px' : '12px'};
              padding: ${esHorizontal ? '2px 4px' : '10px'};
              background: #f8f9fa;
              border-left: ${esHorizontal ? '2px' : '4px'} solid #1E73BE;
            }
            .info-label {
              font-size: ${config.fontSize.label};
              color: #666;
              font-weight: 600;
              margin-bottom: 2px;
              line-height: 1.1;
            }
            .info-value {
              font-size: ${config.fontSize.value};
              font-weight: bold;
              color: #000;
              line-height: 1.1;
            }
            .ingredientes-section {
              margin-top: 12px;
              padding: 12px;
              background: #fff8e1;
              border: 2px solid #FFC107;
              border-radius: 8px;
              flex: 1;
            }
            .ingredientes-titulo {
              font-size: ${config.fontSize.label};
              font-weight: bold;
              color: #000;
              margin-bottom: 8px;
              text-align: center;
              text-transform: uppercase;
            }
            .ingredientes-lista {
              font-size: ${config.fontSize.ingredientes};
              line-height: 1.4;
            }
            .ingrediente-item {
              margin-bottom: 4px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${contenidoEtiqueta.innerHTML}
        </body>
      </html>
    `);

    ventanaImpresion.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir
    setTimeout(() => {
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 250);
  };

  const handleDescargarPDF = () => {
    // Usar la misma lógica de impresión pero el usuario puede "Guardar como PDF"
    handleImprimir();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto" aria-describedby="etiqueta-receta-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Printer className="w-6 h-6 text-[#1E73BE]" />
            Impression d'Étiquette
          </DialogTitle>
          <DialogDescription id="etiqueta-receta-description">
            Prévisualisation et impression de l'étiquette pour: {receta.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de formato de etiqueta */}
          <Card className="bg-[#F4F4F4] border-[#1E73BE]">
            <CardContent className="p-4">
              <Label className="text-sm font-semibold text-[#333333] mb-3 block">
                📏 Format d'Étiquette
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(CONFIGURACIONES_ETIQUETAS).map(([tipo, config]) => {
                  const esHorizontalBtn = parseSize(config.ancho) > parseSize(config.alto);
                  return (
                    <button
                      key={tipo}
                      onClick={() => setTipoEtiqueta(tipo as TipoEtiqueta)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        tipoEtiqueta === tipo
                          ? 'border-[#4CAF50] bg-green-50 shadow-md'
                          : 'border-gray-300 bg-white hover:border-[#1E73BE] hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-sm text-[#333333]">
                          {config.nombre}
                        </span>
                        {tipoEtiqueta === tipo && (
                          <span className="text-[#4CAF50]">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-[#666666] mb-1">{config.descripcion}</p>
                      <div className="flex items-center gap-2 text-xs text-[#1E73BE] font-medium">
                        <Package className="w-3 h-3" />
                        {config.ancho} × {config.alto}
                        <span className="ml-auto text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">
                          {esHorizontalBtn ? '↔ Horiz.' : '↕ Vert.'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vista previa de la etiqueta */}
          <Card className="border-2 border-[#1E73BE]">
            <CardContent className="p-6 flex justify-center items-center">
              {esHorizontal ? (
                /* Layout Horizontal */
                <div 
                  ref={etiquetaRef} 
                  className="flex flex-col"
                  style={{
                    width: config.ancho,
                    height: config.alto,
                    padding: config.padding,
                    fontSize: '12pt',
                    background: '#FFFFFF',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    border: '2px solid #000000'
                  }}
                >
                  {/* Título centrado */}
                  <div 
                    className="text-center font-bold mb-2"
                    style={{
                      fontSize: config.fontSize.titulo,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#000000'
                    }}
                  >
                    {receta.nombre}
                  </div>
                  
                  {/* Información compacta */}
                  <div 
                    className="text-center mb-2"
                    style={{
                      fontSize: config.fontSize.value,
                      lineHeight: '1.6',
                      color: '#000000'
                    }}
                  >
                    <strong>LOT:</strong> {loteGenerado} | <strong>Date:</strong> {formatearFechaCorta(fechaElab)} | <strong>Poids:</strong> {cantidadFinal} {receta.productoElaborado.unidad}
                  </div>

                  {/* Separador */}
                  <hr style={{ border: 'none', borderTop: '1px solid #000000', margin: '4px 0' }} />

                  {/* Ingredientes en párrafo */}
                  <div 
                    className="flex-1 text-justify"
                    style={{
                      fontSize: config.fontSize.ingredientes,
                      lineHeight: config.lineHeight || '1.6',
                      color: '#000000',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      {receta.ingredientes.map((ing, index) => {
                        const isLast = index === receta.ingredientes.length - 1;
                        return (
                          <span key={index}>
                            {ing.productoNombre} ({ing.cantidad} {ing.unidad}){!isLast ? ', ' : '.'}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                /* Layout Vertical */
                <div 
                  ref={etiquetaRef} 
                  className="flex flex-col"
                  style={{
                    width: config.ancho,
                    height: config.alto,
                    padding: config.padding,
                    fontSize: '12pt',
                    background: '#FFFFFF',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    border: '2px solid #000000'
                  }}
                >
                  {/* Título principal - INGREDIENTS estilo */}
                  <div 
                    className="text-center font-bold mb-3"
                    style={{
                      fontSize: config.fontSize.titulo,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#000000',
                      borderBottom: '2px solid #000000',
                      paddingBottom: '8px'
                    }}
                  >
                    INGRÉDIENTS
                  </div>

                  {/* Nombre de la receta */}
                  <div 
                    className="text-center font-semibold mb-2"
                    style={{
                      fontSize: config.fontSize.value,
                      color: '#000000',
                      fontStyle: 'italic'
                    }}
                  >
                    {receta.nombre}
                  </div>

                  {/* Información en línea */}
                  <div 
                    className="text-center mb-3"
                    style={{
                      fontSize: config.fontSize.label,
                      lineHeight: '1.4',
                      color: '#000000'
                    }}
                  >
                    <div><strong>LOT:</strong> {loteGenerado}</div>
                    <div><strong>Date:</strong> {formatearFechaCorta(fechaElab)}</div>
                    <div><strong>Poids:</strong> {cantidadFinal} {receta.productoElaborado.unidad} {!esFormatoCompleto && `× ${receta.productoElaborado.pesoUnitario} kg`}</div>
                  </div>

                  {/* Separador decorativo */}
                  <div style={{ borderTop: '1px solid #000000', marginBottom: '12px' }}></div>

                  {/* Lista de ingredientes en párrafo continuo */}
                  <div 
                    className="flex-1 text-justify"
                    style={{
                      fontSize: config.fontSize.ingredientes,
                      lineHeight: config.lineHeight || '1.7',
                      color: '#000000',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      {receta.ingredientes.map((ing, index) => (
                        <span key={index}>
                          {ing.productoNombre} ({ing.cantidad} {ing.unidad}){index < receta.ingredientes.length - 1 ? ', ' : '.'}
                        </span>
                      ))}
                    </p>
                  </div>

                  {/* Footer mensaje */}
                  <div 
                    className="text-center mt-3"
                    style={{
                      fontSize: config.fontSize.label,
                      color: '#000000',
                      borderTop: '1px solid #000000',
                      paddingTop: '8px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Bon Appétit
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#1E73BE] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-[#1E73BE] mb-2">
                    Instructions d'impression - {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].nombre}
                  </p>
                  {esFormatoCompleto && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-300 rounded-md">
                      <p className="font-bold text-[#4CAF50] flex items-center gap-2">
                        ✅ Format Information Complète - Adaptation Automatique
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>TOUS les {receta.ingredientes.length} ingrédients</strong> seront visibles avec adaptation automatique de la taille de police pour optimiser l'espace disponible.
                      </p>
                    </div>
                  )}
                  {!esFormatoCompleto && receta.ingredientes.length > 10 && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-300 rounded-md">
                      <p className="font-bold text-[#1E73BE] flex items-center gap-2">
                        🔄 Adaptation Automatique Activée
                      </p>
                      <p className="text-gray-700 mt-1">
                        La taille de police s'adapte automatiquement pour afficher tous les {receta.ingredientes.length} ingrédients dans le format {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].ancho} × {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].alto}.
                      </p>
                    </div>
                  )}
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Format:</strong> {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].ancho} × {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].alto}</li>
                    <li>• <strong>Imprimante:</strong> {CONFIGURACIONES_ETIQUETAS[tipoEtiqueta].descripcion}</li>
                    <li>• Utilisez du papier adhésif pour étiquettes alimentaires</li>
                    <li>• Configurez l'orientation selon le format (portrait/paysage)</li>
                    <li>• Pour enregistrer en PDF, sélectionnez "Enregistrer au format PDF" lors de l'impression</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
            <Button
              variant="outline"
              onClick={handleDescargarPDF}
              className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Enregistrer PDF
            </Button>
            <Button
              onClick={handleImprimir}
              className="bg-[#1E73BE] hover:bg-[#1557A0] text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}