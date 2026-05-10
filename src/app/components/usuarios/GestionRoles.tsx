import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Shield, Check, X, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { permisosPorModulo, iconosModulos, coloresModulos, Rol } from '../../data/rolesPermisos';
import { Textarea } from '../ui/textarea';
import { eliminarRolPersonalizado, obtenerRoles, guardarRolPersonalizado } from '../../utils/rolesStorage';

export function GestionRoles() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolDialogOpen, setRolDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState<Rol | null>(null);
  const [verPermisosDialogOpen, setVerPermisosDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarRoles();
  }, []);

  const [formRol, setFormRol] = useState({
    nombre: '',
    descripcion: '',
    color: '#1E73BE',
    icono: '👤',
    permisos: [] as string[],
    activo: true
  });

  const coloresDisponibles = [
    { color: '#DC3545', nombre: 'Rojo' },
    { color: '#1E73BE', nombre: 'Azul' },
    { color: '#4CAF50', nombre: 'Verde' },
    { color: '#FFC107', nombre: 'Amarillo' },
    { color: '#9C27B0', nombre: 'Morado' },
    { color: '#FF9800', nombre: 'Naranja' },
    { color: '#00BCD4', nombre: 'Cian' },
    { color: '#607D8B', nombre: 'Gris' }
  ];

  const iconosDisponibles = ['👤', '👑', '📋', '📦', '🚚', '🤝', '📊', '⚙️', '🔧', '💼', '🎯', '⭐'];

  const cargarRoles = () => {
    setRoles(obtenerRoles());
  };

  const handleAbrirCreacion = () => {
    setFormRol({
      nombre: '',
      descripcion: '',
      color: '#1E73BE',
      icono: '👤',
      permisos: [],
      activo: true
    });
    setModoEdicion(false);
    setRolSeleccionado(null);
    setRolDialogOpen(true);
  };

  const handleAbrirEdicion = (rol: Rol) => {
    setRolSeleccionado(rol);
    setFormRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      color: rol.color,
      icono: rol.icono,
      permisos: [...rol.permisos],
      activo: rol.activo
    });
    setModoEdicion(true);
    setRolDialogOpen(true);
  };

  const handleGuardarRol = () => {
    if (!formRol.nombre || !formRol.descripcion) {
      toast.error(t('users.completeAllFields'));
      return;
    }

    if (formRol.permisos.length === 0) {
      toast.error(t('users.selectAtLeastOnePermission'));
      return;
    }

    const rolGuardado = guardarRolPersonalizado(
      {
        nombre: formRol.nombre.trim(),
        descripcion: formRol.descripcion.trim(),
        color: formRol.color,
        icono: formRol.icono,
        permisos: formRol.permisos,
        activo: formRol.activo,
      },
      modoEdicion ? rolSeleccionado?.id : undefined
    );

    setRolSeleccionado(rolGuardado);
    cargarRoles();

    if (modoEdicion && rolSeleccionado) {
      toast.success(`${t('users.roleUpdated')}: "${formRol.nombre}"`);
    } else {
      toast.success(`${t('users.roleCreated')}: "${formRol.nombre}"`);
    }
    setRolDialogOpen(false);
  };

  const handleEliminarRol = () => {
    if (rolAEliminar) {
      eliminarRolPersonalizado(rolAEliminar.id);
      cargarRoles();
      toast.success(`${t('users.roleDeleted')}: "${rolAEliminar.nombre}"`);
      setDeleteDialogOpen(false);
      setRolAEliminar(null);
    }
  };

  const handleTogglePermiso = (permisoId: string) => {
    setFormRol(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId)
        ? prev.permisos.filter(p => p !== permisoId)
        : [...prev.permisos, permisoId]
    }));
  };

  const handleToggleModulo = (modulo: string) => {
    const permisosModulo = permisosPorModulo[modulo].map(p => p.id);
    const todosSeleccionados = permisosModulo.every(p => formRol.permisos.includes(p));

    if (todosSeleccionados) {
      setFormRol(prev => ({
        ...prev,
        permisos: prev.permisos.filter(p => !permisosModulo.includes(p))
      }));
    } else {
      setFormRol(prev => ({
        ...prev,
        permisos: [...new Set([...prev.permisos, ...permisosModulo])]
      }));
    }
  };

  const rolesFiltrados = roles.filter(r =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerPermisos = (rol: Rol) => {
    setRolSeleccionado(rol);
    setVerPermisosDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#333333' }}>
            {t('users.rolesManagement')}
          </h2>
          <p className="text-[#666666]">{t('users.rolesSubtitle')}</p>
        </div>
        <Button onClick={handleAbrirCreacion} className="bg-[#4CAF50] hover:bg-[#45a049]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('users.newRole')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder={t('users.searchRoles')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesFiltrados.map(rol => (
          <Card key={rol.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${rol.color}20` }}
                  >
                    {rol.icono}
                  </div>
                  <div>
                    <CardTitle className="mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem' }}>
                      {rol.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {rol.predeterminado && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {t('users.system')}
                        </Badge>
                      )}
                      {rol.activo ? (
                        <Badge className="bg-[#4CAF50] hover:bg-[#45a049] text-xs">Actif</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[#666666] min-h-[40px]">{rol.descripcion}</p>
              
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Users className="w-4 h-4" />
                <span>{rol.usuariosAsignados} {t('users.assignedUsers')}</span>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-[#666666] mb-2">{t('users.permissions')}: {rol.permisos.length}</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(permisosPorModulo).slice(0, 4).map(modulo => {
                    const permisosModulo = permisosPorModulo[modulo].map(p => p.id);
                    const tienePermisos = permisosModulo.some(p => rol.permisos.includes(p));
                    
                    if (!tienePermisos) return null;
                    
                    return (
                      <Badge
                        key={modulo}
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          borderColor: coloresModulos[modulo],
                          color: coloresModulos[modulo]
                        }}
                      >
                        {iconosModulos[modulo]} {modulo}
                      </Badge>
                    );
                  })}
                  {Object.keys(permisosPorModulo).filter(modulo => {
                    const permisosModulo = permisosPorModulo[modulo].map(p => p.id);
                    return permisosModulo.some(p => rol.permisos.includes(p));
                  }).length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.keys(permisosPorModulo).filter(modulo => {
                        const permisosModulo = permisosPorModulo[modulo].map(p => p.id);
                        return permisosModulo.some(p => rol.permisos.includes(p));
                      }).length - 4} plus
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleVerPermisos(rol)}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {t('users.viewPermissions')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAbrirEdicion(rol)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#DC3545]"
                  onClick={() => {
                    setRolAEliminar(rol);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={rol.predeterminado || rol.usuariosAsignados > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo Crear/Editar Rol */}
      <Dialog open={rolDialogOpen} onOpenChange={setRolDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="gestion-rol-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? t('users.editRole') : t('users.newRole')}
            </DialogTitle>
            <DialogDescription id="gestion-rol-description">
              {t('users.configureRole')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('users.roleInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>{t('users.roleName')} *</Label>
                  <Input
                    placeholder="Ex. : Superviseur"
                    value={formRol.nombre}
                    onChange={(e) => setFormRol({ ...formRol, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('users.description')} *</Label>
                  <Textarea
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    value={formRol.descripcion}
                    onChange={(e) => setFormRol({ ...formRol, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('users.color')}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {coloresDisponibles.map(c => (
                      <button
                        key={c.color}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          formRol.color === c.color ? 'border-gray-900 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: c.color }}
                        onClick={() => setFormRol({ ...formRol, color: c.color })}
                        title={c.nombre}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('users.icon')}</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconosDisponibles.map(icono => (
                      <button
                        key={icono}
                        className={`h-10 rounded-lg border-2 text-xl transition-all ${
                          formRol.icono === icono ? 'border-[#1E73BE] bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormRol({ ...formRol, icono })}
                      >
                        {icono}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('users.permissions')} ({formRol.permisos.length} {t('users.selected')})
                </h3>
                <Badge variant="outline">
                  {formRol.permisos.length} de {Object.values(permisosPorModulo).flat().length}
                </Badge>
              </div>

              <div className="space-y-3">
                {Object.entries(permisosPorModulo).map(([modulo, permisos]) => {
                  const permisosModuloIds = permisos.map(p => p.id);
                  const todosSeleccionados = permisosModuloIds.every(p => formRol.permisos.includes(p));
                  const algunosSeleccionados = permisosModuloIds.some(p => formRol.permisos.includes(p));

                  return (
                    <Card key={modulo}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white"
                              style={{ backgroundColor: coloresModulos[modulo] }}
                            >
                              {iconosModulos[modulo]}
                            </div>
                            <div>
                              <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {modulo}
                              </CardTitle>
                              <p className="text-xs text-[#666666]">{permisos.length} autorisations</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleModulo(modulo)}
                          >
                            {todosSeleccionados ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                {t('users.deselect')}
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                {t('users.selectAll')}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permisos.map(permiso => (
                            <div key={permiso.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                              <Checkbox
                                checked={formRol.permisos.includes(permiso.id)}
                                onCheckedChange={() => handleTogglePermiso(permiso.id)}
                                id={permiso.id}
                              />
                              <label htmlFor={permiso.id} className="flex-1 cursor-pointer">
                                <p className="text-sm font-medium">{permiso.nombre}</p>
                                <p className="text-xs text-[#666666]">{permiso.descripcion}</p>
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setRolDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleGuardarRol} className="bg-[#4CAF50] hover:bg-[#45a049]">
                {modoEdicion ? t('users.updateRole') : t('users.createRole')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Ver Permisos */}
      <Dialog open={verPermisosDialogOpen} onOpenChange={setVerPermisosDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="ver-permisos-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('users.permissionsOf')} {rolSeleccionado?.nombre}
            </DialogTitle>
            <DialogDescription id="ver-permisos-description">
              {rolSeleccionado?.descripcion}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {rolSeleccionado && Object.entries(permisosPorModulo).map(([modulo, permisos]) => {
              const permisosDelRol = permisos.filter(p => rolSeleccionado.permisos.includes(p.id));
              
              if (permisosDelRol.length === 0) return null;

              return (
                <Card key={modulo}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: coloresModulos[modulo] }}
                      >
                        {iconosModulos[modulo]}
                      </div>
                      <CardTitle className="text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {modulo}
                      </CardTitle>
                      <Badge variant="outline">{permisosDelRol.length} autorisations</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permisosDelRol.map(permiso => (
                        <div key={permiso.id} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                          <Check className="w-4 h-4 text-[#4CAF50] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{permiso.nombre}</p>
                            <p className="text-xs text-[#666666]">{permiso.descripcion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t('users.deleteRole')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {rolAEliminar && (
                <div className="space-y-3">
                  <p>Êtes-vous sûr de vouloir supprimer le rôle <strong>{rolAEliminar.nombre}</strong> ?</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ {t('users.cannotUndo')}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarRol}
              className="bg-[#DC3545] hover:bg-[#c82333]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer le rôle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}