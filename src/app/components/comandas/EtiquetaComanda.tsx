import React from 'react';
import { Package, MapPin, Phone, Calendar, User } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { buildComandaQRData, COMANDA_QR_SVG_LEVEL } from '../../utils/comandaQr';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { BrandedQRCode } from '../shared/BrandedQRCode';
import { useBranding } from '../../../hooks/useBranding';

interface EtiquetaComandaProps {
  comanda: any;
  organismo: any;
}

export function EtiquetaComanda({ comanda, organismo }: EtiquetaComandaProps) {
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [barcodeUrl, setBarcodeUrl] = React.useState<string>('');
  const recibidoPor = organismo?.responsable || comanda?.organismoResponsable || 'Organisme';

  React.useEffect(() => {
    // Generar código de barras
    const canvas = document.createElement('canvas');
    try {
      const codigo = (comanda.numero || comanda.id).replace('CMD-', '');
      JsBarcode(canvas, codigo, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 5
      });
      setBarcodeUrl(canvas.toDataURL());
    } catch (err) {
      console.error(err);
    }
  }, [comanda]);

  const handleImprimir = () => {
    window.print();
  };

  // Generar datos para QR
  const qrData = buildComandaQRData({
    numeroComanda: comanda.numero || comanda.id,
    organismo: organismo?.nombre || 'Aucun organisme',
    fecha: comanda.fechaEntrega || comanda.fecha,
    items: comanda.items?.length || 0,
    organismoId: organismo?.id,
  });

  const getEstadoLabel = () => {
    const estados: Record<string, string> = {
      pendiente: 'EN ATTENTE',
      confirmada: 'ACCEPTÉE',
      en_preparacion: 'EN PRÉPARATION',
      completada: 'PRÊTE',
      entregada: 'LIVRÉE',
      anulada: 'ANNULÉE'
    };
    return estados[comanda.estado] || comanda.estado.toUpperCase();
  };

  return (
    <>
      {/* Estilos específicos para impresión */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.5cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #etiqueta-sola,
          #etiqueta-sola * {
            visibility: visible;
          }
          
          #etiqueta-sola {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* QR Code */
          #etiqueta-sola svg[data-testid="qr-code"],
          #etiqueta-sola .qrcode-container svg {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="space-y-4">
        {/* Botón de impresión */}
        <div className="no-print flex justify-end">
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E73BE] text-white rounded hover:bg-[#1557A0]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <Package className="w-4 h-4" />
            Imprimer Étiquette
          </button>
        </div>

        {/* ETIQUETA - OPTIMIZADA PARA UNA SOLA HOJA */}
        <div id="etiqueta-sola" className="bg-white flex justify-center items-start py-4">
          
          <div className="border-[5px] border-[#1E73BE] rounded-lg p-6 w-full max-w-3xl" style={{ fontFamily: 'Roboto, sans-serif' }}>
            
            {/* ENCABEZADO */}
            <div className="text-center border-b-4 border-[#1E73BE] pb-3 mb-4">
              <h1 className="font-black text-[#1E73BE] text-4xl mb-1" style={{ fontFamily: 'Montserrat', fontWeight: 900 }}>
                {nombreSistemaImpresion}
              </h1>
              <p className="font-semibold text-[#666666] text-base">
                Étiquette de Commande
              </p>
              {brandingContactLine && (
                <p className="text-sm text-[#666666] mt-1">{brandingContactLine}</p>
              )}
            </div>

            {/* Grid superior - QR + Productos */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* QR Code */}
              <div className="border-2 border-[#1E73BE] rounded-lg p-3 flex items-center justify-center bg-white shadow-md">
                <div className="qrcode-container">
                  <BrandedQRCode
                    value={qrData}
                    size={168}
                    level={COMANDA_QR_SVG_LEVEL}
                    includeMargin={true}
                    data-testid="qr-code"
                  />
                </div>
              </div>

              {/* Número de productos */}
              <div className="border-2 border-[#4CAF50] rounded-lg p-3 bg-green-50 flex flex-col items-center justify-center shadow-md">
                <Package className="w-8 h-8 text-[#4CAF50] mb-2" strokeWidth={2} />
                <p className="text-xs text-[#666666] uppercase font-semibold">Produits</p>
                <p className="text-6xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat' }}>
                  {comanda.items?.length || 0}
                </p>
                <p className="text-sm text-[#666666] font-medium">articles</p>
              </div>
            </div>

            {/* Segunda fila - Comando + Estado */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Número de comando */}
              <div className="bg-[#1E73BE] rounded-lg p-4 text-center shadow-md">
                <p className="text-xs text-white uppercase mb-1 font-semibold" style={{ fontFamily: 'Montserrat' }}>
                  N° Commande
                </p>
                <p className="text-4xl font-black text-white tracking-wider" style={{ fontFamily: 'Montserrat', letterSpacing: '2px' }}>
                  {comanda.numero || comanda.id}
                </p>
              </div>

              {/* Estado */}
              <div className="border-2 border-purple-300 rounded-lg p-3 bg-purple-50 flex flex-col items-center justify-center shadow-md">
                <p className="text-xs text-[#666666] uppercase mb-2 font-semibold">Statut</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-bold text-white text-base shadow-sm ${
                  comanda.estado === 'pendiente' ? 'bg-[#FFC107]' :
                  comanda.estado === 'confirmada' ? 'bg-[#7E57C2]' :
                  comanda.estado === 'en_preparacion' ? 'bg-[#1E73BE]' :
                  comanda.estado === 'completada' ? 'bg-[#4CAF50]' :
                  comanda.estado === 'entregada' ? 'bg-[#4CAF50]' :
                  'bg-[#DC3545]'
                }`}>
                  {getEstadoLabel()}
                </span>
              </div>
            </div>

            {/* Código de barras + Fecha de entrega */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Código de barras */}
              <div className="border-2 border-dashed border-[#999999] rounded-lg p-3 bg-gray-50 flex flex-col items-center justify-center shadow-sm">
                {barcodeUrl && (
                  <img src={barcodeUrl} alt="Code-barres" className="h-20" />
                )}
              </div>

              {/* Fecha de entrega */}
              <div className="border-2 border-[#FFC107] rounded-lg p-3 bg-yellow-50 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#FFC107]" strokeWidth={2} />
                  <p className="text-xs font-bold text-[#666666] uppercase">Livraison</p>
                </div>
                <p className="text-2xl font-black text-[#333333]" style={{ fontFamily: 'Montserrat' }}>
                  {new Date(comanda.fechaEntrega).toLocaleDateString('fr-FR', { 
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-[#666666] font-medium mt-1">
                  {organismo?.horaCita || 'À convenir'}
                </p>
              </div>
            </div>

            {/* INFORMACIÓN DEL ORGANISMO */}
            <div className="bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-4 mb-4 shadow-md">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#1E73BE]">
                <User className="w-5 h-5 text-[#1E73BE]" strokeWidth={2} />
                <h3 className="font-black text-[#1E73BE] text-base uppercase" style={{ fontFamily: 'Montserrat' }}>
                  Organisme Destinataire
                </h3>
              </div>

              {/* Grid de 2 columnas para info organismo */}
              <div className="grid grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-3">
                  <div className="bg-white rounded-md p-2 border-l-4 border-[#1E73BE]">
                    <p className="text-xs text-[#666666] font-semibold mb-1">Nom:</p>
                    <p className="font-bold text-[#1E73BE] text-base" style={{ fontFamily: 'Montserrat' }}>
                      {organismo?.nombre}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-md p-2 border-l-4 border-[#1E73BE]">
                    <p className="text-xs text-[#666666] font-semibold mb-1">Type:</p>
                    <p className="font-semibold text-[#333333] text-sm">{organismo?.tipo}</p>
                  </div>
                  
                  <div className="bg-white rounded-md p-2 border-l-4 border-[#1E73BE]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#666666] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#666666] font-semibold mb-1">Adresse:</p>
                        <p className="font-medium text-[#333333] text-sm">{organismo?.direccion}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-3">
                  <div className="bg-white rounded-md p-2 border-l-4 border-[#1E73BE]">
                    <p className="text-xs text-[#666666] font-semibold mb-1">Responsable:</p>
                    <p className="font-bold text-[#1E73BE] text-sm">
                      {organismo?.responsable}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-2 border-l-4 border-[#1E73BE]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#666666]" />
                      <div>
                        <p className="text-xs text-[#666666] font-semibold mb-1">Téléphone:</p>
                        <p className="font-semibold text-[#333333] text-sm">
                          {organismo?.telefono}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVACIONES */}
            {comanda.observaciones && (
              <div className="bg-[#FAFAFA] border-2 border-[#E0E0E0] rounded-lg p-3 mb-4 shadow-sm">
                <p className="text-xs font-bold text-[#666666] uppercase mb-2">Observations:</p>
                <p className="text-[#333333] text-sm">{comanda.observaciones}</p>
              </div>
            )}

            {/* FIRMAS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-t-2 border-[#E0E0E0] pt-2">
                <p className="text-xs text-[#666666] font-semibold mb-2">Remis par:</p>
                <div className="border-b-2 border-dashed border-[#999999] pb-6 mb-1"></div>
                <p className="text-xs text-[#999999] italic text-center">Nom et signature</p>
              </div>

              <div className="border-t-2 border-[#E0E0E0] pt-2">
                <p className="text-xs text-[#666666] font-semibold mb-2">Reçu par:</p>
                <div className="border-b-2 border-dashed border-[#999999] pb-1 mb-1 min-h-[2.5rem] flex items-end justify-center">
                  <span className="text-xs font-medium text-[#333333] text-center">{recibidoPor}</span>
                </div>
                <p className="text-xs text-[#999999] italic text-center">Nom et signature</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-[#999999] pt-3 border-t border-[#E0E0E0]">
              <p>Imprimé le: {new Date().toLocaleString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
