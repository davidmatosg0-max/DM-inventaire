import { toast } from 'sonner';
import { inicializarDepartamentos, obtenerDepartamentos } from './departamentosStorage';
import {
  guardarContacto,
  eliminarContacto,
  obtenerContactosDepartamento,
  type ContactoDepartamento,
} from './contactosDepartamentoStorage';
import {
  crearOrganismo,
  eliminarOrganismo,
  obtenerOrganismos,
  type Organismo,
} from './organismosStorage';
import {
  guardarOrganismoRecrutement,
  eliminarOrganismoRecrutement,
  obtenerOrganismosRecrutement,
  type OrganismoRecrutement,
} from './recrutementOrganismosStorage';
import {
  crearVehiculo,
  crearChofer,
  eliminarVehiculo,
  eliminarChofer,
  guardarRutas,
  obtenerVehiculos,
  obtenerChoferes,
  obtenerRutas,
  type Vehiculo,
  type Chofer,
} from './transporteLogic';
import {
  guardarProducto,
  eliminarProducto,
  obtenerProductos,
  type ProductoCreado,
} from './productStorage';
import {
  guardarComanda,
  eliminarComanda,
  obtenerComandas,
} from './comandaStorage';
import {
  obtenerMovimientos,
  type MovimientoExtendido,
} from './movimientoStorage';
import {
  obtenirBeneficiairesComptoir,
  obtenirDistributionsComptoir,
  obtenirRendezVousComptoir,
  sauvegarderBeneficiairesComptoir,
  sauvegarderDistributionsComptoir,
  sauvegarderRendezVousComptoir,
  type ComptoirBeneficiary,
} from './comptoirStorage';
import type { Comanda, Ruta } from '../types';

const DEMO_MARKER = '[QA-DEMO-FUNCIONAL]';
const DEMO_EMAIL_DOMAIN = '@demo.qa.local';
const DEMO_MOVIMIENTOS_KEY = 'banco_alimentos_movimientos';
const DEMO_TEXTO_LEGACY_REGEX = /para probar|recoleccion|atención|asignaciones|ofertas y rutas|planificacion|distribucion|suplementario|seco para|refrigerado para|lacteos|comanda activa para validar|comanda completada para tendencia|comanda entregada para métricas|entrada de pommes|entrada de riz|entrada de lait|reserva para comanda activa|salida vers organisme|ajuste d'inventaire|ruta demo para dashboard|reseau aide familles vimont|sainte-dorothee|solidarite pont-viau|genevieve leduc|francois lapierre|helene caron|nadia belanger|karine dube|patrick cote|rue des ecoles|bord-de-l eau|service road/i;

export type ResumenEjemplos = {
  benevoles: number;
  donateurs: number;
  fournisseurs: number;
  comptoir: number;
  contactosDepartamentos: number;
  departamentosCubiertos: number;
  chauffeurs: number;
  camiones: number;
  organismos: number;
  organismosRecrutement: number;
  productos: number;
  comandas: number;
  movimientos: number;
  rutas: number;
};

export type CantidadesEjemplosFuncionales = {
  benevoles: number;
  donateurs: number;
  fournisseurs: number;
  comptoir: number;
  contactosDepartamentos: number;
  chauffeurs: number;
  camiones: number;
  organismos: number;
  organismosRecrutement: number;
};

type OpcionesSembradoEjemplos = {
  silent?: boolean;
  cantidades?: Partial<CantidadesEjemplosFuncionales>;
};

type DemoDepartmentIds = {
  entrepotId: string;
  comptoirId: string;
  cuisineId: string;
  liaisonId: string;
  ptcId: string;
  maintienId: string;
  recrutementId: string;
};

const CANTIDADES_EJEMPLOS_POR_DEFECTO: CantidadesEjemplosFuncionales = {
  benevoles: 2,
  donateurs: 1,
  fournisseurs: 1,
  comptoir: 2,
  contactosDepartamentos: 8,
  chauffeurs: 2,
  camiones: 2,
  organismos: 12,
  organismosRecrutement: 4,
};

function normalizarCantidadEjemplos(valor: number | undefined, fallback: number, maximo = 20): number {
  if (!Number.isFinite(valor)) {
    return fallback;
  }

  return Math.max(0, Math.min(Math.floor(valor || 0), maximo));
}

function resolverCantidadesEjemplos(
  cantidadOrganismos: number,
  opciones?: OpcionesSembradoEjemplos
): CantidadesEjemplosFuncionales {
  return {
    benevoles: normalizarCantidadEjemplos(
      opciones?.cantidades?.benevoles,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.benevoles
    ),
    donateurs: normalizarCantidadEjemplos(
      opciones?.cantidades?.donateurs,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.donateurs
    ),
    fournisseurs: normalizarCantidadEjemplos(
      opciones?.cantidades?.fournisseurs,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.fournisseurs
    ),
    comptoir: normalizarCantidadEjemplos(
      opciones?.cantidades?.comptoir,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.comptoir
    ),
    contactosDepartamentos: normalizarCantidadEjemplos(
      opciones?.cantidades?.contactosDepartamentos,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.contactosDepartamentos
    ),
    chauffeurs: normalizarCantidadEjemplos(
      opciones?.cantidades?.chauffeurs,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.chauffeurs
    ),
    camiones: normalizarCantidadEjemplos(
      opciones?.cantidades?.camiones,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.camiones
    ),
    organismos: normalizarCantidadEjemplos(
      opciones?.cantidades?.organismos ?? cantidadOrganismos,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.organismos
    ),
    organismosRecrutement: normalizarCantidadEjemplos(
      opciones?.cantidades?.organismosRecrutement,
      CANTIDADES_EJEMPLOS_POR_DEFECTO.organismosRecrutement
    ),
  };
}

function esBenevoleDemo(contacto: ContactoDepartamento): boolean {
  return esContactoDemo(contacto) && contacto.tipo === 'benevole';
}

function esDonateurDemo(contacto: ContactoDepartamento): boolean {
  return esContactoDemo(contacto) && (contacto.isDonateur || contacto.tipo === 'donador');
}

function esFournisseurDemo(contacto: ContactoDepartamento): boolean {
  return esContactoDemo(contacto) && (contacto.isFournisseur || contacto.tipo === 'fournisseur');
}

function esContactoDepartamentoInternoDemo(contacto: ContactoDepartamento): boolean {
  return (
    esContactoDemo(contacto) &&
    !esBenevoleDemo(contacto) &&
    !esDonateurDemo(contacto) &&
    !esFournisseurDemo(contacto)
  );
}

function ajustarColeccionDemo<T extends { id: string }>(
  elementos: T[],
  cantidadDeseada: number,
  eliminar: (id: string) => void,
  crear: (indice: number) => void
): void {
  const ordenados = [...elementos].sort((a, b) => a.id.localeCompare(b.id));

  if (ordenados.length > cantidadDeseada) {
    ordenados.slice(cantidadDeseada).forEach((elemento) => eliminar(elemento.id));
    return;
  }

  for (let indice = ordenados.length; indice < cantidadDeseada; indice += 1) {
    crear(indice);
  }
}

function formatearIndiceDemo(indice: number): string {
  return String(indice + 1).padStart(3, '0');
}

function crearBenevoleDemoExtra(
  indice: number,
  departamentos: DemoDepartmentIds
): Parameters<typeof guardarContacto>[0] {
  const numero = formatearIndiceDemo(indice);
  const nombres = ['Nora', 'Pablo', 'Emma', 'Lucas', 'Mila', 'Adrian', 'Leila', 'Noah'];
  const apellidos = ['Martin', 'Garcia', 'Lopez', 'Roy', 'Benitez', 'Bouchard', 'Diallo', 'Perez'];
  const destinos = [
    [departamentos.cuisineId, departamentos.entrepotId],
    [departamentos.comptoirId],
    [departamentos.cuisineId],
    [departamentos.recrutementId],
  ];
  const departamentoIds = destinos[indice % destinos.length];

  return {
    id: `QA-DEMO-BEN-AUTO-${numero}`,
    departamentoId: departamentoIds[0],
    departamentoIds,
    tipo: 'benevole',
    nombre: nombres[indice % nombres.length],
    apellido: apellidos[indice % apellidos.length],
    genero: indice % 2 === 0 ? 'Femme' : 'Homme',
    email: `qa-demo.benevole.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(514) 555-${4100 + indice}`,
    cargo: 'Soutien operationnel',
    idiomas: indice % 2 === 0 ? ['fr', 'es'] : ['fr', 'en'],
    activo: true,
    fechaIngreso: `2026-03-${String((indice % 20) + 1).padStart(2, '0')}T09:00:00.000Z`,
    ciudad: 'Laval',
    quartier: ['Chomedey', 'Pont-Viau', 'Duvernay', 'Auteuil'][indice % 4],
    codigoPostal: ['H7N 3A1', 'H7G 2E4', 'H7E 1V2', 'H7H 2R9'][indice % 4],
    numeroEmpleado: `QA-DEMO-BEN-AUTO-${numero}`,
    notas: `${DEMO_MARKER} Bénévole généré automatiquement pour ajuster la quantité QA`,
  };
}

function crearDonateurDemoExtra(indice: number): Parameters<typeof guardarContacto>[0] {
  const numero = formatearIndiceDemo(indice);
  const empresas = ['Marche Solidaire', 'Boulangerie Centrale', 'Fruits Laval', 'Epicerie Concorde'];

  return {
    id: `QA-DEMO-DON-AUTO-${numero}`,
    departamentoId: '1',
    departamentoIds: ['1', '4'],
    tipo: 'donador',
    nombre: ['Nadia', 'Samuel', 'Imane', 'Julien'][indice % 4],
    apellido: ['Roy', 'Lefevre', 'Mansouri', 'Gauthier'][indice % 4],
    email: `qa-demo.donateur.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(514) 555-${4200 + indice}`,
    activo: true,
    fechaIngreso: `2026-02-${String((indice % 20) + 1).padStart(2, '0')}T10:00:00.000Z`,
    nombreEmpresa: `${empresas[indice % empresas.length]} ${numero}`,
    cargo: 'Responsable des dons',
    ciudad: 'Laval',
    quartier: ['Pont-Viau', 'Chomedey', 'Vimont', 'Fabreville'][indice % 4],
    codigoPostal: ['H7G 1A1', 'H7V 2V4', 'H7K 2J5', 'H7P 3B2'][indice % 4],
    tipoEmpresa: 'inc',
    categoriaProductos: ['Epicerie seche', 'Produits frais'],
    diasOperacion: ['Lundi', 'Mercredi', 'Vendredi'],
    tiempoEntrega: 'Avant 11h',
    isDonateur: true,
    isFournisseur: false,
    notas: `${DEMO_MARKER} Donateur généré automatiquement pour ajuster la quantité QA`,
  };
}

function crearFournisseurDemoExtra(indice: number): Parameters<typeof guardarContacto>[0] {
  const numero = formatearIndiceDemo(indice);
  const empresas = ['Distribution Nord', 'Approvisionnements Laval', 'Stock Plus', 'Aliments Metropole'];

  return {
    id: `QA-DEMO-FOU-AUTO-${numero}`,
    departamentoId: '1',
    departamentoIds: ['1'],
    tipo: 'fournisseur',
    nombre: ['Karim', 'Louise', 'Thiago', 'Marion'][indice % 4],
    apellido: ['Bensaid', 'Pelletier', 'Costa', 'Lambert'][indice % 4],
    email: `qa-demo.fournisseur.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(514) 555-${4300 + indice}`,
    activo: true,
    fechaIngreso: `2026-02-${String((indice % 20) + 1).padStart(2, '0')}T08:30:00.000Z`,
    nombreEmpresa: `${empresas[indice % empresas.length]} ${numero}`,
    cargo: 'Representant comptes',
    ciudad: 'Laval',
    quartier: ['Fabreville', 'Auteuil', 'Duvernay', 'Chomedey'][indice % 4],
    codigoPostal: ['H7P 3B2', 'H7H 1K2', 'H7E 2B8', 'H7N 4P2'][indice % 4],
    tipoEmpresa: 'ltee',
    categoriaProductos: ['Epicerie seche', 'Laitiers'],
    metodoPago: ['Virement', 'Cheque'],
    isDonateur: false,
    isFournisseur: true,
    notas: `${DEMO_MARKER} Fournisseur généré automatiquement pour ajuster la quantité QA`,
  };
}

function crearContactoDepartamentoDemoExtra(
  indice: number,
  departamentos: DemoDepartmentIds
): Parameters<typeof guardarContacto>[0] {
  const numero = formatearIndiceDemo(indice);
  const departamentosCiclo = [
    departamentos.entrepotId,
    departamentos.comptoirId,
    departamentos.cuisineId,
    departamentos.liaisonId,
    departamentos.ptcId,
    departamentos.maintienId,
    departamentos.recrutementId,
  ];
  const tipos: ContactoDepartamento['tipo'][] = ['employe', 'partenaire', 'responsable-sante'];
  const departamentoId = departamentosCiclo[indice % departamentosCiclo.length];

  return {
    id: `QA-DEMO-DEP-AUTO-${numero}`,
    departamentoId,
    departamentoIds: [departamentoId],
    tipo: tipos[indice % tipos.length],
    nombre: ['Amina', 'Cedric', 'Lina', 'Mathieu', 'Rania', 'Olivier'][indice % 6],
    apellido: ['Dupont', 'Morin', 'Haddad', 'Caron', 'Nguyen', 'Tremblay'][indice % 6],
    genero: indice % 2 === 0 ? 'Femme' : 'Homme',
    email: `qa-demo.departement.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(514) 555-${4400 + indice}`,
    cargo: 'Support departemental',
    activo: true,
    fechaIngreso: `2026-03-${String((indice % 20) + 1).padStart(2, '0')}T08:00:00.000Z`,
    ciudad: 'Laval',
    quartier: ['Auteuil', 'Chomedey', 'Pont-Viau', 'Vimont'][indice % 4],
    codigoPostal: ['H7H 1N4', 'H7N 1V8', 'H7G 3C5', 'H7K 2M1'][indice % 4],
    numeroEmpleado: `QA-DEMO-DEP-AUTO-${numero}`,
    notas: `${DEMO_MARKER} Contact département généré automatiquement pour ajuster la quantité QA`,
  };
}

function crearContactoComptoirDemoExtra(
  indice: number,
  comptoirId: string
): Parameters<typeof guardarContacto>[0] {
  const numero = formatearIndiceDemo(indice);
  const tipos: ContactoDepartamento['tipo'][] = ['benevole', 'employe', 'responsable-sante'];

  return {
    id: `QA-DEMO-CPT-AUTO-${numero}`,
    departamentoId: comptoirId,
    departamentoIds: [comptoirId],
    tipo: tipos[indice % tipos.length],
    nombre: ['Elena', 'Bruno', 'Marta', 'Alex', 'Noemie', 'Rene'][indice % 6],
    apellido: ['Lavigne', 'Paredes', 'Roy', 'Beaulieu', 'Giraud', 'Cortes'][indice % 6],
    genero: indice % 2 === 0 ? 'Femme' : 'Homme',
    email: `qa-demo.comptoir.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(514) 555-${4600 + indice}`,
    cargo: 'Accueil comptoir',
    idiomas: indice % 2 === 0 ? ['fr', 'es'] : ['fr', 'en'],
    activo: true,
    fechaIngreso: `2026-03-${String((indice % 20) + 1).padStart(2, '0')}T09:00:00.000Z`,
    ciudad: 'Laval',
    quartier: ['Chomedey', 'Duvernay', 'Laval-des-Rapides', 'Pont-Viau'][indice % 4],
    codigoPostal: ['H7N 4P2', 'H7E 2B8', 'H7N 1V8', 'H7G 3C5'][indice % 4],
    numeroEmpleado: `QA-DEMO-CPT-AUTO-${numero}`,
    notas: `${DEMO_MARKER} Contact comptoir généré automatiquement pour ajuster la quantité QA`,
  };
}

function crearVehiculoDemoExtra(indice: number): Parameters<typeof crearVehiculo>[0] {
  const numero = formatearIndiceDemo(indice);
  const refrigerado = indice % 2 === 1;

  return {
    matricula: `QA-DEMO-${refrigerado ? 'REF' : 'CAM'}-AUTO-${numero}`,
    placa: `QA-DEMO-${refrigerado ? 'REF' : 'CAM'}-AUTO-${numero}`,
    tipo: refrigerado ? 'refrigerado' : 'camion',
    marca: refrigerado ? 'Ford' : 'Hino',
    modelo: refrigerado ? 'Transit Cold' : '195 Box',
    capacidadKg: refrigerado ? 1600 : 3200,
    capacidadM3: refrigerado ? 10 : 17,
    estado: 'disponible',
    estadoUI: 'disponible',
    activo: true,
    observaciones: `${DEMO_MARKER} Vehicule généré automatiquement pour ajuster la quantité QA`,
    notas: `${DEMO_MARKER} Vehicule généré automatiquement pour ajuster la quantité QA`,
    ultimoMantenimiento: '2026-03-01',
    proximoMantenimiento: '2026-09-01',
    kmActual: 18000 + indice * 550,
    kilometraje: 18000 + indice * 550,
    conductorAsignado: '',
    anio: 2022,
    consumoCombustible: refrigerado ? 12.8 : 14.2,
  };
}

function crearChoferDemoExtra(
  indice: number,
  vehiculosDemo: Vehiculo[]
): Parameters<typeof crearChofer>[0] {
  const numero = formatearIndiceDemo(indice);
  const vehiculoAsignado = vehiculosDemo[indice % Math.max(vehiculosDemo.length, 1)];

  return {
    nombre: ['Youssef', 'Clara', 'Nicolas', 'Sonia', 'David', 'Meryem'][indice % 6],
    apellido: ['Boucher', 'Gomez', 'Perron', 'Diallo', 'Lopez', 'El Amrani'][indice % 6],
    cedula: `QA-DEMO-CH-AUTO-${numero}`,
    licencia: `QA-DEMO-LIC-AUTO-${numero}`,
    tipoLicencia: vehiculoAsignado?.tipo === 'camion' ? 'Classe 3' : 'Classe 5',
    telefono: `(514) 555-${4500 + indice}`,
    email: `qa-demo.chofer.${numero}${DEMO_EMAIL_DOMAIN}`,
    fechaNacimiento: `198${indice % 10}-06-15`,
    fechaContratacion: `2025-${String((indice % 9) + 1).padStart(2, '0')}-01`,
    estado: 'activo',
    vehiculoAsignado: vehiculoAsignado?.id || '',
    experienciaAnios: 2 + (indice % 7),
    certificaciones: ['Livraison alimentaire'],
    foto: indice % 2 === 0 ? '👨‍✈️' : '👩‍✈️',
    joursDisponibles: [
      { jour: 'Lundi', horaire: 'AM' },
      { jour: 'Jeudi', horaire: 'AM/PM' },
    ],
  };
}

function crearOrganismoRecrutementDemoExtra(
  indice: number,
): Parameters<typeof guardarOrganismoRecrutement>[0] {
  const numero = formatearIndiceDemo(indice);
  const nombres = [
    'Relance Communautaire',
    'Tremplin Emploi',
    'Passerelle Locale',
    'Carrefour Solidaire',
    'Cap Avenir',
    'Mains Ouvertes',
  ];
  const enfoques = [
    'Insertion sociale',
    'Mentorat jeunesse',
    'Accompagnement familles',
    'Soutien aînés',
    'Intégration citoyenne',
    'Formation terrain',
  ];
  const quartiers = ['Chomedey', 'Pont-Viau', 'Vimont', 'Duvernay', 'Fabreville', 'Auteuil'];
  const zonas = ['Laval Centre', 'Laval Est', 'Laval Nord', 'Laval Ouest'];
  const responsables = ['Mélanie Roy', 'Karim Bensaid', 'Nora Garcia', 'Samuel Fortin', 'Lina Haddad', 'Olivier Gagnon'];

  return {
    id: `QA-DEMO-REC-ORG-AUTO-${numero}`,
    nombre: `${nombres[indice % nombres.length]} ${numero}`,
    tipo: enfoques[indice % enfoques.length],
    email: `qa-demo.rec.organisme.${numero}${DEMO_EMAIL_DOMAIN}`,
    telefono: `(450) 555-${6200 + indice}`,
    direccion: `${200 + indice} Rue Démo Recrutement, Laval`,
    codigoPostal: ['H7N 2P4', 'H7N 5A4', 'H7K 1M8', 'H7E 2B8', 'H7P 3B2', 'H7H 1N4'][indice % 6],
    quartier: quartiers[indice % quartiers.length],
    responsable: responsables[indice % responsables.length],
    beneficiarios: 24 + (indice % 35),
    activo: true,
    regular: true,
    clasificacionOrganismo: 'regular',
    participantePRS: false,
    personasServidas: 24 + (indice % 35),
    cantidadColaciones: 8 + (indice % 14),
    cantidadAlmuerzos: 4 + (indice % 10),
    porcentajeReparticion: 4 + (indice % 6),
    notas: `${DEMO_MARKER} Organisme recrutement généré automatiquement pour ajuster la quantité QA`,
    notificaciones: true,
    logo: null,
    documentosPDF: [],
    documentoPDF: null,
    contactosNotificacion: [
      {
        nombre: responsables[indice % responsables.length],
        email: `qa-demo.rec.contact.${numero}${DEMO_EMAIL_DOMAIN}`,
        cargo: 'Coordination externe',
        joursDisponibles: [{ jour: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][indice % 5], horaire: indice % 2 === 0 ? 'AM' : 'PM' }],
        idiomas: indice % 2 === 0 ? ['fr', 'en'] : ['fr', 'es'],
      },
    ],
    contactoCargo: 'Coordination externe',
    contactoTelefono: `(450) 555-${6200 + indice}`,
    contactoCellulaire: `(514) 555-${7200 + indice}`,
    contactoEmail: `qa-demo.rec.contact.${numero}${DEMO_EMAIL_DOMAIN}`,
    contactoJoursDisponibles: [{ jour: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][indice % 5], horaire: indice % 2 === 0 ? 'AM' : 'PM' }],
    frecuenciaCita: indice % 2 === 0 ? 'Mensuelle' : 'Bi-hebdomadaire',
    diaCita: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'][indice % 5],
    horaCita: ['09:00', '10:30', '13:00', '14:30'][indice % 4],
    fechaInicioInactividad: undefined,
    fechaFinInactividad: undefined,
    claveAcceso: undefined,
    zona: zonas[indice % zonas.length],
  };
}

function ajustarContactosDemo(
  cantidades: Pick<
    CantidadesEjemplosFuncionales,
    'benevoles' | 'donateurs' | 'fournisseurs' | 'comptoir' | 'contactosDepartamentos'
  >,
  departamentos: DemoDepartmentIds
): void {
  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(esBenevoleDemo),
    cantidades.benevoles,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearBenevoleDemoExtra(indice, departamentos));
    }
  );

  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(esDonateurDemo),
    cantidades.donateurs,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearDonateurDemoExtra(indice));
    }
  );

  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(esFournisseurDemo),
    cantidades.fournisseurs,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearFournisseurDemoExtra(indice));
    }
  );

  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(
      (contacto) =>
        esContactoDemo(contacto) &&
        (
          contacto.departamentoId === departamentos.comptoirId ||
          (Array.isArray(contacto.departamentoIds) && contacto.departamentoIds.includes(departamentos.comptoirId))
        )
    ),
    cantidades.comptoir,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearContactoComptoirDemoExtra(indice, departamentos.comptoirId));
    }
  );

  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(esContactoDepartamentoInternoDemo),
    cantidades.contactosDepartamentos,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearContactoDepartamentoDemoExtra(indice, departamentos));
    }
  );
}

function obtenerDepartamentoId(codigo: string, fallback: string): string {
  return obtenerDepartamentos().find((departamento) => departamento.codigo === codigo)?.id || fallback;
}

function esContactoDemo(contacto: ContactoDepartamento): boolean {
  return Boolean(
    contacto.notas?.includes(DEMO_MARKER) ||
    contacto.email?.endsWith(DEMO_EMAIL_DOMAIN) ||
    contacto.numeroEmpleado?.startsWith('QA-DEMO-') ||
    contacto.numeroID?.startsWith('QA-DEMO-')
  );
}

function esOrganismoDemo(organismo: Organismo): boolean {
  return Boolean(
    organismo.notas?.includes(DEMO_MARKER) || organismo.email?.endsWith(DEMO_EMAIL_DOMAIN)
  );
}

function esOrganismoRecrutementDemo(organismo: OrganismoRecrutement): boolean {
  return Boolean(
    organismo.notas?.includes(DEMO_MARKER) || organismo.email?.endsWith(DEMO_EMAIL_DOMAIN)
  );
}

function esVehiculoDemo(vehiculo: Vehiculo): boolean {
  return Boolean(
    vehiculo.matricula?.startsWith('QA-DEMO-') ||
    vehiculo.placa?.startsWith('QA-DEMO-') ||
    vehiculo.notas?.includes(DEMO_MARKER) ||
    vehiculo.observaciones?.includes(DEMO_MARKER)
  );
}

function esChoferDemo(chofer: Chofer): boolean {
  return Boolean(
    chofer.email?.endsWith(DEMO_EMAIL_DOMAIN) ||
    chofer.cedula?.startsWith('QA-DEMO-') ||
    chofer.licencia?.startsWith('QA-DEMO-')
  );
}

function esProductoDemo(producto: ProductoCreado): boolean {
  return Boolean(
    producto.codigo?.startsWith('QA-DEMO-') ||
    producto.lote?.includes(DEMO_MARKER)
  );
}

function esComandaDemo(comanda: Comanda): boolean {
  return Boolean(
    comanda.id?.startsWith('QA-DEMO-') ||
    comanda.numero?.startsWith('QA-DEMO-') ||
    comanda.numeroComanda?.startsWith('QA-DEMO-') ||
    comanda.observaciones?.includes(DEMO_MARKER)
  );
}

function esMovimientoDemo(movimiento: MovimientoExtendido): boolean {
  return Boolean(
    movimiento.id?.startsWith('QA-DEMO-') ||
    movimiento.documentoReferencia?.startsWith('QA-DEMO-') ||
    movimiento.numeroComanda?.startsWith('QA-DEMO-') ||
    movimiento.motivo?.includes(DEMO_MARKER) ||
    movimiento.usuario === 'qa-demo'
  );
}

function esRutaDemo(ruta: Ruta): boolean {
  return Boolean(
    ruta.id?.startsWith('QA-DEMO-') ||
    ruta.numero?.startsWith('QA-DEMO-') ||
    ruta.observaciones?.includes(DEMO_MARKER)
  );
}

function esBeneficiarioComptoirDemo(beneficiario: ComptoirBeneficiary): boolean {
  return Boolean(
    beneficiario.id?.startsWith('QA-DEMO-CPT-BEN-') ||
    beneficiario.email?.endsWith(DEMO_EMAIL_DOMAIN) ||
    beneficiario.notes?.includes(DEMO_MARKER)
  );
}

function crearBeneficiarioComptoirDemoExtra(indice: number): ComptoirBeneficiary {
  const numero = formatearIndiceDemo(indice);
  const fechaBase = `2026-04-${String((indice % 20) + 1).padStart(2, '0')}`;
  const timestamp = `${fechaBase}T09:00:00.000Z`;

  return {
    id: `QA-DEMO-CPT-BEN-${numero}`,
    nom: ['Famille Leduc', 'Marc Tremblay', 'Nora Benali', 'Ana Morales', 'Yves Gagnon', 'Sara Diallo'][indice % 6],
    telephone: `(514) 555-${5200 + indice}`,
    email: `qa-demo.comptoir.benef.${numero}${DEMO_EMAIL_DOMAIN}`,
    statut: 'actif',
    priorite: (['normale', 'haute', 'basse'] as const)[indice % 3],
    derniereAide: fechaBase,
    notes: `${DEMO_MARKER} Beneficiaire comptoir généré automatiquement pour les tests du module`,
    nombrePersonnes: 1 + (indice % 5),
    revenus: 'Revenu de solidarité',
    hasEnfants: indice % 2 === 0,
    nombreEnfants: indice % 2 === 0 ? 1 + (indice % 3) : 0,
    ville: 'Laval',
    adresse: `${180 + indice} Rue Demo Comptoir`,
    codePostal: ['H7N 4P2', 'H7E 2B8', 'H7G 3C5', 'H7N 1V8'][indice % 4],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function ajustarBeneficiariosComptoirDemo(cantidadObjetivo: number): void {
  const existentes = obtenirBeneficiairesComptoir();
  const conservados = existentes.filter((beneficiario) => !esBeneficiarioComptoirDemo(beneficiario));
  const demoActualizados = Array.from({ length: cantidadObjetivo }, (_, indice) =>
    crearBeneficiarioComptoirDemoExtra(indice)
  );

  const idsDemoVigentes = new Set(demoActualizados.map((beneficiario) => beneficiario.id));

  sauvegarderBeneficiairesComptoir([...conservados, ...demoActualizados]);

  const rendezVousFiltrados = obtenirRendezVousComptoir().filter((cita) =>
    !cita.beneficiaireId.startsWith('QA-DEMO-CPT-BEN-') || idsDemoVigentes.has(cita.beneficiaireId)
  );
  sauvegarderRendezVousComptoir(rendezVousFiltrados);

  const distribucionesFiltradas = obtenirDistributionsComptoir().filter((distribution) =>
    !distribution.beneficiaireId.startsWith('QA-DEMO-CPT-BEN-') || idsDemoVigentes.has(distribution.beneficiaireId)
  );
  sauvegarderDistributionsComptoir(distribucionesFiltradas);
}

function guardarMovimientosDemo(movimientosDemo: MovimientoExtendido[]): void {
  const movimientos = obtenerMovimientos().filter((movimiento) => !esMovimientoDemo(movimiento));
  localStorage.setItem(DEMO_MOVIMIENTOS_KEY, JSON.stringify([...movimientos, ...movimientosDemo]));
}

function resumirEjemplos(): ResumenEjemplos {
  const contactos = obtenerContactosDepartamento();
  const organismos = obtenerOrganismos();
  const organismosRecrutement = obtenerOrganismosRecrutement();
  const vehiculos = obtenerVehiculos();
  const choferes = obtenerChoferes();
  const productos = obtenerProductos();
  const comandas = obtenerComandas();
  const movimientos = obtenerMovimientos();
  const rutas = obtenerRutas();
  const contactosDemo = contactos.filter(esContactoDemo);
  const departamentosCubiertos = new Set(
    contactosDemo.flatMap((contacto) =>
      Array.isArray(contacto.departamentoIds) && contacto.departamentoIds.length > 0
        ? contacto.departamentoIds
        : contacto.departamentoId
          ? [contacto.departamentoId]
          : []
    )
  ).size;

  return {
    benevoles: contactosDemo.filter((contacto) => contacto.tipo === 'benevole').length,
    donateurs: contactosDemo.filter((contacto) => contacto.isDonateur || contacto.tipo === 'donador').length,
    fournisseurs: contactosDemo.filter((contacto) => contacto.isFournisseur || contacto.tipo === 'fournisseur').length,
    comptoir: contactosDemo.filter(
      (contacto) =>
        contacto.departamentoId === obtenerDepartamentoId('COMPTOIR', '2') ||
        (Array.isArray(contacto.departamentoIds) && contacto.departamentoIds.includes(obtenerDepartamentoId('COMPTOIR', '2')))
    ).length,
    contactosDepartamentos: contactosDemo.length,
    departamentosCubiertos,
    chauffeurs: choferes.filter(esChoferDemo).length,
    camiones: vehiculos.filter(esVehiculoDemo).length,
    organismos: organismos.filter(esOrganismoDemo).length,
    organismosRecrutement: organismosRecrutement.filter(esOrganismoRecrutementDemo).length,
    productos: productos.filter(esProductoDemo).length,
    comandas: comandas.filter(esComandaDemo).length,
    movimientos: movimientos.filter(esMovimientoDemo).length,
    rutas: rutas.filter(esRutaDemo).length,
  };
}

export function obtenerResumenEjemplosFuncionalesPrueba(): ResumenEjemplos {
  return resumirEjemplos();
}

function imprimirResumen(accion: string, resumen: ResumenEjemplos) {
  console.group(`${DEMO_MARKER} ${accion}`);
  console.table(resumen);
  console.log('Benevoles demo visibles en Departamentos/Benevoles.');
  console.log('Donateurs y fournisseurs demo visibles en Entrepot > Donateurs & Fournisseurs y en formularios de entrada DON/ACH.');
  console.log('Contacts comptoir demo visibles en Comptoir para pruebas de accueil y roles.');
  console.log('Chauffeurs y camiones demo visibles en Transporte > Choferes y Vehiculos.');
  console.log('Organismos demo visibles en Organismos/Liaison y como destinos de rutas.');
  console.log('Organismes recrutement demo visibles en Recrutement > Organismes pour les assignations externes.');
  console.log('Productos, comandas, movimientos y rutas demo dejan los dashboards listos sin carga manual extra.');
  console.groupEnd();
}

export function limpiarEjemplosFuncionalesPrueba(): ResumenEjemplos {
  guardarRutas(obtenerRutas().filter((ruta) => !esRutaDemo(ruta)));
  localStorage.setItem(
    DEMO_MOVIMIENTOS_KEY,
    JSON.stringify(obtenerMovimientos().filter((movimiento) => !esMovimientoDemo(movimiento)))
  );

  obtenerComandas().filter(esComandaDemo).forEach((comanda) => {
    eliminarComanda(comanda.id);
  });

  obtenerProductos().filter(esProductoDemo).forEach((producto) => {
    eliminarProducto(producto.id);
  });

  obtenerChoferes().filter(esChoferDemo).forEach((chofer) => {
    eliminarChofer(chofer.id);
  });

  obtenerVehiculos().filter(esVehiculoDemo).forEach((vehiculo) => {
    eliminarVehiculo(vehiculo.id);
  });

  obtenerOrganismos().filter(esOrganismoDemo).forEach((organismo) => {
    eliminarOrganismo(organismo.id);
  });

  obtenerOrganismosRecrutement().filter(esOrganismoRecrutementDemo).forEach((organismo) => {
    eliminarOrganismoRecrutement(organismo.id);
  });

  obtenerContactosDepartamento().filter(esContactoDemo).forEach((contacto) => {
    eliminarContacto(contacto.id);
  });

  ajustarBeneficiariosComptoirDemo(0);

  const resumen = resumirEjemplos();
  imprimirResumen('Ejemplos eliminados', resumen);
  toast.success('Ejemplos funcionales eliminados');
  return resumen;
}

export function sembrarEjemplosFuncionalesPrueba(
  cantidadOrganismos = 12,
  opciones?: OpcionesSembradoEjemplos
): ResumenEjemplos {
  inicializarDepartamentos();
  limpiarEjemplosFuncionalesPrueba();
  const cantidades = resolverCantidadesEjemplos(cantidadOrganismos, opciones);

  const entrepotId = obtenerDepartamentoId('ENTREPOT', '1');
  const comptoirId = obtenerDepartamentoId('COMPTOIR', '2');
  const cuisineId = obtenerDepartamentoId('CUISINE', '3');
  const liaisonId = obtenerDepartamentoId('LIAISON', '4');
  const ptcId = obtenerDepartamentoId('PTC', '5');
  const maintienId = obtenerDepartamentoId('MAINTIEN', '6');
  const recrutementId = obtenerDepartamentoId('RECRUTEMENT', '7');

  guardarContacto({
    id: 'QA-DEMO-BEN-001',
    departamentoId: cuisineId,
    departamentoIds: [cuisineId, entrepotId],
    tipo: 'benevole',
    nombre: 'Camila',
    apellido: 'Rojas',
    genero: 'Femme',
    email: 'camila.rojas@demo.qa.local',
    telefono: '(514) 555-3101',
    cargo: 'Tri et preparation cuisine',
    idiomas: ['fr', 'es'],
    disponibilidades: [
      { jour: 'Lundi', am: true, pm: false },
      { jour: 'Mercredi', am: true, pm: true },
      { jour: 'Vendredi', am: false, pm: true },
    ],
    activo: true,
    fechaIngreso: '2026-02-10T09:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Chomedey',
    codigoPostal: 'H7N 2K4',
    numeroEmpleado: 'QA-DEMO-BEN-001',
    notas: `${DEMO_MARKER} Bénévole polyvalente pour tester les fiches, les disponibilités et les filtres`,
    certificaciones: ['Manipulation des aliments', 'Secourisme'],
  });

  guardarContacto({
    id: 'QA-DEMO-DON-001',
    departamentoId: entrepotId,
    departamentoIds: [entrepotId, liaisonId],
    tipo: 'donador',
    nombre: 'Sophie',
    apellido: 'Boulanger',
    email: 'sophie.boulanger@demo.qa.local',
    telefono: '(514) 555-3201',
    activo: true,
    fechaIngreso: '2026-01-12T10:00:00.000Z',
    nombreEmpresa: 'Boulangerie Solidaire Laval',
    cargo: 'Responsable des dons',
    ciudad: 'Laval',
    quartier: 'Pont-Viau',
    codigoPostal: 'H7G 1A1',
    tipoEmpresa: 'inc',
    categoriaProductos: ['Boulangerie', 'Produits frais'],
    diasOperacion: ['Lundi', 'Mardi', 'Jeudi'],
    tiempoEntrega: 'Avant 10h',
    isDonateur: true,
    isFournisseur: false,
    notas: `${DEMO_MARKER} Donateur principal pour tester les entrées DON et la collecte`,
  });

  guardarContacto({
    id: 'QA-DEMO-FOU-001',
    departamentoId: entrepotId,
    departamentoIds: [entrepotId],
    tipo: 'fournisseur',
    nombre: 'Jean',
    apellido: 'Mercier',
    email: 'jean.mercier@demo.qa.local',
    telefono: '(514) 555-3301',
    activo: true,
    fechaIngreso: '2026-01-20T08:30:00.000Z',
    nombreEmpresa: 'Marche Nord Distribution',
    cargo: 'Representant comptes',
    ciudad: 'Laval',
    quartier: 'Fabreville',
    codigoPostal: 'H7P 3B2',
    tipoEmpresa: 'ltee',
    categoriaProductos: ['Epicerie seche', 'Laitiers'],
    metodoPago: ['Virement', 'Cheque'],
    isDonateur: false,
    isFournisseur: true,
    notas: `${DEMO_MARKER} Fournisseur pour tester les entrées ACH et les filtres d'achat`,
  });

  guardarContacto({
    id: 'QA-DEMO-ENT-002',
    departamentoId: entrepotId,
    departamentoIds: [entrepotId],
    tipo: 'employe',
    nombre: 'Laura',
    apellido: 'Gagnon',
    genero: 'Femme',
    email: 'laura.gagnon@demo.qa.local',
    telefono: '(514) 555-3202',
    cargo: 'Coordination entrepot',
    activo: true,
    fechaIngreso: '2026-02-04T08:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Auteuil',
    codigoPostal: 'H7H 1N4',
    numeroEmpleado: 'QA-DEMO-ENT-002',
    notas: `${DEMO_MARKER} Employé entrepôt pour tester les fiches, les affectations et les filtres de département`,
  });

  guardarContacto({
    id: 'QA-DEMO-CPT-001',
    departamentoId: comptoirId,
    departamentoIds: [comptoirId],
    tipo: 'benevole',
    nombre: 'Diego',
    apellido: 'Morales',
    genero: 'Homme',
    email: 'diego.morales@demo.qa.local',
    telefono: '(514) 555-3401',
    cargo: 'Accueil comptoir',
    idiomas: ['fr', 'es'],
    activo: true,
    fechaIngreso: '2026-02-18T09:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Chomedey',
    codigoPostal: 'H7N 4P2',
    numeroEmpleado: 'QA-DEMO-CPT-001',
    notas: `${DEMO_MARKER} Bénévole comptoir pour tester l'accueil, l'historique et les filtres par département`,
  });

  guardarContacto({
    id: 'QA-DEMO-CPT-002',
    departamentoId: comptoirId,
    departamentoIds: [comptoirId],
    tipo: 'responsable-sante',
    nombre: 'Julie',
    apellido: 'Parent',
    genero: 'Femme',
    email: 'julie.parent@demo.qa.local',
    telefono: '(514) 555-3402',
    cargo: 'Responsable sante securite',
    activo: true,
    fechaIngreso: '2026-01-28T08:15:00.000Z',
    ciudad: 'Laval',
    quartier: 'Duvernay',
    codigoPostal: 'H7E 2B8',
    numeroEmpleado: 'QA-DEMO-CPT-002',
    notas: `${DEMO_MARKER} Responsable santé du comptoir pour tester les rôles spécialisés par département`,
  });

  guardarContacto({
    id: 'QA-DEMO-CUI-002',
    departamentoId: cuisineId,
    departamentoIds: [cuisineId],
    tipo: 'employe',
    nombre: 'Malik',
    apellido: 'Benali',
    genero: 'Homme',
    email: 'malik.benali@demo.qa.local',
    telefono: '(514) 555-3102',
    cargo: 'Chef de preparation',
    activo: true,
    fechaIngreso: '2026-02-06T07:30:00.000Z',
    ciudad: 'Laval',
    quartier: 'Laval-des-Rapides',
    codigoPostal: 'H7N 1V8',
    numeroEmpleado: 'QA-DEMO-CUI-002',
    notas: `${DEMO_MARKER} Employé cuisine pour tester les fiches internes et le chargement des contacts du département`,
  });

  guardarContacto({
    id: 'QA-DEMO-LIA-001',
    departamentoId: liaisonId,
    departamentoIds: [liaisonId],
    tipo: 'partenaire',
    nombre: 'Claire',
    apellido: 'Dupuis',
    genero: 'Femme',
    email: 'claire.dupuis@demo.qa.local',
    telefono: '(514) 555-3501',
    cargo: 'Partenariats communautaires',
    activo: true,
    fechaIngreso: '2026-01-10T10:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Pont-Viau',
    codigoPostal: 'H7G 3C5',
    notas: `${DEMO_MARKER} Partenaire liaison pour tester les contacts multi-organismes et le suivi`,
  });

  guardarContacto({
    id: 'QA-DEMO-LIA-002',
    departamentoId: liaisonId,
    departamentoIds: [liaisonId, entrepotId],
    tipo: 'employe',
    nombre: 'Omar',
    apellido: 'Haddad',
    genero: 'Homme',
    email: 'omar.haddad@demo.qa.local',
    telefono: '(514) 555-3502',
    cargo: 'Suivi organismes',
    activo: true,
    fechaIngreso: '2026-02-02T09:45:00.000Z',
    ciudad: 'Laval',
    quartier: 'Vimont',
    codigoPostal: 'H7K 2M1',
    numeroEmpleado: 'QA-DEMO-LIA-002',
    notas: `${DEMO_MARKER} Employé liaison pour tester les affectations multiples entre départements`,
  });

  guardarContacto({
    id: 'QA-DEMO-PTC-001',
    departamentoId: ptcId,
    departamentoIds: [ptcId],
    tipo: 'employe',
    nombre: 'Helena',
    apellido: 'Costa',
    genero: 'Femme',
    email: 'helena.costa@demo.qa.local',
    telefono: '(514) 555-3601',
    cargo: 'Coordination PTC',
    activo: true,
    fechaIngreso: '2026-03-01T08:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Fabreville',
    codigoPostal: 'H7P 2R7',
    numeroEmpleado: 'QA-DEMO-PTC-001',
    notas: `${DEMO_MARKER} Employé PTC pour tester les départements moins utilisés`,
  });

  guardarContacto({
    id: 'QA-DEMO-MAI-001',
    departamentoId: maintienId,
    departamentoIds: [maintienId],
    tipo: 'employe',
    nombre: 'Luc',
    apellido: 'Fortin',
    genero: 'Homme',
    email: 'luc.fortin@demo.qa.local',
    telefono: '(514) 555-3701',
    cargo: 'Maintenance generale',
    activo: true,
    fechaIngreso: '2026-02-14T07:00:00.000Z',
    ciudad: 'Laval',
    quartier: 'Auteuil',
    codigoPostal: 'H7H 2A6',
    numeroEmpleado: 'QA-DEMO-MAI-001',
    notas: `${DEMO_MARKER} Employé maintenance pour tester les contacts techniques par département`,
  });

  guardarContacto({
    id: 'QA-DEMO-REC-001',
    departamentoId: recrutementId,
    departamentoIds: [recrutementId],
    tipo: 'employe',
    nombre: 'Fatima',
    apellido: 'Ait Said',
    genero: 'Femme',
    email: 'fatima.aitsaid@demo.qa.local',
    telefono: '(514) 555-3801',
    cargo: 'Recrutement et integration',
    activo: true,
    fechaIngreso: '2026-01-22T09:30:00.000Z',
    ciudad: 'Laval',
    quartier: 'Sainte-Dorothée',
    codigoPostal: 'H7X 1L9',
    numeroEmpleado: 'QA-DEMO-REC-001',
    notas: `${DEMO_MARKER} Employé recrutement pour tester les contacts RH et les filtres du département`,
  });

  ajustarContactosDemo(
    {
      benevoles: cantidades.benevoles,
      donateurs: cantidades.donateurs,
      fournisseurs: cantidades.fournisseurs,
      comptoir: cantidades.comptoir,
      contactosDepartamentos: cantidades.contactosDepartamentos,
    },
    {
      entrepotId,
      comptoirId,
      cuisineId,
      liaisonId,
      ptcId,
      maintienId,
      recrutementId,
    }
  );

  ajustarBeneficiariosComptoirDemo(cantidades.comptoir);

  const organismosDemo: Array<Parameters<typeof crearOrganismo>[0]> = [
    {
      nombre: 'Maison des Familles Horizon',
      tipo: 'Centre communautaire',
      email: 'horizon.organisme@demo.qa.local',
      telefono: '(450) 555-4101',
      direccion: '245 Boulevard des Laurentides, Laval',
      codigoPostal: 'H7G 2T6',
      quartier: 'Pont-Viau',
      zona: 'Laval Est',
      responsable: 'Nadia Bélanger',
      beneficiarios: 145,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '09:00',
      personasServidas: 145,
      cantidadColaciones: 80,
      cantidadAlmuerzos: 45,
      porcentajeReparticion: 18,
      notas: `${DEMO_MARKER} Organisme régulier pour tester la liaison, les offres et les routes`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Nadia Bélanger',
          email: 'nadia.belanger@demo.qa.local',
          cargo: 'Coordination',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'AM' },
            { jour: 'Jeudi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'HORIZON2026',
    },
    {
      nombre: 'Centre Jeunesse Soleil PRS',
      tipo: 'Programme jeunesse',
      email: 'soleil.prs@demo.qa.local',
      telefono: '(450) 555-4102',
      direccion: '88 Rue des Écoles, Laval',
      codigoPostal: 'H7M 1R4',
      quartier: 'Chomedey',
      zona: 'Laval Centre',
      responsable: 'Amine El Fassi',
      beneficiarios: 90,
      activo: true,
      regular: true,
      participantePRS: true,
      frecuenciaCita: 'Bi-hebdomadaire',
      horaCita: '13:30',
      personasServidas: 90,
      cantidadColaciones: 120,
      cantidadAlmuerzos: 30,
      porcentajeReparticion: 12,
      notas: `${DEMO_MARKER} Organisme PRS pour tester les filtres PRS, les destinations et la planification`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Amine El Fassi',
          email: 'amine.elfassi@demo.qa.local',
          cargo: 'Coordination PRS',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'PM' },
            { jour: 'Mercredi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'SOLEILPRS2026',
    },
    {
      nombre: 'Cuisine de Quartier Saint-Martin',
      tipo: 'Cuisine collective',
      email: 'saintmartin.organisme@demo.qa.local',
      telefono: '(450) 555-4103',
      direccion: '312 Avenue Saint-Martin Ouest, Laval',
      codigoPostal: 'H7M 3Y8',
      quartier: 'Laval-des-Rapides',
      zona: 'Laval Centre',
      responsable: 'Karine Dubé',
      beneficiarios: 110,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '10:30',
      personasServidas: 110,
      cantidadColaciones: 40,
      cantidadAlmuerzos: 95,
      porcentajeReparticion: 14,
      notas: `${DEMO_MARKER} Organisme de cuisine collective pour tester des organismes réguliers supplémentaires`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Karine Dubé',
          email: 'karine.dube@demo.qa.local',
          cargo: 'Direction',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'AM' },
            { jour: 'Jeudi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'STMARTIN2026',
    },
    {
      nombre: 'Réseau Aide Familles Vimont',
      tipo: 'Aide alimentaire',
      email: 'vimont.aide@demo.qa.local',
      telefono: '(450) 555-4104',
      direccion: '77 Rue de Lausanne, Laval',
      codigoPostal: 'H7K 3R1',
      quartier: 'Vimont',
      zona: 'Laval Nord',
      responsable: 'Patrick Côté',
      beneficiarios: 175,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Bi-hebdomadaire',
      horaCita: '08:45',
      personasServidas: 175,
      cantidadColaciones: 70,
      cantidadAlmuerzos: 60,
      porcentajeReparticion: 20,
      notas: `${DEMO_MARKER} Organisme à fort volume pour tester la répartition et les routes avec plus de destinations`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Patrick Côté',
          email: 'patrick.cote@demo.qa.local',
          cargo: 'Coordination logistique',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'AM/PM' },
            { jour: 'Vendredi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'VIMONTAIDE2026',
    },
    {
      nombre: 'Maison Inclusion Fabreville',
      tipo: 'Soutien communautaire',
      email: 'fabreville.inclusion@demo.qa.local',
      telefono: '(450) 555-4105',
      direccion: '501 Boulevard Dagenais Ouest, Laval',
      codigoPostal: 'H7L 5X5',
      quartier: 'Fabreville',
      zona: 'Laval Ouest',
      responsable: 'Meryem Saidi',
      beneficiarios: 85,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Mensuelle',
      horaCita: '14:00',
      personasServidas: 85,
      cantidadColaciones: 55,
      cantidadAlmuerzos: 20,
      porcentajeReparticion: 10,
      notas: `${DEMO_MARKER} Petit organisme régulier pour tester des scénarios avec différents pourcentages de répartition`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Meryem Saidi',
          email: 'meryem.saidi@demo.qa.local',
          cargo: 'Direction generale',
          idiomas: ['fr', 'ar'],
          joursDisponibles: [
            { jour: 'Mercredi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'FABRINCLUSION2026',
    },
    {
      nombre: 'Relais Communautaire Sainte-Dorothée',
      tipo: 'Centre de services',
      email: 'relais.sdorothee@demo.qa.local',
      telefono: '(450) 555-4106',
      direccion: "1290 Chemin du Bord-de-l'Eau, Laval",
      codigoPostal: 'H7Y 1B8',
      quartier: 'Sainte-Dorothée',
      zona: 'Laval Ouest',
      responsable: 'Lucie Boucher',
      beneficiarios: 60,
      activo: true,
      regular: false,
      participantePRS: false,
      frecuenciaCita: 'Sur demande',
      horaCita: '11:15',
      personasServidas: 60,
      cantidadColaciones: 25,
      cantidadAlmuerzos: 18,
      porcentajeReparticion: 6,
      notas: `${DEMO_MARKER} Organisme non régulier pour tester les filtres entre organismes actifs et réguliers`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Lucie Boucher',
          email: 'lucie.boucher@demo.qa.local',
          cargo: 'Intervenante',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Jeudi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'RELAISSD2026',
    },
    {
      nombre: 'Collectif Familles Auteuil',
      tipo: 'Centre communautaire',
      email: 'auteuil.collectif@demo.qa.local',
      telefono: '(450) 555-4107',
      direccion: '54 Rue de Cherbourg, Laval',
      codigoPostal: 'H7H 1K2',
      quartier: 'Auteuil',
      zona: 'Laval Nord',
      responsable: 'Geneviève Leduc',
      beneficiarios: 130,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '15:00',
      personasServidas: 130,
      cantidadColaciones: 35,
      cantidadAlmuerzos: 90,
      porcentajeReparticion: 16,
      notas: `${DEMO_MARKER} Organisme additionnel pour tester des listes étendues dans la liaison`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Geneviève Leduc',
          email: 'genevieve.leduc@demo.qa.local',
          cargo: 'Responsable communautaire',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'PM' },
            { jour: 'Vendredi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'AUTEUIL2026',
    },
    {
      nombre: 'Partage Alimentaire Duvernay',
      tipo: 'Aide alimentaire',
      email: 'duvernay.partage@demo.qa.local',
      telefono: '(450) 555-4108',
      direccion: '608 Boulevard de la Concorde Est, Laval',
      codigoPostal: 'H7G 2E1',
      quartier: 'Duvernay',
      zona: 'Laval Est',
      responsable: 'François Lapierre',
      beneficiarios: 98,
      activo: true,
      regular: true,
      participantePRS: true,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '08:15',
      personasServidas: 98,
      cantidadColaciones: 90,
      cantidadAlmuerzos: 24,
      porcentajeReparticion: 11,
      notas: `${DEMO_MARKER} Organisme PRS supplémentaire pour tester le mélange entre réguliers et PRS`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'François Lapierre',
          email: 'francois.lapierre@demo.qa.local',
          cargo: 'Coordination terrain',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'AM' },
            { jour: 'Jeudi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'DUVERNAYPRS2026',
    },
    {
      nombre: 'Centre Entraide Chomedey',
      tipo: 'Soutien communautaire',
      email: 'entraide.chomedey@demo.qa.local',
      telefono: '(450) 555-4109',
      direccion: '1025 Boulevard Curé-Labelle, Laval',
      codigoPostal: 'H7V 2V4',
      quartier: 'Chomedey',
      zona: 'Laval Centre',
      responsable: 'Salma Idrissi',
      beneficiarios: 155,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Bi-hebdomadaire',
      horaCita: '12:45',
      personasServidas: 155,
      cantidadColaciones: 75,
      cantidadAlmuerzos: 52,
      porcentajeReparticion: 17,
      notas: `${DEMO_MARKER} Organisme de taille moyenne pour tester l'ordre, les filtres et la distribution`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Salma Idrissi',
          email: 'salma.idrissi@demo.qa.local',
          cargo: 'Coordination',
          idiomas: ['fr', 'ar'],
          joursDisponibles: [
            { jour: 'Mercredi', horaire: 'AM' },
            { jour: 'Vendredi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'CHOMEDEY2026',
    },
    {
      nombre: 'Maison Solidarité Pont-Viau',
      tipo: 'Centre de services',
      email: 'pontviau.solidarite@demo.qa.local',
      telefono: '(450) 555-4110',
      direccion: '410 Rue de Normandie, Laval',
      codigoPostal: 'H7G 3P4',
      quartier: 'Pont-Viau',
      zona: 'Laval Est',
      responsable: 'Rachid Benkirane',
      beneficiarios: 72,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Mensuelle',
      horaCita: '09:30',
      personasServidas: 72,
      cantidadColaciones: 20,
      cantidadAlmuerzos: 35,
      porcentajeReparticion: 7,
      notas: `${DEMO_MARKER} Petit organisme pour tester des combinaisons de faibles pourcentages`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Rachid Benkirane',
          email: 'rachid.benkirane@demo.qa.local',
          cargo: 'Intervenant principal',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Jeudi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'PONTVIAU2026',
    },
    {
      nombre: 'Projet Nourrir Laval-Ouest',
      tipo: 'Programme de quartier',
      email: 'nourrir.ouest@demo.qa.local',
      telefono: '(450) 555-4111',
      direccion: "880 Autoroute 13, voie de service, Laval",
      codigoPostal: 'H7X 4C9',
      quartier: 'Sainte-Dorothée',
      zona: 'Laval Ouest',
      responsable: 'Annie Gervais',
      beneficiarios: 118,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '16:15',
      personasServidas: 118,
      cantidadColaciones: 46,
      cantidadAlmuerzos: 66,
      porcentajeReparticion: 13,
      notas: `${DEMO_MARKER} Organisme additionnel pour tester davantage de destinations en transport`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Annie Gervais',
          email: 'annie.gervais@demo.qa.local',
          cargo: 'Gestion de programme',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'NOURRIROUEST2026',
    },
    {
      nombre: 'Alliance Repas Laval-Nord',
      tipo: 'Soutien alimentaire',
      email: 'alliance.nord@demo.qa.local',
      telefono: '(450) 555-4112',
      direccion: '2300 Boulevard des Laurentides, Laval',
      codigoPostal: 'H7K 2J5',
      quartier: 'Vimont',
      zona: 'Laval Nord',
      responsable: 'Isabelle Therrien',
      beneficiarios: 142,
      activo: true,
      regular: false,
      participantePRS: false,
      frecuenciaCita: 'Sur demande',
      horaCita: '10:00',
      personasServidas: 142,
      cantidadColaciones: 62,
      cantidadAlmuerzos: 44,
      porcentajeReparticion: 9,
      notas: `${DEMO_MARKER} Organisme actif non régulier pour élargir les scénarios de filtrage`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Isabelle Therrien',
          email: 'isabelle.therrien@demo.qa.local',
          cargo: 'Coordination regionale',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'AM' },
            { jour: 'Vendredi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'ALLIANCENORD2026',
    },
    {
      nombre: 'Carrefour Fraternel Laval',
      tipo: 'Centre communautaire',
      email: 'carrefour.fraternel@demo.qa.local',
      telefono: '(450) 555-4113',
      direccion: '145 Rue de Verdun, Laval',
      codigoPostal: 'H7N 1M8',
      quartier: 'Laval-des-Rapides',
      zona: 'Laval Centre',
      responsable: 'Hélène Caron',
      beneficiarios: 126,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '09:45',
      personasServidas: 126,
      cantidadColaciones: 58,
      cantidadAlmuerzos: 48,
      porcentajeReparticion: 15,
      notas: `${DEMO_MARKER} Organisme supplémentaire pour tester des listes plus étendues`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Hélène Caron',
          email: 'helene.caron@demo.qa.local',
          cargo: 'Direction',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'AM' },
            { jour: 'Jeudi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'CARREFOUR2026',
    },
    {
      nombre: 'Espace Repas Concorde',
      tipo: 'Aide alimentaire',
      email: 'repas.concorde@demo.qa.local',
      telefono: '(450) 555-4114',
      direccion: '725 Boulevard de la Concorde Ouest, Laval',
      codigoPostal: 'H7N 5J3',
      quartier: 'Chomedey',
      zona: 'Laval Centre',
      responsable: 'Michel Tremblay',
      beneficiarios: 88,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Mensuelle',
      horaCita: '13:15',
      personasServidas: 88,
      cantidadColaciones: 42,
      cantidadAlmuerzos: 22,
      porcentajeReparticion: 8,
      notas: `${DEMO_MARKER} Organisme supplémentaire pour des tests de faible répartition`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Michel Tremblay',
          email: 'michel.tremblay@demo.qa.local',
          cargo: 'Coordination',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mercredi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'CONCORDE2026',
    },
    {
      nombre: 'Maison des Aines Duvernay',
      tipo: 'Soutien communautaire',
      email: 'aines.duvernay@demo.qa.local',
      telefono: '(450) 555-4115',
      direccion: '3900 Boulevard Lévesque Est, Laval',
      codigoPostal: 'H7E 2R1',
      quartier: 'Duvernay',
      zona: 'Laval Est',
      responsable: 'Louise St-Pierre',
      beneficiarios: 74,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Bi-hebdomadaire',
      horaCita: '11:00',
      personasServidas: 74,
      cantidadColaciones: 30,
      cantidadAlmuerzos: 28,
      porcentajeReparticion: 7,
      notas: `${DEMO_MARKER} Organisme pour tester organismes de taille réduite`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Louise St-Pierre',
          email: 'louise.stpierre@demo.qa.local',
          cargo: 'Intervenante principale',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'AINESDUV2026',
    },
    {
      nombre: 'Halte Partage Auteuil',
      tipo: 'Programme de quartier',
      email: 'halte.auteuil@demo.qa.local',
      telefono: '(450) 555-4116',
      direccion: '910 Rue d Amay, Laval',
      codigoPostal: 'H7H 2S6',
      quartier: 'Auteuil',
      zona: 'Laval Nord',
      responsable: 'Yanis Mebarki',
      beneficiarios: 101,
      activo: true,
      regular: true,
      participantePRS: true,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '15:30',
      personasServidas: 101,
      cantidadColaciones: 86,
      cantidadAlmuerzos: 16,
      porcentajeReparticion: 9,
      notas: `${DEMO_MARKER} Organisme PRS additionnel pour élargir les scénarios`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Yanis Mebarki',
          email: 'yanis.mebarki@demo.qa.local',
          cargo: 'Coordination jeunesse',
          idiomas: ['fr', 'ar'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'PM' },
            { jour: 'Vendredi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'HALTEAUTEUIL2026',
    },
    {
      nombre: 'Point Solidaire Fabreville',
      tipo: 'Centre de services',
      email: 'point.fabreville@demo.qa.local',
      telefono: '(450) 555-4117',
      direccion: '1195 Boulevard Dagenais Est, Laval',
      codigoPostal: 'H7L 3M7',
      quartier: 'Fabreville',
      zona: 'Laval Ouest',
      responsable: 'Thierry Gauthier',
      beneficiarios: 134,
      activo: true,
      regular: false,
      participantePRS: false,
      frecuenciaCita: 'Sur demande',
      horaCita: '08:30',
      personasServidas: 134,
      cantidadColaciones: 44,
      cantidadAlmuerzos: 39,
      porcentajeReparticion: 5,
      notas: `${DEMO_MARKER} Organisme actif non régulier supplémentaire pour filtres`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Thierry Gauthier',
          email: 'thierry.gauthier@demo.qa.local',
          cargo: 'Responsable local',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Jeudi', horaire: 'AM/PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'POINTFAB2026',
    },
    {
      nombre: 'Maison Nourrir Pont-Viau',
      tipo: 'Aide alimentaire',
      email: 'nourrir.pontviau@demo.qa.local',
      telefono: '(450) 555-4118',
      direccion: '220 Boulevard des Laurentides, Laval',
      codigoPostal: 'H7G 2T1',
      quartier: 'Pont-Viau',
      zona: 'Laval Est',
      responsable: 'Samira El Moutaouakkil',
      beneficiarios: 149,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Hebdomadaire',
      horaCita: '14:30',
      personasServidas: 149,
      cantidadColaciones: 64,
      cantidadAlmuerzos: 50,
      porcentajeReparticion: 14,
      notas: `${DEMO_MARKER} Organisme de soutien pour augmenter la base de destinations`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Samira El Moutaouakkil',
          email: 'samira.elmoutaouakkil@demo.qa.local',
          cargo: 'Direction communautaire',
          idiomas: ['fr', 'ar'],
          joursDisponibles: [
            { jour: 'Lundi', horaire: 'PM' },
            { jour: 'Jeudi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'NOURRIRPV2026',
    },
    {
      nombre: 'Relais Familles Chomedey-Sud',
      tipo: 'Centre communautaire',
      email: 'relais.chomedeysud@demo.qa.local',
      telefono: '(450) 555-4119',
      direccion: '1560 Boulevard Curé-Labelle, Laval',
      codigoPostal: 'H7V 2W3',
      quartier: 'Chomedey',
      zona: 'Laval Centre',
      responsable: 'Marjorie Pelletier',
      beneficiarios: 112,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Bi-hebdomadaire',
      horaCita: '10:45',
      personasServidas: 112,
      cantidadColaciones: 53,
      cantidadAlmuerzos: 33,
      porcentajeReparticion: 10,
      notas: `${DEMO_MARKER} Organisme communautaire supplémentaire pour élargir le pool QA`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Marjorie Pelletier',
          email: 'marjorie.pelletier@demo.qa.local',
          cargo: 'Coordination familles',
          idiomas: ['fr'],
          joursDisponibles: [
            { jour: 'Mercredi', horaire: 'AM' },
            { jour: 'Vendredi', horaire: 'PM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'CHOMSUD2026',
    },
    {
      nombre: 'Initiative Repas Sainte-Rose',
      tipo: 'Programme de quartier',
      email: 'repas.sterose@demo.qa.local',
      telefono: '(450) 555-4120',
      direccion: '315 Boulevard Sainte-Rose, Laval',
      codigoPostal: 'H7L 1M3',
      quartier: 'Auteuil',
      zona: 'Laval Nord',
      responsable: 'Pascal Morin',
      beneficiarios: 93,
      activo: true,
      regular: true,
      participantePRS: false,
      frecuenciaCita: 'Mensuelle',
      horaCita: '12:00',
      personasServidas: 93,
      cantidadColaciones: 38,
      cantidadAlmuerzos: 24,
      porcentajeReparticion: 6,
      notas: `${DEMO_MARKER} Organisme additionnel pour atteindre 20 destinations QA`,
      notificaciones: true,
      contactosNotificacion: [
        {
          nombre: 'Pascal Morin',
          email: 'pascal.morin@demo.qa.local',
          cargo: 'Responsable de secteur',
          idiomas: ['fr', 'en'],
          joursDisponibles: [
            { jour: 'Mardi', horaire: 'AM' },
          ],
        },
      ],
      logo: null,
      documentoPDF: null,
      claveAcceso: 'STEROSE2026',
    },
  ];

  organismosDemo
    .slice(0, Math.max(0, Math.min(cantidades.organismos, organismosDemo.length)))
    .forEach((organismo) => {
      crearOrganismo(organismo);
    });

  const organismosRecrutementDemo: Array<Parameters<typeof guardarOrganismoRecrutement>[0]> = [
    {
      id: 'QA-DEMO-REC-ORG-001',
      nombre: 'Maison Relance Jeunesse Laval',
      tipo: 'Programme jeunesse',
      email: 'relance.jeunesse@demo.qa.local',
      telefono: '(450) 555-6101',
      direccion: '210 Rue des Érables, Laval',
      codigoPostal: 'H7N 2P4',
      quartier: 'Chomedey',
      responsable: 'Myriam Saad',
      beneficiarios: 42,
      activo: true,
      regular: true,
      clasificacionOrganismo: 'regular',
      participantePRS: false,
      personasServidas: 42,
      cantidadColaciones: 18,
      cantidadAlmuerzos: 12,
      porcentajeReparticion: 8,
      notas: `${DEMO_MARKER} Organisme recrutement pour tester les assignations bénévoles externes`,
      notificaciones: true,
      logo: null,
      documentosPDF: [],
      documentoPDF: null,
      contactosNotificacion: [
        {
          nombre: 'Myriam Saad',
          email: 'myriam.saad@demo.qa.local',
          cargo: 'Coordination recrutement',
          joursDisponibles: [{ jour: 'Lundi', horaire: 'AM/PM' }],
          idiomas: ['fr', 'ar'],
        },
      ],
      contactoCargo: 'Coordination recrutement',
      contactoTelefono: '(450) 555-6101',
      contactoCellulaire: '(514) 555-7101',
      contactoEmail: 'myriam.saad@demo.qa.local',
      contactoJoursDisponibles: [{ jour: 'Lundi', horaire: 'AM/PM' }],
      frecuenciaCita: 'Mensuelle',
      diaCita: 'Lundi',
      horaCita: '09:00',
      fechaInicioInactividad: undefined,
      fechaFinInactividad: undefined,
      claveAcceso: undefined,
      zona: 'Laval Centre',
    },
    {
      id: 'QA-DEMO-REC-ORG-002',
      nombre: 'Centre Horizons Carrière',
      tipo: 'Insertion professionnelle',
      email: 'horizons.carriere@demo.qa.local',
      telefono: '(450) 555-6102',
      direccion: '88 Boulevard Cartier Ouest, Laval',
      codigoPostal: 'H7N 5A4',
      quartier: 'Pont-Viau',
      responsable: 'Julien Tremblay',
      beneficiarios: 37,
      activo: true,
      regular: true,
      clasificacionOrganismo: 'regular',
      participantePRS: false,
      personasServidas: 37,
      cantidadColaciones: 10,
      cantidadAlmuerzos: 6,
      porcentajeReparticion: 6,
      notas: `${DEMO_MARKER} Organisme recrutement orienté mentorat et intégration externe`,
      notificaciones: true,
      logo: null,
      documentosPDF: [],
      documentoPDF: null,
      contactosNotificacion: [
        {
          nombre: 'Julien Tremblay',
          email: 'julien.tremblay@demo.qa.local',
          cargo: 'Responsable partenariats',
          joursDisponibles: [{ jour: 'Mercredi', horaire: 'PM' }],
          idiomas: ['fr', 'en'],
        },
      ],
      contactoCargo: 'Responsable partenariats',
      contactoTelefono: '(450) 555-6102',
      contactoCellulaire: '(514) 555-7102',
      contactoEmail: 'julien.tremblay@demo.qa.local',
      contactoJoursDisponibles: [{ jour: 'Mercredi', horaire: 'PM' }],
      frecuenciaCita: 'Bi-hebdomadaire',
      diaCita: 'Mercredi',
      horaCita: '13:30',
      fechaInicioInactividad: undefined,
      fechaFinInactividad: undefined,
      claveAcceso: undefined,
      zona: 'Laval Est',
    },
    {
      id: 'QA-DEMO-REC-ORG-003',
      nombre: 'Passerelle Femmes Laval',
      tipo: 'Soutien communautaire',
      email: 'passerelle.femmes@demo.qa.local',
      telefono: '(450) 555-6103',
      direccion: '540 Avenue Ampère, Laval',
      codigoPostal: 'H7N 6E2',
      quartier: 'Laval-des-Rapides',
      responsable: 'Sonia El Idrissi',
      beneficiarios: 29,
      activo: true,
      regular: true,
      clasificacionOrganismo: 'regular',
      participantePRS: false,
      personasServidas: 29,
      cantidadColaciones: 14,
      cantidadAlmuerzos: 8,
      porcentajeReparticion: 5,
      notas: `${DEMO_MARKER} Organisme recrutement pour scénarios de bénévolat externe spécialisé`,
      notificaciones: true,
      logo: null,
      documentosPDF: [],
      documentoPDF: null,
      contactosNotificacion: [
        {
          nombre: 'Sonia El Idrissi',
          email: 'sonia.elidrissi@demo.qa.local',
          cargo: 'Coordination terrain',
          joursDisponibles: [{ jour: 'Jeudi', horaire: 'AM' }],
          idiomas: ['fr', 'ar'],
        },
      ],
      contactoCargo: 'Coordination terrain',
      contactoTelefono: '(450) 555-6103',
      contactoCellulaire: '(514) 555-7103',
      contactoEmail: 'sonia.elidrissi@demo.qa.local',
      contactoJoursDisponibles: [{ jour: 'Jeudi', horaire: 'AM' }],
      frecuenciaCita: 'Hebdomadaire',
      diaCita: 'Jeudi',
      horaCita: '10:00',
      fechaInicioInactividad: undefined,
      fechaFinInactividad: undefined,
      claveAcceso: undefined,
      zona: 'Laval Centre',
    },
    {
      id: 'QA-DEMO-REC-ORG-004',
      nombre: 'Réseau Aînés Solidaires Vimont',
      tipo: 'Accompagnement aînés',
      email: 'aines.vimont@demo.qa.local',
      telefono: '(450) 555-6104',
      direccion: '125 Rue de la Concorde, Laval',
      codigoPostal: 'H7K 1M8',
      quartier: 'Vimont',
      responsable: 'Claire Morissette',
      beneficiarios: 33,
      activo: true,
      regular: true,
      clasificacionOrganismo: 'regular',
      participantePRS: false,
      personasServidas: 33,
      cantidadColaciones: 9,
      cantidadAlmuerzos: 5,
      porcentajeReparticion: 4,
      notas: `${DEMO_MARKER} Organisme recrutement pour affectations bénévoles auprès des aînés`,
      notificaciones: true,
      logo: null,
      documentosPDF: [],
      documentoPDF: null,
      contactosNotificacion: [
        {
          nombre: 'Claire Morissette',
          email: 'claire.morissette@demo.qa.local',
          cargo: 'Responsable accompagnement',
          joursDisponibles: [{ jour: 'Vendredi', horaire: 'AM/PM' }],
          idiomas: ['fr'],
        },
      ],
      contactoCargo: 'Responsable accompagnement',
      contactoTelefono: '(450) 555-6104',
      contactoCellulaire: '(514) 555-7104',
      contactoEmail: 'claire.morissette@demo.qa.local',
      contactoJoursDisponibles: [{ jour: 'Vendredi', horaire: 'AM/PM' }],
      frecuenciaCita: 'Mensuelle',
      diaCita: 'Vendredi',
      horaCita: '11:00',
      fechaInicioInactividad: undefined,
      fechaFinInactividad: undefined,
      claveAcceso: undefined,
      zona: 'Laval Nord',
    },
  ];

  organismosRecrutementDemo
    .slice(0, Math.max(0, Math.min(cantidades.organismosRecrutement, organismosRecrutementDemo.length)))
    .forEach((organismo) => {
      guardarOrganismoRecrutement(organismo);
    });

  for (
    let indice = organismosRecrutementDemo.length;
    indice < cantidades.organismosRecrutement;
    indice += 1
  ) {
    guardarOrganismoRecrutement(crearOrganismoRecrutementDemoExtra(indice));
  }

  let camionSeco: Vehiculo | null = null;
  if (cantidades.camiones > 0) {
    camionSeco = crearVehiculo({
      matricula: 'QA-DEMO-CAM-001',
      placa: 'QA-DEMO-CAM-001',
      tipo: 'camion',
      marca: 'Isuzu',
      modelo: 'NPR HD',
      capacidadKg: 3500,
      capacidadM3: 18,
      estado: 'disponible',
      estadoUI: 'disponible',
      activo: true,
      observaciones: `${DEMO_MARKER} Camion sec pour les livraisons générales`,
      notas: `${DEMO_MARKER} Camion sec pour les livraisons générales`,
      ultimoMantenimiento: '2026-03-15',
      proximoMantenimiento: '2026-09-15',
      kmActual: 48210,
      kilometraje: 48210,
      conductorAsignado: '',
      anio: 2021,
      consumoCombustible: 14.5,
    }) || null;
  }

  let camionFrio: Vehiculo | null = null;
  if (cantidades.camiones > 1) {
    camionFrio = crearVehiculo({
      matricula: 'QA-DEMO-REF-002',
      placa: 'QA-DEMO-REF-002',
      tipo: 'refrigerado',
      marca: 'Mercedes-Benz',
      modelo: 'Sprinter ColdVan',
      capacidadKg: 1800,
      capacidadM3: 11,
      estado: 'disponible',
      estadoUI: 'disponible',
      activo: true,
      observaciones: `${DEMO_MARKER} Camion réfrigéré pour les produits laitiers et surgelés`,
      notas: `${DEMO_MARKER} Camion réfrigéré pour les produits laitiers et surgelés`,
      ultimoMantenimiento: '2026-02-28',
      proximoMantenimiento: '2026-08-28',
      kmActual: 26140,
      kilometraje: 26140,
      conductorAsignado: '',
      anio: 2022,
      consumoCombustible: 11.2,
    }) || null;
  }

  const vehiculosDemo = obtenerVehiculos().filter(esVehiculoDemo);
  for (let indice = vehiculosDemo.length; indice < cantidades.camiones; indice += 1) {
    crearVehiculo(crearVehiculoDemoExtra(indice));
  }

  const vehiculosDemoActuales = obtenerVehiculos().filter(esVehiculoDemo);

  let choferPrincipal: Chofer | null = null;
  if (cantidades.chauffeurs > 0) {
    choferPrincipal = crearChofer({
      nombre: 'Marc',
      apellido: 'Tremblay',
      cedula: 'QA-DEMO-CH-001',
      licencia: 'QA-DEMO-LIC-001',
      tipoLicencia: 'Classe 3',
      telefono: '(514) 555-5101',
      email: 'marc.tremblay@demo.qa.local',
      fechaNacimiento: '1988-07-12',
      fechaContratacion: '2024-09-01',
      estado: 'activo',
      vehiculoAsignado: camionSeco?.id || '',
      experienciaAnios: 6,
      certificaciones: ['Livraison alimentaire', 'Chaine du froid'],
      foto: '👨‍✈️',
      joursDisponibles: [
        { jour: 'Lundi', horaire: 'AM/PM' },
        { jour: 'Mardi', horaire: 'AM/PM' },
        { jour: 'Jeudi', horaire: 'AM' },
      ],
    }) || null;
  }

  if (cantidades.chauffeurs > 1) {
    crearChofer({
      nombre: 'Sara',
      apellido: 'Nguyen',
      cedula: 'QA-DEMO-CH-002',
      licencia: 'QA-DEMO-LIC-002',
      tipoLicencia: 'Classe 5',
      telefono: '(514) 555-5102',
      email: 'sara.nguyen@demo.qa.local',
      fechaNacimiento: '1992-11-03',
      fechaContratacion: '2025-01-15',
      estado: 'activo',
      vehiculoAsignado: camionFrio?.id || '',
      experienciaAnios: 4,
      certificaciones: ['Livraison urbaine'],
      foto: '👩‍✈️',
      joursDisponibles: [
        { jour: 'Mercredi', horaire: 'AM/PM' },
        { jour: 'Vendredi', horaire: 'AM/PM' },
      ],
    });
  }

  const choferesDemo = obtenerChoferes().filter(esChoferDemo);
  for (let indice = choferesDemo.length; indice < cantidades.chauffeurs; indice += 1) {
    crearChofer(crearChoferDemoExtra(indice, vehiculosDemoActuales));
  }

  if (camionSeco && choferPrincipal) {
    camionSeco.conductorAsignado = choferPrincipal.id;
  }

  const organismosDashboard = obtenerOrganismos().filter(esOrganismoDemo);
  const organismoPrincipal = organismosDashboard.find((organismo) => organismo.nombre.includes('Horizon')) || organismosDashboard[0];
  const organismoSecundario = organismosDashboard.find((organismo) => organismo.nombre.includes('Soleil')) || organismosDashboard[1] || organismoPrincipal;

  const productosDashboard: ProductoCreado[] = [
    {
      id: 'QA-DEMO-PROD-001',
      codigo: 'QA-DEMO-POM',
      nombre: 'Pommes',
      categoria: 'Fruits',
      subcategoria: 'Frais',
      unidad: 'kg',
      icono: '🍎',
      peso: 120,
      pesoUnitario: 1,
      pesoRegistrado: 120,
      stockActual: 120,
      stockMinimo: 30,
      ubicacion: 'Zone A1',
      lote: `${DEMO_MARKER} LOT-POM-001`,
      fechaVencimiento: '2026-05-20',
      esPRS: false,
      activo: true,
      fechaCreacion: '2026-04-23T08:00:00.000Z',
      temperatura: 'ambiente',
      temperaturaAlmacenamiento: 'seco',
      valorUnitario: 2,
      valorTotal: 240,
    },
    {
      id: 'QA-DEMO-PROD-002',
      codigo: 'QA-DEMO-RIZ',
      nombre: 'Riz',
      categoria: 'Épicerie',
      subcategoria: 'Sec',
      unidad: 'kg',
      icono: '🍚',
      peso: 80,
      pesoUnitario: 1,
      pesoRegistrado: 80,
      stockActual: 80,
      stockMinimo: 25,
      ubicacion: 'Zone B2',
      lote: `${DEMO_MARKER} LOT-RIZ-001`,
      fechaVencimiento: '2026-08-15',
      esPRS: false,
      activo: true,
      fechaCreacion: '2026-04-24T08:00:00.000Z',
      temperatura: 'ambiente',
      temperaturaAlmacenamiento: 'seco',
      valorUnitario: 2,
      valorTotal: 160,
    },
    {
      id: 'QA-DEMO-PROD-003',
      codigo: 'QA-DEMO-LAIT',
      nombre: 'Lait',
      categoria: 'Produits laitiers',
      subcategoria: 'Réfrigéré',
      unidad: 'l',
      icono: '🥛',
      peso: 18,
      pesoUnitario: 1,
      pesoRegistrado: 18,
      stockActual: 18,
      stockMinimo: 20,
      ubicacion: 'Chambre froide 1',
      lote: `${DEMO_MARKER} LOT-LAIT-001`,
      fechaVencimiento: '2026-05-05',
      esPRS: false,
      activo: true,
      fechaCreacion: '2026-04-25T08:00:00.000Z',
      temperatura: 'refrigerado',
      temperaturaAlmacenamiento: 'refrigerado',
      valorUnitario: 10.6666666667,
      valorTotal: 192,
    },
  ];

  productosDashboard.forEach((producto) => {
    guardarProducto(producto);
  });

  if (organismoPrincipal && organismoSecundario) {
    const comandasDemo: Comanda[] = [
      {
        id: 'QA-DEMO-CMD-001',
        numero: 'QA-DEMO-CMD-001',
        numeroComanda: 'QA-DEMO-CMD-001',
        organismoId: organismoPrincipal.id,
        nombreOrganismo: organismoPrincipal.nombre,
        fecha: '2026-04-29T08:30:00.000Z',
        fechaEntrega: '2026-04-29T11:00:00.000Z',
        estado: 'pendiente',
        prioridad: 'urgente',
        tipo: 'urgente',
        fechaCreacion: '2026-04-29T08:30:00.000Z',
        creadoPor: 'qa-demo',
        observaciones: `${DEMO_MARKER} Comanda active pour valider les KPI et les routes du tableau de bord`,
        items: [
          {
            productoId: 'QA-DEMO-PROD-001',
            nombreProducto: 'Pommes',
            productoNombre: 'Pommes',
            cantidad: 12,
            unidad: 'kg',
            icono: '🍎',
            peso: 12,
            valorUnitario: 2,
            temperatura: 'ambiente',
            temperaturaOriginalEntrada: 'ambiente',
          },
          {
            productoId: 'QA-DEMO-PROD-003',
            nombreProducto: 'Lait',
            productoNombre: 'Lait',
            cantidad: 8,
            unidad: 'l',
            icono: '🥛',
            peso: 8,
            valorUnitario: 10.6666666667,
            temperatura: 'refrigerado',
            temperaturaOriginalEntrada: 'refrigerado',
          },
        ],
      },
      {
        id: 'QA-DEMO-CMD-002',
        numero: 'QA-DEMO-CMD-002',
        numeroComanda: 'QA-DEMO-CMD-002',
        organismoId: organismoSecundario.id,
        nombreOrganismo: organismoSecundario.nombre,
        fecha: '2026-04-27T09:15:00.000Z',
        fechaEntrega: '2026-04-27T13:00:00.000Z',
        estado: 'completada',
        prioridad: 'normal',
        tipo: 'standard',
        fechaCreacion: '2026-04-27T09:15:00.000Z',
        creadoPor: 'qa-demo',
        observaciones: `${DEMO_MARKER} Comanda complétée pour la tendance mensuelle`,
        items: [
          {
            productoId: 'QA-DEMO-PROD-002',
            nombreProducto: 'Riz',
            productoNombre: 'Riz',
            cantidad: 15,
            unidad: 'kg',
            icono: '🍚',
            peso: 15,
            valorUnitario: 2,
            temperatura: 'ambiente',
            temperaturaOriginalEntrada: 'ambiente',
          },
        ],
      },
      {
        id: 'QA-DEMO-CMD-003',
        numero: 'QA-DEMO-CMD-003',
        numeroComanda: 'QA-DEMO-CMD-003',
        organismoId: organismoPrincipal.id,
        nombreOrganismo: organismoPrincipal.nombre,
        fecha: '2026-04-24T10:00:00.000Z',
        fechaEntrega: '2026-04-24T14:30:00.000Z',
        estado: 'entregada',
        prioridad: 'normal',
        tipo: 'standard',
        fechaCreacion: '2026-04-24T10:00:00.000Z',
        creadoPor: 'qa-demo',
        observaciones: `${DEMO_MARKER} Comanda livrée pour les métriques prédictives`,
        items: [
          {
            productoId: 'QA-DEMO-PROD-001',
            nombreProducto: 'Pommes',
            productoNombre: 'Pommes',
            cantidad: 10,
            unidad: 'kg',
            icono: '🍎',
            peso: 10,
            valorUnitario: 2,
            temperatura: 'ambiente',
            temperaturaOriginalEntrada: 'ambiente',
          },
          {
            productoId: 'QA-DEMO-PROD-002',
            nombreProducto: 'Riz',
            productoNombre: 'Riz',
            cantidad: 5,
            unidad: 'kg',
            icono: '🍚',
            peso: 5,
            valorUnitario: 2,
            temperatura: 'ambiente',
            temperaturaOriginalEntrada: 'ambiente',
          },
        ],
      },
    ];

    comandasDemo.forEach((comanda) => {
      guardarComanda(comanda);
    });

    const movimientosDemo: MovimientoExtendido[] = [
      {
        id: 'QA-DEMO-MOV-001',
        tipo: 'entrada',
        productoId: 'QA-DEMO-PROD-001',
        cantidad: 45,
        motivo: `${DEMO_MARKER} Entrée de pommes`,
        usuario: 'qa-demo',
        documentoReferencia: 'QA-DEMO-MOV-001',
        cantidadAnterior: 75,
        cantidadActual: 120,
        fecha: '2026-04-23T08:00:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-002',
        tipo: 'entrada',
        productoId: 'QA-DEMO-PROD-002',
        cantidad: 30,
        motivo: `${DEMO_MARKER} Entrée de riz`,
        usuario: 'qa-demo',
        documentoReferencia: 'QA-DEMO-MOV-002',
        cantidadAnterior: 50,
        cantidadActual: 80,
        fecha: '2026-04-24T08:15:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-003',
        tipo: 'entrada',
        productoId: 'QA-DEMO-PROD-003',
        cantidad: 18,
        motivo: `${DEMO_MARKER} Entrée de lait`,
        usuario: 'qa-demo',
        documentoReferencia: 'QA-DEMO-MOV-003',
        cantidadAnterior: 0,
        cantidadActual: 18,
        fecha: '2026-04-25T08:30:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-004',
        tipo: 'distribucion',
        productoId: 'QA-DEMO-PROD-001',
        cantidad: 12,
        motivo: `${DEMO_MARKER} Réservation pour comanda active`,
        usuario: 'qa-demo',
        organismoId: organismoPrincipal.id,
        organismoNombre: organismoPrincipal.nombre,
        numeroComanda: 'QA-DEMO-CMD-001',
        documentoReferencia: 'QA-DEMO-CMD-001',
        cantidadAnterior: 120,
        cantidadActual: 108,
        fecha: '2026-04-26T09:00:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-005',
        tipo: 'distribucion_completada',
        productoId: 'QA-DEMO-PROD-002',
        cantidad: 15,
        motivo: `${DEMO_MARKER} Livraison complétée`,
        usuario: 'qa-demo',
        organismoId: organismoSecundario.id,
        organismoNombre: organismoSecundario.nombre,
        numeroComanda: 'QA-DEMO-CMD-002',
        documentoReferencia: 'QA-DEMO-CMD-002',
        cantidadAnterior: 95,
        cantidadActual: 80,
        fecha: '2026-04-27T13:00:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-006',
        tipo: 'salida',
        productoId: 'QA-DEMO-PROD-003',
        cantidad: 8,
        motivo: `${DEMO_MARKER} Sortie vers organisme`,
        usuario: 'qa-demo',
        documentoReferencia: 'QA-DEMO-CMD-001',
        cantidadAnterior: 26,
        cantidadActual: 18,
        fecha: '2026-04-28T11:30:00.000Z',
      },
      {
        id: 'QA-DEMO-MOV-007',
        tipo: 'entrada',
        productoId: 'QA-DEMO-PROD-001',
        cantidad: 10,
        motivo: `${DEMO_MARKER} Ajustement d'inventaire`,
        usuario: 'qa-demo',
        documentoReferencia: 'QA-DEMO-MOV-007',
        cantidadAnterior: 110,
        cantidadActual: 120,
        fecha: '2026-04-29T07:45:00.000Z',
      },
    ];

    guardarMovimientosDemo(movimientosDemo);

    const rutasDemo: Ruta[] = [
      {
        id: 'QA-DEMO-RUTA-001',
        numero: 'QA-DEMO-RUTA-001',
        destino: organismoPrincipal.nombre,
        conductor: camionSeco ? 'Marc Tremblay' : '',
        vehiculo: camionSeco?.matricula || '',
        fecha: '2026-04-29',
        horaInicio: '10:30',
        horaFin: '12:00',
        estado: 'planificada',
        comandas: ['QA-DEMO-CMD-001'],
        distancia: 12,
        observaciones: `${DEMO_MARKER} Route démo pour le tableau de bord`,
        fechaCreacion: '2026-04-29T08:45:00.000Z',
      },
    ];

    guardarRutas([...obtenerRutas().filter((ruta) => !esRutaDemo(ruta)), ...rutasDemo]);
  }

  const resumen = resumirEjemplos();

  if (!opciones?.silent) {
    imprimirResumen('Ejemplos sembrados', resumen);
    toast.success('Ejemplos funcionales listos para pruebas');
  }

  return resumen;
}

export function sembrarEjemplosComptoir(
  cantidadComptoir = CANTIDADES_EJEMPLOS_POR_DEFECTO.comptoir,
  opciones?: { silent?: boolean }
): ResumenEjemplos {
  inicializarDepartamentos();

  const comptoirId = obtenerDepartamentoId('COMPTOIR', '2');
  const cantidadObjetivo = normalizarCantidadEjemplos(
    cantidadComptoir,
    CANTIDADES_EJEMPLOS_POR_DEFECTO.comptoir
  );

  ajustarColeccionDemo(
    obtenerContactosDepartamento().filter(
      (contacto) =>
        esContactoDemo(contacto) &&
        (
          contacto.departamentoId === comptoirId ||
          (Array.isArray(contacto.departamentoIds) && contacto.departamentoIds.includes(comptoirId))
        )
    ),
    cantidadObjetivo,
    eliminarContacto,
    (indice) => {
      guardarContacto(crearContactoComptoirDemoExtra(indice, comptoirId));
    }
  );

  ajustarBeneficiariosComptoirDemo(cantidadObjetivo);

  const resumen = resumirEjemplos();
  imprimirResumen('Exemples Comptoir actualisés', resumen);

  if (!opciones?.silent) {
    toast.success('Exemples Comptoir chargés');
  }

  return resumen;
}

export function verEjemplosFuncionalesPrueba(): ResumenEjemplos {
  const resumen = resumirEjemplos();
  imprimirResumen('Resumen actual', resumen);
  return resumen;
}

function contieneTextoDemoLegacy(texto?: string): boolean {
  return DEMO_TEXTO_LEGACY_REGEX.test(texto || '');
}

function contactoDemoTieneLegacy(contacto: ContactoDepartamento): boolean {
  return contieneTextoDemoLegacy(
    [contacto.nombreCompleto, contacto.nombre, contacto.notas].filter(Boolean).join(' | ')
  );
}

function organismoDemoTieneLegacy(organismo: Organismo): boolean {
  return contieneTextoDemoLegacy(
    [
      organismo.nombre,
      organismo.direccion,
      organismo.quartier,
      organismo.responsable,
      organismo.notas,
      ...(organismo.contactosNotificacion || []).flatMap((contacto) => [contacto.nombre, contacto.cargo]),
    ]
      .filter(Boolean)
      .join(' | ')
  );
}

function vehiculoDemoTieneLegacy(vehiculo: Vehiculo): boolean {
  return contieneTextoDemoLegacy([vehiculo.notas, vehiculo.observaciones].filter(Boolean).join(' | '));
}

function necesitaActualizarTextosDemoPersistidos(): boolean {
  return (
    obtenerContactosDepartamento().some(
      (contacto) => esContactoDemo(contacto) && contactoDemoTieneLegacy(contacto)
    ) ||
    obtenerOrganismos().some(
      (organismo) => esOrganismoDemo(organismo) && organismoDemoTieneLegacy(organismo)
    ) ||
    obtenerOrganismosRecrutement().some(
      (organismo) => esOrganismoRecrutementDemo(organismo) && organismoDemoTieneLegacy(organismo)
    ) ||
    obtenerVehiculos().some(
      (vehiculo) => esVehiculoDemo(vehiculo) && vehiculoDemoTieneLegacy(vehiculo)
    ) ||
    obtenerComandas().some(
      (comanda) => esComandaDemo(comanda) && contieneTextoDemoLegacy(comanda.observaciones)
    ) ||
    obtenerMovimientos().some(
      (movimiento) => esMovimientoDemo(movimiento) && contieneTextoDemoLegacy(movimiento.motivo)
    ) ||
    obtenerRutas().some(
      (ruta) => esRutaDemo(ruta) && contieneTextoDemoLegacy(ruta.observaciones)
    )
  );
}

function sincronizarTextosDemoPersistidosSiHaceFalta(): void {
  if (!necesitaActualizarTextosDemoPersistidos()) {
    return;
  }

  const cantidadOrganismosDemo = obtenerOrganismos().filter(esOrganismoDemo).length;
  const cantidadOrganismosRecrutementDemo = obtenerOrganismosRecrutement().filter(esOrganismoRecrutementDemo).length;
  sembrarEjemplosFuncionalesPrueba(
    cantidadOrganismosDemo > 0 ? cantidadOrganismosDemo : 12,
    {
      silent: true,
      cantidades: {
        organismosRecrutement: cantidadOrganismosRecrutementDemo > 0 ? cantidadOrganismosRecrutementDemo : CANTIDADES_EJEMPLOS_POR_DEFECTO.organismosRecrutement,
      },
    }
  );
}

if (typeof window !== 'undefined') {
  (window as any).sembrarEjemplosFuncionalesPrueba = sembrarEjemplosFuncionalesPrueba;
  (window as any).limpiarEjemplosFuncionalesPrueba = limpiarEjemplosFuncionalesPrueba;
  (window as any).verEjemplosFuncionalesPrueba = verEjemplosFuncionalesPrueba;
  sincronizarTextosDemoPersistidosSiHaceFalta();
}
