import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Mail, MapPin, Package, Phone, Printer, User, X } from 'lucide-react';
import { buildComandaQRData, COMANDA_QR_DATA_URL_OPTIONS, COMANDA_QR_SVG_LEVEL } from '../../utils/comandaQr';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';
import { BrandedQRCode } from '../shared/BrandedQRCode';

interface ComandaCompletaImprimibleProps {
  comanda: any;
  organismo: any;
  onClose?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'En attente',
  en_preparacion: 'En préparation',
  completada: 'Prête',
  entregada: 'Livrée',
  anulada: 'Annulée',
};

function getSafeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getFirstText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return '-';
}

function formatTemperature(temperature?: string): string {
  switch (temperature) {
    case 'congelado':
      return 'Congelé';
    case 'refrigerado':
      return 'Réfrigéré';
    case 'ambiente':
      return 'Ambiante';
    default:
      return temperature || '-';
  }
}

function formatDate(value: unknown, locale: string, withTime = false): string {
  if (typeof value !== 'string' || value.trim() === '') {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(locale, withTime
    ? {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }
    : {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type PrintPayload = {
  numeroComanda: string;
  locale: string;
  title: string;
  statusLabel: string;
  organismoNombre: string;
  organismoTipo: string;
  organismoDireccion: string;
  organismoTelefono: string;
  organismoEmail: string;
  responsableRecogida: string;
  fechaCreacion: string;
  fechaEntrega: string;
  horaPrevista: string;
  preparadoPor: string;
  prioridad: string;
  tipo: string;
  totalItems: number;
  totalUnidades: string;
  totalPeso: string;
  totalValor: string;
  observaciones: string;
  qrData: string;
  items: Array<{
    nombre: string;
    temperatura: string;
    cantidad: string;
    unidad: string;
    peso: string;
    valor: string;
    observaciones: string;
  }>;
};

async function generatePrintableComandaHtml(payload: PrintPayload): Promise<string> {
  let qrImage = '';

  try {
    qrImage = await generateBrandedQrDataUrl(payload.qrData, {
      width: 220,
      ...COMANDA_QR_DATA_URL_OPTIONS,
    });
  } catch (error) {
    console.error('Error al generar QR de la comanda:', error);
  }

  const rows = payload.items.length === 0
    ? `
      <tr>
        <td colspan="7" class="empty">Aucun produit enregistré dans cette commande.</td>
      </tr>
    `
    : payload.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.nombre)}</td>
        <td>${escapeHtml(item.temperatura)}</td>
        <td class="right">${escapeHtml(item.cantidad)}</td>
        <td>${escapeHtml(item.unidad)}</td>
        <td class="right">${escapeHtml(item.peso)}</td>
        <td class="right">${escapeHtml(item.valor)}</td>
        <td>${escapeHtml(item.observaciones)}</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(payload.title)}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.45cm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            padding: 18px;
          }

          .sheet {
            width: 100%;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            border-bottom: 4px solid #1E73BE;
            padding-bottom: 14px;
          }

          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #1E73BE;
            margin-bottom: 6px;
          }

          h1 {
            font-size: 28px;
            margin: 0 0 10px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 18px;
            font-size: 13px;
          }

          .meta strong,
          .card strong,
          .signature-title {
            color: #111827;
          }

          .qr-box {
            min-width: 148px;
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            padding: 10px;
            text-align: center;
            background: white;
          }

          .qr-box img {
            display: block;
            width: 128px;
            height: 128px;
            margin: 0 auto 6px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .card {
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            padding: 14px;
            page-break-inside: avoid;
          }

          .card-title {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0 0 10px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
          }

          .summary-card {
            background: #f8fafc;
            border-radius: 14px;
            padding: 12px;
            page-break-inside: avoid;
          }

          .summary-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
          }

          .summary-value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 700;
            color: #111827;
          }

          .section-title {
            margin: 18px 0 10px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #1E73BE;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            overflow: hidden;
          }

          th, td {
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 12px;
            font-size: 12px;
            vertical-align: top;
          }

          th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            font-weight: 700;
          }

          td.right,
          th.right {
            text-align: right;
          }

          .empty {
            text-align: center;
            color: #64748b;
            padding: 20px 12px;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .signature-line {
            margin-top: 32px;
            border-bottom: 1px solid #94a3b8;
          }

          .signature-name {
            margin-top: 8px;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>
              <div class="eyebrow">Banque Alimentaire</div>
              <h1>${escapeHtml(payload.title)}</h1>
              <div class="meta">
                <div><strong>N°:</strong> ${escapeHtml(payload.numeroComanda)}</div>
                <div><strong>Statut:</strong> ${escapeHtml(payload.statusLabel)}</div>
                <div><strong>Livraison:</strong> ${escapeHtml(payload.fechaEntrega)}</div>
                <div><strong>Imprimé:</strong> ${escapeHtml(formatDate(new Date().toISOString(), payload.locale, true))}</div>
              </div>
            </div>
            <div class="qr-box">
              ${qrImage ? `<img src="${qrImage}" alt="QR de la comanda" />` : ''}
              <strong>${escapeHtml(payload.numeroComanda)}</strong>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Organisme</div>
              <div><strong>Nom:</strong> ${escapeHtml(payload.organismoNombre)}</div>
              <div><strong>Type:</strong> ${escapeHtml(payload.organismoTipo)}</div>
              <div><strong>Adresse:</strong> ${escapeHtml(payload.organismoDireccion)}</div>
              <div><strong>Téléphone:</strong> ${escapeHtml(payload.organismoTelefono)}</div>
              <div><strong>Courriel:</strong> ${escapeHtml(payload.organismoEmail)}</div>
              <div><strong>Responsable:</strong> ${escapeHtml(payload.responsableRecogida)}</div>
            </div>

            <div class="card">
              <div class="card-title">Détails de la commande</div>
              <div><strong>Créée:</strong> ${escapeHtml(payload.fechaCreacion)}</div>
              <div><strong>Livraison:</strong> ${escapeHtml(payload.fechaEntrega)}</div>
              <div><strong>Heure prévue:</strong> ${escapeHtml(payload.horaPrevista)}</div>
              <div><strong>Préparée par:</strong> ${escapeHtml(payload.preparadoPor)}</div>
              <div><strong>Priorité:</strong> ${escapeHtml(payload.prioridad)}</div>
              <div><strong>Type:</strong> ${escapeHtml(payload.tipo)}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Articles</div>
              <div class="summary-value">${escapeHtml(payload.totalItems)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Unités</div>
              <div class="summary-value">${escapeHtml(payload.totalUnidades)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Poids estimé</div>
              <div class="summary-value">${escapeHtml(payload.totalPeso)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Valeur estimée</div>
              <div class="summary-value">${escapeHtml(payload.totalValor)}</div>
            </div>
          </div>

          <div class="section-title">Détail des produits</div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Temp.</th>
                <th class="right">Qté</th>
                <th>Unité</th>
                <th class="right">Poids</th>
                <th class="right">Valeur</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer-grid">
            <div class="card">
              <div class="card-title">Observations générales</div>
              <div>${escapeHtml(payload.observaciones)}</div>
            </div>
            <div class="card">
              <div class="card-title">Validation et signatures</div>
              <div class="signature-title">Préparée par</div>
              <div class="signature-line"></div>
              <div class="signature-name">${escapeHtml(payload.preparadoPor)}</div>
              <div class="signature-title" style="margin-top: 18px;">Reçue par</div>
              <div class="signature-line"></div>
              <div class="signature-name">${escapeHtml(payload.responsableRecogida)}</div>
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('load', () => {
            window.setTimeout(() => window.print(), 350);
          }, { once: true });
        </script>
      </body>
    </html>
  `;
}

export function ComandaCompletaImprimible({ comanda, organismo, onClose }: ComandaCompletaImprimibleProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'fr-CA';
  const items = Array.isArray(comanda?.items) ? comanda.items : [];
  const numeroComanda = getFirstText(comanda?.numero, comanda?.numeroComanda, comanda?.id);
  const fechaEntrega = comanda?.fechaEntrega || comanda?.fecha;
  const fechaCreacion = comanda?.fechaCreacion || comanda?.fecha;
  const responsableRecogida = getFirstText(organismo?.responsable, comanda?.organismoResponsable, comanda?.nombreOrganismo);
  const preparadoPor = getFirstText(comanda?.preparadoPor, comanda?.usuarioCreacion, comanda?.creadoPor, 'Non attribué');
  const totalUnidades = items.reduce((sum: number, item: any) => sum + getSafeNumber(item?.cantidad), 0);
  const totalPeso = items.reduce((sum: number, item: any) => sum + (getSafeNumber(item?.peso) * Math.max(getSafeNumber(item?.cantidad), 1)), 0);
  const totalValor = items.reduce((sum: number, item: any) => sum + (getSafeNumber(item?.valorUnitario) * getSafeNumber(item?.cantidad)), 0);
  const qrData = buildComandaQRData({
    numeroComanda,
    organismo: getFirstText(organismo?.nombre, comanda?.nombreOrganismo),
    fecha: fechaEntrega,
    fechaEntrega,
    items: items.length,
    organismoId: organismo?.id,
    totalUnidades,
  });

  const handleImprimir = async () => {
    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      console.error('El navegador bloqueó la ventana de impresión');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Préparation impression...</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 24px;
              color: #334155;
            }
          </style>
        </head>
        <body>Préparation de la commande pour impression...</body>
      </html>
    `);
    printWindow.document.close();

    try {
      const printableItems = items.map((item: any) => {
        const quantite = getSafeNumber(item?.cantidad);
        const poids = getSafeNumber(item?.peso);
        const valorUnitario = getSafeNumber(item?.valorUnitario);
        const valorLinea = quantite * valorUnitario;

        return {
          nombre: getFirstText(item?.nombreProducto, item?.productoNombre),
          temperatura: formatTemperature(item?.temperatura || item?.temperaturaOriginalEntrada),
          cantidad: formatQuantity(quantite),
          unidad: getFirstText(item?.unidad, 'u'),
          peso: poids > 0 ? `${formatQuantity(poids)} kg` : '-',
          valor: valorLinea > 0 ? `CAD$ ${formatMoney(valorLinea)}` : '-',
          observaciones: getFirstText(item?.observaciones),
        };
      });

      const html = await generatePrintableComandaHtml({
        numeroComanda,
        locale,
        title: `Comanda ${numeroComanda}`,
        statusLabel: STATUS_LABELS[comanda?.estado] || getFirstText(comanda?.estado),
        organismoNombre: getFirstText(organismo?.nombre, comanda?.nombreOrganismo),
        organismoTipo: getFirstText(organismo?.tipo),
        organismoDireccion: getFirstText(organismo?.direccion),
        organismoTelefono: getFirstText(organismo?.telefono),
        organismoEmail: getFirstText(organismo?.email),
        responsableRecogida,
        fechaCreacion: formatDate(fechaCreacion, locale, true),
        fechaEntrega: formatDate(fechaEntrega, locale),
        horaPrevista: getFirstText(comanda?.horaRecogida, organismo?.horaCita, 'À convenir'),
        preparadoPor,
        prioridad: getFirstText(comanda?.prioridad, 'Normale'),
        tipo: getFirstText(comanda?.tipo, 'Standard'),
        totalItems: items.length,
        totalUnidades: formatQuantity(totalUnidades),
        totalPeso: `${formatQuantity(totalPeso)} kg`,
        totalValor: `CAD$ ${formatMoney(totalValor)}`,
        observaciones: getFirstText(comanda?.observaciones, 'Aucune observation supplémentaire.'),
        qrData,
        items: printableItems,
      });

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error('Error al preparar la impresión de la comanda:', error);
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head><meta charset="UTF-8" /><title>Erreur impression</title></head>
          <body style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #991b1b;">
            Impossible de préparer la commande pour impression.
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.45cm;
          }

          html,
          body {
            background: white !important;
          }
          
          #compact-order-print {
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }

          .min-h-screen {
            min-height: auto !important;
          }
          
          .no-print {
            display: none !important;
          }

          tr,
          td,
          th,
          .summary-card,
          .detail-card {
            page-break-inside: avoid;
          }

          .print-table {
            font-size: 10px !important;
          }

          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 p-4 print:bg-white print:p-0">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="no-print flex justify-end gap-2">
            <button
              onClick={handleImprimir}
              className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256628]"
            >
              <Printer className="h-4 w-4" />
              {t('orders.printOrder')}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                {t('common.close', 'Fermer')}
              </button>
            )}
          </div>

          <div id="compact-order-print" className="bg-white shadow-2xl print:shadow-none">
            <div className="border-b-4 border-[#1E73BE] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1E73BE]">Banque Alimentaire</p>
                    <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('orders.printOrder')}
                    </h1>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-700">
                    <p><span className="font-semibold">N°:</span> {numeroComanda}</p>
                    <p><span className="font-semibold">Statut:</span> {STATUS_LABELS[comanda?.estado] || getFirstText(comanda?.estado)}</p>
                    <p><span className="font-semibold">Livraison:</span> {formatDate(fechaEntrega, locale)}</p>
                    <p><span className="font-semibold">Imprimé:</span> {formatDate(new Date().toISOString(), locale, true)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2">
                  <BrandedQRCode value={qrData} size={112} level={COMANDA_QR_SVG_LEVEL} includeMargin />
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
              <section className="detail-card rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-[#1E73BE]">
                  <User className="h-4 w-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wide">Organisme</h2>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="text-base font-bold text-slate-900">{getFirstText(organismo?.nombre, comanda?.nombreOrganismo)}</p>
                  <p><span className="font-semibold">Type:</span> {getFirstText(organismo?.tipo)}</p>
                  <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /><span>{getFirstText(organismo?.direccion)}</span></p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{getFirstText(organismo?.telefono)}</span></p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span>{getFirstText(organismo?.email)}</span></p>
                  <p><span className="font-semibold">Responsable:</span> {responsableRecogida}</p>
                </div>
              </section>

              <section className="detail-card rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-[#2E7D32]">
                  <Calendar className="h-4 w-4" />
                  <h2 className="text-sm font-bold uppercase tracking-wide">Détails de la commande</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Créée:</span> {formatDate(fechaCreacion, locale, true)}</p>
                  <p><span className="font-semibold">Livraison:</span> {formatDate(fechaEntrega, locale)}</p>
                  <p><span className="font-semibold">Heure prévue:</span> {getFirstText(comanda?.horaRecogida, organismo?.horaCita, 'À convenir')}</p>
                  <p><span className="font-semibold">Préparée par:</span> {preparadoPor}</p>
                  <p><span className="font-semibold">Priorité:</span> {getFirstText(comanda?.prioridad, 'Normale')}</p>
                  <p><span className="font-semibold">Type:</span> {getFirstText(comanda?.tipo, 'Standard')}</p>
                </div>
              </section>
            </div>

            <div className="grid gap-3 px-5 pb-4 md:grid-cols-4">
              <div className="summary-card rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Articles</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
              </div>
              <div className="summary-card rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unités</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatQuantity(totalUnidades)}</p>
              </div>
              <div className="summary-card rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Poids estimé</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{formatQuantity(totalPeso)} kg</p>
              </div>
              <div className="summary-card rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valeur estimée</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">CAD$ {formatMoney(totalValor)}</p>
              </div>
            </div>

            <div className="px-5 pb-4">
              <div className="mb-2 flex items-center gap-2 text-[#1E73BE]">
                <Package className="h-4 w-4" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Détail des produits</h2>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Produit</th>
                      <th className="px-3 py-2 font-semibold">Temp.</th>
                      <th className="px-3 py-2 text-right font-semibold">Qté</th>
                      <th className="px-3 py-2 font-semibold">Unité</th>
                      <th className="px-3 py-2 text-right font-semibold">Poids</th>
                      <th className="px-3 py-2 text-right font-semibold">Valeur</th>
                      <th className="px-3 py-2 font-semibold">Observations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                          Aucun produit enregistré dans cette commande.
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any, index: number) => {
                        const quantite = getSafeNumber(item?.cantidad);
                        const poids = getSafeNumber(item?.peso);
                        const valorUnitario = getSafeNumber(item?.valorUnitario);
                        const valorLinea = quantite * valorUnitario;

                        return (
                          <tr key={`${item?.productoId || item?.nombreProducto || 'item'}-${index}`} className="border-t border-slate-200 align-top">
                            <td className="px-3 py-2 font-medium text-slate-900 print-table">{getFirstText(item?.nombreProducto, item?.productoNombre)}</td>
                            <td className="px-3 py-2 text-slate-600 print-table">{formatTemperature(item?.temperatura || item?.temperaturaOriginalEntrada)}</td>
                            <td className="px-3 py-2 text-right text-slate-700 print-table">{formatQuantity(quantite)}</td>
                            <td className="px-3 py-2 text-slate-700 print-table">{getFirstText(item?.unidad, 'u')}</td>
                            <td className="px-3 py-2 text-right text-slate-700 print-table">{poids > 0 ? `${formatQuantity(poids)} kg` : '-'}</td>
                            <td className="px-3 py-2 text-right text-slate-700 print-table">{valorLinea > 0 ? `CAD$ ${formatMoney(valorLinea)}` : '-'}</td>
                            <td className="px-3 py-2 text-slate-600 print-table">{getFirstText(item?.observaciones)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 px-5 py-4 md:grid-cols-2">
              <section className="detail-card rounded-xl border border-slate-200 p-4">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">Observations générales</h2>
                <p className="min-h-[72px] text-sm text-slate-700">{getFirstText(comanda?.observaciones, 'Aucune observation supplémentaire.')}</p>
              </section>

              <section className="detail-card rounded-xl border border-slate-200 p-4">
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">Validation et signatures</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold">Préparée par</p>
                    <div className="mt-6 border-b border-slate-300" />
                    <p className="mt-2">{preparadoPor}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Reçue par</p>
                    <div className="mt-6 border-b border-slate-300" />
                    <p className="mt-2">{responsableRecogida}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
