import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Tag, Calendar, Building2, AlertCircle, CheckCircle2, 
  Package, DollarSign, Scale, X, Users, Globe, FileText, ChefHat
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { Checkbox } from '../ui/checkbox';
import { crearOferta, type ProductoOferta } from '../../utils/ofertaStorage';
import { guardarNotificacionOferta, crearNotificacionNuevaOferta } from '../../utils/notificacionStorage';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
import { calcularValorDistribucionProducto } from '../../utils/distributionValue';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

interface DialogCrearOfertaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  productos: any[];
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
  onOfertaCreada: () => void;
}

export function DialogCrearOferta({
  open,
  onOpenChange,
  carrito,
  productos,
  categoriasInfo,
  onOfertaCreada
}: DialogCrearOfertaProps) {
  const { t } = useTranslation();
  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(carrito.map(item => item.productoId)),
    [carrito]
  );

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [destinatarioTipo, setDestinatarioTipo] = useState<'todos' | 'especificos'>('todos');
  const [organismosSeleccionados, setOrganismosSeleccionados] = useState<string[]>([]);
  const [filtrarPorTipoAsistencia, setFiltrarPorTipoAsistencia] = useState(false);
  const [tiposAsistenciaSeleccionados, setTiposAsistenciaSeleccionados] = useState<string[]>([]);

  // Limite maxéquitable par organisme (par produit)
  const [limiteEquitableActivo, setLimiteEquitableActivo] = useState(false);
  const [limitesPorProducto, setLimitesPorProducto] = useState<Record<string, number>>({});

  const usuarioActual = t('inventory.offerDialog.systemUser');
  const organismosActivos = obtenerOrganismos().filter(organismo => organismo.activo);

  // Reiniciar formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setTitulo('');
      setDescripcion('');
      setFechaExpiracion('');
      setDestinatarioTipo('todos');
      setOrganismosSeleccionados([]);
      setFiltrarPorTipoAsistencia(false);
      setTiposAsistenciaSeleccionados([]);
      setLimiteEquitableActivo(false);
      setLimitesPorProducto({});
    }
  }, [open]);

  // Calcular productos de la oferta
  const productosOferta: ProductoOferta[] = carrito.map(item => {
    const producto = productos.find(p => p.id === item.productoId);
    const categoriaInfo = categoriasInfo[producto?.categoria || ''];
    const valorDistribucion = calcularValorDistribucionProducto(producto, 1);
    
    return {
      productoId: item.productoId,
      productoNombre: producto?.nombre || '',
      productoCodigo: producto?.codigo || '',
      categoria: producto?.categoria || '',
      subcategoria: producto?.subcategoria || '',
      cantidadOfrecida: item.cantidad,
      cantidadDisponible: item.cantidad,
      unidad: producto?.unidad || '',
      peso: producto?.peso || producto?.pesoUnitario || 0,
      valorUnitario: valorDistribucion.valorUnitario,
      icono: producto?.icono || categoriaInfo?.icono || '📦',
      limiteMaximoPorOrganismo: limiteEquitableActivo && limitesPorProducto[item.productoId] && limitesPorProducto[item.productoId] > 0
        ? limitesPorProducto[item.productoId]
        : undefined
    };
  });

  // Calcular totales
  const totales = {
    totalProductos: productosOferta.length,
    totalItems: productosOferta.reduce((sum, p) => sum + p.cantidadOfrecida, 0),
    totalKilos: productosOferta.reduce((sum, p) => {
      if (p.unidad === 'kg') {
        return sum + p.cantidadOfrecida;
      }
      return sum + (p.cantidadOfrecida * p.peso);
    }, 0),
    valorMonetarioTotal: productosOferta.reduce((sum, p) => 
      sum + (p.cantidadOfrecida * p.valorUnitario), 0
    )
  };

  // Toggle selección de organismo
  const toggleOrganismo = (organismoId: string) => {
    setOrganismosSeleccionados(prev => 
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  // Toggle selección de tipo de asistencia
  const toggleTipoAsistencia = (tipo: string) => {
    setTiposAsistenciaSeleccionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!titulo.trim()) {
      toast.error(t('inventory.offerDialog.errors.titleRequired'));
      return false;
    }
    if (!fechaExpiracion) {
      toast.error(t('inventory.offerDialog.errors.expirationRequired'));
      return false;
    }
    const fechaExp = new Date(fechaExpiracion);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaExp < hoy) {
      toast.error(t('inventory.offerDialog.errors.expirationMustBeFuture'));
      return false;
    }
    if (destinatarioTipo === 'especificos' && organismosSeleccionados.length === 0) {
      toast.error(t('inventory.offerDialog.errors.selectOrganization'));
      return false;
    }
    if (filtrarPorTipoAsistencia && tiposAsistenciaSeleccionados.length === 0) {
      toast.error(t('inventory.offerDialog.errors.selectAssistanceType'));
      return false;
    }
    return true;
  };

  // Crear oferta
  const handleCrearOferta = () => {
    if (!validarFormulario()) return;

    try {
      const oferta = crearOferta({
        titulo,
        descripcion,
        fechaExpiracion: new Date(fechaExpiracion).toISOString(),
        creadoPor: usuarioActual,
        productos: productosOferta,
        organismosDestino: destinatarioTipo === 'todos' ? 'todos' : organismosSeleccionados,
        tipoAsistencia: filtrarPorTipoAsistencia ? tiposAsistenciaSeleccionados : [],
        totalProductos: totales.totalProductos,
        totalKilos: totales.totalKilos,
        valorMonetarioTotal: totales.valorMonetarioTotal,
        visible: true,
        activa: true
      });

      toast.success(
        <div>
          <p className="font-semibold mb-1">{t('inventory.offerDialog.toasts.createdTitle')}</p>
          <p className="text-sm">{oferta.numeroOferta}</p>
          <p className="text-sm">
            {destinatarioTipo === 'todos' 
              ? t('inventory.offerDialog.toasts.visibleForAll') 
              : t('inventory.offerDialog.toasts.visibleForSpecific', { count: organismosSeleccionados.length })}
          </p>
        </div>,
        { duration: 5000 }
      );

      // Guardar notificaciones para los organismos seleccionados
      if (destinatarioTipo === 'todos') {
        // Enviar notificación a todos los organismos activos
        organismosActivos.forEach(organismo => {
          const notificacion = crearNotificacionNuevaOferta(
            oferta.id,
            oferta.numeroOferta,
            organismo.id,
            titulo,
            totales.totalProductos,
            totales.valorMonetarioTotal
          );
          guardarNotificacionOferta(notificacion);
        });
      } else {
        // Enviar notificación solo a organismos seleccionados
        organismosSeleccionados.forEach(organismoId => {
          const notificacion = crearNotificacionNuevaOferta(
            oferta.id,
            oferta.numeroOferta,
            organismoId,
            titulo,
            totales.totalProductos,
            totales.valorMonetarioTotal
          );
          guardarNotificacionOferta(notificacion);
        });
      }

      onOfertaCreada();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('inventory.offerDialog.errors.createOffer'));
      console.error(error);
    }
  };

  const tiposAsistenciaUnicos = Array.from(
    new Set(
      organismosActivos
        .map(organismo => organismo.tipoAsistencia)
        .filter((tipo): tipo is string => typeof tipo === 'string' && tipo.length > 0)
    )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="crear-oferta-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#FFC107] to-[#FF9800] flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            {`🏷️ ${t('inventory.offerDialog.title')}`}
          </DialogTitle>
          <DialogDescription id="crear-oferta-description">
            {t('inventory.offerDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4 space-y-6">
          {/* Información básica */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <FileText className="w-5 h-5 text-[#1E73BE]" />
                {t('inventory.offerDialog.basicInfoTitle')}
              </h3>

              <div className="space-y-2">
                <Label htmlFor="titulo">{t('inventory.offerDialog.offerTitleLabel')}</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={t('inventory.offerDialog.offerTitlePlaceholder')}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">{t('inventory.offerDialog.offerDescriptionLabel')}</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={t('inventory.offerDialog.offerDescriptionPlaceholder')}
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaExpiracion">{t('inventory.offerDialog.expirationLabel')}</Label>
                <Input
                  id="fechaExpiracion"
                  type="date"
                  value={fechaExpiracion}
                  onChange={(e) => setFechaExpiracion(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen de productos */}
          <Card className="border-2 border-[#4CAF50]">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Package className="w-5 h-5 text-[#4CAF50]" />
                {t('inventory.offerDialog.includedProductsTitle')}
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="border-l-4 border-l-[#1E73BE]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#1E73BE]" />
                      <div>
                        <p className="text-xs text-gray-600">{t('inventory.offerDialog.items')}</p>
                        <p className="font-bold text-[#1E73BE]">{formatQuantity(totales.totalItems)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-[#4CAF50]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                      <div>
                        <p className="text-xs text-gray-600">{t('inventory.offerDialog.value')}</p>
                        <p className="font-bold text-[#4CAF50]">CAD$ {formatMoney(totales.valorMonetarioTotal)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-[#FFC107]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#FFC107]" />
                      <div>
                        <p className="text-xs text-gray-600">{t('inventory.offerDialog.weight')}</p>
                        <p className="font-bold text-[#FFC107]">{formatQuantity(totales.totalKilos)} kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {productosOferta.map((producto, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{producto.icono}</span>
                      <div>
                        <p className="font-semibold text-sm">{producto.productoNombre}</p>
                        <p className="text-xs text-gray-600">{producto.productoCodigo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('inventory.offerDialog.reservable')} {reservasInventario[producto.productoId]?.disponibleParaReservar || 0} {producto.unidad}
                          {' · '}
                          {t('inventory.offerDialog.reserved')} {reservasInventario[producto.productoId]?.totalReservado || 0} {producto.unidad}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#1E73BE] text-white">
                        {formatQuantity(producto.cantidadOfrecida)} {producto.unidad}
                      </Badge>
                      <Badge className="bg-[#4CAF50] text-white">
                        CAD$ {formatMoney(producto.cantidadOfrecida * producto.valorUnitario)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Limite équitable par organisme */}
          <Card className="border-2 border-[#9C27B0]">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Scale className="w-5 h-5 text-[#9C27B0]" />
                Limite équitable par organisme
              </h3>

              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  limiteEquitableActivo
                    ? 'border-[#9C27B0] bg-[#F3E5F5]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setLimiteEquitableActivo(prev => !prev)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={limiteEquitableActivo}
                    onCheckedChange={(checked) => setLimiteEquitableActivo(Boolean(checked))}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Activer une quantité maximale par organisme</p>
                    <p className="text-sm text-gray-600">
                      Chaque organisme ne pourra réserver, au total, qu'au plus la quantité indiquée pour chaque produit. Cela permet une distribution plus équitable.
                    </p>
                  </div>
                </div>
              </div>

              {limiteEquitableActivo && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto border-t pt-3">
                  {productosOferta.map((producto) => (
                    <div
                      key={producto.productoId}
                      className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl">{producto.icono}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{producto.productoNombre}</p>
                          <p className="text-xs text-gray-500">
                            Disponible : {formatQuantity(producto.cantidadOfrecida)} {producto.unidad}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={producto.cantidadOfrecida}
                          step={1}
                          value={limitesPorProducto[producto.productoId] ?? ''}
                          onChange={(e) => {
                            const valor = e.target.value;
                            setLimitesPorProducto(prev => {
                              const next = { ...prev };
                              if (valor === '') {
                                delete next[producto.productoId];
                              } else {
                                next[producto.productoId] = Math.max(1, Math.min(producto.cantidadOfrecida, Number(valor) || 0));
                              }
                              return next;
                            });
                          }}
                          placeholder="—"
                          className="w-24 text-right"
                        />
                        <span className="text-xs text-gray-600 w-12">{producto.unidad}</span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 italic">
                    Laisser vide pour ne pas appliquer de limite à ce produit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destinatarios */}
          <Card className="border-2 border-[#FFC107]">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Users className="w-5 h-5 text-[#FFC107]" />
                {t('inventory.offerDialog.recipientsTitle')}
              </h3>

              <div className="space-y-3">
                {/* Opción: Todos los organismos */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    destinatarioTipo === 'todos' 
                      ? 'border-[#4CAF50] bg-[#E8F5E9]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDestinatarioTipo('todos')}
                >
                  <div className="flex items-center gap-3">
                    <Globe className={`w-6 h-6 ${destinatarioTipo === 'todos' ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="font-semibold">{t('inventory.offerDialog.allOrganizationsTitle')}</p>
                      <p className="text-sm text-gray-600">{t('inventory.offerDialog.allOrganizationsDescription')}</p>
                    </div>
                    {destinatarioTipo === 'todos' && (
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>
                </div>

                {/* Opción: Organismos específicos */}
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    destinatarioTipo === 'especificos' 
                      ? 'border-[#1E73BE] bg-[#E3F2FD]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setDestinatarioTipo('especificos')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-6 h-6 ${destinatarioTipo === 'especificos' ? 'text-[#1E73BE]' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="font-semibold">{t('inventory.offerDialog.specificOrganizationsTitle')}</p>
                      <p className="text-sm text-gray-600">{t('inventory.offerDialog.specificOrganizationsDescription')}</p>
                    </div>
                    {destinatarioTipo === 'especificos' && (
                      <CheckCircle2 className="w-5 h-5 text-[#1E73BE]" />
                    )}
                  </div>

                  {destinatarioTipo === 'especificos' && (
                    <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto border-t pt-3">
                      {organismosActivos.map(organismo => (
                        <div 
                          key={organismo.id}
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-md cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrganismo(organismo.id);
                          }}
                        >
                          <Checkbox
                            checked={organismosSeleccionados.includes(organismo.id)}
                            onCheckedChange={() => toggleOrganismo(organismo.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{organismo.nombre}</p>
                            <p className="text-xs text-gray-600">
                              {(organismo.tipoAsistencia || organismo.tipo || t('inventory.offerDialog.unclassified'))} • {organismo.frecuenciaCita || t('inventory.offerDialog.noFrequency')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filtro por tipo de asistencia */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      checked={filtrarPorTipoAsistencia}
                      onCheckedChange={(checked) => setFiltrarPorTipoAsistencia(checked as boolean)}
                    />
                    <Label className="cursor-pointer" onClick={() => setFiltrarPorTipoAsistencia(!filtrarPorTipoAsistencia)}>
                      {t('inventory.offerDialog.filterByAssistanceType')}
                    </Label>
                  </div>

                  {filtrarPorTipoAsistencia && (
                    <div className="flex flex-wrap gap-2 pl-6">
                      {tiposAsistenciaUnicos.map(tipo => (
                        <Badge
                          key={tipo}
                          variant={tiposAsistenciaSeleccionados.includes(tipo) ? 'default' : 'outline'}
                          className={`cursor-pointer ${
                            tiposAsistenciaSeleccionados.includes(tipo)
                              ? 'bg-[#1E73BE] text-white'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => toggleTipoAsistencia(tipo)}
                        >
                          {tipo}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje informativo */}
          <Card className="border-l-4 border-l-[#1E73BE] bg-[#E3F2FD]">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#1E73BE] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#1E73BE] mb-1">{t('inventory.offerDialog.aboutTitle')}</p>
                  <ul className="text-gray-700 space-y-1 list-disc list-inside">
                    <li>{t('inventory.offerDialog.aboutItem1')}</li>
                    <li>{t('inventory.offerDialog.aboutItem2')}</li>
                    <li>{t('inventory.offerDialog.aboutItem3')}</li>
                    <li>{t('inventory.offerDialog.aboutItem4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            {t('inventory.offerDialog.cancel')}
          </Button>
          <Button 
            onClick={handleCrearOferta}
            className="bg-[#FFC107] hover:bg-[#FFA000] text-gray-900"
          >
            <Tag className="w-4 h-4 mr-2" />
            {t('inventory.offerDialog.createButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}