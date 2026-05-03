import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Download, Upload, QrCode, IdCard, X, Camera, Mail, Phone, MapPin, Calendar, Badge as BadgeIcon, Briefcase, FileText, Paperclip, DollarSign, ShoppingCart, Gift, Building2, Settings, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { LanguageSelector } from '../ui/language-selector';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { EnviarCredencialesID } from '../EnviarCredencialesID';
import { IDDigitalUsuarioInterno } from '../usuarios/IDDigitalUsuarioInterno';
import { FormularioUsuarioInternoCompacto } from '../usuarios/FormularioUsuarioInternoCompacto';
import { mockUsuariosInternos } from '../../data/mockData';
import type { UsuarioInterno, IdiomaUsuarioInterno } from '../../types';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../utils/formatUtils';
import { generateBrandedQrDataUrl } from '../../utils/brandedQr';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { obtenerDepartamentos } from '../../utils/departamentosStorage';

type Transaccion = {
  id: string;
  fecha: string;
  tipo: 'compra' | 'donacion';
  descripcion: string;
  monto: number;
  cantidad?: string;
  documento?: string;
};

const categoriaConfig = {
  benevole: { 
    label: 'Voluntario', 
    color: '#4CAF50', 
    icon: '🤝',
    description: 'Bénévole de la Banque Alimentaire'
  },
  empleado: { 
    label: 'Empleado', 
    color: '#1E73BE', 
    icon: '👔',
    description: 'Personal contratado'
  },
  programa: { 
    label: 'Programa', 
    color: '#FFC107', 
    icon: '📋',
    description: 'Participante de programas'
  },
  ptc: { 
    label: 'PTC', 
    color: '#DC3545', 
    icon: '🎯',
    description: 'Programa de Trabajo Comunitario'
  },
  donador: { 
    label: 'Donador', 
    color: '#FF9800', 
    icon: '💰',
    description: 'Donador de alimentos'
  },
  vendedor: { 
    label: 'Vendedor', 
    color: '#9C27B0',
    icon: '🛍️',
    description: 'Vendedor de productos'
  }
};

export function UsuariosInternos() {
  const { t } = useTranslation();
  
  // Configuración de categorías traducidas
  const getCategoriaConfig = () => ({
    benevole: { 
      label: t('contacts.volunteer'), 
      color: '#4CAF50', 
      icon: '🤝',
      description: t('contacts.volunteerDesc')
    },
    empleado: { 
      label: t('contacts.employee'), 
      color: '#1E73BE', 
      icon: '👔',
      description: t('contacts.employeeDesc')
    },
    programa: { 
      label: t('contacts.program'), 
      color: '#FFC107', 
      icon: '📋',
      description: t('contacts.programDesc')
    },
    ptc: { 
      label: t('contacts.ptc'), 
      color: '#DC3545', 
      icon: '🎯',
      description: t('contacts.ptcDesc')
    },
    donador: { 
      label: t('contacts.donor'), 
      color: '#FF9800', 
      icon: '💰',
      description: t('contacts.donorDesc')
    },
    vendedor: { 
      label: t('contacts.vendor'), 
      color: '#9C27B0',
      icon: '🛍️',
      description: t('contacts.vendorDesc')
    }
  });
  
  const categoriaConfig = getCategoriaConfig();
  
  // Verificar si el usuario actual es desarrollador
  const usuarioActual = obtenerUsuarioSesion();
  const esDesarrollador = usuarioActual?.permisos?.includes('desarrollador' as any) || false;
  
  const [usuarios, setUsuarios] = useState<UsuarioInterno[]>(mockUsuariosInternos);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [idDigitalOpen, setIdDigitalOpen] = useState(false);
  const [perfilDialogOpen, setPerfilDialogOpen] = useState(false);
  const [historialDialogOpen, setHistorialDialogOpen] = useState(false);
  const [departamentosDialogOpen, setDepartamentosDialogOpen] = useState(false);
  const [eliminarDialogOpen, setEliminarDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioInterno | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<string | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioInterno | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [nuevaTransaccion, setNuevaTransaccion] = useState<Partial<Transaccion>>({
    tipo: 'donacion',
    descripcion: '',
    monto: 0,
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Lista de departamentos - Cargar desde el sistema
  const departamentosStorage = obtenerDepartamentos();
  const [departamentos, setDepartamentos] = useState<string[]>(
    departamentosStorage.map(d => d.nombre)
  );
  const [nuevoDepartamento, setNuevoDepartamento] = useState('');

  const [formData, setFormData] = useState<Partial<UsuarioInterno>>({
    nombre: '',
    apellido: '',
    categoria: 'benevole',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    fechaIngreso: '',
    foto: null,
    activo: true,
    nombreEmpresa: '',
    contacto: '',
    departamento: '',
    puesto: '',
    programa: '',
    horasSemanales: 0,
    notas: '',
    documentoPDF: undefined,
    joursDisponibles: [] as JourDisponible[],
    idiomas: []
  });

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusqueda = 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.numeroID.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchCategoria = categoriaFiltro === 'todos' || usuario.categoria === categoriaFiltro;
    
    return matchBusqueda && matchCategoria;
  });

  const handleGuardar = () => {
    // Validar campos según el tipo de contacto
    const esEmpresa = formData.categoria === 'donador' || formData.categoria === 'vendedor';
    
    if (esEmpresa) {
      if (!formData.nombreEmpresa || !formData.categoria || !formData.email) {
        toast.error(t('contacts.completeRequiredCompany'));
        return;
      }
    } else {
      if (!formData.nombre || !formData.apellido || !formData.categoria || !formData.email) {
        toast.error(t('contacts.completeRequiredPerson'));
        return;
      }
    }

    if (modoEdicion && usuarioEnEdicion) {
      // Modo edición: actualizar usuario existente
      const usuariosActualizados = usuarios.map(usuario => {
        if (usuario.id === usuarioEnEdicion) {
          return {
            ...usuario,
            nombre: esEmpresa ? (formData.nombreEmpresa || '') : (formData.nombre || ''),
            apellido: esEmpresa ? '' : (formData.apellido || ''),
            categoria: formData.categoria as any,
            email: formData.email || '',
            telefono: formData.telefono || '',
            direccion: formData.direccion || '',
            fechaNacimiento: formData.fechaNacimiento || '',
            fechaIngreso: formData.fechaIngreso || '',
            foto: fotoPreview || usuario.foto,
            departamento: formData.departamento,
            puesto: formData.puesto,
            horasSemanales: formData.horasSemanales,
            programa: formData.programa,
            nombreEmpresa: formData.nombreEmpresa,
            contacto: formData.contacto,
            notas: formData.notas,
            documentoPDF: formData.documentoPDF,
            joursDisponibles: formData.joursDisponibles,
            sexo: formData.sexo,
            idioma: formData.idioma
          };
        }
        return usuario;
      });
      setUsuarios(usuariosActualizados);
      toast.success(t('contacts.contactUpdated'));
    } else {
      // Modo creación: agregar nuevo usuario
      const categoriaPrefix = {
        benevole: 'BDV',
        empleado: 'EMP',
        programa: 'PRG',
        ptc: 'PTC',
        donador: 'DON',
        vendedor: 'VEN'
      }[formData.categoria as string];

      const nuevoUsuario: UsuarioInterno = {
        id: Date.now().toString(),
        numeroID: `${categoriaPrefix}-2024-${String(usuarios.length + 1).padStart(3, '0')}`,
        nombre: esEmpresa ? (formData.nombreEmpresa || '') : (formData.nombre || ''),
        apellido: esEmpresa ? '' : (formData.apellido || ''),
        categoria: formData.categoria as any,
        email: formData.email || '',
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        fechaNacimiento: formData.fechaNacimiento || '',
        fechaIngreso: formData.fechaIngreso || new Date().toISOString().split('T')[0],
        foto: fotoPreview,
        activo: true,
        departamento: formData.departamento,
        puesto: formData.puesto,
        horasSemanales: formData.horasSemanales,
        programa: formData.programa,
        nombreEmpresa: formData.nombreEmpresa,
        contacto: formData.contacto,
        notas: formData.notas,
        documentoPDF: formData.documentoPDF,
        joursDisponibles: formData.joursDisponibles,
        sexo: formData.sexo,
        idioma: formData.idioma
      };

      setUsuarios([...usuarios, nuevoUsuario]);
      toast.success(esEmpresa ? t('contacts.businessContactCreated') : t('contacts.contactCreated'));
    }
    
    resetForm();
    setDialogOpen(false);
    setModoEdicion(false);
    setUsuarioEnEdicion(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      categoria: 'benevole',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      fechaIngreso: '',
      foto: null,
      activo: true,
      nombreEmpresa: '',
      contacto: '',
      departamento: '',
      puesto: '',
      programa: '',
      horasSemanales: 0,
      notas: '',
      documentoPDF: undefined,
      joursDisponibles: [] as JourDisponible[],
      sexo: undefined,
      idioma: undefined
    });
    setFotoPreview(null);
    setModoEdicion(false);
    setUsuarioEnEdicion(null);
  };

  const handleEditar = (usuario: UsuarioInterno) => {
    setModoEdicion(true);
    setUsuarioEnEdicion(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      categoria: usuario.categoria,
      email: usuario.email,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      fechaNacimiento: usuario.fechaNacimiento,
      fechaIngreso: usuario.fechaIngreso,
      foto: usuario.foto,
      activo: usuario.activo,
      nombreEmpresa: usuario.nombreEmpresa,
      contacto: usuario.contacto,
      departamento: usuario.departamento,
      puesto: usuario.puesto,
      programa: usuario.programa,
      horasSemanales: usuario.horasSemanales,
      notas: usuario.notas,
      documentoPDF: usuario.documentoPDF,
      joursDisponibles: (usuario as any).joursDisponibles || [] as JourDisponible[],
      sexo: usuario.sexo,
      idioma: usuario.idioma
    });
    setFotoPreview(usuario.foto);
    setDialogOpen(true);
  };

  const handleEliminar = (usuario: UsuarioInterno) => {
    setUsuarioAEliminar(usuario);
    setEliminarDialogOpen(true);
  };

  const confirmarEliminar = () => {
    if (usuarioAEliminar) {
      setUsuarios(usuarios.filter(u => u.id !== usuarioAEliminar.id));
      toast.success(t('contacts.contactDeleted'));
      setEliminarDialogOpen(false);
      setUsuarioAEliminar(null);
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generarQRCode = async (texto: string) => {
    return generateBrandedQrDataUrl(texto, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  };

  const descargarIDDigital = (usuario: UsuarioInterno) => {
    toast.success(t('contacts.idDownloaded'));
  };

  const stats = {
    total: usuarios.length,
    benevole: usuarios.filter(u => u.categoria === 'benevole').length,
    empleado: usuarios.filter(u => u.categoria === 'empleado').length,
    programa: usuarios.filter(u => u.categoria === 'programa').length,
    ptc: usuarios.filter(u => u.categoria === 'ptc').length,
    donador: usuarios.filter(u => u.categoria === 'donador').length,
    vendedor: usuarios.filter(u => u.categoria === 'vendedor').length,
    activos: usuarios.filter(u => u.activo).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem' }}>
            {t('contacts.title')}
          </h1>
          <p className="text-[#666666] mt-1">
            {t('contacts.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('contacts.newContact')}
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-[#1E73BE]" />
              <p className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {stats.total}
              </p>
              <p className="text-xs text-[#666666]">{t('contacts.totalContacts')}</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(categoriaConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">{config.icon}</div>
                <p className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats[key as keyof typeof stats]}
                </p>
                <p className="text-xs text-[#666666]">{config.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BadgeIcon className="w-8 h-8 mx-auto mb-2 text-[#4CAF50]" />
              <p className="text-2xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {stats.activos}
              </p>
              <p className="text-xs text-[#666666]">{t('contacts.activeContacts')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('contacts.searchPlaceholder')}
                className="pl-10"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('contacts.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">{t('contacts.allCategories')}</SelectItem>
                {Object.entries(getCategoriaConfig()).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('contacts.title')} ({usuariosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contacts.tableHeaderId')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderUser')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderCategory')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderDepartment')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderContact')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderJoinDate')}</TableHead>
                  <TableHead>{t('contacts.tableHeaderStatus')}</TableHead>
                  <TableHead className="text-right">{t('contacts.tableHeaderActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((usuario) => {
                  const config = categoriaConfig[usuario.categoria];
                  return (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.numeroID}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {usuario.foto && (
                            <img 
                              src={usuario.foto} 
                              alt={usuario.nombre}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span>{usuario.nombre} {usuario.apellido}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge style={{ backgroundColor: config.color, color: 'white' }}>
                          {config.icon} {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{usuario.departamento || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{usuario.email}</div>
                          <div className="text-gray-500">{usuario.telefono}</div>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.fechaIngreso || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={usuario.activo ? 'default' : 'secondary'}>
                          {usuario.activo ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setUsuarioSeleccionado(usuario);
                              setPerfilDialogOpen(true);
                            }}
                          >
                            <IdCard className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminar(usuario)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de ID Digital */}
      {usuarioSeleccionado && (
        <IDDigitalUsuarioInterno
          usuario={usuarioSeleccionado}
          isOpen={idDigitalOpen}
          onClose={() => {
            setIdDigitalOpen(false);
            setUsuarioSeleccionado(null);
          }}
        />
      )}

      {/* Dialog Perfil Donador/Vendedor con Historial */}
      <Dialog open={perfilDialogOpen} onOpenChange={setPerfilDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="perfil-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {usuarioSeleccionado && (
                <div className="flex items-center gap-2">
                  {usuarioSeleccionado.categoria === 'donador' ? (
                    <Gift className="w-5 h-5 text-[#FF9800]" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 text-[#9C27B0]" />
                  )}
                  Perfil - {usuarioSeleccionado.nombre}
                </div>
              )}
            </DialogTitle>
            <DialogDescription id="perfil-dialog-description">
              Información completa y historial del {usuarioSeleccionado?.categoria === 'donador' ? 'donador' : 'vendedor'}
            </DialogDescription>
          </DialogHeader>
          {usuarioSeleccionado && (
            <div className="space-y-6 py-4">
              {/* Información general */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#999999]">ID</p>
                      <p className="font-medium text-[#333333]">{usuarioSeleccionado.numeroID}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999999]">Persona de Contacto</p>
                      <p className="font-medium text-[#333333]">{usuarioSeleccionado.contacto || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999999]">Email</p>
                      <p className="font-medium text-[#333333]">{usuarioSeleccionado.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999999]">Teléfono</p>
                      <p className="font-medium text-[#333333]">{usuarioSeleccionado.telefono}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[#999999]">Dirección</p>
                      <p className="font-medium text-[#333333]">{usuarioSeleccionado.direccion}</p>
                    </div>
                  </div>

                  {/* Notas */}
                  {usuarioSeleccionado.notas && (
                    <div>
                      <p className="text-xs text-[#999999] mb-1">
                        <FileText className="w-3 h-3 inline mr-1" />
                        Notas
                      </p>
                      <div className="bg-[#F4F4F4] rounded-lg p-3">
                        <p className="text-sm text-[#333333]">{usuarioSeleccionado.notas}</p>
                      </div>
                    </div>
                  )}

                  {/* Documento PDF */}
                  {usuarioSeleccionado.documentoPDF && (
                    <div>
                      <p className="text-xs text-[#999999] mb-1">
                        <Paperclip className="w-3 h-3 inline mr-1" />
                        Documento Adjunto
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de Transacciones */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {usuarioSeleccionado.categoria === 'donador' ? (
                        <><Gift className="w-5 h-5 inline mr-2" />Historial de Donaciones Recibidas</>
                      ) : (
                        <><ShoppingCart className="w-5 h-5 inline mr-2" />Historial de Compras Realizadas</>
                      )}
                    </CardTitle>
                    <Button
                      size="sm"
                      className="bg-[#4CAF50] hover:bg-[#45a049]"
                      onClick={() => setHistorialDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle transaction
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {usuarioSeleccionado.historial && usuarioSeleccionado.historial.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantite</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usuarioSeleccionado.historial.map((trans) => (
                          <TableRow key={trans.id}>
                            <TableCell>
                              {new Date(trans.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>{trans.descripcion}</TableCell>
                            <TableCell>{trans.cantidad || '-'}</TableCell>
                            <TableCell>
                              <span className="font-medium text-[#4CAF50]">
                                ${formatMoney(trans.monto)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {trans.documento && (
                                <Button size="sm" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-[#999999]">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune transaction enregistree</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nueva Transacción */}
      <Dialog open={historialDialogOpen} onOpenChange={setHistorialDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="transaccion-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Nouvelle transaction
            </DialogTitle>
            <DialogDescription id="transaccion-dialog-description">
              Enregistrez une nouvelle transaction pour ce contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={nuevaTransaccion.fecha}
                onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, fecha: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Ex : Don de 500 kg de riz"
                value={nuevaTransaccion.descripcion}
                onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, descripcion: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantite</Label>
                <Input
                  placeholder="Ex : 500 kg"
                  value={nuevaTransaccion.cantidad}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, cantidad: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Monto ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={nuevaTransaccion.monto}
                  onChange={(e) => setNuevaTransaccion({ ...nuevaTransaccion, monto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Document (optionnel)</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('trans-pdf-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {nuevaTransaccion.documento ? 'Changer le document' : 'Televerser un PDF'}
              </Button>
              {nuevaTransaccion.documento && (
                <p className="text-xs text-[#4CAF50]">
                  ✓ Document joint
                </p>
              )}
              <input
                id="trans-pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setNuevaTransaccion({ ...nuevaTransaccion, documento: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setHistorialDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              onClick={() => {
                if (!usuarioSeleccionado) return;
                
                const nuevaTrans: Transaccion = {
                  id: Date.now().toString(),
                  fecha: nuevaTransaccion.fecha || new Date().toISOString().split('T')[0],
                  tipo: usuarioSeleccionado.categoria === 'donador' ? 'donacion' : 'compra',
                  descripcion: nuevaTransaccion.descripcion || '',
                  monto: nuevaTransaccion.monto || 0,
                  cantidad: nuevaTransaccion.cantidad,
                  documento: nuevaTransaccion.documento
                };

                const usuarioActualizado = {
                  ...usuarioSeleccionado,
                  historial: [...(usuarioSeleccionado.historial || []), nuevaTrans]
                };

                setUsuarios(usuarios.map(u => u.id === usuarioSeleccionado.id ? usuarioActualizado : u));
                setUsuarioSeleccionado(usuarioActualizado);
                
                toast.success('Transaction enregistree correctement');
                setHistorialDialogOpen(false);
                setNuevaTransaccion({
                  tipo: 'donacion',
                  descripcion: '',
                  monto: 0,
                  cantidad: '',
                  fecha: new Date().toISOString().split('T')[0]
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Gestión de Departamentos */}
      <Dialog open={departamentosDialogOpen} onOpenChange={setDepartamentosDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="departamentos-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <Building2 className="w-5 h-5 inline mr-2" />
              {t('contacts.manageDepartments')}
            </DialogTitle>
            <DialogDescription id="departamentos-dialog-description">
              Configurez les departements de l'entreprise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Lista de departamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Departements actuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departamentos.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#F4F4F4] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#1E73BE]" />
                        <span className="text-sm text-[#333333]">{dept}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setDepartamentos(departamentos.filter((_, i) => i !== index));
                          toast.success(`Departement "${dept}" supprime`);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-[#DC3545]" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Agregar nuevo departamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('contacts.addDepartment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('contacts.departmentName')}
                    value={nuevoDepartamento}
                    onChange={(e) => setNuevoDepartamento(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && nuevoDepartamento.trim()) {
                        if (departamentos.includes(nuevoDepartamento.trim())) {
                          toast.error('Ce departement existe deja');
                          return;
                        }
                        setDepartamentos([...departamentos, nuevoDepartamento.trim()]);
                        toast.success('Departement ajoute correctement');
                        setNuevoDepartamento('');
                      }
                    }}
                  />
                  <Button
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    onClick={() => {
                      if (!nuevoDepartamento.trim()) {
                        toast.error('Saisissez un nom pour le departement');
                        return;
                      }
                      if (departamentos.includes(nuevoDepartamento.trim())) {
                        toast.error('Ce departement existe deja');
                        return;
                      }
                      setDepartamentos([...departamentos, nuevoDepartamento.trim()]);
                      toast.success('Departement ajoute correctement');
                      setNuevoDepartamento('');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-[#666666] mt-2">
                  Appuyez sur Entree ou cliquez sur Ajouter pour creer le departement
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              onClick={() => setDepartamentosDialogOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmación de Eliminación */}
      <Dialog open={eliminarDialogOpen} onOpenChange={setEliminarDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="eliminar-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <Trash2 className="w-5 h-5 inline mr-2 text-[#DC3545]" />
              {t('contacts.delete')}
            </DialogTitle>
            <DialogDescription id="eliminar-dialog-description">
              Esta acción eliminará permanentemente el contacto del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#333333] mb-4">
              {t('contacts.deleteConfirm')}
            </p>
            {usuarioAEliminar && (
              <div className="bg-[#F4F4F4] p-4 rounded-lg border-l-4 border-[#DC3545]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {usuarioAEliminar.foto ? (
                      <img src={usuarioAEliminar.foto} alt={usuarioAEliminar.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {usuarioAEliminar.nombre} {usuarioAEliminar.apellido}
                    </p>
                    <p className="text-xs text-[#666666]">{usuarioAEliminar.numeroID}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-[#666666]">
                    <Mail className="w-3 h-3 inline mr-1" />
                    {usuarioAEliminar.email}
                  </p>
                  <p className="text-[#666666]">
                    <Phone className="w-3 h-3 inline mr-1" />
                    {usuarioAEliminar.telefono}
                  </p>
                  <Badge 
                    className="text-white mt-2"
                    style={{ backgroundColor: categoriaConfig[usuarioAEliminar.categoria].color }}
                  >
                    {categoriaConfig[usuarioAEliminar.categoria].icon} {categoriaConfig[usuarioAEliminar.categoria].label}
                  </Badge>
                </div>
              </div>
            )}
            <p className="text-sm text-[#DC3545] mt-4 font-medium">
              ⚠️ {t('contacts.deleteWarning')}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setEliminarDialogOpen(false);
                setUsuarioAEliminar(null);
              }}
            >
              {t('contacts.cancel')}
            </Button>
            <Button
              className="bg-[#DC3545] hover:bg-[#C62828] text-white"
              onClick={confirmarEliminar}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('contacts.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario Usuario Interno Compacto */}
      <FormularioUsuarioInternoCompacto
        abierto={dialogOpen}
        onCerrar={() => {
          setDialogOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardar}
        fotoPreview={fotoPreview}
        onFotoChange={handleFotoChange}
        getCategoriaConfig={getCategoriaConfig}
      />
    </div>
  );
}