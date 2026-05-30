import type { Organismo } from './organismosStorage';
import { formatBrandingContactLine, getStoredBrandingPrintConfig } from './brandingPrint';
import { formatMoney } from './formatUtils';
import { construirUrlAccesoOrganismo } from './organismoAccessLinks';
import { obtenerUsuarioSesion } from './sesionStorage';
import {
  getSupabaseAnonKey,
  getSupabaseClient,
  getSupabaseFunctionUrl,
  isSupabaseAuthEnabled,
} from './supabaseClient';

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
  motivo?:
    | 'notificaciones_deshabilitadas'
    | 'sin_destinatarios'
    | 'sin_usuario'
    | 'graph_no_configurado'
    | 'graph_error';
  error?: string;
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

export async function enviarEmailAutomaticoNuevaComanda({
  organismo,
  numeroComanda,
  fechaEntrega,
  totalProductos,
  valorTotal,
  observaciones,
}: DatosEmailNuevaComanda): Promise<ResultadoEmailNuevaComanda> {
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

  const resultado = await enviarEmailViaGraph(destinatarios, asunto, mensaje);

  console.log('Email automatique de distribution (Graph):', {
    de: usuarioSesion.email,
    nombreRemitente: `${usuarioSesion.nombre} ${usuarioSesion.apellido || ''}`.trim(),
    destinatarios,
    asunto,
    organismoId: organismo.id,
    organismoNombre: organismo.nombre,
    numeroComanda,
    enviado: resultado.ok,
    error: resultado.error,
    fecha: new Date().toISOString(),
  });

  if (!resultado.ok) {
    return {
      enviado: false,
      destinatarios,
      motivo: resultado.motivo,
      error: resultado.error,
    };
  }

  return {
    enviado: true,
    destinatarios,
  };
}

// ============================================================================
// Notification de changement d'état de commande (Microsoft Graph)
// ============================================================================

const ETIQUETAS_ESTADO_COMANDA_FR: Record<string, string> = {
  pendiente: 'En attente',
  confirmada: 'Acceptée',
  en_preparacion: 'En préparation',
  completada: 'Complétée',
  entregada: 'Livrée',
  anulada: 'Annulée',
  rechazada: 'Refusée',
};

function describirEstadoComanda(estado: string): string {
  return ETIQUETAS_ESTADO_COMANDA_FR[estado] || estado;
}

export type ResultadoEmailEstadoComanda = {
  enviado: boolean;
  destinatarios: string[];
  motivo?:
    | 'notificaciones_deshabilitadas'
    | 'sin_destinatarios'
    | 'sin_usuario'
    | 'graph_no_configurado'
    | 'graph_error';
  error?: string;
};

type DatosEmailEstadoComanda = {
  organismo: Organismo;
  numeroComanda: string;
  estadoAnterior: string;
  estadoNuevo: string;
  observaciones?: string;
};

export async function enviarEmailViaGraph(
  destinatarios: string[],
  asunto: string,
  cuerpo: string,
): Promise<{ ok: boolean; error?: string; motivo?: 'graph_no_configurado' | 'graph_error' }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, motivo: 'graph_no_configurado', error: 'Supabase auth disabled.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, motivo: 'graph_no_configurado', error: 'Supabase client not configured.' };
  }

  try {
    const {
      data: { session },
    } = await client.auth.getSession();

    if (!session?.access_token) {
      return { ok: false, motivo: 'graph_no_configurado', error: 'No authenticated session token.' };
    }

    const response = await fetch(getSupabaseFunctionUrl('send-graph-mail'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: getSupabaseAnonKey(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: destinatarios, subject: asunto, body: cuerpo }),
    });

    if (response.ok) {
      return { ok: true };
    }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return {
      ok: false,
      motivo: 'graph_error',
      error: payload?.error || `send-graph-mail returned ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      motivo: 'graph_error',
      error: error instanceof Error ? error.message : 'Unexpected error',
    };
  }
}

export async function enviarEmailEstadoComandaActualizado({
  organismo,
  numeroComanda,
  estadoAnterior,
  estadoNuevo,
  observaciones,
}: DatosEmailEstadoComanda): Promise<ResultadoEmailEstadoComanda> {
  if (!organismo.notificaciones) {
    return { enviado: false, destinatarios: [], motivo: 'notificaciones_deshabilitadas' };
  }

  const usuarioSesion = obtenerUsuarioSesion();
  if (!usuarioSesion) {
    return { enviado: false, destinatarios: [], motivo: 'sin_usuario' };
  }

  const destinatarios = obtenerDestinatariosOrganismo(organismo);
  if (destinatarios.length === 0) {
    return { enviado: false, destinatarios: [], motivo: 'sin_destinatarios' };
  }

  const etiquetaAnterior = describirEstadoComanda(estadoAnterior);
  const etiquetaNueva = describirEstadoComanda(estadoNuevo);
  const asunto = `🔔 Mise à jour commande ${numeroComanda} - ${etiquetaNueva}`;
  const linkAcceso = construirUrlAccesoOrganismo(organismo.claveAcceso);
  const brandingPrint = getStoredBrandingPrintConfig();
  const brandingContactLine = formatBrandingContactLine(brandingPrint);

  const mensaje = [
    `Bonjour ${organismo.nombre},`,
    '',
    `Le statut de votre commande ${numeroComanda} a été mis à jour.`,
    '',
    `• Statut précédent : ${etiquetaAnterior}`,
    `• Nouveau statut : ${etiquetaNueva}`,
    observaciones?.trim() ? `• Observations : ${observaciones.trim()}` : '',
    '',
    `Accès direct au portail organisme : ${linkAcceso}`,
    '',
    'Vous pouvez consulter le détail complet de votre commande dans le portail.',
    '',
    brandingPrint.systemName,
    'Système de Gestion',
    brandingContactLine,
  ].filter(Boolean).join('\n');

  const resultado = await enviarEmailViaGraph(destinatarios, asunto, mensaje);

  console.log('Notification changement état commande:', {
    de: usuarioSesion.email,
    destinatarios,
    organismoId: organismo.id,
    organismoNombre: organismo.nombre,
    numeroComanda,
    estadoAnterior,
    estadoNuevo,
    enviado: resultado.ok,
    error: resultado.error,
    fecha: new Date().toISOString(),
  });

  if (!resultado.ok) {
    return {
      enviado: false,
      destinatarios,
      motivo: resultado.motivo,
      error: resultado.error,
    };
  }

  return { enviado: true, destinatarios };
}