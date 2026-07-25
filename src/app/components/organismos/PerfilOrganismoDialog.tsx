import React, { useState, useEffect } from 'react';
import { Edit, Phone, Mail, MapPin, Users, Bell, Calendar, Percent, UserCheck, UtensilsCrossed, Coffee, Clock, PackageCheck, History, FileText, Plus, X, Key, Copy, Check, Tag, Eye, Package, UserPlus, Star, Trash2, Send, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { obtenerOfertas, type Oferta } from '../../utils/ofertaStorage';
import { obtenerPersonasPorOrganismo, type PersonaResponsable } from '../../utils/personasResponsablesStorage';
import { useTranslation } from 'react-i18next';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { enviarEmail } from '../../utils/emailConfig';
import { toast } from 'sonner';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { MapLink } from '../ui/map-link';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { construirUrlAccesoOrganismo } from '../../utils/organismoAccessLinks';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { useBranding } from '../../../hooks/useBranding';
import { obtenerTiposOrganismoCatalogo } from '../../utils/tiposOrganismoCatalogo';

// Componente para mostrar la clave de acceso
function ClaveAccesoSection({ claveAcceso, organismo }: { claveAcceso?: string; organismo: any }) {
  const { t } = useTranslation();
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [copiado, setCopiado] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  // Verificar si hay al menos un email disponible
  const tieneEmailDisponible = () => {
    if (organismo?.email) return true;
    if (organismo?.contactosNotificacion && Array.isArray(organismo.contactosNotificacion)) {
      return organismo.contactosNotificacion.some((contacto: any) => contacto.email && contacto.email.trim() !== '');
    }
    return false;
  };

  const copiarClave = async () => {
    if (claveAcceso) {
      const exito = await copiarAlPortapapeles(claveAcceso);
      if (exito) {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    }
  };

  const enviarCredencialesPorEmail = async () => {
    // Verificar que hay un usuario en sesión
    const usuarioSesion = obtenerUsuarioSesion();
    if (!usuarioSesion) {
      toast.error('Aucun utilisateur connecté', {
        description: 'Veuillez vous connecter pour envoyer des emails.'
      });
      return;
    }

    // Recopilar todos los emails disponibles
    const emailsDestino: string[] = [];
    
    // Email principal del organismo
    if (organismo?.email) {
      emailsDestino.push(organismo.email);
    }
    
    // Emails de contactos de notificación
    if (organismo?.contactosNotificacion && Array.isArray(organismo.contactosNotificacion)) {
      organismo.contactosNotificacion.forEach((contacto: any) => {
        if (contacto.email && contacto.email.trim() !== '') {
          // Evitar duplicados
          if (!emailsDestino.includes(contacto.email)) {
            emailsDestino.push(contacto.email);
          }
        }
      });
    }

    // Validar que haya al menos un email
    if (emailsDestino.length === 0) {
      toast.error('Aucune adresse email disponible', {
        description: 'Cet organisme n\'a pas d\'adresse email enregistrée. Veuillez d\'abord ajouter une adresse email dans le profil.'
      });
      return;
    }

    if (!claveAcceso) {
      toast.error('Clé d\'accès non disponible');
      return;
    }

    setEnviandoEmail(true);

    // Generar el link de acceso directo
    const linkAcceso = construirUrlAccesoOrganismo(claveAcceso);

    // Crear el mensaje del email
    const asunto = `🔑 Vos identifiants d'accès - ${nombreSistemaImpresion}`;
    
    const mensaje = [
      `Bonjour ${organismo.nombre || organismo.responsable},`,
      '',
      `Nous vous transmettons vos identifiants d'accès à votre espace personnel sur le système de gestion de ${nombreSistemaImpresion}.`,
      '',
      `🔑 VOS IDENTIFIANTS D'ACCÈS`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Clé d'accès : ${claveAcceso}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `🌐 ACCÈS DIRECT À VOTRE ESPACE`,
      `Cliquez sur le lien suivant pour accéder directement à votre profil :`,
      linkAcceso,
      '',
      `ℹ️ COMMENT UTILISER VOS IDENTIFIANTS ?`,
      '',
      '1. Rendez-vous sur notre portail web',
      '2. Utilisez votre clé d\'accès ci-dessus',
      '3. Accédez à votre profil et consultez vos commandes',
      '',
      `📋 CE QUE VOUS POUVEZ FAIRE SUR VOTRE ESPACE :`,
      '• Consulter vos informations de profil',
      '• Voir l\'historique de vos commandes',
      '• Consulter les détails de vos livraisons',
      '• Confirmer la réception de vos commandes',
      '• Voir les statistiques de votre organisme',
      '',
      `🔒 SÉCURITÉ`,
      'Cette clé d\'accès est personnelle et confidentielle. Ne la partagez qu\'avec les personnes autorisées de votre organisme.',
      '',
      `📞 BESOIN D'AIDE ?`,
      'Si vous rencontrez des difficultés ou avez des questions, n\'hésitez pas à nous contacter.',
      '',
      '────────────────────────────────',
      nombreSistemaImpresion,
      'Système de Gestion',
      brandingContactLine,
      `Date d'envoi : ${new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      '────────────────────────────────',
      '',
      'Ce message a été généré automatiquement. Merci de ne pas y répondre directement.',
    ].filter(Boolean).join('\n');

    try {
      const usuarioSesion = obtenerUsuarioSesion();
      
      // Simulación de envío exitoso
      toast.success('✅ Email envoyé avec succès!', {
        description: `De: ${usuarioSesion?.email}\nÀ: ${emailsDestino.length} destinataire${emailsDestino.length > 1 ? 's' : ''}: ${emailsDestino.join(', ')}`
      });
      
      // Log del email enviado
      console.log('Email de credenciales enviado:', {
        de: usuarioSesion?.email,
        nombreRemitente: `${usuarioSesion?.nombre} ${usuarioSesion?.apellido}`,
        destinatarios: emailsDestino,
        asunto: asunto,
        clave: claveAcceso,
        organismo: organismo.nombre,
        fecha: new Date().toISOString()
      });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email', {
        description: 'Une erreur inattendue s\'est produite'
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  if (!claveAcceso) return null;

  return (
    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Key className="w-5 h-5 text-[#1E73BE]" />
          </div>
          <div>
            <p className="font-semibold text-[#333333] text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Clé d'Accès de l'Organisme
            </p>
            <p className="text-sm text-[#666666] mt-0.5">
              Cette clé permet à l'organisme d'accéder à son profil public
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-6 py-3 rounded-lg border-2 border-[#1E73BE] shadow-sm">
            <p className="font-mono font-bold text-[#1E73BE] tracking-wider" style={{ fontSize: '1.25rem' }}>
              {claveAcceso}
            </p>
          </div>
          <Button
            type="button"
            size="default"
            variant="outline"
            onClick={copiarClave}
            className="text-[#1E73BE] border-2 border-[#1E73BE] hover:bg-blue-100 font-medium px-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {copiado ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copié
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </>
            )}
          </Button>
          <Button
            type="button"
            size="default"
            onClick={enviarCredencialesPorEmail}
            disabled={enviandoEmail || !tieneEmailDisponible()}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-medium px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
            title={!tieneEmailDisponible() ? 'Aucun email disponible pour cet organisme' : 'Envoyer par email aux contacts de notification'}
          >
            {enviandoEmail ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer par Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PerfilOrganismoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modoEdicion: boolean;
  setModoEdicion: (modo: boolean) => void;
  formOrganismo: any;
  setFormOrganismo: (form: any) => void;
  onGuardar: () => void;
  calcularPorcentajeAutomatico: () => void;
  agregarContacto: () => void;
  eliminarContacto: (index: number) => void;
  actualizarContacto: (index: number, campo: string, valor: string) => void;
  historialDonaciones: any[];
  historialPRS: any[];
  organismoId?: string;
}

const diasCitaOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function PerfilOrganismoDialog({
  open,
  onOpenChange,
  modoEdicion,
  setModoEdicion,
  formOrganismo,
  setFormOrganismo,
  onGuardar,
  calcularPorcentajeAutomatico,
  agregarContacto,
  eliminarContacto,
  actualizarContacto,
  historialDonaciones,
  historialPRS,
  organismoId
}: PerfilOrganismoDialogProps) {
  const { t, i18n } = useTranslation();
  const tiposOrganismo = obtenerTiposOrganismoCatalogo(t);
  const [ofertaDetalleSeleccionada, setOfertaDetalleSeleccionada] = useState<Oferta | null>(null);
  const [dialogOfertaDetalleOpen, setDialogOfertaDetalleOpen] = useState(false);
  const [personasAutorizadas, setPersonasAutorizadas] = useState<PersonaResponsable[]>([]);
  
  // Estado local para manejar la edición
  const [modoEdicionLocal, setModoEdicionLocal] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState<any>(null);

  useEffect(() => {
    if (open && organismoId) {
      const personas = obtenerPersonasPorOrganismo(organismoId);
      setPersonasAutorizadas(personas);
    }
  }, [open, organismoId]);

  // Resetear modo edición cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setModoEdicionLocal(false);
      setDatosOriginales(null);
    }
  }, [open]);

  const activarModoEdicion = () => {
    // Guardar copia de los datos originales
    setDatosOriginales(JSON.parse(JSON.stringify(formOrganismo)));
    setModoEdicionLocal(true);
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    // Restaurar datos originales
    if (datosOriginales) {
      setFormOrganismo(datosOriginales);
    }
    setModoEdicionLocal(false);
    setModoEdicion(false);
    setDatosOriginales(null);
  };

  const guardarCambios = () => {
    onGuardar();
    setModoEdicionLocal(false);
    setModoEdicion(false);
    setDatosOriginales(null);
  };

  // Usar modoEdicionLocal en lugar de modoEdicion para el estado de edición
  const enModoEdicion = modoEdicionLocal;
  
  const todasLasOfertas = obtenerOfertas();
  const ofertasDelOrganismo = todasLasOfertas.filter(oferta => {
    if (!oferta.visible) return false;
    if (oferta.organismosDestino === 'todos') return true;
    if (organismoId && Array.isArray(oferta.organismosDestino) && oferta.organismosDestino.includes(organismoId)) {
      return true;
    }
    return false;
  });

  const calcularEstadoOferta = (oferta: Oferta): {
    estado: 'activa' | 'expirada' | 'agotada';
    label: string;
    color: string;
  } => {
    const ahora = new Date();
    const fechaExpiracion = new Date(oferta.fechaExpiracion);
    
    if (fechaExpiracion < ahora || !oferta.activa) {
      return {
        estado: 'expirada',
        label: t('organisms.profileDialog.expired'),
        color: '#DC3545'
      };
    }
    
    const tieneDisponibilidad = oferta.productos.some(p => p.cantidadDisponible > 0);
    if (!tieneDisponibilidad) {
      return {
        estado: 'agotada',
        label: t('organisms.profileDialog.soldOut'),
        color: '#666666'
      };
    }
    
    return {
      estado: 'activa',
      label: t('organisms.profileDialog.activeOffer'),
      color: '#4CAF50'
    };
  };

  // Verificar que formOrganismo existe antes de renderizar
  if (!formOrganismo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none overflow-y-auto p-0 m-0"
        aria-describedby="organism-profile-description"
      >
        <DialogHeader className="sticky top-0 z-10 bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo del organismo */}
              {formOrganismo.logo && (
                <div className="flex-shrink-0 w-20 h-20 border-2 border-[#1E73BE] rounded-lg overflow-hidden bg-white shadow-sm">
                  <img 
                    src={formOrganismo.logo} 
                    alt={`Logo ${formOrganismo.nombre}`}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
                  {enModoEdicion ? t('organisms.profileDialog.editProfile') : t('organisms.profileDialog.viewProfile')}
                </DialogTitle>
                <DialogDescription id="organism-profile-description" className="text-sm text-[#666666] mt-1">
                  {enModoEdicion 
                    ? t('organisms.profileDialog.editDescription')
                    : t('organisms.profileDialog.viewDescription')}
                </DialogDescription>
              </div>
            </div>
            {!enModoEdicion && (
              <Button 
                onClick={activarModoEdicion}
                className="bg-[#1E73BE] hover:bg-[#1557A0]"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('organisms.profileDialog.enableEditing')}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-6 px-8 max-w-7xl mx-auto">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="info">{t('organisms.profileDialog.generalInfo')}</TabsTrigger>
              <TabsTrigger value="servicios">{t('organisms.profileDialog.servicesCapacity')}</TabsTrigger>
              <TabsTrigger value="contactos">{t('organisms.profileDialog.contacts')}</TabsTrigger>
              <TabsTrigger value="ofertas">
                {t('organisms.profileDialog.offers')} ({ofertasDelOrganismo.length})
              </TabsTrigger>
              <TabsTrigger value="historial">{t('organisms.profileDialog.history')}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-[#333333]">{t('organisms.profileDialog.organismState')}</p>
                    <p className="text-sm text-[#666666]">
                      {formOrganismo.activo ? t('organisms.profileDialog.enabledForServices') : t('organisms.profileDialog.temporarilyDisabled')}
                    </p>
                  </div>
                </div>
                {enModoEdicion ? (
                  <Button
                    type="button"
                    onClick={() => setFormOrganismo({ ...formOrganismo, activo: !formOrganismo.activo })}
                    className={formOrganismo.activo 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049]' 
                      : 'bg-[#DC3545] hover:bg-[#c82333]'}
                    style={{ minWidth: '120px' }}
                  >
                    {formOrganismo.activo ? `✓ ${t('organisms.active')}` : `✕ ${t('organisms.inactive')}`}
                  </Button>
                ) : (
                  <Badge className={formOrganismo.activo ? 'bg-[#4CAF50]' : 'bg-[#DC3545]'}>
                    {formOrganismo.activo ? t('organisms.active') : t('organisms.inactive')}
                  </Badge>
                )}
              </div>

              {!formOrganismo.activo && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#DC3545] mt-1" />
                    <div className="flex-1 space-y-3">
                      <h4 className="font-medium text-[#DC3545]">{t('organisms.profileDialog.inactivityPeriod')}</h4>
                      {enModoEdicion ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[#333333]">{t('organisms.inactivityStartDate')} *</Label>
                            <Input 
                              type="date"
                              value={formOrganismo.fechaInicioInactividad || ''}
                              onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaInicioInactividad: e.target.value })}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[#333333]">{t('organisms.inactivityEndDate')}</Label>
                            <Input 
                              type="date"
                              value={formOrganismo.fechaFinInactividad || ''}
                              onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaFinInactividad: e.target.value })}
                              min={formOrganismo.fechaInicioInactividad || ''}
                              className="bg-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[#666666] mb-1">{t('organisms.profileDialog.startDate')}</p>
                            <p className="font-medium text-[#333333]">
                              {formOrganismo.fechaInicioInactividad 
                                ? new Date(formOrganismo.fechaInicioInactividad).toLocaleDateString(i18n.language, { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })
                                : t('organisms.profileDialog.notSpecified')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#666666] mb-1">{t('organisms.profileDialog.estimatedEndDate')}</p>
                            <p className="font-medium text-[#333333]">
                              {formOrganismo.fechaFinInactividad 
                                ? new Date(formOrganismo.fechaFinInactividad).toLocaleDateString(i18n.language, { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })
                                : t('organisms.profileDialog.notSpecified')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('organisms.basicInfo')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('organisms.organismName')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.nombre}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, nombre: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.nombre}</p>
                    )}
                  </div>
                  
                  {/* Campo Logo - Solo visible en modo edición */}
                  {enModoEdicion && (
                    <div className="space-y-2 col-span-2">
                      <Label className="flex items-center gap-2">
                        🎨 Logo de l'Organisme
                        <Badge variant="outline" className="text-xs bg-blue-50 text-[#1E73BE] border-[#1E73BE]">
                          Optionnel
                        </Badge>
                      </Label>
                      <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        {/* Vista previa del logo */}
                        <div className="flex-shrink-0">
                          {formOrganismo.logo ? (
                            <div className="relative w-24 h-24 border-2 border-[#1E73BE] rounded-lg overflow-hidden bg-white">
                              <img 
                                src={formOrganismo.logo} 
                                alt="Logo" 
                                className="w-full h-full object-contain p-2"
                              />
                              <button
                                type="button"
                                onClick={() => setFormOrganismo({ ...formOrganismo, logo: null })}
                                className="absolute top-1 right-1 bg-[#DC3545] text-white rounded-full p-1 hover:bg-[#c82333] transition-colors"
                                title="Supprimer le logo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Botón de carga */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <input
                              type="file"
                              id="logo-upload-perfil"
                              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setFormOrganismo({ ...formOrganismo, logo: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                              onClick={() => document.getElementById('logo-upload-perfil')?.click()}
                            >
                              <Upload className="w-3 h-3 mr-2" />
                              {formOrganismo.logo ? 'Changer' : 'Télécharger'}
                            </Button>
                          </div>
                          <p className="text-xs text-[#666666]">
                            PNG, JPG, SVG • Max 500x500px
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>{t('organisms.type')}</Label>
                    {enModoEdicion ? (
                      <Select 
                        value={formOrganismo.tipo}
                        onValueChange={(value) => setFormOrganismo({ ...formOrganismo, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposOrganismo.map(tipo => (
                            <SelectItem key={tipo.id} value={tipo.nombre}>
                              {tipo.icono} {tipo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.tipo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.profileDialog.zone')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.zona}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, zona: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.zona || t('organisms.profileDialog.notSpecified')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.responsible')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.responsable}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, responsable: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.responsable}</p>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>{t('organisms.fullAddress')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.direccion}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, direccion: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#1E73BE] flex-shrink-0" />
                        <MapLink 
                          direccion={formOrganismo.direccion}
                          variant="inline"
                          showIcon={false}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quartier</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.quartier || ''}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, quartier: e.target.value })}
                        placeholder="Ex: Centre-ville, Plateau-Mont-Royal, etc."
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.quartier || t('organisms.profileDialog.notSpecified')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.postalCode')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.codigoPostal}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, codigoPostal: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.codigoPostal || t('organisms.profileDialog.notSpecified')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.phone')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        value={formOrganismo.telefono}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, telefono: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#1E73BE]" />
                        {formOrganismo.telefono}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.emailLabel')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        type="email"
                        value={formOrganismo.email}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, email: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#1E73BE]" />
                        {formOrganismo.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.beneficiariesNumber')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        type="number"
                        value={formOrganismo.beneficiarios || ''}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, beneficiarios: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FFC107]" />
                        {formOrganismo.beneficiarios} {t('organisms.profileDialog.people')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ClaveAccesoSection claveAcceso={formOrganismo.claveAcceso} organismo={formOrganismo} />

              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Calendar className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.profileDialog.schedulingFrequency')}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t('organisms.profileDialog.appointmentFrequency')}</Label>
                    {enModoEdicion ? (
                      <Select 
                        value={formOrganismo.frecuenciaCita}
                        onValueChange={(value) => setFormOrganismo({ ...formOrganismo, frecuenciaCita: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">{t('organisms.profileDialog.weekly')}</SelectItem>
                          <SelectItem value="cada-dos-semanas">{t('organisms.profileDialog.biweekly')}</SelectItem>
                          <SelectItem value="cada-tres-semanas">{t('organisms.profileDialog.triweekly')}</SelectItem>
                          <SelectItem value="mensual">{t('organisms.profileDialog.monthly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded capitalize">{formOrganismo.frecuenciaCita || t('organisms.profileDialog.notSpecified')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Jour de rendez-vous</Label>
                    {enModoEdicion ? (
                      <Select
                        value={formOrganismo.diaCita || ''}
                        onValueChange={(value) => setFormOrganismo({ ...formOrganismo, diaCita: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le jour" />
                        </SelectTrigger>
                        <SelectContent>
                          {diasCitaOptions.map((dia) => (
                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">{formOrganismo.diaCita || t('organisms.profileDialog.notSpecified')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.profileDialog.appointmentTime')}</Label>
                    {enModoEdicion ? (
                      <Input 
                        type="time"
                        value={formOrganismo.horaCita}
                        onChange={(e) => setFormOrganismo({ ...formOrganismo, horaCita: e.target.value })}
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#1E73BE]" />
                        {formOrganismo.horaCita || t('organisms.profileDialog.notSpecified')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('organisms.type')}</Label>
                    {enModoEdicion ? (
                      <Select 
                        value={formOrganismo.clasificacionOrganismo || (formOrganismo.regular ? 'regular' : 'eventual')}
                        onValueChange={(value) => setFormOrganismo({
                          ...formOrganismo,
                          clasificacionOrganismo: value,
                          regular: value !== 'eventual'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">{t('organisms.regular')}</SelectItem>
                          <SelectItem value="collation">Collation</SelectItem>
                          <SelectItem value="eventual">{t('organisms.profileDialog.occasionalOrganism')}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded">
                        {formOrganismo.clasificacionOrganismo === 'collation'
                          ? 'Collation'
                          : formOrganismo.regular
                            ? t('organisms.regular')
                            : t('organisms.profileDialog.occasionalOrganism')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <FileText className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.notesObservations')}
                </h3>
                {enModoEdicion ? (
                  <Textarea 
                    rows={4}
                    value={formOrganismo.notas}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, notas: e.target.value })}
                    placeholder={t('organisms.profileDialog.additionalInfoPlaceholder')}
                  />
                ) : (
                  <p className="p-4 bg-gray-50 rounded min-h-[100px]">{formOrganismo.notas || t('organisms.profileDialog.noNotesRegistered')}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="servicios" className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-[#333333]">{t('organisms.profileDialog.prsProgram')}</p>
                  <p className="text-sm text-[#666666]">
                    {formOrganismo.participantePRS 
                      ? t('organisms.profileDialog.participatesActivePRS')
                      : t('organisms.profileDialog.doesNotParticipatePRS')}
                  </p>
                </div>
                {enModoEdicion ? (
                  <Button
                    type="button"
                    onClick={() => setFormOrganismo({ ...formOrganismo, participantePRS: !formOrganismo.participantePRS })}
                    className={formOrganismo.participantePRS 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049]' 
                      : 'bg-[#DC3545] hover:bg-[#c82333]'}
                    style={{ minWidth: '120px' }}
                  >
                    {formOrganismo.participantePRS ? `✓ ${t('organisms.profileDialog.yesParticipates')}` : `✕ ${t('organisms.profileDialog.noParticipates')}`}
                  </Button>
                ) : (
                  <Badge className={formOrganismo.participantePRS ? 'bg-[#4CAF50]' : 'bg-[#DC3545]'}>
                    {formOrganismo.participantePRS ? t('organisms.profileDialog.yesParticipates') : t('organisms.profileDialog.noParticipates')}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <UserCheck className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.profileDialog.serviceCapacity')}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-[#1E73BE]">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="w-8 h-8 text-[#1E73BE] mx-auto mb-2" />
                        <Label className="text-sm">{t('organisms.profileDialog.peopleServedLabel')}</Label>
                        {enModoEdicion ? (
                          <QuantityInput 
                            className="mt-2"
                            value={formOrganismo.personasServidas || ''}
                            onChangeText={(value) => setFormOrganismo({ ...formOrganismo, personasServidas: parseQuantityText(value, false) || 0 })}
                            onBlur={calcularPorcentajeAutomatico}
                            min={0}
                            step={1}
                          />
                        ) : (
                          <p className="font-bold text-[#1E73BE] mt-2" style={{ fontSize: '1.5rem' }}>
                            {formOrganismo.personasServidas}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#FFC107]">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Coffee className="w-8 h-8 text-[#FFC107] mx-auto mb-2" />
                        <Label className="text-sm">{t('organisms.profileDialog.snacksLabel')}</Label>
                        {enModoEdicion ? (
                          <QuantityInput 
                            className="mt-2"
                            value={formOrganismo.cantidadColaciones || ''}
                            onChangeText={(value) => setFormOrganismo({ ...formOrganismo, cantidadColaciones: parseQuantityText(value, false) || 0 })}
                            onBlur={calcularPorcentajeAutomatico}
                            min={0}
                            step={1}
                          />
                        ) : (
                          <p className="font-bold text-[#FFC107] mt-2" style={{ fontSize: '1.5rem' }}>
                            {formOrganismo.cantidadColaciones}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#4CAF50]">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <UtensilsCrossed className="w-8 h-8 text-[#4CAF50] mx-auto mb-2" />
                        <Label className="text-sm">{t('organisms.profileDialog.lunchesLabel')}</Label>
                        {enModoEdicion ? (
                          <QuantityInput 
                            className="mt-2"
                            value={formOrganismo.cantidadAlmuerzos || ''}
                            onChangeText={(value) => setFormOrganismo({ ...formOrganismo, cantidadAlmuerzos: parseQuantityText(value, false) || 0 })}
                            onBlur={calcularPorcentajeAutomatico}
                            min={0}
                            step={1}
                          />
                        ) : (
                          <p className="font-bold text-[#4CAF50] mt-2" style={{ fontSize: '1.5rem' }}>
                            {formOrganismo.cantidadAlmuerzos}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Percent className="w-8 h-8 text-[#1E73BE]" />
                    <div>
                      <p className="font-medium text-[#333333]">{t('organisms.profileDialog.distributionPercentageTitle')}</p>
                      <p className="text-sm text-[#666666]">{t('organisms.profileDialog.autoCalculatedCapacity')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE]" style={{ fontSize: '1.5rem', padding: '0.75rem 1.5rem' }}>
                      {(formOrganismo.porcentajeReparticion || 0).toFixed(2)}%
                    </Badge>
                    {enModoEdicion && (
                      <Button 
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={calcularPorcentajeAutomatico}
                        className="text-[#1E73BE] border-[#1E73BE]"
                      >
                        {t('organisms.profileDialog.recalculate')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contactos" className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-medium text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Bell className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.profileDialog.notificationContacts')}
                </h3>
                {enModoEdicion && (
                  <Button 
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={agregarContacto}
                    className="text-[#4CAF50] border-[#4CAF50]"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('organisms.profileDialog.addContact')}
                  </Button>
                )}
              </div>
              <p className="text-sm text-[#666666]">
                {t('organisms.profileDialog.contactsReceiveNotifications')}
              </p>
              <div className="space-y-3">
                {formOrganismo.contactosNotificacion.map((contacto: any, index: number) => (
                  <div key={index} className={`border rounded-lg p-4 ${enModoEdicion ? 'bg-[#F4F4F4]' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE]">
                        {t('organisms.profileDialog.contact')} {index + 1}
                      </Badge>
                      {enModoEdicion && formOrganismo.contactosNotificacion.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarContacto(index)}
                          className="text-[#DC3545] hover:text-[#DC3545]"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">{t('organisms.profileDialog.fullName')}</Label>
                        {enModoEdicion ? (
                          <Input 
                            placeholder={t('organisms.profileDialog.exampleName')}
                            value={contacto.nombre}
                            onChange={(e) => actualizarContacto(index, 'nombre', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-white rounded">{contacto.nombre || t('organisms.profileDialog.notSpecified')}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t('organisms.emailLabel')}</Label>
                        {enModoEdicion ? (
                          <Input 
                            type="email"
                            placeholder={t('organisms.profileDialog.exampleEmail')}
                            value={contacto.email}
                            onChange={(e) => actualizarContacto(index, 'email', e.target.value)}
                          />
                        ) : (
                          <p className="p-2 bg-white rounded">{contacto.email || t('organisms.profileDialog.notSpecified')}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t('organisms.profileDialog.position')}</Label>
                        {enModoEdicion ? (
                          <Select
                            value={contacto.cargo || ''}
                            onValueChange={(value) => actualizarContacto(index, 'cargo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('organisms.profileDialog.examplePosition')} />
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
                        ) : (
                          <p className="p-2 bg-white rounded">{contacto.cargo || t('organisms.profileDialog.notSpecified')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                {enModoEdicion ? (
                  <>
                    <input 
                      type="checkbox"
                      id="notificaciones-perfil"
                      checked={formOrganismo.notificaciones}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, notificaciones: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="notificaciones-perfil" className="mb-0 cursor-pointer">
                      <Bell className="w-4 h-4 inline mr-1 text-[#FFC107]" />
                      {t('organisms.profileDialog.sendAutoNotifications')}
                    </Label>
                  </>
                ) : (
                  <p className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FFC107]" />
                    <span>
                      {t('organisms.profileDialog.autoNotifications')} {formOrganismo.notificaciones ? t('organisms.profileDialog.activated') : t('organisms.profileDialog.deactivated')}
                    </span>
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ofertas" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-medium text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Tag className="w-5 h-5 text-[#1E73BE]" />
                    {t('organisms.profileDialog.availableOffersForOrganism')}
                  </h3>
                  <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE]">
                    {ofertasDelOrganismo.length} {ofertasDelOrganismo.length === 1 ? t('organisms.profileDialog.offer') : t('organisms.profileDialog.offersPlural')}
                  </Badge>
                </div>

                {ofertasDelOrganismo.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-[#666666] font-medium mb-1">
                      {t('organisms.profileDialog.noOffersAvailable')}
                    </p>
                    <p className="text-sm text-[#999999]">
                      {t('organisms.profileDialog.noActiveOffersAtMoment')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader className="bg-[#F4F4F4] sticky top-0">
                            <TableRow>
                              <TableHead className="font-medium">{t('organisms.profileDialog.offerNumber')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.title')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.products')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.quantity')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.value')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.expiration')}</TableHead>
                              <TableHead className="font-medium">{t('organisms.profileDialog.status')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ofertasDelOrganismo.map((oferta) => {
                              const estadoOferta = calcularEstadoOferta(oferta);
                              const cantidadTotal = oferta.productos.reduce((total, p) => total + p.cantidadDisponible, 0);
                              const nombreProductos = oferta.productos.slice(0, 2).map(p => p.productoNombre).join(', ');
                              const masProductos = oferta.productos.length > 2 ? ` +${oferta.productos.length - 2}` : '';
                              
                              return (
                                <TableRow key={oferta.id}>
                                  <TableCell className="font-medium text-[#1E73BE]">
                                    {oferta.numeroOferta}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-[#333333]">{oferta.titulo}</p>
                                      {oferta.descripcion && (
                                        <p className="text-xs text-[#666666] mt-1">
                                          {oferta.descripcion.length > 40 
                                            ? `${oferta.descripcion.substring(0, 40)}...` 
                                            : oferta.descripcion}
                                        </p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="text-[#333333]">{nombreProductos}{masProductos}</p>
                                      <p className="text-xs text-[#666666] mt-1">
                                        {oferta.productos.length} {oferta.productos.length === 1 ? t('organisms.profileDialog.product') : t('organisms.profileDialog.productsPlural')}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="font-medium text-[#333333]">{cantidadTotal} {t('organisms.profileDialog.units')}</p>
                                      <p className="font-medium text-[#333333]">{formatQuantity(cantidadTotal)} {t('organisms.profileDialog.units')}</p>
                                      <p className="text-xs text-[#666666]">{formatQuantity(oferta.totalKilos)} kg</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium text-[#4CAF50]">
                                    ${formatMoney(oferta.valorMonetarioTotal)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="text-[#333333]">
                                        {new Date(oferta.fechaExpiracion).toLocaleDateString(i18n.language)}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className="hover:bg-opacity-90" 
                                      style={{ backgroundColor: estadoOferta.color, color: 'white' }}
                                    >
                                      {estadoOferta.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Tag className="w-8 h-8 text-[#1E73BE] mx-auto mb-2" />
                            <Label className="text-sm text-[#666666]">{t('organisms.profileDialog.totalOffers')}</Label>
                            <p className="font-bold text-[#1E73BE] mt-2" style={{ fontSize: '1.5rem' }}>
                              {ofertasDelOrganismo.length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <PackageCheck className="w-8 h-8 text-[#4CAF50] mx-auto mb-2" />
                            <Label className="text-sm text-[#666666]">{t('organisms.profileDialog.activeOffers')}</Label>
                            <p className="font-bold text-[#4CAF50] mt-2" style={{ fontSize: '1.5rem' }}>
                              {ofertasDelOrganismo.filter(o => calcularEstadoOferta(o).estado === 'activa').length}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Package className="w-8 h-8 text-[#FFC107] mx-auto mb-2" />
                            <Label className="text-sm text-[#666666]">{t('organisms.profileDialog.totalAvailableValue')}</Label>
                            <p className="font-bold text-[#FFC107] mt-2" style={{ fontSize: '1.5rem' }}>
                              ${ofertasDelOrganismo
                                .filter(o => calcularEstadoOferta(o).estado === 'activa')
                                .reduce((total, o) => total + o.valorMonetarioTotal, 0)
                                .toLocaleString(i18n.language, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historial" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <PackageCheck className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.profileDialog.donationsHistoryReceived')}
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-[#F4F4F4]">
                        <TableRow>
                          <TableHead className="font-medium">{t('organisms.profileDialog.date')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.profileDialog.products')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.profileDialog.quantity')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.profileDialog.monetaryValue')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historialDonaciones.map((donacion, idx) => (
                          <TableRow key={`donacion-${organismoId}-${idx}`}>
                            <TableCell>{donacion.fecha}</TableCell>
                            <TableCell>{donacion.productos}</TableCell>
                            <TableCell>{donacion.cantidad}</TableCell>
                            <TableCell className="font-medium text-[#4CAF50]">{donacion.valorMonetario}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#333333]">{t('organisms.profileDialog.historicalTotal')}</p>
                        <p className="text-sm text-[#666666]">{t('organisms.profileDialog.sumAllDonations')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.5rem' }}>$9,200</p>
                        <p className="text-sm text-[#666666]">530 {t('organisms.profileDialog.totalKg')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-[#333333] pb-2 border-b flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <History className="w-5 h-5 text-[#1E73BE]" />
                  {t('organisms.profileDialog.prsRegistryHistory')}
                </h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-[#F4F4F4]">
                        <TableRow>
                          <TableHead className="font-medium">{t('organisms.profileDialog.date')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.profileDialog.serviceType')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.profileDialog.beneficiariesLabel')}</TableHead>
                          <TableHead className="font-medium">{t('organisms.responsible')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historialPRS.map((registro, idx) => (
                          <TableRow key={`prs-hist-${idx}`}>
                            <TableCell>{registro.fecha}</TableCell>
                            <TableCell>{registro.tipoServicio}</TableCell>
                            <TableCell>
                              <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE]">
                                {registro.beneficiarios}
                              </Badge>
                            </TableCell>
                            <TableCell>{registro.responsable}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#333333]">{t('organisms.profileDialog.totalBeneficiariesServed')}</p>
                        <p className="text-sm text-[#666666]">{t('organisms.profileDialog.historicalSumBeneficiaries')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.5rem' }}>325</p>
                        <p className="text-sm text-[#666666]">3 {t('organisms.profileDialog.servicesPerformed')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {enModoEdicion ? (
              <>
                <Button variant="outline" onClick={cancelarEdicion}>
                  {t('organisms.cancel')}
                </Button>
                <Button onClick={guardarCambios} className="bg-[#4CAF50] hover:bg-[#45a049]">
                  <PackageCheck className="w-4 h-4 mr-2" />
                  {t('organisms.profileDialog.saveChanges')}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => {
                onOpenChange(false);
                setModoEdicion(false);
              }}>
                {t('organisms.profileDialog.close')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}