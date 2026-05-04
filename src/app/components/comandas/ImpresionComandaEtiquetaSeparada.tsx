/**
 * ImpresionComandaEtiquetaSeparada
 * 
 * Imprime la comanda detallada y la etiqueta en hojas separadas usando una ventana autocerrable
 */

import { buildComandaQRData, COMANDA_QR_DATA_URL_OPTIONS } from '../../utils/comandaQr';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';
import { openPrintPopup, writeAutoPrintPopupContent } from '../../utils/printPopup';

interface ComandaParaImprimir {
  numero?: string;
  numeroComanda?: string;
  id: string;
  fechaEntrega: string;
  estado: string;
  observaciones?: string;
  items: Array<{
    nombreProducto?: string;
    productoNombre?: string;
    cantidad: number;
    unidad?: string;
    icono?: string;
    peso?: number;
  }>;
  organismoId?: string;
  preparadoPor?: string; // Persona que preparó la comanda
}

interface OrganismoParaImprimir {
  id?: string;
  nombre: string;
  tipo?: string;
  direccion?: string;
  telefono?: string;
  responsable?: string; // Persona responsable de recoger
  horaCita?: string;
}

/**
 * Genera HTML completo con ambas páginas
 */
async function generatePrintHTML(
  comanda: ComandaParaImprimir,
  organismo: OrganismoParaImprimir
): Promise<string> {
  const numeroComanda = comanda.numero || comanda.numeroComanda || comanda.id;

  // ========== PÁGINA 1: QR PARA COMANDA DETALLADA ==========
  const qrDataComanda = buildComandaQRData({
    numeroComanda,
    organismo: organismo.nombre,
    fecha: comanda.fechaEntrega,
    items: comanda.items.length,
    organismoId: organismo.id,
  });

  let qrImageComanda = '';
  try {
    qrImageComanda = await generateBrandedQrDataUrl(qrDataComanda, {
      width: 280,
      ...COMANDA_QR_DATA_URL_OPTIONS,
    });
  } catch (err) {
    console.error('Error generando QR comanda:', err);
  }

  // ========== PÁGINA 2: QR PARA ETIQUETA ==========
  const qrDataEtiqueta = buildComandaQRData({
    numeroComanda,
    organismo: organismo.nombre,
    fecha: comanda.fechaEntrega,
    items: comanda.items.length,
    organismoId: organismo.id,
  });

  let qrImageEtiqueta = '';
  try {
    qrImageEtiqueta = await generateBrandedQrDataUrl(qrDataEtiqueta, {
      width: 180,
      ...COMANDA_QR_DATA_URL_OPTIONS,
    });
  } catch (err) {
    console.error('Error generando QR etiqueta:', err);
  }

  // Estados con colores
  const estadoConfig: Record<string, { label: string; color: string }> = {
    pendiente: { label: 'EN ATTENTE', color: '#FFC107' },
    en_preparacion: { label: 'EN PRÉPARATION', color: '#1E73BE' },
    completada: { label: 'PRÊTE', color: '#4CAF50' },
    entregada: { label: 'LIVRÉE', color: '#4CAF50' },
    anulada: { label: 'ANNULÉE', color: '#DC3545' }
  };
  const estadoInfo = estadoConfig[comanda.estado] || estadoConfig.pendiente;

  // Formato de fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Iconos SVG (Lucide icons)
  const UserIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  const CalendarIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
  const PackageIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
  const MapPinIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
  const PhoneIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
  const ToolIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Commande ${numeroComanda}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter portrait;
      margin: 0.5cm;
    }
    
    @media print {
      * {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      
      body {
        margin: 0;
        padding: 0;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: white;
      color: #333333;
    }
    
    .page {
      width: 100%;
      background: white;
    }
    
    /* Utilidades de Tailwind */
    .border-3 { border-width: 3px; }
    .border-2 { border-width: 2px; }
    .border { border-width: 1px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded { border-radius: 0.25rem; }
    .p-4 { padding: 1rem; }
    .p-2 { padding: 0.5rem; }
    .p-1\.5 { padding: 0.375rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pb-1 { padding-bottom: 0.25rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-0\.5 { margin-bottom: 0.125rem; }
    .flex { display: flex; }
    .grid { display: grid; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .inline-block { display: inline-block; }
    .w-full { width: 100%; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .border-dashed { border-style: dashed; }
    
    /* Colores - Página 1 */
    .border-\\[\\#1E73BE\\] { border-color: #1E73BE; }
    .border-\\[\\#4CAF50\\] { border-color: #4CAF50; }
    .border-\\[\\#FFC107\\] { border-color: #FFC107; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-\\[\\#333333\\] { border-color: #333333; }
    .border-b-3 { border-bottom-width: 3px; }
    .border-b-2 { border-bottom-width: 2px; }
    .border-b { border-bottom-width: 1px; }
    .text-\\[\\#1E73BE\\] { color: #1E73BE; }
    .text-\\[\\#4CAF50\\] { color: #4CAF50; }
    .text-\\[\\#F57C00\\] { color: #F57C00; }
    .text-\\[\\#666666\\] { color: #666666; }
    .text-\\[\\#333333\\] { color: #333333; }
    .text-white { color: white; }
    .bg-white { background-color: white; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-yellow-50 { background-color: #fefce8; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-\\[\\#F4F4F4\\] { background-color: #F4F4F4; }
    .bg-\\[\\#1E73BE\\] { background-color: #1E73BE; }
    .bg-\\[\\#FFC107\\] { background-color: #FFC107; }
    .bg-\\[\\#4CAF50\\] { background-color: #4CAF50; }
    .bg-\\[\\#2E7D32\\] { background-color: #2E7D32; }
    .bg-\\[\\#DC3545\\] { background-color: #DC3545; }
    
    /* Grid */
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .col-span-2 { grid-column: span 2 / span 2; }
    
    /* Tabla - Página 1 */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead tr {
      background-color: #F4F4F4;
      border-bottom: 2px solid #4CAF50;
    }
    
    th {
      text-align: left;
      padding: 0.375rem;
      font-weight: 700;
      color: #333333;
      font-size: 0.75rem;
    }
    
    tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    td {
      padding: 0.375rem;
      font-weight: 500;
      color: #333333;
      font-size: 0.75rem;
    }
    
    .print-title { font-size: 1.1rem; }
    .print-subtitle { font-size: 0.85rem; }
    .print-text { font-size: 0.75rem; }
    .print-table { font-size: 0.7rem; }
    
    /* Checkbox */
    .checkbox {
      width: 0.75rem;
      height: 0.75rem;
      border: 2px solid #333333;
      border-radius: 0.125rem;
      display: inline-block;
    }
    
    /* Iconos inline */
    .icon-inline {
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.5rem;
    }
    
    .icon-small {
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.25rem;
    }

    /* SECCIÓN DE PREPARACIÓN Y RECOGIDA - PÁGINA 1 */
    .personal-section-p1 {
      background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
      border: 2px solid #FF9800;
      border-radius: 0.25rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .personal-section-p1 h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      color: #E65100;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .personal-grid-p1 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    
    .personal-field-p1 {
      background: white;
      border-left: 3px solid #FF9800;
      padding: 0.375rem 0.5rem;
      border-radius: 0.1875rem;
    }
    
    .personal-field-p1 .label {
      font-size: 0.75rem;
      color: #666666;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.125rem;
    }
    
    .personal-field-p1 .value {
      font-family: 'Roboto', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      color: #E65100;
    }
    
    .personal-field-p1 .value.empty {
      color: #999999;
      font-style: italic;
      font-weight: 400;
    }

    /* ========== ESTILOS PÁGINA 2: ETIQUETA ESTANDARIZADA ========== */
    .etiqueta-container {
      width: 100%;
      max-width: 7.5in;
      margin: 0 auto;
      border: 3px solid #1E73BE;
      border-radius: 10px;
      overflow: hidden;
      background: white;
    }
    
    .etiqueta-header {
      background: white;
      padding: 12px 16px;
      text-align: center;
      border-bottom: 3px solid #1E73BE;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: #1E73BE;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
    }
    
    .etiqueta-header p {
      font-family: 'Roboto', sans-serif;
      font-size: 12px;
      color: #666666;
      margin: 0;
    }
    
    .grid-superior {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 12px 16px;
      background: #FAFAFA;
    }
    
    .qr-section {
      background: white;
      border: 2px solid #1E73BE;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .qr-section img {
      width: 140px;
      height: 140px;
      display: block;
    }
    
    .qr-id {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 10px;
      color: #1E73BE;
      margin-top: 6px;
    }
    
    .productos-box {
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
      border: 2px solid #4CAF50;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .productos-box .icon {
      font-size: 28px;
      margin-bottom: 4px;
    }
    
    .productos-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .productos-box .number {
      font-family: 'Montserrat', sans-serif;
      font-size: 48px;
      font-weight: 700;
      color: #4CAF50;
      line-height: 1;
    }
    
    .productos-box .sublabel {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      color: #666666;
      font-weight: 500;
    }
    
    .grid-comanda {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 0 16px 12px 16px;
      background: #FAFAFA;
    }
    
    .comanda-box {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    
    .comanda-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .comanda-box .number {
      font-family: 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: white;
      letter-spacing: 1px;
    }
    
    .estado-box {
      background: white;
      border: 2px solid #E0E0E0;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .estado-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    
    .estado-badge {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      background: ${estadoInfo.color};
    }
    
    .fecha-entrega-section {
      background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
      border-top: 3px solid #FFC107;
      border-bottom: 3px solid #FFC107;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .fecha-entrega-section .icon {
      font-size: 24px;
    }
    
    .fecha-entrega-section .content {
      flex: 1;
    }
    
    .fecha-entrega-section .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .fecha-entrega-section .fecha {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #333333;
    }
    
    .fecha-entrega-section .hora {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      color: #666666;
      font-weight: 500;
    }
    
    .organismo-section {
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
      border-bottom: 2px solid #1E73BE;
      padding: 10px 16px;
    }
    
    .organismo-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #1E73BE;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .organismo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    
    .organismo-field {
      background: white;
      border-left: 3px solid #1E73BE;
      padding: 6px 8px;
      border-radius: 3px;
    }
    
    .organismo-field.full {
      grid-column: span 2;
    }
    
    .organismo-field .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .organismo-field .value {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #333333;
    }
    
    .organismo-field .value.highlight {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      color: #1E73BE;
      font-size: 12px;
    }
    
    /* FIRMAS */
    .firmas-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 10px 16px;
      background: white;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .firma-box {
      border-top: 2px solid #E0E0E0;
      padding-top: 6px;
    }
    
    .firma-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: #666666;
      margin-bottom: 3px;
    }
    
    .firma-line {
      border-bottom: 2px dashed #999999;
      height: 30px;
      margin-bottom: 2px;
    }
    
    .firma-box .sublabel {
      font-family: 'Roboto', sans-serif;
      font-size: 7px;
      color: #999999;
      font-style: italic;
      text-align: center;
    }
    
    .etiqueta-footer {
      background: white;
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid #E0E0E0;
    }
    
    .etiqueta-footer p {
      font-family: 'Roboto', sans-serif;
      font-size: 9px;
      color: #999999;
      margin: 0 0 2px 0;
    }
    
    .etiqueta-footer .timestamp {
      font-size: 8px;
      color: #BBBBBB;
    }
  </style>
</head>
<body>
  <!-- PÁGINA 1: COMANDA DETALLADA -->
  <div class="page page-break">
    <div class="border-3 border-[#1E73BE] rounded-lg p-4">
      
      <!-- Header principal -->
      <div class="border-b-3 border-[#4CAF50] pb-2 mb-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-bold text-[#1E73BE] mb-1 print-title" style="font-family: 'Montserrat', sans-serif; font-size: 1.4rem;">
              BANQUE ALIMENTAIRE
            </h1>
            <p class="text-[#666666] print-subtitle" style="font-size: 0.85rem;">
              Commande de Distribution
            </p>
          </div>
          <div class="text-right">
            <div class="bg-[#1E73BE] text-white px-3 py-1 rounded">
              <p class="text-xs font-medium">N° COMMANDE</p>
              <p class="font-bold print-subtitle" style="font-size: 1.1rem; font-family: 'Montserrat', sans-serif;">
                ${numeroComanda}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del organismo -->
      <div class="bg-blue-50 border-2 border-[#1E73BE] rounded p-2 mb-2">
        <h2 class="font-bold text-[#1E73BE] mb-2 flex items-center gap-2 print-subtitle" style="font-family: 'Montserrat', sans-serif; font-size: 0.9rem;">
          <span class="icon-inline">${UserIcon}</span>
          ORGANISME DESTINATAIRE
        </h2>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-xs text-[#666666]">Nom:</p>
            <p class="font-bold text-[#333333] print-text">${organismo.nombre}</p>
          </div>
          <div>
            <p class="text-xs text-[#666666]">Type:</p>
            <p class="font-medium text-[#333333] print-text">${organismo.tipo || 'N/A'}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-[#666666] flex items-center gap-1">
              <span class="icon-small">${MapPinIcon}</span> Adresse:
            </p>
            <p class="font-medium text-[#333333] print-text">${organismo.direccion || 'N/A'}</p>
          </div>
          <div>
            <p class="text-xs text-[#666666] flex items-center gap-1">
              <span class="icon-small">${PhoneIcon}</span> Téléphone:
            </p>
            <p class="font-medium text-[#333333] print-text">${organismo.telefono || 'N/A'}</p>
          </div>
          <div>
            <p class="text-xs text-[#666666]">Responsable:</p>
            <p class="font-medium text-[#333333] print-text">${organismo.responsable || 'N/A'}</p>
          </div>
        </div>
      </div>

      <!-- Información de entrega -->
      <div class="bg-yellow-50 border-2 border-[#FFC107] rounded p-2 mb-2">
        <h2 class="font-bold text-[#F57C00] mb-2 flex items-center gap-2 print-subtitle" style="font-family: 'Montserrat', sans-serif; font-size: 0.9rem;">
          <span class="icon-inline">${CalendarIcon}</span>
          INFORMATION DE LIVRAISON
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-xs text-[#666666]">Date de livraison:</p>
            <p class="font-bold text-[#333333] print-text">
              ${formatDate(comanda.fechaEntrega)}
            </p>
          </div>
          <div>
            <p class="text-xs text-[#666666]">Heure:</p>
            <p class="font-bold text-[#333333] print-text">${organismo.horaCita || 'À convenir'}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-[#666666]">Statut:</p>
            <span class="inline-block px-2 py-1 rounded text-xs font-bold text-white ${
              comanda.estado === 'pendiente' ? 'bg-[#FFC107]' :
              comanda.estado === 'en_preparacion' ? 'bg-[#1E73BE]' :
              comanda.estado === 'completada' ? 'bg-[#4CAF50]' :
              comanda.estado === 'entregada' ? 'bg-[#2E7D32]' :
              'bg-[#DC3545]'
            }">
              ${comanda.estado.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <!-- Productos -->
      <div class="border-2 border-[#4CAF50] rounded p-2 mb-2">
        <h2 class="font-bold text-[#4CAF50] mb-2 flex items-center gap-2 print-subtitle" style="font-family: 'Montserrat', sans-serif; font-size: 0.9rem;">
          <span class="icon-inline">${PackageIcon}</span>
          PRODUITS (${comanda.items.length})
        </h2>
        <table>
          <thead>
            <tr>
              <th class="text-left">Produit</th>
              <th class="text-center">Qté</th>
              <th class="text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            ${comanda.items.slice(0, 12).map((item, index) => `
              <tr>
                <td class="font-medium text-[#333333] print-table">
                  ${item.nombreProducto || item.productoNombre || 'Produit'}
                </td>
                <td class="text-center font-bold text-[#1E73BE] print-table">
                  ${item.cantidad} ${item.unidad || 'u'}
                </td>
                <td class="text-center">
                  <span class="checkbox mx-auto"></span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${comanda.items.length > 12 ? `
          <p class="text-xs text-[#666666] mt-1 text-center print-table">
            ... et ${comanda.items.length - 12} produits supplémentaires
          </p>
        ` : ''}
      </div>

      <!-- Observaciones -->
      ${comanda.observaciones ? `
        <div class="bg-gray-50 border border-gray-300 rounded p-2 mb-2">
          <p class="text-xs text-[#666666] font-bold mb-1">OBSERVATIONS:</p>
          <p class="text-xs text-[#333333] print-table">${comanda.observaciones}</p>
        </div>
      ` : ''}
      
      <!-- SECCIÓN DE PREPARACIÓN Y RECOGIDA -->
      <div class="personal-section-p1">
        <h2>
          <span class="icon-inline">${ToolIcon}</span>
          <span>PRÉPARATION ET RÉCUPÉRATION</span>
        </h2>
        <div class="personal-grid-p1">
          <div class="personal-field-p1">
            <div class="label">PRÉPARÉ PAR</div>
            <div class="value${comanda.preparadoPor ? '' : ' empty'}">${comanda.preparadoPor || 'Non spécifié'}</div>
          </div>
          <div class="personal-field-p1">
            <div class="label">À RÉCUPÉRER PAR</div>
            <div class="value${organismo.responsable ? '' : ' empty'}">${organismo.responsable || 'Non spécifié'}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- PÁGINA 2: ETIQUETA ESTANDARIZADA -->
  <div class="page">
    <div class="etiqueta-container">
      <!-- HEADER -->
      <div class="etiqueta-header">
        <h1>🏦 BANQUE ALIMENTAIRE</h1>
        <p>Étiquette de Commande</p>
      </div>
      
      <!-- GRID SUPERIOR: QR + PRODUCTOS -->
      <div class="grid-superior">
        <div class="qr-section">
          <img src="${qrImageEtiqueta}" alt="QR Code" />
          <div class="qr-id">${numeroComanda}</div>
        </div>
        
        <div class="productos-box">
          <div class="icon">📦</div>
          <div class="label">PRODUITS</div>
          <div class="number">${comanda.items.length}</div>
          <div class="sublabel">articles</div>
        </div>
      </div>
      
      <!-- GRID COMANDA + ESTADO -->
      <div class="grid-comanda">
        <div class="comanda-box">
          <div class="label">N° COMMANDE</div>
          <div class="number">${numeroComanda}</div>
        </div>
        
        <div class="estado-box">
          <div class="label">STATUT</div>
          <div class="estado-badge">${estadoInfo.label}</div>
        </div>
      </div>
      
      <!-- FECHA ENTREGA -->
      <div class="fecha-entrega-section">
        <div class="icon">📅</div>
        <div class="content">
          <div class="label">LIVRAISON</div>
          <div class="fecha">${formatDate(comanda.fechaEntrega)}</div>
          ${organismo.horaCita ? `<div class="hora">${organismo.horaCita}</div>` : ''}
        </div>
      </div>
      
      <!-- ORGANISMO -->
      <div class="organismo-section">
        <div class="organismo-title">
          <span>👤</span>
          <span>ORGANISME DESTINATAIRE</span>
        </div>
        <div class="organismo-grid">
          <div class="organismo-field full">
            <div class="label">NOM</div>
            <div class="value highlight">${organismo.nombre}</div>
          </div>
          ${organismo.tipo ? `
            <div class="organismo-field">
              <div class="label">TYPE</div>
              <div class="value">${organismo.tipo}</div>
            </div>
          ` : ''}
          ${organismo.responsable ? `
            <div class="organismo-field">
              <div class="label">RESPONSABLE</div>
              <div class="value">${organismo.responsable}</div>
            </div>
          ` : ''}
          ${organismo.direccion ? `
            <div class="organismo-field full">
              <div class="label">ADRESSE</div>
              <div class="value">${organismo.direccion}</div>
            </div>
          ` : ''}
          ${organismo.telefono ? `
            <div class="organismo-field">
              <div class="label">TÉLÉPHONE</div>
              <div class="value">${organismo.telefono}</div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- FIRMAS -->
      <div class="firmas-section">
        <div class="firma-box">
          <div class="label">Remis par:</div>
          <div class="firma-line"></div>
          <div class="sublabel">Nom et signature</div>
        </div>
        <div class="firma-box">
          <div class="label">Reçu par:</div>
          <div class="firma-line" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;font-weight:600;color:#333333;">${organismo.responsable || ''}</div>
          <div class="sublabel">Nom et signature</div>
        </div>
      </div>
      
      <!-- FOOTER -->
      <div class="etiqueta-footer">
        <p>Système de Gestion des Commandes</p>
        <p class="timestamp">Imprimé le: ${formatDateTime(new Date())}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Imprime la comanda completa y la etiqueta en hojas separadas usando un iframe oculto
 */
export async function printComandaYEtiquetaSeparadas(
  comanda: ComandaParaImprimir,
  organismo: OrganismoParaImprimir
): Promise<void> {
  const printWindow = openPrintPopup({ width: 1024, height: 900, printDelayMs: 500 });
  const printHTML = await generatePrintHTML(comanda, organismo);

  writeAutoPrintPopupContent(printWindow, printHTML, { width: 1024, height: 900, printDelayMs: 500 });
}