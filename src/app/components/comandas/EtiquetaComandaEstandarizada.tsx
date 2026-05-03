/**
 * EtiquetaComandaEstandarizada
 * 
 * Etiqueta de comanda con las mismas dimensiones que StandardProductLabel
 * Optimizada para una sola hoja Letter (8.5" x 11")
 * 
 * Usa los mismos estilos y configuraciones que las etiquetas de producto
 */

import React from 'react';
import { buildComandaQRData, COMANDA_QR_DATA_URL_OPTIONS } from '../../utils/comandaQr';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';

interface EtiquetaComandaData {
  // Comanda
  numeroComanda: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'en_preparacion' | 'completada' | 'entregada' | 'anulada';
  observaciones?: string;
  
  // Productos
  items: Array<{
    nombre: string;
    icono?: string;
    cantidad: number;
    unidad: string;
    peso?: number;
  }>;
  
  // Organismo
  organismoNombre: string;
  organismoTipo?: string;
  organismoDireccion?: string;
  organismoResponsable?: string;
  organismoTelefono?: string;
  horaCita?: string;
  
  // Traducciones
  translations?: {
    foodBank?: string;
    orderLabel?: string;
    orderNumber?: string;
    deliveryDate?: string;
    status?: string;
    products?: string;
    articles?: string;
    recipient?: string;
    name?: string;
    type?: string;
    address?: string;
    responsible?: string;
    phone?: string;
    observations?: string;
    deliveredBy?: string;
    receivedBy?: string;
    nameAndSignature?: string;
    printedOn?: string;
    systemFooter?: string;
    // Estados
    pending?: string;
    inPreparation?: string;
    ready?: string;
    delivered?: string;
    cancelled?: string;
  };
}

/**
 * Genera el HTML de una etiqueta estandarizada de comanda
 */
export async function generateStandardOrderLabel(
  data: EtiquetaComandaData
): Promise<string> {
  // Traducciones por defecto (francés)
  const t = {
    foodBank: data.translations?.foodBank || 'BANQUE ALIMENTAIRE',
    orderLabel: data.translations?.orderLabel || 'Étiquette de Commande',
    orderNumber: data.translations?.orderNumber || 'N° Commande',
    deliveryDate: data.translations?.deliveryDate || 'Livraison',
    status: data.translations?.status || 'Statut',
    products: data.translations?.products || 'Produits',
    articles: data.translations?.articles || 'articles',
    recipient: data.translations?.recipient || 'Organisme Destinataire',
    name: data.translations?.name || 'Nom',
    type: data.translations?.type || 'Type',
    address: data.translations?.address || 'Adresse',
    responsible: data.translations?.responsible || 'Responsable',
    phone: data.translations?.phone || 'Téléphone',
    observations: data.translations?.observations || 'Observations',
    deliveredBy: data.translations?.deliveredBy || 'Remis par',
    receivedBy: data.translations?.receivedBy || 'Reçu par',
    nameAndSignature: data.translations?.nameAndSignature || 'Nom et signature',
    printedOn: data.translations?.printedOn || 'Imprimé le',
    systemFooter: data.translations?.systemFooter || 'Système de Gestion des Commandes',
    pending: data.translations?.pending || 'EN ATTENTE',
    inPreparation: data.translations?.inPreparation || 'EN PRÉPARATION',
    ready: data.translations?.ready || 'PRÊTE',
    delivered: data.translations?.delivered || 'LIVRÉE',
    cancelled: data.translations?.cancelled || 'ANNULÉE',
  };

  // Generar QR Code (mismo tamaño que StandardProductLabel)
  const qrData = buildComandaQRData({
    numeroComanda: data.numeroComanda,
    organismo: data.organismoNombre,
    fecha: data.fechaEntrega,
    items: data.items.length,
  });
  
  let qrImageBase64 = '';
  try {
    qrImageBase64 = await generateBrandedQrDataUrl(qrData, {
      width: 180,
      ...COMANDA_QR_DATA_URL_OPTIONS,
    });
  } catch (err) {
    console.error('Error generando QR:', err);
  }

  // Estados con colores
  const estadoConfig = {
    pendiente: { label: t.pending, color: '#FFC107' },
    en_preparacion: { label: t.inPreparation, color: '#1E73BE' },
    completada: { label: t.ready, color: '#4CAF50' },
    entregada: { label: t.delivered, color: '#4CAF50' },
    anulada: { label: t.cancelled, color: '#DC3545' }
  };
  const estadoInfo = estadoConfig[data.estado] || estadoConfig.pendiente;

  // Calcular peso total
  const pesoTotal = data.items.reduce((sum, item) => sum + (item.peso || 0) * item.cantidad, 0);

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

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.orderLabel} - ${data.numeroComanda}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.4in 0.5in;
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
      border-radius: 10px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER */
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
    
    /* GRID SUPERIOR - QR + PRODUCTOS */
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
      width: 120px;
      height: 120px;
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
    
    /* GRID COMANDA + ESTADO */
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
    
    /* FECHA ENTREGA */
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
    
    /* ORGANISMO */
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
    
    /* LISTA DE PRODUCTOS */
    .productos-list-section {
      display: none; /* Ocultar lista detallada */
    }
    
    /* PESO TOTAL */
    .peso-section {
      display: none; /* Ocultar peso total */
    }
    
    /* OBSERVACIONES */
    .observaciones-section {
      display: none; /* Ocultar observaciones */
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
    
    /* FOOTER */
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
    
    /* PRINT BUTTONS (HIDDEN - Auto-print activated) */
    .print-buttons {
      display: none;
    }
    
    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .btn-print {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      color: white;
    }
    
    .btn-print:hover {
      background: linear-gradient(135deg, #1565C0 0%, #0d47a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(30, 115, 190, 0.3);
    }
    
    .btn-close {
      background: linear-gradient(135deg, #DC3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-close:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    @media print {
      body {
        padding: 0;
        display: block;
      }
      
      .print-buttons {
        display: none !important;
      }
      
      .etiqueta-container {
        box-shadow: none;
        max-width: none;
        width: 100%;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta-container">
    <!-- HEADER -->
    <div class="etiqueta-header">
      <h1>🏦 ${t.foodBank}</h1>
      <p>${t.orderLabel}</p>
    </div>
    
    <!-- GRID SUPERIOR: QR + PRODUCTOS -->
    <div class="grid-superior">
      <!-- QR Code -->
      <div class="qr-section">
        <img src="${qrImageBase64}" alt="QR Code" />
        <div class="qr-id">${data.numeroComanda}</div>
      </div>
      
      <!-- Productos -->
      <div class="productos-box">
        <div class="icon">📦</div>
        <div class="label">${t.products}</div>
        <div class="number">${data.items.length}</div>
        <div class="sublabel">${t.articles}</div>
      </div>
    </div>
    
    <!-- GRID COMANDA + ESTADO -->
    <div class="grid-comanda">
      <!-- Número de Comanda -->
      <div class="comanda-box">
        <div class="label">${t.orderNumber}</div>
        <div class="number">${data.numeroComanda}</div>
      </div>
      
      <!-- Estado -->
      <div class="estado-box">
        <div class="label">${t.status}</div>
        <div class="estado-badge">${estadoInfo.label}</div>
      </div>
    </div>
    
    <!-- FECHA ENTREGA -->
    <div class="fecha-entrega-section">
      <div class="icon">📅</div>
      <div class="content">
        <div class="label">${t.deliveryDate}</div>
        <div class="fecha">${formatDate(data.fechaEntrega)}</div>
        ${data.horaCita ? `<div class="hora">${data.horaCita}</div>` : ''}
      </div>
    </div>
    
    <!-- ORGANISMO -->
    <div class="organismo-section">
      <div class="organismo-title">
        <span>👤</span>
        <span>${t.recipient}</span>
      </div>
      <div class="organismo-grid">
        <div class="organismo-field full">
          <div class="label">${t.name}</div>
          <div class="value highlight">${data.organismoNombre}</div>
        </div>
        ${data.organismoTipo ? `
          <div class="organismo-field">
            <div class="label">${t.type}</div>
            <div class="value">${data.organismoTipo}</div>
          </div>
        ` : ''}
        ${data.organismoResponsable ? `
          <div class="organismo-field">
            <div class="label">${t.responsible}</div>
            <div class="value">${data.organismoResponsable}</div>
          </div>
        ` : ''}
        ${data.organismoDireccion ? `
          <div class="organismo-field full">
            <div class="label">${t.address}</div>
            <div class="value">${data.organismoDireccion}</div>
          </div>
        ` : ''}
        ${data.organismoTelefono ? `
          <div class="organismo-field">
            <div class="label">${t.phone}</div>
            <div class="value">${data.organismoTelefono}</div>
          </div>
        ` : ''}
      </div>
    </div>
    
    <!-- FIRMAS -->
    <div class="firmas-section">
      <div class="firma-box">
        <div class="label">${t.deliveredBy}:</div>
        <div class="firma-line"></div>
        <div class="sublabel">${t.nameAndSignature}</div>
      </div>
      <div class="firma-box">
        <div class="label">${t.receivedBy}:</div>
        <div class="firma-line" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;font-weight:600;color:#333333;">${data.organismoResponsable || ''}</div>
        <div class="sublabel">${t.nameAndSignature}</div>
      </div>
    </div>
    
    <!-- FOOTER -->
    <div class="etiqueta-footer">
      <p>${t.systemFooter}</p>
      <p class="timestamp">${t.printedOn}: ${formatDateTime(new Date())}</p>
    </div>
  </div>
  
  <!-- PRINT BUTTONS (HIDDEN - Auto-print activated) -->
  <div class="print-buttons" style="display: none;">
    <button class="btn btn-print" onclick="handlePrint()">
      🖨️ Imprimer l'étiquette
    </button>
    <button class="btn btn-close" onclick="window.close()">
      ✖ Fermer
    </button>
  </div>
  
  <script>
    console.log('🖨️ Etiqueta de Comanda - Impresión automática activada');
    
    function handlePrint() {
      console.log('📝 Iniciando impresión de comanda...');
      window.print();
      
      // Cerrar la ventana después de que termine la impresión
      window.addEventListener('afterprint', function() {
        console.log('✅ Impresión completada - Cerrando ventana...');
        window.close();
      });
    }
    
    // Iniciar impresión automáticamente cuando la página cargue
    window.onload = function() {
      console.log('📄 Página cargada - Iniciando impresión automática...');
      // Pequeño delay para asegurar que todo esté renderizado
      setTimeout(function() {
        handlePrint();
      }, 500);
    };
  </script>
</body>
</html>
  `.trim();
}

/**
 * Imprime directamente la etiqueta usando un iframe oculto
 */
export async function printStandardOrderLabel(data: EtiquetaComandaData): Promise<void> {
  const html = await generateStandardOrderLabel(data);
  
  // Crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  
  document.body.appendChild(iframe);
  
  // Escribir el contenido
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('No se pudo acceder al documento del iframe');
  }
  
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();
  
  // Esperar a que cargue y luego imprimir
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Eliminar el iframe después de imprimir
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (err) {
      console.error('Error al imprimir:', err);
      document.body.removeChild(iframe);
    }
  };
}