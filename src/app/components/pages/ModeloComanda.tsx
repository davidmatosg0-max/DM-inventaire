import React, { useRef, useState, useEffect } from 'react';
import { Printer, X, Thermometer, Snowflake, Sun, Maximize2, Minimize2, Check, Ban, Edit2, Box, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import {
  resolverTemperaturaAlmacenamientoProducto,
  resolverTemperaturaOriginalEntradaProducto,
} from '../../utils/productTemperature';
import { sortByTemperature } from '../../utils/temperatureSort';
import { NotificacionComanda } from '../NotificacionComanda';
import { obtenerPersonaPrincipal } from '../../utils/personasResponsablesStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { buildComandaQRData, COMANDA_QR_SVG_LEVEL } from '../../utils/comandaQr';
import { useTranslation } from 'react-i18next';
import { BrandedQRCode } from '../shared/BrandedQRCode';
import { actualizarComanda, actualizarComandasGrupo } from '../../utils/comandaStorage';
import { toast } from 'sonner';

interface ModeloComandaProps {
  comanda: any;
  organismo: any;
  mostrar: boolean;
  onCerrar: () => void;
  onAbrirImpresionCompacta?: () => void;
  onCambiarEstado?: (nuevoEstado: string) => void;
  onAceptarComanda?: (itemsAceptados: any[], comandaOrigen?: any) => void;
  onAnularComanda?: (comandaOrigen?: any) => void;
  modoOrganismo?: boolean; // Para diferenciar si es vista de organismo o administrador
  onComandaActualizada?: (comandaActualizada: any) => void;
  abrirEdicionGrupoInicial?: boolean;
}

export function ModeloComanda({ 
  comanda, 
  organismo, 
  mostrar, 
  onCerrar,
  onAbrirImpresionCompacta,
  onCambiarEstado,
  onAceptarComanda,
  onAnularComanda,
  modoOrganismo = false,
  onComandaActualizada,
  abrirEdicionGrupoInicial = false,
}: ModeloComandaProps) {
  const { t } = useTranslation();
  const defaultLocale = 'fr-CA';
  const comandaRef = useRef<HTMLDivElement>(null);
  const bloqueGrupoRef = useRef<HTMLDivElement>(null);

  const obtenerEtiquetaProducto = (producto: any, nombreProducto?: string) => {
    return nombreProducto || producto?.nombre || producto?.subcategoria || 'Produit introuvable';
  };

  const obtenerPoidsUnitaire = (producto: any) => {
    if (typeof producto?.pesoUnitario !== 'number' || producto.pesoUnitario <= 0) {
      return null;
    }

    return `Poids unitaire : ${formatQuantity(producto.pesoUnitario)} kg`;
  };

  const obtenerValorUnitario = (item: any) => {
    if (typeof item?.valorUnitario === 'number' && item.valorUnitario > 0) {
      return item.valorUnitario;
    }

    if (typeof item?.producto?.valorUnitario === 'number' && item.producto.valorUnitario > 0) {
      return item.producto.valorUnitario;
    }

    return 0;
  };

  const itemsComanda = React.useMemo(() => Array.isArray(comanda.items) ? comanda.items : [], [comanda.items]);
  const [pantallaCompleta, setPantallaCompleta] = useState(true); // Cambiado a true para abrir en pantalla completa por defecto
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cantidadesEditadas, setCantidadesEditadas] = useState<{[key: string]: number}>({});
  const [campoEditando, setCampoEditando] = useState<string | null>(null); // Para edición inline
  const [modoEdicionGrupo, setModoEdicionGrupo] = useState(false);
  const [fechaCaducidadGrupoEditada, setFechaCaducidadGrupoEditada] = useState('');
  const [grupoAncladoEditado, setGrupoAncladoEditado] = useState(false);
  const [observacionesGrupoEditadas, setObservacionesGrupoEditadas] = useState('');
  const distribucionGrupoFinalizada = ['entregada', 'anulada'].includes(String(comanda.estado || ''));
  
  // 🎯 NUEVO: Estado para marcar productos como completados durante la preparación
  const [productosCompletados, setProductosCompletados] = useState<{[key: string]: boolean}>({});

  // 🎯 NUEVO: Función para alternar el estado de completado de un producto
  const toggleProductoCompletado = (itemKey: string) => {
    setProductosCompletados(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Función para imprimir
  const handleImprimir = () => {
    if (onAbrirImpresionCompacta) {
      onCerrar();
      onAbrirImpresionCompacta();
      return;
    }

    console.log('🖨️ Imprimiendo comanda completa desde modal...');
    window.print();
    
    // Cerrar el modal después de que termine la impresión
    const handleAfterPrint = () => {
      console.log('✅ Impresión completada - Cerrando modal...');
      onCerrar();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
  };

  // Agrupar productos por temperatura
  const productosOrdenados = React.useMemo(() => {
    const todosLosProductos = obtenerProductos();
    const items = itemsComanda.map((item: any) => {
      const productoPersistido = todosLosProductos.find(p => p.id === item.productoId);
      const productoEnMemoria = mockProductos.find(p => p.id === item.productoId);
      const producto = productoPersistido || productoEnMemoria;
      const temperaturaFuente = resolverTemperaturaAlmacenamientoProducto({
        ...(producto || {}),
        categoria: (producto as any)?.categoria || item?.categoria,
        subcategoria: (producto as any)?.subcategoria || item?.subcategoria,
        nombre: (producto as any)?.nombre || item?.nombreProducto || item?.productoNombre,
        temperatura: (producto as any)?.temperatura || item?.temperatura,
        temperaturaAlmacenamiento: (producto as any)?.temperaturaAlmacenamiento,
      });

      const temperatura =
        String(temperaturaFuente).toLowerCase().includes('congel')
          ? 'Congelado'
          : String(temperaturaFuente).toLowerCase().includes('refrig')
            ? 'Refrigerado'
            : 'Temperatura Ambiente';
      const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto({
        ...(producto || {}),
        categoria: (producto as any)?.categoria || item?.categoria,
        subcategoria: (producto as any)?.subcategoria || item?.subcategoria,
        nombre: (producto as any)?.nombre || item?.nombreProducto || item?.productoNombre,
        temperatura: (producto as any)?.temperatura || item?.temperatura,
        temperaturaAlmacenamiento: (producto as any)?.temperaturaAlmacenamiento,
        temperaturaOriginalEntrada:
          (item as any)?.temperaturaOriginalEntrada ||
          (productoPersistido as any)?.temperaturaOriginalEntrada ||
          (productoEnMemoria as any)?.temperaturaOriginalEntrada,
      });

      return {
        ...item,
        producto,
        temperatura,
        temperaturaOriginalEntrada,
      };
    });

    return sortByTemperature(
      items,
      (item: any) => item.temperatura,
      (a: any, b: any) => String(a.nombreProducto || a.producto?.nombre || '').localeCompare(
        String(b.nombreProducto || b.producto?.nombre || ''),
        'fr',
      ),
    );
  }, [itemsComanda]);

  // 🎯 NUEVO: Calcular progreso de preparación (DESPUÉS de productosOrdenados)
  const totalProductos = productosOrdenados.length;
  const productosCompletadosCount = Object.values(productosCompletados).filter(Boolean).length;
  const porcentajeCompletado = totalProductos > 0 ? (productosCompletadosCount / totalProductos) * 100 : 0;

  // Agrupar por temperatura para mostrar secciones
  const productosAgrupados = React.useMemo(() => {
    const grupos: { [key: string]: any[] } = {
      'Temperatura Ambiente': [],
      'Refrigerado': [],
      'Congelado': []
    };

    productosOrdenados.forEach((item: any) => {
      grupos[item.temperatura].push(item);
    });

    return grupos;
  }, [productosOrdenados]);

  const obtenerEtiquetaTemperatura = (temperatura: string) => {
    if (temperatura === 'Temperatura Ambiente') {
      return 'Ambiante';
    }

    if (temperatura === 'Refrigerado') {
      return 'Réfrigéré';
    }

    if (temperatura === 'Congelado') {
      return 'Congelé';
    }

    return temperatura;
  };

  const obtenerNombreOriginalTemperatura = (temperatura?: string) => {
    if (temperatura === 'refrigerado') {
      return 'refrigerado';
    }

    if (temperatura === 'congelado') {
      return 'congelado';
    }

    return 'ambiente';
  };

  const getTemperatureBadgeStyle = (temp: string) => {
    switch (temp) {
      case 'Temperatura Ambiente':
        return 'bg-[#FFF8E1] text-[#F57C00] border-[#FFC107]';
      case 'Refrigerado':
        return 'bg-[#E3F2FD] text-[#1E73BE] border-[#1E73BE]';
      case 'Congelado':
        return 'bg-[#E1F5FE] text-[#0277BD] border-[#0288D1]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Obtener fecha y hora actual
  const fechaActual = new Date();
  const dia = fechaActual.toLocaleDateString(defaultLocale, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const hora = fechaActual.toLocaleTimeString(defaultLocale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Generar datos para QR (información de la comanda)
  const qrData = buildComandaQRData({
    numeroComanda: comanda.numero,
    organismo: organismo?.nombre || 'Sin organismo',
    fecha: comanda.fecha,
    items: itemsComanda.length,
    organismoId: organismo?.id,
  });

  // Función para obtener icono de temperatura
  const getTemperaturaIcon = (temp: string) => {
    switch (temp) {
      case 'Temperatura Ambiente':
        return <Sun className="w-5 h-5 text-[#FFC107]" />;
      case 'Refrigerado':
        return <Thermometer className="w-5 h-5 text-[#1E73BE]" />;
      case 'Congelado':
        return <Snowflake className="w-5 h-5 text-[#4CAF50]" />;
      default:
        return null;
    }
  };

  // Estados disponibles
  const estadosDisponibles = [
    { valor: 'pendiente', label: 'En attente', color: 'bg-[#1E73BE]' },
    { valor: 'confirmada', label: 'Acceptée', color: 'bg-[#7E57C2]' },
    { valor: 'en_preparacion', label: 'En préparation', color: 'bg-[#FFC107]' },
    { valor: 'completada', label: 'Complétée', color: 'bg-[#4CAF50]' },
    { valor: 'entregada', label: 'Livrée', color: 'bg-[#2E7D32]' },
    { valor: 'anulada', label: 'Annulée', color: 'bg-[#DC3545]' }
  ];

  const estadoActual = estadosDisponibles.find(e => e.valor === comanda.estado);

  // Inicializar cantidades editadas
  useEffect(() => {
    if (mostrar && modoOrganismo) {
      const cantidadesIniciales: {[key: string]: number} = {};
      productosOrdenados.forEach((item: any, index: number) => {
        cantidadesIniciales[`${item.productoId}-${index}`] = item.cantidad;
      });
      setCantidadesEditadas(cantidadesIniciales);
    }
  }, [mostrar, modoOrganismo, productosOrdenados]);

  useEffect(() => {
    if (mostrar) {
      setFechaCaducidadGrupoEditada(comanda.fechaCaducidadGrupo || '');
      setGrupoAncladoEditado(Boolean(comanda.grupoDistribucionAnclada));
      setObservacionesGrupoEditadas(comanda.observaciones || '');
      setModoEdicionGrupo(abrirEdicionGrupoInicial && Boolean(comanda.grupoDistribucionId || comanda.fechaCaducidadGrupo));
    }
  }, [mostrar, comanda.fechaCaducidadGrupo, comanda.grupoDistribucionAnclada, comanda.observaciones, comanda.grupoDistribucionId, abrirEdicionGrupoInicial]);

  useEffect(() => {
    if (!mostrar || !modoEdicionGrupo || !bloqueGrupoRef.current) {
      return;
    }

    bloqueGrupoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [mostrar, modoEdicionGrupo]);

  const handleGuardarMetadatosGrupo = () => {
    try {
      if (distribucionGrupoFinalizada) {
        toast.error('Cette distribution de groupe est finalisée et ne peut plus être modifiée.');
        return;
      }

      if (!comanda.grupoDistribucionId) {
        toast.error('La date de péremption de la distribution doit être modifiée depuis une distribution de groupe valide.');
        return;
      }

      const cambios = {
        fechaCaducidadGrupo: fechaCaducidadGrupoEditada || undefined,
        grupoDistribucionAnclada: grupoAncladoEditado,
        observaciones: observacionesGrupoEditadas.trim() || undefined,
        fechaModificacion: new Date().toISOString(),
      };

      const comandasActualizadas = actualizarComandasGrupo(comanda.grupoDistribucionId, cambios);
      const comandaActualizada = comandasActualizadas.find((item) => item.id === comanda.id);
      if (comandaActualizada) {
        Object.assign(comanda, comandaActualizada);
        onComandaActualizada?.(comandaActualizada);
      }

      toast.success('Distribution de groupe mise à jour pour tout le groupe.');

      setModoEdicionGrupo(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la distribution de groupe:', error);
      toast.error('Impossible d’appliquer les modifications de la distribution de groupe.');
    }
  };

  // Función para cambiar cantidad
  const handleCambioCantidad = (itemKey: string, nuevaCantidad: number, cantidadOriginal: number) => {
    // Solo permitir disminuir o mantener igual
    if (nuevaCantidad <= cantidadOriginal && nuevaCantidad >= 0) {
      setCantidadesEditadas(prev => ({
        ...prev,
        [itemKey]: nuevaCantidad
      }));
    }
  };

  // Función para aceptar toda la comanda
  const handleAceptarTodo = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => ({
        ...item,
        cantidadAceptada: item.cantidad
      }));
      onAceptarComanda(itemsAceptados, comanda);
      setModoEdicion(false);
    }
  };

  // Función para aceptar con cantidades modificadas
  const handleAceptarModificado = () => {
    if (onAceptarComanda) {
      const itemsAceptados = productosOrdenados.map((item: any, index: number) => {
        const itemKey = `${item.productoId}-${index}`;
        return {
          ...item,
          cantidadAceptada: cantidadesEditadas[itemKey] ?? item.cantidad
        };
      });
      onAceptarComanda(itemsAceptados, comanda);
      setModoEdicion(false);
    }
  };

  // Función para anular comanda
  const handleAnular = () => {
    if (onAnularComanda && window.confirm('Êtes-vous certain de vouloir annuler cette commande ?')) {
      onAnularComanda(comanda);
    }
  };

  // 🎯 NUEVO: Obtener persona autorizada para recoger la comanda
  const personaAutorizada = React.useMemo(() => {
    if (!organismo?.id) return null;
    const persona = obtenerPersonaPrincipal(organismo.id);
    return persona || null;
  }, [organismo?.id]);

  return (
    <Dialog open={mostrar} onOpenChange={onCerrar}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none !top-0 !left-0 !translate-x-0 !translate-y-0 p-0 overflow-y-auto print:max-w-full print:max-h-full m-0 rounded-none" aria-describedby="modelo-comanda-description">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('orders.dialog.title', { number: comanda.numero })}</DialogTitle>
          <DialogDescription id="modelo-comanda-description">{t('orders.dialog.description')}</DialogDescription>
        </DialogHeader>
        {/* Botones de acción (no se imprimen) */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm flex flex-wrap justify-between items-center p-4 print:hidden gap-2">
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Commande - {comanda.numero}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleImprimir}
              variant="outline"
              size="sm"
              className="bg-[#1E73BE] text-white hover:bg-[#1557A0] border-0"
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Imprimer</span>
            </Button>
            <Button
              onClick={onCerrar}
              variant="outline"
              size="sm"
              className="bg-white text-[#1E73BE] hover:bg-blue-50 border-0"
            >
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Fermer</span>
            </Button>
          </div>
        </div>

        {/* Cambiar Estado de Preparación (no se imprime) */}
        {onCambiarEstado && (
          <div className="mx-4 mb-4 p-4 bg-gray-50 rounded-lg print:hidden">
            <p className="font-medium text-[#333333] mb-3 text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              État de préparation
            </p>
            <div className="flex flex-wrap gap-2">
              {estadosDisponibles.map((estado) => (
                <Button
                  key={estado.valor}
                  onClick={() => onCambiarEstado(estado.valor)}
                  size="sm"
                  className={`${estado.color} text-white text-xs sm:text-sm ${
                    comanda.estado === estado.valor ? 'ring-2 ring-offset-2 ring-[#333333]' : ''
                  }`}
                >
                  {estado.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 🎯 NUEVO: Indicador de Progreso de Preparación (no se imprime) */}
        {comanda.estado === 'en_preparacion' && !modoOrganismo && (
          <div className="mx-4 mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-[#FFC107] rounded-lg print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-[#F57C00] mb-1 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  📦 Progrès de préparation
                </p>
                <p className="text-sm text-[#666666]">
                  Cochez les produits au fur et à mesure de la préparation
                </p>
              </div>
              <div className="flex flex-col items-end text-right">
                <p className="text-3xl font-bold" style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#DC3545'
                }}>
                  {productosCompletadosCount}/{totalProductos}
                </p>
                <p className="text-xs text-[#666666] mt-1">Produits prêts</p>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out flex items-center justify-center text-white text-xs font-bold"
                style={{
                  width: `${porcentajeCompletado}%`,
                  backgroundColor: porcentajeCompletado === 100 ? '#4CAF50' : porcentajeCompletado > 50 ? '#FFC107' : '#1E73BE'
                }}
              >
                {porcentajeCompletado > 10 && `${Math.round(porcentajeCompletado)}%`}
              </div>
            </div>
            
            {porcentajeCompletado === 100 && (
              <div className="mt-3 flex items-center gap-2 text-[#4CAF50]">
                <Check className="w-5 h-5" />
                <p className="font-semibold text-sm">✨ Tous les produits sont prêts. Vous pouvez passer l'état à « Complétée ».</p>
              </div>
            )}
          </div>
        )}

        {/* Notificación al Organismo (no se imprime) */}
        {!modoOrganismo && comanda.estado === 'completada' && organismo && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-[#4CAF50] print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-[#4CAF50] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                  🎉 Commande complétée - prête à notifier
                </p>
                <p className="text-sm text-[#666666]">
                  La commande est prête. Envoyez une notification à l'organisme avec le lien d'accès direct.
                </p>
              </div>
              <NotificacionComanda comanda={comanda} organismo={organismo} />
            </div>
          </div>
        )}

        {/* Acciones del Organismo (no se imprime) */}
        {modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'confirmada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-[#1E73BE] print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-[#1E73BE] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.2rem' }}>
                  Actions de la commande
                </p>
                <p className="text-sm text-[#666666]">
                  Cliquez directement sur une quantité pour la modifier, ou acceptez la commande complète
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAceptarTodo}
                className="flex-1 bg-[#4CAF50] text-white hover:bg-green-600 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Check className="w-5 h-5 mr-2" />
                Accepter tout
              </Button>
              <Button
                onClick={handleAnular}
                variant="outline"
                className="flex-1 bg-[#DC3545] text-white hover:bg-red-700 border-0"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Ban className="w-5 h-5 mr-2" />
                Annuler la commande
              </Button>
            </div>

            {Object.values(cantidadesEditadas).some((cant, idx) => cant !== productosOrdenados[idx]?.cantidad) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#FFC107] rounded">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#333333] mb-1">Quantités modifiées</p>
                    <p className="text-sm text-[#666666] mb-3">
                      Certaines quantités ont été modifiées. Vous pouvez continuer à en ajuster d'autres ou confirmer les changements.
                    </p>
                    <Button
                      onClick={handleAceptarModificado}
                      className="bg-[#4CAF50] text-white hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmer les quantités modifiées
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modelo de Comanda (se imprime) */}
        <div ref={comandaRef} className="bg-white p-8 print:p-0" data-comanda-print>
          {/* Encabezado */}
          <div className="border-b-4 border-[#1E73BE] pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="font-bold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2.5rem' }}>
                  BANQUE ALIMENTAIRE
                </h1>
                <p className="text-[#666666] mb-1" style={{ fontSize: '1.1rem' }}>Système de gestion des commandes</p>
                <p className="text-[#666666]">Laval, Québec, Canada</p>
              </div>
              <div className="flex flex-col items-end text-right">
                <div className="mb-4 bg-white p-2 rounded-lg shadow-md qrcode-container">
                  <BrandedQRCode
                    value={qrData}
                    size={144}
                    level={COMANDA_QR_SVG_LEVEL}
                    includeMargin={true}
                    data-testid="qr-code"
                  />
                </div>
                <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.3rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {comanda.numero}
                </p>
                {modoOrganismo && comanda.estado === 'pendiente' && (
                  <div className="mt-3 w-[20rem] max-w-full rounded-lg border-l-4 border-t border-r border-b border-[#F6C26B] border-l-[#C27A00] bg-gradient-to-r from-[#FFF3D6] to-[#FFE7B8] p-3 text-left shadow-sm print:hidden">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B46900]" />
                      <div>
                        <p className="font-bold text-[#7A4200] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Acceptation requise avant la date prévue
                        </p>
                        <p className="text-sm leading-5 text-[#7A4200]">
                          Si cette commande n’est pas acceptée avant le {new Date(comanda.fechaEntrega || comanda.fecha).toLocaleDateString(defaultLocale)}, elle sera annulée automatiquement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {(comanda.grupoDistribucionAnclada || comanda.fechaCaducidadGrupo) && (
                  <div className="mt-3 flex flex-col items-end gap-2">
                    {comanda.grupoDistribucionAnclada && (
                      <Badge className="border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]">
                        Distribution ancrée
                      </Badge>
                    )}
                    {comanda.fechaCaducidadGrupo && (
                      <Badge className="border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]">
                        Péremption: {new Date(comanda.fechaCaducidadGrupo).toLocaleDateString(defaultLocale)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ORGANISMO EN GRANDE */}
          <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] border-4 border-[#1E73BE] rounded-xl shadow-lg">
            <p className="text-xs sm:text-sm text-[#666666] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              Organisme destinataire
            </p>
            <h2 className="font-bold text-[#1E73BE] mb-3 text-xl sm:text-3xl lg:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif', lineHeight: '1.2' }}>
              {organismo?.nombre || 'Sans organisme'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#666666]"><strong>Adresse :</strong> {organismo?.direccion || 'N/A'}</p>
                <p className="text-[#666666]"><strong>Téléphone :</strong> {organismo?.telefono || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[#666666]"><strong>Responsable :</strong> {organismo?.responsable || 'N/A'}</p>
                <p className="text-[#666666]"><strong>Courriel :</strong> {organismo?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información de Cita y Preparación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-[#FFF8E1] border-2 border-[#FFC107] p-4 sm:p-5 rounded-lg">
              <p className="font-bold text-[#FFC107] mb-3 flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📅 Rendez-vous de collecte
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-[#333333]">
                  <strong>Jour :</strong> {comanda.fechaEntrega ? 
                    new Date(comanda.fechaEntrega).toLocaleDateString(defaultLocale, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : dia}
                </p>
                <p className="text-[#333333]">
                  <strong>Heure :</strong> {comanda.horaRecogida || hora}
                </p>
                {comanda.fechaLimiteRespuesta && (
                  <p className="text-xs sm:text-sm text-[#DC3545] mt-2 font-medium">
                    ⚠️ À confirmer avant le : {new Date(comanda.fechaLimiteRespuesta).toLocaleDateString(defaultLocale)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-[#E8F5E9] border-2 border-[#4CAF50] p-4 sm:p-5 rounded-lg">
              <p className="font-bold text-[#4CAF50] mb-3 flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                👤 Informations de préparation
              </p>
              <div className="space-y-2 text-sm sm:text-base">
                <p className="text-[#333333]">
                  <strong>Préparée par :</strong> {comanda.usuarioCreacion || 'Non attribué'}
                </p>
                <p className="text-[#333333]">
                  <strong>Date de création :</strong> {new Date(comanda.fecha).toLocaleDateString(defaultLocale)}
                </p>
                <p className="text-[#333333]">
                  <strong>Heure de création :</strong> {new Date(comanda.fecha).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[#333333]">
                  <strong>État :</strong>{' '}
                  <Badge className={estadoActual?.color}>
                    {estadoActual?.label}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {(comanda.grupoDistribucionId || comanda.fechaCaducidadGrupo) && !modoOrganismo && (
            <div ref={bloqueGrupoRef} className="mb-8 rounded-xl border-2 border-[#90CAF9] bg-[#F4F9FF] p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#666666]">Distribution de groupe</p>
                  <h3 className="text-lg font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {comanda.grupoDistribucionEtiqueta || comanda.grupoDistribucionId || 'Distribution de groupe'}
                  </h3>
                </div>
                <Badge className={grupoAncladoEditado ? 'bg-[#1E73BE]' : 'bg-gray-500'}>
                  {grupoAncladoEditado ? 'Ancrée' : 'Non ancrée'}
                </Badge>
              </div>

              {modoEdicionGrupo ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#333333]">Date de péremption de la distribution</label>
                      <Input
                        type="date"
                        value={fechaCaducidadGrupoEditada}
                        onChange={(e) => setFechaCaducidadGrupoEditada(e.target.value)}
                        disabled={distribucionGrupoFinalizada}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#333333]">Observations de la distribution</label>
                      <Textarea
                        value={observacionesGrupoEditadas}
                        onChange={(e) => setObservacionesGrupoEditadas(e.target.value)}
                        placeholder="Notes partagées pour toute la distribution"
                        className="min-h-[110px]"
                        disabled={distribucionGrupoFinalizada}
                      />
                    </div>
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={grupoAncladoEditado}
                        onChange={(e) => setGrupoAncladoEditado(e.target.checked)}
                        disabled={distribucionGrupoFinalizada}
                      />
                      <span>
                        <span className="block font-medium">Conserver la distribution ancrée</span>
                        <span className="block text-xs text-gray-500 mt-1">
                          La date de péremption et les observations restent toujours liées à toute la distribution.
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setModoEdicionGrupo(false)}>
                      Annuler
                    </Button>
                    <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" onClick={handleGuardarMetadatosGrupo} disabled={distribucionGrupoFinalizada}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-sm text-[#333333]">
                    <p>
                      <strong>Date de péremption de la distribution :</strong>{' '}
                      {comanda.fechaCaducidadGrupo
                        ? new Date(comanda.fechaCaducidadGrupo).toLocaleDateString(defaultLocale)
                        : 'Non définie'}
                    </p>
                    <p>
                      <strong>Portée des modifications :</strong> Toute la distribution de groupe
                    </p>
                    <p>
                      <strong>Observations de la distribution :</strong>{' '}
                      {comanda.observaciones?.trim() ? comanda.observaciones : 'Aucune observation'}
                    </p>
                    {distribucionGrupoFinalizada && (
                      <p className="font-medium text-[#8D6E63]">Cette distribution est finalisée et n’est plus modifiable.</p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setModoEdicionGrupo(true)} disabled={distribucionGrupoFinalizada}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Modifier la distribution
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Productos organizados por temperatura */}
          <div className="mb-6">
            <h2 className="font-bold text-[#1E73BE] mb-4 pb-2 border-b-4 border-[#1E73BE] flex items-center gap-3" 
                style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
              <Thermometer className="w-6 h-6" />
              Produits par température d'entreposage
            </h2>

            {Object.entries(productosAgrupados).map(([temperatura, items]) => {
              if (items.length === 0) return null;
              
              const colorConfig = {
                'Temperatura Ambiente': { 
                  bg: 'bg-[#FFF8E1]', 
                  border: 'border-[#FFC107]', 
                  text: 'text-[#F57C00]',
                  icon: <Sun className="w-6 h-6 text-[#FFC107]" />
                },
                'Refrigerado': { 
                  bg: 'bg-[#E3F2FD]', 
                  border: 'border-[#1E73BE]', 
                  text: 'text-[#1E73BE]',
                  icon: <Thermometer className="w-6 h-6 text-[#1E73BE]" />
                },
                'Congelado': { 
                  bg: 'bg-[#E1F5FE]', 
                  border: 'border-[#0288D1]', 
                  text: 'text-[#0277BD]',
                  icon: <Snowflake className="w-6 h-6 text-[#0288D1]" />
                }
              };

              const config = colorConfig[temperatura as keyof typeof colorConfig];
              
              return (
                <div key={temperatura} className="mb-8 break-inside-avoid">
                  <div className={`flex items-center gap-3 mb-3 ${config.bg} border-2 ${config.border} p-4 rounded-lg`}>
                    {config.icon}
                    <h3 className={`font-bold ${config.text} text-base sm:text-lg lg:text-xl`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {obtenerEtiquetaTemperatura(temperatura)}
                    </h3>
                    <Badge className="bg-[#4CAF50] ml-auto text-xs sm:text-sm" style={{ padding: '0.3rem 0.6rem' }}>
                      {items.length} produit{items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table className="border-2 border-gray-300">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          {/* 🎯 NUEVO: Columna para checkbox de progreso */}
                          {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                            <TableHead className="font-bold text-center text-xs sm:text-sm w-16" style={{ fontFamily: 'Montserrat, sans-serif' }}>✓</TableHead>
                          )}
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Icône</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Code</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Produit</TableHead>
                          <TableHead className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Lot</TableHead>
                          <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quantité</TableHead>
                          <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Unité</TableHead>
                          {comanda.estado === 'completada' && (
                            <TableHead className="font-bold text-center text-xs sm:text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Livré</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item: any, index: number) => {
                          const itemKey = `${item.productoId}-${index}`;
                          return (
                            <TableRow key={itemKey} className="hover:bg-gray-50">
                              {/* 🎯 NUEVO: Checkbox para marcar producto como completado */}
                              {comanda.estado === 'en_preparacion' && !modoOrganismo && (
                                <TableCell className="text-center">
                                  <input
                                    type="checkbox"
                                    checked={productosCompletados[itemKey] || false}
                                    onChange={() => toggleProductoCompletado(itemKey)}
                                    className="w-5 h-5 cursor-pointer accent-[#4CAF50]"
                                    title="Marquer comme complété"
                                  />
                                </TableCell>
                              )}
                              <TableCell className="text-center">
                                {item.producto?.icono ? (
                                  <span className="text-3xl">{item.producto.icono}</span>
                                ) : (
                                  <Box className="w-6 h-6 text-gray-400 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="font-mono font-medium">{item.producto?.codigo || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#333333]">
                                    {obtenerEtiquetaProducto(item.producto, item.nombreProducto)}
                                  </span>
                                  <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium mt-1 ${getTemperatureBadgeStyle(item.temperatura)}`}>
                                    {getTemperaturaIcon(item.temperatura)}
                                    {obtenerEtiquetaTemperatura(item.temperatura)}
                                  </span>
                                  <span className="text-[11px] text-[#666666] mt-1">
                                    Entrée: {obtenerNombreOriginalTemperatura(item.temperaturaOriginalEntrada)}
                                  </span>
                                  {obtenerPoidsUnitaire(item.producto) && (
                                    <span className="text-xs text-[#666666] mt-1">
                                      {obtenerPoidsUnitaire(item.producto)}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-[#666666]">
                                {item.producto?.lote || 'N/A'}
                              </TableCell>
                              <TableCell className="text-center">
                                {modoEdicion || campoEditando === itemKey ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max={Math.round(item.cantidad)}
                                    value={formatQuantity(cantidadesEditadas[itemKey] || item.cantidad)}
                                    onChange={(e) => handleCambioCantidad(itemKey, parseInt(e.target.value) || 0, item.cantidad)}
                                    onBlur={() => setCampoEditando(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setCampoEditando(null);
                                      } else if (e.key === 'Escape') {
                                        // Restaurar cantidad original
                                        setCantidadesEditadas(prev => ({
                                          ...prev,
                                          [itemKey]: item.cantidad
                                        }));
                                        setCampoEditando(null);
                                      }
                                    }}
                                    autoFocus
                                    className="w-20 text-center font-bold text-[#1E73BE]"
                                  />
                                ) : (
                                  <span 
                                    className={`font-bold text-[#1E73BE] ${modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'cursor-pointer hover:bg-blue-100 px-2 py-1 rounded transition-colors' : ''}`}
                                    style={{ fontSize: '1.2rem' }}
                                    onClick={() => {
                                      if (modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada') {
                                        setCampoEditando(itemKey);
                                      }
                                    }}
                                    title={modoOrganismo && comanda.estado !== 'anulada' && comanda.estado !== 'completada' && comanda.estado !== 'entregada' ? 'Cliquer pour modifier' : ''}
                                  >
                                    {cantidadesEditadas[itemKey] !== undefined && cantidadesEditadas[itemKey] !== item.cantidad ? (
                                      <span className="flex items-center justify-center gap-1">
                                        <span className="line-through text-gray-400 text-sm">{formatQuantity(item.cantidad)}</span>
                                        <span className="text-[#FFC107]">{formatQuantity(cantidadesEditadas[itemKey])}</span>
                                      </span>
                                    ) : (
                                      formatQuantity(item.cantidad)
                                    )}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-[#666666] font-medium">
                                {item.producto?.unidad || 'N/A'}
                              </TableCell>
                              {comanda.estado === 'completada' && (
                                <TableCell className="text-center">
                                  <Badge className="bg-[#4CAF50]" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                                    {formatQuantity(item.cantidadEntregada || item.cantidad)}
                                  </Badge>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="border-t-4 border-[#1E73BE] pt-6 mb-8">
            <h3 className="font-bold text-[#333333] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.3rem' }}>
              Résumé de la commande
            </h3>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="bg-blue-50 border-2 border-[#1E73BE] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Total des produits</p>
                <p className="font-bold text-[#1E73BE]" style={{ fontSize: '2rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosOrdenados.length}
                </p>
              </div>
              <div className="bg-green-50 border-2 border-[#4CAF50] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Poids total</p>
                <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {formatQuantity(productosOrdenados.reduce((sum: number, item: any) => sum + (modoEdicion && cantidadesEditadas[item.productoId] !== undefined ? cantidadesEditadas[item.productoId] : item.cantidad), 0))} kg
                </p>
              </div>
              <div className="bg-orange-50 border-2 border-[#FF9800] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Valeur monétaire</p>
                <p className="font-bold text-[#FF9800]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  CAD$ {formatMoney(productosOrdenados.reduce((sum: number, item: any) => {
                    const cantidad = modoEdicion && cantidadesEditadas[item.productoId] !== undefined ? cantidadesEditadas[item.productoId] : item.cantidad;
                    return sum + (cantidad * obtenerValorUnitario(item));
                  }, 0))}
                </p>
              </div>
              <div className="bg-yellow-50 border-2 border-[#FFC107] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Ambiante</p>
                <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Temperatura Ambiente'].length}
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-[#0288D1] p-5 rounded-lg">
                <p className="text-sm text-[#666666] mb-1 uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>Réfrigéré/Congelé</p>
                <p className="font-bold text-[#0288D1]" style={{ fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                  {productosAgrupados['Refrigerado'].length + productosAgrupados['Congelado'].length}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {comanda.observaciones && (
            <div className="mb-8 p-5 bg-yellow-50 border-l-4 border-[#FFC107] rounded-lg">
              <p className="font-bold text-[#F57C00] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                📝 Observations importantes
              </p>
              <p className="text-[#333333]">{comanda.observaciones}</p>
            </div>
          )}

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t-4 border-gray-300">
            <div className="bg-[#E8F5E9] p-5 rounded-lg border-2 border-[#4CAF50]">
              <p className="font-bold text-[#4CAF50] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                ✓ Préparée par
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nom :</strong> {comanda.usuarioCreacion || '_____________________'}</p>
                <p><strong>Date :</strong> {new Date(comanda.fecha).toLocaleDateString(defaultLocale)}</p>
                <p><strong>Heure :</strong> {new Date(comanda.fecha).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="bg-[#E3F2FD] p-5 rounded-lg border-2 border-[#1E73BE]">
              <p className="font-bold text-[#1E73BE] mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                ✓ Reçu par ({organismo?.nombre})
              </p>
              <div className="border-b-2 border-gray-400 mb-3" style={{ height: '60px' }}></div>
              <div className="text-sm text-[#333333] space-y-1">
                <p><strong>Nom :</strong> {personaAutorizada?.nombreCompleto || organismo?.responsable || '_____________________'}</p>
                {personaAutorizada && (
                  <>
                    <p><strong>Fonction :</strong> {personaAutorizada.cargo}</p>
                    <p><strong>Téléphone :</strong> {personaAutorizada.telefono}</p>
                  </>
                )}
                <p><strong>Date :</strong> _____________________</p>
                <p><strong>Heure :</strong> _____________________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 text-center text-xs text-[#666666]">
            <p className="font-medium">Ce document est un reçu officiel de la Banque Alimentaire</p>
            <p className="mt-1">Pour toute question, scannez le code QR ou contactez-nous au (514) 555-0100</p>
            <p className="mt-1">© 2026 Banque Alimentaire - Système de gestion intégral</p>
          </div>
        </div>
      </DialogContent>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 1cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          [role="dialog"] {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          
          [role="dialog"] * {
            visibility: visible;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:max-w-full {
            max-width: 100% !important;
          }
          
          .print\\:max-h-full {
            max-height: none !important;
          }
        }
      `}</style>
    </Dialog>
  );
}