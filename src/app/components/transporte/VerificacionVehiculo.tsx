import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Save, FileText, Calendar, User, Gauge, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { checklistSAAQ, type VerificacionVehiculo, type ItemVerificacion, type EstadoVerificacion, type CategoriaVerificacion } from '../../types/verificacion';
import { guardarVerificacion, generarIdVerificacion, obtenerVerificaciones } from '../../utils/verificacionStorage';
import { limpiarEjemplosFuncionalesPrueba, obtenerResumenEjemplosFuncionalesPrueba, sembrarEjemplosFuncionalesPrueba, type ResumenEjemplos } from '../../utils/ejemplosFuncionalesPrueba';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { obtenerChoferes, obtenerVehiculos, TRANSPORTE_MODULE_EVENT, type Chofer, type Vehiculo } from '../../utils/transporteLogic';
import { useBranding } from '../../../hooks/useBranding';

export function VerificacionVehiculo() {
  const { t } = useTranslation();
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => obtenerVehiculos());
  const [choferes, setChoferes] = useState<Chofer[]>(() => obtenerChoferes());
  const [resumenEjemplos, setResumenEjemplos] = useState<ResumenEjemplos>(() => obtenerResumenEjemplosFuncionalesPrueba());
  const [procesandoEjemplos, setProcesandoEjemplos] = useState(false);
  const [categoriasExpanded, setCategoriasExpanded] = useState<{ [key: string]: boolean }>({
    exterior: true,
    cabina: false,
    motor: false,
    frenos: false,
    luces: false,
    neumaticos: false,
    carga: false,
    documentacion: false,
  });

  const [formData, setFormData] = useState({
    vehiculoId: '',
    conductorId: '',
    tipoVerificacion: 'pre_viaje' as const,
    odometro: 0,
    observacionesGenerales: '',
  });

  const [items, setItems] = useState<ItemVerificacion[]>([]);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [verificaciones, setVerificaciones] = useState<VerificacionVehiculo[]>([]);
  const [verDetalle, setVerDetalle] = useState<VerificacionVehiculo | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  useEffect(() => {
    const refrescarDatosTransporte = () => {
      setVehiculos(obtenerVehiculos());
      setChoferes(obtenerChoferes());
      setResumenEjemplos(obtenerResumenEjemplosFuncionalesPrueba());
    };

    refrescarDatosTransporte();
    window.addEventListener(TRANSPORTE_MODULE_EVENT, refrescarDatosTransporte as EventListener);

    return () => {
      window.removeEventListener(TRANSPORTE_MODULE_EVENT, refrescarDatosTransporte as EventListener);
    };
  }, []);

  const cargarHistorial = () => {
    const historial = obtenerVerificaciones();
    setVerificaciones(historial);
  };

  const obtenerNombreChofer = (chofer?: Chofer | null) => {
    if (!chofer) {
      return '';
    }

    return [chofer.nombre, chofer.apellido].filter(Boolean).join(' ').trim() || chofer.nombre;
  };

  const obtenerDescripcionVehiculo = (vehiculo?: Vehiculo | null) => {
    if (!vehiculo) {
      return '';
    }

    return [vehiculo.placa || vehiculo.matricula, vehiculo.marca, vehiculo.modelo]
      .filter(Boolean)
      .join(' - ')
      .replace(' - ', ' - ');
  };

  const refrescarDatosTransporte = () => {
    setVehiculos(obtenerVehiculos());
    setChoferes(obtenerChoferes());
    setResumenEjemplos(obtenerResumenEjemplosFuncionalesPrueba());
  };

  const ejecutarAccionEjemplos = (accion: 'sembrar' | 'limpiar' | 'actualizar') => {
    setProcesandoEjemplos(true);

    try {
      if (accion === 'sembrar') {
        setResumenEjemplos(sembrarEjemplosFuncionalesPrueba());
      } else if (accion === 'limpiar') {
        setResumenEjemplos(limpiarEjemplosFuncionalesPrueba());
      } else {
        setResumenEjemplos(obtenerResumenEjemplosFuncionalesPrueba());
      }

      setVehiculos(obtenerVehiculos());
      setChoferes(obtenerChoferes());
    } finally {
      setProcesandoEjemplos(false);
    }
  };

  const inicializarItems = () => {
    const nuevosItems: ItemVerificacion[] = [];
    Object.entries(checklistSAAQ).forEach(([categoria, itemsCategoria]) => {
      itemsCategoria.forEach(item => {
        nuevosItems.push({
          id: item.id,
          categoria,
          descripcion: item.descripcion,
          estado: 'conforme',
          observaciones: '',
        });
      });
    });
    setItems(nuevosItems);
  };

  const handleAbrirDialog = () => {
    setFormData({
      vehiculoId: '',
      conductorId: '',
      tipoVerificacion: 'pre_viaje',
      odometro: 0,
      observacionesGenerales: '',
    });
    inicializarItems();
    setDialogOpen(true);
  };

  const toggleCategoria = (categoria: string) => {
    setCategoriasExpanded({
      ...categoriasExpanded,
      [categoria]: !categoriasExpanded[categoria],
    });
  };

  const actualizarEstadoItem = (itemId: string, estado: EstadoVerificacion) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, estado } : item
    ));
  };

  const actualizarObservacionItem = (itemId: string, observaciones: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, observaciones } : item
    ));
  };

  const calcularEstadoGeneral = (): 'apto' | 'apto_con_observaciones' | 'no_apto' => {
    const itemsNoConformes = items.filter(i => i.estado === 'no_conforme');
    const itemsReparar = items.filter(i => i.estado === 'reparar');

    if (itemsNoConformes.length > 0) return 'no_apto';
    if (itemsReparar.length > 0) return 'apto_con_observaciones';
    return 'apto';
  };

  const handleGuardarVerificacion = () => {
    if (!formData.vehiculoId || !formData.conductorId) {
      toast.error(t('transport.saaqVerification.completeRequired'));
      return;
    }

    const vehiculo = vehiculos.find(v => v.id === formData.vehiculoId);
    const conductor = choferes.find(c => c.id === formData.conductorId);

    if (!vehiculo || !conductor) {
      toast.error(t('transport.saaqVerification.vehicleNotFound'));
      return;
    }

    const estadoGeneral = calcularEstadoGeneral();
    const accionesRequeridas = items
      .filter(i => i.estado === 'reparar' || i.estado === 'no_conforme')
      .map(i => `${i.descripcion}: ${i.observaciones || 'Requiere atención'}`);

    const verificacion: VerificacionVehiculo = {
      id: generarIdVerificacion(),
      vehiculoId: formData.vehiculoId,
      vehiculoPlaca: vehiculo.placa,
      conductorId: formData.conductorId,
      conductorNombre: obtenerNombreChofer(conductor),
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      tipoVerificacion: formData.tipoVerificacion,
      odometro: formData.odometro,
      items,
      estadoGeneral,
      observacionesGenerales: formData.observacionesGenerales,
      accionesRequeridas: accionesRequeridas.length > 0 ? accionesRequeridas : undefined,
    };

    const guardado = guardarVerificacion(verificacion);
    
    if (guardado) {
      const mensajes = {
        apto: `✅ ${t('transport.saaqVerification.verificationCompleteApt')}`,
        apto_con_observaciones: `⚠️ ${t('transport.saaqVerification.verificationCompleteAptObs')}`,
        no_apto: `❌ ${t('transport.saaqVerification.verificationCompleteNotApt')}`,
      };
      
      toast.success(mensajes[estadoGeneral]);
      setDialogOpen(false);
      cargarHistorial();
    } else {
      toast.error(t('transport.saaqVerification.saveError'));
    }
  };

  const getCategoriaIcono = (categoria: string) => {
    const iconos: { [key: string]: string } = {
      exterior: '🚗',
      cabina: '🪑',
      motor: '⚙️',
      frenos: '🛑',
      luces: '💡',
      neumaticos: '⚫',
      carga: '📦',
      documentacion: '📄',
    };
    return iconos[categoria] || '✓';
  };

  const getCategoriaProgreso = (categoria: string) => {
    const itemsCategoria = items.filter(i => i.categoria === categoria);
    const itemsConforme = itemsCategoria.filter(i => i.estado === 'conforme');
    return itemsCategoria.length > 0 
      ? Math.round((itemsConforme.length / itemsCategoria.length) * 100)
      : 0;
  };

  const getEstadoBadge = (estado: EstadoVerificacion) => {
    const config = {
      conforme: { bg: 'bg-[#4CAF50]', text: t('transport.saaqVerification.conformStatus'), icon: CheckCircle2 },
      no_conforme: { bg: 'bg-[#DC3545]', text: t('transport.saaqVerification.nonConformStatus'), icon: XCircle },
      reparar: { bg: 'bg-[#FFC107]', text: t('transport.saaqVerification.repairStatus'), icon: AlertTriangle },
    };
    const c = config[estado];
    const Icon = c.icon;
    return (
      <Badge className={`${c.bg} hover:${c.bg} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {c.text}
      </Badge>
    );
  };

  const getEstadoTexto = (estado: EstadoVerificacion) => {
    const config = {
      conforme: t('transport.saaqVerification.conformStatus'),
      no_conforme: t('transport.saaqVerification.nonConformStatus'),
      reparar: t('transport.saaqVerification.repairStatus'),
    };
    return config[estado];
  };

  const getEstadoGeneralBadge = (estado: 'apto' | 'apto_con_observaciones' | 'no_apto') => {
    const config = {
      apto: { bg: 'bg-[#4CAF50]', text: t('transport.saaqVerification.apt') },
      apto_con_observaciones: { bg: 'bg-[#FFC107]', text: t('transport.saaqVerification.aptWithObservations') },
      no_apto: { bg: 'bg-[#DC3545]', text: t('transport.saaqVerification.notApt') },
    };
    const c = config[estado];
    return <Badge className={`${c.bg} hover:${c.bg} text-white text-sm px-3 py-1`}>{c.text}</Badge>;
  };

  const getEstadoGeneralTexto = (estado: 'apto' | 'apto_con_observaciones' | 'no_apto') => {
    const config = {
      apto: t('transport.saaqVerification.apt'),
      apto_con_observaciones: t('transport.saaqVerification.aptWithObservations'),
      no_apto: t('transport.saaqVerification.notApt'),
    };
    return config[estado];
  };

  const getTipoVerificacionTexto = (tipo: 'pre_viaje' | 'post_viaje' | 'mensual') => {
    if (tipo === 'pre_viaje') {
      return t('transport.saaqVerification.preTrip');
    }
    if (tipo === 'post_viaje') {
      return t('transport.saaqVerification.postTrip');
    }
    return t('transport.saaqVerification.monthly');
  };

  const getCategoriaLabel = (categoria: string) => {
    return t(`transport.saaqVerification.categories.${categoria}`, categoria);
  };

  const choferesActivos = choferes.filter(c => c.estado === 'activo');

  const progresoTotal = items.length > 0 
    ? Math.round((items.filter(i => i.estado === 'conforme').length / items.length) * 100)
    : 0;

  const esperarRenderImpresion = () => new Promise<void>((resolve) => {
    const completar = () => window.setTimeout(resolve, 180);

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(completar);
      });
      return;
    }

    window.setTimeout(resolve, 250);
  });

  const handleDescargarPDF = async () => {
    // La verificacion de vehiculo siempre se imprime en modo completo.
    document.body.setAttribute('data-print-mode', 'completo');
    
    // Expandir todas las categorías antes de imprimir
    const todasExpandidas: { [key: string]: boolean } = {};
    Object.keys(checklistSAAQ).forEach(cat => {
      todasExpandidas[cat] = true;
    });
    setCategoriasExpanded(todasExpandidas);

    const limpiarModoImpresion = () => {
      document.body.removeAttribute('data-print-mode');
    };

    window.addEventListener('afterprint', limpiarModoImpresion, { once: true });

    await esperarRenderImpresion();
    window.print();

    window.setTimeout(() => {
      limpiarModoImpresion();
    }, 1500);
  };

  // Efecto para expandir todas las categorías cuando se abre el diálogo de detalle
  useEffect(() => {
    if (detalleOpen) {
      const todasExpandidas: { [key: string]: boolean } = {};
      Object.keys(checklistSAAQ).forEach(cat => {
        todasExpandidas[cat] = true;
      });
      setCategoriasExpanded(todasExpandidas);
    }
  }, [detalleOpen]);

  const renderDocumentoImpresion = () => {
    if (!verDetalle) {
      return null;
    }

    const vehiculoDetalle = vehiculos.find(v => v.id === verDetalle.vehiculoId);
    const tituloVehiculo = vehiculoDetalle
      ? obtenerDescripcionVehiculo(vehiculoDetalle)
      : verDetalle.vehiculoPlaca;
    const itemsConformes = verDetalle.items.filter(i => i.estado === 'conforme').length;
    const itemsReparar = verDetalle.items.filter(i => i.estado === 'reparar').length;
    const itemsNoConformes = verDetalle.items.filter(i => i.estado === 'no_conforme').length;
    const itemsProblema = itemsReparar + itemsNoConformes;
    const fechaImpresion = new Date(`${verDetalle.fecha}T00:00:00`).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const actionsRequises = verDetalle.accionesRequeridas || [];

    return (
      <div data-verificacion-print-root className="print-verificacion-root">
        <style>
          {`
            .print-verificacion-root {
              position: fixed;
              inset: 0;
              pointer-events: none;
              opacity: 0;
              z-index: -1;
            }

            .print-verificacion-documento {
              width: 190mm;
              margin: 0 auto;
              padding: 10mm 10mm 8mm;
              background: #ffffff;
              color: #0f172a;
              font-family: 'Montserrat', 'Segoe UI', sans-serif;
              font-size: 12pt;
              line-height: 1.5;
            }

            .print-verificacion-documento-shell {
              border: 1px solid #d9e2ec;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            }

            .print-verificacion-documento-header {
              display: grid;
              grid-template-columns: minmax(0, 1.5fr) minmax(185px, 0.8fr);
              gap: 14px;
              padding: 14px 16px 12px;
              background:
                radial-gradient(circle at top right, rgba(76, 175, 80, 0.18), transparent 34%),
                linear-gradient(135deg, #eff6ff 0%, #ffffff 62%, #f8fff6 100%);
              border-bottom: 1px solid #dbe7f3;
            }

            .print-verificacion-documento-kicker {
              margin: 0 0 4px;
              font-size: 10pt;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              color: #145ca1;
            }

            .print-verificacion-documento-subtitulo {
              margin: 0;
              font-size: 12pt;
              line-height: 1.6;
              color: #334155;
            }

            .print-verificacion-documento-encabezado {
              margin: 8px 0 2px;
              font-size: 22pt;
              line-height: 1.08;
              font-weight: 700;
              color: #0f1f33;
            }

            .print-verificacion-documento-titulo {
              margin: 10px 0 6px;
              font-size: 16pt;
              line-height: 1.35;
              font-weight: 700;
              color: #0f172a;
            }

            .print-verificacion-documento-resumen-header {
              margin: 0;
              font-size: 12pt;
              line-height: 1.6;
              color: #243447;
            }

            .print-verificacion-documento-status {
              display: flex;
              flex-direction: column;
              gap: 10px;
              align-self: stretch;
              padding: 12px 14px;
              border-radius: 16px;
              background: linear-gradient(180deg, rgba(8, 23, 43, 1) 0%, rgba(14, 42, 74, 1) 100%);
              border: 1px solid rgba(255, 255, 255, 0.12);
              color: #f8fbff;
            }

            .print-verificacion-documento-status-label {
              margin: 0;
              font-size: 10pt;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: rgba(255, 255, 255, 0.82);
            }

            .print-verificacion-documento-status-value {
              margin: 2px 0 0;
              font-size: 18pt;
              line-height: 1.15;
              font-weight: 700;
              color: #ffffff;
            }

            .print-verificacion-documento-badges {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
            }

            .print-verificacion-documento-badge {
              display: inline-flex;
              align-items: center;
              padding: 7px 11px;
              border-radius: 999px;
              border: 1px solid rgba(255, 255, 255, 0.24);
              background: rgba(255, 255, 255, 0.16);
              font-size: 10pt;
              font-weight: 700;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              color: #ffffff;
            }

            .print-verificacion-documento-badge--estado {
              background: rgba(76, 175, 80, 0.28);
              border-color: rgba(76, 175, 80, 0.45);
            }

            .print-verificacion-documento-meta {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 10px;
              padding: 12px 16px 0;
            }

            .print-verificacion-documento-meta-card,
            .print-verificacion-documento-resumen div,
            .print-verificacion-documento-footer-card {
              border: 1px solid #dbe4ee;
              border-radius: 14px;
              background: #f9fbfd;
              padding: 10px 12px;
            }

            .print-verificacion-documento-meta-card span,
            .print-verificacion-documento-resumen span,
            .print-verificacion-documento-footer-card span {
              display: block;
              font-size: 12pt;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #475569;
            }

            .print-verificacion-documento-meta-card strong,
            .print-verificacion-documento-resumen strong,
            .print-verificacion-documento-footer-card strong {
              display: block;
              margin-top: 5px;
              font-size: 12pt;
              line-height: 1.45;
              color: #0f172a;
            }

            .print-verificacion-documento-resumen {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 10px;
              padding: 12px 16px 0;
            }

            .print-verificacion-documento-resumen div {
              position: relative;
              overflow: hidden;
            }

            .print-verificacion-documento-resumen div::before {
              content: '';
              position: absolute;
              inset: 0 auto 0 0;
              width: 4px;
              border-radius: 14px 0 0 14px;
              background: #1e73be;
            }

            .print-verificacion-documento-resumen div:nth-child(2)::before {
              background: #4caf50;
            }

            .print-verificacion-documento-resumen div:nth-child(3)::before {
              background: #f5a524;
            }

            .print-verificacion-documento-resumen div:nth-child(4)::before {
              background: #dc3545;
            }

            .print-verificacion-documento-notas {
              display: grid;
              grid-template-columns: ${actionsRequises.length > 0 && verDetalle.observacionesGenerales ? '1.15fr 0.85fr' : '1fr'};
              gap: 10px;
              padding: 12px 16px 0;
            }

            .print-verificacion-documento-nota {
              border: 1px solid #ead9b2;
              border-radius: 14px;
              background: linear-gradient(180deg, #fff8e8 0%, #fffdf7 100%);
              padding: 11px 12px;
            }

            .print-verificacion-documento-nota--observaciones {
              border-color: #c8ddf4;
              background: linear-gradient(180deg, #f3f8ff 0%, #fbfdff 100%);
            }

            .print-verificacion-documento-nota-titulo {
              margin: 0 0 6px;
              font-size: 12pt;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #7b5b15;
            }

            .print-verificacion-documento-nota--observaciones .print-verificacion-documento-nota-titulo {
              color: #1e73be;
            }

            .print-verificacion-documento-nota p:last-child,
            .print-verificacion-documento-nota ul {
              margin: 0;
              font-size: 12pt;
              line-height: 1.6;
              color: #1f2f43;
            }

            .print-verificacion-documento-nota ul {
              padding-left: 16px;
            }

            .print-verificacion-documento-categorias {
              columns: 2;
              column-gap: 12px;
              padding: 12px 16px 14px;
            }

            .print-verificacion-documento-categoria {
              break-inside: avoid;
              margin-bottom: 12px;
              border: 1px solid #dbe4ee;
              border-radius: 14px;
              overflow: hidden;
              background: #ffffff;
            }

            .print-verificacion-documento-categoria-header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 12px;
              padding: 10px 12px;
              background: linear-gradient(180deg, #f7fbff 0%, #eff5fb 100%);
              border-bottom: 1px solid #dbe4ee;
            }

            .print-verificacion-documento-categoria-header h3 {
              margin: 0;
              font-size: 13pt;
              line-height: 1.35;
              font-weight: 800;
              color: #10253d;
            }

            .print-verificacion-documento-categoria-header p {
              margin: 3px 0 0;
              font-size: 12pt;
              color: #334155;
            }

            .print-verificacion-documento-tabla {
              display: grid;
            }

            .print-verificacion-documento-fila {
              display: grid;
              grid-template-columns: minmax(0, 1.55fr) 0.72fr minmax(0, 1fr);
              gap: 8px;
              align-items: start;
              padding: 8px 12px;
              border-bottom: 1px solid #eef2f7;
            }

            .print-verificacion-documento-fila:last-child {
              border-bottom: none;
            }

            .print-verificacion-documento-fila--cabecera {
              padding-top: 8px;
              padding-bottom: 8px;
              background: #f8fafc;
              font-size: 12pt;
              font-weight: 800;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              color: #334155;
            }

            .print-verificacion-documento-fila--conforme {
              background: rgba(76, 175, 80, 0.05);
            }

            .print-verificacion-documento-fila--reparar {
              background: rgba(255, 193, 7, 0.09);
            }

            .print-verificacion-documento-fila--no_conforme {
              background: rgba(220, 53, 69, 0.08);
            }

            .print-verificacion-documento-col {
              font-size: 12pt;
              line-height: 1.6;
              color: #162436;
            }

            .print-verificacion-documento-col--descripcion {
              font-weight: 700;
              color: #0f172a;
            }

            .print-verificacion-documento-col--estado {
              font-weight: 800;
              color: #0b1f36;
            }

            .print-verificacion-documento-col--observacion {
              color: #243447;
            }

            .print-verificacion-documento-footer {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              padding: 0 16px 16px;
            }

            .print-verificacion-documento-footer-card {
              min-height: 72px;
            }

            .print-verificacion-documento-footer-card em {
              display: block;
              margin-top: 22px;
              border-top: 1px solid #cfd8e3;
            }

            @page {
              size: auto;
              margin: 8mm;
            }

            @media print {
              html,
              body {
                background: #ffffff !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }

              body[data-print-mode='completo'] > :not([data-verificacion-print-root]) {
                display: none !important;
              }

              body[data-print-mode='completo'] [data-verificacion-print-root] {
                position: static !important;
                inset: auto !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                z-index: auto !important;
              }

              .print-verificacion-documento {
                width: 100%;
                padding: 0;
              }

              .print-verificacion-documento-shell {
                box-shadow: none;
              }
            }
          `}
        </style>
        <div className="print-verificacion-documento">
          <div className="print-verificacion-documento-shell">
            <div className="print-verificacion-documento-header">
              <div>
                <p className="print-verificacion-documento-kicker">{nombreSistemaImpresion}</p>
                {brandingContactLine && (
                  <p className="print-verificacion-documento-subtitulo">{brandingContactLine}</p>
                )}
                <h1 className="print-verificacion-documento-encabezado">Verification de vehicule SAAQ</h1>
                <p className="print-verificacion-documento-subtitulo">Modele d'impression compact, professionnel et archive</p>
                <h2 className="print-verificacion-documento-titulo">{tituloVehiculo}</h2>
                <p className="print-verificacion-documento-resumen-header">
                  Controle realise par {verDetalle.conductorNombre} le {fechaImpresion} a {verDetalle.hora}. Document concu pour impression rapide, lecture terrain et classement administratif.
                </p>
              </div>
              <div className="print-verificacion-documento-status">
                <div>
                  <p className="print-verificacion-documento-status-label">Statut final</p>
                  <p className="print-verificacion-documento-status-value">{getEstadoGeneralTexto(verDetalle.estadoGeneral)}</p>
                </div>
                <div className="print-verificacion-documento-badges">
                  <span className="print-verificacion-documento-badge">
                    {getTipoVerificacionTexto(verDetalle.tipoVerificacion)}
                  </span>
                  <span className="print-verificacion-documento-badge print-verificacion-documento-badge--estado">
                    {itemsProblema} point{itemsProblema > 1 ? 's' : ''} a traiter
                  </span>
                </div>
              </div>
            </div>

            <div className="print-verificacion-documento-meta">
              <div className="print-verificacion-documento-meta-card">
                <span>Chauffeur</span>
                <strong>{verDetalle.conductorNombre}</strong>
              </div>
              <div className="print-verificacion-documento-meta-card">
                <span>Date et heure</span>
                <strong>{fechaImpresion} • {verDetalle.hora}</strong>
              </div>
              <div className="print-verificacion-documento-meta-card">
                <span>Odometre</span>
                <strong>{verDetalle.odometro.toLocaleString()} km</strong>
              </div>
              <div className="print-verificacion-documento-meta-card">
                <span>Plaque</span>
                <strong>{verDetalle.vehiculoPlaca}</strong>
              </div>
            </div>

            <div className="print-verificacion-documento-resumen">
              <div>
                <span>Points controles</span>
                <strong>{verDetalle.items.length}</strong>
              </div>
              <div>
                <span>Conformes</span>
                <strong>{itemsConformes}</strong>
              </div>
              <div>
                <span>A reparer</span>
                <strong>{itemsReparar}</strong>
              </div>
              <div>
                <span>Non conformes</span>
                <strong>{itemsNoConformes}</strong>
              </div>
            </div>

            {(actionsRequises.length > 0) || verDetalle.observacionesGenerales ? (
              <div className="print-verificacion-documento-notas">
                {actionsRequises.length > 0 && (
                  <div className="print-verificacion-documento-nota">
                    <p className="print-verificacion-documento-nota-titulo">
                      {t('transport.saaqVerification.requiredActions')}
                    </p>
                    <ul>
                      {actionsRequises.map((accion, idx) => (
                        <li key={`print-action-${idx}`}>{accion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {verDetalle.observacionesGenerales && (
                  <div className="print-verificacion-documento-nota print-verificacion-documento-nota--observaciones">
                    <p className="print-verificacion-documento-nota-titulo">
                      {t('transport.saaqVerification.observations')}
                    </p>
                    <p>{verDetalle.observacionesGenerales}</p>
                  </div>
                )}
              </div>
            ) : null}

            <div className="print-verificacion-documento-categorias">
              {Object.keys(checklistSAAQ).map((categoria) => {
                const itemsCategoria = verDetalle.items.filter(i => i.categoria === categoria);
                const itemsCategoriaConformes = itemsCategoria.filter(i => i.estado === 'conforme').length;
                const itemsConObservaciones = itemsCategoria.length - itemsCategoriaConformes;

                return (
                  <section key={`print-${categoria}`} className="print-verificacion-documento-categoria">
                    <div className="print-verificacion-documento-categoria-header">
                      <div>
                        <h3>{getCategoriaIcono(categoria)} {getCategoriaLabel(categoria)}</h3>
                        <p>
                          {itemsCategoria.length} {t('transport.saaqVerification.elements')} • {itemsCategoriaConformes} OK • {itemsConObservaciones} a revoir
                        </p>
                      </div>
                      <div>
                        <p>{Math.round((itemsCategoriaConformes / Math.max(itemsCategoria.length, 1)) * 100)}% conforme</p>
                      </div>
                    </div>
                    <div className="print-verificacion-documento-tabla">
                      <div className="print-verificacion-documento-fila print-verificacion-documento-fila--cabecera">
                        <span>Point controle</span>
                        <span>Etat</span>
                        <span>Observation</span>
                      </div>
                      {itemsCategoria.map((item) => (
                        <div
                          key={`print-item-${item.id}`}
                          className={`print-verificacion-documento-fila print-verificacion-documento-fila--${item.estado}`}
                        >
                          <span className="print-verificacion-documento-col print-verificacion-documento-col--descripcion">
                            {item.descripcion}
                          </span>
                          <span className="print-verificacion-documento-col print-verificacion-documento-col--estado">
                            {getEstadoTexto(item.estado)}
                          </span>
                          <span className="print-verificacion-documento-col print-verificacion-documento-col--observacion">
                            {item.observaciones && item.observaciones.trim() !== '' ? item.observaciones : 'Aucune remarque'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="print-verificacion-documento-footer">
              <div className="print-verificacion-documento-footer-card">
                <span>Validation du conducteur</span>
                <strong>{verDetalle.conductorNombre}</strong>
                <em aria-hidden="true" />
              </div>
              <div className="print-verificacion-documento-footer-card">
                <span>Validation responsable transport</span>
                <strong>{nombreSistemaImpresion}</strong>
                <em aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {typeof document !== 'undefined' && verDetalle ? createPortal(renderDocumentoImpresion(), document.body) : null}
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            🔍 {t('transport.saaqVerification.title')}
          </h2>
          <p className="text-[#666666]">{t('transport.saaqVerification.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setHistorialOpen(true)}
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('transport.saaqVerification.history')} ({verificaciones.length})
          </Button>
          <Button 
            onClick={handleAbrirDialog} 
            className="bg-[#1E73BE] hover:bg-[#1557A0]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            {t('transport.saaqVerification.newVerification')}
          </Button>
        </div>
      </div>

      <Card className="border-2 border-dashed border-[#1E73BE]/40 bg-gradient-to-r from-[#F4F9FF] to-[#F8FFF4]">
        <CardHeader className="pb-3">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Exemples de test transport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#666666]">
            Chargez ici des chauffeurs et camions de démonstration pour tester la vérification sans passer par les autres écrans.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-[#666666]">Camions démo</p>
              <p className="text-2xl font-bold text-[#1E73BE]">{resumenEjemplos.camiones}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-[#666666]">Chauffeurs démo</p>
              <p className="text-2xl font-bold text-[#1E73BE]">{resumenEjemplos.chauffeurs}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-[#666666]">Véhicules disponibles</p>
              <p className="text-2xl font-bold text-[#4CAF50]">{vehiculos.length}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-[#666666]">Chauffeurs disponibles</p>
              <p className="text-2xl font-bold text-[#4CAF50]">{choferesActivos.length}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => ejecutarAccionEjemplos('sembrar')}
              disabled={procesandoEjemplos}
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Charger des exemples
            </Button>
            <Button
              variant="outline"
              onClick={() => ejecutarAccionEjemplos('actualizar')}
              disabled={procesandoEjemplos}
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={() => ejecutarAccionEjemplos('limpiar')}
              disabled={procesandoEjemplos}
              className="border-[#DC3545] text-[#DC3545] hover:bg-red-50"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              Supprimer les exemples
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Últimas verificaciones */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('transport.saaqVerification.recentVerifications')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verificaciones.length === 0 ? (
            <div className="text-center py-8 text-[#666666]">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('transport.saaqVerification.noVerifications')}</p>
              <p className="text-sm">{t('transport.saaqVerification.firstVerification')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verificaciones.slice(0, 5).map(ver => {
                const vehiculo = vehiculos.find(v => v.id === ver.vehiculoId);
                return (
                  <div key={ver.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-8 h-8 text-[#1E73BE]" />
                      <div>
                        <p className="font-medium">{ver.vehiculoPlaca} - {vehiculo?.marca} {vehiculo?.modelo}</p>
                        <p className="text-sm text-[#666666]">
                          {ver.conductorNombre} • {new Date(ver.fecha).toLocaleDateString('es-ES')} {ver.hora}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-200 text-gray-700">
                        {ver.tipoVerificacion === 'pre_viaje' ? t('transport.saaqVerification.preTrip') : ver.tipoVerificacion === 'post_viaje' ? t('transport.saaqVerification.postTrip') : t('transport.saaqVerification.monthly')}
                      </Badge>
                      {getEstadoGeneralBadge(ver.estadoGeneral)}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#E3F2FD]"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                        onClick={() => {
                          setVerDetalle(ver);
                          setDetalleOpen(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {t('transport.saaqVerification.viewDetails')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo Nueva Verificación */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="verificacion-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              🔍 {t('transport.saaqVerification.newVerificationSAAQ')}
            </DialogTitle>
            <DialogDescription id="verificacion-dialog-description">
              {t('transport.saaqVerification.inspectionDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <Card className="border-2 border-[#1E73BE]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.saaqVerification.verificationInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.vehicle')} *</Label>
                  <Select value={formData.vehiculoId} onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.saaqVerification.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {vehiculos.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.driver')} *</Label>
                  <Select value={formData.conductorId} onValueChange={(value) => setFormData({ ...formData, conductorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('transport.saaqVerification.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {choferesActivos.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {obtenerNombreChofer(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {vehiculos.length === 0 && (
                  <p className="text-xs text-[#DC3545] md:col-span-2">
                    Aucun véhicule disponible. Utilisez « Charger des exemples » pour créer des données de test.
                  </p>
                )}

                {choferesActivos.length === 0 && (
                  <p className="text-xs text-[#DC3545] md:col-span-2">
                    Aucun chauffeur actif disponible. Utilisez « Charger des exemples » pour créer des données de test.
                  </p>
                )}

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.verificationType')} *</Label>
                  <Select value={formData.tipoVerificacion} onValueChange={(value: any) => setFormData({ ...formData, tipoVerificacion: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_viaje">{t('transport.saaqVerification.preTrip')}</SelectItem>
                      <SelectItem value="post_viaje">{t('transport.saaqVerification.postTrip')}</SelectItem>
                      <SelectItem value="mensual">{t('transport.saaqVerification.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('transport.saaqVerification.odometer')} *</Label>
                  <Input
                    type="number"
                    value={formData.odometro || ''}
                    onChange={(e) => setFormData({ ...formData, odometro: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Progreso General */}
            <div className="bg-gradient-to-r from-[#1E73BE] to-[#4CAF50] p-4 rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('transport.saaqVerification.inspectionProgress')}
                </span>
                <span className="text-2xl font-bold">{progresoTotal}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-300"
                  style={{ width: `${progresoTotal}%` }}
                />
              </div>
            </div>

            {/* Checklist por Categorías */}
            <div className="space-y-3">
              {Object.keys(checklistSAAQ).map((categoria) => {
                const itemsCategoria = items.filter(i => i.categoria === categoria);
                const progreso = getCategoriaProgreso(categoria);
                const expanded = categoriasExpanded[categoria];

                return (
                  <Card key={categoria} className="border-l-4 border-l-[#1E73BE]">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                      onClick={() => toggleCategoria(categoria)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoriaIcono(categoria)}</span>
                          <div>
                            <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {getCategoriaLabel(categoria)}
                            </CardTitle>
                            <p className="text-xs text-[#666666] mt-1">
                              {itemsCategoria.length} {t('transport.saaqVerification.elements')} • {progreso}% {t('transport.saaqVerification.completed')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#4CAF50] rounded-full h-2 transition-all"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardHeader>

                    {expanded && (
                      <CardContent className="space-y-3">
                        {itemsCategoria.map((item) => (
                          <div key={item.id} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium flex-1">{item.descripcion}</p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant={item.estado === 'conforme' ? 'default' : 'outline'}
                                  className={item.estado === 'conforme' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'conforme')}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={item.estado === 'reparar' ? 'default' : 'outline'}
                                  className={item.estado === 'reparar' ? 'bg-[#FFC107] hover:bg-[#e6ad06]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'reparar')}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={item.estado === 'no_conforme' ? 'default' : 'outline'}
                                  className={item.estado === 'no_conforme' ? 'bg-[#DC3545] hover:bg-[#c82333]' : ''}
                                  onClick={() => actualizarEstadoItem(item.id, 'no_conforme')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {item.estado !== 'conforme' && (
                              <Input
                                placeholder={t('transport.saaqVerification.observationsPlaceholder')}
                                value={item.observaciones || ''}
                                onChange={(e) => actualizarObservacionItem(item.id, e.target.value)}
                                className="text-sm"
                              />
                            )}
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Observaciones Generales */}
            <div className="space-y-2">
              <Label>{t('transport.saaqVerification.generalObservations')}</Label>
              <Textarea
                placeholder={t('transport.saaqVerification.additionalComments')}
                value={formData.observacionesGenerales}
                onChange={(e) => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                rows={3}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('transport.saaqVerification.cancel')}
              </Button>
              <Button 
                onClick={handleGuardarVerificacion} 
                className="bg-[#4CAF50] hover:bg-[#45a049]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <Save className="w-4 h-4 mr-2" />
                {t('transport.saaqVerification.saveVerification')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Historial */}
      <Dialog open={historialOpen} onOpenChange={setHistorialOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="historial-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📋 {t('transport.saaqVerification.verificationHistory')}
            </DialogTitle>
            <DialogDescription id="historial-dialog-description">
              {t('transport.saaqVerification.completeRecord')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verificaciones.map(ver => {
              const vehiculo = vehiculos.find(v => v.id === ver.vehiculoId);
              const itemsNoConformes = ver.items.filter(i => i.estado === 'no_conforme');
              const itemsReparar = ver.items.filter(i => i.estado === 'reparar');

              return (
                <Card key={ver.id} className="border-l-4 border-l-[#1E73BE]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {ver.vehiculoPlaca} - {vehiculo?.marca} {vehiculo?.modelo}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(ver.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {ver.hora}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {ver.conductorNombre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Gauge className="w-4 h-4" />
                            {ver.odometro.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getEstadoGeneralBadge(ver.estadoGeneral)}
                        <Badge className="bg-gray-200 text-gray-700">
                          {ver.tipoVerificacion === 'pre_viaje' ? t('transport.saaqVerification.preTrip') : ver.tipoVerificacion === 'post_viaje' ? t('transport.saaqVerification.postTrip') : t('transport.saaqVerification.monthly')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Resumen */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#4CAF50]">
                          {ver.items.filter(i => i.estado === 'conforme').length}
                        </p>
                        <p className="text-xs text-[#666666]">{t('transport.saaqVerification.conform')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#FFC107]">
                          {itemsReparar.length}
                        </p>
                        <p className="text-xs text-[#666666]">{t('transport.saaqVerification.toRepair')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#DC3545]">
                          {itemsNoConformes.length}
                        </p>
                        <p className="text-xs text-[#666666]">{t('transport.saaqVerification.nonConform')}</p>
                      </div>
                    </div>

                    {/* Acciones Requeridas */}
                    {ver.accionesRequeridas && ver.accionesRequeridas.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800 mb-2">⚠️ {t('transport.saaqVerification.requiredActions')}:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {ver.accionesRequeridas.map((accion, idx) => (
                            <li key={`accion-ver-${ver.vehiculoId}-${idx}`}>{accion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Observaciones */}
                    {ver.observacionesGenerales && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm">📝 <strong>{t('transport.saaqVerification.observations')}:</strong> {ver.observacionesGenerales}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Detalle */}
      <Dialog open={detalleOpen} onOpenChange={setDetalleOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="detalle-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📋 {t('transport.saaqVerification.verificationDetail')}
            </DialogTitle>
            <DialogDescription id="detalle-dialog-description">
              {t('transport.saaqVerification.completeDetails')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verDetalle && (
              <>
                <Card key={verDetalle.id} className="border-l-4 border-l-[#1E73BE] print-verificacion-detalle print:hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {(() => {
                          const vehiculo = vehiculos.find(v => v.id === verDetalle.vehiculoId);
                          return vehiculo ? obtenerDescripcionVehiculo(vehiculo) : verDetalle.vehiculoPlaca;
                        })()}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-[#666666]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(verDetalle.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {verDetalle.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {verDetalle.conductorNombre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-4 h-4" />
                          {verDetalle.odometro.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getEstadoGeneralBadge(verDetalle.estadoGeneral)}
                      <Badge className="bg-gray-200 text-gray-700">
                        {getTipoVerificacionTexto(verDetalle.tipoVerificacion)}
                      </Badge>
                      <div className="flex gap-2 print:hidden">
                        <Badge className="bg-[#1E73BE] text-white hover:bg-[#1E73BE]">
                          {t('transport.saaqVerification.complete')}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={handleDescargarPDF}
                          className="bg-[#1E73BE] hover:bg-[#1557A0]"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          {t('transport.saaqVerification.print')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Resumen */}
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg print-verificacion-resumen-grid">
                    <div className="text-center print-verificacion-resumen-card print-verificacion-resumen-card--conforme">
                      <p className="text-2xl font-bold text-[#4CAF50]">
                        {verDetalle.items.filter(i => i.estado === 'conforme').length}
                      </p>
                      <p className="text-xs text-[#666666]">{t('transport.saaqVerification.conform')}</p>
                    </div>
                    <div className="text-center print-verificacion-resumen-card print-verificacion-resumen-card--reparar">
                      <p className="text-2xl font-bold text-[#FFC107]">
                        {verDetalle.items.filter(i => i.estado === 'reparar').length}
                      </p>
                      <p className="text-xs text-[#666666]">{t('transport.saaqVerification.toRepair')}</p>
                    </div>
                    <div className="text-center print-verificacion-resumen-card print-verificacion-resumen-card--no-conforme">
                      <p className="text-2xl font-bold text-[#DC3545]">
                        {verDetalle.items.filter(i => i.estado === 'no_conforme').length}
                      </p>
                      <p className="text-xs text-[#666666]">{t('transport.saaqVerification.nonConform')}</p>
                    </div>
                  </div>

                  {/* Acciones Requeridas */}
                  {verDetalle.accionesRequeridas && verDetalle.accionesRequeridas.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800 mb-2">⚠️ {t('transport.saaqVerification.requiredActions')}:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {verDetalle.accionesRequeridas.map((accion, idx) => (
                          <li key={`accion-detalle-${verDetalle.id}-${idx}`}>{accion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Observaciones */}
                  {verDetalle.observacionesGenerales && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm">📝 <strong>{t('transport.saaqVerification.observations')}:</strong> {verDetalle.observacionesGenerales}</p>
                    </div>
                  )}

                  {/* Checklist por Categorías */}
                  <div className="space-y-3 print-verificacion-checklist">
                    {Object.keys(checklistSAAQ).map((categoria) => {
                      const itemsCategoria = verDetalle.items.filter(i => i.categoria === categoria);
                      const itemsConProblemas = itemsCategoria.filter(i => i.estado !== 'conforme');
                      const tieneProblemas = itemsConProblemas.length > 0;
                      const progreso = getCategoriaProgreso(categoria);
                      const expanded = categoriasExpanded[categoria];

                      return (
                        <Card 
                          key={categoria} 
                          className={`print-verificacion-categoria border-l-4 border-l-[#1E73BE] ${!tieneProblemas ? 'print-categoria-sin-problemas' : ''}`}
                        >
                          <CardHeader 
                            className="print-verificacion-categoria-header cursor-pointer hover:bg-gray-50 transition-colors pb-3"
                            onClick={() => toggleCategoria(categoria)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getCategoriaIcono(categoria)}</span>
                                <div>
                                  <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {getCategoriaLabel(categoria)}
                                  </CardTitle>
                                  <p className="text-xs text-[#666666] mt-1">
                                    {itemsCategoria.length} {t('transport.saaqVerification.elements')} • {progreso}% {t('transport.saaqVerification.completed')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2 print-verificacion-progreso">
                                  <div 
                                    className="bg-[#4CAF50] rounded-full h-2 transition-all print-verificacion-progreso-fill"
                                    style={{ width: `${progreso}%` }}
                                  />
                                </div>
                                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </div>
                          </CardHeader>

                          {expanded && (
                            <CardContent className="space-y-3">
                              {itemsCategoria.map((item) => (
                                <div 
                                  key={item.id} 
                                  className={`print-verificacion-item p-3 border rounded-lg bg-gray-50 ${item.estado === 'conforme' ? 'print-ocultar-conforme' : 'print-solo-problemas'}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="text-sm font-medium flex-1">{item.descripcion}</p>
                                    <div className="flex gap-1 print:hidden">
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'conforme' ? 'default' : 'outline'}
                                        className={item.estado === 'conforme' ? 'bg-[#4CAF50] hover:bg-[#45a049]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'conforme')}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'reparar' ? 'default' : 'outline'}
                                        className={item.estado === 'reparar' ? 'bg-[#FFC107] hover:bg-[#e6ad06]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'reparar')}
                                      >
                                        <AlertTriangle className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={item.estado === 'no_conforme' ? 'default' : 'outline'}
                                        className={item.estado === 'no_conforme' ? 'bg-[#DC3545] hover:bg-[#c82333]' : ''}
                                        onClick={() => actualizarEstadoItem(item.id, 'no_conforme')}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {/* Estado visible solo en PDF */}
                                    <div className="hidden print:block ml-2 print-verificacion-estado">
                                      {getEstadoBadge(item.estado)}
                                    </div>
                                  </div>
                                  {item.observaciones && item.observaciones.trim() !== '' && (
                                    <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                                      <strong>{t('transport.saaqVerification.observations')}:</strong> {item.observaciones}
                                    </div>
                                  )}
                                  {item.estado !== 'conforme' && (
                                    <Input
                                      placeholder={t('transport.saaqVerification.observationsPlaceholder')}
                                      value={item.observaciones || ''}
                                      onChange={(e) => actualizarObservacionItem(item.id, e.target.value)}
                                      className="text-sm print:hidden"
                                    />
                                  )}
                                </div>
                              ))}
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
                </Card>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}