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

function obtenerOrganismosElegiblesParaDistribucion(organismos: Organismo[]): Organismo[] {
  return organismos.filter(
    organismo =>
      organismo.activo &&
      organismo.regular &&
      Number.isFinite(organismo.porcentajeReparticion) &&
      normalizarPorcentajeEntero(organismo.porcentajeReparticion) > 0
  );
}

function distribuirPorcentajesProporcionales(organismos: Organismo[]): OrganismoConPorcentaje[] {
  const organismosConPeso = obtenerOrganismosElegiblesParaDistribucion(organismos)
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
  organismos: Organismo[]
): OrganismoConPorcentaje[] {
  return distribuirPorcentajesProporcionales(organismos);
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

interface DialogDistribuirProductosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  productos: any[];
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
  onDistribucionCompletada: () => void;
}

export function DialogDistribuirProductos({
  open,
  onOpenChange,
  carrito,
  productos,
  categoriasInfo,
  onDistribucionCompletada
}: DialogDistribuirProductosProps) {
  const { t } = useTranslation();
  
  // Estados principales
  const [paso, setPaso] = useState<'seleccion_tipo' | 'editar_cantidades' | 'seleccionar_organismo' | 'distribuir_grupo'>('seleccion_tipo');
  const [tipoDistribucion, setTipoDistribucion] = useState<'individual' | 'grupo'>('individual');
  
  // Estados para productos editables
  const [productosEditables, setProductosEditables] = useState<ProductoEditableItem[]>([]);
  
  // Estados para distribución individual
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estado para diálogo de ofertas
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);

  const usuarioActual = 'Usuario Sistema'; // En producción vendría del contexto de autenticación
  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(carrito.map(item => item.productoId)),
    [carrito]
  );
  const organismosDisponibles = React.useMemo(() => obtenerOrganismos(), [open]);
  const organismosActivos = React.useMemo(
    () => organismosDisponibles.filter(organismo => organismo.activo),
    [organismosDisponibles]
  );
  const organismosActivosRegulares = React.useMemo(
    () => organismosActivos.filter(organismo => organismo.regular),
    [organismosActivos]
  );
  const organismosActivosRegularesConPorcentaje = React.useMemo(
    () => obtenerOrganismosElegiblesParaDistribucion(organismosDisponibles),
    [organismosDisponibles]
  );
  const organismosConPorcentajes = React.useMemo(
    () => obtenerDistribucionAutomaticaOrganismos(organismosDisponibles),
    [organismosDisponibles]
  );

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
    if (organismosActivosRegularesConPorcentaje.length === 0) {
      toast.error('No hay organismos regulares con porcentaje de repartición configurado');
      return;
    }

    const nuevosOrganismos = obtenerDistribucionAutomaticaOrganismos(organismosDisponibles);
    
    toast.success(
      <div>
        <p className="font-semibold mb-1">Distribución recalculada usando el porcentaje de repartición de cada organismo</p>
        <ul className="text-sm space-y-1">
          {nuevosOrganismos.map((org, i) => {
            return (
              <li key={i}>
                • {org.nombre}: {org.porcentaje}%
                {` (Porcentaje de repartición configurado: ${org.porcentajeReparticionConfigurado}%)`}
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
    if (!organismoSeleccionado || !fechaEntrega) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const { valorTotal, pesoTotal } = calcularTotales();
    const numeroComanda = generarNumeroComanda();
    const organismoData = organismosDisponibles.find(organismo => organismo.id === organismoSeleccionado);
    
    const comanda: Comanda = {
      id: `comanda-${Date.now()}`,
      numero: numeroComanda,
      numeroComanda,
      organismoId: organismoSeleccionado,
      nombreOrganismo: organismoData?.nombre || '',
      fecha: new Date().toISOString(),
      usuarioCreacion: usuarioActual,
      creadoPor: usuarioActual,
      fechaEntrega: fechaEntrega,
      observaciones: observaciones,
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
      valorTotal: Math.round(valorTotal),
      pesoTotal: Math.round(pesoTotal),
      estado: 'pendiente'
    };

    try {
      guardarComanda(comanda);
      toast.success(`Comanda ${numeroComanda} creada correctamente`);
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
        fechaEntrega,
        totalProductos: comanda.items.length,
        valorTotal: comanda.valorTotal,
        observaciones,
      });
      if (resultadoEmail.enviado) {
        toast.success(`Notification email automatique envoyée à ${resultadoEmail.destinatarios.length} destinataire(s)`);
      }
      cerrarYReiniciar();
      onDistribucionCompletada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la comanda');
      console.error(error);
    }
  };

  const crearComandasGrupo = () => {
    const distribucionActual = obtenerDistribucionAutomaticaOrganismos(organismosDisponibles);

    if (distribucionActual.length === 0) {
      toast.error('No hay organismos regulares con porcentaje de repartición configurado');
      return;
    }

    const validacion = validarDistribucionGrupo(distribucionActual);
    if (!validacion.valido) {
      if (Math.abs(validacion.porcentajeTotal - 100) >= 0.01) {
        toast.error(`El porcentaje total debe ser 100% (actual: ${redondearPorcentajeTotal(validacion.porcentajeTotal)}%)`);
      } else {
        toast.error('Por favor complete todos los campos correctamente');
      }
      return;
    }

    if (!fechaEntrega) {
      toast.error('Por favor seleccione una fecha de entrega');
      return;
    }

    const productosDistribuibles = productosEditables.filter(item => item.cantidad > 0);
    if (productosDistribuibles.length === 0) {
      toast.error('Debe haber al menos un producto con cantidad mayor que 0 para crear la distribución de grupo');
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
              peso: valorDistribucion.pesoTotal,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (itemsComanda.length === 0) {
          return;
        }

        const valorTotalComanda = itemsComanda.reduce(
          (sum, item) => sum + (item.valorUnitario || 0) * item.cantidad,
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
          organismoId: orgInfo.id,
          nombreOrganismo: orgInfo.nombre,
          fecha: new Date().toISOString(),
          usuarioCreacion: usuarioActual,
          creadoPor: usuarioActual,
          fechaEntrega: fechaEntrega,
          observaciones: `Distribución en grupo (${normalizarPorcentajeEntero(orgInfo.porcentaje)}% del total)${observaciones ? '\n' + observaciones : ''}`,
          items: itemsComanda,
          valorTotal: Math.round(valorTotalComanda),
          pesoTotal: Math.round(pesoTotalComanda),
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
            fechaEntrega,
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
        toast.error('La distribución no generó productos asignados para ningún organismo');
        return;
      }

      toast.success(
        <div>
          <p className="font-semibold mb-1">Comandas creadas correctamente:</p>
          <ul className="text-sm space-y-1">
            {comandasCreadas.map((comandaCreada, i) => (
              <li key={i}>• {comandaCreada.numero} - {comandaCreada.nombre} ({comandaCreada.porcentaje}%)</li>
            ))}
          </ul>
          {resumenEmails.organismosNotificados > 0 && (
            <p className="text-sm mt-2">
              ✉️ Notifications email automatiques envoyées à {resumenEmails.organismosNotificados} organisme(s) ({resumenEmails.destinatarios} destinataire(s)).
            </p>
          )}
        </div>,
        { duration: 6000 }
      );
      
      cerrarYReiniciar();
      onDistribucionCompletada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear las comandas');
      console.error(error);
    }
  };

  const cerrarYReiniciar = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPaso('seleccion_tipo');
      setTipoDistribucion('individual');
      setProductosEditables([]);
      setOrganismoSeleccionado('');
      setFechaEntrega('');
      setObservaciones('');
    }, 300);
  };

  const avanzarPaso = () => {
    if (paso === 'seleccion_tipo') {
      setPaso('editar_cantidades');
    } else if (paso === 'editar_cantidades') {
      if (productosEditables.length === 0) {
        toast.error('Debe tener al menos un producto');
        return;
      }
      if (tipoDistribucion === 'individual') {
        setPaso('seleccionar_organismo');
      } else {
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
  const porcentajeReparticionTotalConfigurado = organismosActivosRegularesConPorcentaje.reduce(
    (sum, organismo) => sum + normalizarPorcentajeEntero(organismo.porcentajeReparticion),
    0
  );
  const cantidadOrganismosElegibles = organismosActivosRegularesConPorcentaje.length;
  const todosLosPesosIguales =
    cantidadOrganismosElegibles > 1 &&
    organismosActivosRegularesConPorcentaje.every(
      organismo =>
        normalizarPorcentajeEntero(organismo.porcentajeReparticion) ===
        normalizarPorcentajeEntero(organismosActivosRegularesConPorcentaje[0]?.porcentajeReparticion || 0)
    );
  const mensajeBloqueoDistribucionGrupo = !fechaEntrega
    ? 'Seleccione una fecha de entrega para crear la distribución.'
    : organismosConPorcentajes.length === 0
        ? 'No hay organismos activos y regulares con porcentaje de repartición mayor que 0.'
        : !porcentajeGrupoValido
          ? 'La distribución todavía no suma 100%.'
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
        fechaEntrega,
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
        valorTotal: Math.round(totales.valorTotal),
      } as Comanda)
    : null;
  const notificacionPreviewIndividual = comandaPreviewIndividual
    ? {
        mensaje: `Nouvelle commande ${comandaPreviewIndividual.numero} disponible pour confirmation`,
        fecha: new Date().toISOString(),
        leida: false,
        urlAcceso: construirRutaAccesoOrganismo(organismoPreviewIndividual?.claveAcceso),
      }
    : null;
  const organismoPreviewGrupo = organismosDisponibles.find(
    organismo => organismo.id === organismosConPorcentajes[0]?.id
  );
  const itemsPreviewGrupo = organismoPreviewGrupo
    ? productosEditables
        .filter(item => item.cantidad > 0)
        .map(item => {
          const cantidadAsignada = distribuirCantidadesEnteras(item.cantidad, organismosConPorcentajes)
            .find(distribucion => distribucion.distribucionKey === organismosConPorcentajes[0]?.distribucionKey)?.cantidad || 0;

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
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  const valorPreviewGrupo = itemsPreviewGrupo.reduce(
    (sum, item) => sum + (item.valorUnitario || 0) * item.cantidad,
    0
  );
  const comandaPreviewGrupo = organismoPreviewGrupo && itemsPreviewGrupo.length > 0
    ? ({
        id: `preview-group-${organismoPreviewGrupo.id}`,
        numero: `SIM-GRP-${organismoPreviewGrupo.id.toUpperCase().slice(0, 4)}`,
        organismoId: organismoPreviewGrupo.id,
        nombreOrganismo: organismoPreviewGrupo.nombre,
        fecha: new Date().toISOString(),
        fechaEntrega,
        estado: 'pendiente',
        observaciones: `Ejemplo para ${organismoPreviewGrupo.nombre}${observaciones ? `\n${observaciones}` : ''}`,
        items: itemsPreviewGrupo,
        valorTotal: Math.round(valorPreviewGrupo),
      } as Comanda)
    : null;
  const notificacionPreviewGrupo = comandaPreviewGrupo
    ? {
        mensaje: `Nouvelle commande ${comandaPreviewGrupo.numero} disponible pour confirmation`,
        fecha: new Date().toISOString(),
        leida: false,
        urlAcceso: construirRutaAccesoOrganismo(organismoPreviewGrupo?.claveAcceso),
      }
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="distribuir-productos-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {paso === 'seleccion_tipo' && '📦 Distribuir Productos'}
              {paso === 'editar_cantidades' && '✏️ Editar Cantidades'}
              {paso === 'seleccionar_organismo' && '🏢 Seleccionar Organismo'}
              {paso === 'distribuir_grupo' && '👥 Distribución en Grupo'}
            </DialogTitle>
            <DialogDescription id="distribuir-productos-description">
              {paso === 'seleccion_tipo' && 'Seleccione cómo desea distribuir los productos'}
              {paso === 'editar_cantidades' && 'Ajuste las cantidades de productos antes de distribuir'}
              {paso === 'seleccionar_organismo' && 'Complete los detalles de la comanda'}
              {paso === 'distribuir_grupo' && 'La distribución reparte el 100% entre organismos activos y regulares'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {/* Paso 1: Selección de tipo de distribución */}
            {paso === 'seleccion_tipo' && (
              <div className="grid grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'individual' ? 'border-2 border-[#1E73BE] bg-[#E3F2FD]' : 'border-2 border-gray-200'}`}
                  onClick={() => setTipoDistribucion('individual')}
                >
                  <CardContent className="p-6 text-center">
                    <Building2 className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'individual' ? 'text-[#1E73BE]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Organismo Individual
                    </h3>
                    <p className="text-sm text-gray-600">
                      Asignar todos los productos a un solo organismo
                    </p>
                    {tipoDistribucion === 'individual' && (
                      <Badge className="mt-3 bg-[#1E73BE] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seleccionado
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${tipoDistribucion === 'grupo' ? 'border-2 border-[#4CAF50] bg-[#E8F5E9]' : 'border-2 border-gray-200'}`}
                  onClick={() => setTipoDistribucion('grupo')}
                >
                  <CardContent className="p-6 text-center">
                    <Users className={`w-16 h-16 mx-auto mb-4 ${tipoDistribucion === 'grupo' ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Distribución en Grupo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Distribuir productos entre varios organismos con porcentajes
                    </p>
                    {tipoDistribucion === 'grupo' && (
                      <Badge className="mt-3 bg-[#4CAF50] text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seleccionado
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
                      Crear Oferta
                    </h3>
                    <p className="text-sm text-gray-600">
                      Publicar oferta para que organismos la acepten
                    </p>
                    <Badge className="mt-3 bg-[#FFC107] text-gray-900">
                      Nuevo
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
                          <p className="text-xs text-gray-600">Items</p>
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
                          <p className="text-xs text-gray-600">Valor</p>
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
                          <p className="text-xs text-gray-600">Peso</p>
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
                                  <p>Reservable:</p>
                                  <p className="font-semibold text-gray-900">{formatQuantity(item.stockReservable)} {item.unidad}</p>
                                  <p className="text-gray-500">Reservado: {formatQuantity(item.stockReservado)} {item.unidad}</p>
                                  <p className="text-gray-400">Físico: {formatQuantity(item.stockActual)} {item.unidad}</p>
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
                <div className="space-y-2">
                  <Label>Organismo Beneficiario</Label>
                  <Select
                    value={organismoSeleccionado}
                    onValueChange={setOrganismoSeleccionado}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un organismo" />
                    </SelectTrigger>
                    <SelectContent>
                      {organismosActivos.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Entrega</Label>
                  <Input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder="Ingrese observaciones adicionales (opcional)"
                    rows={3}
                  />
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-2">Resumen:</p>
                  <div className="space-y-1 text-sm">
                    <p>{totalItemsFormateado} items • CAD$ {valorTotalFormateado}</p>
                    <p>{pesoTotalFormateado} kg</p>
                  </div>
                </div>

                {organismoPreviewIndividual && comandaPreviewIndividual && (
                  <div className="space-y-2">
                    <Label>Simulation de réception par l'organisme</Label>
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
                        <p className="font-semibold text-[#1E73BE] mb-1">Distribución automática para organismos regulares</p>
                        <p className="text-gray-700">
                          La distribución en grupo carga automáticamente todos los organismos <strong>activos</strong> y <strong>regulares</strong>.
                          El sistema divide el <strong>100%</strong> total entre esos organismos tomando como base el
                          <strong> porcentaje de repartición</strong> configurado en el perfil de cada uno.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Badge className="bg-[#1E73BE] text-white px-3 py-1">
                    Cálculo actual: 100% distribuido según el porcentaje de repartición
                  </Badge>
                </div>

                {todosLosPesosIguales && cantidadOrganismosElegibles > 0 && (
                  <Card className="border-l-4 border-l-[#4CAF50] bg-[#E8F5E9]">
                    <CardContent className="p-3 text-sm text-gray-700">
                      Todos los organismos elegibles tienen el mismo porcentaje de repartición. Resultado: el 100% se divide en partes iguales.
                      {cantidadOrganismosElegibles === 2 && ' Con 2 organismos iguales, la distribución correcta es 50% y 50%.'}
                    </CardContent>
                  </Card>
                )}

                {organismosActivosRegulares.length > organismosActivosRegularesConPorcentaje.length && (
                  <Card className="border-l-4 border-l-[#FFC107] bg-[#FFF8E1]">
                    <CardContent className="p-3 text-sm text-gray-700">
                      {organismosActivosRegulares.length - organismosActivosRegularesConPorcentaje.length} organismo(s) regular(es) quedaron fuera porque su porcentaje de repartición es 0 o no está configurado.
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
                    Recalcular distribución automática
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-3">
                    <Label>Organismos y Porcentajes</Label>
                  </div>

                  {organismosActivosRegularesConPorcentaje.length > 0 && (
                    <Card className="border border-[#90CAF9] bg-[#F4F9FF]">
                      <CardContent className="p-3 text-xs text-gray-700 space-y-2">
                        <p className="font-semibold text-[#1E73BE]">Diagnóstico de organismos elegibles</p>
                        <div className="space-y-1">
                          {organismosActivosRegularesConPorcentaje.map((organismo) => (
                            <div key={`${organismo.id}-${organismo.nombre}`} className="flex flex-wrap gap-2">
                              <span>{organismo.nombre}</span>
                              <span className="text-gray-500">ID: {organismo.id}</span>
                              <span className="text-gray-500">Repartición: {normalizarPorcentajeEntero(organismo.porcentajeReparticion)}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {organismosConPorcentajes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay organismos con porcentaje de repartición disponible</p>
                      <p className="text-sm">
                        Configure porcentaje de repartición en los organismos regulares para habilitar la distribución automática
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
                                  placeholder="Porcentaje"
                                  min="0"
                                  max="100"
                                  step="1"
                                  className="w-24"
                                  readOnly
                                />
                                <span className="text-gray-600">%</span>
                                <Badge variant="outline" className="text-xs">
                                  Porcentaje de repartición: {porcentajeReparticionOrganismo}%
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-[#E3F2FD] text-[#1E73BE] border-[#90CAF9]">
                                  Del 100% total: {org.porcentaje}%
                                </Badge>
                                {org.porcentaje > 0 && (
                                  <Badge className="bg-[#4CAF50] text-white">
                                    CAD$ {formatMoney((totales.valorTotal * org.porcentaje) / 100)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Fórmula: ({porcentajeReparticionOrganismo} / {porcentajeReparticionTotalConfigurado || 1}) x 100 {'->'} {org.porcentaje}% del total.
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
                          <span className="font-semibold">Distribución Total:</span>
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
                          Base usada para el cálculo: solo organismos activos y regulares con porcentaje de repartición mayor que 0. El 100% distribuido se reparte según el porcentaje de repartición configurado. Suma de porcentajes de repartición configurados: {porcentajeReparticionTotalConfigurado}%.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Entrega</Label>
                  <Input
                    type="date"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    La creación de la distribución se habilita cuando haya fecha de entrega y la distribución total sea 100%.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Observaciones (Opcional)</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full"
                    placeholder="Ingrese observaciones adicionales"
                    rows={2}
                  />
                </div>

                {organismoPreviewGrupo && comandaPreviewGrupo && (
                  <div className="space-y-2">
                    <Label>Simulation interne du premier organisme bénéficiaire</Label>
                    <p className="text-xs text-gray-500">
                      Aperçu basé sur la première commande générée par la distribution automatique.
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
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex justify-between items-center w-full">
              <div>
                {paso !== 'seleccion_tipo' && (
                  <Button variant="outline" onClick={retrocederPaso}>
                    Atrás
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cerrarYReiniciar}>
                  Cancelar
                </Button>
                {paso === 'distribuir_grupo' && mensajeBloqueoDistribucionGrupo && (
                  <span className="self-center text-xs text-[#B45309] max-w-xs text-right">
                    {mensajeBloqueoDistribucionGrupo}
                  </span>
                )}
                {(paso === 'seleccion_tipo' || paso === 'editar_cantidades') && (
                  <Button onClick={avanzarPaso} className="bg-[#1E73BE] hover:bg-[#1557A0]">
                    Siguiente
                  </Button>
                )}
                {paso === 'seleccionar_organismo' && (
                  <Button 
                    onClick={crearComandaIndividual} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!organismoSeleccionado || !fechaEntrega}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Crear Comanda
                  </Button>
                )}
                {paso === 'distribuir_grupo' && (
                  <Button 
                    onClick={crearComandasGrupo} 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    disabled={!fechaEntrega || !porcentajeGrupoValido || organismosConPorcentajes.length === 0}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Crear Comandas ({organismosConPorcentajes.length})
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