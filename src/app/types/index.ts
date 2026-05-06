/**
 * Tipos TypeScript Centralizados para Sistema Banque Alimentaire
 * 
 * Este archivo contiene todas las interfaces y tipos específicos
 * utilizados en el sistema, reemplazando el uso de `any`.
 */

// ============================================================================
// PRODUCTOS E INVENTARIO
// ============================================================================

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria?: string;
  variante?: string;
  descripcion?: string;
  stock: number;
  stockMinimo?: number;
  stockActual?: number;
  unidad: string;
  temperatura?: 'ambiente' | 'refrigerado' | 'congelado';
  temperaturaOriginalEntrada?: 'ambiente' | 'refrigerado' | 'congelado';
  codigoBarras?: string;
  fechaCaducidad?: string;
  lote?: string;
  proveedor?: string;
  precio?: number;
  peso?: number;
  pesoUnitario?: number;
  pesoRegistrado?: number;
  icono?: string;
  localizacion?: string;
  alertaStockBajo?: boolean;
  alertaCaducidad?: boolean;
  esPerecedero?: boolean;
  esVariante?: boolean;
  esSubcategoria?: boolean;
  productoBaseId?: string;
  subcategoriaBaseId?: string;
  categoriaBase?: string;
  subcategoriaBase?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface ProductoCreado extends Producto {
  // Alias para compatibilidad con código existente
}

export interface HistorialEntrada {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  unidad: string;
  fecha: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transformacion';
  referencia?: string;
  observaciones?: string;
  usuario?: string;
}

export interface ProductoConversion {
  productoId: string;
  ratio: number;
  nombre?: string;
  unidad?: string;
  stock?: number;
}

export interface FormConversion {
  cantidadOrigen: number;
  merma: number;
  productosDestino: ProductoConversion[];
  observaciones: string;
}

// ============================================================================
// COMANDAS Y PEDIDOS
// ============================================================================

export interface ItemComanda {
  id?: string;
  productoId: string;
  nombreProducto: string;
  productoNombre?: string; // Alias
  cantidad: number;
  cantidadPreparada?: number;
  cantidadAceptada?: number;
  unidad: string;
  icono?: string;
  observaciones?: string;
  peso?: number;
  valorUnitario?: number;
  temperatura?: 'ambiente' | 'refrigerado' | 'congelado';
  temperaturaOriginalEntrada?: 'ambiente' | 'refrigerado' | 'congelado';
}

export interface Comanda {
  id: string;
  numero: string;
  numeroComanda?: string; // Alias
  organismoId: string;
  nombreOrganismo: string;
  fecha: string;
  fechaEntrega?: string;
  estado: EstadoComanda;
  items: ItemComanda[];
  observaciones?: string;
  prioridad?: 'baja' | 'normal' | 'alta' | 'urgente';
  tipo?: 'standard' | 'urgente' | 'periodica';
  grupoDistribucionId?: string;
  grupoDistribucionEtiqueta?: string;
  grupoDistribucionAnclada?: boolean;
  fechaCaducidadGrupo?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  creadoPor?: string;
  modificadoPor?: string;
}

export type EstadoComanda =
  | 'pendiente'
  | 'confirmada'
  | 'en_preparacion'
  | 'completada'
  | 'entregada'
  | 'anulada';

export type EstadoComandaLegacy = 'preparada' | 'en_transito' | 'cancelada';

export interface EtiquetaComandaData {
  numeroComanda: string;
  nombreOrganismo: string;
  fechaEntrega?: string;
  estado: string;
  observaciones?: string;
  items: Array<{
    nombre: string;
    icono?: string;
    cantidad: number;
    unidad: string;
    observaciones?: string;
  }>;
}

// ============================================================================
// ORGANISMOS
// ============================================================================

export interface Organismo {
  id: string;
  nombre: string;
  tipo: string;
  responsable: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  beneficiarios: number;
  frecuenciaEntrega?: string;
  diasEntrega?: string[];
  horarioEntrega?: string;
  observaciones?: string;
  activo: boolean;
  claveAcceso?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

// ============================================================================
// TRANSPORTE Y RUTAS
// ============================================================================

export interface Ruta {
  id: string;
  numero: string;
  destino: string;
  conductor: string;
  vehiculo: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  estado: 'planificada' | 'en_curso' | 'completada' | 'cancelada';
  comandas?: string[];
  distancia?: number;
  observaciones?: string;
  fechaCreacion?: string;
}

// ============================================================================
// CONTACTOS
// ============================================================================

export interface Contacto {
  id: string;
  prenom: string;
  nom: string;
  nomEntreprise?: string;
  email: string;
  telephone?: string;
  departement: string;
  categorie: 'donateur' | 'fournisseur' | 'partenaire' | 'autre';
  adresse?: string;
  ville?: string;
  codePostal?: string;
  notes?: string;
  actif: boolean;
  dateCreation?: string;
  dateModification?: string;
}

// ============================================================================
// BENEVOLES (VOLUNTARIOS)
// ============================================================================

export interface DocumentBenevole {
  id: string | number;
  nom: string;
  name?: string; // Alias
  type: string;
  dateUpload?: string;
  url?: string;
}

export interface Benevole {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: 'Masculin' | 'Féminin' | 'Autre' | 'Non spécifié';
  adresse?: string;
  ville?: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  disponibilite?: string[];
  competences?: string[];
  langues?: string[];
  statut: 'actif' | 'inactif' | 'suspendu';
  dateInscription: string;
  derniereActivite?: string;
  heuresAccumulees?: number;
  documents?: DocumentBenevole[];
  notes?: string;
  photo?: string;
  urgenceContact?: {
    nom: string;
    telephone: string;
    relation: string;
  };
}

export interface FormularioNouveauBenevole {
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  telephone?: string;
  email?: string;
  disponibilite?: string[];
  competences?: string[];
  langues?: string[];
  statut?: 'actif' | 'inactif';
  documents?: DocumentBenevole[];
  notes?: string;
  urgenceContact?: {
    nom: string;
    telephone: string;
    relation: string;
  };
}

// ============================================================================
// CUISINE Y TRANSFORMACIONES
// ============================================================================

export interface IngredienteReceta {
  productoId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface Receta {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'plato_principal' | 'entrada' | 'postre' | 'bebida' | 'otro';
  ingredientes: IngredienteReceta[];
  instrucciones?: string;
  tiempoPreparacion?: number; // en minutos
  porciones?: number;
  rendimiento?: number;
  fechaCreacion?: string;
  activa: boolean;
}

export interface ProductoTransformacion {
  productoId: string;
  cantidad: number;
  nombre?: string;
  unidad?: string;
}

export interface Transformacion {
  id: string;
  fecha: string;
  tipo: 'cocina' | 'procesamiento' | 'envasado';
  productoOrigen: ProductoTransformacion;
  productosResultantes: ProductoTransformacion[];
  merma?: number;
  observaciones?: string;
  realizadoPor?: string;
  estado: 'planificada' | 'en_proceso' | 'completada' | 'cancelada';
}

export interface EstadisticasCocina {
  totalRecetas: number;
  totalTransformaciones: number;
  productosMasUsados: Array<{
    productoId: string;
    nombre: string;
    usos: number;
  }>;
  mermaTotal: number;
  mermaPromedio: number;
}

// ============================================================================
// OFERTAS Y SOLICITUDES
// ============================================================================

export interface ProductoOferta {
  productoId: string;
  nombreProducto?: string;
  cantidad: number;
  peso?: number;
  valorUnitario?: number;
  unidad?: string;
}

export interface Oferta {
  id: string;
  numero: string;
  donadorId: string;
  nombreDonador: string;
  fecha: string;
  productos: ProductoOferta[];
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'parcial';
  observaciones?: string;
  fechaVencimiento?: string;
}

export interface ProductoAceptado {
  productoId: string;
  cantidadAceptada: number;
  cantidadOfrecida?: number;
}

export interface Solicitud {
  id: string;
  numero: string;
  ofertaId: string;
  fecha: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  productosAceptados: ProductoAceptado[];
  observaciones?: string;
  fechaRespuesta?: string;
}

// ============================================================================
// CONFIGURACIÓN Y CATALOGOS
// ============================================================================

export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
  subcategorias?: Subcategoria[];
  activa?: boolean;
}

export interface Subcategoria {
  id: string;
  nombre: string;
  icono?: string;
  categoriaId?: string;
  variantes?: Variante[];
  activa?: boolean;
}

export interface Variante {
  id: string;
  nombre: string;
  icono?: string;
  subcategoriaId?: string;
  descripcion?: string;
  activa?: boolean;
}

export interface Unidad {
  id: string;
  nombre: string;
  abreviatura: string;
  tipo: 'peso' | 'volumen' | 'cantidad';
  activa: boolean;
}

export interface Programa {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'alimentario' | 'educativo' | 'social';
  fechaInicio?: string;
  fechaFin?: string;
  activo: boolean;
  responsable?: string;
  presupuesto?: number;
}

// ============================================================================
// USUARIOS Y PERMISOS
// ============================================================================

export type Permiso = 
  | 'dashboard'
  | 'inventario'
  | 'comandas'
  | 'organismos'
  | 'transporte'
  | 'reportes'
  | 'usuarios'
  | 'configuracion'
  | 'comptoir'
  | 'benevoles'
  | 'cuisine'
  | 'contactos-almacen'
  | 'desarrollo'
  | 'desarrollador'
  | 'administrador';

export interface Usuario {
  id: string;
  nombre: string;
  username: string;
  email: string;
  password?: string; // No debería estar en producción
  rol: string;
  permisos: Permiso[];
  activo: boolean;
  departamento?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
  avatar?: string;
}

// ============================================================================
// NOTIFICACIONES Y ALERTAS
// ============================================================================

export interface Notificacion {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  urgente?: boolean;
  accion?: {
    texto: string;
    url: string;
  };
}

export interface Alerta {
  id: string;
  tipo: 'stock_bajo' | 'caducidad' | 'comanda_urgente' | 'entrega_hoy';
  severidad: 'info' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  fecha: string;
  activa: boolean;
  datosRelacionados?: any; // Puede ser Producto, Comanda, etc.
}

// ============================================================================
// ESCANEO QR
// ============================================================================

export interface DatosQR {
  tipo: 'producto' | 'comanda' | 'organismo' | 'ubicacion';
  id: string;
  datos?: any; // Depende del tipo
  codigo?: string;
  producto?: string;
  nombre?: string;
  lote?: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
  comanda?: string;
  numeroComanda?: string;
  organismo?: string;
  organismoId?: string;
  fecha?: string;
  fechaEntrega?: string;
  items?: number;
  totalItems?: number;
  totalUnidades?: number;
  text?: string;
  [key: string]: any;
}

// ============================================================================
// REPORTES Y ESTADÍSTICAS
// ============================================================================

export interface EstadisticasDashboard {
  totalProductos: number;
  totalStock: number;
  valorInventario: number;
  productosStockBajo: number;
  productosCaducidadProxima: number;
  totalComandas: number;
  comandasPendientes: number;
  comandasEntregadas: number;
  totalOrganismos: number;
  organismosActivos: number;
  totalBeneficiarios: number;
  tendenciaStock?: 'up' | 'down' | 'stable';
  tendenciaComandas?: 'up' | 'down' | 'stable';
  actividadReciente: Array<{
    fecha: string;
    tipo: string;
    cantidad: number;
  }>;
}

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  categoria?: string;
  organismo?: string;
  estado?: string;
  tipo?: string;
}

// ============================================================================
// EVENTOS Y HANDLERS
// ============================================================================

export interface EventoSistema {
  id: string;
  tipo: 'accion' | 'error' | 'auditoria';
  usuario: string;
  modulo: string;
  accion: string;
  fecha: string;
  detalles?: any;
  ip?: string;
}

// ============================================================================
// COMPONENTES UI
// ============================================================================

export interface OpcionSelect {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  route?: string;
  subItems?: MenuItem[];
  badge?: number;
  requiresPermission?: Permiso;
}

// ============================================================================
// BÚSQUEDA GLOBAL
// ============================================================================

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: 'productos' | 'comandas' | 'organismos' | 'transporte' | 'contactos';
  icon?: string;
  data?: Producto | Comanda | Organismo | Ruta | Contacto;
  route?: string;
}

// ============================================================================
// UTILIDADES
// ============================================================================

export interface PaginacionConfig {
  paginaActual: number;
  itemsPorPagina: number;
  totalItems: number;
  totalPaginas: number;
}

export interface OrdenConfig {
  campo: string;
  direccion: 'asc' | 'desc';
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export type EstadoComanda = Comanda['estado'];
export type TipoTransformacion = Transformacion['tipo'];
export type CategoriaReceta = Receta['categoria'];
export type SeveridadAlerta = Alerta['severidad'];
export type TipoNotificacion = Notificacion['tipo'];

// ============================================================================
// EXPORTS
// ============================================================================

// Re-exportar todo para facilitar imports
export type {
  // Ya están definidos arriba
};