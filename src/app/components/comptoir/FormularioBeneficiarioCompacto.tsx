import React, { useRef } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import {
  Users,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileUp,
  Settings,
  FileText,
  Heart,
  Home,
  Baby,
  DollarSign
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

interface FormBeneficiarioData {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
  foto: string | null;
  numeroIdentificacion: string;
  estadoCivil: string;
  numeroPersonasFoyer: number;
  numeroEnfants: number;
  ingresoMensual: number;
  situacionLaboral: string;
  tipoAyuda: string;
  frecuenciaVisita: string;
  activo: boolean;
  notas: string;
  alergias: string;
  preferenciasAlimentarias: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaRelacion: string;
  contactoEmergenciaTelefono: string;
  contactoEmergenciaEmail: string;
}

interface FormularioBeneficiarioCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: FormBeneficiarioData;
  setFormulario: React.Dispatch<React.SetStateAction<FormBeneficiarioData>>;
  modoEdicion: boolean;
  onGuardar: () => void;
}

export function FormularioBeneficiarioCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  onGuardar
}: FormularioBeneficiarioCompactoProps) {
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
        aria-describedby="beneficiary-form-description"
      >
        <div className="h-full flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white border-b-2 border-[#E0E0E0] px-6 py-3 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
              <Users className="w-5 h-5 inline mr-2" />
              {modoEdicion ? t('comptoir.editBeneficiary') : t('comptoir.newBeneficiary')}
            </DialogTitle>
            <DialogDescription id="beneficiary-form-description" className="sr-only">
              {modoEdicion ? t('comptoir.editBeneficiaryDescription') : t('comptoir.newBeneficiaryDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar izquierda: Foto y Estado */}
            <div className="w-64 border-r-2 border-[#E0E0E0] bg-[#F9FAFB] p-4 overflow-y-auto scrollbar-thin">
              {/* Photo */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#666666] mb-3 uppercase tracking-wide">
                  {t('comptoir.photo')}
                </h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-28 h-28 rounded-full border-4 overflow-hidden bg-white flex items-center justify-center"
                      style={{ borderColor: branding.primaryColor }}
                    >
                      {formulario.foto ? (
                        <img src={formulario.foto} alt="Photo" className="w-full h-full object-cover" />
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

              {/* État */}
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border-2" style={{ borderColor: formulario.activo ? branding.secondaryColor : '#999' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      id="activo"
                      checked={formulario.activo}
                      onCheckedChange={(checked) => setFormulario({ ...formulario, activo: checked as boolean })}
                    />
                    <Label htmlFor="activo" className="text-sm cursor-pointer font-semibold">
                      {t('comptoir.active')}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formulario.activo ? t('comptoir.beneficiaryActiveDescription') : t('comptoir.beneficiaryInactiveDescription')}
                  </p>
                </div>

                {/* Résumé rapide */}
                <div className="p-3 bg-white rounded-lg border-2 border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{t('comptoir.household')}:</span>
                    <span className="font-semibold">{formulario.numeroPersonasFoyer || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Baby className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{t('comptoir.children')}:</span>
                    <span className="font-semibold">{formulario.numeroEnfants || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{t('comptoir.income')}:</span>
                    <span className="font-semibold">{formulario.ingresoMensual || 0} CAD$</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal con Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-[#F9FAFB] px-6 py-0 h-12">
                  <TabsTrigger value="base" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <User className="w-4 h-4 mr-2" />
                    {t('comptoir.basicInfo')}
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('comptoir.contact')}
                  </TabsTrigger>
                  <TabsTrigger value="famille" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Home className="w-4 h-4 mr-2" />
                    {t('comptoir.family')}
                  </TabsTrigger>
                  <TabsTrigger value="aide" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Heart className="w-4 h-4 mr-2" />
                    {t('comptoir.aid')}
                  </TabsTrigger>
                  <TabsTrigger value="autres" className="data-[state=active]:border-b-2" style={{ borderColor: branding.primaryColor }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('comptoir.other')}
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Información Base */}
                <TabsContent value="base" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="nombre" className="text-xs">{t('comptoir.firstName')} *</Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder="Marie"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido" className="text-xs">{t('comptoir.lastName')} *</Label>
                        <Input
                          id="apellido"
                          value={formulario.apellido}
                          onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                          placeholder="Tremblay"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaNacimiento" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('comptoir.birthDate')}
                        </Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formulario.fechaNacimiento}
                          onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                          className="h-9"
                          placeholder="AAAA-MM-JJ"
                          title="Vous pouvez écrire directement l'année (ex: 1985-03-15)"
                          lang="fr-CA"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="numeroIdentificacion" className="text-xs">
                          {t('comptoir.idNumber')}
                        </Label>
                        <Input
                          id="numeroIdentificacion"
                          value={formulario.numeroIdentificacion}
                          onChange={(e) => setFormulario({ ...formulario, numeroIdentificacion: e.target.value })}
                          placeholder="BEN-2024-001"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estadoCivil" className="text-xs">{t('comptoir.maritalStatus')}</Label>
                        <Select value={formulario.estadoCivil} onValueChange={(value) => setFormulario({ ...formulario, estadoCivil: value })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('comptoir.selectMaritalStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="celibataire">{t('comptoir.single')}</SelectItem>
                            <SelectItem value="marie">{t('comptoir.married')}</SelectItem>
                            <SelectItem value="conjoint-de-fait">{t('comptoir.commonLaw')}</SelectItem>
                            <SelectItem value="divorce">{t('comptoir.divorced')}</SelectItem>
                            <SelectItem value="veuf">{t('comptoir.widowed')}</SelectItem>
                          </SelectContent>
                        </Select>
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
                            {t('comptoir.phone')} *
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
                            {t('comptoir.email')}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formulario.email}
                            onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                            placeholder="marie.tremblay@email.com"
                            className="h-9"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="direccion" className="text-xs">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {t('comptoir.address')}
                        </Label>
                        <AddressAutocomplete
                          value={formulario.direccion}
                          onChange={(value) => setFormulario({ ...formulario, direccion: value })}
                          placeholder={t('comptoir.addressPlaceholder')}
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
                            placeholder="Jean Dupont"
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
                            placeholder="jean.dupont@email.com"
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Famille */}
                <TabsContent value="famille" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="numeroPersonasFoyer" className="text-xs">
                          <Home className="w-3 h-3 inline mr-1" />
                          {t('comptoir.householdSize')}
                        </Label>
                        <Input
                          id="numeroPersonasFoyer"
                          type="number"
                          value={formulario.numeroPersonasFoyer}
                          onChange={(e) => setFormulario({ ...formulario, numeroPersonasFoyer: parseInt(e.target.value) || 0 })}
                          placeholder="1"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="numeroEnfants" className="text-xs">
                          <Baby className="w-3 h-3 inline mr-1" />
                          {t('comptoir.numberOfChildren')}
                        </Label>
                        <Input
                          id="numeroEnfants"
                          type="number"
                          value={formulario.numeroEnfants}
                          onChange={(e) => setFormulario({ ...formulario, numeroEnfants: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ingresoMensual" className="text-xs">
                          <DollarSign className="w-3 h-3 inline mr-1" />
                          {t('comptoir.monthlyIncome')}
                        </Label>
                        <Input
                          id="ingresoMensual"
                          type="number"
                          value={formulario.ingresoMensual}
                          onChange={(e) => setFormulario({ ...formulario, ingresoMensual: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="situacionLaboral" className="text-xs">
                        {t('comptoir.employmentStatus')}
                      </Label>
                      <Select value={formulario.situacionLaboral} onValueChange={(value) => setFormulario({ ...formulario, situacionLaboral: value })}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={t('comptoir.selectEmploymentStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employe">{t('comptoir.employed')}</SelectItem>
                          <SelectItem value="chomage">{t('comptoir.unemployed')}</SelectItem>
                          <SelectItem value="aide-sociale">{t('comptoir.socialAssistance')}</SelectItem>
                          <SelectItem value="retraite">{t('comptoir.retired')}</SelectItem>
                          <SelectItem value="etudiant">{t('comptoir.student')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Aide */}
                <TabsContent value="aide" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipoAyuda" className="text-xs">
                          <Heart className="w-3 h-3 inline mr-1" />
                          {t('comptoir.aidType')}
                        </Label>
                        <Select value={formulario.tipoAyuda} onValueChange={(value) => setFormulario({ ...formulario, tipoAyuda: value })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('comptoir.selectAidType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alimentaire">{t('comptoir.foodAid')}</SelectItem>
                            <SelectItem value="vestimentaire">{t('comptoir.clothingAid')}</SelectItem>
                            <SelectItem value="complete">{t('comptoir.completeAid')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="frecuenciaVisita" className="text-xs">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {t('comptoir.visitFrequency')}
                        </Label>
                        <Select value={formulario.frecuenciaVisita} onValueChange={(value) => setFormulario({ ...formulario, frecuenciaVisita: value })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t('comptoir.selectFrequency')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hebdomadaire">{t('comptoir.weekly')}</SelectItem>
                            <SelectItem value="bimensuel">{t('comptoir.biweekly')}</SelectItem>
                            <SelectItem value="mensuel">{t('comptoir.monthly')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="alergias" className="text-xs">
                        {t('comptoir.allergies')}
                      </Label>
                      <Textarea
                        id="alergias"
                        value={formulario.alergias}
                        onChange={(e) => setFormulario({ ...formulario, alergias: e.target.value })}
                        placeholder={t('comptoir.allergiesPlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferenciasAlimentarias" className="text-xs">
                        {t('comptoir.foodPreferences')}
                      </Label>
                      <Textarea
                        id="preferenciasAlimentarias"
                        value={formulario.preferenciasAlimentarias}
                        onChange={(e) => setFormulario({ ...formulario, preferenciasAlimentarias: e.target.value })}
                        placeholder={t('comptoir.foodPreferencesPlaceholder')}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Autres */}
                <TabsContent value="autres" className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin m-0">
                  <div className="max-w-4xl space-y-4">
                    <div>
                      <Label htmlFor="notas" className="text-xs">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {t('comptoir.notes')}
                      </Label>
                      <Textarea
                        id="notas"
                        value={formulario.notas}
                        onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                        placeholder={t('comptoir.notesPlaceholder')}
                        rows={6}
                      />
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