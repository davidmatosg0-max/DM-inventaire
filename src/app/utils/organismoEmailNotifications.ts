import type { Organismo } from './organismosStorage';
import { formatBrandingContactLine, getStoredBrandingPrintConfig } from './brandingPrint';
import { formatMoney } from './formatUtils';
import { construirUrlAccesoOrganismo } from './organismoAccessLinks';
import { obtenerUsuarioSesion } from './sesionStorage';

type DatosEmailNuevaComanda = {
  organismo: Organismo;
  numeroComanda: string;
  fechaEntrega?: string;
  totalProductos: number;
  valorTotal?: number;
  observaciones?: string;
};

export type ResultadoEmailNuevaComanda = {
  enviado: boolean;
  destinatarios: string[];
  motivo?: 'notificaciones_deshabilitadas' | 'sin_destinatarios' | 'sin_usuario';
};

function obtenerDestinatariosOrganismo(organismo: Organismo): string[] {
  const destinatarios = new Set<string>();

  if (organismo.email?.trim()) {
    destinatarios.add(organismo.email.trim());
  }

  if (Array.isArray(organismo.contactosNotificacion)) {
    organismo.contactosNotificacion.forEach((contacto) => {
      if (contacto.email?.trim()) {
        destinatarios.add(contacto.email.trim());
      }
    });
  }

  return Array.from(destinatarios);
}

function formatearFechaEntrega(fechaEntrega?: string): string {
  if (!fechaEntrega) {
    return 'À confirmer';
  }

  const fecha = new Date(fechaEntrega);
  if (Number.isNaN(fecha.getTime())) {
    return fechaEntrega;
  }

  return fecha.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function abrirBorradorOutlookPreferenteLocal(
  destinatarios: string[],
  asunto: string,
  mensaje: string,
  remitente: string,
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const destinatariosLimpios = Array.from(
    new Set(destinatarios.map((email) => String(email || '').trim()).filter(Boolean))
  );

  if (destinatariosLimpios.length === 0) {
    return false;
  }

  const composeUrl = new URL('https://outlook.office.com/mail/deeplink/compose');
  composeUrl.searchParams.set('to', destinatariosLimpios.join(';'));
  composeUrl.searchParams.set('subject', asunto || '');
  composeUrl.searchParams.set('body', mensaje || '');
  composeUrl.searchParams.set('from', remitente || '');

  const mailtoTo = encodeURIComponent(destinatariosLimpios.join(','));
  const mailtoSubject = encodeURIComponent(asunto || '');
  const mailtoBody = encodeURIComponent(mensaje || '');
  const mailtoUrl = `mailto:${mailtoTo}?subject=${mailtoSubject}&body=${mailtoBody}`;

  let clienteLocalProbablementeAbierto = false;
  const marcarAperturaCliente = () => {
    clienteLocalProbablementeAbierto = true;
  };
  window.addEventListener('blur', marcarAperturaCliente, { once: true });

  window.location.href = mailtoUrl;

  window.setTimeout(() => {
    if (clienteLocalProbablementeAbierto) {
      return;
    }

    const abrirWeb = window.confirm('Outlook local ne semble pas disponible. Voulez-vous ouvrir Outlook Web ?');
    if (abrirWeb) {
      window.open(composeUrl.toString(), '_blank', 'noopener,noreferrer');
    }
  }, 1500);

  return true;
}

export function enviarEmailAutomaticoNuevaComanda({
  organismo,
  numeroComanda,
  fechaEntrega,
  totalProductos,
  valorTotal,
  observaciones,
}: DatosEmailNuevaComanda): ResultadoEmailNuevaComanda {
  if (!organismo.notificaciones) {
    return {
      enviado: false,
      destinatarios: [],
      motivo: 'notificaciones_deshabilitadas',
    };
  }

  const usuarioSesion = obtenerUsuarioSesion();
  if (!usuarioSesion) {
    return {
      enviado: false,
      destinatarios: [],
      motivo: 'sin_usuario',
    };
  }

  const destinatarios = obtenerDestinatariosOrganismo(organismo);
  if (destinatarios.length === 0) {
    return {
      enviado: false,
      destinatarios: [],
      motivo: 'sin_destinatarios',
    };
  }

  const asunto = `📦 Nouvelle distribution créée - ${numeroComanda}`;
  const linkAcceso = construirUrlAccesoOrganismo(organismo.claveAcceso);
  const brandingPrint = getStoredBrandingPrintConfig();
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const mensaje = [
    `Bonjour ${organismo.nombre},`,
    '',
    `Une nouvelle distribution a été créée pour votre organisme sous le numéro ${numeroComanda}.`,
    '',
    'Détails de la distribution :',
    `• Commande : ${numeroComanda}`,
    `• Date de livraison : ${formatearFechaEntrega(fechaEntrega)}`,
    `• Produits : ${totalProductos}`,
    typeof valorTotal === 'number' ? `• Valeur estimée : CAD$ ${formatMoney(valorTotal)}` : '',
    observaciones?.trim() ? `• Observations : ${observaciones.trim()}` : '',
    '',
    `• Accès direct au portail organisme : ${linkAcceso}`,
    '',
    'Veuillez accéder au portail organisme pour consulter et confirmer la commande.',
    '',
    brandingPrint.systemName,
    'Système de Gestion',
    brandingContactLine,
  ].filter(Boolean).join('\n');

  const borradorAbierto = abrirBorradorOutlookPreferenteLocal(
    destinatarios,
    asunto,
    mensaje,
    usuarioSesion.email || ''
  );

  console.log('Email automatique de distribution envoyé:', {
    de: usuarioSesion.email,
    nombreRemitente: `${usuarioSesion.nombre} ${usuarioSesion.apellido || ''}`.trim(),
    destinatarios,
    asunto,
    mensaje,
    organismoId: organismo.id,
    organismoNombre: organismo.nombre,
    numeroComanda,
    borradorAbierto,
    fecha: new Date().toISOString(),
  });

  return {
    enviado: borradorAbierto,
    destinatarios,
  };
}