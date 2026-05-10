import React, { useState } from 'react';
import { Bell, Copy, Send, Mail, MessageSquare, CheckCircle2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { copiarAlPortapapeles } from '../utils/clipboard';
import { construirUrlAccesoOrganismo } from '../utils/organismoAccessLinks';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../utils/brandingPrint';
import { useBranding } from '../../hooks/useBranding';

interface NotificacionComandaProps {
  comanda: any;
  organismo: any;
}

export function NotificacionComanda({ comanda, organismo }: NotificacionComandaProps) {
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const [open, setOpen] = useState(false);
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({
    email: true,
    sms: false,
    whatsapp: true
  });

  // Generar el link de acceso público
  const linkAcceso = construirUrlAccesoOrganismo(organismo.claveAcceso || 'ORG-' + organismo.id.toUpperCase());

  const mensajeBase = [
    `🔔 Bonjour ${organismo.nombre} !`,
    '',
    `✅ Votre commande #${comanda.numero} est PRÊTE pour le ramassage.`,
    '',
    '📦 Détails de la commande :',
    `• Numéro : ${comanda.numero}`,
    `• Date de livraison : ${comanda.fechaEntrega || 'À confirmer'}`,
    `• Produits : ${comanda.items.length} articles`,
    `• Statut : ${comanda.estado === 'completada' ? 'Complétée ✓' : 'Prête à livrer'}`,
    '',
    '🔗 Accédez à votre portail pour consulter tous les détails :',
    linkAcceso,
    '',
    `👉 Clé d'accès : ${organismo.claveAcceso || 'ORG-' + organismo.id.toUpperCase()}`,
    '',
    'Merci de confirmer la réception de votre commande dans le système.',
    '',
    '---',
    `${nombreSistemaImpresion} - Système de Gestion`,
    brandingContactLine,
    `Si vous avez des questions, n'hésitez pas à nous contacter.`,
  ].filter(Boolean).join('\n');

  const [mensajePersonalizado, setMensajePersonalizado] = useState(mensajeBase);

  const handleCopiarLink = async () => {
    await copiarAlPortapapeles(linkAcceso);
    toast.success('Lien copié dans le presse-papiers');
  };

  const handleCopiarMensaje = async () => {
    await copiarAlPortapapeles(mensajePersonalizado);
    toast.success('Message copié dans le presse-papiers');
  };

  const handleEnviarNotificacion = () => {
    const metodosActivos = Object.entries(metodosSeleccionados)
      .filter(([_, activo]) => activo)
      .map(([metodo]) => metodo);

    if (metodosActivos.length === 0) {
      toast.error('Sélectionnez au moins une méthode d\'envoi');
      return;
    }

    const metodosTexto = metodosActivos
      .map(m => {
        if (m === 'email') return 'Email';
        if (m === 'sms') return 'SMS';
        if (m === 'whatsapp') return 'WhatsApp';
        return m;
      })
      .join(', ');

    toast.success(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
          <span className="font-semibold">Notification envoyée</span>
        </div>
        <span className="text-sm text-[#666666]">
          Envoyée à {organismo.nombre} par {metodosTexto}
        </span>
      </div>,
      { duration: 5000 }
    );

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#4CAF50] hover:bg-[#45a049]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifier l'organisme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="notificacion-comanda-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Envoyer la notification de commande prête
          </DialogTitle>
          <DialogDescription id="notificacion-comanda-description">
            Envoyez une notification à l'organisme pour l'informer que sa commande est prête à être ramassée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-[#E3F2FD] border border-[#1E73BE] rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Destinataire
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Organisme :</strong> {organismo.nombre}</p>
                  <p><strong>Responsable :</strong> {organismo.responsable}</p>
                  <p><strong>Email :</strong> {organismo.email || 'Non renseigné'}</p>
                  <p><strong>Téléphone :</strong> {organismo.telefono || 'Non renseigné'}</p>
                </div>
              </div>
              <Badge className="bg-[#4CAF50]">
                Commande #{comanda.numero}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              🔗 Lien d'accès direct
            </Label>
            <div className="flex gap-2">
              <Input
                value={linkAcceso}
                readOnly
                className="font-mono text-sm bg-[#F4F4F4]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopiarLink}
                className="shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copier
              </Button>
            </div>
            <p className="text-xs text-[#666666]">
              Ce lien permet à l'organisme d'accéder directement à son profil sans saisir la clé manuellement.
            </p>
          </div>

          <div className="bg-[#FFF3CD] border border-[#FFC107] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#856404]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  🔑 Clé d'accès
                </p>
                <p className="text-2xl font-mono font-bold text-[#856404] mt-1">
                  {organismo.claveAcceso || 'ORG-' + organismo.id.toUpperCase()}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await copiarAlPortapapeles(organismo.claveAcceso || 'ORG-' + organismo.id.toUpperCase());
                  toast.success('Clé copiée');
                }}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copier
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              📨 Méthodes d'envoi
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  metodosSeleccionados.email
                    ? 'border-[#1E73BE] bg-[#E3F2FD]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMetodosSeleccionados(prev => ({ ...prev, email: !prev.email }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${metodosSeleccionados.email ? 'text-[#1E73BE]' : 'text-gray-400'}`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Email
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      {organismo.email || 'Non disponible'}
                    </p>
                    {metodosSeleccionados.email && (
                      <Badge className="bg-[#4CAF50] mt-2 text-xs">Sélectionné</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  metodosSeleccionados.sms
                    ? 'border-[#1E73BE] bg-[#E3F2FD]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMetodosSeleccionados(prev => ({ ...prev, sms: !prev.sms }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${metodosSeleccionados.sms ? 'text-[#1E73BE]' : 'text-gray-400'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      SMS
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      {organismo.telefono || 'Non disponible'}
                    </p>
                    {metodosSeleccionados.sms && (
                      <Badge className="bg-[#4CAF50] mt-2 text-xs">Sélectionné</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  metodosSeleccionados.whatsapp
                    ? 'border-[#1E73BE] bg-[#E3F2FD]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMetodosSeleccionados(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${metodosSeleccionados.whatsapp ? 'text-[#1E73BE]' : 'text-gray-400'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      WhatsApp
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      {organismo.telefono || 'Non disponible'}
                    </p>
                    {metodosSeleccionados.whatsapp && (
                      <Badge className="bg-[#4CAF50] mt-2 text-xs">Sélectionné</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                ✉️ Message de notification
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopiarMensaje}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copier le message
              </Button>
            </div>
            <Textarea
              value={mensajePersonalizado}
              onChange={(e) => setMensajePersonalizado(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder="Personnalisez le message ici..."
            />
            <p className="text-xs text-[#666666]">
              Vous pouvez personnaliser ce message avant l'envoi. Le lien et la clé sont inclus automatiquement.
            </p>
          </div>

          <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-[#4CAF50] mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[#2E7D32] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Aperçu de l'accès
                </p>
                <p className="text-sm text-[#666666] mb-3">
                  En cliquant sur le lien, l'organisme verra automatiquement :
                </p>
                <ul className="text-sm text-[#666666] space-y-1 list-disc list-inside">
                  <li>Son profil complet avec les informations à jour</li>
                  <li>Toutes ses commandes en attente et complétées</li>
                  <li>Les détails de la commande #{comanda.numero}</li>
                  <li>L'option pour confirmer la réception</li>
                  <li>L'historique des transactions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEnviarNotificacion}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer la notification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}