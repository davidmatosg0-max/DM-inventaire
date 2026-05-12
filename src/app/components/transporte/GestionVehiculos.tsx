import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Truck, Wrench, Gauge, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { registrarActividad } from '../../utils/actividadLogger';
import { TRANSPORTE_MODULE_EVENT, TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT, actualizarVehiculo, crearVehiculo, eliminarVehiculo, obtenerChoferes, obtenerVehiculos, type Chofer, type Vehiculo } from '../../utils/transporteLogic';

export function GestionVehiculos() {
  const { t } = useTranslation();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => obtenerVehiculos());
  const [conductores, setConductores] = useState<Chofer[]>(() => obtenerChoferes());
  const [vehiculoDialogOpen, setVehiculoDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const recargarVehiculos = () => {
      setVehiculos(obtenerVehiculos());
      setConductores(obtenerChoferes());
    };

    window.addEventListener(TRANSPORTE_MODULE_EVENT, recargarVehiculos);
    return () => {
      window.removeEventListener(TRANSPORTE_MODULE_EVENT, recargarVehiculos);
    };
  }, []);

  const obtenerEstadoVehiculoUI = (vehiculo: Vehiculo) => {
    if (vehiculo.estadoUI) {
      return vehiculo.estadoUI;
    }

    if (vehiculo.activo === false) {
      return 'fuera_servicio';
    }

    return vehiculo.estado === 'en_ruta' ? 'en_uso' : vehiculo.estado;
  };

  const obtenerNombreChofer = (chofer?: Chofer | null) => chofer ? `${chofer.nombre} ${chofer.apellido}`.trim() : '';

  const [formVehiculo, setFormVehiculo] = useState({
    tipo: 'camion' as 'camion' | 'camioneta' | 'furgoneta' | 'refrigerado',
    marca: '',
    modelo: '',
    placa: '',
    capacidadKg: 0,
    capacidadM3: 0,
    anio: new Date().getFullYear(),
    estado: 'disponible' as 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio',
    conductorAsignado: '',
    ultimoMantenimiento: '',
    proximoMantenimiento: '',
    kilometraje: 0,
    consumoCombustible: 0,
    notas: ''
  });

  const vehiculosFiltrados = vehiculos.filter(v =>
    (v.placa || v.matricula || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.modelo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoIcon = (tipo: string) => {
    const icons = {
      camion: '🚛',
      camioneta: '🚐',
      furgoneta: '🚚',
      refrigerado: '❄️'
    };
    return icons[tipo as keyof typeof icons] || '🚛';
  };

  const getEstadoBadge = (estado: string) => {
    const config = {
      disponible: { bg: 'bg-[#4CAF50]', text: t('transport.vehicles.available_state') },
      en_uso: { bg: 'bg-[#1E73BE]', text: t('transport.vehicles.in_use') },
      mantenimiento: { bg: 'bg-[#FFC107]', text: t('transport.vehicles.maintenance') },
      fuera_servicio: { bg: 'bg-[#DC3545]', text: t('transport.vehicles.out_of_service') }
    }[estado] || { bg: 'bg-gray-500', text: estado };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const handleAbrirCreacion = () => {
    setFormVehiculo({
      tipo: 'camion',
      marca: '',
      modelo: '',
      placa: '',
      capacidadKg: 0,
      capacidadM3: 0,
      anio: new Date().getFullYear(),
      estado: 'disponible',
      conductorAsignado: '',
      ultimoMantenimiento: '',
      proximoMantenimiento: '',
      kilometraje: 0,
      consumoCombustible: 0,
      notas: ''
    });
    setModoEdicion(false);
    setVehiculoSeleccionado(null);
    setVehiculoDialogOpen(true);
  };

  useEffect(() => {
    const abrirDialogRapido = () => {
      handleAbrirCreacion();
    };

    window.addEventListener(TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT, abrirDialogRapido);
    return () => {
      window.removeEventListener(TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT, abrirDialogRapido);
    };
  }, []);

  const handleAbrirEdicion = (vehiculo: Vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setFormVehiculo({
      tipo: vehiculo.tipo,
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      placa: vehiculo.placa || vehiculo.matricula || '',
      capacidadKg: vehiculo.capacidadKg,
      capacidadM3: vehiculo.capacidadM3,
      anio: vehiculo.anio || new Date().getFullYear(),
      estado: obtenerEstadoVehiculoUI(vehiculo),
      conductorAsignado: vehiculo.conductorAsignado || '',
      ultimoMantenimiento: vehiculo.ultimoMantenimiento || '',
      proximoMantenimiento: vehiculo.proximoMantenimiento || '',
      kilometraje: vehiculo.kilometraje || vehiculo.kmActual || 0,
      consumoCombustible: vehiculo.consumoCombustible || 0,
      notas: vehiculo.notas || ''
    });
    setModoEdicion(true);
    setVehiculoDialogOpen(true);
  };

  const handleGuardarVehiculo = () => {
    if (!formVehiculo.marca || !formVehiculo.modelo || !formVehiculo.placa) {
      toast.error(t('transport.vehicles.completeRequiredFields'));
      return;
    }

    const conductorAsignado = formVehiculo.conductorAsignado === 'none' ? '' : formVehiculo.conductorAsignado;
    const payload = {
      matricula: formVehiculo.placa.trim(),
      placa: formVehiculo.placa.trim(),
      tipo: formVehiculo.tipo,
      marca: formVehiculo.marca.trim(),
      modelo: formVehiculo.modelo.trim(),
      capacidadKg: formVehiculo.capacidadKg,
      capacidadM3: formVehiculo.capacidadM3,
      estado: formVehiculo.estado === 'en_uso'
        ? 'en_ruta'
        : formVehiculo.estado === 'fuera_servicio'
          ? 'mantenimiento'
          : formVehiculo.estado,
      estadoUI: formVehiculo.estado,
      activo: formVehiculo.estado !== 'fuera_servicio',
      observaciones: formVehiculo.notas.trim(),
      notas: formVehiculo.notas.trim(),
      ultimoMantenimiento: formVehiculo.ultimoMantenimiento || undefined,
      proximoMantenimiento: formVehiculo.proximoMantenimiento || undefined,
      kmActual: formVehiculo.kilometraje,
      kilometraje: formVehiculo.kilometraje,
      conductorAsignado,
      anio: formVehiculo.anio,
      consumoCombustible: formVehiculo.consumoCombustible,
    } as const;

    if (modoEdicion && vehiculoSeleccionado) {
      const actualizado = actualizarVehiculo(vehiculoSeleccionado.id, payload);
      if (!actualizado) {
        return;
      }

      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'modificar',
        `Véhicule "${formVehiculo.placa}" (${formVehiculo.marca} ${formVehiculo.modelo}) mis à jour`,
        { 
          placa: formVehiculo.placa, 
          marca: formVehiculo.marca, 
          modelo: formVehiculo.modelo,
          estado: formVehiculo.estado 
        }
      );
    } else {
      const creado = crearVehiculo(payload);
      if (!creado) {
        return;
      }

      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'crear',
        `Nouveau véhicule "${formVehiculo.placa}" (${formVehiculo.marca} ${formVehiculo.modelo}) ajouté`,
        { 
          placa: formVehiculo.placa, 
          marca: formVehiculo.marca, 
          modelo: formVehiculo.modelo,
          capacidadKg: formVehiculo.capacidadKg,
          capacidadM3: formVehiculo.capacidadM3
        }
      );
    }

    setVehiculos(obtenerVehiculos());
    setVehiculoDialogOpen(false);
  };

  const handleEliminarVehiculo = () => {
    if (vehiculoAEliminar) {
      const eliminado = eliminarVehiculo(vehiculoAEliminar.id);
      if (!eliminado) {
        return;
      }

      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'eliminar',
        `Véhicule "${vehiculoAEliminar.placa}" (${vehiculoAEliminar.marca} ${vehiculoAEliminar.modelo}) supprimé`,
        { 
          placa: vehiculoAEliminar.placa, 
          marca: vehiculoAEliminar.marca, 
          modelo: vehiculoAEliminar.modelo 
        }
      );
      setVehiculos(obtenerVehiculos());
      setDeleteDialogOpen(false);
      setVehiculoAEliminar(null);
    }
  };

  const stats = {
    total: vehiculos.filter(v => v.activo).length,
    disponibles: vehiculos.filter(v => obtenerEstadoVehiculoUI(v) === 'disponible').length,
    enUso: vehiculos.filter(v => obtenerEstadoVehiculoUI(v) === 'en_uso').length,
    mantenimiento: vehiculos.filter(v => obtenerEstadoVehiculoUI(v) === 'mantenimiento').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            {t('transport.vehicles.title')}
          </h2>
          <p className="text-[#666666]">{t('transport.vehicles.subtitle')}</p>
        </div>
        <Button onClick={handleAbrirCreacion} className="bg-[#4CAF50] hover:bg-[#45a049]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('transport.vehicles.addVehicle')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#333333]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.vehicles.total')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#333333' }}>
                  {stats.total}
                </p>
              </div>
              <Truck className="w-8 h-8 text-[#333333]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.vehicles.available')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>
                  {stats.disponibles}
                </p>
              </div>
              <Truck className="w-8 h-8 text-[#4CAF50]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.vehicles.inUse')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#1E73BE' }}>
                  {stats.enUso}
                </p>
              </div>
              <Truck className="w-8 h-8 text-[#1E73BE]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('transport.vehicles.maintenance')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: '#FFC107' }}>
                  {stats.mantenimiento}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-[#FFC107]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder={t('transport.vehicles.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehiculosFiltrados.map(vehiculo => {
          const conductor = conductores.find((usuario) => usuario.id === vehiculo.conductorAsignado);
          const estadoVehiculo = obtenerEstadoVehiculoUI(vehiculo);
          const diasProximoMantenimiento = vehiculo.proximoMantenimiento
            ? Math.ceil((new Date(vehiculo.proximoMantenimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <Card key={vehiculo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl bg-gradient-to-br from-[#1E73BE] to-[#1557A0]"
                    >
                      {getTipoIcon(vehiculo.tipo)}
                    </div>
                    <div>
                      <CardTitle className="mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                        {vehiculo.placa || vehiculo.matricula}
                      </CardTitle>
                      <p className="text-sm text-[#666666]">
                        {vehiculo.marca || 'N/A'} {vehiculo.modelo || ''}
                      </p>
                    </div>
                  </div>
                  {getEstadoBadge(estadoVehiculo)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[#666666]">{t('transport.vehicles.capacity')}</p>
                    <p className="font-medium">{vehiculo.capacidadKg.toLocaleString()} {t('transport.vehicles.km').replace('km', 'kg')}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">{t('transport.vehicles.volume')}</p>
                    <p className="font-medium">{vehiculo.capacidadM3} m³</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">{t('transport.vehicles.year')}</p>
                    <p className="font-medium">{vehiculo.anio || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#666666]">{t('transport.vehicles.mileage')}</p>
                    <p className="font-medium">{(vehiculo.kilometraje || 0).toLocaleString()} {t('transport.vehicles.km')}</p>
                  </div>
                </div>

                {conductor && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-[#666666]">{t('transport.vehicles.assignedDriver')}</p>
                    <p className="text-sm font-medium">{obtenerNombreChofer(conductor)}</p>
                  </div>
                )}

                {diasProximoMantenimiento !== null && diasProximoMantenimiento <= 30 && (
                  <div className={`flex items-center gap-2 p-2 rounded ${
                    diasProximoMantenimiento <= 7 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs">
                      {t('transport.vehicles.maintenanceIn')} {diasProximoMantenimiento} {t('transport.vehicles.days')}
                    </p>
                  </div>
                )}

                {vehiculo.notas && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-[#666666]">{t('transport.vehicles.notes')}</p>
                    <p className="text-sm">{vehiculo.notas}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAbrirEdicion(vehiculo)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#DC3545]"
                    onClick={() => {
                      setVehiculoAEliminar(vehiculo);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={estadoVehiculo === 'en_uso'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo Crear/Editar Vehículo */}
      <Dialog open={vehiculoDialogOpen} onOpenChange={setVehiculoDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="vehiculo-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? t('transport.vehicles.editVehicle') : t('transport.vehicles.addVehicle')}
            </DialogTitle>
            <DialogDescription id="vehiculo-description">
              {t('transport.vehicles.vehicleDetails')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('transport.vehicles.basicInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.type')} *</Label>
                  <Select value={formVehiculo.tipo} onValueChange={(value: any) => setFormVehiculo({ ...formVehiculo, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camion">🚛 {t('transport.vehicles.truck')}</SelectItem>
                      <SelectItem value="camioneta">🚐 {t('transport.vehicles.van')}</SelectItem>
                      <SelectItem value="furgoneta">🚚 {t('transport.vehicles.furgoneta')}</SelectItem>
                      <SelectItem value="refrigerado">❄️ {t('transport.vehicles.refrigerated')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.plate')} *</Label>
                  <Input
                    placeholder="ABC-123"
                    value={formVehiculo.placa}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, placa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.brand')} *</Label>
                  <Input
                    placeholder="Mercedes-Benz"
                    value={formVehiculo.marca}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.model')} *</Label>
                  <Input
                    placeholder="Actros 2546"
                    value={formVehiculo.modelo}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.year')} *</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={formVehiculo.anio}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, anio: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.status')} *</Label>
                  <Select value={formVehiculo.estado} onValueChange={(value: any) => setFormVehiculo({ ...formVehiculo, estado: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">{t('transport.vehicles.available_state')}</SelectItem>
                      <SelectItem value="en_uso">{t('transport.vehicles.in_use')}</SelectItem>
                      <SelectItem value="mantenimiento">{t('transport.vehicles.maintenance')}</SelectItem>
                      <SelectItem value="fuera_servicio">{t('transport.vehicles.out_of_service')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Capacidad y Especificaciones */}
            <div className="space-y-4">
              <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('transport.vehicles.capacity')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.capacityKg')} *</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formVehiculo.capacidadKg}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, capacidadKg: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.capacityM3')} *</Label>
                  <Input
                    type="number"
                    placeholder="45"
                    value={formVehiculo.capacidadM3}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, capacidadM3: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.fuelConsumption')} ({t('transport.vehicles.litersPer100')})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    value={formVehiculo.consumoCombustible}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, consumoCombustible: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div className="space-y-4">
              <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('transport.vehicles.maintenanceInfo')}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.mileage')}</Label>
                  <Input
                    type="number"
                    placeholder="45000"
                    value={formVehiculo.kilometraje}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, kilometraje: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.lastMaintenance')}</Label>
                  <Input
                    type="date"
                    value={formVehiculo.ultimoMantenimiento}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, ultimoMantenimiento: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('transport.vehicles.nextMaintenance')}</Label>
                  <Input
                    type="date"
                    value={formVehiculo.proximoMantenimiento}
                    onChange={(e) => setFormVehiculo({ ...formVehiculo, proximoMantenimiento: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Conductor y Notas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('transport.vehicles.assignedDriver')}</Label>
                <Select value={formVehiculo.conductorAsignado} onValueChange={(value) => setFormVehiculo({ ...formVehiculo, conductorAsignado: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transport.selectDriver')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('transport.selectDriver')}</SelectItem>
                    {conductores.map(conductor => (
                      <SelectItem key={conductor.id} value={conductor.id}>
                        {obtenerNombreChofer(conductor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('transport.vehicles.notes')}</Label>
                <Textarea
                  placeholder={t('transport.vehicles.notes')}
                  value={formVehiculo.notas}
                  onChange={(e) => setFormVehiculo({ ...formVehiculo, notas: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setVehiculoDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleGuardarVehiculo} className="bg-[#4CAF50] hover:bg-[#45a049]">
                {modoEdicion ? t('common.update') : t('common.add')} {t('transport.vehicle')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('transport.vehicles.deleteVehicle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {vehiculoAEliminar && (
                <div className="space-y-3">
                  <p>{t('transport.vehicles.deleteConfirm')} <strong>{vehiculoAEliminar.placa}</strong>?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ {t('transport.vehicles.deleteWarning')}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarVehiculo}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.delete')} {t('transport.vehicle')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}