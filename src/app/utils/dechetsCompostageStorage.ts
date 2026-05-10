import { queueStorageSync } from './cloudPersistence';

const STORAGE_KEY = 'banco_alimentos_dechets_compostage';
const CATEGORIES_STORAGE_KEY = 'banco_alimentos_dechets_compostage_categories';
const TYPES_STORAGE_KEY = 'banco_alimentos_dechets_compostage_types';
export const DECHETS_COMPOSTAGE_EVENT = 'dechets-compostage-updated';

const DEFAULT_CATEGORIES_DECHETS = [
  'Denrées périmées',
  'Fruits et légumes abîmés',
  'Résidus organiques',
  'Produits non conformes',
  'Emballages souillés',
  'Carton humide',
  'Compostable mixte',
  'Autre',
] as const;

const DEFAULT_TYPES_DECHETS = [
  { id: 'dechet', label: 'Déchet', color: '#DC3545' },
  { id: 'compost', label: 'Compostage', color: '#2D9561' },
] as const;

const FALLBACK_TYPE_COLORS = ['#DC3545', '#2D9561', '#1E73BE', '#7C3AED', '#F59E0B', '#0F766E'] as const;

export type TypeDechetCompostage = string;

export interface OptionTypeDechetCompostage {
  id: string;
  label: string;
  color: string;
}

export interface RegistroDechetCompostage {
  id: string;
  fecha: string;
  tipo: TypeDechetCompostage;
  categorie: string;
  cantidadKg: number;
  destino?: string;
  notas?: string;
  createdAt: string;
}

type RegistroInput = Omit<RegistroDechetCompostage, 'id' | 'createdAt'>;

function normalizarNombreCategoria(value: string): string {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizarNombreTipo(value: string): string {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function generarIdTipo(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `type-${crypto.randomUUID()}`;
  }

  return `type-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizarColorTipo(value: unknown, fallbackIndex = 0): string {
  const color = String(value || '').trim();

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color.toUpperCase();
  }

  return FALLBACK_TYPE_COLORS[fallbackIndex % FALLBACK_TYPE_COLORS.length];
}

function normalizarCategorias(categorias: unknown): string[] {
  if (!Array.isArray(categorias)) {
    return [...DEFAULT_CATEGORIES_DECHETS];
  }

  const seen = new Set<string>();
  const resultado = categorias.reduce<string[]>((acc, categoria) => {
    const normalizada = normalizarNombreCategoria(categoria);
    const clave = normalizada.toLocaleLowerCase();

    if (!normalizada || seen.has(clave)) {
      return acc;
    }

    seen.add(clave);
    acc.push(normalizada);
    return acc;
  }, []);

  const categoriasFinales = resultado.length > 0 ? resultado : ['Autre'];

  return categoriasFinales.sort((left, right) => left.localeCompare(right, 'fr', { sensitivity: 'base' }));
}

function normalizarTipos(tipos: unknown): OptionTypeDechetCompostage[] {
  if (!Array.isArray(tipos)) {
    return DEFAULT_TYPES_DECHETS.map((tipo) => ({ ...tipo }));
  }

  const seen = new Set<string>();
  const resultado = tipos.reduce<OptionTypeDechetCompostage[]>((acc, tipo) => {
    const label = normalizarNombreTipo(typeof tipo === 'string' ? tipo : tipo?.label);
    const id = String(typeof tipo === 'string' ? '' : tipo?.id || '').trim() || generarIdTipo();
    const color = normalizarColorTipo(typeof tipo === 'string' ? '' : tipo?.color, acc.length);

    if (!label || seen.has(id)) {
      return acc;
    }

    seen.add(id);
    acc.push({ id, label, color });
    return acc;
  }, []);

  return resultado.length > 0 ? resultado : DEFAULT_TYPES_DECHETS.map((tipo) => ({ ...tipo }));
}

function emitirActualizacion(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(DECHETS_COMPOSTAGE_EVENT, {
    detail: { timestamp: Date.now() }
  }));
}

function generarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `dechet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizarRegistro(registro: Partial<RegistroDechetCompostage>): RegistroDechetCompostage | null {
  if (!registro.fecha || !registro.tipo) {
    return null;
  }

  const cantidadKg = Number(registro.cantidadKg || 0);
  if (!Number.isFinite(cantidadKg) || cantidadKg <= 0) {
    return null;
  }

  return {
    id: registro.id || generarId(),
    fecha: registro.fecha,
    tipo: String(registro.tipo).trim() || DEFAULT_TYPES_DECHETS[0].id,
    categorie: String(registro.categorie || '').trim() || 'Général',
    cantidadKg: Math.round(cantidadKg * 100) / 100,
    destino: String(registro.destino || '').trim() || 'Entrepôt',
    notas: String(registro.notas || '').trim(),
    createdAt: registro.createdAt || new Date().toISOString(),
  };
}

function guardarTodos(registros: RegistroDechetCompostage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  queueStorageSync(STORAGE_KEY);
  emitirActualizacion();
}

function guardarCategorias(categorias: string[], emitirEvento = true): void {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(normalizarCategorias(categorias)));
  queueStorageSync(CATEGORIES_STORAGE_KEY);

  if (emitirEvento) {
    emitirActualizacion();
  }
}

function guardarRegistrosSinEvento(registros: RegistroDechetCompostage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  queueStorageSync(STORAGE_KEY);
}

export function obtenerCategoriasDechetsCompostage(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_CATEGORIES_DECHETS];
    }

    return normalizarCategorias(JSON.parse(raw));
  } catch (error) {
    console.error('Erreur lors du chargement des catégories de déchets :', error);
    return [...DEFAULT_CATEGORIES_DECHETS];
  }
}

export function agregarCategoriaDechetsCompostage(nombre: string): string[] {
  const categoria = normalizarNombreCategoria(nombre);
  if (!categoria) {
    throw new Error('Le nom de la catégorie est requis.');
  }

  const categorias = obtenerCategoriasDechetsCompostage();
  if (categorias.some((item) => item.toLocaleLowerCase() === categoria.toLocaleLowerCase())) {
    throw new Error('Cette catégorie existe déjà.');
  }

  const actualizadas = normalizarCategorias([...categorias, categoria]);
  guardarCategorias(actualizadas);
  return actualizadas;
}

export function modifierCategoriaDechetsCompostage(categoriaAnterior: string, nuevaCategoria: string): string[] {
  const anterior = normalizarNombreCategoria(categoriaAnterior);
  const nueva = normalizarNombreCategoria(nuevaCategoria);

  if (!anterior || !nueva) {
    throw new Error('Le nom de la catégorie est requis.');
  }

  const categorias = obtenerCategoriasDechetsCompostage();
  if (!categorias.some((item) => item === anterior)) {
    throw new Error('La catégorie à modifier est introuvable.');
  }

  if (
    categorias.some(
      (item) => item.toLocaleLowerCase() === nueva.toLocaleLowerCase() && item !== anterior,
    )
  ) {
    throw new Error('Une autre catégorie porte déjà ce nom.');
  }

  const categoriasActualizadas = normalizarCategorias(categorias.map((item) => (item === anterior ? nueva : item)));
  const registrosActualizados = obtenerRegistrosDechetsCompostage().map((registro) => (
    registro.categorie === anterior
      ? { ...registro, categorie: nueva }
      : registro
  ));

  guardarCategorias(categoriasActualizadas, false);
  guardarRegistrosSinEvento(registrosActualizados);
  emitirActualizacion();
  return categoriasActualizadas;
}

export function eliminarCategoriaDechetsCompostage(categoriaAEliminar: string): string[] {
  const categoria = normalizarNombreCategoria(categoriaAEliminar);
  const categorias = obtenerCategoriasDechetsCompostage();

  if (!categorias.some((item) => item === categoria)) {
    throw new Error('La catégorie à supprimer est introuvable.');
  }

  const usoActual = obtenerRegistrosDechetsCompostage().filter((registro) => registro.categorie === categoria).length;
  if (usoActual > 0) {
    throw new Error(`Cette catégorie est utilisée dans ${usoActual} registre(s) et ne peut pas être supprimée.`);
  }

  let categoriasActualizadas = categorias.filter((item) => item !== categoria);
  if (categoriasActualizadas.length === 0) {
    categoriasActualizadas = ['Autre'];
  }

  const categoriasOrdenadas = normalizarCategorias(categoriasActualizadas);
  guardarCategorias(categoriasOrdenadas);
  return categoriasOrdenadas;
}

export function obtenerRegistrosDechetsCompostage(): RegistroDechetCompostage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizarRegistro)
      .filter((registro): registro is RegistroDechetCompostage => registro !== null)
      .sort((a, b) => {
        const fechaComparacion = b.fecha.localeCompare(a.fecha);
        if (fechaComparacion !== 0) {
          return fechaComparacion;
        }

        return b.createdAt.localeCompare(a.createdAt);
      });
  } catch (error) {
    console.error('Erreur lors du chargement des déchets et compostage :', error);
    return [];
  }
}

export function guardarRegistroDechetCompostage(input: RegistroInput): RegistroDechetCompostage {
  const registro = normalizarRegistro(input);
  if (!registro) {
    throw new Error('Le registre de déchets/compostage est invalide.');
  }

  const registros = obtenerRegistrosDechetsCompostage();
  const actualizados = [registro, ...registros];
  guardarTodos(actualizados);
  return registro;
}

export function modifierRegistroDechetCompostage(registroId: string, input: RegistroInput): RegistroDechetCompostage {
  const registros = obtenerRegistrosDechetsCompostage();
  const existant = registros.find((registro) => registro.id === registroId);

  if (!existant) {
    throw new Error('Le registre à modifier est introuvable.');
  }

  const registroNormalizado = normalizarRegistro({
    ...existant,
    ...input,
    id: existant.id,
    createdAt: existant.createdAt,
  });

  if (!registroNormalizado) {
    throw new Error('Le registre de déchets/compostage est invalide.');
  }

  const actualizados = registros.map((registro) => (
    registro.id === registroId ? registroNormalizado : registro
  ));

  guardarTodos(actualizados);
  return registroNormalizado;
}

export function eliminarRegistroDechetCompostage(registroId: string): void {
  const registros = obtenerRegistrosDechetsCompostage();
  const actualizados = registros.filter((registro) => registro.id !== registroId);
  guardarTodos(actualizados);
}

function guardarTipos(tipos: OptionTypeDechetCompostage[], emitirEvento = true): void {
  localStorage.setItem(TYPES_STORAGE_KEY, JSON.stringify(normalizarTipos(tipos)));
  queueStorageSync(TYPES_STORAGE_KEY);

  if (emitirEvento) {
    emitirActualizacion();
  }
}

export function obtenerTiposDechetsCompostage(): OptionTypeDechetCompostage[] {
  try {
    const raw = localStorage.getItem(TYPES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_TYPES_DECHETS.map((tipo) => ({ ...tipo }));
    }

    return normalizarTipos(JSON.parse(raw));
  } catch (error) {
    console.error('Erreur lors du chargement des types de déchets :', error);
    return DEFAULT_TYPES_DECHETS.map((tipo) => ({ ...tipo }));
  }
}

export function agregarTipoDechetsCompostage(label: string, color?: string): OptionTypeDechetCompostage[] {
  const nombre = normalizarNombreTipo(label);
  if (!nombre) {
    throw new Error('Le nom du type est requis.');
  }

  const tipos = obtenerTiposDechetsCompostage();
  if (tipos.some((tipo) => tipo.label.toLocaleLowerCase() === nombre.toLocaleLowerCase())) {
    throw new Error('Ce type existe déjà.');
  }

  const actualizados = [...tipos, { id: generarIdTipo(), label: nombre, color: normalizarColorTipo(color, tipos.length) }];
  guardarTipos(actualizados);
  return actualizados;
}

export function modifierTipoDechetsCompostage(tipoId: string, nuevoLabel: string, nuevoColor?: string): OptionTypeDechetCompostage[] {
  const nombre = normalizarNombreTipo(nuevoLabel);
  if (!nombre) {
    throw new Error('Le nom du type est requis.');
  }

  const tipos = obtenerTiposDechetsCompostage();
  if (!tipos.some((tipo) => tipo.id === tipoId)) {
    throw new Error('Le type à modifier est introuvable.');
  }

  if (tipos.some((tipo) => tipo.label.toLocaleLowerCase() === nombre.toLocaleLowerCase() && tipo.id !== tipoId)) {
    throw new Error('Un autre type porte déjà ce nom.');
  }

  const actualizados = tipos.map((tipo) => (
    tipo.id === tipoId
      ? { ...tipo, label: nombre, color: normalizarColorTipo(nuevoColor, tipos.findIndex((item) => item.id === tipoId)) }
      : tipo
  ));

  guardarTipos(actualizados);
  return actualizados;
}

export function eliminarTipoDechetsCompostage(tipoId: string): OptionTypeDechetCompostage[] {
  const tipos = obtenerTiposDechetsCompostage();
  if (!tipos.some((tipo) => tipo.id === tipoId)) {
    throw new Error('Le type à supprimer est introuvable.');
  }

  if (tipos.length <= 1) {
    throw new Error('Au moins un type doit rester disponible.');
  }

  const usoActual = obtenerRegistrosDechetsCompostage().filter((registro) => registro.tipo === tipoId).length;
  if (usoActual > 0) {
    throw new Error(`Ce type est utilisé dans ${usoActual} registre(s) et ne peut pas être supprimé.`);
  }

  const actualizados = tipos.filter((tipo) => tipo.id !== tipoId);
  guardarTipos(actualizados);
  return actualizados;
}