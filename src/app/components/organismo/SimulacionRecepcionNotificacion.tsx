import React, { useMemo, useState } from 'react';
import { Bell, Calendar, CheckCircle2, ExternalLink, Mail, MessageSquare, Package, Smartphone } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useBranding } from '../../../hooks/useBranding';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { formatMoney } from '../../utils/formatUtils';
import { construirUrlAccesoOrganismo } from '../../utils/organismoAccessLinks';
import type { Comanda } from '../../types';

interface SimulacionRecepcionNotificacionProps {
  organismo: any;
  comanda: Comanda;
  notificacion?: {
    mensaje: string;
    fecha: string;
    leida: boolean;
    urlAcceso?: string;
  } | null;
  destacada?: boolean;
}

function formatearFecha(fecha?: string): string {
  if (!fecha) {
    return 'À l\'instant';
  }

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SimulacionRecepcionNotificacion({
  organismo,
  comanda,
  notificacion,
  destacada = false,
}: SimulacionRecepcionNotificacionProps) {
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [open, setOpen] = useState(false);

  const destinatariosEmail = useMemo(() => {
    const emails = new Set<string>();

    if (organismo?.email?.trim()) {
      emails.add(organismo.email.trim());
    }

    if (Array.isArray(organismo?.contactosNotificacion)) {
      organismo.contactosNotificacion.forEach((contacto: any) => {
        if (contacto?.email?.trim()) {
          emails.add(contacto.email.trim());
        }
      });
    }

    return Array.from(emails);
  }, [organismo]);

  const accesoDirecto = notificacion?.urlAcceso
    ? `${window.location.origin}${notificacion.urlAcceso}`
    : construirUrlAccesoOrganismo(organismo?.claveAcceso || `ORG-${String(organismo?.id || '').toUpperCase()}`);

  const asunto = `Nouvelle commande disponible - ${comanda.numero}`;
  const mensajePortal = notificacion?.mensaje || `Nouvelle commande ${comanda.numero} disponible pour confirmation`;
  const mensajeEmail = [
    `Bonjour ${organismo?.nombre || 'organisme'},`,
    '',
    `Une nouvelle distribution a été enregistrée par ${nombreSistemaImpresion} pour votre organisme.`,
    '',
    `Commande : ${comanda.numero}`,
    `Livraison : ${comanda.fechaEntrega ? formatearFecha(comanda.fechaEntrega) : 'À confirmer'}`,
    `Produits : ${comanda.items.length}`,
    typeof comanda.valorTotal === 'number' ? `Valeur estimée : CAD$ ${formatMoney(comanda.valorTotal)}` : '',
    '',
    `Accès direct : ${accesoDirecto}`,
  ].filter(Boolean).join('\n');
  const mensajeWhatsapp = `Bonjour ${organismo?.nombre || 'organisme'}, votre commande ${comanda.numero} est disponible dans le portail organisme. Livraison : ${comanda.fechaEntrega ? formatearFecha(comanda.fechaEntrega) : 'À confirmer'}. Ouvrir : ${accesoDirecto}`;

  return (
    <div className="rounded-lg border border-[#1E73BE] bg-gradient-to-r from-[#E3F2FD] to-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E73BE] text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Simulation de réception de notification
              </p>
              <p className="text-sm text-[#4B5563]">
                Aperçu de la réception de l'avis par le portail, l'email et la messagerie.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#4B5563]">
            <Badge className={notificacion?.leida ? 'bg-slate-600' : 'bg-[#4CAF50]'}>
              {notificacion?.leida ? 'Lue' : 'Non lue'}
            </Badge>
            {destacada && <Badge className="bg-[#DC3545]">Nouvelle</Badge>}
            <span>Commande {comanda.numero}</span>
            <span>Reçue : {formatearFecha(notificacion?.fecha)}</span>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E73BE] hover:bg-[#155a96]">
              <Smartphone className="mr-2 h-4 w-4" />
              Voir la simulation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Réception de notification par l'organisme</DialogTitle>
              <DialogDescription>
                Cette vue simule les canaux par lesquels l'organisme reçoit la nouvelle commande.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="portal" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portal">Portal</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="whatsapp">Messagerie</TabsTrigger>
              </TabsList>

              <TabsContent value="portal" className="space-y-4">
                <Card className="border-l-4 border-l-[#FFC107] bg-[#FFF8E1]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#7C5E10]">
                      <Bell className="h-5 w-5" />
                      Bandeja del organismo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-[#4B5563]">
                    <div className="rounded-lg border border-[#F3D37A] bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#111827]">{mensajePortal}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatearFecha(notificacion?.fecha)}</span>
                            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {comanda.items.length} produits</span>
                          </div>
                        </div>
                        <Badge className={notificacion?.leida ? 'bg-slate-600' : 'bg-[#4CAF50]'}>
                          {notificacion?.leida ? 'Consultée' : 'Nouveau'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#6B7280]">Commande</p>
                        <p className="mt-1 font-semibold text-[#111827]">{comanda.numero}</p>
                      </div>
                      <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#6B7280]">Livraison</p>
                        <p className="mt-1 font-semibold text-[#111827]">{comanda.fechaEntrega ? formatearFecha(comanda.fechaEntrega) : 'À confirmer'}</p>
                      </div>
                      <div className="rounded-lg border bg-white p-4">
                        <p className="text-xs uppercase tracking-wide text-[#6B7280]">Valeur</p>
                        <p className="mt-1 font-semibold text-[#111827]">{typeof comanda.valorTotal === 'number' ? `CAD$ ${formatMoney(comanda.valorTotal)}` : 'Non calculée'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-dashed border-[#1E73BE] bg-[#EFF6FF] p-4">
                      <div>
                        <p className="font-semibold text-[#1E73BE]">Action attendue de l'organisme</p>
                        <p className="text-xs text-[#4B5563]">Ouvrir la commande, vérifier les quantités, puis confirmer ou annuler.</p>
                      </div>
                      <Button asChild variant="outline" className="border-[#1E73BE] text-[#1E73BE]">
                        <a href={accesoDirecto} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ouvrir le profil organisme
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4 text-[#1E73BE]" />
                        Destinataires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-[#4B5563]">
                      {destinatariosEmail.length > 0 ? destinatariosEmail.map((email) => (
                        <div key={email} className="rounded-md border bg-[#F9FAFB] px-3 py-2 font-mono text-xs">
                          {email}
                        </div>
                      )) : (
                        <p>Aucune adresse email n'est configurée pour cet organisme.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-[#D1E9FF]">
                    <CardHeader className="border-b bg-[#F8FBFF]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#6B7280]">Sujet</p>
                          <CardTitle className="mt-1 text-lg text-[#111827]">{asunto}</CardTitle>
                        </div>
                        <Badge className="bg-[#1E73BE]">Email automático</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span>De: {nombreSistemaImpresion}</span>
                        <span>{formatearFecha(notificacion?.fecha)}</span>
                      </div>
                      {brandingContactLine && <p className="text-xs text-[#6B7280]">Coordonnées: {brandingContactLine}</p>}
                      <pre className="whitespace-pre-wrap rounded-lg bg-[#F9FAFB] p-4 text-sm text-[#111827]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                        {mensajeEmail}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="whatsapp" className="space-y-4">
                <Card className="border-[#CDECD8] bg-[#F6FFF8]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1F7A46]">
                      <MessageSquare className="h-5 w-5" />
                      Message court de réception
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#4B5563]">
                      <span>{organismo?.telefono || 'Aucun téléphone configuré'}</span>
                      <span>{formatearFecha(notificacion?.fecha)}</span>
                    </div>
                    <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-white p-4 text-sm text-[#111827] shadow-sm">
                      {mensajeWhatsapp}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#1F7A46]">
                      <CheckCircle2 className="h-4 w-4" />
                      Simulation du bref avis qui accompagne la notification dans le portail.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}