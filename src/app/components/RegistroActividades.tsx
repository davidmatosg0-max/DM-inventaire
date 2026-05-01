import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../hooks/useBranding';
import { 
  Activity, 
  Filter, 
  Search, 
  Download, 
  Trash2, 
  User, 
  Calendar,
  Clock,
  Package,
  FolderTree,
  ClipboardList,
  Building,
  Users,
  Edit,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { type ActividadLog } from '../utils/actividadLogger';

interface RegistroActividadesProps {
  filtroModulo?: string;
}

export function RegistroActividades({ filtroModulo }: RegistroActividadesProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  
  const [actividades, setActividades] = useState<ActividadLog[]>([]);
  const [actividadesFiltradas, setActividadesFiltradas] = useState<ActividadLog[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState<string>('todas');
  const [filtroModuloLocal, setFiltroModuloLocal] = useState<string>(filtroModulo || 'todos');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar actividades desde localStorage
  useEffect(() => {
    cargarActividades();
    
    // Escuchar nuevas actividades
    const handleNuevaActividad = (event: CustomEvent) => {
      cargarActividades();
    };
    
    window.addEventListener('actividadRegistrada', handleNuevaActividad as EventListener);
    
    return () => {
      window.removeEventListener('actividadRegistrada', handleNuevaActividad as EventListener);
    };
  }, []);

  const cargarActividades = () => {
    try {
      const actividadesGuardadas = JSON.parse(localStorage.getItem('registroActividades') || '[]');
      setActividades(actividadesGuardadas);
      setActividadesFiltradas(actividadesGuardadas);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActividades([]);
      setActividadesFiltradas([]);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...actividades];

    // Filtro de búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(act => 
        act.usuario.toLowerCase().includes(busquedaLower) ||
        act.descripcion.toLowerCase().includes(busquedaLower) ||
        act.modulo.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de acción
    if (filtroAccion !== 'todas') {
      resultado = resultado.filter(act => act.accion === filtroAccion);
    }

    // Filtro de módulo
    if (filtroModuloLocal !== 'todos') {
      resultado = resultado.filter(act => act.modulo === filtroModuloLocal);
    }

    // Filtro de usuario
    if (filtroUsuario !== 'todos') {
      resultado = resultado.filter(act => act.usuarioId === filtroUsuario);
    }

    // Filtro de fecha inicio
    if (fechaInicio) {
      resultado = resultado.filter(act => act.fecha >= fechaInicio);
    }

    // Filtro de fecha fin
    if (fechaFin) {
      resultado = resultado.filter(act => act.fecha <= fechaFin);
    }

    setActividadesFiltradas(resultado);
  }, [actividades, busqueda, filtroAccion, filtroModuloLocal, filtroUsuario, fechaInicio, fechaFin]);

  // Obtener lista única de usuarios
  const usuariosUnicos = Array.from(new Set(actividades.map(act => act.usuarioId)))
    .map(id => {
      const actividad = actividades.find(act => act.usuarioId === id);
      return { id, nombre: actividad?.usuario || 'Desconocido' };
    });

  // Obtener lista única de módulos
  const modulosUnicos = Array.from(new Set(actividades.map(act => act.modulo)));

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroAccion('todas');
    setFiltroModuloLocal(filtroModulo || 'todos');
    setFiltroUsuario('todos');
    setFechaInicio('');
    setFechaFin('');
  };

  // Exportar actividades a JSON
  const exportarActividades = () => {
    try {
      const dataStr = JSON.stringify(actividadesFiltradas, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `registro-actividades-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Activités exportées avec succès');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Erreur lors de l\'exportation');
    }
  };

  // Limpiar registro completo
  const limpiarRegistro = () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUT le registre d\'activités? Cette action est irréversible.')) {
      localStorage.removeItem('registroActividades');
      setActividades([]);
      setActividadesFiltradas([]);
      toast.success('Registre d\'activités supprimé');
    }
  };

  // Generar datos de demostración
  const generarDatosDemostracion = () => {
    const actividadesDemo = [
      {
        id: 'demo-1',
        fecha: new Date().toLocaleDateString('fr-CA'),
        hora: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Inventaire',
        accion: 'crear' as const,
        descripcion: 'Produit "Riz 1kg" créé avec succès',
        detalles: { productoId: 'prod-001' }
      },
      {
        id: 'demo-2',
        fecha: new Date(Date.now() - 3600000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 3600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Commandes',
        accion: 'modificar' as const,
        descripcion: 'Commande #12345 modifiée - Statut changé à "En préparation"',
        detalles: { comandaId: 'cmd-001' }
      },
      {
        id: 'demo-3',
        fecha: new Date(Date.now() - 7200000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 7200000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Organismes',
        accion: 'crear' as const,
        descripcion: 'Organisme "Banque Alimentaire Montréal" créé',
        detalles: { organismoId: 'org-001' }
      },
      {
        id: 'demo-4',
        fecha: new Date(Date.now() - 10800000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 10800000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Catégories',
        accion: 'modificar' as const,
        descripcion: 'Catégorie "Produits Laitiers" mise à jour - Valeur CAD$ 4.50/kg',
        detalles: { categoriaId: 'cat-001' }
      },
      {
        id: 'demo-5',
        fecha: new Date(Date.now() - 14400000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 14400000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Inventaire',
        accion: 'eliminar' as const,
        descripcion: 'Produit "Produit Test" supprimé',
        detalles: { productoId: 'prod-test' }
      },
      {
        id: 'demo-6',
        fecha: new Date(Date.now() - 18000000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 18000000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Utilisateurs',
        accion: 'crear' as const,
        descripcion: 'Nouvel utilisateur "Marie Dubois" créé avec rôle Gestionnaire',
        detalles: { usuarioId: 'user-002' }
      },
      {
        id: 'demo-7',
        fecha: new Date(Date.now() - 21600000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 21600000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Commandes',
        accion: 'crear' as const,
        descripcion: 'Nouvelle commande #12346 créée pour "Centre d\'Accueil" - 15 produits',
        detalles: { comandaId: 'cmd-002' }
      },
      {
        id: 'demo-8',
        fecha: new Date(Date.now() - 25200000).toLocaleDateString('fr-CA'),
        hora: new Date(Date.now() - 25200000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        usuario: 'David',
        usuarioId: '1',
        modulo: 'Inventaire',
        accion: 'modificar' as const,
        descripcion: 'Stock de "Pâtes Alimentaires 500g" ajusté de 100 à 150 unités',
        detalles: { productoId: 'prod-002' }
      }
    ];

    localStorage.setItem('registroActividades', JSON.stringify(actividadesDemo));
    cargarActividades();
    toast.success('Données de démonstration générées avec succès!');
  };

  // Obtener icono según el tipo de acción
  const obtenerIconoAccion = (accion: string) => {
    switch (accion) {
      case 'crear':
        return <Plus className="w-4 h-4" />;
      case 'modificar':
        return <Edit className="w-4 h-4" />;
      case 'eliminar':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Obtener color según el tipo de acción
  const obtenerColorAccion = (accion: string) => {
    switch (accion) {
      case 'crear':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'modificar':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'eliminar':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Obtener icono según le módulo
  const obtenerIconoModulo = (modulo: string) => {
    const moduloLower = modulo.toLowerCase();
    if (moduloLower.includes('inventario') || moduloLower.includes('produit')) return <Package className="w-4 h-4" />;
    if (moduloLower.includes('categoría') || moduloLower.includes('catégorie')) return <FolderTree className="w-4 h-4" />;
    if (moduloLower.includes('comanda') || moduloLower.includes('commande')) return <ClipboardList className="w-4 h-4" />;
    if (moduloLower.includes('organismo') || moduloLower.includes('organisme')) return <Building className="w-4 h-4" />;
    if (moduloLower.includes('usuario') || moduloLower.includes('utilisateur')) return <Users className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="backdrop-blur-lg bg-white/80 border-2 border-white/60 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1a4d7a]/5 to-[#2d9561]/5 border-b border-gray-200/50 pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a4d7a' }}>
            <div className="p-2 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            Journal d'Activités
            <Badge variant="outline" className="ml-auto text-lg px-3 py-1">
              {actividadesFiltradas.length} activités
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro Acción */}
            <Select value={filtroAccion} onValueChange={setFiltroAccion}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toutes les actions</SelectItem>
                <SelectItem value="crear">Créations</SelectItem>
                <SelectItem value="modificar">Modifications</SelectItem>
                <SelectItem value="eliminar">Suppressions</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Módulo */}
            <Select value={filtroModuloLocal} onValueChange={setFiltroModuloLocal}>
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Tous les modules</SelectItem>
                {modulosUnicos.map(modulo => (
                  <SelectItem key={modulo} value={modulo}>{modulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Usuario */}
            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger>
                <SelectValue placeholder="Utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Tous les utilisateurs</SelectItem>
                {usuariosUnicos.map(usuario => (
                  <SelectItem key={usuario.id} value={usuario.id}>{usuario.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fecha Inicio */}
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              placeholder="Date début"
            />

            {/* Fecha Fin */}
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              placeholder="Date fin"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={limpiarFiltros}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Réinitialiser les filtres
            </Button>

            <Button
              onClick={exportarActividades}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
            >
              <Download className="w-4 h-4" />
              Exporter ({actividadesFiltradas.length})
            </Button>

            <Button
              onClick={limpiarRegistro}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer tout le registre
            </Button>
          </div>

          {/* Tabla de actividades */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] z-10">
                  <TableRow>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Heure
                      </div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Utilisateur
                      </div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Module
                      </div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Action
                      </div>
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actividadesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                          <p>Aucune activité trouvée</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    actividadesFiltradas.map((actividad) => (
                      <TableRow key={actividad.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium">
                          {actividad.fecha}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {actividad.hora}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] flex items-center justify-center text-white text-xs font-bold">
                              {actividad.usuario.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium">{actividad.usuario}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {obtenerIconoModulo(actividad.modulo)}
                            <span className="text-sm">{actividad.modulo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 w-fit ${obtenerColorAccion(actividad.accion)}`}>
                            {obtenerIconoAccion(actividad.accion)}
                            {actividad.accion === 'crear' && 'Création'}
                            {actividad.accion === 'modificar' && 'Modification'}
                            {actividad.accion === 'eliminar' && 'Suppression'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {actividad.descripcion}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {actividadesFiltradas.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créations</p>
                  <p className="text-2xl font-bold text-green-700">
                    {actividadesFiltradas.filter(a => a.accion === 'crear').length}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modifications</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {actividadesFiltradas.filter(a => a.accion === 'modificar').length}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="p-3 bg-red-500 rounded-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Suppressions</p>
                  <p className="text-2xl font-bold text-red-700">
                    {actividadesFiltradas.filter(a => a.accion === 'eliminar').length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}