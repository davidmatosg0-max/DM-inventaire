import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Package, Printer, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { obtenerProductos } from '../../utils/productStorage';
import { calcularValorDistribucionProducto } from '../../utils/distributionValue';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { openAutoPrintPopup } from '../../utils/printPopup';
import { sortByTemperature } from '../../utils/temperatureSort';
import { mockProductos } from '../../data/mockData';
import type { Comanda } from '../../types';

interface ListaProductosDistribuidosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comandas: Comanda[];
  currentLocale: string;
}

type ProductoDistribuidoResumen = {
  productoId: string;
  nombreProducto: string;
  unidad: string;
  icono: string;
  cantidadTotal: number;
  pesoTotal: number;
  valorTotal: number;
  organismos: string[];
  comandas: string[];
  ultimaFecha: string;
  temperatura?: string;
};

function formatearFecha(fecha: string, locale: string) {
  return new Date(fecha).toLocaleDateString(locale || 'fr', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function ListaProductosDistribuidosDialog({
  open,
  onOpenChange,
  comandas,
  currentLocale
}: ListaProductosDistribuidosDialogProps) {
  const resumen = useMemo(() => {
    const productosReales = obtenerProductos();
    const productosCatalogo = [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ];

    const productosMap = new Map(productosCatalogo.map(producto => [producto.id, producto]));
    const acumulado = new Map<string, ProductoDistribuidoResumen>();

    comandas.forEach(comanda => {
      (comanda.items || []).forEach(item => {
        const cantidad = Number(item.cantidadAceptada || item.cantidadPreparada || item.cantidad || 0);
        if (cantidad <= 0) {
          return;
        }

        const productoCatalogo = productosMap.get(item.productoId);
        const calculoDistribucion = calcularValorDistribucionProducto(productoCatalogo, cantidad);
        const nombreProducto = item.nombreProducto || item.productoNombre || productoCatalogo?.nombre || item.productoId;
        const unidad = item.unidad || productoCatalogo?.unidad || 'unidad';
        const icono = item.icono || productoCatalogo?.icono || '📦';
        const temperatura =
          (item as { temperaturaAlmacenamiento?: string; temperatura?: string }).temperaturaAlmacenamiento ||
          (item as { temperatura?: string }).temperatura ||
          productoCatalogo?.temperaturaAlmacenamiento ||
          (productoCatalogo as { temperatura?: string } | undefined)?.temperatura;
        const numeroComanda = comanda.numero || comanda.numeroComanda || comanda.id;
        const organismo = comanda.nombreOrganismo || 'Sin organismo';
        const fechaBase = comanda.fechaEntrega || comanda.fecha;

        const existente = acumulado.get(item.productoId);
        if (existente) {
          existente.cantidadTotal += cantidad;
          existente.pesoTotal += calculoDistribucion.pesoTotal;
          existente.valorTotal += calculoDistribucion.valorTotal;
          if (!existente.organismos.includes(organismo)) {
            existente.organismos.push(organismo);
          }
          if (!existente.comandas.includes(numeroComanda)) {
            existente.comandas.push(numeroComanda);
          }
          if (new Date(fechaBase) > new Date(existente.ultimaFecha)) {
            existente.ultimaFecha = fechaBase;
          }
          return;
        }

        acumulado.set(item.productoId, {
          productoId: item.productoId,
          nombreProducto,
          unidad,
          icono,
          cantidadTotal: cantidad,
          pesoTotal: calculoDistribucion.pesoTotal,
          valorTotal: calculoDistribucion.valorTotal,
          organismos: [organismo],
          comandas: [numeroComanda],
          ultimaFecha: fechaBase,
          temperatura
        });
      });
    });

    const productos = sortByTemperature(
      Array.from(acumulado.values()),
      producto => producto.temperatura,
      (a, b) => b.cantidadTotal - a.cantidadTotal,
    );

    return {
      productos,
      totalComandas: comandas.length,
      totalProductos: productos.length,
      totalCantidad: productos.reduce((sum, producto) => sum + producto.cantidadTotal, 0),
      totalPeso: productos.reduce((sum, producto) => sum + producto.pesoTotal, 0),
      totalValor: productos.reduce((sum, producto) => sum + producto.valorTotal, 0)
    };
  }, [comandas]);

  const imprimirLista = () => {
    if (resumen.productos.length === 0) {
      toast.error('Aucun produit distribué à imprimer');
      return;
    }

    const filas = resumen.productos.map(producto => `
      <tr>
        <td>${producto.icono} ${producto.nombreProducto}</td>
        <td style="text-align:center;">${formatQuantity(producto.cantidadTotal)} ${producto.unidad}</td>
        <td style="text-align:center;">${formatQuantity(producto.pesoTotal)} kg</td>
        <td style="text-align:right;">CAD$ ${formatMoney(producto.valorTotal)}</td>
        <td>${producto.organismos.join(', ')}</td>
        <td style="text-align:center;">${producto.comandas.length}</td>
        <td style="text-align:center;">${formatearFecha(producto.ultimaFecha, currentLocale)}</td>
      </tr>
    `).join('');

    try {
      openAutoPrintPopup(`
        <html>
          <head>
            <title>Liste Produits Distribués</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
              h1 { margin: 0 0 8px; color: #1E73BE; }
              p { margin: 0 0 16px; }
              .resume { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
              .card { border: 1px solid #dbe3ea; border-radius: 12px; padding: 12px; background: #f8fbff; }
              .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
              .value { font-size: 20px; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #dbe3ea; padding: 10px; font-size: 12px; vertical-align: top; }
              th { background: #1E73BE; color: white; text-align: left; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>Liste des produits distribués</h1>
            <p>Comandes incluses: ${resumen.totalComandas} | Produits: ${resumen.totalProductos} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}</p>
            <div class="resume">
              <div class="card"><div class="label">Quantité totale</div><div class="value">${formatQuantity(resumen.totalCantidad)}</div></div>
              <div class="card"><div class="label">Poids total</div><div class="value">${formatQuantity(resumen.totalPeso)} kg</div></div>
              <div class="card"><div class="label">Valeur totale</div><div class="value">CAD$ ${formatMoney(resumen.totalValor)}</div></div>
              <div class="card"><div class="label">Produits distincts</div><div class="value">${resumen.totalProductos}</div></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Poids</th>
                  <th>Valeur</th>
                  <th>Organismes</th>
                  <th>Comandes</th>
                  <th>Dernière date</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
          </body>
        </html>
      `, { width: 1200, height: 800, printDelayMs: 350 });
    } catch (error) {
      toast.error('Impossible d’ouvrir la fenêtre d’impression');
    }
  };

  const exportarPDF = () => {
    if (resumen.productos.length === 0) {
      toast.error('Aucun produit distribué à exporter');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Liste des produits distribués', 14, 18);
    doc.setFontSize(10);
    doc.text(`Comandes incluses: ${resumen.totalComandas} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}`, 14, 26);
    doc.text(`Quantité: ${formatQuantity(resumen.totalCantidad)} | Poids: ${formatQuantity(resumen.totalPeso)} kg | Valeur: CAD$ ${formatMoney(resumen.totalValor)}`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [['Produit', 'Quantité', 'Poids', 'Valeur', 'Organismes', 'Comandes', 'Dernière date']],
      body: resumen.productos.map(producto => [
        `${producto.icono} ${producto.nombreProducto}`,
        `${formatQuantity(producto.cantidadTotal)} ${producto.unidad}`,
        `${formatQuantity(producto.pesoTotal)} kg`,
        `CAD$ ${formatMoney(producto.valorTotal)}`,
        producto.organismos.join(', '),
        String(producto.comandas.length),
        formatearFecha(producto.ultimaFecha, currentLocale)
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [30, 115, 190],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 52 },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 72 },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 24, halign: 'center' }
      }
    });

    doc.save(`Liste_Produits_Distribues_${Date.now()}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="liste-produits-distribues-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-5 h-5 text-[#1E73BE]" />
            Liste des produits distribués
          </DialogTitle>
          <DialogDescription id="liste-produits-distribues-description">
            Résumé consolidé des produits présents dans les commandes filtrées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={imprimirLista} disabled={resumen.productos.length === 0}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={exportarPDF} disabled={resumen.productos.length === 0} className="bg-[#1E73BE] hover:bg-[#175a95]">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Comandes incluses</p><p className="text-2xl font-bold text-[#1E73BE]">{resumen.totalComandas}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Produits distincts</p><p className="text-2xl font-bold text-[#2E7D32]">{resumen.totalProductos}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Quantité totale</p><p className="text-2xl font-bold text-[#F57C00]">{formatQuantity(resumen.totalCantidad)}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Valeur totale</p><p className="text-2xl font-bold text-[#FFC107]">CAD$ {formatMoney(resumen.totalValor)}</p></CardContent></Card>
          </div>

          {resumen.productos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-[#666666]">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              Aucune commande avec produits distribués dans le filtre actuel.
            </div>
          ) : (
            <div className="rounded-xl border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-center">Poids</TableHead>
                    <TableHead className="text-right">Valeur</TableHead>
                    <TableHead>Organismes</TableHead>
                    <TableHead className="text-center">Comandes</TableHead>
                    <TableHead className="text-center">Dernière date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumen.productos.map(producto => (
                    <TableRow key={producto.productoId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{producto.icono}</span>
                          <div>
                            <p className="font-medium text-[#333333]">{producto.nombreProducto}</p>
                            <p className="text-xs text-[#666666]">{producto.productoId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{formatQuantity(producto.cantidadTotal)} {producto.unidad}</TableCell>
                      <TableCell className="text-center">{formatQuantity(producto.pesoTotal)} kg</TableCell>
                      <TableCell className="text-right font-semibold text-[#2E7D32]">CAD$ {formatMoney(producto.valorTotal)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {producto.organismos.slice(0, 2).map(organismo => (
                            <Badge key={`${producto.productoId}-${organismo}`} variant="outline" className="text-xs">
                              {organismo}
                            </Badge>
                          ))}
                          {producto.organismos.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{producto.organismos.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{producto.comandas.length}</TableCell>
                      <TableCell className="text-center">{formatearFecha(producto.ultimaFecha, currentLocale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}