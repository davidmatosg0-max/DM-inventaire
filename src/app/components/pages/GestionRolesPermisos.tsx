import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield, Users, Lock, Eye, Edit, Trash2, Plus,
  Check, X, Search, Filter, AlertCircle, Key,
  Settings, UserCog, FileText, Package, Truck, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { obtenerUsuarios } from '../../utils/usuarios';
import { GestionPasswordDialog } from '../GestionPasswordDialog';
import { ModuleControlSurface, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';

// Tipos de permisos granulares
type Permiso = {
  id: string;
  modulo: string;
  nombre: string;
  descripcion: string;
  icono: any;
};

type Rol = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  permisos: string[];
  usuariosAsignados: number;
  activo: boolean;
  predeterminado: boolean; // Roles del sistema que no se pueden eliminar
};

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimoAcceso: string;
  foto?: string;
};

export function GestionRolesPermisos() {
  const { t } = useTranslation();
  const [tabActual, setTabActual] = useState<'roles' | 'usuarios' | 'permisos'>('roles');
  const [dialogRolOpen, setDialogRolOpen] = useState(false);
  const [dialogUsuarioOpen, setDialogUsuarioOpen] = useState(false);
  const [dialogPermisosOpen, setDialogPermisosOpen] = useState(false);
  const [dialogPasswordOpen, setDialogPasswordOpen] = useState(false);
  const [usuarioPasswordSeleccionado, setUsuarioPasswordSeleccionado] = useState<{ id: string; nombre: string; username: string } | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  // Definición de permisos del sistema
  const permisosDisponibles: Permiso[] = [
    // Inventario
    { id: 'inventario_ver', modulo: 'Inventaire', nombre: 'Voir l\'inventaire', descripcion: 'Afficher les produits et le stock', icono: Package },
    { id: 'inventario_crear', modulo: 'Inventaire', nombre: 'Creer des produits', descripcion: 'Ajouter de nouveaux produits', icono: Plus },
    { id: 'inventario_editar', modulo: 'Inventaire', nombre: 'Modifier les produits', descripcion: 'Mettre a jour les informations des produits', icono: Edit },
    { id: 'inventario_eliminar', modulo: 'Inventaire', nombre: 'Supprimer des produits', descripcion: 'Supprimer des produits de l\'inventaire', icono: Trash2 },
    { id: 'inventario_movimientos', modulo: 'Inventaire', nombre: 'Gerer les mouvements', descripcion: 'Enregistrer les entrees et sorties', icono: Package },
    
    // Comandas
    { id: 'comandas_ver', modulo: 'Commandes', nombre: 'Voir les commandes', descripcion: 'Afficher les commandes', icono: FileText },
    { id: 'comandas_crear', modulo: 'Commandes', nombre: 'Creer des commandes', descripcion: 'Generer de nouvelles commandes', icono: Plus },
    { id: 'comandas_editar', modulo: 'Commandes', nombre: 'Modifier les commandes', descripcion: 'Mettre a jour les commandes existantes', icono: Edit },
    { id: 'comandas_eliminar', modulo: 'Commandes', nombre: 'Supprimer les commandes', descripcion: 'Annuler des commandes', icono: Trash2 },
    { id: 'comandas_aprobar', modulo: 'Commandes', nombre: 'Approuver les commandes', descripcion: 'Approuver ou refuser les commandes', icono: Check },
    
    // PRS
    { id: 'prs_ver', modulo: 'PRS', nombre: 'Voir les recuperations PRS', descripcion: 'Afficher les registres PRS', icono: BarChart3 },
    { id: 'prs_registrar', modulo: 'PRS', nombre: 'Enregistrer des recuperations', descripcion: 'Creer de nouveaux registres PRS', icono: Plus },
    { id: 'prs_configurar', modulo: 'PRS', nombre: 'Configurer le PRS', descripcion: 'Gerer les categories PRS', icono: Settings },
    
    // Organismos
    { id: 'organismos_ver', modulo: 'Organismes', nombre: 'Voir les organismes', descripcion: 'Afficher les organismes enregistres', icono: Users },
    { id: 'organismos_crear', modulo: 'Organismes', nombre: 'Creer des organismes', descripcion: 'Enregistrer de nouveaux organismes', icono: Plus },
    { id: 'organismos_editar', modulo: 'Organismes', nombre: 'Modifier les organismes', descripcion: 'Mettre a jour les informations des organismes', icono: Edit },
    { id: 'organismos_eliminar', modulo: 'Organismes', nombre: 'Supprimer les organismes', descripcion: 'Supprimer des organismes du systeme', icono: Trash2 },
    
    // Transporte
    { id: 'transporte_ver', modulo: 'Transport', nombre: 'Voir les itineraires', descripcion: 'Afficher les itineraires et les livraisons', icono: Truck },
    { id: 'transporte_planificar', modulo: 'Transport', nombre: 'Planifier les itineraires', descripcion: 'Creer et modifier les itineraires', icono: Plus },
    { id: 'transporte_vehiculos', modulo: 'Transport', nombre: 'Gerer les vehicules', descripcion: 'Administrer la flotte de vehicules', icono: Settings },
    
    // Reportes
    { id: 'reportes_ver', modulo: 'Rapports', nombre: 'Voir les rapports', descripcion: 'Afficher les rapports du systeme', icono: BarChart3 },
    { id: 'reportes_generar', modulo: 'Rapports', nombre: 'Generer des rapports', descripcion: 'Creer et exporter des rapports', icono: FileText },
    { id: 'reportes_avanzados', modulo: 'Rapports', nombre: 'Rapports avances', descripcion: 'Acces aux rapports executifs', icono: BarChart3 },
    
    // Usuarios y Sistema
    { id: 'usuarios_ver', modulo: 'Utilisateurs', nombre: 'Voir les utilisateurs', descripcion: 'Afficher les utilisateurs du systeme', icono: Users },
    { id: 'usuarios_crear', modulo: 'Utilisateurs', nombre: 'Creer des utilisateurs', descripcion: 'Enregistrer de nouveaux utilisateurs', icono: Plus },
    { id: 'usuarios_editar', modulo: 'Utilisateurs', nombre: 'Modifier les utilisateurs', descripcion: 'Mettre a jour les informations des utilisateurs', icono: Edit },
    { id: 'usuarios_eliminar', modulo: 'Utilisateurs', nombre: 'Supprimer les utilisateurs', descripcion: 'Supprimer des utilisateurs du systeme', icono: Trash2 },
    { id: 'roles_gestionar', modulo: 'Utilisateurs', nombre: 'Gerer les roles', descripcion: 'Creer et modifier les roles et permissions', icono: Shield },
    { id: 'sistema_configurar', modulo: 'Systeme', nombre: 'Configuration du systeme', descripcion: 'Acces a la configuration generale', icono: Settings },
  ];

  // Roles predefinidos del sistema
  const [roles, setRoles] = useState<Rol[]>([
    {
      id: 'admin',
      nombre: 'Administrateur',
      descripcion: 'Acces complet a toutes les fonctionnalites du systeme',
      color: '#DC3545',
      permisos: permisosDisponibles.map(p => p.id), // Todos los permisos
      usuariosAsignados: 2,
      activo: true,
      predeterminado: true
    },
    {
      id: 'coordinador',
      nombre: 'Coordinateur',
      descripcion: 'Gestion de l\'inventaire, des commandes et des organismes',
      color: '#1E73BE',
      permisos: [
        'inventario_ver', 'inventario_crear', 'inventario_editar', 'inventario_movimientos',
        'comandas_ver', 'comandas_crear', 'comandas_editar', 'comandas_aprobar',
        'organismos_ver', 'organismos_editar',
        'prs_ver', 'prs_registrar',
        'reportes_ver', 'reportes_generar'
      ],
      usuariosAsignados: 3,
      activo: true,
      predeterminado: true
    },
    {
      id: 'almacenista',
      nombre: 'Magasinier',
      descripcion: 'Gestion de l\'inventaire et des mouvements de produits',
      color: '#4CAF50',
      permisos: [
        'inventario_ver', 'inventario_crear', 'inventario_editar', 'inventario_movimientos',
        'comandas_ver',
        'prs_ver', 'prs_registrar',
        'reportes_ver'
      ],
      usuariosAsignados: 5,
      activo: true,
      predeterminado: true
    },
    {
      id: 'transportista',
      nombre: 'Transporteur',
      descripcion: 'Gestion des itineraires et des livraisons',
      color: '#FFC107',
      permisos: [
        'transporte_ver', 'transporte_planificar',
        'comandas_ver',
        'organismos_ver'
      ],
      usuariosAsignados: 4,
      activo: true,
      predeterminado: true
    },
    {
      id: 'visualizador',
      nombre: 'Lecteur',
      descripcion: 'Acces en lecture seule aux informations du systeme',
      color: '#9E9E9E',
      permisos: [
        'inventario_ver',
        'comandas_ver',
        'organismos_ver',
        'prs_ver',
        'transporte_ver',
        'reportes_ver'
      ],
      usuariosAsignados: 2,
      activo: true,
      predeterminado: false
    }
  ]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [nuevoRol, setNuevoRol] = useState({
    nombre: '',
    descripcion: '',
    color: '#1E73BE',
    permisos: [] as string[]
  });

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    rol: '',
    activo: true
  });

  // Funciones de gestión
  const handleCrearRol = () => {
    if (!nuevoRol.nombre || !nuevoRol.descripcion) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (nuevoRol.permisos.length === 0) {
      toast.error('Vous devez attribuer au moins une permission au role');
      return;
    }

    const rolCreado: Rol = {
      id: `rol-${Date.now()}`,
      nombre: nuevoRol.nombre,
      descripcion: nuevoRol.descripcion,
      color: nuevoRol.color,
      permisos: nuevoRol.permisos,
      usuariosAsignados: 0,
      activo: true,
      predeterminado: false
    };

    setRoles([...roles, rolCreado]);
    toast.success(`Role "${nuevoRol.nombre}" cree avec succes`);
    setDialogRolOpen(false);
    setNuevoRol({ nombre: '', descripcion: '', color: '#1E73BE', permisos: [] });
  };

  const handleEditarRol = () => {
    if (!rolSeleccionado) return;

    setRoles(roles.map(r => 
      r.id === rolSeleccionado.id ? rolSeleccionado : r
    ));

    toast.success(`Role "${rolSeleccionado.nombre}" mis a jour avec succes`);
    setDialogPermisosOpen(false);
    setRolSeleccionado(null);
  };

  const handleEliminarRol = (rol: Rol) => {
    if (rol.predeterminado) {
      toast.error('Les roles predetermines du systeme ne peuvent pas etre supprimes');
      return;
    }

    if (rol.usuariosAsignados > 0) {
      toast.error(`Impossible de supprimer ce role car il a ${rol.usuariosAsignados} utilisateurs assignes`);
      return;
    }

    setRoles(roles.filter(r => r.id !== rol.id));
    toast.success(`Role "${rol.nombre}" supprime avec succes`);
  };

  const handleCrearUsuario = () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.rol) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const usuarioCreado: Usuario = {
      id: `user-${Date.now()}`,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      activo: nuevoUsuario.activo,
      ultimoAcceso: 'Jamais'
    };

    setUsuarios([...usuarios, usuarioCreado]);
    
    // Actualizar contador de usuarios asignados al rol
    setRoles(roles.map(r => 
      r.id === nuevoUsuario.rol 
        ? { ...r, usuariosAsignados: r.usuariosAsignados + 1 }
        : r
    ));

    toast.success(`Utilisateur "${nuevoUsuario.nombre}" cree avec succes`);
    setDialogUsuarioOpen(false);
    setNuevoUsuario({ nombre: '', email: '', rol: '', activo: true });
  };

  const togglePermisoRol = (permisoId: string) => {
    if (!rolSeleccionado) return;

    const permisosActualizados = rolSeleccionado.permisos.includes(permisoId)
      ? rolSeleccionado.permisos.filter(p => p !== permisoId)
      : [...rolSeleccionado.permisos, permisoId];

    setRolSeleccionado({
      ...rolSeleccionado,
      permisos: permisosActualizados
    });
  };

  const togglePermisoNuevoRol = (permisoId: string) => {
    setNuevoRol({
      ...nuevoRol,
      permisos: nuevoRol.permisos.includes(permisoId)
        ? nuevoRol.permisos.filter(p => p !== permisoId)
        : [...nuevoRol.permisos, permisoId]
    });
  };

  const getRolBadge = (rolId: string) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return <Badge>Inconnu</Badge>;

    return (
      <Badge style={{ backgroundColor: rol.color }}>
        {rol.nombre}
      </Badge>
    );
  };

  const rolesFiltrados = roles.filter(rol => {
    const cumpleBusqueda = rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleFiltro = filtroActivo === 'todos' ||
                        (filtroActivo === 'activos' && rol.activo) ||
                        (filtroActivo === 'inactivos' && !rol.activo);
    return cumpleBusqueda && cumpleFiltro;
  });

  const usuariosFiltrados = usuarios.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar permisos por módulo
  const permisosPorModulo = permisosDisponibles.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, Permiso[]>);

  useEffect(() => {
    const usuariosData = obtenerUsuarios();
    const usuariosFormateados = usuariosData.map(u => ({
      id: u.id,
      nombre: `${u.nombre} ${u.apellido}`,
      email: u.email,
      rol: u.rol,
      activo: true,
      ultimoAcceso: new Date().toLocaleDateString('fr-FR')
    }));
    setUsuarios(usuariosFormateados);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#333333' }}>
            Gestion des roles et permissions
          </h1>
          <p className="text-[#666666]">Administrer les roles, les permissions et les acces des utilisateurs du systeme</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Total des roles</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#1E73BE' }}>{roles.length}</p>
              </div>
              <Shield className="w-12 h-12 text-[#1E73BE] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Total des utilisateurs</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#4CAF50' }}>{usuarios.length}</p>
              </div>
              <Users className="w-12 h-12 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Utilisateurs actifs</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#FFC107' }}>
                  {usuarios.filter(u => u.activo).length}
                </p>
              </div>
              <UserCog className="w-12 h-12 text-[#FFC107] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#9C27B0]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666]">Total des permissions</p>
                <p className="font-bold" style={{ fontSize: '2rem', color: '#9C27B0' }}>{permisosDisponibles.length}</p>
              </div>
              <Key className="w-12 h-12 text-[#9C27B0] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={tabActual} onValueChange={(v: any) => setTabActual(v)} className="space-y-4">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="app-compact-tabs-grid w-full max-w-2xl gap-1 bg-transparent p-0" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <TabsTrigger value="roles" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Users className="w-4 h-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="permisos" className="app-compact-tab-trigger" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Lock className="w-4 h-4 mr-2" />
                Permissions
              </TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>
        </ModuleControlSurface>

        {/* Tab: Roles */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher des roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog open={dialogRolOpen} onOpenChange={setDialogRolOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E73BE] hover:bg-[#1557A0]">
                  <Plus className="w-4 h-4 mr-2" />
                  Creer un role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="crear-rol-description">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Creer un nouveau role
                  </DialogTitle>
                  <DialogDescription id="crear-rol-description">
                    Definissez le nom, la description et les permissions du nouveau role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du role *</Label>
                      <Input
                        value={nuevoRol.nombre}
                        onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
                        placeholder="ex : Superviseur"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur d'identification</Label>
                      <Input
                        type="color"
                        value={nuevoRol.color}
                        onChange={(e) => setNuevoRol({ ...nuevoRol, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={nuevoRol.descripcion}
                      onChange={(e) => setNuevoRol({ ...nuevoRol, descripcion: e.target.value })}
                      placeholder="Decrivez les responsabilites et la portee de ce role"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Permissions attribuees</Label>
                    <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-4">
                      {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                        <div key={modulo} className="space-y-2">
                          <p className="font-medium text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {modulo}
                          </p>
                          <div className="grid grid-cols-2 gap-2 pl-4">
                            {permisos.map(permiso => (
                              <div key={permiso.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={nuevoRol.permisos.includes(permiso.id)}
                                  onCheckedChange={() => togglePermisoNuevoRol(permiso.id)}
                                />
                                <Label className="text-sm cursor-pointer">
                                  {permiso.nombre}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogRolOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCrearRol} className="bg-[#4CAF50] hover:bg-[#45A049]">
                    <Check className="w-4 h-4 mr-2" />
                    Creer un role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Utilisateurs</TableHead>
                    <TableHead className="text-center">Permissions</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesFiltrados.map(rol => (
                    <TableRow key={rol.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5" style={{ color: rol.color }} />
                          <div>
                            <p className="font-medium">{rol.nombre}</p>
                            {rol.predeterminado && (
                              <Badge variant="outline" className="text-xs">Systeme</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#666666]">{rol.descripcion}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#1E73BE]">{rol.usuariosAsignados}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-[#4CAF50]">{rol.permisos.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {rol.activo ? (
                          <Badge className="bg-[#4CAF50]">Actif</Badge>
                        ) : (
                          <Badge className="bg-[#DC3545]">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRolSeleccionado(rol);
                              setDialogPermisosOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!rol.predeterminado && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEliminarRol(rol)}
                            >
                              <Trash2 className="w-4 h-4 text-[#DC3545]" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Usuarios */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog open={dialogUsuarioOpen} onOpenChange={setDialogUsuarioOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4CAF50] hover:bg-[#45A049]">
                  <Plus className="w-4 h-4 mr-2" />
                  Creer un utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby="crear-usuario-description">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Creer un nouvel utilisateur
                  </DialogTitle>
                  <DialogDescription id="crear-usuario-description">
                    Completez les informations du nouvel utilisateur et attribuez un role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nom complet *</Label>
                    <Input
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                      placeholder="Nom et prenom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                      placeholder="usuario@bancoalimentos.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={nuevoUsuario.rol} onValueChange={(val) => setNuevoUsuario({ ...nuevoUsuario, rol: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner un role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.filter(r => r.activo).map(rol => (
                          <SelectItem key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={nuevoUsuario.activo}
                      onCheckedChange={(val) => setNuevoUsuario({ ...nuevoUsuario, activo: val })}
                    />
                    <Label>Utilisateur actif</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogUsuarioOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCrearUsuario} className="bg-[#4CAF50] hover:bg-[#45A049]">
                    Creer un utilisateur
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Dernier acces</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map(usuario => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nombre}</TableCell>
                      <TableCell className="text-sm text-[#666666]">{usuario.email}</TableCell>
                      <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                      <TableCell className="text-sm text-[#666666]">{usuario.ultimoAcceso}</TableCell>
                      <TableCell className="text-center">
                        {usuario.activo ? (
                          <Badge className="bg-[#4CAF50]">Activo</Badge>
                        ) : (
                          <Badge className="bg-[#DC3545]">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const usuariosData = obtenerUsuarios();
                              const usuarioCompleto = usuariosData.find(u => u.id === usuario.id);
                              if (usuarioCompleto) {
                                setUsuarioPasswordSeleccionado({ 
                                  id: usuarioCompleto.id, 
                                  nombre: usuario.nombre, 
                                  username: usuarioCompleto.username 
                                });
                                setDialogPasswordOpen(true);
                              }
                            }}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-[#DC3545]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Permisos */}
        <TabsContent value="permisos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                Catálogo de Permisos del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                  <div key={modulo} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {modulo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permisos.map(permiso => {
                        const Icono = permiso.icono;
                        return (
                          <div key={permiso.id} className="flex items-start gap-3 p-3 border rounded hover:bg-[#F4F4F4] transition">
                            <Icono className="w-5 h-5 text-[#1E73BE] mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium">{permiso.nombre}</p>
                              <p className="text-sm text-[#666666]">{permiso.descripcion}</p>
                              <p className="text-xs text-[#999999] mt-1">ID: {permiso.id}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Ver/Editar Permisos de Rol */}
      <Dialog open={dialogPermisosOpen} onOpenChange={setDialogPermisosOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="permisos-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                Permissions du role : {rolSeleccionado?.nombre}
            </DialogTitle>
            <DialogDescription id="permisos-dialog-description">
              {rolSeleccionado?.descripcion}
            </DialogDescription>
          </DialogHeader>
          {rolSeleccionado && (
            <div className="space-y-4 py-4">
              <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-4">
                {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
                  <div key={modulo} className="space-y-2">
                    <p className="font-medium text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {modulo}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {permisos.map(permiso => (
                        <div key={permiso.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={rolSeleccionado.permisos.includes(permiso.id)}
                            onCheckedChange={() => togglePermisoRol(permiso.id)}
                            disabled={rolSeleccionado.predeterminado && rolSeleccionado.id === 'admin'}
                          />
                          <Label className="text-sm cursor-pointer">
                            {permiso.nombre}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {rolSeleccionado.predeterminado && rolSeleccionado.id === 'admin' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Le role Administrateur ne peut pas etre modifie car il s'agit d'un role systeme avec toutes les permissions.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogPermisosOpen(false);
              setRolSeleccionado(null);
            }}>
              Fermer
            </Button>
            {rolSeleccionado && !rolSeleccionado.predeterminado && (
              <Button onClick={handleEditarRol} className="bg-[#4CAF50] hover:bg-[#45A049]">
                <Check className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cambiar Contraseña de Usuario */}
      {usuarioPasswordSeleccionado && (
        <GestionPasswordDialog
          open={dialogPasswordOpen}
          onOpenChange={setDialogPasswordOpen}
          usuarioId={usuarioPasswordSeleccionado.id}
          nombreUsuario={usuarioPasswordSeleccionado.nombre}
          username={usuarioPasswordSeleccionado.username}
        />
      )}
    </div>
  );
}