/**
 * Utilidad para inicializar datos de ejemplo en el sistema
 * ⚠️ PROTECCIÓN: NUNCA sobrescribe datos existentes
 * ✅ Solo inicializa si localStorage está completamente vacío
 * 🔒 MODO PRODUCCIÓN: Funciones de carga de datos deshabilitadas
 */

import { 
  mockUsuarios,
  mockComandas,
  mockOrganismos,
  mockTransportes,
  mockIDsDigitales,
  mockVehiculos,
  mockRutas,
  mockUsuariosInternos,
  mockRegistrosPRS,
  mockMovimientos
} from '../data/mockData';

const FLAG_DATOS_EJEMPLO = 'datos_ejemplo_inicializados';
const FLAG_DATOS_REALES = 'sistema_con_datos_reales'; // Nueva bandera para proteger datos reales

/**
 * ⚠️ PROTECCIÓN: Verifica si el sistema tiene datos reales (NO TOCAR)
 */
export function sistemaConDatosReales(): boolean {
  // Si ya está marcado como sistema con datos reales, proteger
  if (localStorage.getItem(FLAG_DATOS_REALES) === 'true') {
    return true;
  }

  // Verificar si existe algún dato en localStorage (datos reales creados por el usuario)
  const keys = [
    'banco_alimentos_usuarios',
    'organismos_banco_alimentos',
    'banco_alimentos_comandas',
    'banco_alimentos_productos',
    'banco_alimentos_movimientos',
    'banco_alimentos_vehiculos',
    'banco_alimentos_rutas',
    'banco_alimentos_transportes',
    'banco_alimentos_ids_digitales',
    'contactos_departamentos',
    'banco_alimentos_registros_prs',
    'beneficiarios_banque_alimentaire'
  ];

  // Si alguna key tiene datos, marcar como sistema con datos reales
  for (const key of keys) {
    const data = localStorage.getItem(key);
    if (data && data !== '[]' && data !== 'null') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Marcar el sistema como con datos reales para protegerlo
          localStorage.setItem(FLAG_DATOS_REALES, 'true');
          return true;
        }
      } catch (e) {
        // Si no se puede parsear, asumimos que hay datos
        localStorage.setItem(FLAG_DATOS_REALES, 'true');
        return true;
      }
    }
  }

  return false;
}

/**
 * 🔒 Marcar el sistema como con datos reales para protegerlos
 * Se usa cuando se restaura un backup o se cargan datos importantes
 */
export function marcarComoSistemaConDatosReales(): void {
  localStorage.setItem(FLAG_DATOS_REALES, 'true');
  console.log('🔒 Sistema marcado como con DATOS REALES - Protección activada');
}

/**
 * Verifica si los datos de ejemplo ya fueron inicializados
 */
export function datosEjemploInicializados(): boolean {
  return localStorage.getItem(FLAG_DATOS_EJEMPLO) === 'true';
}

/**
 * Inicializa TODOS los datos de ejemplo en el sistema
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA (Sistema en producción)
 */
export function inicializarTodosDatosEjemplo(): void {
  console.log('🔒 inicializarTodosDatosEjemplo() - DESHABILITADA (modo producción)');
  console.log('🔒 El sistema trabaja únicamente con datos reales creados por el usuario');
  return; // NO HACER NADA - Función completamente deshabilitada
}

/**
 * Limpia TODOS los datos de ejemplo del sistema
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
export function limpiarDatosEjemplo(): void {
  console.log('🔒 limpiarDatosEjemplo() - DESHABILITADA para protección de datos');
  console.log('🔒 Esta función ya NO limpia datos para proteger tu información');
  return; // NO HACER NADA
}

/**
 * Reinicia los datos de ejemplo (limpia y carga de nuevo)
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
export function reiniciarDatosEjemplo(): void {
  console.log('🔒 reiniciarDatosEjemplo() - DESHABILITADA (modo producción)');
  console.log('🔒 Esta función ya NO reinicia datos para proteger tu información');
  return; // NO HACER NADA
}
