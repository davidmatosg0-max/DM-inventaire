import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  UserCheck,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileUp,
  Settings,
  FileText,
  Shield,
  IdCard,
  Truck,
  Users
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

interface FormChoferData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  foto: string | null;
  numeroLicencia: string;
  tipoLicencia: string;
  fechaExpiracionLicencia: string;
  activo: boolean;
  vehiculoAsignado: string;
  experienciaAnios: number;
  notas: string;
  documentos: string[];
  contactoEmergenciaNombre: string;
  contactoEmergenciaRelacion: string;
  contactoEmergenciaTelefono: string;
  contactoEmergenciaEmail: string;
}

interface FormularioChoferCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormChoferData;
  setFormulario: React.Dispatch<React.SetStateAction<FormChoferData>>;
  modoEdicion: boolean;
  onGuardar: () => void;
}

export function FormularioChoferCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar
}: FormularioChoferCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const fileInputFotoRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormulario({ ...formulario, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent 
        className="!max-w-none !w-[95vw] !max-h-[95vh] !h-[95vh] overflow-hidden p-0 m-0 rounded-xl"
        aria-describedby="driver-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <UserCheck className="w-5 h-5 inline mr-2" />
              {modoEdicion ? t('transport.editDriver') : t('transport.newDriver')}
            </DialogTitle>
            <DialogDescription id="driver-form-description" className="sr-only">
              {modoEdicion ? t('transport.editDriverDescription') : t('transport.newDriverDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Foto */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Photo du Chauffeur */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('transport.driverPhoto')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.foto ? (
                        <img src={formulario.foto} alt="Driver" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      className="absolute bottom-0 right-0 rounded-full text-white h-8 w-8"
                      style={{ backgroundColor: branding.primaryColor }}
                      onClick={() => fileInputFotoRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputFotoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="p-4 bg-white rounded-lg border-2" style={{ borderColor: formulario.activo ? branding.secondaryColor : '#999' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="activo"
                    checked={formulario.activo}
                    onCheckedChange={(checked) => setFormulario({ ...formulario, activo: checked as boolean })}
                  />
                  <Label htmlFor="activo" className="text-sm cursor-pointer font-semibold">
                    {t('transport.active')}
                  </Label>
                </div>
                <p className="text-xs text-gray-600">
                  {formulario.activo ? t('transport.driverActiveDescription') : t('transport.driverInactiveDescription')}
                </p>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <User className="w-4 h-4 mr-2" />
                    {t('transport.basicInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('transport.contact')}
                  </TabsTrigger>
                  <TabsTrigger value="licence" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <IdCard className="w-4 h-4 mr-2" />
                    {t('transport.license')}
                  </TabsTrigger>
                  <TabsTrigger value="affectation" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Truck className="w-4 h-4 mr-2" />
                    {t('transport.assignment')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('transport.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="nombre" className="text-xs">{t('transport.firstName')} *</Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder="Jean"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido" className="text-xs">{t('transport.lastName')} *</Label>
                        <Input
                          id="apellido"
                          value={formulario.apellido}
                          onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                          placeholder="Dupont"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaNacimiento" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('transport.birthDate')}
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formulario.fechaNacimiento}
                          onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                          className="h-9"
                        />
                      </div>
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
                          Contact Général
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="telefono" className="text-xs">
                            <Phone className="w-3 h-3 inline mr-1" />
                            {t('transport.phone')} *
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
                            {t('transport.email')}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formulario.email}
                            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                            placeholder="jean.dupont@email.com"
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="direccion" className="text-xs">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {t('transport.address')}
                        </Label>
                        <AddressAutocomplete
                          value={formulario.direccion}
                          onChange={(value) => setFormulario({ ...formulario, direccion: value })}
                          placeholder={t('transport.addressPlaceholder')}
                        />
                      </div>
                    </div>

                    {/* Persona de Contacto de Emergencia */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <User className="w-4 h-4 text-[#2d9561]" />
                        <h4 className="font-semibold text-sm text-[#333333]">
                          Contact d'Urgence
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactoEmergenciaNombre" className="text-xs">
                            <User className="w-3 h-3 inline mr-1" />
                            Nom complet
                          </Label>
                          <Input
                            id="contactoEmergenciaNombre"
                            type="text"
                            value={formulario.contactoEmergenciaNombre || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaNombre: e.target.value })}
                            placeholder="Marie Dubois"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactoEmergenciaRelacion" className="text-xs">
                            <Users className="w-3 h-3 inline mr-1" />
                            Relation
                          </Label>
                          <Input
                            id="contactoEmergenciaRelacion"
                            type="text"
                            value={formulario.contactoEmergenciaRelacion || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaRelacion: e.target.value })}
                            placeholder="Conjoint, Parent, Ami..."
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactoEmergenciaTelefono" className="text-xs">
                            <Phone className="w-3 h-3 inline mr-1" />
                            Téléphone
                          </Label>
                          <Input
                            id="contactoEmergenciaTelefono"
                            type="tel"
                            value={formulario.contactoEmergenciaTelefono || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaTelefono: e.target.value })}
                            placeholder="+1 (514) 123-4567"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactoEmergenciaEmail" className="text-xs">
                            <Mail className="w-3 h-3 inline mr-1" />
                            Email
                          </Label>
                          <Input
                            id="contactoEmergenciaEmail"
                            type="email"
                            value={formulario.contactoEmergenciaEmail || ''}
                            onChange={(e) => setFormulario({ ...formulario, contactoEmergenciaEmail: e.target.value })}
                            placeholder="marie.dubois@email.com"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Licence */}
                <TabsContent value="licence" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="numeroLicencia" className="text-xs">
                          <IdCard className="w-3 h-3 inline mr-1" />
                          {t('transport.licenseNumber')} *
                        </Label>
                        <Input
                          id="numeroLicencia"
                          value={formulario.numeroLicencia}
                          onChange={(e) => setFormulario({ ...formulario, numeroLicencia: e.target.value.toUpperCase() })}
                          placeholder="P1234-567890-12"
                          className="h-9 uppercase"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoLicencia" className="text-xs">{t('transport.licenseType')}</Label>
                        <Select value={formulario.tipoLicencia} onValueChange={(value) => setFormulario({ ...formulario, tipoLicencia: value })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('transport.selectLicenseType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="classe-5">{t('transport.class5')}</SelectItem>
                            <SelectItem value="classe-4a">{t('transport.class4a')}</SelectItem>
                            <SelectItem value="classe-3">{t('transport.class3')}</SelectItem>
                            <SelectItem value="classe-2">{t('transport.class2')}</SelectItem>
                            <SelectItem value="classe-1">{t('transport.class1')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fechaExpiracionLicencia" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('transport.licenseExpirationDate')}
                        </Label>
                        <Input
                          id="fechaExpiracionLicencia"
                          type="date"
                          value={formulario.fechaExpiracionLicencia}
                          onChange={(e) => setFormulario({ ...formulario, fechaExpiracionLicencia: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="experienciaAnios" className="text-xs">
                        {t('transport.yearsExperience')}
                      </Label>
                      <Input
                        id="experienciaAnios"
                        type="number"
                        value={formulario.experienciaAnios}
                        onChange={(e) => setFormulario({ ...formulario, experienciaAnios: parseInt(e.target.value) || 0 })}
                        placeholder="5"
                        className="h-9"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Affectation */}
                <TabsContent value="affectation" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="vehiculoAsignado" className="text-xs">
                        <Truck className="w-3 h-3 inline mr-1" />
                        {t('transport.assignedVehicle')}
                      </Label>
                      <Select value={formulario.vehiculoAsignado} onValueChange={(value) => setFormulario({ ...formulario, vehiculoAsignado: value })}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={t('transport.selectVehicle')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ninguno">{t('transport.noVehicle')}</SelectItem>
                          <SelectItem value="vehiculo-1">Camion ABC-1234</SelectItem>
                          <SelectItem value="vehiculo-2">Furgoneta XYZ-5678</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="notas" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('transport.notes')}
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder={t('transport.notesPlaceholder')}
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentos" className="text-xs">
                        <FileUp className="w-3 h-3 inline mr-1" />
                        {t('transport.documents')}
                      </Label>
                      <Input
                        id="documentos"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="h-9"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('transport.documentsHint')}
                      </p>
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