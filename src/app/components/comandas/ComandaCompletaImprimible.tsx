import React from 'react';
import { Package, Calendar, User, MapPin, Phone, Barcode, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ComandaCompletaImprimibleProps {
  comanda: any;
  organismo: any;
}

export function ComandaCompletaImprimible({ comanda, organismo }: ComandaCompletaImprimibleProps) {
  const recibidoPor = organismo?.responsable || comanda?.organismoResponsable || 'Organisme';

  const handleImprimir = () => {
    window.print();
  };

  // Generar datos para QR
  const qrData = JSON.stringify({
    comanda: comanda.numero || comanda.id,
    organismo: organismo?.nombre || 'Sin organismo',
    fecha: comanda.fechaEntrega || comanda.fecha,
    items: comanda.items?.length || 0
  });

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
          
          #comanda-etiqueta-completa,
          #comanda-etiqueta-completa * {
            visibility: visible;
          }
          
          #comanda-etiqueta-completa {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          /* Asegurar visibilidad del QR Code */
          #comanda-etiqueta-completa svg[data-testid="qr-code"],
          #comanda-etiqueta-completa .qrcode-container svg {
            width: 70px !important;
            height: 70px !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            display: block !important;
            visibility: visible !important;
          }
          
          #comanda-etiqueta-completa .qrcode-container {
            print-color-adjust: exact !important;
            background-color: white !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Colores exactos */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          /* Ajustar tamaños de fuente para impresión */
          .print-title {
            font-size: 1.1rem !important;
          }
          
          .print-subtitle {
            font-size: 0.85rem !important;
          }
          
          .print-text {
            font-size: 0.75rem !important;
          }
          
          .print-table {
            font-size: 0.7rem !important;
          }
        }
      `}</style>

      <div className="space-y-4">
        {/* Botón de impresión */}
        <div className="no-print flex justify-end">
          <button
            onClick={handleImprimir}
            className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#45a049]"
          >
            <Printer className="w-4 h-4" />
            Imprimer Commande Complète + Étiquette
          </button>
        </div>

        {/* Contenido imprimible en una sola página */}
        <div id="comanda-etiqueta-completa" className="bg-white">
          
          {/* ========== SECCIÓN 1: COMANDA DETALLADA ========== */}
          <div className="border-3 border-[#1E73BE] rounded-lg p-4 mb-3">
            
            {/* Header principal */}
            <div className="border-b-3 border-[#4CAF50] pb-2 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-[#1E73BE] mb-1 print-title" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.4rem' }}>
                    BANQUE ALIMENTAIRE
                  </h1>
                  <p className="text-[#666666] print-subtitle" style={{ fontSize: '0.85rem' }}>
                    Commande de Distribution
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-[#1E73BE] text-white px-3 py-1 rounded">
                    <p className="text-xs font-medium">N° COMMANDE</p>
                    <p className="font-bold print-subtitle" style={{ fontSize: '1.1rem', fontFamily: 'Montserrat, sans-serif' }}>
                      {comanda.numero || comanda.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del organismo - Compacta */}
            <div className="bg-blue-50 border-2 border-[#1E73BE] rounded p-2 mb-2">
              <h2 className="font-bold text-[#1E73BE] mb-2 flex items-center gap-2 print-subtitle" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' }}>
                <User className="w-4 h-4" />
                ORGANISME DESTINATAIRE
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-[#666666]">Nom:</p>
                  <p className="font-bold text-[#333333] print-text">{organismo?.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-[#666666]">Type:</p>
                  <p className="font-medium text-[#333333] print-text">{organismo?.tipo}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Adresse:
                  </p>
                  <p className="font-medium text-[#333333] print-text">{organismo?.direccion}</p>
                </div>
                <div>
                  <p className="text-xs text-[#666666] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Téléphone:
                  </p>
                  <p className="font-medium text-[#333333] print-text">{organismo?.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-[#666666]">Responsable:</p>
                  <p className="font-medium text-[#333333] print-text">{organismo?.responsable}</p>
                </div>
              </div>
            </div>

            {/* Información de entrega - Compacta */}
            <div className="bg-yellow-50 border-2 border-[#FFC107] rounded p-2 mb-2">
              <h2 className="font-bold text-[#F57C00] mb-2 flex items-center gap-2 print-subtitle" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' }}>
                <Calendar className="w-4 h-4" />
                INFORMATION DE LIVRAISON
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-[#666666]">Date de livraison:</p>
                  <p className="font-bold text-[#333333] print-text">
                    {new Date(comanda.fechaEntrega).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#666666]">Heure:</p>
                  <p className="font-bold text-[#333333] print-text">{organismo?.horaCita || 'À convenir'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#666666]">Statut:</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                    comanda.estado === 'pendiente' ? 'bg-[#FFC107]' :
                    comanda.estado === 'en_preparacion' ? 'bg-[#1E73BE]' :
                    comanda.estado === 'completada' ? 'bg-[#4CAF50]' :
                    comanda.estado === 'entregada' ? 'bg-[#2E7D32]' :
                    'bg-[#DC3545]'
                  }`}>
                    {comanda.estado.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Productos - Tabla compacta */}
            <div className="border-2 border-[#4CAF50] rounded p-2 mb-2">
              <h2 className="font-bold text-[#4CAF50] mb-2 flex items-center gap-2 print-subtitle" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' }}>
                <Package className="w-4 h-4" />
                PRODUITS ({comanda.items?.length || 0})
              </h2>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F4F4] border-b-2 border-[#4CAF50]">
                    <th className="text-left p-1.5 font-bold text-[#333333] print-table">Produit</th>
                    <th className="text-center p-1.5 font-bold text-[#333333] print-table">Qté</th>
                    <th className="text-center p-1.5 font-bold text-[#333333] print-table">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {comanda.items?.slice(0, 12).map((item: any, index: number) => (
                    <tr key={`item-${index}`} className="border-b">
                      <td className="p-1.5 font-medium text-[#333333] print-table">{item.nombreProducto}</td>
                      <td className="text-center p-1.5 font-bold text-[#1E73BE] print-table">
                        {item.cantidad} {item.unidad || 'u'}
                      </td>
                      <td className="text-center p-1.5">
                        <div className="w-3 h-3 border-2 border-[#333333] rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {comanda.items?.length > 12 && (
                <p className="text-xs text-[#666666] mt-1 text-center print-table">
                  ... et {comanda.items.length - 12} produits supplémentaires
                </p>
              )}
            </div>

            {/* Observaciones - Compactas */}
            {comanda.observaciones && (
              <div className="bg-gray-50 border border-gray-300 rounded p-2 mb-2">
                <p className="text-xs text-[#666666] font-bold mb-1">OBSERVATIONS:</p>
                <p className="text-xs text-[#333333] print-table">{comanda.observaciones}</p>
              </div>
            )}
          </div>

          {/* ========== SEPARADOR ========== */}
          <div className="border-t-2 border-dashed border-gray-400 my-2 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
              ✂ Découper ici pour séparer l'étiquette ✂
            </span>
          </div>

          {/* ========== SECCIÓN 2: ETIQUETA DE IDENTIFICACIÓN ========== */}
          <div className="border-3 border-[#1E73BE] rounded-lg p-3">
            
            {/* Header con QR */}
            <div className="border-b-2 border-[#4CAF50] pb-2 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-bold text-[#1E73BE] mb-1 print-title" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.2rem' }}>
                    BANQUE ALIMENTAIRE
                  </h1>
                  <p className="text-[#666666] print-subtitle" style={{ fontSize: '0.75rem' }}>
                    Étiquette d'Identification
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {/* QR Code */}
                  <div className="bg-white p-1 rounded shadow-sm qrcode-container">
                    <QRCodeSVG 
                      value={qrData} 
                      size={70}
                      level="H"
                      includeMargin={true}
                      data-testid="qr-code"
                    />
                  </div>
                  <div className="bg-[#1E73BE] text-white px-2 py-0.5 rounded text-center">
                    <p className="text-xs font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {comanda.numero || comanda.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Código de barras simulado */}
            <div className="bg-gray-50 p-2 rounded text-center border-2 border-dashed mb-2">
              <Barcode className="w-full h-10 text-[#333333] mb-1" />
              <p className="font-mono font-bold text-xs tracking-widest">{(comanda.numero || comanda.id).replace('CMD-', '')}</p>
            </div>

            {/* Info resumida para etiqueta */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-blue-50 border border-[#1E73BE] rounded p-1.5">
                <p className="text-xs text-[#666666] font-bold print-table">ORGANISME:</p>
                <p className="font-bold text-xs text-[#333333] print-table">{organismo?.nombre}</p>
              </div>
              <div className="bg-yellow-50 border border-[#FFC107] rounded p-1.5">
                <p className="text-xs text-[#666666] font-bold print-table">DATE:</p>
                <p className="font-bold text-xs text-[#333333] print-table">
                  {new Date(comanda.fechaEntrega).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="bg-green-50 border border-[#4CAF50] rounded p-1.5">
                <p className="text-xs text-[#666666] font-bold print-table">PRODUITS:</p>
                <p className="font-bold text-xs text-[#333333] print-table">{comanda.items?.length || 0} articles</p>
              </div>
              <div className="bg-purple-50 border border-purple-500 rounded p-1.5">
                <p className="text-xs text-[#666666] font-bold print-table">STATUT:</p>
                <p className="font-bold text-xs text-[#333333] print-table">{comanda.estado.toUpperCase()}</p>
              </div>
            </div>

            {/* Firmas - Compactas */}
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#666666] mb-1 print-table">Remis par:</p>
                  <div className="border-b-2 border-[#333333] pb-1 mb-0.5"></div>
                  <p className="text-xs text-[#999999] print-table">Banque Alimentaire</p>
                </div>
                <div>
                  <p className="text-xs text-[#666666] mb-1 print-table">Reçu par:</p>
                  <div className="border-b-2 border-[#333333] pb-1 mb-0.5">
                    <p className="text-xs font-medium text-[#333333] print-table">{recibidoPor}</p>
                  </div>
                  <p className="text-xs text-[#999999] print-table">Organisme</p>
                </div>
              </div>
              <div className="mt-1 text-center text-xs text-[#999999] print-table">
                <p>Imprimé le: {new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
