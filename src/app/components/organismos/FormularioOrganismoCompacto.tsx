import React, { useRef } from 'react';
import {
  Bell,
  Building2,
  Calendar,
  Camera,
  Clock,
  FileText,
  FileUp,
  Mail,
  MapPin,
  Phone,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { SelecteurJoursDisponibles } from '../shared/SelecteurJoursDisponibles';

interface FormularioOrganismoCompactoProps {
  abierto: boolean;
  onCerrar: () => void;
  formulario: any;
  setFormulario: React.Dispatch<React.SetStateAction<any>>;
  modoEdicion: boolean;
  modoVisualizacion?: boolean;
  onGuardar: () => void;
  tiposOrganismo: { id: string; nombre: string; icono: string }[];
}

const quartiersLaval = [
  'Auteuil',
  'Chomedey',
  'Duvernay',
  'Fabreville',
  'Laval-des-Rapides',
  'Laval-Ouest',
  'Laval-sur-le-Lac',
  'Pont-Viau',
  'Sainte-Dorothee',
  'Sainte-Rose',
  'Saint-Francois',
  'Saint-Vincent-de-Paul',
  'Vimont',
  'Iles-Laval',
];

const joursCita = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export function FormularioOrganismoCompacto({
  abierto,
  onCerrar,
  formulario,
  setFormulario,
  modoEdicion,
  modoVisualizacion = false,
  onGuardar,
  tiposOrganismo,
}: FormularioOrganismoCompactoProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const esConsulta = modoVisualizacion;

  const tipoSeleccionado = tiposOrganismo.find((tipo) => tipo.nombre === formulario.tipo);

  const actualizarFormulario = (cambios: Record<string, unknown>) => {
    setFormulario((prev: any) => ({ ...prev, ...cambios }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      actualizarFormulario({ logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    actualizarFormulario({ documentoPDF: file.name });
  };

  const updateNotificationContact = (index: number, cambios: Record<string, unknown>) => {
    const contactos = [...(formulario.contactosNotificacion || [])];
    contactos[index] = { ...contactos[index], ...cambios };
    actualizarFormulario({ contactosNotificacion: contactos });
  };

  const addNotificationContact = () => {
    actualizarFormulario({
      contactosNotificacion: [
        ...(formulario.contactosNotificacion || []),
        { nombre: '', email: '', cargo: '', joursDisponibles: [] },
      ],
    });
  };

  const removeNotificationContact = (index: number) => {
    const contactos = (formulario.contactosNotificacion || []).filter((_: unknown, contactoIndex: number) => contactoIndex !== index);
    actualizarFormulario({
      contactosNotificacion: contactos.length > 0 ? contactos : [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
    });
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => { if (!open) onCerrar(); }}>
      <DialogContent className="!max-w-none !w-[96vw] !h-[95vh] overflow-hidden rounded-[28px] border-0 p-0 shadow-2xl">
        <div className="flex h-full flex-col bg-[linear-gradient(180deg,#f7fbff_0%,#edf5fb_100%)]">
          <DialogHeader
            className="border-b border-white/20 px-5 py-5 text-white sm:px-6"
            style={{ background: `linear-gradient(120deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
                  {esConsulta ? 'Fiche organisme' : modoEdicion ? t('organisms.editOrganism') : t('organisms.newOrganism')}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-white/90">
                  {esConsulta
                    ? 'Consultation en lecture seule de la fiche organisme dans la meme vue compacte.'
                    : 'Vue compacte pour saisir rapidement la fiche organisme avec une presentation plus nette.'}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                  <div className="opacity-80">Etat</div>
                  <div className="font-semibold">{formulario.activo ? t('organisms.active') : t('organisms.inactive')}</div>
                </div>
                <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                  <div className="opacity-80">Type</div>
                  <div className="truncate font-semibold">{tipoSeleccionado?.nombre || 'A definir'}</div>
                </div>
                <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
                  <div className="opacity-80">PRS</div>
                  <div className="font-semibold">{formulario.participantePRS ? 'Oui' : 'Non'}</div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <aside className="overflow-y-auto border-b border-[#dbe6f0] bg-white/80 p-5 backdrop-blur-md lg:w-[320px] lg:border-b-0 lg:border-r">
              <div className={`space-y-5 ${esConsulta ? 'pointer-events-none' : ''}`}>
                <section className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7c8d]">Logo</h3>
                    {formulario.logo ? (
                      <button type="button" onClick={() => actualizarFormulario({ logo: null })} className="rounded-full p-1 text-[#6a7c8d] hover:bg-[#eef5fb]">
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 bg-[#f7fafc]" style={{ borderColor: `${branding.primaryColor}30` }}>
                      {formulario.logo ? (
                        <img src={formulario.logo} alt="Logo" className="h-full w-full object-contain p-3" />
                      ) : (
                        <Building2 className="h-14 w-14 text-[#9cb0c3]" />
                      )}
                    </div>
                    <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={() => logoInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      {formulario.logo ? 'Changer le logo' : 'Ajouter un logo'}
                    </Button>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </div>
                </section>

                <section className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm space-y-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6a7c8d]">Type</Label>
                    <Select value={formulario.tipo} onValueChange={(value) => actualizarFormulario({ tipo: value })} disabled={esConsulta}>
                      <SelectTrigger className="mt-2 h-11 rounded-2xl border-[#dbe6f0] bg-[#f8fbff]">
                        <SelectValue placeholder={t('organisms.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposOrganismo.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.nombre}>
                            {tipo.icono} {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-2xl bg-[#f8fbff] px-3 py-3 text-sm text-[#42566b]">
                    <div className="font-semibold text-[#16324f]">{tipoSeleccionado ? `${tipoSeleccionado.icono} ${tipoSeleccionado.nombre}` : 'Selectionnez le type d organisme'}</div>
                    <p className="mt-1 text-xs text-[#6a7c8d]">Les informations principales sont groupees en onglets pour garder une fiche compacte.</p>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="rounded-2xl bg-[#f8fbff] px-3 py-2">
                      <div className="text-[#6a7c8d]">Quartier</div>
                      <div className="font-semibold text-[#16324f]">{formulario.quartier || 'A definir'}</div>
                    </div>
                    <div className="rounded-2xl bg-[#f8fbff] px-3 py-2">
                      <div className="text-[#6a7c8d]">Contact</div>
                      <div className="font-semibold text-[#16324f]">{formulario.responsable || 'Non renseigne'}</div>
                    </div>
                  </div>
                </section>
              </div>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Tabs defaultValue="base" className="flex min-h-0 flex-1 flex-col">
                <TabsList className="h-auto justify-start gap-1 overflow-x-auto rounded-none border-b border-[#dbe6f0] bg-white/75 px-3 py-2 sm:px-6">
                  <TabsTrigger value="base" className="rounded-xl"><Building2 className="mr-2 h-4 w-4" />{t('organisms.basicInfo')}</TabsTrigger>
                  <TabsTrigger value="contact" className="rounded-xl"><Phone className="mr-2 h-4 w-4" />{t('organisms.contact')}</TabsTrigger>
                  <TabsTrigger value="services" className="rounded-xl"><Users className="mr-2 h-4 w-4" />{t('organisms.services')}</TabsTrigger>
                  <TabsTrigger value="notifications" className="rounded-xl"><Bell className="mr-2 h-4 w-4" />{t('organisms.notifications')}</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-xl"><Settings className="mr-2 h-4 w-4" />{t('organisms.other')}</TabsTrigger>
                </TabsList>

                <TabsContent value="base" className="m-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className={`max-w-5xl space-y-4 ${esConsulta ? 'pointer-events-none' : ''}`}>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm lg:col-span-2">
                        <Label htmlFor="organismo-nombre" className="text-xs">{t('organisms.name')} *</Label>
                        <Input id="organismo-nombre" value={formulario.nombre} onChange={(event) => actualizarFormulario({ nombre: event.target.value })} placeholder={t('organisms.namePlaceholder')} className="mt-2 h-11 rounded-2xl border-[#dbe6f0]" />
                      </div>
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="organismo-cp" className="text-xs">{t('organisms.postalCode')}</Label>
                        <Input id="organismo-cp" value={formulario.codigoPostal} onChange={(event) => actualizarFormulario({ codigoPostal: event.target.value })} placeholder="H1A 1B2" className="mt-2 h-11 rounded-2xl border-[#dbe6f0]" />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label className="text-xs">{t('organisms.neighborhood')} *</Label>
                        <Select value={formulario.quartier || ''} onValueChange={(value) => actualizarFormulario({ quartier: value })}>
                          <SelectTrigger className="mt-2 h-11 rounded-2xl border-[#dbe6f0]">
                            <SelectValue placeholder="Selectionnez un quartier" />
                          </SelectTrigger>
                          <SelectContent>
                            {quartiersLaval.map((quartier) => (
                              <SelectItem key={quartier} value={quartier}>{quartier}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="organismo-responsable" className="text-xs">{t('organisms.responsible')}</Label>
                        <Input id="organismo-responsable" value={formulario.responsable} onChange={(event) => actualizarFormulario({ responsable: event.target.value })} placeholder={t('organisms.responsiblePlaceholder')} className="mt-2 h-11 rounded-2xl border-[#dbe6f0]" />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label className="text-xs"><MapPin className="mr-1 inline h-3 w-3" />{t('organisms.address')}</Label>
                        <div className="mt-2">
                          <AddressAutocomplete
                            value={formulario.direccion}
                            disabled={esConsulta}
                            initialQuartier={formulario.quartier || ''}
                            initialPostalCode={formulario.codigoPostal || ''}
                            onChange={(value, details) => actualizarFormulario({
                              direccion: value,
                              codigoPostal: details?.postalCode || formulario.codigoPostal,
                              quartier: details?.quartier || formulario.quartier,
                            })}
                            onAddressSelect={(address) => actualizarFormulario({
                              direccion: address.street,
                              codigoPostal: address.postalCode,
                              quartier: address.quartier || formulario.quartier,
                            })}
                            placeholder={t('organisms.addressPlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm space-y-4">
                        <div>
                          <Label className="text-xs">Classification</Label>
                          <Select value={formulario.clasificacionOrganismo || 'regular'} onValueChange={(value) => actualizarFormulario({ clasificacionOrganismo: value, regular: value !== 'eventual' })} disabled={esConsulta}>
                            <SelectTrigger className="mt-2 h-11 rounded-2xl border-[#dbe6f0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regulier</SelectItem>
                              <SelectItem value="eventual">Eventuel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Etat</Label>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Button type="button" variant={formulario.activo ? 'default' : 'outline'} className="rounded-2xl" onClick={() => actualizarFormulario({ activo: true })} style={formulario.activo ? { backgroundColor: branding.secondaryColor } : undefined}>Actif</Button>
                            <Button type="button" variant={!formulario.activo ? 'default' : 'outline'} className="rounded-2xl" onClick={() => actualizarFormulario({ activo: false })} style={!formulario.activo ? { backgroundColor: branding.primaryColor } : undefined}>Inactif</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!formulario.activo ? (
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                          <Label htmlFor="organismo-inicio" className="text-xs">{t('organisms.inactivityStartDate')}</Label>
                          <Input id="organismo-inicio" type="date" value={formulario.fechaInicioInactividad || ''} onChange={(event) => actualizarFormulario({ fechaInicioInactividad: event.target.value })} className="mt-2 h-11 rounded-2xl border-[#dbe6f0]" />
                        </div>
                        <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                          <Label htmlFor="organismo-fin" className="text-xs">{t('organisms.inactivityEndDate')}</Label>
                          <Input id="organismo-fin" type="date" value={formulario.fechaFinInactividad || ''} onChange={(event) => actualizarFormulario({ fechaFinInactividad: event.target.value })} className="mt-2 h-11 rounded-2xl border-[#dbe6f0]" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="m-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className={`max-w-5xl space-y-4 ${esConsulta ? 'pointer-events-none' : ''}`}>
                    <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm space-y-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <Label htmlFor="organismo-telephone" className="text-xs"><Phone className="mr-1 inline h-3 w-3" />{t('organisms.phone')}</Label>
                          <Input id="organismo-telephone" value={formulario.telefono} onChange={(event) => actualizarFormulario({ telefono: event.target.value })} placeholder="+1 (514) 123-4567" className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                        <div>
                          <Label htmlFor="organismo-email" className="text-xs"><Mail className="mr-1 inline h-3 w-3" />{t('organisms.emailLabel')}</Label>
                          <Input id="organismo-email" type="email" value={formulario.email} onChange={(event) => actualizarFormulario({ email: event.target.value })} placeholder="contact@organisme.org" className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div>
                          <Label className="text-xs"><Calendar className="mr-1 inline h-3 w-3" />{t('organisms.appointmentFrequency')}</Label>
                          <Select value={formulario.frecuenciaCita || ''} onValueChange={(value) => actualizarFormulario({ frecuenciaCita: value })} disabled={esConsulta}>
                            <SelectTrigger className="mt-2 h-10 rounded-2xl border-[#dbe6f0]">
                              <SelectValue placeholder={t('organisms.selectFrequency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                              <SelectItem value="bihebdomadaire">Aux deux semaines</SelectItem>
                              <SelectItem value="mensuelle">Mensuelle</SelectItem>
                              <SelectItem value="ponctuelle">Ponctuelle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Jour de rendez vous</Label>
                          <Select value={formulario.diaCita || ''} onValueChange={(value) => actualizarFormulario({ diaCita: value })} disabled={esConsulta}>
                            <SelectTrigger className="mt-2 h-10 rounded-2xl border-[#dbe6f0]">
                              <SelectValue placeholder="Selectionnez un jour" />
                            </SelectTrigger>
                            <SelectContent>
                              {joursCita.map((jour) => (
                                <SelectItem key={jour} value={jour}>{jour}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="organismo-heure" className="text-xs"><Clock className="mr-1 inline h-3 w-3" />{t('organisms.appointmentTime')}</Label>
                          <Input id="organismo-heure" type="time" value={formulario.horaCita || ''} onChange={(event) => actualizarFormulario({ horaCita: event.target.value })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm space-y-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <Label htmlFor="contact-cargo" className="text-xs">Poste / role</Label>
                          <Input id="contact-cargo" value={formulario.contactoCargo || ''} onChange={(event) => actualizarFormulario({ contactoCargo: event.target.value })} placeholder="Direction" className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                        <div>
                          <Label htmlFor="contact-telephone" className="text-xs">Telephone direct</Label>
                          <Input id="contact-telephone" value={formulario.contactoTelefono || ''} onChange={(event) => actualizarFormulario({ contactoTelefono: event.target.value })} placeholder="+1 (514) 123-4567" className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contact-email" className="text-xs">Email direct</Label>
                        <Input id="contact-email" type="email" value={formulario.contactoEmail || ''} onChange={(event) => actualizarFormulario({ contactoEmail: event.target.value })} placeholder="jean.dupont@organisme.org" className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                      <div className="rounded-2xl bg-[#f8fbff] p-3">
                        <SelecteurJoursDisponibles joursDisponibles={formulario.contactoJoursDisponibles || []} onChange={(jours) => actualizarFormulario({ contactoJoursDisponibles: jours })} showIcon={false} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="m-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className={`max-w-5xl space-y-4 ${esConsulta ? 'pointer-events-none' : ''}`}>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="beneficiarios" className="text-xs">{t('organisms.beneficiaries')}</Label>
                        <Input id="beneficiarios" type="number" value={formulario.beneficiarios || 0} onChange={(event) => actualizarFormulario({ beneficiarios: parseInt(event.target.value, 10) || 0 })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="personas-servidas" className="text-xs">{t('organisms.peopleServed')}</Label>
                        <Input id="personas-servidas" type="number" value={formulario.personasServidas || 0} onChange={(event) => actualizarFormulario({ personasServidas: parseInt(event.target.value, 10) || 0 })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="porcentaje" className="text-xs">{t('organisms.distributionPercentage')}</Label>
                        <Input id="porcentaje" type="number" min="0" max="100" value={formulario.porcentajeReparticion || 0} onChange={(event) => actualizarFormulario({ porcentajeReparticion: Math.max(0, Math.min(100, parseInt(event.target.value, 10) || 0)) })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="colaciones" className="text-xs">{t('organisms.snacks')}</Label>
                        <Input id="colaciones" type="number" value={formulario.cantidadColaciones || 0} onChange={(event) => actualizarFormulario({ cantidadColaciones: parseInt(event.target.value, 10) || 0 })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                      <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                        <Label htmlFor="almuerzos" className="text-xs">{t('organisms.lunches')}</Label>
                        <Input id="almuerzos" type="number" value={formulario.cantidadAlmuerzos || 0} onChange={(event) => actualizarFormulario({ cantidadAlmuerzos: parseInt(event.target.value, 10) || 0 })} className="mt-2 h-10 rounded-2xl border-[#dbe6f0]" />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3 rounded-2xl bg-[#f8fbff] px-3 py-3">
                        <Checkbox id="prs-participant" checked={!!formulario.participantePRS} onCheckedChange={(checked) => actualizarFormulario({ participantePRS: checked as boolean })} />
                        <Label htmlFor="prs-participant" className="cursor-pointer text-sm">{t('organisms.prsParticipant')}</Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="m-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className={`max-w-5xl space-y-4 ${esConsulta ? 'pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-2 rounded-3xl border border-[#e7eef5] bg-white px-4 py-4 shadow-sm">
                      <Checkbox id="notifications-enabled" checked={!!formulario.notificaciones} onCheckedChange={(checked) => actualizarFormulario({ notificaciones: checked as boolean })} />
                      <Label htmlFor="notifications-enabled" className="cursor-pointer text-sm">{t('organisms.enableNotifications')}</Label>
                    </div>

                    {(formulario.contactosNotificacion || []).map((contacto: any, index: number) => (
                      <div key={`${contacto.email || 'contact'}-${index}`} className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold">{t('organisms.contact')} {index + 1}</h4>
                          {(formulario.contactosNotificacion || []).length > 1 ? (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeNotificationContact(index)}>Retirer</Button>
                          ) : null}
                        </div>
                        <div className="grid gap-3 lg:grid-cols-3">
                          <Input value={contacto.nombre || ''} onChange={(event) => updateNotificationContact(index, { nombre: event.target.value })} placeholder={t('organisms.contactName')} className="h-10 rounded-2xl border-[#dbe6f0]" />
                          <Input type="email" value={contacto.email || ''} onChange={(event) => updateNotificationContact(index, { email: event.target.value })} placeholder={t('organisms.contactEmail')} className="h-10 rounded-2xl border-[#dbe6f0]" />
                          <Input value={contacto.cargo || ''} onChange={(event) => updateNotificationContact(index, { cargo: event.target.value })} placeholder={t('organisms.contactPosition')} className="h-10 rounded-2xl border-[#dbe6f0]" />
                        </div>
                        <div className="rounded-2xl bg-[#f8fbff] p-3">
                          <SelecteurJoursDisponibles joursDisponibles={contacto.joursDisponibles || []} onChange={(jours) => updateNotificationContact(index, { joursDisponibles: jours })} showIcon />
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" className="w-full rounded-2xl border-dashed" onClick={addNotificationContact}>
                      + {t('organisms.addContact')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="m-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className={`max-w-5xl space-y-4 ${esConsulta ? 'pointer-events-none' : ''}`}>
                    <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                      <Label htmlFor="organismo-notes" className="text-xs"><FileText className="mr-1 inline h-3 w-3" />{t('organisms.notes')}</Label>
                      <Textarea id="organismo-notes" value={formulario.notas || ''} onChange={(event) => actualizarFormulario({ notas: event.target.value })} placeholder={t('organisms.notesPlaceholder')} rows={6} className="mt-2 rounded-2xl border-[#dbe6f0]" />
                    </div>
                    <div className="rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm">
                      <Label className="text-xs"><FileUp className="mr-1 inline h-3 w-3" />{t('organisms.document')}</Label>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        <Input value={formulario.documentoPDF || ''} readOnly placeholder="Aucun document selectionne" className="h-10 rounded-2xl border-[#dbe6f0]" />
                        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => pdfInputRef.current?.click()}>
                          Choisir un PDF
                        </Button>
                        <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfChange} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="border-t border-[#dbe6f0] bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#5d7185]">{esConsulta ? 'Consultation en lecture seule de la fiche organisme.' : 'Fiche compacte preservee sur la logique existante de creation des organismes.'}</p>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" className="rounded-2xl" onClick={onCerrar}>{esConsulta ? 'Fermer' : t('common.cancel')}</Button>
                    {!esConsulta ? (
                      <Button className="rounded-2xl text-white" style={{ backgroundColor: branding.primaryColor }} onClick={onGuardar}>
                        {modoEdicion ? t('common.save') : t('common.create')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
