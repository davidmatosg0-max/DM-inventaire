import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, Building2, Calendar, FileText, Plus, Minus, 
  Trash2, Package, DollarSign, Scale, CheckCircle2, AlertCircle, Calculator, Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { guardarComanda, generarNumeroComanda } from '../../utils/comandaStorage';
import { guardarNotificacion, crearNotificacionNuevaComanda } from '../../utils/notificacionStorage';
import { obtenerOrganismos, type Organismo } from '../../utils/organismosStorage';
import { enviarEmailAutomaticoNuevaComanda } from '../../utils/organismoEmailNotifications';
import { Comanda } from '../../types';
import { SimulacionRecepcionNotificacion } from '../organismo/SimulacionRecepcionNotificacion';
import { DialogCrearOferta } from './DialogCrearOferta';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { calcularValorDistribucionProducto } from '../../utils/distributionValue';
import { construirRutaAccesoOrganismo } from '../../utils/organismoAccessLinks';
import { resolverModalidadDistribucionComanda } from '../../utils/comandaDistributionMode';
import {
  resolverTemperaturaProductoCanonica,
  resolverTemperaturaOriginalEntradaProducto,
} from '../../utils/productTemperature';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

type ProductoEditableItem = {
  productoId: string;
  cantidad: number;
  nombre: string;
  codigo: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockReservado: number;
  stockReservable: number;
  valorUnitario: number;
  icono?: string;
};

type OrganismoConPorcentaje = {
  id: string;
  distribucionKey: string;
  nombre: string;
  porcentajeReparticionConfigurado: number;
  porcentaje: number;
};

function esOrganismoCollation(organismo: Organismo): boolean {
  return organismo.clasificacionOrganismo === 'collation';
}

type ModalidadDistribucionAutomatica = 'regular' | 'collation';

function normalizarPorcentajeEntero(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(valor)));
}

function redondearPorcentajeTotal(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.round(valor);
}

function redondearTotalDistribucion(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return parseFloat(valor.toFixed(2));
}

function obtenerOrganismosElegiblesParaDistribucion(
  organismos: Organismo[],
  modalidad: ModalidadDistribucionAutomatica = 'regular'
): Organismo[] {
  return organismos.filter(
    organismo =>
      organismo.activo &&
      (modalidad === 'collation'
        ? esOrganismoCollation(organismo)
        : organismo.regular && !esOrganismoCollation(organismo)) &&
      Number.isFinite(organismo.porcentajeReparticion) &&
      normalizarPorcentajeEntero(organismo.porcentajeReparticion) > 0
  );
}

function distribuirPorcentajesProporcionales(
  organismos: Organismo[],
  modalidad: ModalidadDistribucionAutomatica = 'regular'
): OrganismoConPorcentaje[] {
  const organismosConPeso = obtenerOrganismosElegiblesParaDistribucion(organismos, modalidad)
    .map((organismo, index) => ({
      organismo,
      distribucionKey: `${organismo.id}-${index}`,
      peso: normalizarPorcentajeEntero(organismo.porcentajeReparticion),
    }));

  const pesoTotal = organismosConPeso.reduce((sum, item) => sum + item.peso, 0);
  if (pesoTotal <= 0) {
    return [];
  }

  const base = organismosConPeso.map(item => {
    const porcentajeExacto = (item.peso / pesoTotal) * 100;
    const porcentajeBase = Math.floor(porcentajeExacto);

    return {
      id: item.organismo.id,
      distribucionKey: item.distribucionKey,
      nombre: item.organismo.nombre,
      porcentajeReparticionConfigurado: item.peso,
      porcentaje: porcentajeBase,
      residuo: porcentajeExacto - porcentajeBase,
    };
  });

  let restante = 100 - base.reduce((sum, item) => sum + item.porcentaje, 0);
  const ordenados = [...base].sort((a, b) => b.residuo - a.residuo);

  for (let index = 0; index < ordenados.length && restante > 0; index += 1) {
    ordenados[index].porcentaje += 1;
    restante -= 1;
  }

  return base.map(item => {
    const ajustado = ordenados.find(ordenado => ordenado.distribucionKey === item.distribucionKey);
    return {
      id: item.id,
      distribucionKey: item.distribucionKey,
      nombre: item.nombre,
      porcentajeReparticionConfigurado: item.porcentajeReparticionConfigurado,
      porcentaje: ajustado?.porcentaje || item.porcentaje,
    };
  });
}

function obtenerDistribucionAutomaticaOrganismos(
  organismos: Organismo[],
  modalidad: ModalidadDistribucionAutomatica = 'regular'
): OrganismoConPorcentaje[] {
  return distribuirPorcentajesProporcionales(organismos, modalidad);
}

function distribuirCantidadesEnteras(
  cantidadTotal: number,
  organismos: OrganismoConPorcentaje[]
): Array<{ distribucionKey: string; cantidad: number }> {
  const totalRedondeado = Math.max(0, Math.round(cantidadTotal));
  const base = organismos.map(org => {
    const cantidadExacta = (totalRedondeado * org.porcentaje) / 100;
    const cantidadBase = Math.floor(cantidadExacta);

    return {
      distribucionKey: org.distribucionKey,
      cantidad: cantidadBase,
      residuo: cantidadExacta - cantidadBase,
    };
  });

  let restante = totalRedondeado - base.reduce((sum, item) => sum + item.cantidad, 0);
  const ordenados = [...base].sort((a, b) => b.residuo - a.residuo);

  for (let index = 0; index < ordenados.length && restante > 0; index += 1) {
    ordenados[index].cantidad += 1;
    restante -= 1;
  }

  return base.map(item => {
    const ajustado = ordenados.find(ordenado => ordenado.distribucionKey === item.distribucionKey);
    return {
      distribucionKey: item.distribucionKey,
      cantidad: ajustado?.cantidad || item.cantidad,
    };
  });
}

function obtenerOrganismosConProductosAsignados(
  productosEditables: ProductoEditableItem[],
  organismos: OrganismoConPorcentaje[]
): OrganismoConPorcentaje[] {
  if (organismos.length === 0) {
    return [];
  }

  const distribucionKeysConProductos = new Set<string>();

  productosEditables
    .filter(item => item.cantidad > 0)
    .forEach(item => {
      distribuirCantidadesEnteras(item.cantidad, organismos).forEach(distribucion => {
        if (distribucion.cantidad > 0) {
          distribucionKeysConProductos.add(distribucion.distribucionKey);
        }
      });
    });

  return organismos.filter(organismo => distribucionKeysConProductos.has(organismo.distribucionKey));
}

interface DialogDistribuirProductosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  productos: any[];
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
  onDistribucionCompletada: () => void;
  onDistribucionGrupoCreada?: (resumen: {
    grupoDistribucionId: string;
    grupoDistribucionEtiqueta: string;
    comandas: Array<{ numero: string; nombre: string; porcentaje: number }>;
  }) => void;
}

export function DialogDistribuirProductos({
  open,
  onOpenChange,
  carrito,
  productos,
  categoriasInfo,
  onDistribucionCompletada,
  onDistribucionGrupoCreada,
}: DialogDistribuirProductosProps) {
  const { t } = useTranslation();
  
  // Estados principales
  const [paso, setPaso] = useState<'seleccion_tipo' | 'editar_cantidades' | 'seleccionar_organismo' | 'distribuir_grupo' | 'grupo_creado'>('seleccion_tipo');
  const [tipoDistribucion, setTipoDistribucion] = useState<'individual' | 'grupo' | 'collation'>('individual');
  const [ultimaDistribucionGrupo, setUltimaDistribucionGrupo] = useState<{
    grupoDistribucionId: string;
    grupoDistribucionEtiqueta: string;
    comandas: Array<{ numero: string; nombre: string; porcentaje: number }>;
  } | null>(null);
  
  // Estados para productos editables
  const [productosEditables, setProductosEditables] = useState<ProductoEditableItem[]>([]);
  
  // Estados para distribución individual
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fechaCaducidadGrupo, setFechaCaducidadGrupo] = useState('');
  const [grupoDistribucionAnclada, setGrupoDistribucionAnclada] = useState(true);
  
  // Estado para diálogo de ofertas
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);

  const usuarioActual = t('inventory.distributionDialog.systemUser'); // En producción vendría del contexto de autenticación
  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(carrito.map(item => item.productoId)),
    [carrito]
  );
  const organismosDisponibles = React.useMemo(() => obtenerOrganismos(), [open]);
  const organismosActivos = React.useMemo(
    () => organismosDisponibles.filter(organismo => organismo.activo),
    [organismosDisponibles]
  );
  const organismosActivosCollation = React.useMemo(
    () => organismosActivos.filter(esOrganismoCollation),
    [organismosActivos]
  );
  const organismosActivosStandard = React.useMemo(
    () => organismosActivos.filter(organismo => !esOrganismoCollation(organismo)),
    [organismosActivos]
  );
  const organismosActivosRegulares = React.useMemo(
    () => organismosActivosStandard.filter(organismo => organismo.regular),
    [organismosActivosStandard]
  );
  const organismosActivosCollationConPorcentaje = React.useMemo(
    () => obtenerOrganismosElegiblesParaDistribucion(organismosDisponibles, 'collation'),
    [organismosDisponibles]
  );
  const organismosActivosRegularesConPorcentaje = React.useMemo(
    () => obtenerOrganismosElegiblesParaDistribucion(organismosDisponibles, 'regular'),
    [organismosDisponibles]
  );
  const modalidadDistribucionAgrupada: ModalidadDistribucionAutomatica = tipoDistribucion === 'collation' ? 'collation' : 'regular';
  const organismosBaseDistribucionAgrupada = tipoDistribucion === 'collation'
    ? organismosActivosCollation
    : organismosActivosRegulares;
  const organismosElegiblesDistribucionAgrupada = tipoDistribucion === 'collation'
    ? organismosActivosCollationConPorcentaje
    : organismosActivosRegularesConPorcentaje;
  const organismosConPorcentajes = React.useMemo(
    () => obtenerDistribucionAutomaticaOrganismos(organismosDisponibles, modalidadDistribucionAgrupada),
    [organismosDisponibles, modalidadDistribucionAgrupada]
  );
  const organismosConAsignacionGrupo = React.useMemo(
    () => obtenerOrganismosConProductosAsignados(productosEditables, organismosConPorcentajes),
    [productosEditables, organismosConPorcentajes]
  );
  const organismosSeleccionablesIndividuales = tipoDistribucion === 'collation'
    ? organismosActivosCollation
    : organismosActivosStandard;

  // Inicializar productos editables cuando se abre el diálogo y se va a editar cantidades
  React.useEffect(() => {
    if (paso === 'editar_cantidades' && productosEditables.length === 0) {
      const productosConInfo = carrito.map(item => {
        const producto = productos.find(p => p.id === item.productoId);
        const categoriaInfo = categoriasInfo[producto?.categoria || ''];
        const valorDistribucion = calcularValorDistribucionProducto(producto, 1);
        const reserva = reservasInventario[item.productoId];
        return {
          productoId: item.productoId,
          cantidad: Math.min(item.cantidad, reserva?.disponibleParaReservar ?? producto?.stockActual ?? 0),
          nombre: producto?.nombre || '',
          codigo: producto?.codigo || '',
          categoria: producto?.categoria || '',
          unidad: producto?.unidad || '',
          stockActual: producto?.stockActual || 0,
          stockReservado: reserva?.totalReservado || 0,
          stockReservable: reserva?.disponibleParaReservar ?? producto?.stockActual ?? 0,
          valorUnitario: valorDistribucion.valorUnitario,
          icono: producto?.icono || categoriaInfo?.icono || ''
        };
      });
      setProductosEditables(productosConInfo);
    }
  }, [paso, productosEditables.length, carrito, productos, categoriasInfo, reservasInventario]); // Removemos dependencias problemáticas

  // Reiniciar productos editables cuando cambie el carrito o se cierre el diálogo
  React.useEffect(() => {
    if (!open) {
      setProductosEditables([]);
    }
  }, [open]);

  const calcularTotales = () => {
    const items = productosEditables.length > 0 ? productosEditables : carrito.map(item => {
      const producto = productos.find(p => p.id === item.productoId);
      const categoriaInfo = categoriasInfo[producto?.categoria || ''];
      const valorDistribucion = calcularValorDistribucionProducto(producto, 1);
      const reserva = reservasInventario[item.productoId];
      return {
        productoId: item.productoId,
        cantidad: Math.min(item.cantidad, reserva?.disponibleParaReservar ?? producto?.stockActual ?? 0),
        nombre: producto?.nombre || '',
        codigo: producto?.codigo || '',
        categoria: producto?.categoria || '',
        unidad: producto?.unidad || '',
        stockActual: producto?.stockActual || 0,
        stockReservado: reserva?.totalReservado || 0,
        stockReservable: reserva?.disponibleParaReservar ?? producto?.stockActual ?? 0,
        valorUnitario: valorDistribucion.valorUnitario,
        icono: producto?.icono || categoriaInfo?.icono || ''
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
    const valorTotal = items.reduce((sum, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      return sum + calcularValorDistribucionProducto(producto, item.cantidad).valorTotal;
    }, 0);
    const pesoTotal = items.reduce((sum, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      return sum + calcularValorDistribucionProducto(producto, item.cantidad).pesoTotal;
    }, 0);

    return { totalItems, valorTotal, pesoTotal };
  };

  const actualizarCantidadProducto = (productoId: string, nuevaCantidad: number) => {
    setProductosEditables(prev => 
      prev.map(item => 
        item.productoId === productoId 
          ? { ...item, cantidad: Math.max(0, Math.min(Math.round(nuevaCantidad), Math.round(item.stockReservable))) }
          : item
      )
    );
  };

  const eliminarProducto = (productoId: string) => {
    setProductosEditables(prev => prev.filter(item => item.productoId !== productoId));
  };

  const recalcularDistribucionAutomatica = () => {
    if (organismosElegiblesDistribucionAgrupada.length === 0) {
      toast.error(
        tipoDistribucion === 'collation'
          ? 'Aucun organisme Collation avec pourcentage de répartition n\'est disponible.'
          : t('inventory.distributionDialog.errors.noRegularOrganizationsWithShare')
      );
      return;
    }

    const nuevosOrganismos = obtenerDistribucionAutomaticaOrganismos(organismosDisponibles, modalidadDistribucionAgrupada);
    
    toast.success(
      <div>
        <p className="font-semibold mb-1">{t('inventory.distributionDialog.toasts.recalculatedTitle')}</p>
        <ul className="text-sm space-y-1">
          {nuevosOrganismos.map((org, i) => {
            return (
              <li key={i}>
                • {org.nombre}: {org.porcentaje}%
                {` (${t('inventory.distributionDialog.toasts.configuredShare', { share: org.porcentajeReparticionConfigurado })})`}
              </li>
            );
          })}
        </ul>
      </div>,
      { duration: 6000 }
    );
  };

  const calcularPorcentajeTotal = () => {
    return organismosConPorcentajes.reduce((sum, org) => sum + org.porcentaje, 0);
  };

  const validarDistribucionGrupo = (distribucion: OrganismoConPorcentaje[] = organismosConPorcentajes) => {
    const porcentajeTotal = distribucion.reduce((sum, org) => sum + org.porcentaje, 0);
    const todosOrganismosSeleccionados = distribucion.length > 0;
    const todosPorcentajesValidos = distribucion.every(org => org.porcentaje > 0);
    
    return {
      valido: Math.abs(porcentajeTotal - 100) < 0.01 && todosOrganismosSeleccionados && todosPorcentajesValidos,
      porcentajeTotal
    };
  };

  const crearComandaIndividual = () => {
    if (!organismoSeleccionado) {
      toast.error('Sélectionnez un organisme pour créer la distribution.');
      return;
    }

    const { valorTotal, pesoTotal } = calcularTotales();
    const numeroComanda = generarNumeroComanda();
    const organismoData = organismosSeleccionablesIndividuales.find(organismo => organismo.id === organismoSeleccionado);
    const modalidadDistribucion = tipoDistribucion === 'collation' ? 'collation' : 'standard';
    const observacionesComanda = modalidadDistribucion === 'collation'
      ? `Distribution Collation${observaciones ? `\n${observaciones}` : ''}`
      : observaciones;

    if (!organismoData) {
      toast.error(tipoDistribucion === 'collation'
        ? 'Sélectionnez un organisme Collation valide.'
        : 'Sélectionnez un organisme valide pour la distribution.');
      return;
    }
    
    const comanda: Comanda = {
      id: `comanda-${Date.now()}`,
      numero: numeroComanda,
      numeroComanda,
      modalidadDistribucion,
      organismoId: organismoSeleccionado,
      nombreOrganismo: organismoData?.nombre || '',
      fecha: new Date().toISOString(),
      usuarioCreacion: usuarioActual,
      creadoPor: usuarioActual,
      fechaEntrega: fechaCaducidadGrupo || undefined,
      fechaCaducidadGrupo: fechaCaducidadGrupo || undefined,
      observaciones: observacionesComanda,
      items: productosEditables.map(item => {
        const producto = productos.find(entry => entry.id === item.productoId);
        const temperatura = resolverTemperaturaProductoCanonica({
          ...(producto || {}),
          nombre: (producto as any)?.nombre || item.nombre,
          categoria: (producto as any)?.categoria || item.categoria,
          subcategoria: (producto as any)?.subcategoria,
          temperaturaOriginalEntrada: (producto as any)?.temperaturaOriginalEntrada,
        });
        const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto({
          ...(producto || {}),
          nombre: (producto as any)?.nombre || item.nombre,
          categoria: (producto as any)?.categoria || item.categoria,
          subcategoria: (producto as any)?.subcategoria,
          temperaturaOriginalEntrada: (producto as any)?.temperaturaOriginalEntrada,
        });

        return {
          productoId: item.productoId,
          nombreProducto: item.nombre,
          productoNombre: item.nombre,
          cantidad: Math.round(item.cantidad),
          cantidadEntregada: 0,
          unidad: item.unidad,
          icono: producto?.icono || item.icono,
          temperatura,
          temperaturaOriginalEntrada,
        };
      }),
      valorTotal: redondearTotalDistribucion(valorTotal),
      pesoTotal: redondearTotalDistribucion(pesoTotal),
      estado: 'pendiente'
    };

    try {
      guardarComanda(comanda);
      toast.success(t('inventory.distributionDialog.toasts.orderCreated', { number: numeroComanda }));
      // Guardar notificación
      const notificacion = crearNotificacionNuevaComanda(
        comanda.id,
        numeroComanda,
        organismoSeleccionado,
        organismoData?.claveAcceso
      );
      guardarNotificacion(notificacion);
      const resultadoEmail = enviarEmailAutomaticoNuevaComanda({
        organismo: organismoData,
        numeroComanda,
        fechaEntrega: fechaCaducidadGrupo,
        totalProductos: comanda.items.length,
        valorTotal: comanda.valorTotal,
        observaciones: observacionesComanda,
      });
      if (resultadoEmail.enviado) {
        toast.success(t('inventory.distributionDialog.toasts.emailSent', { count: resultadoEmail.destinatarios.length }));
      }
      cerrarYReiniciar();
      onDistribucionCompletada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('inventory.distributionDialog.errors.createOrder'));
      console.error(error);
    }
  };

  const crearComandasGrupo = () => {
    const distribucionActual = obtenerDistribucionAutomaticaOrganismos(organismosDisponibles, modalidadDistribucionAgrupada);

    if (distribucionActual.length === 0) {
      toast.error(
        tipoDistribucion === 'collation'
          ? 'Aucun organisme Collation avec pourcentage de répartition n\'est disponible.'
          : t('inventory.distributionDialog.errors.noRegularOrganizationsWithShare')
      );
      return;
    }

    const validacion = validarDistribucionGrupo(distribucionActual);
    if (!validacion.valido) {
      if (Math.abs(validacion.porcentajeTotal - 100) >= 0.01) {
        toast.error(t('inventory.distributionDialog.errors.totalPercentageMustBe100', { current: redondearPorcentajeTotal(validacion.porcentajeTotal) }));
      } else {
        toast.error(t('inventory.distributionDialog.errors.completeAllFieldsCorrectly'));
      }
      return;
    }

    const productosDistribuibles = productosEditables.filter(item => item.cantidad > 0);
    if (productosDistribuibles.length === 0) {
      toast.error(t('inventory.distributionDialog.errors.atLeastOnePositiveProduct'));
      return;
    }

    const comandasCreadas: Array<{ numero: string; nombre: string; porcentaje: number }> = [];
    const resumenEmails = {
      organismosNotificados: 0,
      destinatarios: 0,
    };
    const cantidadesDistribuidasPorProducto = new Map(
      productosDistribuibles.map(item => [
        item.productoId,
        distribuirCantidadesEnteras(item.cantidad, distribucionActual)
      ])
    );
    const grupoDistribucionId = `grp-${Date.now()}`;
    const grupoDistribucionEtiqueta = tipoDistribucion === 'collation'
      ? `Distribution Collation ${new Date().toLocaleDateString('fr-CA')}`
      : `Distribution de groupe ${new Date().toLocaleDateString('fr-CA')}`;

    try {
      distribucionActual.forEach(orgInfo => {
        const numeroComanda = generarNumeroComanda();
        const itemsComanda = productosDistribuibles
          .map(item => {
            const cantidadAsignada = cantidadesDistribuidasPorProducto
              .get(item.productoId)
              ?.find(distribucion => distribucion.distribucionKey === orgInfo.distribucionKey)?.cantidad || 0;

            if (cantidadAsignada <= 0) {
              return null;
            }

            const producto = productos.find(entry => entry.id === item.productoId);
            const valorDistribucion = calcularValorDistribucionProducto(producto, cantidadAsignada);
            const temperatura = resolverTemperaturaProductoCanonica({
              ...(producto || {}),
              nombre: (producto as any)?.nombre || item.nombre,
              categoria: (producto as any)?.categoria || item.categoria,
              subcategoria: (producto as any)?.subcategoria,
              temperaturaOriginalEntrada: (producto as any)?.temperaturaOriginalEntrada,
            });
            const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto({
              ...(producto || {}),
              nombre: (producto as any)?.nombre || item.nombre,
              categoria: (producto as any)?.categoria || item.categoria,
              subcategoria: (producto as any)?.subcategoria,
              temperaturaOriginalEntrada: (producto as any)?.temperaturaOriginalEntrada,
            });

            return {
              productoId: item.productoId,
              nombreProducto: item.nombre,
              productoNombre: item.nombre,
              cantidad: cantidadAsignada,
              cantidadEntregada: 0,
              unidad: item.unidad,
              icono: item.icono,
              temperatura,
              temperaturaOriginalEntrada,
              valorUnitario: valorDistribucion.valorUnitario,
              valorTotal: valorDistribucion.valorTotal,
              peso: valorDistribucion.pesoTotal,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (itemsComanda.length === 0) {
          return;
        }

        const valorTotalComanda = itemsComanda.reduce(
          (sum, item) => sum + ((item as { valorTotal?: number }).valorTotal || 0),
          0
        );
        const pesoTotalComanda = itemsComanda.reduce(
          (sum, item) => sum + (item.peso || 0),
          0
        );
        
        const comanda: Comanda = {
          id: `comanda-${Date.now()}-${orgInfo.id}`,
          numero: numeroComanda,
          numeroComanda,
          modalidadDistribucion: tipoDistribucion === 'collation' ? 'collation' : 'grupo',
          grupoDistribucionId,
          grupoDistribucionEtiqueta,
          grupoDistribucionAnclada,
          fechaCaducidadGrupo: fechaCaducidadGrupo || undefined,
          organismoId: orgInfo.id,
          nombreOrganismo: orgInfo.nombre,
          fecha: new Date().toISOString(),
          usuarioCreacion: usuarioActual,
          creadoPor: usuarioActual,
          fechaEntrega: fechaCaducidadGrupo || undefined,
          observaciones: `${t('inventory.distributionDialog.groupObservation', { percentage: normalizarPorcentajeEntero(orgInfo.porcentaje) })}${observaciones ? '\n' + observaciones : ''}`,
          items: itemsComanda,
          valorTotal: redondearTotalDistribucion(valorTotalComanda),
          pesoTotal: redondearTotalDistribucion(pesoTotalComanda),
          estado: 'pendiente'
        };

        guardarComanda(comanda);
        comandasCreadas.push({ numero: numeroComanda, nombre: orgInfo.nombre, porcentaje: orgInfo.porcentaje });
        const organismoDestino = organismosDisponibles.find(organismo => organismo.id === orgInfo.id);
        // Guardar notificación
        const notificacion = crearNotificacionNuevaComanda(
          comanda.id,
          numeroComanda,
          orgInfo.id,
          organismoDestino?.claveAcceso
        );
        guardarNotificacion(notificacion);
        if (organismoDestino) {
          const resultadoEmail = enviarEmailAutomaticoNuevaComanda({
            organismo: organismoDestino,
            numeroComanda,
            fechaEntrega: fechaCaducidadGrupo,
            totalProductos: comanda.items.length,
            valorTotal: comanda.valorTotal,
            observaciones: comanda.observaciones,
          });
          if (resultadoEmail.enviado) {
            resumenEmails.organismosNotificados += 1;
            resumenEmails.destinatarios += resultadoEmail.destinatarios.length;
          }
        }
      });

      if (comandasCreadas.length === 0) {
        toast.error(t('inventory.distributionDialog.errors.noAssignedProducts'));
        return;
      }

      toast.success(
        <div>
          <p className="font-semibold mb-1">{t('inventory.distributionDialog.toasts.ordersCreatedTitle')}</p>
          <ul className="text-sm space-y-1">
            {comandasCreadas.map((comandaCreada, i) => (
              <li key={i}>• {comandaCreada.numero} - {comandaCreada.nombre} ({comandaCreada.porcentaje}%)</li>
            ))}
          </ul>
          {resumenEmails.organismosNotificados > 0 && (
            <p className="text-sm mt-2">
              {t('inventory.distributionDialog.toasts.emailSummary', {
                organizations: resumenEmails.organismosNotificados,
                recipients: resumenEmails.destinatarios
              })}
            </p>
          )}
        </div>,
        { duration: 6000 }
      );

      const resumenGrupoCreado = {
        grupoDistribucionId,
        grupoDistribucionEtiqueta,
        comandas: comandasCreadas,
      };

      setUltimaDistribucionGrupo(resumenGrupoCreado);
      onDistribucionGrupoCreada?.(resumenGrupoCreado);
      setPaso('grupo_creado');
      onDistribucionCompletada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('inventory.distributionDialog.errors.createOrders'));
      console.error(error);
    }
  };

  const abrirModuloCommandes = () => {
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('page', 'comandas');
    window.location.href = targetUrl.toString();
  };

  const cerrarYReiniciar = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPaso('seleccion_tipo');
      setTipoDistribucion('individual');
      setProductosEditables([]);
      setOrganismoSeleccionado('');
      setObservaciones('');
      setFechaCaducidadGrupo('');
      setGrupoDistribucionAnclada(true);
      setUltimaDistribucionGrupo(null);
    }, 300);
  };

  const avanzarPaso = () => {
    if (paso === 'seleccion_tipo') {
      setPaso('editar_cantidades');
    } else if (paso === 'editar_cantidades') {
      if (productosEditables.length === 0) {
        toast.error(t('inventory.distributionDialog.errors.atLeastOneProduct'));
        return;
      }
      if (tipoDistribucion === 'individual') {
        setPaso('seleccionar_organismo');
      } else {
        if (organismosElegiblesDistribucionAgrupada.length === 0) {
          toast.error(
            tipoDistribucion === 'collation'
              ? 'Aucun organisme Collation avec pourcentage de répartition n\'est disponible.'
              : t('inventory.distributionDialog.errors.noRegularOrganizationsWithShare')
          );
          return;
        }
        setPaso('distribuir_grupo');
      }
    }
  };

  const retrocederPaso = () => {
    if (paso === 'editar_cantidades') {
      setPaso('seleccion_tipo');
    } else if (paso === 'seleccionar_organismo' || paso === 'distribuir_grupo') {
      setPaso('editar_cantidades');
    }
  };

  const totales = calcularTotales();
  const totalItemsFormateado = formatQuantity(totales.totalItems);
  const valorTotalFormateado = formatMoney(totales.valorTotal);
  const pesoTotalFormateado = formatQuantity(totales.pesoTotal);
  const porcentajeTotalGrupo = calcularPorcentajeTotal();
  const porcentajeTotalGrupoRedondeado = redondearPorcentajeTotal(porcentajeTotalGrupo);
  const porcentajeGrupoValido = Math.abs(porcentajeTotalGrupo - 100) < 0.01;
  const porcentajeReparticionTotalConfigurado = organismosElegiblesDistribucionAgrupada.reduce(
    (sum, organismo) => sum + normalizarPorcentajeEntero(organismo.porcentajeReparticion),
    0
  );
  const cantidadOrganismosElegibles = organismosElegiblesDistribucionAgrupada.length;
  const todosLosPesosIguales =
    cantidadOrganismosElegibles > 1 &&
    organismosElegiblesDistribucionAgrupada.every(
      organismo =>
        normalizarPorcentajeEntero(organismo.porcentajeReparticion) ===
        normalizarPorcentajeEntero(organismosElegiblesDistribucionAgrupada[0]?.porcentajeReparticion || 0)
    );
  const mensajeBloqueoDistribucionGrupo = organismosConPorcentajes.length === 0
        ? t('inventory.distributionDialog.blocked.noEligibleOrganizations')
        : !porcentajeGrupoValido
          ? t('inventory.distributionDialog.blocked.totalNot100')
          : organismosConAsignacionGrupo.length === 0
            ? t('inventory.distributionDialog.errors.noAssignedProducts')
          : null;
  const organismoPreviewIndividual = organismosDisponibles.find(
    organismo => organismo.id === organismoSeleccionado
  );
  const comandaPreviewIndividual = organismoPreviewIndividual
    ? ({
        id: `preview-${organismoPreviewIndividual.id}`,
        numero: `SIM-${organismoPreviewIndividual.id.toUpperCase().slice(0, 6)}`,
        organismoId: organismoPreviewIndividual.id,
        nombreOrganismo: organismoPreviewIndividual.nombre,
        fecha: new Date().toISOString(),
        fechaEntrega: fechaCaducidadGrupo || undefined,
        fechaCaducidadGrupo: fechaCaducidadGrupo || undefined,
        estado: 'pendiente',
        observaciones,
        items: productosEditables
          .filter(item => item.cantidad > 0)
          .map(item => ({
            productoId: item.productoId,
            nombreProducto: item.nombre,
            productoNombre: item.nombre,
            cantidad: Math.round(item.cantidad),
            unidad: item.unidad,
            icono: item.icono,
            valorUnitario: item.valorUnitario,
          })),
        valorTotal: redondearTotalDistribucion(totales.valorTotal),
      } as Comanda)
    : null;
  const notificacionPreviewIndividual = comandaPreviewIndividual
    ? {
        mensaje: t('inventory.distributionDialog.previewNotificationMessage', { number: comandaPreviewIndividual.numero }),
        fecha: new Date().toISOString(),
        leida: false,
        urlAcceso: construirRutaAccesoOrganismo(organismoPreviewIndividual?.claveAcceso),
      }
    : null;
  const organismoPreviewGrupo = organismosDisponibles.find(
    organismo => organismo.id === organismosConAsignacionGrupo[0]?.id
  );
  const itemsPreviewGrupo = organismoPreviewGrupo
    ? productosEditables
        .filter(item => item.cantidad > 0)
        .map(item => {
          const cantidadAsignada = distribuirCantidadesEnteras(item.cantidad, organismosConPorcentajes)
            .find(distribucion => distribucion.distribucionKey === organismosConAsignacionGrupo[0]?.distribucionKey)?.cantidad || 0;

          if (cantidadAsignada <= 0) {
            return null;
          }

          const producto = productos.find(entry => entry.id === item.productoId);
          const valorDistribucion = calcularValorDistribucionProducto(producto, cantidadAsignada);

          return {
            productoId: item.productoId,
            nombreProducto: item.nombre,
            productoNombre: item.nombre,
            cantidad: cantidadAsignada,
            unidad: item.unidad,
            icono: item.icono,
            valorUnitario: valorDistribucion.valorUnitario,
            valorTotal: valorDistribucion.valorTotal,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  const valorPreviewGrupo = itemsPreviewGrupo.reduce(
    (sum, item) => sum + ((item as { valorTotal?: number }).valorTotal || 0),
    0
  );
  const comandaPreviewGrupo = organismoPreviewGrupo && itemsPreviewGrupo.length > 0
    ? ({
        id: `preview-group-${organismoPreviewGrupo.id}`,
        numero: `SIM-GRP-${organismoPreviewGrupo.id.toUpperCase().slice(0, 4)}`,
        grupoDistribucionId: 'preview-group',
        grupoDistribucionEtiqueta: tipoDistribucion === 'collation' ? 'Distribution Collation' : 'Distribution de groupe',
        modalidadDistribucion: tipoDistribucion === 'collation' ? 'collation' : 'grupo',
        grupoDistribucionAnclada,
        fechaCaducidadGrupo: fechaCaducidadGrupo || undefined,
        organismoId: organismoPreviewGrupo.id,
        nombreOrganismo: organismoPreviewGrupo.nombre,
        fecha: new Date().toISOString(),
        fechaEntrega: fechaCaducidadGrupo || undefined,
        estado: 'pendiente',
        observaciones: `${t('inventory.distributionDialog.groupExampleFor', { organization: organismoPreviewGrupo.nombre })}${observaciones ? `\n${observaciones}` : ''}`,
        items: itemsPreviewGrupo,
        valorTotal: redondearTotalDistribucion(valorPreviewGrupo),
      } as Comanda)
    : null;
  const notificacionPreviewGrupo = comandaPreviewGrupo
    ? {
        mensaje: t('inventory.distributionDialog.previewNotificationMessage', { number: comandaPreviewGrupo.numero }),
        fecha: new Date().toISOString(),
        leida: false,
        urlAcceso: construirRutaAccesoOrganismo(organismoPreviewGrupo?.claveAcceso),
      }
    : null;

  const tituloPaso = {
    seleccion_tipo: t('inventory.distributionDialog.stepTitles.selectType'),
    editar_cantidades: t('inventory.distributionDialog.stepTitles.editQuantities'),
    seleccionar_organismo: tipoDistribucion === 'collation' ? 'Distribution Collation' : t('inventory.distributionDialog.stepTitles.selectOrganization'),
    distribuir_grupo: tipoDistribucion === 'collation' ? 'Distribution Collation' : t('inventory.distributionDialog.stepTitles.groupDistribution'),
    grupo_creado: tipoDistribucion === 'collation' ? 'Distribution Collation créée' : 'Distribution de groupe créée',
  }[paso];

  const descripcionPaso = {
    seleccion_tipo: t('inventory.distributionDialog.stepDescriptions.selectType'),
    editar_cantidades: t('inventory.distributionDialog.stepDescriptions.editQuantities'),
    seleccionar_organismo: tipoDistribucion === 'collation'
      ? 'Sélectionnez un organisme classé Collation pour créer une distribution dédiée.'
      : t('inventory.distributionDialog.stepDescriptions.selectOrganization'),
    distribuir_grupo: tipoDistribucion === 'collation'
      ? 'Répartition automatique entre les organismes Collation selon leur pourcentage configuré.'
      : t('inventory.distributionDialog.stepDescriptions.groupDistribution'),
    grupo_creado: tipoDistribucion === 'collation'
      ? 'Accès direct à la distribution Collation créée et aux commandes générées.'
      : 'Accès direct à la distribution créée et aux commandes générées.',
  }[paso];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="distribuir-productos-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {tituloPaso}
            </DialogTitle>
            <DialogDescription id="distribuir-productos-description">
              {descripcionPaso}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {/* Paso 1: Selección de tipo de distribución */}
            {paso === 'seleccion_tipo' && (
              <div className="grid grid-cols-4 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'individual' ? 'border-2 border-[#1E73BE] bg-[#E3F2FD]' : 'border-2 border-gray-200'}`}
                  onClick={() => {
                    setTipoDistribucion('individual');
                    setOrganismoSeleccionado('');
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Building2 className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'individual' ? 'text-[#1E73BE]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('inventory.distributionDialog.cards.individual.title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('inventory.distributionDialog.cards.individual.description')}
                    </p>
                    {tipoDistribucion === 'individual' && (
                      <Badge className="mt-3 bg-[#1E73BE] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('inventory.distributionDialog.selected')}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'grupo' ? 'border-2 border-[#4CAF50] bg-[#E8F5E9]' : 'border-2 border-gray-200'}`}
                  onClick={() => {
                    setTipoDistribucion('grupo');
                    setOrganismoSeleccionado('');
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Users className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'grupo' ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('inventory.distributionDialog.cards.group.title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('inventory.distributionDialog.cards.group.description')}
                    </p>
                    {tipoDistribucion === 'grupo' && (
                      <Badge className="mt-3 bg-[#4CAF50] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('inventory.distributionDialog.selected')}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'collation' ? 'border-2 border-[#F59E0B] bg-[#FFF7E6]' : 'border-2 border-gray-200'}`}
                  onClick={() => {
                    setTipoDistribucion('collation');
                    setOrganismoSeleccionado('');
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Package className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'collation' ? 'text-[#F59E0B]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Distribution Collation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Utilise la même répartition automatique que la distribution régulière, limitée aux organismes Collation.
                    </p>
                    {tipoDistribucion === 'collation' && (
                      <Badge className="mt-3 bg-[#F59E0B] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t('inventory.distributionDialog.selected')}
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all hover:shadow-lg border-2 border-gray-200 hover:border-[#FFC107]"
                  onClick={() => {
                    setOfertaDialogOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Tag className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('inventory.distributionDialog.cards.offer.title')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('inventory.distributionDialog.cards.offer.description')}
                    </p>
                    <Badge className="mt-3 bg-[#FFC107] text-gray-900">
                      {t('inventory.distributionDialog.new')}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Paso 2: Editar cantidades */}
            {paso === 'editar_cantidades' && (
              <div className="space-y-4">
                {/* Resumen de totales */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <Card className="border-l-4 border-l-[#1E73BE]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#1E73BE]" />
                        <div>
                          <p className="text-xs text-gray-600">{t('inventory.distributionDialog.items')}</p>
                          <p className="font-bold text-[#1E73BE]">{totalItemsFormateado}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#4CAF50]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                        <div>
                          <p className="text-xs text-gray-600">{t('inventory.distributionDialog.value')}</p>
                          <p className="font-bold text-[#4CAF50]">CAD$ {valorTotalFormateado}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-[#FFC107]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#FFC107]" />
                        <div>
                          <p className="text-xs text-gray-600">{t('inventory.distributionDialog.weight')}</p>
                          <p className="font-bold text-[#FFC107]">{pesoTotalFormateado} kg</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de productos editables */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {productosEditables.map(item => (
                    <Card key={item.productoId} className="border-2 border-gray-200 hover:border-[#1E73BE] transition-all">
                      <CardContent className="p-4">
                        {(() => {
                          const producto = productos.find(p => p.id === item.productoId);
                          const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
                          return (
                            <>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {item.nombre}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.codigo}</p>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge className="bg-gray-100 text-gray-700">
                                      {item.icono} {item.categoria}
                                    </Badge>
                                    <Badge className="bg-[#4CAF50] text-white">
                                      💰 CAD$ {formatMoney(valorDistribucion.valorTotal)}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => eliminarProducto(item.productoId)}
                                  className="text-[#DC3545] hover:text-white hover:bg-[#DC3545]"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                                    onClick={() => actualizarCantidadProducto(item.productoId, item.cantidad - 1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md min-w-[100px] justify-center">
                                    <Input
                                      type="number"
                                      value={item.cantidad}
                                      onChange={(e) => actualizarCantidadProducto(item.productoId, parseFloat(e.target.value) || 0)}
                                      className="w-16 h-7 text-center font-bold border-none bg-transparent p-0"
                                      min="0"
                                      step="1"
                                      max={item.stockReservable}
                                    />
                                    <span className="text-sm font-medium text-gray-600">{item.unidad}</span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                                    onClick={() => actualizarCantidadProducto(item.productoId, item.cantidad + 1)}
                                    disabled={item.cantidad >= item.stockReservable}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="text-xs text-gray-600 text-right">
                                  <p>{t('inventory.distributionDialog.stock.reservable')}</p>
                                  <p className="font-semibold text-gray-900">{formatQuantity(item.stockReservable)} {item.unidad}</p>
                                  <p className="text-gray-500">{t('inventory.distributionDialog.stock.reserved')} {formatQuantity(item.stockReservado)} {item.unidad}</p>
                                  <p className="text-gray-400">{t('inventory.distributionDialog.stock.physical')} {formatQuantity(item.stockActual)} {item.unidad}</p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Seleccionar organismo (individual) */}
            {paso === 'seleccionar_organismo' && (
              <div className="space-y-4">
                {tipoDistribucion === 'collation' && (
                  <div className="rounded-lg border border-[#FCD34D] bg-[#FFF7E6] px-4 py-3 text-sm text-[#9A6700]">
                    Cette distribution est réservée aux organismes dont le type d'organisme est Collation.
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t('inventory.distributionDialog.beneficiaryOrganization')}</Label>
                  <Select
                    value={organismoSeleccionado}
                    onValueChange={setOrganismoSeleccionado}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('inventory.distributionDialog.selectOrganizationPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {organismosSeleccionablesIndividuales.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {organismosSeleccionablesIndividuales.length === 0 && (
                    <p className="text-xs text-gray-500">
                      {tipoDistribucion === 'collation'
                        ? 'Aucun organisme Collation actif n\'est disponible pour le moment.'
                        : 'Aucun organisme actif n\'est disponible pour le moment.'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date de péremption de la distribution</Label>
                  <Input
                    type="date"
                    value={fechaCaducidadGrupo}
                    onChange={(e) => setFechaCaducidadGrupo(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Option facultative. Elle restera modifiable après la création de la distribution.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('inventory.observations')}</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder={t('inventory.distributionDialog.observationsPlaceholderOptional')}
                    rows={3}
                  />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">{t('inventory.distributionDialog.summary')}</p>
                  <div className="space-y-1 text-sm">
                    <p>{totalItemsFormateado} items • CAD$ {valorTotalFormateado}</p>
                    <p>{pesoTotalFormateado} kg</p>
                  </div>
                </div>

                {organismoPreviewIndividual && comandaPreviewIndividual && (
                  <div className="space-y-2">
                    <Label>{t('inventory.distributionDialog.individualSimulation')}</Label>
                    <SimulacionRecepcionNotificacion
                      organismo={organismoPreviewIndividual}
                      comanda={comandaPreviewIndividual}
                      notificacion={notificacionPreviewIndividual}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Paso 4: Distribución en grupo */}
            {paso === 'distribuir_grupo' && (
              <div className="space-y-4">
                {/* Banner informativo sobre organismos regulares */}
                <Card className="border-l-4 border-l-[#1E73BE] bg-[#E3F2FD]">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-[#1E73BE] flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-[#1E73BE] mb-1">
                          {tipoDistribucion === 'collation'
                            ? 'Distribution automatique Collation'
                            : t('inventory.distributionDialog.group.autoDistributionTitle')}
                        </p>
                        <p className="text-gray-700">
                          {tipoDistribucion === 'collation'
                            ? 'Les quantités seront réparties automatiquement entre les organismes Collation selon leur pourcentage de répartition.'
                            : t('inventory.distributionDialog.group.autoDistributionDescription')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Badge className="bg-[#1E73BE] text-white px-3 py-1">
                    {t('inventory.distributionDialog.group.currentCalculation')}
                  </Badge>
                </div>

                {todosLosPesosIguales && cantidadOrganismosElegibles > 0 && (
                  <Card className="border-l-4 border-l-[#4CAF50] bg-[#E8F5E9]">
                    <CardContent className="p-3 text-sm text-gray-700">
                      {t('inventory.distributionDialog.group.equalWeightsInfo')}
                      {cantidadOrganismosElegibles === 2 && ` ${t('inventory.distributionDialog.group.equalWeightsTwo')}`}
                    </CardContent>
                  </Card>
                )}

                {organismosBaseDistribucionAgrupada.length > organismosElegiblesDistribucionAgrupada.length && (
                  <Card className="border-l-4 border-l-[#FFC107] bg-[#FFF8E1]">
                    <CardContent className="p-3 text-sm text-gray-700">
                      {tipoDistribucion === 'collation'
                        ? `${organismosBaseDistribucionAgrupada.length - organismosElegiblesDistribucionAgrupada.length} organismes Collation sont exclus car leur pourcentage de répartition est nul ou invalide.`
                        : t('inventory.distributionDialog.group.excludedRegularOrganizations', {
                            count: organismosBaseDistribucionAgrupada.length - organismosElegiblesDistribucionAgrupada.length
                          })}
                    </CardContent>
                  </Card>
                )}

                {/* Botón de auto-calcular */}
                <div className="flex justify-center">
                  <Button
                    onClick={recalcularDistribucionAutomatica}
                    className="bg-[#FFC107] hover:bg-[#FFA000] text-gray-900"
                    size="lg"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    {t('inventory.distributionDialog.group.recalculateButton')}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <Label>{t('inventory.distributionDialog.group.organizationsAndPercentages')}</Label>
                  </div>

                  {organismosElegiblesDistribucionAgrupada.length > 0 && (
                    <Card className="border border-[#90CAF9] bg-[#F4F9FF]">
                      <CardContent className="p-3 text-xs text-gray-700 space-y-2">
                        <p className="font-semibold text-[#1E73BE]">
                          {tipoDistribucion === 'collation'
                            ? 'Diagnostic des organismes Collation admissibles'
                            : t('inventory.distributionDialog.group.eligibleDiagnosis')}
                        </p>
                        <div className="space-y-1">
                          {organismosElegiblesDistribucionAgrupada.map((organismo) => (
                            <div key={`${organismo.id}-${organismo.nombre}`} className="flex flex-wrap gap-2">
                              <span>{organismo.nombre}</span>
                              <span className="text-gray-500">{t('inventory.distributionDialog.group.idPrefix')} {organismo.id}</span>
                              <span className="text-gray-500">{t('inventory.distributionDialog.group.sharePrefix', { share: normalizarPorcentajeEntero(organismo.porcentajeReparticion) })}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {organismosConPorcentajes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>{t('inventory.distributionDialog.group.noOrganizationsAvailable')}</p>
                      <p className="text-sm">
                        {t('inventory.distributionDialog.group.noOrganizationsAvailableDescription')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {organismosConPorcentajes.map((org, index) => {
                      const porcentajeReparticionOrganismo = org.porcentajeReparticionConfigurado;

                      return (
                      <Card key={org.distribucionKey || index} className="border-2 border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <div className="flex-1 space-y-2">
                              <div className="rounded-md border bg-gray-50 px-3 py-2 font-medium text-gray-900">
                                {org.nombre}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={org.porcentaje}
                                  placeholder={t('inventory.distributionDialog.group.percentagePlaceholder')}
                                  min="0"
                                  max="100"
                                  step="1"
                                  className="w-24"
                                  readOnly
                                />
                                <span className="text-gray-600">%</span>
                                <Badge variant="outline" className="text-xs">
                                  {t('inventory.distributionDialog.group.configuredShareBadge', { share: porcentajeReparticionOrganismo })}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-[#E3F2FD] text-[#1E73BE] border-[#90CAF9]">
                                  {t('inventory.distributionDialog.group.totalShareBadge', { share: org.porcentaje })}
                                </Badge>
                                {org.porcentaje > 0 && (
                                  <Badge className="bg-[#4CAF50] text-white">
                                    CAD$ {formatMoney((totales.valorTotal * org.porcentaje) / 100)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {t('inventory.distributionDialog.group.formula', {
                                  share: porcentajeReparticionOrganismo,
                                  total: porcentajeReparticionTotalConfigurado || 1,
                                  result: org.porcentaje
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>

                  {organismosConPorcentajes.length > 0 && (
                    <Card className={`border-2 ${porcentajeGrupoValido ? 'border-[#4CAF50] bg-[#E8F5E9]' : 'border-[#FFC107] bg-[#FFF8E1]'}`}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{t('inventory.distributionDialog.group.totalDistribution')}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${porcentajeGrupoValido ? 'text-[#4CAF50]' : 'text-[#FFC107]'}`}>
                              {porcentajeTotalGrupoRedondeado}%
                            </span>
                            {porcentajeGrupoValido ? (
                              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-[#FFC107]" />
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          {t('inventory.distributionDialog.group.totalDistributionDescription', {
                            total: porcentajeReparticionTotalConfigurado
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="rounded-xl border-2 border-[#90CAF9] bg-[#F4F9FF] px-4 py-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B7AA4]">
                        Parametres du groupe
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1E73BE]">
                        Ancrage de la distribution de groupe
                      </p>
                    </div>
                    <Badge className={grupoDistribucionAnclada ? 'bg-[#1E73BE]' : 'bg-gray-500'}>
                      {grupoDistribucionAnclada ? 'Ancrée' : 'Non ancrée'}
                    </Badge>
                  </div>
                  <label className="flex items-start gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={grupoDistribucionAnclada}
                      onChange={(e) => setGrupoDistribucionAnclada(e.target.checked)}
                    />
                    <span>
                      <span className="block font-medium text-[#1E73BE]">Ancrer cette distribution de groupe</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        Si cette option reste activée, les modifications de péremption et d'observations seront appliquées à tout le groupe.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Date de péremption de la distribution</Label>
                  <Input
                    type="date"
                    value={fechaCaducidadGrupo}
                    onChange={(e) => setFechaCaducidadGrupo(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Option facultative. Elle restera modifiable après la création de la distribution.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('inventory.distributionDialog.observationsOptional')}</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder={t('inventory.distributionDialog.observationsPlaceholder')}
                    rows={2}
                  />
                </div>

                {organismoPreviewGrupo && comandaPreviewGrupo && (
                  <div className="space-y-2">
                    <Label>{t('inventory.distributionDialog.group.internalSimulation')}</Label>
                    <p className="text-xs text-gray-500">
                      {t('inventory.distributionDialog.group.internalSimulationDescription')}
                    </p>
                    <SimulacionRecepcionNotificacion
                      organismo={organismoPreviewGrupo}
                      comanda={comandaPreviewGrupo}
                      notificacion={notificacionPreviewGrupo}
                    />
                  </div>
                )}
              </div>
            )}

            {paso === 'grupo_creado' && ultimaDistribucionGrupo && (
              <div className="space-y-4">
                <Card className="border-2 border-[#4CAF50] bg-[#E8F5E9] shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-6 w-6 text-[#2E7D32]" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2E7D32]">
                            Distribution créée
                          </p>
                          <h3 className="text-lg font-bold text-[#1B5E20]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {ultimaDistribucionGrupo.grupoDistribucionEtiqueta}
                          </h3>
                        </div>
                        <p className="text-sm text-[#355E3B]">
                          L'accès reste visible ici après la création. Vous pouvez ouvrir tout de suite le module Commandes pour modifier la distribution ancrée.
                        </p>
                        <Badge className="bg-[#1E73BE] text-white">
                          Groupe: {ultimaDistribucionGrupo.grupoDistribucionId}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-[#DCE7F5] bg-white">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1E73BE]">Commandes générées</p>
                        <p className="text-xs text-gray-500">Résumé du groupe créé pour accès immédiat.</p>
                      </div>
                      <Badge className="bg-[#4CAF50] text-white">
                        {ultimaDistribucionGrupo.comandas.length} commandes
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto">
                      {ultimaDistribucionGrupo.comandas.map((comandaCreada) => (
                        <div key={comandaCreada.numero} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-[#0F172A]">{comandaCreada.numero}</span>
                            <Badge variant="outline" className="border-[#90CAF9] text-[#1E73BE]">
                              {comandaCreada.porcentaje}%
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-[#64748B]">{comandaCreada.nombre}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button onClick={abrirModuloCommandes} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                        Ouvrir les commandes
                      </Button>
                      <Button variant="outline" onClick={cerrarYReiniciar}>
                        Fermer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between items-center w-full">
              <div>
                {paso !== 'seleccion_tipo' && paso !== 'grupo_creado' && (
                  <Button variant="outline" onClick={retrocederPaso}>
                    {t('inventory.distributionDialog.back')}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {paso !== 'grupo_creado' && (
                  <Button variant="outline" onClick={cerrarYReiniciar}>
                    {t('inventory.distributionDialog.cancel')}
                  </Button>
                )}
                {paso === 'distribuir_grupo' && mensajeBloqueoDistribucionGrupo && (
                  <span className="self-center text-xs text-[#B45309] max-w-xs text-right">
                    {mensajeBloqueoDistribucionGrupo}
                  </span>
                )}
                {(paso === 'seleccion_tipo' || paso === 'editar_cantidades') && (
                  <Button onClick={avanzarPaso} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                    {t('inventory.distributionDialog.next')}
                  </Button>
                )}
                {paso === 'seleccionar_organismo' && (
                  <Button 
                    onClick={crearComandaIndividual} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!organismoSeleccionado}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('inventory.distributionDialog.createOrder')}
                  </Button>
                )}
                {paso === 'distribuir_grupo' && (
                  <Button 
                    onClick={crearComandasGrupo} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!porcentajeGrupoValido || organismosConPorcentajes.length === 0 || organismosConAsignacionGrupo.length === 0}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('inventory.distributionDialog.createOrders', { count: organismosConAsignacionGrupo.length })}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DialogCrearOferta 
        open={ofertaDialogOpen} 
        onOpenChange={setOfertaDialogOpen}
        carrito={carrito}
        productos={productos}
        categoriasInfo={categoriasInfo}
        onOfertaCreada={() => {
          setOfertaDialogOpen(false);
          onDistribucionCompletada();
        }}
      />
    </>
  );
}