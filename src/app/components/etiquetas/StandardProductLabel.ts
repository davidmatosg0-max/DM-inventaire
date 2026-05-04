/**
 * Componente StandardProductLabel
 * 
 * Etiqueta estandarizada de producto para Banque Alimentaire
 * Basado en el diseño oficial con dimensiones y estilos consistentes
 * 
 * Dimensiones: Optimizada para una sola hoja Letter (8.5in x 11in)
 * Colores oficiales:
 * - Azul: #1E73BE
 * - Verde: #4CAF50
 * - Gris: #F4F4F4/#333333
 * - Rojo: #DC3545
 * - Naranja: #FFC107
 * 
 * Tipografías:
 * - Montserrat Bold para títulos
 * - Montserrat Medium para etiquetas
 * - Roboto Regular para cuerpo de texto
 */

import { openAutoPrintPopup } from '../../utils/printPopup';

import { generarDatosQR } from '../../utils/barcode';
import { formatQuantity } from '../../utils/formatUtils';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';

export interface ProductLabelData {
  // Identificación
  id: string;
  codigo?: string;
  
  // Producto
  nombreProducto: string;
  productoIcono?: string;
  categoria?: string;
  subcategoria?: string;
  
  // Cantidades
  cantidad: number;
  unidad: string;
  pesoTotal: number;
  pesoUnidad?: number;
  
  // Almacenamiento
  temperatura: 'ambiente' | 'refrigerado' | 'congelado';
  ubicacion?: string;
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string; // Ejemplo: "45x900ml", "24x500g"
  
  // Procedencia
  programa?: string;
  programaIcono?: string;
  programaColor?: string;
  donadorNombre?: string;
  
  // Fecha
  fechaEntrada?: string;
  
  // Branding
  systemName?: string;
  systemLogo?: string | null;
  locale?: string;
  
  // Traducciones
  translations?: {
    foodBank?: string;
    productLabel?: string;
    quantity?: string;
    temperature?: string;
    lot?: string;
    expiryDate?: string;
    weight?: string;
    program?: string;
    donor?: string;
    entryDate?: string;
    systemFooter?: string;
    ambient?: string;
    refrigerated?: string;
    frozen?: string;
    packagingDetails?: string;
    printButton?: string;
    closeButton?: string;
  };
}

/**
 * Genera el HTML de una etiqueta estandarizada
 */
export async function generateStandardProductLabel(
  data: ProductLabelData
): Promise<string> {
  const dateLocale = data.locale || 'fr-CA';
  const htmlLang = dateLocale.split('-')[0] || 'fr';

  // Traducciones por defecto (español)
  const t = {
    foodBank: data.translations?.foodBank || 'BANCO DE ALIMENTOS',
    productLabel: data.translations?.productLabel || 'Etiqueta del producto',
    quantity: data.translations?.quantity || 'CANTIDAD',
    temperature: data.translations?.temperature || 'TEMPERATURA',
    lot: data.translations?.lot || 'LOT',
    expiryDate: data.translations?.expiryDate || 'FECHA DE VENCIMIENTO',
    weight: data.translations?.weight || 'PESO',
    program: data.translations?.program || 'PROGRAMA',
    donor: data.translations?.donor || 'DONANTE',
    entryDate: data.translations?.entryDate || 'FECHA DE ENTRADA',
    systemFooter: data.translations?.systemFooter || 'Sistema de gestión de inventario',
    ambient: data.translations?.ambient || 'Ambiente',
    refrigerated: data.translations?.refrigerated || 'Refrigerado',
    frozen: data.translations?.frozen || 'Congelado',
    packagingDetails: data.translations?.packagingDetails || 'Detalles del empaque',
    printButton: data.translations?.printButton || 'Imprimir etiqueta',
    closeButton: data.translations?.closeButton || 'Cerrar'
  };

  // Generar QR Code (reducido para optimizar espacio)
  const qrData = generarDatosQR({
    id: data.id,
    codigo: data.codigo || data.id,
    nombre: data.nombreProducto,
    lote: data.lote,
    fechaVencimiento: data.fechaCaducidad,
    ubicacion: data.ubicacion,
  });
  let qrImageBase64 = '';
  try {
    qrImageBase64 = await generateBrandedQrDataUrl(qrData, {
      width: 260,
      margin: 3,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, undefined, 0.14);
  } catch (err) {
    console.error('Error generando QR:', err);
  }

  // Icono y texto de temperatura
  const tempConfig = {
    ambiente: { icon: '🌡️', text: t.ambient, color: '#FFC107' },
    refrigerado: { icon: '❄️', text: t.refrigerated, color: '#1E73BE' },
    congelado: { icon: '🧊', text: t.frozen, color: '#0288D1' }
  };
  const tempInfo = tempConfig[data.temperatura] || tempConfig.ambiente;

  // Formato de fecha
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) {
      const now = new Date();
      return now.toLocaleDateString(dateLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.productLabel} - ${data.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.3in 0.4in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }
    
    .etiqueta-container {
      width: 100%;
      max-width: 7.5in;
      margin: 0 auto;
      border: 3px solid #1E73BE;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER - Compacto */
    .etiqueta-header {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-bottom: 3px solid #FFC107;
    }
    
    .etiqueta-header-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: 50%;
      background: white;
      padding: 4px;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: white;
      margin: 0;
      letter-spacing: 0.8px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* QR SECTION */
    .qr-section {
      background: white;
      padding: 12px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 2px solid #E0E0E0;
    }
    
    .qr-code-wrapper {
      border: 2px solid #1E73BE;
      border-radius: 6px;
      padding: 6px;
      background: white;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .qr-code-wrapper img {
      display: block;
      width: 150px;
      height: 150px;
      image-rendering: pixelated;
    }

    .qr-brand-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.8);
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
      color: #475569;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      padding-left: 1px;
    }
    
    /* PRODUCTO SECTION - MUY DESTACADO */
    .producto-section {
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
      padding: 16px 16px;
      text-align: center;
      border-bottom: 3px solid #1E73BE;
    }
    
    .producto-icono {
      font-size: 36px;
      margin-bottom: 6px;
      line-height: 1;
    }
    
    .producto-nombre {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 26px;
      color: #1E73BE;
      margin: 6px 0;
      line-height: 1.2;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* DONADOR SECTION - MUY DESTACADO */
    .donador-section {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      padding: 14px 16px;
      text-align: center;
      border-top: 3px solid #FFC107;
      border-bottom: 3px solid #FFC107;
    }
    
    .donador-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    
    .donador-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      line-height: 1.2;
    }
    
    /* PESO SECTION - DESTACADO */
    .peso-section {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      padding: 12px 16px;
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    
    .peso-section h3 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: white;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.4px;
    }
    
    /* CANTIDAD Y TEMPERATURA GRID */
    .cantidad-temp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 12px 16px;
      background: white;
      border-bottom: 2px solid #E0E0E0;
    }
    
    .grid-item {
      background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
      border-left: 4px solid #1E73BE;
      padding: 10px 10px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .grid-item-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 9px;
      color: #1E73BE;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
      display: block;
    }
    
    .grid-item-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      line-height: 1.2;
    }
    
    .temperature-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      background: white;
      border: 2px solid ${tempInfo.color};
      color: ${tempInfo.color};
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* INFO FIELDS - DESTACADOS */
    .info-fields {
      padding: 10px 16px 12px 16px;
      background: white;
    }
    
    .info-field {
      background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
      border-left: 4px solid #1E73BE;
      padding: 10px 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .info-field:last-child {
      margin-bottom: 0;
    }
    
    .info-field-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 9px;
      color: #1E73BE;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
      display: block;
    }
    
    .info-field-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      line-height: 1.2;
    }
    
    /* PRINT BUTTONS */
    .print-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      padding: 20px 16px;
      background: white;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-print {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .btn-print:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .btn-close {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .btn-close:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    @media print {
      body {
        padding: 0;
        display: block;
      }
      
      .etiqueta-container {
        box-shadow: none;
        max-width: none;
        width: 100%;
        margin: 0;
      }
      
      .print-buttons {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta-container">
    <!-- HEADER -->
    <div class="etiqueta-header">
      ${data.systemLogo ? `<img src="${data.systemLogo}" alt="Logo" class="etiqueta-header-logo">` : '🏦'}
      <h1>${data.systemName || t.foodBank}</h1>
    </div>
    
    <!-- QR SECTION -->
    <div class="qr-section">
      <div class="qr-code-wrapper">
        <img src="${qrImageBase64}" alt="QR Code">
        <div class="qr-brand-badge" aria-hidden="true">DM</div>
      </div>
    </div>
    
    <!-- PRODUCTO SECTION - MUY DESTACADO -->
    <div class="producto-section">
      ${data.productoIcono ? `<div class="producto-icono">${data.productoIcono}</div>` : ''}
      <div class="producto-nombre">
        ${data.nombreProducto}
      </div>
    </div>
    
    <!-- DONADOR SECTION - MUY DESTACADO -->
    ${data.donadorNombre ? `
      <div class="donador-section">
        <div class="donador-label">🏢 ${t.donor}</div>
        <div class="donador-value">${data.donadorNombre}</div>
      </div>
    ` : ''}
    
    <!-- PESO SECTION - DESTACADO -->
    <div class="peso-section">
      <h3>${formatQuantity(data.pesoTotal || 0)} kg</h3>
    </div>
    
    <!-- CANTIDAD Y TEMPERATURA GRID -->
    <div class="cantidad-temp-grid">
      <div class="grid-item">
        <span class="grid-item-label">📦 ${t.quantity}</span>
        <div class="grid-item-value">${data.cantidad} ${data.unidad}</div>
      </div>
      <div class="grid-item">
        <span class="grid-item-label">🌡️ ${t.temperature}</span>
        <div class="grid-item-value">
          <span class="temperature-badge">
            ${tempInfo.icon} ${tempInfo.text}
          </span>
        </div>
      </div>
    </div>
    
    <!-- INFO FIELDS - DESTACADOS -->
    <div class="info-fields">
      ${data.lote ? `
        <div class="info-field">
          <span class="info-field-label">${t.lot}</span>
          <div class="info-field-value">${data.lote}</div>
        </div>
      ` : ''}
      ${data.fechaCaducidad ? `
        <div class="info-field">
          <span class="info-field-label">${t.expiryDate}</span>
          <div class="info-field-value">${formatDate(data.fechaCaducidad)}</div>
        </div>
      ` : ''}
      ${data.detallesEmpaque ? `
        <div class="info-field">
          <span class="info-field-label">${t.packagingDetails}</span>
          <div class="info-field-value">${data.detallesEmpaque}</div>
        </div>
      ` : ''}
      ${data.programa ? `
        <div class="info-field">
          <span class="info-field-label">${t.program}</span>
          <div class="info-field-value">${data.programa}</div>
        </div>
      ` : ''}
      ${data.fechaEntrada ? `
        <div class="info-field">
          <span class="info-field-label">${t.entryDate}</span>
          <div class="info-field-value">${formatDateTime(data.fechaEntrada)}</div>
        </div>
      ` : ''}
    </div>
  </div>
  
  <!-- PRINT BUTTONS -->
  <div class="print-buttons">
    <button class="btn btn-print" onclick="handlePrint()">
      🖨️ ${t.printButton}
    </button>
    <button class="btn btn-close" onclick="window.close()">
      ✖ ${t.closeButton}
    </button>
  </div>
  
  <script>
    function handlePrint() {
      window.print();
    }
  </script>
</body>
</html>
  `.trim();
}

/**
 * Abre una ventana de impresión con la etiqueta estandarizada
 */
export async function printStandardLabel(data: ProductLabelData, silent: boolean = false): Promise<void> {
  const html = await generateStandardProductLabel(data);

  openAutoPrintPopup(html, {
    width: 900,
    height: 1100,
    printDelayMs: 350,
  });
}