import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { normalizeTemperatureValue, sortByTemperature } from '../../utils/temperatureSort';
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

type ProductoDistribucionDetalle = {
  productoId: string;
  nombreProducto: string;
  unidad: string;
  icono: string;
  cantidad: number;
  pesoTotal: number;
  valorTotal: number;
  temperatura?: string;
};

type DistribucionResumen = {
  comandaId: string;
  numeroDistribucion: string;
  organismo: string;
  fecha: string;
  totalProductos: number;
  totalCantidad: number;
  totalPeso: number;
  totalValor: number;
  productos: ProductoDistribucionDetalle[];
};

type GrupoTemperatura = {
  key: 'ambiente' | 'refrigerado' | 'congelado';
  label: string;
  badgeClassName: string;
  productos: ProductoDistribucionDetalle[];
};

const TEMPERATURE_GROUP_CONFIG: Record<GrupoTemperatura['key'], Omit<GrupoTemperatura, 'productos'>> = {
  ambiente: {
    key: 'ambiente',
    label: 'Température ambiante',
    badgeClassName: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  refrigerado: {
    key: 'refrigerado',
    label: 'Réfrigéré',
    badgeClassName: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  congelado: {
    key: 'congelado',
    label: 'Congelé',
    badgeClassName: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  },
};

function formatearFecha(fecha: string, locale: string) {
  return new Date(fecha).toLocaleDateString(locale || 'fr', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function normalizarClaveFechaDistribucion(fecha?: string): string {
  if (!fecha) {
    return '';
  }

  const fechaNormalizada = new Date(fecha);
  if (Number.isNaN(fechaNormalizada.getTime())) {
    return fecha;
  }

  return fechaNormalizada.toISOString().slice(0, 10);
}

function construirProductosDistribucion(
  comandasAgrupadas: Comanda[],
  productosCatalogo: Array<ReturnType<typeof obtenerProductos>[number] | typeof mockProductos[number]>
): ProductoDistribucionDetalle[] {
  const productosMap = new Map(productosCatalogo.map(producto => [producto.id, producto]));
  const acumulado = new Map<string, ProductoDistribucionDetalle>();

  comandasAgrupadas.forEach(comanda => {
    (comanda.items || []).forEach(item => {
      const cantidad = Number(item.cantidadAceptada || item.cantidadPreparada || item.cantidad || 0);
      if (cantidad <= 0) {
        return;
      }

      const productoCatalogo = productosMap.get(item.productoId);
      const calculoDistribucion = calcularValorDistribucionProducto(productoCatalogo, cantidad);
      const temperatura =
        (item as { temperaturaAlmacenamiento?: string; temperatura?: string }).temperaturaAlmacenamiento ||
        item.temperatura ||
        productoCatalogo?.temperaturaAlmacenamiento ||
        (productoCatalogo as { temperatura?: string } | undefined)?.temperatura;
      const existente = acumulado.get(item.productoId);

      if (existente) {
        existente.cantidad += cantidad;
        existente.pesoTotal += calculoDistribucion.pesoTotal;
        existente.valorTotal += calculoDistribucion.valorTotal;
        return;
      }

      acumulado.set(item.productoId, {
        productoId: item.productoId,
        nombreProducto: item.nombreProducto || item.productoNombre || productoCatalogo?.nombre || item.productoId,
        unidad: item.unidad || productoCatalogo?.unidad || 'unidad',
        icono: item.icono || productoCatalogo?.icono || '📦',
        cantidad,
        pesoTotal: calculoDistribucion.pesoTotal,
        valorTotal: calculoDistribucion.valorTotal,
        temperatura,
      });
    });
  });

  return sortByTemperature(
    Array.from(acumulado.values()),
    producto => producto.temperatura,
    (left, right) => right.cantidad - left.cantidad,
  );
}

function generarNumeroDistribucionUnico(comandas: Comanda[]): string {
  const base = comandas
    .map(comanda => `${comanda.id}|${comanda.numero || comanda.numeroComanda || ''}|${comanda.fechaEntrega || comanda.fecha || ''}`)
    .sort()
    .join('||');

  let hash = 0;
  for (let index = 0; index < base.length; index += 1) {
    hash = ((hash << 5) - hash) + base.charCodeAt(index);
    hash |= 0;
  }

  const fechaReferencia = comandas
    .map(comanda => comanda.fechaEntrega || comanda.fecha)
    .filter(Boolean)
    .sort()
    .at(-1);

  const fechaToken = fechaReferencia
    ? new Date(fechaReferencia).toISOString().slice(0, 10).replace(/-/g, '')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return `DIST-${fechaToken}-${String(Math.abs(hash)).padStart(6, '0').slice(0, 6)}`;
}

export function ListaProductosDistribuidosDialog({
  open,
  onOpenChange,
  comandas,
  currentLocale
}: ListaProductosDistribuidosDialogProps) {
  const [distribucionSeleccionadaId, setDistribucionSeleccionadaId] = useState<string | null>(null);
  const [filtroDistribucion, setFiltroDistribucion] = useState('');

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

  const distribuciones = useMemo(() => {
    if (comandas.length === 0) {
      return [];
    }

    const productosReales = obtenerProductos();
    const productosCatalogo = [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ];
    const comandasPorFecha = new Map<string, Comanda[]>();

    comandas.forEach((comanda) => {
      const fechaBase = comanda.fechaEntrega || comanda.fecha;
      const fechaKey = normalizarClaveFechaDistribucion(fechaBase) || 'sin-fecha';
      const grupo = comandasPorFecha.get(fechaKey) || [];
      grupo.push(comanda);
      comandasPorFecha.set(fechaKey, grupo);
    });

    return Array.from(comandasPorFecha.entries())
      .map(([fechaKey, comandasAgrupadas]) => {
        const productos = construirProductosDistribucion(comandasAgrupadas, productosCatalogo);
        if (productos.length === 0) {
          return null;
        }

        const organismos = Array.from(new Set(comandasAgrupadas.map(comanda => comanda.nombreOrganismo || 'Sin organismo')));
        const fecha = comandasAgrupadas
          .map(comanda => comanda.fechaEntrega || comanda.fecha)
          .filter(Boolean)
          .sort()
          .at(-1) || fechaKey || new Date().toISOString();
        const numeroDistribucion = generarNumeroDistribucionUnico(comandasAgrupadas);

        return {
          comandaId: numeroDistribucion,
          numeroDistribucion,
          organismo: organismos.length === 1 ? organismos[0] : `${organismos.length} organismes regroupés`,
          fecha,
          totalProductos: productos.length,
          totalCantidad: productos.reduce((sum, producto) => sum + producto.cantidad, 0),
          totalPeso: productos.reduce((sum, producto) => sum + producto.pesoTotal, 0),
          totalValor: productos.reduce((sum, producto) => sum + producto.valorTotal, 0),
          productos,
        } satisfies DistribucionResumen;
      })
      .filter((distribucion): distribucion is DistribucionResumen => distribucion !== null)
      .sort((left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime());
  }, [comandas]);

  const distribucionesFiltradas = useMemo(() => {
    const termino = filtroDistribucion.trim().toLowerCase();
    if (!termino) {
      return distribuciones;
    }

    return distribuciones.filter(distribucion => {
      const coincideNumero = distribucion.numeroDistribucion.toLowerCase().includes(termino);
      const coincideOrganismo = distribucion.organismo.toLowerCase().includes(termino);
      const fechaVisible = formatearFecha(distribucion.fecha, currentLocale).toLowerCase();
      const fechaNormalizada = normalizarClaveFechaDistribucion(distribucion.fecha).toLowerCase();
      const coincideFecha = fechaVisible.includes(termino) || fechaNormalizada.includes(termino);
      const coincideProducto = distribucion.productos.some(producto =>
        producto.nombreProducto.toLowerCase().includes(termino)
      );

      return coincideNumero || coincideOrganismo || coincideFecha || coincideProducto;
    });
  }, [currentLocale, distribuciones, filtroDistribucion]);

  const distribucionSeleccionadaFiltrada = useMemo(
    () => distribucionesFiltradas.find(distribucion => distribucion.comandaId === distribucionSeleccionadaId) || null,
    [distribucionSeleccionadaId, distribucionesFiltradas]
  );

  const gruposTemperaturaDistribucion = useMemo(() => {
    if (!distribucionSeleccionadaFiltrada) {
      return [] as GrupoTemperatura[];
    }

    const grupos = distribucionSeleccionadaFiltrada.productos.reduce((accumulator, producto) => {
      const temperatura = normalizeTemperatureValue(producto.temperatura);
      accumulator[temperatura].push(producto);
      return accumulator;
    }, {
      ambiente: [] as ProductoDistribucionDetalle[],
      refrigerado: [] as ProductoDistribucionDetalle[],
      congelado: [] as ProductoDistribucionDetalle[],
    });

    return (Object.keys(TEMPERATURE_GROUP_CONFIG) as Array<GrupoTemperatura['key']>)
      .filter((key) => grupos[key].length > 0)
      .map((key) => ({
        ...TEMPERATURE_GROUP_CONFIG[key],
        productos: grupos[key],
      }));
  }, [distribucionSeleccionadaFiltrada]);

  useEffect(() => {
    if (!open) {
      setDistribucionSeleccionadaId(null);
      setFiltroDistribucion('');
      return;
    }

    if (!distribucionesFiltradas.length) {
      setDistribucionSeleccionadaId(null);
      return;
    }

    setDistribucionSeleccionadaId(currentId => {
      if (!currentId) {
        return null;
      }

      return distribucionesFiltradas.some(distribucion => distribucion.comandaId === currentId)
        ? currentId
        : null;
    });
  }, [open, distribucionesFiltradas]);

  const imprimirLista = () => {
    if (resumen.productos.length === 0) {
      toast.error('Aucun produit distribué à imprimer');
      return;
    }

    const gruposImpresion = (Object.keys(TEMPERATURE_GROUP_CONFIG) as Array<GrupoTemperatura['key']>)
      .map((key) => ({
        ...TEMPERATURE_GROUP_CONFIG[key],
        productos: resumen.productos.filter(producto => normalizeTemperatureValue(producto.temperatura) === key),
      }))
      .filter((grupo) => grupo.productos.length > 0);

    const filas = gruposImpresion.map(grupo => {
      const filasGrupo = grupo.productos.map(producto => `
        <tr>
          <td>${producto.icono} ${producto.nombreProducto}</td>
          <td style="text-align:center;">${formatQuantity(producto.cantidadTotal)} ${producto.unidad}</td>
          <td style="text-align:center;">${formatQuantity(producto.pesoTotal)} kg</td>
          <td style="text-align:right;">CAD$ ${formatMoney(producto.valorTotal)}</td>
          <td style="text-align:center;">${producto.comandas.length}</td>
          <td style="text-align:center;">${formatearFecha(producto.ultimaFecha, currentLocale)}</td>
        </tr>
      `).join('');

      return `
        <tr class="temperature-row">
          <td colspan="6">${grupo.label}</td>
        </tr>
        ${filasGrupo}
      `;
    }).join('');

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
              .temperature-row td { background: #eef4fb; color: #1E73BE; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
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

          {distribuciones.length > 0 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Distributions
                  </h3>
                  <p className="text-sm text-[#666666]">
                    Cliquez sur un numéro de distribution pour ouvrir sa liste de produits.
                  </p>
                </div>

                <Input
                  value={filtroDistribucion}
                  onChange={(event) => setFiltroDistribucion(event.target.value)}
                  placeholder="Filtrer par n° distribution, organisme ou produit"
                  className="max-w-xl"
                />

                <div className="rounded-xl border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° distribution</TableHead>
                        <TableHead>Organisme</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Produits</TableHead>
                        <TableHead className="text-center">Quantité</TableHead>
                        <TableHead className="text-right">Valeur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribucionesFiltradas.map(distribucion => {
                        const isActive = distribucion.comandaId === distribucionSeleccionadaId;

                        return (
                          <TableRow key={distribucion.comandaId} className={isActive ? 'bg-blue-50/70' : undefined}>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDistribucionSeleccionadaId(distribucion.comandaId)}
                                className="h-auto px-0 font-semibold text-[#1E73BE] hover:bg-transparent hover:text-[#175a95]"
                              >
                                {distribucion.numeroDistribucion}
                              </Button>
                            </TableCell>
                            <TableCell>{distribucion.organismo}</TableCell>
                            <TableCell className="text-center">{formatearFecha(distribucion.fecha, currentLocale)}</TableCell>
                            <TableCell className="text-center">{distribucion.totalProductos}</TableCell>
                            <TableCell className="text-center">{formatQuantity(distribucion.totalCantidad)}</TableCell>
                            <TableCell className="text-right font-semibold text-[#2E7D32]">CAD$ {formatMoney(distribucion.totalValor)}</TableCell>
                          </TableRow>
                        );
                      })}
                      {distribucionesFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-[#666666]">
                            Aucune distribution ne correspond au filtre actuel.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {distribucionSeleccionadaFiltrada && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Produits de la distribution {distribucionSeleccionadaFiltrada.numeroDistribucion}
                    </h3>
                    <p className="text-sm text-[#666666]">
                      {distribucionSeleccionadaFiltrada.organismo} | {formatearFecha(distribucionSeleccionadaFiltrada.fecha, currentLocale)}
                    </p>
                  </div>
                  <Badge className="w-fit bg-[#1E73BE] hover:bg-[#1E73BE]">{distribucionSeleccionadaFiltrada.totalProductos} produit(s)</Badge>
                </div>

                <div className="space-y-4">
                  {gruposTemperaturaDistribucion.map((grupo) => (
                    <div key={grupo.key} className="rounded-xl border bg-white overflow-hidden">
                      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                        <Badge className={grupo.badgeClassName}>{grupo.label}</Badge>
                        <span className="text-sm font-medium text-[#666666]">
                          {grupo.productos.length} produit(s)
                        </span>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead className="text-center">Quantité</TableHead>
                            <TableHead className="text-center">Poids</TableHead>
                            <TableHead className="text-right">Valeur</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.productos.map(producto => (
                            <TableRow key={`${distribucionSeleccionadaFiltrada.comandaId}-${grupo.key}-${producto.productoId}`}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{producto.icono}</span>
                                  <div>
                                    <p className="font-medium text-[#333333]">{producto.nombreProducto}</p>
                                    <p className="text-xs text-[#666666]">{producto.productoId}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-semibold">{formatQuantity(producto.cantidad)} {producto.unidad}</TableCell>
                              <TableCell className="text-center">{formatQuantity(producto.pesoTotal)} kg</TableCell>
                              <TableCell className="text-right font-semibold text-[#2E7D32]">CAD$ {formatMoney(producto.valorTotal)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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