import {
  type ClasificacionOrganismo,
  type ContactoNotificacion,
  type DocumentoPdfOrganismo,
  type JourDisponible,
  type Organismo,
} from './organismosStorage';

export interface FormularioOrganismo {
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
  diaCita: string;
  horaCita: string;
  participantePRS: boolean;
  regular: boolean;
  clasificacionOrganismo: ClasificacionOrganismo;
  activo: boolean;
  personasServidas: number;
  cantidadColaciones: number;
  cantidadAlmuerzos: number;
  porcentajeReparticion: number;
  notas: string;
  notificaciones: boolean;
  logo: string | null;
  documentosPDF: DocumentoPdfOrganismo[];
  contactosNotificacion: ContactoNotificacion[];
  fechaInicioInactividad: string;
  fechaFinInactividad: string;
  contactoCargo: string;
  contactoTelefono: string;
  contactoCellulaire: string;
  contactoEmail: string;
  contactoJoursDisponibles: JourDisponible[];
}

const CONTACTO_NOTIFICACION_VACIO: ContactoNotificacion = {
  nombre: '',
  email: '',
  cargo: '',
  joursDisponibles: [],
};

function generarIdDocumentoPdf(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pdf-${crypto.randomUUID()}`;
  }

  return `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construirNombreDocumentoPdf(valor: string, index: number, nombreOrganismo?: string): string {
  const nombreLimpio = String(valor || '').trim();

  if (nombreLimpio && !nombreLimpio.startsWith('data:')) {
    return nombreLimpio.toLowerCase().endsWith('.pdf') ? nombreLimpio : `${nombreLimpio}.pdf`;
  }

  const baseNombre = String(nombreOrganismo || 'document-organisme')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseNombre || 'document-organisme'}-${index + 1}.pdf`;
}

function normalizarDocumentosPdfFormulario(
  documentosPDF: DocumentoPdfOrganismo[] | undefined,
  documentoPDFLegado: string | null | undefined,
  nombreOrganismo?: string,
): DocumentoPdfOrganismo[] {
  const documentosNormalizados = (documentosPDF || [])
    .map((documento, index) => {
      const contenido = String(documento?.contenido || '').trim();

      if (!contenido) {
        return null;
      }

      return {
        id: String(documento?.id || '').trim() || generarIdDocumentoPdf(),
        nombre: construirNombreDocumentoPdf(String(documento?.nombre || '').trim(), index, nombreOrganismo),
        contenido,
        tamanoBytes: Number.isFinite(documento?.tamanoBytes) ? Math.max(0, Math.round(documento.tamanoBytes)) : 0,
      };
    })
    .filter((documento): documento is DocumentoPdfOrganismo => Boolean(documento));

  if (documentosNormalizados.length > 0) {
    return documentosNormalizados;
  }

  const legado = String(documentoPDFLegado || '').trim();
  if (!legado) {
    return [];
  }

  return [
    {
      id: generarIdDocumentoPdf(),
      nombre: construirNombreDocumentoPdf(legado, 0, nombreOrganismo),
      contenido: legado,
      tamanoBytes: 0,
    },
  ];
}

function resolverClasificacionOrganismo(organismo?: {
  clasificacionOrganismo?: ClasificacionOrganismo;
  regular?: boolean;
}): ClasificacionOrganismo {
  return organismo?.clasificacionOrganismo || (organismo?.regular === false ? 'eventual' : 'regular');
}

function normalizarNumero(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.max(0, Math.round(valor));
}

function normalizarPorcentaje(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(valor)));
}

function limpiarContactosNotificacion(contactos: ContactoNotificacion[]): ContactoNotificacion[] {
  return contactos
    .map((contacto) => ({
      nombre: String(contacto.nombre || '').trim(),
      email: String(contacto.email || '').trim(),
      cargo: String(contacto.cargo || '').trim(),
      joursDisponibles: contacto.joursDisponibles || [],
      idiomas: contacto.idiomas,
    }))
    .filter((contacto) => contacto.nombre || contacto.email || contacto.cargo || (contacto.joursDisponibles?.length || 0) > 0);
}

export function crearFormularioOrganismoVacio(): FormularioOrganismo {
  return {
    nombre: '',
    tipo: '',
    codigoPostal: '',
    direccion: '',
    quartier: '',
    responsable: '',
    beneficiarios: 0,
    telefono: '',
    email: '',
    frecuenciaCita: '',
    diaCita: '',
    horaCita: '',
    participantePRS: false,
    regular: true,
    clasificacionOrganismo: 'regular',
    activo: true,
    personasServidas: 0,
    cantidadColaciones: 0,
    cantidadAlmuerzos: 0,
    porcentajeReparticion: 0,
    notas: '',
    notificaciones: true,
    logo: null,
    documentosPDF: [],
    contactosNotificacion: [{ ...CONTACTO_NOTIFICACION_VACIO }],
    fechaInicioInactividad: '',
    fechaFinInactividad: '',
    contactoCargo: '',
    contactoTelefono: '',
    contactoCellulaire: '',
    contactoEmail: '',
    contactoJoursDisponibles: [],
  };
}

export function convertirOrganismoAFormulario(organismo?: Partial<Organismo> | null): FormularioOrganismo {
  const formularioVacio = crearFormularioOrganismoVacio();

  if (!organismo) {
    return formularioVacio;
  }

  return {
    ...formularioVacio,
    nombre: String(organismo.nombre || '').trim(),
    tipo: String(organismo.tipo || '').trim(),
    codigoPostal: String(organismo.codigoPostal || '').trim(),
    direccion: String(organismo.direccion || '').trim(),
    quartier: String(organismo.quartier || '').trim(),
    responsable: String(organismo.responsable || '').trim(),
    beneficiarios: normalizarNumero(Number(organismo.beneficiarios)),
    telefono: String(organismo.telefono || '').trim(),
    email: String(organismo.email || '').trim(),
    frecuenciaCita: String(organismo.frecuenciaCita || '').trim(),
    diaCita: String(organismo.diaCita || '').trim(),
    horaCita: String(organismo.horaCita || '').trim(),
    participantePRS: Boolean(organismo.participantePRS),
    regular: organismo.regular !== undefined ? organismo.regular : resolverClasificacionOrganismo(organismo) !== 'eventual',
    clasificacionOrganismo: resolverClasificacionOrganismo(organismo),
    activo: organismo.activo !== undefined ? organismo.activo : true,
    personasServidas: normalizarNumero(Number(organismo.personasServidas)),
    cantidadColaciones: normalizarNumero(Number(organismo.cantidadColaciones)),
    cantidadAlmuerzos: normalizarNumero(Number(organismo.cantidadAlmuerzos)),
    porcentajeReparticion: normalizarPorcentaje(Number(organismo.porcentajeReparticion)),
    notas: String(organismo.notas || ''),
    notificaciones: organismo.notificaciones !== undefined ? organismo.notificaciones : true,
    logo: organismo.logo ?? null,
    documentosPDF: normalizarDocumentosPdfFormulario(organismo.documentosPDF, organismo.documentoPDF, organismo.nombre),
    contactosNotificacion: organismo.contactosNotificacion?.length
      ? organismo.contactosNotificacion.map((contacto) => ({
          nombre: String(contacto.nombre || '').trim(),
          email: String(contacto.email || '').trim(),
          cargo: String(contacto.cargo || '').trim(),
          joursDisponibles: contacto.joursDisponibles || [],
          idiomas: contacto.idiomas,
        }))
      : [{ ...CONTACTO_NOTIFICACION_VACIO }],
    fechaInicioInactividad: String(organismo.fechaInicioInactividad || '').trim(),
    fechaFinInactividad: String(organismo.fechaFinInactividad || '').trim(),
    contactoCargo: String(organismo.contactoCargo || '').trim(),
    contactoTelefono: String(organismo.contactoTelefono || '').trim(),
    contactoCellulaire: String(organismo.contactoCellulaire || '').trim(),
    contactoEmail: String(organismo.contactoEmail || '').trim(),
    contactoJoursDisponibles: organismo.contactoJoursDisponibles || [],
  };
}

export function construirPayloadOrganismo(formulario: FormularioOrganismo): Omit<Organismo, 'id' | 'fechaCreacion' | 'fechaModificacion'> {
  const clasificacionOrganismo = formulario.clasificacionOrganismo || (formulario.regular ? 'regular' : 'eventual');

  return {
    nombre: formulario.nombre.trim(),
    tipo: formulario.tipo.trim(),
    email: formulario.email.trim(),
    telefono: formulario.telefono.trim(),
    contactoCargo: formulario.contactoCargo.trim() || undefined,
    contactoTelefono: formulario.contactoTelefono.trim() || undefined,
    contactoCellulaire: formulario.contactoCellulaire.trim() || undefined,
    contactoEmail: formulario.contactoEmail.trim() || undefined,
    contactoJoursDisponibles: formulario.contactoJoursDisponibles || [],
    direccion: formulario.direccion.trim(),
    codigoPostal: formulario.codigoPostal.trim() || undefined,
    quartier: formulario.quartier.trim() || undefined,
    responsable: formulario.responsable.trim(),
    beneficiarios: normalizarNumero(formulario.beneficiarios),
    activo: formulario.activo,
    regular: clasificacionOrganismo !== 'eventual',
    clasificacionOrganismo,
    participantePRS: Boolean(formulario.participantePRS),
    frecuenciaCita: formulario.frecuenciaCita.trim() || undefined,
    diaCita: formulario.diaCita.trim() || undefined,
    horaCita: formulario.horaCita.trim() || undefined,
    personasServidas: normalizarNumero(formulario.personasServidas),
    cantidadColaciones: normalizarNumero(formulario.cantidadColaciones),
    cantidadAlmuerzos: normalizarNumero(formulario.cantidadAlmuerzos),
    porcentajeReparticion: normalizarPorcentaje(formulario.porcentajeReparticion),
    notas: formulario.notas.trim() || undefined,
    notificaciones: Boolean(formulario.notificaciones),
    logo: formulario.logo ?? null,
    documentosPDF: normalizarDocumentosPdfFormulario(formulario.documentosPDF, null, formulario.nombre),
    documentoPDF: normalizarDocumentosPdfFormulario(formulario.documentosPDF, null, formulario.nombre)[0]?.contenido ?? null,
    claveAcceso: undefined,
    contactosNotificacion: limpiarContactosNotificacion(formulario.contactosNotificacion || []),
    fechaInicioInactividad: !formulario.activo ? formulario.fechaInicioInactividad.trim() || undefined : undefined,
    fechaFinInactividad: !formulario.activo ? formulario.fechaFinInactividad.trim() || undefined : undefined,
    zona: undefined,
  };
}

export function obtenerErroresFormularioOrganismo(formulario: FormularioOrganismo): string[] {
  const errores: string[] = [];

  if (!formulario.nombre.trim()) {
    errores.push('Le nom de l\'organisme est requis.');
  }

  if (!formulario.tipo.trim()) {
    errores.push('Le type d\'organisme est requis.');
  }

  if (!formulario.quartier.trim()) {
    errores.push('Le quartier est requis.');
  }

  if (!formulario.direccion.trim()) {
    errores.push('L\'adresse est requise.');
  }

  if (!formulario.responsable.trim()) {
    errores.push('Le responsable est requis.');
  }

  if (!formulario.activo && formulario.fechaInicioInactividad && formulario.fechaFinInactividad) {
    const fechaInicio = new Date(formulario.fechaInicioInactividad);
    const fechaFin = new Date(formulario.fechaFinInactividad);

    if (fechaFin < fechaInicio) {
      errores.push('La date de fin d\'inactivite doit etre posterieure a la date de debut.');
    }
  }

  return errores;
}

export function validarFormularioOrganismo(formulario: FormularioOrganismo): string | null {
  return obtenerErroresFormularioOrganismo(formulario)[0] || null;
}