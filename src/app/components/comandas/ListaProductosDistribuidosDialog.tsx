import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Package, Printer, FileText, Download, Edit2, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { actualizarComandasDistribucion } from '../../utils/comandaStorage';
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
  onDistribucionesActualizadas?: () => void;
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
  comandaIds: string[];
  comandaReferenciaId: string;
  numeroDistribucion: string;
  organismo: string;
  fecha: string;
  grupoDistribucionId?: string;
  grupoDistribucionEtiqueta?: string;
  grupoDistribucionAnclada?: boolean;
  fechaCaducidadGrupo?: string;
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

const DISTRIBUCION_ESTADOS_FINALIZADOS = new Set(['entregada', 'anulada']);

type ResumenDistribuciones = {
  productos: ProductoDistribuidoResumen[];
  totalComandas: number;
  totalProductos: number;
  totalCantidad: number;
  totalPeso: number;
  totalValor: number;
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

function agruparProductosPorTemperatura<T extends { temperatura?: string }>(productos: T[]) {
  const grupos = productos.reduce((accumulator, producto) => {
    const temperatura = normalizeTemperatureValue(producto.temperatura);
    accumulator[temperatura].push(producto);
    return accumulator;
  }, {
    ambiente: [] as T[],
    refrigerado: [] as T[],
    congelado: [] as T[],
  });

  return (Object.keys(TEMPERATURE_GROUP_CONFIG) as Array<GrupoTemperatura['key']>)
    .filter((key) => grupos[key].length > 0)
    .map((key) => ({
      ...TEMPERATURE_GROUP_CONFIG[key],
      productos: grupos[key],
    }));
}

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

function construirResumenDistribuciones(
  comandasResumen: Comanda[],
  productosCatalogo: Array<ReturnType<typeof obtenerProductos>[number] | typeof mockProductos[number]>
): ResumenDistribuciones {
  const productosMap = new Map(productosCatalogo.map(producto => [producto.id, producto]));
  const acumulado = new Map<string, ProductoDistribuidoResumen>();

  comandasResumen.forEach(comanda => {
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
        temperatura,
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
    totalComandas: comandasResumen.length,
    totalProductos: productos.length,
    totalCantidad: productos.reduce((sum, producto) => sum + producto.cantidadTotal, 0),
    totalPeso: productos.reduce((sum, producto) => sum + producto.pesoTotal, 0),
    totalValor: productos.reduce((sum, producto) => sum + producto.valorTotal, 0)
  };
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
  currentLocale,
  onDistribucionesActualizadas
}: ListaProductosDistribuidosDialogProps) {
  const [distribucionSeleccionadaId, setDistribucionSeleccionadaId] = useState<string | null>(null);
  const [filtroDistribucion, setFiltroDistribucion] = useState('');
  const [filtroProductos, setFiltroProductos] = useState('');
  const [filtroDetalleDistribucion, setFiltroDetalleDistribucion] = useState('');
  const [fechaCaducidadDistribucionEditada, setFechaCaducidadDistribucionEditada] = useState('');
  const detalleDistribucionRef = useRef<HTMLDivElement | null>(null);
  const debeDesplazarADetalleRef = useRef(false);

  const resumen = useMemo(() => {
    const productosReales = obtenerProductos();
    const productosCatalogo = [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ];

    return construirResumenDistribuciones(comandas, productosCatalogo);
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
    const comandasPorGrupo = new Map<string, Comanda[]>();

    comandas.forEach((comanda) => {
      const fechaBase = comanda.fechaEntrega || comanda.fecha;
      const fechaKey = normalizarClaveFechaDistribucion(fechaBase) || 'sin-fecha';
      const grupoKey = comanda.grupoDistribucionId || `comanda-${comanda.id || fechaKey}`;
      const grupo = comandasPorGrupo.get(grupoKey) || [];
      grupo.push(comanda);
      comandasPorGrupo.set(grupoKey, grupo);
    });

    return Array.from(comandasPorGrupo.entries())
      .map(([grupoKey, comandasAgrupadas]) => {
        const productos = construirProductosDistribucion(comandasAgrupadas, productosCatalogo);
        if (productos.length === 0) {
          return null;
        }

        const comandaReferencia = comandasAgrupadas.find(comanda => comanda.grupoDistribucionId) || comandasAgrupadas[0];
        const organismos = Array.from(new Set(comandasAgrupadas.map(comanda => comanda.nombreOrganismo || 'Sin organismo')));
        const fecha = comandasAgrupadas
          .map(comanda => comanda.fechaEntrega || comanda.fecha)
          .filter(Boolean)
          .sort()
          .at(-1) || grupoKey || new Date().toISOString();
        const numeroDistribucion = comandaReferencia?.grupoDistribucionEtiqueta || generarNumeroDistribucionUnico(comandasAgrupadas);

        return {
          comandaId: numeroDistribucion,
          comandaIds: comandasAgrupadas.map(comanda => comanda.id),
          comandaReferenciaId: comandaReferencia?.id || comandasAgrupadas[0]?.id || numeroDistribucion,
          numeroDistribucion,
          organismo: organismos.length === 1 ? organismos[0] : `${organismos.length} organismes regroupés`,
          fecha,
          grupoDistribucionId: comandaReferencia?.grupoDistribucionId,
          grupoDistribucionEtiqueta: comandaReferencia?.grupoDistribucionEtiqueta,
          grupoDistribucionAnclada: comandaReferencia?.grupoDistribucionAnclada,
          fechaCaducidadGrupo: comandaReferencia?.fechaCaducidadGrupo,
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
  const ultimaDistribucionVisibleId = distribucionesFiltradas[0]?.comandaId || null;
  const distribucionSeleccionadaFinalizada = useMemo(() => {
    if (!distribucionSeleccionadaFiltrada) {
      return false;
    }

    return distribucionSeleccionadaFiltrada.comandaIds.every((comandaId) => {
      const comanda = comandas.find((item) => item.id === comandaId);
      return Boolean(comanda?.estado && DISTRIBUCION_ESTADOS_FINALIZADOS.has(comanda.estado));
    });
  }, [comandas, distribucionSeleccionadaFiltrada]);

  const resumenVisible = useMemo(() => {
    if (distribucionesFiltradas.length === distribuciones.length) {
      return resumen;
    }

    const comandaIdsFiltradas = new Set(distribucionesFiltradas.flatMap(distribucion => distribucion.comandaIds));
    const comandasVisibles = comandas.filter(comanda => comandaIdsFiltradas.has(comanda.id));
    const productosReales = obtenerProductos();
    const productosCatalogo = [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ];

    return construirResumenDistribuciones(comandasVisibles, productosCatalogo);
  }, [comandas, distribuciones.length, distribucionesFiltradas, resumen]);

  const resumenCabecera = useMemo(() => {
    if (!distribucionSeleccionadaFiltrada) {
      return resumenVisible;
    }

    return {
      productos: distribucionSeleccionadaFiltrada.productos,
      totalComandas: distribucionSeleccionadaFiltrada.comandaIds.length,
      totalProductos: distribucionSeleccionadaFiltrada.totalProductos,
      totalCantidad: distribucionSeleccionadaFiltrada.totalCantidad,
      totalPeso: distribucionSeleccionadaFiltrada.totalPeso,
      totalValor: distribucionSeleccionadaFiltrada.totalValor,
    } satisfies ResumenDistribuciones;
  }, [distribucionSeleccionadaFiltrada, resumenVisible]);

  const gruposTemperaturaDistribucion = useMemo(() => {
    if (!distribucionSeleccionadaFiltrada) {
      return [] as GrupoTemperatura[];
    }

    const termino = filtroDetalleDistribucion.trim().toLowerCase();
    const productos = !termino
      ? distribucionSeleccionadaFiltrada.productos
      : distribucionSeleccionadaFiltrada.productos.filter((producto) => {
          const coincideNombre = producto.nombreProducto.toLowerCase().includes(termino);
          const coincideCodigo = producto.productoId.toLowerCase().includes(termino);
          const coincideUnidad = producto.unidad.toLowerCase().includes(termino);
          const coincideTemperatura = normalizeTemperatureValue(producto.temperatura).toLowerCase().includes(termino);

          return coincideNombre || coincideCodigo || coincideUnidad || coincideTemperatura;
        });

    return agruparProductosPorTemperatura(productos);
  }, [distribucionSeleccionadaFiltrada, filtroDetalleDistribucion]);

  const productosResumenFiltrados = useMemo(() => {
    const termino = filtroProductos.trim().toLowerCase();
    if (!termino) {
      return resumenVisible.productos;
    }

    return resumenVisible.productos.filter((producto) => {
      const coincideNombre = producto.nombreProducto.toLowerCase().includes(termino);
      const coincideCodigo = producto.productoId.toLowerCase().includes(termino);
      const coincideOrganismo = producto.organismos.some((organismo) => organismo.toLowerCase().includes(termino));
      const coincideComanda = producto.comandas.some((comanda) => comanda.toLowerCase().includes(termino));
      const fechaVisible = formatearFecha(producto.ultimaFecha, currentLocale).toLowerCase();
      const fechaNormalizada = normalizarClaveFechaDistribucion(producto.ultimaFecha).toLowerCase();
      const coincideFecha = fechaVisible.includes(termino) || fechaNormalizada.includes(termino);

      return coincideNombre || coincideCodigo || coincideOrganismo || coincideComanda || coincideFecha;
    });
  }, [currentLocale, filtroProductos, resumenVisible.productos]);

  const resumenImpresionDetalle = useMemo(() => {
    if (!distribucionSeleccionadaFiltrada) {
      return null;
    }

    const productos = gruposTemperaturaDistribucion.flatMap((grupo) => grupo.productos);

    return {
      productos,
      totalComandas: distribucionSeleccionadaFiltrada.comandaIds.length,
      totalProductos: productos.length,
      totalCantidad: productos.reduce((sum, producto) => sum + producto.cantidad, 0),
      totalPeso: productos.reduce((sum, producto) => sum + producto.pesoTotal, 0),
      totalValor: productos.reduce((sum, producto) => sum + producto.valorTotal, 0),
    };
  }, [distribucionSeleccionadaFiltrada, gruposTemperaturaDistribucion]);

  const resumenImpresionConsolidado = useMemo(() => ({
    productos: productosResumenFiltrados,
    totalComandas: resumenVisible.totalComandas,
    totalProductos: productosResumenFiltrados.length,
    totalCantidad: productosResumenFiltrados.reduce((sum, producto) => sum + producto.cantidadTotal, 0),
    totalPeso: productosResumenFiltrados.reduce((sum, producto) => sum + producto.pesoTotal, 0),
    totalValor: productosResumenFiltrados.reduce((sum, producto) => sum + producto.valorTotal, 0),
  }), [productosResumenFiltrados, resumenVisible.totalComandas]);

  useEffect(() => {
    if (!open) {
      setDistribucionSeleccionadaId(null);
      setFiltroDistribucion('');
      setFiltroProductos('');
      setFiltroDetalleDistribucion('');
      return;
    }

    if (!distribucionesFiltradas.length) {
      setDistribucionSeleccionadaId(null);
      return;
    }

    setDistribucionSeleccionadaId(currentId => {
      if (!currentId) {
        return distribucionesFiltradas[0]?.comandaId || null;
      }

      return distribucionesFiltradas.some(distribucion => distribucion.comandaId === currentId)
        ? currentId
        : distribucionesFiltradas[0]?.comandaId || null;
    });
  }, [open, distribucionesFiltradas]);

  useEffect(() => {
    setFiltroDetalleDistribucion('');
  }, [distribucionSeleccionadaId]);

  useEffect(() => {
    setFechaCaducidadDistribucionEditada(distribucionSeleccionadaFiltrada?.fechaCaducidadGrupo || '');
  }, [distribucionSeleccionadaFiltrada]);

  useEffect(() => {
    if (!debeDesplazarADetalleRef.current || !distribucionSeleccionadaFiltrada || !detalleDistribucionRef.current) {
      return;
    }

    detalleDistribucionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    debeDesplazarADetalleRef.current = false;
  }, [distribucionSeleccionadaFiltrada]);

  const abrirDistribucion = (distribucionId: string) => {
    if (distribucionId === distribucionSeleccionadaId) {
      detalleDistribucionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    debeDesplazarADetalleRef.current = true;
    setDistribucionSeleccionadaId(distribucionId);
  };

  const handleGuardarFechaDistribucion = () => {
    if (!distribucionSeleccionadaFiltrada) {
      return;
    }

    if (distribucionSeleccionadaFinalizada) {
      toast.error('Cette distribution est finalisée et ne peut plus être modifiée.');
      return;
    }

    const distribucionEditable =
      distribucionSeleccionadaFiltrada.comandaIds.length > 1 ||
      Boolean(distribucionSeleccionadaFiltrada.grupoDistribucionId);

    if (!distribucionEditable) {
      toast.error('Cette distribution ne possède pas de portée groupée modifiable.');
      return;
    }

    try {
      const grupoDistribucionId =
        distribucionSeleccionadaFiltrada.grupoDistribucionId ||
        `dist-${distribucionSeleccionadaFiltrada.comandaId.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`;
      const grupoDistribucionEtiqueta =
        distribucionSeleccionadaFiltrada.grupoDistribucionEtiqueta ||
        distribucionSeleccionadaFiltrada.numeroDistribucion;

      actualizarComandasDistribucion(
        distribucionSeleccionadaFiltrada.comandaIds,
        {
          fechaCaducidadGrupo: fechaCaducidadDistribucionEditada || undefined,
        },
        {
          grupoDistribucionId,
          grupoDistribucionEtiqueta,
          grupoDistribucionAnclada: true,
        },
      );

      onDistribucionesActualizadas?.();
      toast.success('La date de péremption de la distribution a été mise à jour.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la distribution:', error);
      toast.error('Impossible de mettre à jour la date de péremption de la distribution.');
    }
  };

  const imprimirLista = () => {
    const imprimirDetalle = Boolean(distribucionSeleccionadaFiltrada);

    if (imprimirDetalle && (!resumenImpresionDetalle || resumenImpresionDetalle.productos.length === 0)) {
      toast.error('Aucun produit distribué à imprimer');
      return;
    }

    if (!imprimirDetalle && resumenImpresionConsolidado.productos.length === 0) {
      toast.error('Aucun produit distribué à imprimer');
      return;
    }

    const titre = imprimirDetalle
      ? `Produits de la distribution ${distribucionSeleccionadaFiltrada?.numeroDistribucion || ''}`
      : 'Liste de distributions';

    const resume = imprimirDetalle ? resumenImpresionDetalle : resumenImpresionConsolidado;

    const filas = imprimirDetalle
      ? gruposTemperaturaDistribucion.map(grupo => {
          const filasGrupo = grupo.productos.map(producto => `
            <tr>
              <td>${producto.icono} ${producto.nombreProducto}</td>
              <td style="text-align:center;">${formatQuantity(producto.cantidad)} ${producto.unidad}</td>
              <td style="text-align:center;">${formatQuantity(producto.pesoTotal)} kg</td>
              <td style="text-align:right;">CAD$ ${formatMoney(producto.valorTotal)}</td>
            </tr>
          `).join('');

          return `
            <tr class="temperature-row">
              <td colspan="4">${grupo.label}</td>
            </tr>
            ${filasGrupo}
          `;
        }).join('')
      : agruparProductosPorTemperatura(productosResumenFiltrados).map(grupo => {
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

    const tableHeader = imprimirDetalle
      ? `
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Poids</th>
          <th>Valeur</th>
        </tr>
      `
      : `
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Poids</th>
          <th>Valeur</th>
          <th>Comandes</th>
          <th>Dernière date</th>
        </tr>
      `;

    const sousTitre = imprimirDetalle && distribucionSeleccionadaFiltrada
      ? `${distribucionSeleccionadaFiltrada.organismo} | ${formatearFecha(distribucionSeleccionadaFiltrada.fecha, currentLocale)} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}`
      : `Comandes incluses: ${resume.totalComandas} | Produits: ${resume.totalProductos} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}`;

    try {
      openAutoPrintPopup(`
        <html>
          <head>
            <title>Liste de distributions</title>
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
            <h1>${titre}</h1>
            <p>${sousTitre}</p>
            <div class="resume">
              <div class="card"><div class="label">Quantité totale</div><div class="value">${formatQuantity(resume.totalCantidad)}</div></div>
              <div class="card"><div class="label">Poids total</div><div class="value">${formatQuantity(resume.totalPeso)} kg</div></div>
              <div class="card"><div class="label">Valeur totale</div><div class="value">CAD$ ${formatMoney(resume.totalValor)}</div></div>
              <div class="card"><div class="label">Produits distincts</div><div class="value">${resume.totalProductos}</div></div>
            </div>
            <table>
              <thead>
                ${tableHeader}
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
    const exportarDetalle = Boolean(distribucionSeleccionadaFiltrada);

    if (exportarDetalle && (!resumenImpresionDetalle || resumenImpresionDetalle.productos.length === 0)) {
      toast.error('Aucun produit distribué à exporter');
      return;
    }

    if (!exportarDetalle && resumenImpresionConsolidado.productos.length === 0) {
      toast.error('Aucun produit distribué à exporter');
      return;
    }

    const resumePDF = exportarDetalle ? resumenImpresionDetalle : resumenImpresionConsolidado;
    const titre = exportarDetalle
      ? `Produits de la distribution ${distribucionSeleccionadaFiltrada?.numeroDistribucion || ''}`
      : 'Liste de distributions';

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text(titre, 14, 18);
    doc.setFontSize(10);
    if (exportarDetalle && distribucionSeleccionadaFiltrada) {
      doc.text(
        `${distribucionSeleccionadaFiltrada.organismo} | ${formatearFecha(distribucionSeleccionadaFiltrada.fecha, currentLocale)} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}`,
        14,
        26,
      );
    } else {
      doc.text(`Comandes incluses: ${resumePDF.totalComandas} | Produits: ${resumePDF.totalProductos} | Généré le: ${new Date().toLocaleDateString(currentLocale || 'fr')}`, 14, 26);
    }

    doc.text(`Quantité: ${formatQuantity(resumePDF.totalCantidad)} | Poids: ${formatQuantity(resumePDF.totalPeso)} kg | Valeur: CAD$ ${formatMoney(resumePDF.totalValor)}`, 14, 32);

    let currentY = 40;
    const groupesExport = exportarDetalle
      ? gruposTemperaturaDistribucion
      : agruparProductosPorTemperatura(productosResumenFiltrados);

    groupesExport.forEach((groupe) => {
      const pageHeight = doc.internal.pageSize.getHeight();

      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(10);
      doc.text(groupe.label, 14, currentY);
      currentY += 2;

      autoTable(doc, {
        startY: currentY,
        head: [exportarDetalle
          ? ['Produit', 'Quantité', 'Poids', 'Valeur']
          : ['Produit', 'Quantité', 'Poids', 'Valeur', 'Comandes', 'Dernière date']],
        body: exportarDetalle
          ? groupe.productos.map(producto => [
              `${producto.icono} ${producto.nombreProducto}`,
              `${formatQuantity(producto.cantidad)} ${producto.unidad}`,
              `${formatQuantity(producto.pesoTotal)} kg`,
              `CAD$ ${formatMoney(producto.valorTotal)}`,
            ])
          : groupe.productos.map(producto => [
              `${producto.icono} ${producto.nombreProducto}`,
              `${formatQuantity((producto as ProductoDistribuidoResumen).cantidadTotal)} ${(producto as ProductoDistribuidoResumen).unidad}`,
              `${formatQuantity(producto.pesoTotal)} kg`,
              `CAD$ ${formatMoney(producto.valorTotal)}`,
              String((producto as ProductoDistribuidoResumen).comandas.length),
              formatearFecha((producto as ProductoDistribuidoResumen).ultimaFecha, currentLocale),
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
        columnStyles: exportarDetalle
          ? {
              0: { cellWidth: 120 },
              1: { cellWidth: 40, halign: 'center' },
              2: { cellWidth: 36, halign: 'center' },
              3: { cellWidth: 42, halign: 'right' },
            }
          : {
              0: { cellWidth: 92 },
              1: { cellWidth: 34, halign: 'center' },
              2: { cellWidth: 28, halign: 'center' },
              3: { cellWidth: 34, halign: 'right' },
              4: { cellWidth: 24, halign: 'center' },
              5: { cellWidth: 34, halign: 'center' },
            }
      });

      currentY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
        ? ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || currentY) + 8
        : currentY + 24;
    });

    doc.save(`Liste_Distributions_${Date.now()}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="liste-produits-distribues-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-5 h-5 text-[#1E73BE]" />
            Liste de distributions
          </DialogTitle>
          <DialogDescription id="liste-produits-distribues-description">
            Résumé consolidé des produits présents dans les commandes filtrées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={imprimirLista} disabled={resumenVisible.productos.length === 0}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={exportarPDF} disabled={resumenVisible.productos.length === 0} className="bg-[#1E73BE] hover:bg-[#175a95]">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Comandes incluses</p><p className="text-2xl font-bold text-[#1E73BE]">{resumenCabecera.totalComandas}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Produits distincts</p><p className="text-2xl font-bold text-[#2E7D32]">{resumenCabecera.totalProductos}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Quantité totale</p><p className="text-2xl font-bold text-[#F57C00]">{formatQuantity(resumenCabecera.totalCantidad)}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-[#666666]">Valeur totale</p><p className="text-2xl font-bold text-[#FFC107]">CAD$ {formatMoney(resumenCabecera.totalValor)}</p></CardContent></Card>
          </div>

          {distribuciones.length > 0 && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Distributions
                  </h3>
                  <p className="text-sm text-[#666666]">
                    La distribution la plus récente est mise en évidence et les distributions de groupe peuvent être modifiées directement.
                  </p>
                </div>

                <Input
                  value={filtroDistribucion}
                  onChange={(event) => setFiltroDistribucion(event.target.value)}
                  placeholder="Filtrer par date, n° distribution, organisme ou produit"
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
                        <TableHead className="text-center">
                          <span className="inline-flex items-center justify-center" title="Accès">
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Accès</span>
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distribucionesFiltradas.map(distribucion => {
                        const isActive = distribucion.comandaId === distribucionSeleccionadaId;
                        const isLatestVisible = distribucion.comandaId === ultimaDistribucionVisibleId;
                        const distribucionFinalizada = distribucion.comandaIds.every((comandaId) => {
                          const comanda = comandas.find((item) => item.id === comandaId);
                          return Boolean(comanda?.estado && DISTRIBUCION_ESTADOS_FINALIZADOS.has(comanda.estado));
                        });
                        const esDistribucionEditable =
                          (distribucion.comandaIds.length > 1 || Boolean(distribucion.grupoDistribucionId)) && !distribucionFinalizada;

                        return (
                          <TableRow key={distribucion.comandaId} className={isActive ? 'bg-blue-50/70' : isLatestVisible ? 'bg-emerald-50/60' : undefined}>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => abrirDistribucion(distribucion.comandaId)}
                                  className="h-auto px-0 font-semibold text-[#1E73BE] hover:bg-transparent hover:text-[#175a95]"
                                >
                                  {distribucion.numeroDistribucion}
                                </Button>
                                {isLatestVisible && (
                                  <Badge className="bg-[#2E7D32] text-white hover:bg-[#2E7D32]">
                                    Dernière
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{distribucion.organismo}</TableCell>
                            <TableCell className="text-center">{formatearFecha(distribucion.fecha, currentLocale)}</TableCell>
                            <TableCell className="text-center">{distribucion.totalProductos}</TableCell>
                            <TableCell className="text-center">{formatQuantity(distribucion.totalCantidad)}</TableCell>
                            <TableCell className="text-right font-semibold text-[#2E7D32]">CAD$ {formatMoney(distribucion.totalValor)}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                size="sm"
                                variant={isLatestVisible ? 'default' : 'outline'}
                                onClick={() => abrirDistribucion(distribucion.comandaId)}
                                className={isLatestVisible ? 'bg-[#1E73BE] hover:bg-[#175a95]' : ''}
                                title={distribucionFinalizada ? 'Voir la distribution finalisée' : esDistribucionEditable ? 'Modifier la distribution' : 'Ouvrir la distribution'}
                                aria-label={distribucionFinalizada ? 'Voir la distribution finalisée' : esDistribucionEditable ? 'Modifier la distribution' : 'Ouvrir la distribution'}
                              >
                                {esDistribucionEditable ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {distribucionesFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-[#666666]">
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
            <Card ref={detalleDistribucionRef}>
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

                <Input
                  value={filtroDetalleDistribucion}
                  onChange={(event) => setFiltroDetalleDistribucion(event.target.value)}
                  placeholder="Filtrer les produits de cette distribution"
                  className="max-w-xl"
                />

                {(distribucionSeleccionadaFiltrada.comandaIds.length > 1 || distribucionSeleccionadaFiltrada.grupoDistribucionId) && (
                  <div className="rounded-xl border-2 border-[#90CAF9] bg-[#F4F9FF] p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs uppercase tracking-wide text-[#666666]">Distribution de groupe</p>
                          {distribucionSeleccionadaFinalizada && (
                            <Badge className="bg-gray-600 text-white">Finalisée</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-[#333333]">Date de péremption de la distribution</label>
                          <Input
                            type="date"
                            value={fechaCaducidadDistribucionEditada}
                            onChange={(event) => setFechaCaducidadDistribucionEditada(event.target.value)}
                            className="max-w-xs"
                            disabled={distribucionSeleccionadaFinalizada}
                          />
                        </div>
                        <p className="text-xs text-[#5F6B7A]">
                          {distribucionSeleccionadaFinalizada
                            ? 'La distribution est terminée. Les modifications sont verrouillées.'
                            : 'Cette modification s’applique à toutes les commandes incluses dans cette distribution.'}
                        </p>
                      </div>
                      <Button className="bg-[#1E73BE] hover:bg-[#175a95]" onClick={handleGuardarFechaDistribucion} disabled={distribucionSeleccionadaFinalizada}>
                        Enregistrer la date
                      </Button>
                    </div>
                  </div>
                )}

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
                  {gruposTemperaturaDistribucion.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-[#666666]">
                      Aucun produit de cette distribution ne correspond au filtre actuel.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {resumenVisible.productos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-[#666666]">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              Aucune commande avec produits distribués dans le filtre actuel.
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Produits distribués
                  </h3>
                  <p className="text-sm text-[#666666]">
                    Filtrez la liste consolidée par produit, code, organisme, comanda ou date.
                  </p>
                </div>

                <Input
                  value={filtroProductos}
                  onChange={(event) => setFiltroProductos(event.target.value)}
                  placeholder="Filtrer la liste de produits distribués"
                  className="max-w-xl"
                />

                <div className="rounded-xl border bg-white overflow-hidden">
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
                      {productosResumenFiltrados.map(producto => (
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
                      {productosResumenFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-[#666666]">
                            Aucun produit distribué ne correspond au filtre actuel.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}