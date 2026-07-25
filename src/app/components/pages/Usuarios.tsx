import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, UsersRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { GestionRoles } from '../usuarios/GestionRoles';
import { GestionDepartamentos } from '../usuarios/GestionDepartamentos';
import { guardarUsuarioEnProveedor, eliminarUsuarioEnProveedor, obtenerUsuarios, sincronizarUsuariosConProveedor, type Usuario } from '../../utils/usuarios';
import { esRolValido, tienePermiso } from '../../utils/permisos';
import { obtenerRoles, ROLES_UPDATED_EVENT } from '../../utils/rolesStorage';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { Rol, permisos as permisosCatalogo } from '../../data/rolesPermisos';
import { registrarActividad } from '../../utils/actividadLogger';
import { ModuleControlSurface, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Usuarios() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioDialogOpen, setUsuarioDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  
  // Estados para contraseñas
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  
  // Estado del formulario
  const [formUsuario, setFormUsuario] = useState({
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    rol: 'visualizador',
    password: '',
    confirmPassword: '',
    permisos: [] as string[],
    descripcion: '',
    foto: ''
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    void cargarUsuarios();
    cargarRoles();
  }, []);

  useEffect(() => {
    const handleRolesUpdated = () => {
      cargarRoles();
    };

    window.addEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
    return () => window.removeEventListener(ROLES_UPDATED_EVENT, handleRolesUpdated);
  }, []);

  // Resetear formulario cuando se cierra el diálogo
  useEffect(() => {
    if (!usuarioDialogOpen) {
      resetForm();
    }
  }, [usuarioDialogOpen]);

  const cargarUsuarios = async () => {
    const usuariosStorage = await sincronizarUsuariosConProveedor();
    setUsuarios(usuariosStorage);
    console.log('✅ Usuarios cargados:', usuariosStorage.length);
  };

  const cargarRoles = () => {
    const roles = obtenerRoles().filter((rol) => rol.activo);
    setRolesDisponibles(roles);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAbrirEdicion = (usuario: Usuario) => {
    const usuarioActual = obtenerUsuarios().find((item) => (
      item.id === usuario.id || item.username.toLowerCase() === usuario.username.toLowerCase()
    ));
    const passwordActual = usuario.password || usuarioActual?.password || '';

    setUsuarioSeleccionado(usuario);
    setFormUsuario({
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      password: passwordActual,
      confirmPassword: passwordActual,
      permisos: usuario.permisos || [],
      descripcion: usuario.descripcion || '',
      foto: usuario.foto || ''
    });
    setModoEdicion(true);
    setUsuarioDialogOpen(true);
  };

  const handleAbrirCreacion = () => {
    resetForm();
    setModoEdicion(false);
    setUsuarioDialogOpen(true);
  };

  const handleGuardarUsuario = async () => {
    // Validaciones
    if (!formUsuario.username.trim()) {
      toast.error('Le nom d\'utilisateur est requis');
      return;
    }
    if (!formUsuario.nombre.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    if (!formUsuario.apellido.trim()) {
      toast.error('Le nom de famille est requis');
      return;
    }
    if (!formUsuario.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!modoEdicion && !formUsuario.password) {
      toast.error('Le mot de passe est requis');
      return;
    }
    
    // Validar que las contraseñas coincidan (tanto en creación como en edición)
    if (formUsuario.password && formUsuario.password !== formUsuario.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Debug: Verificar password antes de guardar
    console.log('🔐 Password a guardar:', formUsuario.password ? '***[oculto]***' : '[vacío]');

    try {
      if (modoEdicion && usuarioSeleccionado) {
        // Actualizar usuario existente
        const datosActualizados: Partial<Usuario> = {
          username: formUsuario.username,
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          permisos: getPermisosSegunRol(formUsuario.rol),
          descripcion: formUsuario.descripcion,
          foto: formUsuario.foto
        };

        // Solo actualizar password si se proporcionó uno nuevo
        if (formUsuario.password && formUsuario.password.trim()) {
          datosActualizados.password = formUsuario.password;
          console.log('🔐 Actualizando password del usuario');
        } else {
          console.log('🔐 Manteniendo password anterior (no se proporcionó nuevo)');
        }

        const usuarioActualizado = await guardarUsuarioEnProveedor({
          ...usuarioSeleccionado,
          ...datosActualizados,
          password: datosActualizados.password || usuarioSeleccionado.password,
        }, usuarioSeleccionado.id);
        if (usuarioActualizado) {
          // 📝 REGISTRAR ACTIVIDAD
          registrarActividad(
            'Utilisateurs',
            'modificar',
            `Utilisateur "${formUsuario.username}" modifié`,
            { usuarioId: usuarioSeleccionado.id, rol: formUsuario.rol }
          );
          
          toast.success('Utilisateur mis à jour avec succès');
          await cargarUsuarios();
          setUsuarioDialogOpen(false);
          resetForm();
        } else {
          toast.error('Erreur lors de la mise à jour');
        }
      } else {
        // Crear nuevo usuario
        console.log('🆕 Creando nuevo usuario con password');
        const nuevoUsuario = await guardarUsuarioEnProveedor({
          username: formUsuario.username,
          nombre: formUsuario.nombre,
          apellido: formUsuario.apellido,
          email: formUsuario.email,
          rol: formUsuario.rol,
          password: formUsuario.password,
          permisos: getPermisosSegunRol(formUsuario.rol),
          descripcion: formUsuario.descripcion,
          foto: formUsuario.foto
        });
        
        // 📝 REGISTRAR ACTIVIDAD
        registrarActividad(
          'Utilisateurs',
          'crear',
          `Utilisateur "${nuevoUsuario.username}" créé avec le rôle ${formUsuario.rol}`,
          { usuarioId: nuevoUsuario.id, rol: formUsuario.rol }
        );
        
        toast.success(`Utilisateur créé: ${nuevoUsuario.username}`);
        await cargarUsuarios();
        setUsuarioDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEliminarUsuario = async () => {
    if (!usuarioAEliminar) return;

    try {
      const success = await eliminarUsuarioEnProveedor(usuarioAEliminar.id);
      if (success) {
        // 📝 REGISTRAR ACTIVIDAD
        registrarActividad(
          'Utilisateurs',
          'eliminar',
          `Utilisateur "${usuarioAEliminar.username}" supprimé`,
          { usuarioId: usuarioAEliminar.id, rol: usuarioAEliminar.rol }
        );
        
        toast.success(`Utilisateur supprimé: ${usuarioAEliminar.username}`);
        await cargarUsuarios();
        setDeleteDialogOpen(false);
        setUsuarioAEliminar(null);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormUsuario({
      username: '',
      nombre: '',
      apellido: '',
      email: '',
      rol: 'visualizador',
      password: '',
      confirmPassword: '',
      permisos: [],
      descripcion: '',
      foto: ''
    });
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Sélectionnez une image valide');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const source = typeof reader.result === 'string' ? reader.result : '';
      if (!source) {
        toast.error('Impossible de lire l’image sélectionnée');
        return;
      }

      const image = new Image();
      image.onload = () => {
        const maxSize = 320;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
          setFormUsuario((previous) => ({ ...previous, foto: source }));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', 0.78);
        setFormUsuario((previous) => ({ ...previous, foto: optimized }));
      };
      image.onerror = () => {
        setFormUsuario((previous) => ({ ...previous, foto: source }));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setFormUsuario((previous) => ({ ...previous, foto: '' }));
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  // Función para copiar contraseña al portapapeles
  const copiarPassword = async () => {
    if (!formUsuario.password) {
      toast.error('Aucun mot de passe à copier');
      return;
    }
    
    try {
      await copiarAlPortapapeles(formUsuario.password);
      toast.success('Mot de passe copié', {
        description: 'Le mot de passe a été copié dans le presse-papier'
      });
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const getPermisosSegunRol = (rol: string): string[] => {
    const rolSistema = rolesDisponibles.find((item) => item.id === rol);
    return rolSistema?.permisos || ['dashboard.ver'];
  };

  const getRolBadge = (rol: string) => {
    const predefinedRole = rolesDisponibles.find((item) => item.id === rol);
    const fallbackConfig: Record<string, { bg: string; text: string }> = {
      desarrollador: { bg: 'bg-black', text: 'Développeur' },
      administrador: { bg: 'bg-[#DC3545]', text: t('users.administrator') },
      coordinador: { bg: 'bg-[#1E73BE]', text: t('users.coordinator') },
      usuario: { bg: 'bg-[#4CAF50]', text: t('users.user') },
    };

    const config = predefinedRole
      ? { bg: predefinedRole.color, text: predefinedRole.nombre }
      : fallbackConfig[rol] || { bg: 'bg-gray-500', text: rol };

    return (
      <Badge className={`${config.bg} hover:${config.bg}`}>
        {config.text}
      </Badge>
    );
  };

  const usuariosPorRol = {
    administrador: usuarios.filter(u => u.rol === 'administrador').length,
    coordinador: usuarios.filter(u => u.rol === 'coordinador').length,
    operativo: usuarios.filter(u => u.rol !== 'administrador' && u.rol !== 'coordinador').length
  };

  const rolSeleccionadoInfo = rolesDisponibles.find((rol) => rol.id === formUsuario.rol) || null;
  const permisosRolSeleccionado = getPermisosSegunRol(formUsuario.rol).map((permisoId) => {
    const permiso = permisosCatalogo.find((item) => item.id === permisoId);

    return {
      id: permisoId,
      nombre: permiso?.nombre || permisoId,
      modulo: permiso?.modulo || 'Autre'
    };
  });

  return (
    <div className="min-h-screen relative">
      {/* Fondo degradado fijo con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${branding.secondaryColor} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.primaryColor} 0%, transparent 70%)`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Header professionnel unifié */}
        <ModulePageHeader
          title={t('users.title')}
          subtitle={t('users.subtitle')}
          icon={<UsersRound className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          actions={(
            <Button
              onClick={handleAbrirCreacion}
              className="h-10 rounded-2xl px-4 text-white"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                boxShadow: `0 10px 24px -18px ${branding.primaryColor}`,
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('users.newUser')}
            </Button>
          )}
        />

        {/* Stats — grille responsive normalisée */}
        <ModuleStatsGrid defaultLayout="grid grid-cols-1 md:grid-cols-3">
          <ModuleStatCard
            label="Administrateurs"
            value={usuariosPorRol.administrador}
            icon={<UsersRound className="h-5 w-5 text-white" />}
            accentColor="#DC3545"
            secondaryColor="#e11d48"
            valueColor="#DC3545"
          />
          <ModuleStatCard
            label="Coordinateurs"
            value={usuariosPorRol.coordinador}
            icon={<UsersRound className="h-5 w-5 text-white" />}
            accentColor={branding.primaryColor}
            secondaryColor={branding.primaryColor}
          />
          <ModuleStatCard
            label="Utilisateurs"
            value={usuariosPorRol.operativo}
            icon={<UsersRound className="h-5 w-5 text-white" />}
            accentColor={branding.secondaryColor}
            secondaryColor={branding.secondaryColor}
          />
        </ModuleStatsGrid>

        {/* Tabs */}
        <Tabs defaultValue="usuarios" className="space-y-6">
          <ModuleControlSurface>
            <ModuleControlSurfaceTabs>
              <TabsList className="app-compact-tabs-grid w-full max-w-2xl bg-transparent p-0">
                <TabsTrigger value="usuarios" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  👥 {t('common.users')}
                </TabsTrigger>
                <TabsTrigger value="roles" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  🛡️ {t('users.roles')}
                </TabsTrigger>
                <TabsTrigger value="departamentos" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                  🏢 {t('users.departments')}
                </TabsTrigger>
              </TabsList>
            </ModuleControlSurfaceTabs>
          </ModuleControlSurface>

          <TabsContent value="usuarios" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                  Liste des Utilisateurs ({usuarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuariosFiltrados.map(usuario => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#1E73BE] font-medium text-white">
                                {usuario.foto ? (
                                  <ImageWithFallback src={usuario.foto} alt={`${usuario.nombre} ${usuario.apellido}`} className="h-full w-full object-cover" />
                                ) : (
                                  <span>{usuario.nombre[0]}{usuario.apellido[0]}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                                <p className="text-sm text-[#666666]">@{usuario.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#666666]">{usuario.email}</TableCell>
                          <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                          <TableCell className="text-sm text-[#666666] max-w-xs truncate">
                            {usuario.descripcion || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Éditer"
                                onClick={() => handleAbrirEdicion(usuario)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#DC3545]"
                                title="Supprimer"
                                onClick={() => {
                                  setDeleteDialogOpen(true);
                                  setUsuarioAEliminar(usuario);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <GestionRoles />
          </TabsContent>

          <TabsContent value="departamentos">
            <GestionDepartamentos />
          </TabsContent>
        </Tabs>

        {/* Dialog Crear/Editar Usuario */}
        <Dialog open={usuarioDialogOpen} onOpenChange={setUsuarioDialogOpen}>
          <DialogContent className="app-dialog-comfort max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="usuario-dialog-description">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {modoEdicion ? 'Éditer Utilisateur' : 'Nouvel Utilisateur'}
              </DialogTitle>
              <DialogDescription id="usuario-dialog-description">
                {modoEdicion ? 'Modifier les informations de l\'utilisateur' : 'Créer un nouvel utilisateur du système'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-2xl border border-[#d7e3ef] bg-[#f8fbff] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d7e3ef] bg-white text-xl font-semibold text-[#35516b] shadow-sm">
                    {formUsuario.foto ? (
                      <ImageWithFallback src={formUsuario.foto} alt="Photo utilisateur" className="h-full w-full object-cover" />
                    ) : (
                      <span>
                        {(formUsuario.nombre?.[0] || formUsuario.username?.[0] || 'U').toUpperCase()}
                        {(formUsuario.apellido?.[0] || '').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-[#35516b]">Photo de profil</p>
                      <p className="text-xs text-[#666666]">Ajoutez une image pour reconnaître l’utilisateur dans le formulaire et la liste.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()}>
                        {formUsuario.foto ? 'Changer la photo' : 'Ajouter une photo'}
                      </Button>
                      {formUsuario.foto && (
                        <Button type="button" variant="outline" onClick={handleRemovePhoto} className="text-[#DC3545]">
                          Retirer
                        </Button>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom d'utilisateur *</Label>
                  <Input 
                    placeholder="transport" 
                    value={formUsuario.username} 
                    onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle *</Label>
                  <Select value={formUsuario.rol} onValueChange={(value: any) => setFormUsuario({ ...formUsuario, rol: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesDisponibles.map(rol => (
                        <SelectItem key={rol.id} value={rol.id}>
                          <div className="flex items-center gap-2">
                            <span>{rol.icono}</span>
                            <span>{rol.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input 
                    placeholder="Marc" 
                    value={formUsuario.nombre} 
                    onChange={(e) => setFormUsuario({ ...formUsuario, nombre: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input 
                    placeholder="Transporteur" 
                    value={formUsuario.apellido} 
                    onChange={(e) => setFormUsuario({ ...formUsuario, apellido: e.target.value })} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email" 
                    placeholder="utilisateur@banque-alimentaire.org" 
                    value={formUsuario.email} 
                    onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })} 
                  />
                </div>
                
                {/* Sección de contraseñas con botones de utilidad */}
                <div className="col-span-2 space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Label className="text-base font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      🔐 Gestion du Mot de Passe
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copiarPassword}
                      disabled={!formUsuario.password}
                      className="text-xs"
                      style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copier
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label>Mot de passe {!modoEdicion && '*'}</Label>
                      <div className="relative">
                        <Input 
                          type={mostrarPassword ? "text" : "password"} 
                          placeholder={modoEdicion ? "Laisser vide pour ne pas changer" : "••••••••"} 
                          value={formUsuario.password} 
                          onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                        >
                          {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label>Confirmer mot de passe {!modoEdicion && '*'}</Label>
                      <div className="relative">
                        <Input 
                          type={mostrarConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={formUsuario.confirmPassword} 
                          onChange={(e) => setFormUsuario({ ...formUsuario, confirmPassword: e.target.value })} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                        >
                          {mostrarConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de seguridad de contraseña */}
                  {formUsuario.password && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {formUsuario.password.length >= 8 ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-900">
                            {formUsuario.password.length >= 8 ? 'Mot de passe sécurisé' : 'Mot de passe faible'}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Longueur: {formUsuario.password.length} caractères
                            {formUsuario.password.length < 8 && ' (minimum 8 recommandé)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Responsable Transport - Gestion des Livraisons" 
                    value={formUsuario.descripcion} 
                    onChange={(e) => setFormUsuario({ ...formUsuario, descripcion: e.target.value })} 
                  />
                </div>
              </div>

              <div className="bg-[#F4F4F4] p-4 rounded-lg space-y-3">
                <h4 className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Permissions par Rôle
                </h4>
                {rolSeleccionadoInfo ? (
                  <>
                    <div className="rounded-lg border border-white/70 bg-white/80 p-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {getRolBadge(rolSeleccionadoInfo.id)}
                        <Badge variant="outline">{permisosRolSeleccionado.length} autorisations</Badge>
                      </div>
                      <p className="text-sm text-[#666666]">{rolSeleccionadoInfo.descripcion}</p>
                    </div>

                    {permisosRolSeleccionado.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {permisosRolSeleccionado.map((permiso) => (
                          <div
                            key={permiso.id}
                            className="rounded-full border border-[#d7e3ef] bg-white px-3 py-1 text-xs text-[#35516b]"
                            title={permiso.id}
                          >
                            {permiso.modulo} · {permiso.nombre}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#666666]">Aucune autorisation définie pour ce rôle.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#666666]">Sélectionnez un rôle pour afficher ses autorisations.</p>
                )}
              </div>

              <div className="app-compact-actions justify-end pt-4">
                <Button variant="outline" onClick={() => setUsuarioDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleGuardarUsuario} className="bg-[#4CAF50] hover:bg-[#45a049]">
                  {modoEdicion ? 'Mettre à jour' : 'Créer Utilisateur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                Supprimer Utilisateur
              </AlertDialogTitle>
              <AlertDialogDescription>
                {usuarioAEliminar && (
                  <div className="space-y-3">
                    <p>Êtes-vous sûr de vouloir supprimer <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellido}</strong> (@{usuarioAEliminar.username})?</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        ⚠️ Cette action est irréversible
                      </p>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEliminarUsuario}
                className="bg-[#DC3545] hover:bg-[#c82333]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}