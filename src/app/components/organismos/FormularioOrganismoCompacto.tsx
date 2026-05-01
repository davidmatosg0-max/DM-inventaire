import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Building2,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileUp,
  Settings,
  Users,
  Bell,
  Clock,
  Package,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';

interface ContactoNotificacion {
  nombre: string;
  email: string;
  cargo: string;
  joursDisponibles: JourDisponible[];
}

interface FormOrganismoData {
  nombre: string;
  tipo: string;
  codigoPostal: string;
  direccion: string;
  quartier: string;
  responsable: string;
  beneficiarios: number;
  telefono: string;
  email: string;
  frecuenciaCita: string;
  horaCita: string;
  participantePRS: boolean;
  regular: boolean;
  activo: boolean;
  personasServidas: number;
  cantidadColaciones: number;
  cantidadAlmuerzos: number;
  porcentajeReparticion: number;
  notas: string;
  notificaciones: boolean;
  logo: string | null;
  documentoPDF: string | null;
  contactosNotificacion: ContactoNotificacion[];
  fechaInicioInactividad: string;
  fechaFinInactividad: string;
  contactoCargo: string;
  contactoTelefono: string;
  contactoEmail: string;
  contactoJoursDisponibles: JourDisponible[];
}

interface FormularioOrganismoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormOrganismoData;
  setFormulario: React.Dispatch<React.SetStateAction<FormOrganismoData>>;
  modoEdicion: boolean;
  onGuardar: () => void;
  tiposOrganismo: { id: string; nombre: string; icono: string; }[];
}

export function FormularioOrganismoCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar,
  tiposOrganismo
}: FormularioOrganismoCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputDocRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario({ ...formulario, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getTipoConfig = (tipoId: string) => {
    const tipo = tiposOrganismo.find(t => t.id === tipoId);
    if (!tipo) return { icono: '📌', nombre: t('organisms.organismTypes.other') };
    return tipo;
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
        aria-describedby="organism-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <Building2 className="w-5 h-5 inline mr-2" />
              {modoEdicion ? t('organisms.editOrganism') : t('organisms.newOrganism')}
            </DialogTitle>
            <DialogDescription id="organism-form-description" className="sr-only">
              {modoEdicion ? t('organisms.editOrganismDescription') : t('organisms.newOrganismDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Logo y Tipo */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Logo */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('organisms.logo')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-lg border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.logo ? (
                        <img src={formulario.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputLogoRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputLogoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Type d'Organisme */}
              <div>
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('organisms.type')}
                </h4>
                <div className="space-y-2">
                  {tiposOrganismo.slice(0, 10).map((tipo) => {
                    const isSelected = formulario.tipo === tipo.id;
                    return (
                      <div
                        key={tipo.id}
                        onClick={() => setFormulario({ ...formulario, tipo: tipo.id })}
                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? branding.primaryColor : '#E0E0E0',
                          backgroundColor: isSelected ? `${branding.primaryColor}15` : 'white',
                          ringColor: branding.primaryColor
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-xl">
                            {tipo.icono}
                          </div>
                          <span className="text-xs font-medium text-[#333333] leading-tight">
                            {tipo.nombre}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Building2 className="w-4 h-4 mr-2" />
                    {t('organisms.basicInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('organisms.contact')}
                  </TabsTrigger>
                  <TabsTrigger value="services" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Users className="w-4 h-4 mr-2" />
                    {t('organisms.services')}
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Bell className="w-4 h-4 mr-2" />
                    {t('organisms.notifications')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('organisms.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="nombre" className="text-xs">{t('organisms.name')} *</Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder={t('organisms.namePlaceholder')}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="codigoPostal" className="text-xs">{t('organisms.postalCode')}</Label>
                        <Input
                          id="codigoPostal"
                          value={formulario.codigoPostal}
                          onChange={(e) => setFormulario({ ...formulario, codigoPostal: e.target.value })}
                          placeholder="H1A 1B2"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quartier" className="text-xs">{t('organisms.neighborhood')} *</Label>
                        <Input
                          id="quartier"
                          value={formulario.quartier}
                          onChange={(e) => setFormulario({ ...formulario, quartier: e.target.value })}
                          placeholder={t('organisms.neighborhoodPlaceholder')}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="responsable" className="text-xs">{t('organisms.responsible')}</Label>
                        <Input
                          id="responsable"
                          value={formulario.responsable}
                          onChange={(e) => setFormulario({ ...formulario, responsable: e.target.value })}
                          placeholder={t('organisms.responsiblePlaceholder')}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="direccion" className="text-xs">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {t('organisms.address')}
                      </Label>
                      <AddressAutocomplete
                        value={formulario.direccion}
                        onChange={(value) => setFormulario({ ...formulario, direccion: value })}
                        placeholder={t('organisms.addressPlaceholder')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Contact */}
                <TabsContent value="contact" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-6">
                    {/* Información General de Contacto */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Phone className="w-4 h-4 text-[#1a4d7a]" />
                        <h4 className="font-semibold text-sm text-[#333333]">
                          {t('organisms.generalContact') || 'Contact Général'}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telefono" className="text-xs">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {t('organisms.phone')}
                          </Label>
                          <Input
                            id="telefono"
                            type="tel"
                            value={formulario.telefono}
                            onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                            placeholder="+1 (514) 123-4567"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-xs">
                            <Mail className="w-3 h-3 inline mr-1" />
                            {t('organisms.emailLabel')}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formulario.email}
                            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                            placeholder="contact@organisme.org"
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frecuenciaCita" className="text-xs">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {t('organisms.appointmentFrequency')}
                          </Label>
                          <Select value={formulario.frecuenciaCita} onValueChange={(value) => setFormulario({ ...formulario, frecuenciaCita: value })}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder={t('organisms.selectFrequency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lundi">{t('common.days.monday')}</SelectItem>
                              <SelectItem value="mardi">{t('common.days.tuesday')}</SelectItem>
                              <SelectItem value="mercredi">{t('common.days.wednesday')}</SelectItem>
                              <SelectItem value="jeudi">{t('common.days.thursday')}</SelectItem>
                              <SelectItem value="vendredi">{t('common.days.friday')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="horaCita" className="text-xs">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {t('organisms.appointmentTime')}
                          </Label>
                          <Input
                            id="horaCita"
                            type="time"
                            value={formulario.horaCita}
                            onChange={(e) => setFormulario({ ...formulario, horaCita: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Persona de Contacto Principal */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <User className="w-4 h-4 text-[#2d9561]" />
                        <h4 className="font-semibold text-sm text-[#333333]">
                          Personne de Contact Principal
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactNombre" className="text-xs">
                            <User className="w-3 h-3 inline mr-1" />
                            Nom complet
                          </Label>
                          <Input
                            id="contactNombre"
                            type="text"
                            value={formulario.responsable}
                            onChange={(e) => setFormulario({ ...formulario, responsable: e.target.value })}
                            placeholder="Jean Dupont"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactCargo" className="text-xs">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            Poste / Rôle
                          </Label>
                          <Input
                            id="contactCargo"
                            type="text"
                            value={formulario.contactoCargo || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoCargo: e.target.value })}
                            placeholder="Directeur"
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactTelefono" className="text-xs">
                            <Phone className="w-3 h-3 inline mr-1" />
                            Téléphone direct
                          </Label>
                          <Input
                            id="contactTelefono"
                            type="tel"
                            value={formulario.contactoTelefono || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoTelefono: e.target.value })}
                            placeholder="+1 (514) 123-4567"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail" className="text-xs">
                            <Mail className="w-3 h-3 inline mr-1" />
                            Email direct
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={formulario.contactoEmail || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmail: e.target.value })}
                            placeholder="jean.dupont@organisme.org"
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      {/* Días disponibles de la persona de contacto */}
                      <div className="pt-3">
                        <SelecteurJoursDisponibles
                          joursDisponibles={formulario.contactoJoursDisponibles || []}
                          onChange={(jours) => {
                            setFormulario({ ...formulario, contactoJoursDisponibles: jours });
                          }}
                          showIcon={false}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Services */}
                <TabsContent value="services" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="beneficiarios" className="text-xs">
                          <Users className="w-3 h-3 inline mr-1" />
                          {t('organisms.beneficiaries')}
                        </Label>
                        <Input
                          id="beneficiarios"
                          type="number"
                          value={formulario.beneficiarios}
                          onChange={(e) => setFormulario({ ...formulario, beneficiarios: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="personasServidas" className="text-xs">
                          {t('organisms.peopleServed')}
                        </Label>
                        <Input
                          id="personasServidas"
                          type="number"
                          value={formulario.personasServidas}
                          onChange={(e) => setFormulario({ ...formulario, personasServidas: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="porcentajeReparticion" className="text-xs">
                          {t('organisms.distributionPercentage')}
                        </Label>
                        <Input
                          id="porcentajeReparticion"
                          type="number"
                          value={formulario.porcentajeReparticion}
                          onChange={(e) => setFormulario({
                            ...formulario,
                            porcentajeReparticion: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })}
                          placeholder="0"
                          className="h-9"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cantidadColaciones" className="text-xs">
                          {t('organisms.snacks')}
                        </Label>
                        <Input
                          id="cantidadColaciones"
                          type="number"
                          value={formulario.cantidadColaciones}
                          onChange={(e) => setFormulario({ ...formulario, cantidadColaciones: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cantidadAlmuerzos" className="text-xs">
                          {t('organisms.lunches')}
                        </Label>
                        <Input
                          id="cantidadAlmuerzos"
                          type="number"
                          value={formulario.cantidadAlmuerzos}
                          onChange={(e) => setFormulario({ ...formulario, cantidadAlmuerzos: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="participantePRS"
                          checked={formulario.participantePRS}
                          onCheckedChange={(checked) => setFormulario({ ...formulario, participantePRS: checked as boolean })}
                        />
                        <Label htmlFor="participantePRS" className="text-xs cursor-pointer">
                          {t('organisms.prsParticipant')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="regular"
                          checked={formulario.regular}
                          onCheckedChange={(checked) => setFormulario({ ...formulario, regular: checked as boolean })}
                        />
                        <Label htmlFor="regular" className="text-xs cursor-pointer">
                          {t('organisms.regularClient')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="activo"
                          checked={formulario.activo}
                          onCheckedChange={(checked) => setFormulario({ ...formulario, activo: checked as boolean })}
                        />
                        <Label htmlFor="activo" className="text-xs cursor-pointer">
                          {t('organisms.active')}
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Notifications */}
                <TabsContent value="notifications" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Checkbox
                        id="notificaciones"
                        checked={formulario.notificaciones}
                        onCheckedChange={(checked) => setFormulario({ ...formulario, notificaciones: checked as boolean })}
                      />
                      <Label htmlFor="notificaciones" className="text-sm cursor-pointer">
                        {t('organisms.enableNotifications')}
                      </Label>
                    </div>
                    {formulario.contactosNotificacion.map((contacto, index) => (
                      <div key={index} className="p-4 border-2 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm">{t('organisms.contact')} {index + 1}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            value={contacto.nombre}
                            onChange={(e) => {
                              const nuevos = [...formulario.contactosNotificacion];
                              nuevos[index].nombre = e.target.value;
                              setFormulario({ ...formulario, contactosNotificacion: nuevos });
                            }}
                            placeholder={t('organisms.contactName')}
                            className="h-9"
                          />
                          <Input
                            type="email"
                            value={contacto.email}
                            onChange={(e) => {
                              const nuevos = [...formulario.contactosNotificacion];
                              nuevos[index].email = e.target.value;
                              setFormulario({ ...formulario, contactosNotificacion: nuevos });
                            }}
                            placeholder={t('organisms.contactEmail')}
                            className="h-9"
                          />
                          <Input
                            value={contacto.cargo}
                            onChange={(e) => {
                              const nuevos = [...formulario.contactosNotificacion];
                              nuevos[index].cargo = e.target.value;
                              setFormulario({ ...formulario, contactosNotificacion: nuevos });
                            }}
                            placeholder={t('organisms.contactPosition')}
                            className="h-9"
                          />
                        </div>
                        <SelecteurJoursDisponibles
                          joursDisponibles={contacto.joursDisponibles}
                          onChange={(jours) => {
                            const nuevos = [...formulario.contactosNotificacion];
                            nuevos[index].joursDisponibles = jours;
                            setFormulario({ ...formulario, contactosNotificacion: nuevos });
                          }}
                          showIcon={true}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormulario({
                          ...formulario,
                          contactosNotificacion: [
                            ...formulario.contactosNotificacion,
                            { nombre: '', email: '', cargo: '', joursDisponibles: [] }
                          ]
                        });
                      }}
                      className="w-full"
                    >
                      + {t('organisms.addContact')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="notas" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('organisms.notes')}
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder={t('organisms.notesPlaceholder')}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentoPDF" className="text-xs">
                        <FileUp className="w-3 h-3 inline mr-1" />
                        {t('organisms.document')}
                      </Label>
                      <Input
                        ref={fileInputDocRef}
                        id="documentoPDF"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormulario({ ...formulario, documentoPDF: file.name });
                          }
                        }}
                        className="h-9"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fechaInicioInactividad" className="text-xs">
                          {t('organisms.inactivityStartDate')}
                        </Label>
                        <Input
                          id="fechaInicioInactividad"
                          type="date"
                          value={formulario.fechaInicioInactividad}
                          onChange={(e) => setFormulario({ ...formulario, fechaInicioInactividad: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaFinInactividad" className="text-xs">
                          {t('organisms.inactivityEndDate')}
                        </Label>
                        <Input
                          id="fechaFinInactividad"
                          type="date"
                          value={formulario.fechaFinInactividad}
                          onChange={(e) => setFormulario({ ...formulario, fechaFinInactividad: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer con botones de acción */}
              <div className="sticky bottom-0 bg-white border-t-2 border-[#E0E0E0] px-6 py-3 shadow-sm flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onCerrar}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={onGuardar}
                  className="text-white"
                  style={{ 
                    backgroundColor: branding.primaryColor,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600
                  }}
                >
                  {modoEdicion ? t('common.save') : t('common.create')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}