import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, MapPin, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerDepartamentos, guardarDepartamento, actualizarDepartamento, eliminarDepartamento, type Departamento as DepartamentoStorage } from '../../utils/departamentosStorage';

interface Departamento {
  id: string;
  codigo: string;
  nombre: string;
  responsable: string;
  usuarios: number;
  ubicacion: string;
  descripcion: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
  createdAt: string;
}

// Datos de responsables y ubicaciones para los departamentos del sistema
const departamentosExtendidos: Record<string, { responsable: string; ubicacion: string; usuarios: number }> = {
  'ENTREPOT': {
    responsable: 'Carlos Ruiz',
    ubicacion: 'Bodega Central',
    usuarios: 12
  },
  'COMPTOIR': {
    responsable: 'Marie Dubois',
    ubicacion: 'Área de Atención',
    usuarios: 8
  },
  'CUISINE': {
    responsable: 'Chef Jean-Pierre',
    ubicacion: 'Cocina Central',
    usuarios: 6
  },
  'LIAISON': {
    responsable: 'Ana Martínez',
    ubicacion: 'Oficina de Coordinación',
    usuarios: 5
  },
  'PTC': {
    responsable: 'Pierre Gagnon',
    ubicacion: 'Área de PTC',
    usuarios: 4
  },
  'MAINTIEN': {
    responsable: 'Luis Fernández',
    ubicacion: 'Taller de Mantenimiento',
    usuarios: 3
  },
  'RECRUTEMENT': {
    responsable: 'Sophie Lavoie',
    ubicacion: 'Recursos Humanos',
    usuarios: 4
  }
};

export function GestionDepartamentos() {
  const { t } = useTranslation();
  const branding = useBranding();
  
  // Cargar departamentos desde el sistema
  const cargarDepartamentos = (): Departamento[] => {
    const deptosStorage = obtenerDepartamentos();
    return deptosStorage.map(dep => {
      const extra = departamentosExtendidos[dep.codigo] || {
        responsable: 'No asignado',
        ubicacion: 'Por definir',
        usuarios: 0
      };
      return {
        id: dep.id,
        codigo: dep.codigo,
        nombre: dep.nombre,
        responsable: extra.responsable,
        usuarios: extra.usuarios,
        ubicacion: extra.ubicacion,
        descripcion: dep.descripcion,
        icono: dep.icono,
        color: dep.color,
        activo: dep.activo,
        orden: dep.orden,
        createdAt: new Date().toISOString().split('T')[0]
      };
    });
  };

  const [departamentos, setDepartamentos] = useState<Departamento[]>(cargarDepartamentos());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<Departamento | null>(null);
  const [departamentoAEliminar, setDepartamentoAEliminar] = useState<Departamento | null>(null);

  const [formDepartamento, setFormDepartamento] = useState({
    codigo: '',
    nombre: '',
    responsable: '',
    ubicacion: '',
    activo: true
  });

  const departamentosFiltrados = departamentos.filter(d =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsuarios = departamentos.reduce((acc, d) => acc + d.usuarios, 0);
  const departamentosActivos = departamentos.filter(d => d.activo).length;

  const handleAbrirCreacion = () => {
    resetForm();
    setModoEdicion(false);
    setDialogOpen(true);
  };

  const handleAbrirEdicion = (departamento: Departamento) => {
    setDepartamentoSeleccionado(departamento);
    setFormDepartamento({
      codigo: departamento.codigo,
      nombre: departamento.nombre,
      responsable: departamento.responsable,
      ubicacion: departamento.ubicacion,
      activo: departamento.activo
    });
    setModoEdicion(true);
    setDialogOpen(true);
  };

  const handleGuardar = () => {
    if (!formDepartamento.codigo || !formDepartamento.nombre || !formDepartamento.responsable) {
      toast.error(t('departments.fillRequired'));
      return;
    }

    if (modoEdicion && departamentoSeleccionado) {
      // Actualizar departamento existente
      const deptoActualizado: Departamento = {
        ...departamentoSeleccionado,
        codigo: formDepartamento.codigo,
        nombre: formDepartamento.nombre,
        responsable: formDepartamento.responsable,
        ubicacion: formDepartamento.ubicacion,
        activo: formDepartamento.activo
      };
      
      setDepartamentos(departamentos.map(d =>
        d.id === departamentoSeleccionado.id ? deptoActualizado : d
      ));
      toast.success(t('departments.updated'));
    } else {
      // Crear nuevo departamento
      const maxId = departamentos.reduce((max, d) => {
        const numId = parseInt(d.id);
        return !isNaN(numId) && numId > max ? numId : max;
      }, 0);
      
      const nuevoDepartamento: Departamento = {
        id: (maxId + 1).toString(),
        codigo: formDepartamento.codigo,
        nombre: formDepartamento.nombre,
        responsable: formDepartamento.responsable,
        ubicacion: formDepartamento.ubicacion,
        usuarios: 0,
        descripcion: '',
        icono: 'Building2',
        color: branding.primaryColor,
        activo: formDepartamento.activo,
        orden: departamentos.length + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setDepartamentos([...departamentos, nuevoDepartamento]);
      toast.success(t('departments.created'));
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEliminar = () => {
    if (departamentoAEliminar) {
      setDepartamentos(departamentos.filter(d => d.id !== departamentoAEliminar.id));
      toast.success(t('departments.deleted'));
      setDeleteDialogOpen(false);
      setDepartamentoAEliminar(null);
    }
  };

  const resetForm = () => {
    setFormDepartamento({
      codigo: '',
      nombre: '',
      responsable: '',
      ubicacion: '',
      activo: true
    });
    setDepartamentoSeleccionado(null);
    setModoEdicion(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            {t('departments.title')}
          </h2>
          <p className="text-[#666666]">{t('departments.subtitle')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleAbrirCreacion}
              style={{ 
                backgroundColor: branding.secondaryColor,
                fontFamily: 'Montserrat, sans-serif', 
                fontWeight: 500 
              }}
              className="hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('departments.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby="department-description">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {modoEdicion ? t('departments.edit') : t('departments.new')}
              </DialogTitle>
              <DialogDescription id="department-description">
                {t('departments.enterDetails')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('departments.code')} *</Label>
                  <Input 
                    placeholder="ADM" 
                    value={formDepartamento.codigo}
                    onChange={(e) => setFormDepartamento({ ...formDepartamento, codigo: e.target.value.toUpperCase() })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('departments.name')} *</Label>
                  <Input 
                    placeholder={t('departments.namePlaceholder')}
                    value={formDepartamento.nombre}
                    onChange={(e) => setFormDepartamento({ ...formDepartamento, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('departments.responsible')} *</Label>
                  <Input 
                    placeholder={t('departments.responsiblePlaceholder')}
                    value={formDepartamento.responsable}
                    onChange={(e) => setFormDepartamento({ ...formDepartamento, responsable: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('departments.location')}</Label>
                  <Input 
                    placeholder={t('departments.locationPlaceholder')}
                    value={formDepartamento.ubicacion}
                    onChange={(e) => setFormDepartamento({ ...formDepartamento, ubicacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleGuardar}
                  style={{ backgroundColor: branding.successColor }}
                  className="hover:opacity-90"
                >
                  {modoEdicion ? t('common.update') : t('common.create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('departments.total')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: branding.primaryColor }}>
                  {departamentos.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 opacity-20" style={{ color: branding.primaryColor }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: branding.successColor }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('departments.active')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: branding.successColor }}>
                  {departamentosActivos}
                </p>
              </div>
              <Building2 className="w-8 h-8 opacity-20" style={{ color: branding.successColor }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: branding.secondaryColor }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('departments.totalUsers')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: branding.secondaryColor }}>
                  {totalUsuarios}
                </p>
              </div>
              <Users className="w-8 h-8 opacity-20" style={{ color: branding.secondaryColor }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: branding.warningColor }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">{t('departments.avgUsers')}</p>
                <p className="font-bold" style={{ fontSize: '1.5rem', color: branding.warningColor }}>
                  {departamentos.length > 0 ? Math.round(totalUsuarios / departamentos.length) : 0}
                </p>
              </div>
              <Users className="w-8 h-8 opacity-20" style={{ color: branding.warningColor }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder={t('departments.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            {t('departments.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('departments.code')}</TableHead>
                  <TableHead>{t('departments.department')}</TableHead>
                  <TableHead>{t('departments.responsible')}</TableHead>
                  <TableHead>{t('departments.location')}</TableHead>
                  <TableHead>{t('departments.users')}</TableHead>
                  <TableHead>{t('departments.status')}</TableHead>
                  <TableHead>{t('departments.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departamentosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[#666666] py-8">
                      {t('departments.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  departamentosFiltrados.map(departamento => (
                    <TableRow key={departamento.id}>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: branding.primaryColor }}
                          className="hover:opacity-90 font-mono"
                        >
                          {departamento.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: branding.secondaryColor }}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{departamento.nombre}</p>
                            <p className="text-xs text-[#666666]">
                              {t('departments.created')}: {departamento.createdAt}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: branding.primaryColor }}
                          >
                            {departamento.responsable.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <span>{departamento.responsable}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-[#666666]">
                          <MapPin className="w-4 h-4" />
                          {departamento.ubicacion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                          <span className="font-medium">{departamento.usuarios}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {departamento.activo ? (
                          <Badge 
                            style={{ backgroundColor: branding.successColor }}
                            className="hover:opacity-90"
                          >
                            {t('departments.statusActive')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t('departments.statusInactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={t('departments.edit')}
                            onClick={() => handleAbrirEdicion(departamento)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#DC3545] hover:text-[#DC3545]"
                            title={t('departments.delete')}
                            onClick={() => {
                              setDepartamentoAEliminar(departamento);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('departments.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {departamentoAEliminar && (
                <div className="space-y-3">
                  <p>
                    {t('departments.deleteConfirm')} <strong>{departamentoAEliminar.nombre}</strong> ({departamentoAEliminar.codigo})?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ {t('departments.warning')}
                    </p>
                    <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
                      <li>{t('departments.warningUsers', { count: departamentoAEliminar.usuarios })}</li>
                      <li>{t('departments.warningData')}</li>
                      <li>{t('departments.warningPermanent')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('departments.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}