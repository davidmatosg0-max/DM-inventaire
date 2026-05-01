import React from 'react';
import Barcode from 'react-barcode';

export interface DatosEtiqueta {
  tipo: 'ubicacion' | 'producto' | 'lote';
  titulo: string;
  codigo: string;
  subtitulo?: string;
  descripcion?: string;
  icono?: string;
  fechaVencimiento?: string;
  lote?: string;
  categoria?: string;
  mostrarQR?: boolean;
}

interface EtiquetaImprimibleProps {
  datos: DatosEtiqueta;
  tamano?: 'pequena' | 'mediana' | 'grande';
  formato?: 'EAN13' | 'CODE128' | 'CODE39';
}

export function EtiquetaImprimible({ 
  datos, 
  tamano = 'mediana',
  formato = 'CODE128'
}: EtiquetaImprimibleProps) {
  const dimensiones = {
    pequena: { width: '6cm', height: '4cm', barcodeWidth: 1.2, barcodeHeight: 30 },
    mediana: { width: '10cm', height: '6cm', barcodeWidth: 1.8, barcodeHeight: 45 },
    grande: { width: '14cm', height: '8cm', barcodeWidth: 2.5, barcodeHeight: 60 }
  };

  const dim = dimensiones[tamano];

  return (
    <div 
      className="etiqueta-imprimible bg-white border-2 border-gray-800 flex flex-col items-center justify-between p-4"
      style={{
        width: dim.width,
        height: dim.height,
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header */}
      <div className="w-full text-center border-b-2 border-gray-300 pb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          {datos.icono && (
            <span className="text-2xl">{datos.icono}</span>
          )}
          <h3 className="font-bold text-lg uppercase tracking-wide">
            {datos.titulo}
          </h3>
        </div>
        {datos.subtitulo && (
          <p className="text-xs text-gray-600 font-medium">
            {datos.subtitulo}
          </p>
        )}
      </div>

      {/* Código de Barras */}
      <div className="flex-1 flex items-center justify-center w-full py-2">
        <Barcode
          value={datos.codigo}
          format={formato}
          width={dim.barcodeWidth}
          height={dim.barcodeHeight}
          displayValue={true}
          fontSize={tamano === 'pequena' ? 12 : tamano === 'mediana' ? 14 : 16}
          margin={0}
          background="#ffffff"
          lineColor="#000000"
        />
      </div>

      {/* Footer con información adicional */}
      <div className="w-full border-t-2 border-gray-300 pt-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {datos.categoria && (
            <div>
              <span className="font-semibold">Categoría:</span>
              <p className="truncate">{datos.categoria}</p>
            </div>
          )}
          {datos.lote && (
            <div>
              <span className="font-semibold">Lote:</span>
              <p className="truncate">{datos.lote}</p>
            </div>
          )}
          {datos.fechaVencimiento && (
            <div className="col-span-2">
              <span className="font-semibold">Vencimiento:</span>
              <p className="font-bold text-red-600">{datos.fechaVencimiento}</p>
            </div>
          )}
          {datos.descripcion && (
            <div className="col-span-2">
              <p className="text-gray-600 text-[10px] truncate">{datos.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer fijo */}
      <div className="w-full text-center mt-2 pt-2 border-t border-gray-200">
        <p className="text-[8px] text-gray-400">
          Banque Alimentaire - Système de Gestion
        </p>
      </div>
    </div>
  );
}

interface VistaImpresionProps {
  etiquetas: DatosEtiqueta[];
  tamano?: 'pequena' | 'mediana' | 'grande';
  formato?: 'EAN13' | 'CODE128' | 'CODE39';
  columnas?: number;
}

export function VistaImpresion({ 
  etiquetas, 
  tamano = 'mediana',
  formato = 'CODE128',
  columnas = 2
}: VistaImpresionProps) {
  return (
    <div className={`grid gap-4 p-4`} style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
      {etiquetas.map((etiqueta, index) => (
        <EtiquetaImprimible
          key={index}
          datos={etiqueta}
          tamano={tamano}
          formato={formato}
        />
      ))}
    </div>
  );
}