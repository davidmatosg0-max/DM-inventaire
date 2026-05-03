import React, { useEffect, useState } from 'react';
import Barcode from 'react-barcode';
import { generarDatosQRUbicacion } from '../../utils/barcode';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';

export interface DatosEtiqueta {
  tipo: 'ubicacion' | 'producto' | 'lote';
  productoId?: string;
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
  const [qrImage, setQrImage] = useState<string | null>(null);
  const dimensiones = {
    pequena: { width: '6cm', height: '4cm', barcodeWidth: 1.2, barcodeHeight: 30 },
    mediana: { width: '10cm', height: '6cm', barcodeWidth: 1.8, barcodeHeight: 45 },
    grande: { width: '14cm', height: '8cm', barcodeWidth: 2.5, barcodeHeight: 60 }
  };

  const dim = dimensiones[tamano];

  useEffect(() => {
    let disposed = false;

    if (datos.tipo !== 'ubicacion') {
      setQrImage(null);
      return () => {
        disposed = true;
      };
    }

    const ubicacion = datos.subtitulo || datos.codigo;

    generateBrandedQrDataUrl(generarDatosQRUbicacion(ubicacion, datos.codigo), {
      width: tamano === 'pequena' ? 140 : tamano === 'mediana' ? 180 : 220,
      margin: 1,
      errorCorrectionLevel: 'H',
    })
      .then((image) => {
        if (!disposed) {
          setQrImage(image);
        }
      })
      .catch((error) => {
        console.error('Error al generar QR de ubicación para vista previa:', error);
        if (!disposed) {
          setQrImage(null);
        }
      });

    return () => {
      disposed = true;
    };
  }, [datos.codigo, datos.subtitulo, datos.tipo, tamano]);

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
        {datos.tipo === 'ubicacion' && qrImage ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={qrImage}
              alt={`QR ${datos.subtitulo || datos.codigo}`}
              style={{
                width: tamano === 'pequena' ? '90px' : tamano === 'mediana' ? '120px' : '150px',
                height: tamano === 'pequena' ? '90px' : tamano === 'mediana' ? '120px' : '150px',
                objectFit: 'contain',
              }}
            />
            <p className="font-bold" style={{ fontSize: tamano === 'pequena' ? '10px' : tamano === 'mediana' ? '12px' : '14px' }}>
              {datos.subtitulo || datos.codigo}
            </p>
          </div>
        ) : (
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
        )}
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
          Banco de Alimentos - Sistema de gestión
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