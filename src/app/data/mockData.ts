import { 
  Usuario, 
  Producto, 
  MovimientoInventario, 
  Comanda, 
  Organismo, 
  Transporte,
  IDDigital,
  Vehiculo,
  Ruta,
  UsuarioInterno
} from '../types';

// 🚀 MODO PRODUCCIÓN - TODOS LOS ARRAYS VACÍOS
// Los datos se crearán dinámicamente desde la interfaz de usuario

// ❌ NO hay usuarios de ejemplo - Solo David (gestionado en usuarios.ts)
export const mockUsuarios: Usuario[] = [];

// ❌ NO hay productos de ejemplo - Se configuran desde Configuración
export const mockProductos: Producto[] = [];

// ❌ NO hay movimientos de ejemplo - Se generan al usar el sistema
export const mockMovimientos: MovimientoInventario[] = [];

// ❌ NO hay comandas de ejemplo - Se crean desde el módulo Comandas
export const mockComandas: Comanda[] = [];

// ❌ NO hay organismos de ejemplo - Se registran desde Organismos
export const mockOrganismos: Organismo[] = [];

// ❌ NO hay transportes de ejemplo - Se gestionan desde Transporte
export const mockTransportes: Transporte[] = [];

// ❌ NO hay IDs digitales de ejemplo - Se generan automáticamente
export const mockIDsDigitales: IDDigital[] = [];

// ❌ NO hay vehículos de ejemplo - Se registran desde Transporte
export const mockVehiculos: Vehiculo[] = [];

// ❌ NO hay rutas de ejemplo - Se crean desde Transporte
export const mockRutas: Ruta[] = [];

// ❌ NO hay usuarios internos de ejemplo - Se registran desde Contactos/Bénévoles
export const mockUsuariosInternos: UsuarioInterno[] = [];

// ❌ NO hay registros PRS de ejemplo - Se crean desde el módulo PRS/Cuisine
export const mockRegistrosPRS: any[] = [];