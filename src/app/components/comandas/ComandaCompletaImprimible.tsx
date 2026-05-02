import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Mail, MapPin, Package, Phone, Printer, User, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';

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

function printElementInIsolatedFrame(elementId: string, title: string): void {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    throw new Error(`No se encontró el elemento imprimible: ${elementId}`);
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';

  const inheritedStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');

  const isolatedPrintStyles = `
    <style>
      @page {
        size: letter portrait;
        margin: 0.45cm;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      body {
        font-family: Roboto, Arial, sans-serif;
      }

      #compact-order-print {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
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
    </style>
  `;

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    setTimeout(() => {
      iframe.remove();
    }, 300);
  };

  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframeWindow?.document;

  if (!iframeWindow || !iframeDocument) {
    cleanup();
    throw new Error('No se pudo abrir el iframe de impresión');
  }

  const runPrint = () => {
    if (cleanedUp) {
      return;
    }

    iframeWindow.addEventListener('afterprint', cleanup, { once: true });
    iframeWindow.focus();
    iframeWindow.print();
    window.setTimeout(cleanup, 2000);
  };

  iframe.onload = () => {
    window.setTimeout(runPrint, 350);
  };

  iframeDocument.open();
  iframeDocument.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        ${inheritedStyles}
        ${isolatedPrintStyles}
      </head>
      <body>
        ${sourceElement.outerHTML}
      </body>
    </html>
  `);
  iframeDocument.close();

  window.setTimeout(runPrint, 900);
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
  const qrData = JSON.stringify({
    numeroComanda,
    organismo: getFirstText(organismo?.nombre, comanda?.nombreOrganismo),
    fechaEntrega,
    totalItems: items.length,
    totalUnidades,
  });

  const handleImprimir = () => {
    printElementInIsolatedFrame('compact-order-print', `Comanda ${numeroComanda}`);
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
                  <QRCodeSVG value={qrData} size={88} level="H" includeMargin />
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
