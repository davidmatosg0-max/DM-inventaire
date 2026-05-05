import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  IdCard,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { registrarActividad } from '../../utils/actividadLogger';
import { TRANSPORTE_MODULE_EVENT, actualizarChofer, crearChofer, eliminarChofer as eliminarChoferTransporte, obtenerChoferes, obtenerVehiculos, type Chofer, type Vehiculo } from '../../utils/transporteLogic';

interface GestionChoferesProps {
  compactMode?: boolean;
}

export function GestionChoferes({ compactMode = false }: GestionChoferesProps) {
  const { t } = useTranslation();
  const [choferes, setChoferes] = useState<Chofer[]>(() => obtenerChoferes());
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => obtenerVehiculos());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [choferActual, setChoferActual] = useState<Chofer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    const recargarDatos = () => {
      setChoferes(obtenerChoferes());
      setVehiculos(obtenerVehiculos());
    };

    window.addEventListener(TRANSPORTE_MODULE_EVENT, recargarDatos);
    return () => {
      window.removeEventListener(TRANSPORTE_MODULE_EVENT, recargarDatos);
    };
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    licencia: '',
    tipoLicencia: 'Clase 5',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    fechaContratacion: '',
    estado: 'activo' as 'activo' | 'inactivo' | 'vacaciones',
    vehiculoAsignado: '',
    experienciaAnios: 0,
    certificaciones: [] as string[],
    foto: '👤',
    joursDisponibles: [] as JourDisponible[]
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      licencia: '',
      tipoLicencia: 'Clase 5',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      fechaContratacion: '',
      estado: 'activo',
      vehiculoAsignado: '',
      experienciaAnios: 0,
      certificaciones: [],
      foto: '👤',
      joursDisponibles: []
    });
    setEditando(false);
    setChoferActual(null);
  };

  const abrirDialogNuevo = () => {
    resetForm();
    setDialogOpen(true);
  };

  const abrirDialogEditar = (chofer: Chofer) => {
    setFormData({
      nombre: chofer.nombre,
      apellido: chofer.apellido,
      cedula: chofer.cedula,
      licencia: chofer.licencia,
      tipoLicencia: chofer.tipoLicencia,
      telefono: chofer.telefono,
      email: chofer.email,
      fechaNacimiento: chofer.fechaNacimiento,
      fechaContratacion: chofer.fechaContratacion,
      estado: chofer.estado,
      vehiculoAsignado: chofer.vehiculoAsignado || '',
      experienciaAnios: chofer.experienciaAnios,
      certificaciones: chofer.certificaciones,
      foto: chofer.foto || '👤',
      joursDisponibles: chofer.joursDisponibles || []
    });
    setChoferActual(chofer);
    setEditando(true);
    setDialogOpen(true);
  };

  const obtenerNombreVehiculo = (vehiculo?: Vehiculo | null) => {
    if (!vehiculo) {
      return '';
    }

    return `${vehiculo.placa || vehiculo.matricula} - ${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim();
  };

  const guardarChofer = () => {
    if (!formData.nombre || !formData.apellido || !formData.cedula || !formData.licencia) {
      toast.error(t('transport.driversManagement.fillRequiredFields'));
      return;
    }

    if (editando && choferActual) {
      const actualizado = actualizarChofer(choferActual.id, formData);
      if (!actualizado) {
        return;
      }
      setChoferes(obtenerChoferes());
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'modificar',
        `Chauffeur "${formData.nombre} ${formData.apellido}" mis à jour - Licence: ${formData.licencia}`,
        { 
          choferId: choferActual.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          licencia: formData.licencia,
          estado: formData.estado
        }
      );
      toast.success(`✅ ${t('transport.driversManagement.driverUpdated')}: ${formData.nombre} ${formData.apellido}`);
    } else {
      const nuevoChofer = crearChofer(formData);
      if (!nuevoChofer) {
        return;
      }
      setChoferes(obtenerChoferes());
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'crear',
        `Nouveau chauffeur "${formData.nombre} ${formData.apellido}" enregistré - Licence: ${formData.licencia}`,
        { 
          choferId: nuevoChofer.id,
          nombre: formData.nombre,
          apellido: formData.apellido,
          licencia: formData.licencia,
          tipoLicencia: formData.tipoLicencia
        }
      );
      toast.success(`✅ ${t('transport.driversManagement.driverRegistered')}: ${formData.nombre} ${formData.apellido}`);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEliminarChofer = (id: string) => {
    const chofer = choferes.find(c => c.id === id);
    if (window.confirm(t('transport.driversManagement.confirmDelete', { name: `${chofer?.nombre} ${chofer?.apellido}` }))) {
      const eliminado = eliminarChoferTransporte(id);
      if (!eliminado) {
        return;
      }
      setChoferes(obtenerChoferes());
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Transport',
        'eliminar',
        `Chauffeur "${chofer?.nombre} ${chofer?.apellido}" supprimé - Licence: ${chofer?.licencia}`,
        { 
          choferId: id,
          nombre: chofer?.nombre,
          apellido: chofer?.apellido,
          licencia: chofer?.licencia
        }
      );
      toast.success(t('transport.driversManagement.driverDeleted'));
    }
  };

  const choferesFiltrados = choferes.filter(chofer => {
    const matchSearch = 
      chofer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chofer.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chofer.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chofer.licencia.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filtroEstado === 'todos' || chofer.estado === filtroEstado;
    
    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-[#4CAF50] text-white"><CheckCircle className="h-3 w-3 mr-1" /> {t('transport.driversManagement.active')}</Badge>;
      case 'inactivo':
        return <Badge className="bg-[#DC3545] text-white"><XCircle className="h-3 w-3 mr-1" /> {t('transport.driversManagement.inactive')}</Badge>;
      case 'vacaciones':
        return <Badge className="bg-[#FFC107] text-white"><Calendar className="h-3 w-3 mr-1" /> {t('transport.driversManagement.onVacation')}</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const estadisticas = {
    total: choferes.length,
    activos: choferes.filter(c => c.estado === 'activo').length,
    inactivos: choferes.filter(c => c.estado === 'inactivo').length,
    vacaciones: choferes.filter(c => c.estado === 'vacaciones').length
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className={`${compactMode ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}`}>
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className={compactMode ? 'p-3' : 'pt-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${compactMode ? 'text-[11px]' : 'text-sm'} text-[#666666]`}>{t('transport.driversManagement.totalDrivers')}</p>
                <p className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold text-[#1E73BE]`}>{estadisticas.total}</p>
              </div>
              <User className={`${compactMode ? 'h-5 w-5' : 'h-8 w-8'} text-[#1E73BE]`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className={compactMode ? 'p-3' : 'pt-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${compactMode ? 'text-[11px]' : 'text-sm'} text-[#666666]`}>{t('transport.driversManagement.active')}</p>
                <p className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold text-[#4CAF50]`}>{estadisticas.activos}</p>
              </div>
              <CheckCircle className={`${compactMode ? 'h-5 w-5' : 'h-8 w-8'} text-[#4CAF50]`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className={compactMode ? 'p-3' : 'pt-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${compactMode ? 'text-[11px]' : 'text-sm'} text-[#666666]`}>{t('transport.driversManagement.onVacation')}</p>
                <p className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold text-[#FFC107]`}>{estadisticas.vacaciones}</p>
              </div>
              <Calendar className={`${compactMode ? 'h-5 w-5' : 'h-8 w-8'} text-[#FFC107]`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#DC3545]">
          <CardContent className={compactMode ? 'p-3' : 'pt-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${compactMode ? 'text-[11px]' : 'text-sm'} text-[#666666]`}>{t('transport.driversManagement.inactive')}</p>
                <p className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold text-[#DC3545]`}>{estadisticas.inactivos}</p>
              </div>
              <XCircle className={`${compactMode ? 'h-5 w-5' : 'h-8 w-8'} text-[#DC3545]`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de choferes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              👨‍✈️ {t('transport.driversManagement.title')}
            </CardTitle>
            <Button
              onClick={abrirDialogNuevo}
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('transport.driversManagement.addDriver')}
            </Button>
          </div>

          {/* Filtros */}
          <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${compactMode ? 'mt-3' : 'mt-4'}`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
              <Input
                placeholder={t('transport.driversManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('transport.driversManagement.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t('transport.driversManagement.allStatuses')}</SelectItem>
                <SelectItem value="activo">{t('transport.driversManagement.active')}</SelectItem>
                <SelectItem value="vacaciones">{t('transport.driversManagement.onVacation')}</SelectItem>
                <SelectItem value="inactivo">{t('transport.driversManagement.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {compactMode ? (
            <div className="space-y-3">
              {choferesFiltrados.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-8 text-center">
                  <User className="mx-auto h-10 w-10 text-[#999999]" />
                  <p className="mt-3 text-sm text-[#666666]">{t('transport.driversManagement.noDriversFound')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {choferesFiltrados.map((chofer) => (
                    <div key={chofer.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F4] text-2xl">
                            {chofer.foto}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#333333] truncate">{chofer.nombre} {chofer.apellido}</p>
                            <p className="text-xs text-[#666666] truncate">{chofer.email || chofer.telefono || t('transport.driversManagement.unassigned')}</p>
                          </div>
                        </div>
                        {getEstadoBadge(chofer.estado)}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#666666]">
                        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">Permis</p>
                          <p className="mt-1 font-medium text-[#334155]">{chofer.tipoLicencia}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">Expérience</p>
                          <p className="mt-1 font-medium text-[#334155]">{chofer.experienciaAnios} {t('transport.driversManagement.years')}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-2.5 py-2 col-span-2">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">Véhicule assigné</p>
                          <p className="mt-1 font-medium text-[#334155] truncate">{chofer.vehiculoAsignado || t('transport.driversManagement.unassigned')}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => abrirDialogEditar(chofer)} className="flex-1">
                          <Edit className="h-4 w-4 mr-1.5" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEliminarChofer(chofer.id)}
                          className="text-[#DC3545] hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>{t('transport.driversManagement.photo')}</TableHead>
                    <TableHead>{t('transport.driversManagement.name')}</TableHead>
                    <TableHead>{t('transport.driversManagement.idCard')}</TableHead>
                    <TableHead>{t('transport.driversManagement.license')}</TableHead>
                    <TableHead>{t('transport.driversManagement.type')}</TableHead>
                    <TableHead>{t('transport.driversManagement.contact')}</TableHead>
                    <TableHead>{t('transport.driversManagement.assignedVehicle')}</TableHead>
                    <TableHead>{t('transport.driversManagement.experience')}</TableHead>
                    <TableHead>{t('transport.driversManagement.status')}</TableHead>
                    <TableHead>{t('transport.driversManagement.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {choferesFiltrados.map(chofer => (
                    <TableRow key={chofer.id}>
                      <TableCell>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F4F4] text-2xl">
                          {chofer.foto}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#333333]">
                            {chofer.nombre} {chofer.apellido}
                          </p>
                          <p className="text-xs text-[#666666]">{chofer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{chofer.cedula}</TableCell>
                      <TableCell className="font-mono text-sm">{chofer.licencia}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{chofer.tipoLicencia}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-[#666666]">
                            <Phone className="h-3 w-3" />
                            {chofer.telefono}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {chofer.vehiculoAsignado ? (
                          <span className="text-sm font-medium text-[#1E73BE]">
                            {chofer.vehiculoAsignado}
                          </span>
                        ) : (
                          <span className="text-sm text-[#999999]">{t('transport.driversManagement.unassigned')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{chofer.experienciaAnios} {t('transport.driversManagement.years')}</span>
                      </TableCell>
                      <TableCell>{getEstadoBadge(chofer.estado)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirDialogEditar(chofer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEliminarChofer(chofer.id)}
                            className="text-[#DC3545] hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {choferesFiltrados.length === 0 && (
                <div className="py-12 text-center">
                  <User className="mx-auto h-12 w-12 text-[#999999]" />
                  <p className="mt-4 text-[#666666]">{t('transport.driversManagement.noDriversFound')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Ajouter/Modifier Conducteur */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="chofer-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {editando ? t('transport.driversManagement.dialog.editTitle') : t('transport.driversManagement.dialog.addTitle')}
            </DialogTitle>
            <DialogDescription id="chofer-dialog-description">
              {editando ? t('transport.driversManagement.dialog.editDescription') : t('transport.driversManagement.dialog.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Información Personal */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <User className="inline h-4 w-4 mr-2" />
                {t('transport.driversManagement.dialog.personalInfo')}
              </h3>
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.firstNameRequired')}</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder={t('transport.driversManagement.dialog.firstNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.lastNameRequired')}</Label>
              <Input
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder={t('transport.driversManagement.dialog.lastNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.idRequired')}</Label>
              <Input
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder={t('transport.driversManagement.dialog.idPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.birthDate')}</Label>
              <Input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              />
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4 md:col-span-2 mt-4">
              <h3 className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Phone className="inline h-4 w-4 mr-2" />
                {t('transport.driversManagement.dialog.contact')}
              </h3>
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.phone')}</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+1 (514) 555-0000"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.email')}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('transport.driversManagement.dialog.emailPlaceholder')}
              />
            </div>

            {/* Información de Licencia */}
            <div className="space-y-4 md:col-span-2 mt-4">
              <h3 className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <IdCard className="inline h-4 w-4 mr-2" />
                {t('transport.driversManagement.dialog.licenseInfo')}
              </h3>
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.licenseNumberRequired')}</Label>
              <Input
                value={formData.licencia}
                onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
                placeholder={t('transport.driversManagement.dialog.licensePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.licenseType')}</Label>
              <Select
                value={formData.tipoLicencia}
                onValueChange={(value) => setFormData({ ...formData, tipoLicencia: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clase 1">{t('transport.driversManagement.dialog.licenseClass1')}</SelectItem>
                  <SelectItem value="Clase 2">{t('transport.driversManagement.dialog.licenseClass2')}</SelectItem>
                  <SelectItem value="Clase 3">{t('transport.driversManagement.dialog.licenseClass3')}</SelectItem>
                  <SelectItem value="Clase 4">{t('transport.driversManagement.dialog.licenseClass4')}</SelectItem>
                  <SelectItem value="Clase 5">{t('transport.driversManagement.dialog.licenseClass5')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Información Laboral */}
            <div className="space-y-4 md:col-span-2 mt-4">
              <h3 className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <FileText className="inline h-4 w-4 mr-2" />
                {t('transport.driversManagement.dialog.workInfo')}
              </h3>
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.hireDate')}</Label>
              <Input
                type="date"
                value={formData.fechaContratacion}
                onChange={(e) => setFormData({ ...formData, fechaContratacion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.experienceYears')}</Label>
              <Input
                type="number"
                value={formData.experienciaAnios}
                onChange={(e) => setFormData({ ...formData, experienciaAnios: parseInt(e.target.value) || 0 })}
                placeholder="5"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.assignedVehicle')}</Label>
              <Select
                value={formData.vehiculoAsignado}
                onValueChange={(value) => setFormData({ ...formData, vehiculoAsignado: value === 'sin_asignar' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('transport.driversManagement.unassigned')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_asignar">{t('transport.driversManagement.unassigned')}</SelectItem>
                  {vehiculos.map(vehiculo => (
                    <SelectItem key={vehiculo.id} value={vehiculo.placa || vehiculo.matricula}>
                      {obtenerNombreVehiculo(vehiculo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('transport.driversManagement.dialog.state')}</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: 'activo' | 'inactivo' | 'vacaciones') => 
                  setFormData({ ...formData, estado: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">{t('transport.driversManagement.active')}</SelectItem>
                  <SelectItem value="vacaciones">{t('transport.driversManagement.onVacation')}</SelectItem>
                  <SelectItem value="inactivo">{t('transport.driversManagement.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selector de días disponibles */}
          <div className="mt-6 pt-6 border-t">
            <SelecteurJoursDisponibles
              joursDisponibles={formData.joursDisponibles}
              onChange={(nouveauxJours) => setFormData({ ...formData, joursDisponibles: nouveauxJours })}
              showIcon={true}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('transport.driversManagement.dialog.cancel')}
            </Button>
            <Button onClick={guardarChofer} className="bg-[#1E73BE] hover:bg-[#1557A0]">
              {editando ? t('transport.driversManagement.dialog.update') : t('transport.driversManagement.dialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}