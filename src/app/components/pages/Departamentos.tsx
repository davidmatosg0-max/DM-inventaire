import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AdaptiveBrandLogo } from '../shared/AdaptiveBrandLogo';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Settings,
  Home,
  Warehouse,
  Apple,
  Utensils,
  Users,
  Briefcase,
  Car,
  UserPlus,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  DollarSign,
  BarChart,
  ChefHat,
  Sparkles,
  Shield,
  User,
  Mail,
  Phone,
  Briefcase as BriefcaseIcon,
  Image as ImageIcon
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  obtenerDepartamentos,
  guardarDepartamento,
  actualizarDepartamento,
  eliminarDepartamento,
  inicializarDepartamentos,
  type Departamento
} from '../../utils/departamentosStorage';
import { obtenerContactosDepartamento } from '../../utils/contactosDepartamentoStorage';
import { sincronizarVoluntariosEntrepot } from '../../utils/sincronizarVoluntariosEntrepot';
import { registrarActividad } from '../../utils/actividadLogger';

// Mapa de iconos disponibles
const iconosDisponibles: Record<string, React.ElementType> = {
  Home,
  Warehouse,
  Apple,
  Utensils,
  Users,
  Briefcase,
  Car,
  UserPlus,
  Package,
  ShoppingCart,
  Truck,
  FileText,
  DollarSign,
  BarChart,
  Building2,
  ChefHat,
  ImageIcon
};

export function Departamentos({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<Departamento | null>(null);
  const [mostrarGestion, setMostrarGestion] = useState(false);

  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    icono: 'Building2',
    color: '#1a4d7a',
    activo: true,
    orden: 0,
    descripcion: '',
    contacto: {
      nombre: '',
      email: '',
      telefono: '',
      cargo: '',
      foto: ''
    }
  });

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const cargarDepartamentos = () => {
    const deps = obtenerDepartamentos();
    setDepartamentos(deps);
  };

  const limpiarFormulario = () => {
    setFormulario({
      codigo: '',
      nombre: '',
      icono: 'Building2',
      color: '#1a4d7a',
      activo: true,
      orden: departamentos.length + 1,
      descripcion: '',
      contacto: {
        nombre: '',
        email: '',
        telefono: '',
        cargo: '',
        foto: ''
      }
    });
    setModoEdicion(false);
    setDepartamentoSeleccionado(null);
  };

  const abrirDialogoNuevo = () => {
    limpiarFormulario();
    setDialogAbierto(true);
  };

  const abrirDialogoEditar = (departamento: Departamento) => {
    setFormulario({
      codigo: departamento.codigo,
      nombre: departamento.nombre,
      icono: departamento.icono,
      color: departamento.color,
      activo: departamento.activo,
      orden: departamento.orden,
      descripcion: departamento.descripcion,
      contacto: departamento.contacto || {
        nombre: '',
        email: '',
        telefono: '',
        cargo: '',
        foto: ''
      }
    });
    setDepartamentoSeleccionado(departamento);
    setModoEdicion(true);
    setDialogAbierto(true);
  };

  const handleGuardar = () => {
    if (!formulario.codigo.trim() || !formulario.nombre.trim()) {
      toast.error(t('departments.fieldsRequired'));
      return;
    }

    if (modoEdicion && departamentoSeleccionado) {
      actualizarDepartamento(departamentoSeleccionado.id, formulario);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Départements',
        'modificar',
        `Département "${formulario.nombre}" modifié`,
        { departamentoId: departamentoSeleccionado.id, codigo: formulario.codigo }
      );
      
      toast.success(t('departments.departmentUpdated'));
    } else {
      const nuevoDept = guardarDepartamento(formulario);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Départements',
        'crear',
        `Département "${formulario.nombre}" créé`,
        { codigo: formulario.codigo }
      );
      
      toast.success(t('departments.departmentCreated'));
    }

    cargarDepartamentos();
    setDialogAbierto(false);
    limpiarFormulario();
  };

  const handleEliminar = () => {
    if (departamentoSeleccionado) {
      eliminarDepartamento(departamentoSeleccionado.id);
      
      // 📝 REGISTRAR ACTIVIDAD
      registrarActividad(
        'Départements',
        'eliminar',
        `Département "${departamentoSeleccionado.nombre}" supprimé`,
        { departamentoId: departamentoSeleccionado.id, codigo: departamentoSeleccionado.codigo }
      );
      
      toast.success(t('departments.departmentDeleted'));
      cargarDepartamentos();
      setDialogEliminar(false);
      setDepartamentoSeleccionado(null);
    }
  };

  const handleToggleActivo = (departamento: Departamento) => {
    actualizarDepartamento(departamento.id, {
      ...departamento,
      activo: !departamento.activo
    });

    registrarActividad(
      'Départements',
      'modificar',
      `Département "${departamento.nombre}" ${departamento.activo ? 'désactivé' : 'activé'}`,
      { departamentoId: departamento.id, codigo: departamento.codigo, activo: !departamento.activo }
    );

    toast.success(
      departamento.activo
        ? `Département ${departamento.nombre} désactivé`
        : `Département ${departamento.nombre} activé`
    );

    cargarDepartamentos();
  };

  const renderIcono = (nombreIcono: string, className?: string) => {
    const Icono = iconosDisponibles[nombreIcono] || Building2;
    return <Icono className={className} />;
  };

  // Organizar departamentos en filas (3, 3, 1 como en la imagen)
  const organizarEnFilas = () => {
    const filas: Departamento[][] = [];
    const activos = departamentos.filter(d => d.activo);
    
    for (let i = 0; i < activos.length; i += 3) {
      filas.push(activos.slice(i, i + 3));
    }
    
    return filas;
  };

  if (mostrarGestion) {
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

        {/* Contenedor principal */}
        <div className="relative z-10 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Header con glassmorphism */}
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => setMostrarGestion(false)}
                  className="text-white text-sm sm:text-base"
                  style={{ backgroundColor: branding.primaryColor }}
                  size="sm"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t('common.back')}
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                    {t('departments.management')}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#666666] mt-1">{t('departments.managementSubtitle')}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  onClick={abrirDialogoNuevo}
                  className="text-white flex-1 sm:flex-none text-sm sm:text-base"
                  style={{ backgroundColor: branding.secondaryColor }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  {t('departments.addDepartment')}
                </Button>
              </div>
            </div>
          </div>

          {/* Grid de departamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {departamentos.map((departamento, index) => {
              // Alternar entre colores del branding
              const cardColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
              
              return (
                <Card key={departamento.id} className={`p-3 sm:p-4 hover:shadow-lg transition-shadow ${departamento.activo ? '' : 'opacity-75'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                          boxShadow: `0 4px 12px ${cardColor}30`
                        }}
                      >
                        {renderIcono(departamento.icono, 'w-5 h-5 sm:w-6 sm:h-6')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-[#333333] truncate">{departamento.nombre}</h3>
                        <p className="text-xs sm:text-sm text-[#666666] truncate">{departamento.codigo}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{
                              backgroundColor: departamento.activo ? '#DCFCE7' : '#FEE2E2',
                              color: departamento.activo ? '#166534' : '#991B1B'
                            }}
                          >
                            {departamento.activo ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {departamento.descripcion && (
                          <p className="text-xs text-[#999999] truncate mt-0.5">{departamento.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActivo(departamento)}
                        className="p-1.5 sm:p-2"
                        title={departamento.activo ? 'Désactiver le département' : 'Activer le département'}
                      >
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: departamento.activo ? '#D97706' : '#15803D' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirDialogoEditar(departamento)}
                        className="p-1.5 sm:p-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: branding.primaryColor }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDepartamentoSeleccionado(departamento);
                          setDialogEliminar(true);
                        }}
                        className="p-1.5 sm:p-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#c23934' }} />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Información de contacto */}
                  {departamento.contacto && departamento.contacto.nombre && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <User className="w-3.5 h-3.5" style={{ color: cardColor }} />
                        <span className="text-xs font-semibold" style={{ color: cardColor }}>Contact</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <User className="w-3 h-3 mt-0.5 text-[#666666] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#333333] font-medium truncate">{departamento.contacto.nombre}</p>
                            {departamento.contacto.cargo && (
                              <p className="text-xs text-[#999999] truncate">{departamento.contacto.cargo}</p>
                            )}
                          </div>
                        </div>
                        {departamento.contacto.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-[#666666] flex-shrink-0" />
                            <a 
                              href={`mailto:${departamento.contacto.email}`}
                              className="text-xs text-[#666666] hover:underline truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {departamento.contacto.email}
                            </a>
                          </div>
                        )}
                        {departamento.contacto.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-[#666666] flex-shrink-0" />
                            <a 
                              href={`tel:${departamento.contacto.telefono}`}
                              className="text-xs text-[#666666] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {departamento.contacto.telefono}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Dialog Crear/Editar */}
          <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
            <DialogContent className="max-w-md mx-3 sm:mx-auto max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="departamento-dialog-description">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {modoEdicion ? t('departments.editDepartment') : t('departments.newDepartment')}
                </DialogTitle>
                <DialogDescription id="departamento-dialog-description" className="text-xs sm:text-sm">
                  {t('departments.formDescription')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="codigo">{t('departments.departmentCode')} *</Label>
                  <Input
                    id="codigo"
                    value={formulario.codigo}
                    onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value.toUpperCase() })}
                    placeholder="ENTREPOT"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="nombre">{t('departments.departmentName')} *</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    placeholder="Entrepôt"
                  />
                </div>

                <div>
                  <Label htmlFor="icono">{t('departments.icon')}</Label>
                  <Select
                    value={formulario.icono}
                    onValueChange={(value) => setFormulario({ ...formulario, icono: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectionner une icone">{formulario.icono}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(iconosDisponibles).map((icono) => (
                        <SelectItem key={icono} value={icono}>{icono}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="orden">{t('departments.order')}</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formulario.orden}
                    onChange={(e) => setFormulario({ ...formulario, orden: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Sección de contacto - Solo para ciertos departamentos */}
                {(formulario.codigo === 'ENTREPOT' || formulario.codigo === 'COMPTOIR' || 
                  formulario.codigo === 'CUISINE' || formulario.codigo === 'RECRUTEMENT' || 
                  formulario.codigo === 'LIAISON') && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: branding.primaryColor }}>
                      <User className="w-4 h-4" />
                      Informations de contact
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="contacto-nombre" className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          Nom du responsable
                        </Label>
                        <Input
                          id="contacto-nombre"
                          value={formulario.contacto.nombre}
                          onChange={(e) => setFormulario({ 
                            ...formulario, 
                            contacto: { ...formulario.contacto, nombre: e.target.value }
                          })}
                          placeholder="Jean Dupont"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contacto-cargo" className="flex items-center gap-1.5">
                          <BriefcaseIcon className="w-3.5 h-3.5" />
                          Poste
                        </Label>
                        <Select
                          value={formulario.contacto.cargo || ''}
                          onValueChange={(value) => setFormulario({ 
                            ...formulario, 
                            contacto: { ...formulario.contacto, cargo: value }
                          })}
                        >
                          <SelectTrigger id="contacto-cargo">
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Directeur">Directeur</SelectItem>
                            <SelectItem value="Coordinateur">Coordinateur</SelectItem>
                            <SelectItem value="Responsable">Responsable</SelectItem>
                            <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                            <SelectItem value="Superviseur">Superviseur</SelectItem>
                            <SelectItem value="Assistant">Assistant</SelectItem>
                            <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
                            <SelectItem value="Administrateur">Administrateur</SelectItem>
                            <SelectItem value="Bénévole">Bénévole</SelectItem>
                            <SelectItem value="Volontaire">Volontaire</SelectItem>
                            <SelectItem value="Stagiaire">Stagiaire</SelectItem>
                            <SelectItem value="Conseiller">Conseiller</SelectItem>
                            <SelectItem value="Technicien">Technicien</SelectItem>
                            <SelectItem value="Spécialiste">Spécialiste</SelectItem>
                            <SelectItem value="Analyste">Analyste</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="contacto-email" className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </Label>
                        <Input
                          id="contacto-email"
                          type="email"
                          value={formulario.contacto.email}
                          onChange={(e) => setFormulario({ 
                            ...formulario, 
                            contacto: { ...formulario.contacto, email: e.target.value }
                          })}
                          placeholder="jean.dupont@email.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contacto-telefono" className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          Téléphone
                        </Label>
                        <Input
                          id="contacto-telefono"
                          type="tel"
                          value={formulario.contacto.telefono}
                          onChange={(e) => setFormulario({ 
                            ...formulario, 
                            contacto: { ...formulario.contacto, telefono: e.target.value }
                          })}
                          placeholder="(514) 555-0123"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contacto-foto" className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Photo de profil (URL)
                        </Label>
                        <Input
                          id="contacto-foto"
                          type="url"
                          value={formulario.contacto.foto}
                          onChange={(e) => setFormulario({ 
                            ...formulario, 
                            contacto: { ...formulario.contacto, foto: e.target.value }
                          })}
                          placeholder="https://exemple.com/photo.jpg"
                        />
                        {formulario.contacto.foto && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: branding.primaryColor }}>
                              <ImageWithFallback 
                                src={formulario.contacto.foto} 
                                alt="Aperçu" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-[#666666]">Aperçu de la photo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogAbierto(false);
                    limpiarFormulario();
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleGuardar}
                  className="text-white"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  {t('common.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog Eliminar */}
          <Dialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
            <DialogContent aria-describedby="eliminar-departamento-description">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2" style={{ color: '#c23934' }}>
                  <Trash2 className="w-5 h-5" />
                  {t('departments.confirmDelete')}
                </DialogTitle>
                <DialogDescription id="eliminar-departamento-description">
                  {t('departments.confirmDeleteMessage')}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogEliminar(false);
                    setDepartamentoSeleccionado(null);
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleEliminar}
                  className="text-white"
                  style={{ backgroundColor: '#c23934' }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('common.delete')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Vista principal - Similar a la imagen con estilo moderno
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: '#1a4d7a' }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: '#2d9561' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: '#1a4d7a' }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-4xl">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Logo con efecto glow */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              {/* Glow effect detrás del logo */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                style={{ borderColor: branding.primaryColor }}
              >
                {branding.logo ? (
                  <AdaptiveBrandLogo
                    src={branding.logo}
                    alt="Logo"
                    wrapperClassName="h-full w-full"
                    borderWidthClassName="border-0"
                    shadowClassName=""
                    imageStyle={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset' }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Título con icono y efecto Sparkles */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Building2 
              className="w-6 h-6 sm:w-8 sm:h-8" 
              style={{ color: branding.primaryColor }}
            />
            <h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              {t('departments.title')}
            </h1>
            <Sparkles 
              className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
              style={{ color: branding.secondaryColor }}
            />
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-center">
            <p className="text-sm font-medium text-slate-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              La gestion des départements est disponible uniquement dans Utilisateurs/Rôles, onglet Départements.
            </p>
          </div>

          {/* Botones de departamentos organizados en filas - Con estilo moderno */}
          <div className="space-y-3 sm:space-y-4">
            {organizarEnFilas().map((fila, filaIndex) => (
              <div 
                key={filaIndex} 
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center"
              >
                {fila.map((departamento, index) => {
                  const isDisabled = departamento.codigo !== 'ENTREPOT' && 
                                    departamento.codigo !== 'COMPTOIR' && 
                                    departamento.codigo !== 'RECRUTEMENT' && 
                                    departamento.codigo !== 'LIAISON' && 
                                    departamento.codigo !== 'CUISINE' &&
                                    departamento.codigo !== 'PTC' &&
                                    departamento.codigo !== 'MAINTIEN' &&
                                    departamento.codigo !== 'ACHAT';
                  
                  // Alternar entre colores primario y secundario del branding
                  const buttonColor = index % 2 === 0 ? branding.primaryColor : branding.secondaryColor;
                  
                  // Obtener nombre traducido del departamento
                  const departmentNameKey = `departments.names.${departamento.codigo}`;
                  const departmentNameTranslation = t(departmentNameKey);
                  const departmentName = departmentNameTranslation === departmentNameKey
                    ? departamento.nombre
                    : departmentNameTranslation;
                  
                  // Obtener contador de contactos para este departamento
                  const contactosCount = obtenerContactosDepartamento(departamento.id).filter(c => c.activo).length;
                  
                  return (
                    <button
                      key={departamento.id}
                      disabled={isDisabled}
                      className={`relative h-14 sm:h-16 md:h-20 px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg font-semibold text-white rounded-xl transition-all duration-300 w-full sm:w-auto overflow-hidden group ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl'
                      }`}
                      style={{ 
                        background: isDisabled 
                          ? `linear-gradient(135deg, ${buttonColor}80 0%, ${buttonColor}60 100%)` 
                          : `linear-gradient(135deg, ${buttonColor} 0%, ${buttonColor}dd 100%)`,
                        minWidth: fila.length === 1 ? '240px' : undefined,
                        fontFamily: 'Montserrat, sans-serif',
                        boxShadow: isDisabled ? 'none' : `0 4px 15px ${buttonColor}40`
                      }}
                      onClick={() => {
                        if (departamento.codigo === 'ENTREPOT') {
                          if (onNavigate) {
                            onNavigate('dashboard');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else if (departamento.codigo === 'COMPTOIR') {
                          if (onNavigate) {
                            onNavigate('id-digital');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else if (departamento.codigo === 'RECRUTEMENT') {
                          if (onNavigate) {
                            onNavigate('recrutement');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else if (departamento.codigo === 'LIAISON') {
                          if (onNavigate) {
                            onNavigate('liaison');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else if (departamento.codigo === 'CUISINE') {
                          if (onNavigate) {
                            onNavigate('cuisine');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else if (departamento.codigo === 'ACHAT') {
                          if (onNavigate) {
                            onNavigate('achat');
                          } else {
                            toast.success(`${t('common.navigating')} ${departmentName}`);
                          }
                        } else {
                          toast.info(t('departments.comingSoon'));
                        }
                      }}
                    >
                      {/* Efecto de brillo al hover */}
                      {!isDisabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      )}
                      
                      <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                        {renderIcono(departamento.icono, 'w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300')}
                        {departmentName}
                        {contactosCount > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {contactosCount}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {departamentos.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{t('departments.noDepartments')}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Utilisez le module Utilisateurs/Rôles, onglet Départements, pour créer ou administrer les départements.
              </p>
            </div>
          )}

          {/* Footer decorativo */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-transparent via-gray-100/50 to-transparent">
              <Shield className="w-4 h-4" style={{ color: branding.primaryColor }} />
              <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {branding.systemName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}