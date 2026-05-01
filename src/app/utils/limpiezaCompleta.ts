/**
 * Ejecuta una limpieza completa del sistema
 * Elimina todos los datos de ejemplo pero mantiene configuraciones esenciales
 * 
 * ⚠️ PROTECCIÓN: Si detecta datos reales, NO ejecuta la limpieza
 * 🔒🔒🔒 PROTECCIÓN MÁXIMA: ESTA FUNCIÓN ESTÁ PERMANENTEMENTE DESHABILITADA
 */
export function ejecutarLimpiezaCompleta(): void {
  // 🔒🔒🔒 PROTECCIÓN MÁXIMA - NUNCA EJECUTAR ESTA FUNCIÓN
  console.log('🔒 ========================================');
  console.log('🔒 LIMPIEZA AUTOMÁTICA PERMANENTEMENTE DESHABILITADA');
  console.log('🔒 ========================================');
  console.log('🔒 Esta función ya NO se ejecuta para proteger tus datos.');
  console.log('🔒 El sistema está configurado para preservar todos los datos.');
  console.log('🔒 Si necesitas limpiar manualmente, usa la opción en Configuración.');
  
  // Marcar como ejecutada sin hacer nada
  localStorage.setItem('limpieza_completa_ejecutada', 'true');
  localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
  localStorage.setItem('sistema_con_datos_reales', 'true');
  
  return; // Salir inmediatamente sin hacer nada
  
  /* CÓDIGO DESHABILITADO - NO SE EJECUTARÁ NUNCA
  // 🔒 PROTECCIÓN: Verificar si hay datos reales antes de limpiar
  if (sistemaConDatosReales()) {
    console.log('🔒 ========================================');
    console.log('🔒 LIMPIEZA CANCELADA - DATOS REALES DETECTADOS');
    console.log('🔒 ========================================');
    console.log('🔒 El sistema tiene datos reales del usuario.');
    console.log('🔒 La limpieza automática está deshabilitada para proteger tus datos.');
    console.log('🔒 Si deseas limpiar, usa la opción manual en Configuración.');
    return;
  }
  
  console.log('🗑️ ========================================');
  console.log('🗑️ INICIANDO LIMPIEZA COMPLETA DEL SISTEMA');
  console.log('🗑️ ========================================');
  
  try {
    // 1. LIMPIAR DATOS DE EJEMPLO Y PREDETERMINADOS
    limpiarDatosEjemplo();
    
    // 2. LIMPIAR DATOS OPERACIONALES
    limpiarDatosOperacionales();
    
    // 3. MANTENER USUARIOS PERMANENTES
    mantenerUsuariosPermanentes();
    
    // 4. MARCAR LIMPIEZA COMPLETADA
    localStorage.setItem('limpieza_completa_ejecutada', 'true');
    localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
    
    console.log('✅ ========================================');
    console.log('✅ LIMPIEZA COMPLETA EXITOSA');
    console.log('✅ ========================================');
    console.log('📋 Datos mantenidos:');
    console.log('   ✓ Departamentos estructurados');
    console.log('   ✓ Configuraciones del sistema');
    console.log('   ✓ Usuarios: David y admin');
    console.log('   ✓ Calles de Laval');
    console.log('   ✓ Quartiers de Laval');
    console.log('   ✓ Unidades de medida');
    console.log('🗑️  Datos eliminados:');
    console.log('   ✗ Organismos de ejemplo');
    console.log('   ✗ Comandas de ejemplo');
    console.log('   ✗ Productos de ejemplo');
    console.log('   ✗ Movimientos de inventario');
    console.log('   ✗ Contactos de ejemplo');
    console.log('   ✗ Tipos de contacto predeterminados');
    console.log('   ✗ Tipos de documento predeterminados');
    console.log('   ✗ Vehículos y rutas');
    console.log('   ✗ IDs digitales');
    console.log('   ✗ Categorías predeterminadas');
    console.log('   ✗ Programas de entrada predeterminados');
    console.log('✅ ========================================');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza completa:', error);
  }
}

/**
 * Limpia todos los datos de ejemplo del sistema
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
function limpiarDatosEjemplo(): void {
  console.log('🔒 limpiarDatosEjemplo() - DESHABILITADA para protección de datos');
  return; // NO HACER NADA
  
  /* CÓDIGO DESHABILITADO
  console.log('🗑️  Limpiando datos de ejemplo...');
  
  const clavesEjemplo = [
    // Mock Data
    'datos_ejemplo_inicializados',
    
    // Organismos
    'organismos_banco_alimentos',
    
    // Comandas y Ofertas
    'banco_alimentos_comandas',
    'ofertas_organismos',
    
    // Inventario
    'banco_alimentos_productos',
    'banco_alimentos_movimientos',
    'entradas_inventario',
    'inventario_cocina',
    
    // Transporte
    'banco_alimentos_vehiculos',
    'banco_alimentos_rutas',
    'banco_alimentos_transportes',
    
    // IDs Digitales
    'banco_alimentos_ids_digitales',
    
    // PRS
    'registros_prs',
    
    // Contactos
    'contactos_departamento',
    'contactos_entrepot',
    'personas_responsables',
    'banque_alimentaire_tipos_contacto_personalizados', // 🗑️ NUEVO: Limpiar tipos de contacto
    'banque_alimentaire_tipos_documento', // 🗑️ NUEVO: Limpiar tipos de documento
    'banque_alimentaire_tipos_documento_predefined', // 🗑️ NUEVO: Limpiar tipos de documento predefinidos
    
    // Recetas
    'recetas_banco_alimentos',
    
    // Demandas
    'demandes_organismos',
    
    // Comunicaciones
    'comunicaciones_internas',
    
    // Notificaciones
    'notificaciones_sistema',
    
    // Paletas
    'paletas_banco_alimentos',
    
    // Tareas
    'tareas_personalizadas',
    
    // Verificaciones
    'verificaciones_organismos'
  ];
  
  clavesEjemplo.forEach(clave => {
    try {
      const valor = localStorage.getItem(clave);
      if (valor) {
        localStorage.setItem(clave, JSON.stringify([]));
        console.log(`   ✓ ${clave}`);
      }
    } catch (e) {
      console.warn(`   ⚠ Error limpiando ${clave}:`, e);
    }
  });
}

/**
 * Limpia datos operacionales pero mantiene la estructura
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
function limpiarDatosOperacionales(): void {
  console.log('🔒 limpiarDatosOperacionales() - DESHABILITADA para protección de datos');
  return; // NO HACER NADA
  
  /* CÓDIGO DESHABILITADO
  console.log('🗑️  Limpiando datos operacionales...');
  
  // Limpiar categorías predeterminadas
  try {
    localStorage.setItem('banco_alimentos_categorias', JSON.stringify([]));
    console.log('   ✓ Categorías vaciadas');
  } catch (e) {
    console.warn('   ⚠ Error limpiando categorías:', e);
  }
  
  // Limpiar programas de entrada predeterminados
  try {
    localStorage.setItem('programas_entrada', JSON.stringify([]));
    console.log('   ✓ Programas de entrada vaciados');
  } catch (e) {
    console.warn('   ⚠ Error limpiando programas de entrada:', e);
  }
  
  // Limpiar auditoría antigua
  try {
    const auditoriaKey = 'audit_logs';
    if (localStorage.getItem(auditoriaKey)) {
      localStorage.setItem(auditoriaKey, JSON.stringify([]));
      console.log('   ✓ Logs de auditoría vaciados');
    }
  } catch (e) {
    console.warn('   ⚠ Error limpiando auditoría:', e);
  }
}

/**
 * Mantiene solo los usuarios permanentes del sistema
 */
function mantenerUsuariosPermanentes(): void {
  console.log('👥 Manteniendo usuarios permanentes...');
  
  try {
    const usuarios = obtenerUsuarios();
    const usuariosPermanentes = usuarios.filter(u => 
      USUARIOS_PERMANENTES.includes(u.nombre)
    );
    
    if (usuariosPermanentes.length > 0) {
      guardarUsuarios(usuariosPermanentes);
      console.log(`   ✓ ${usuariosPermanentes.length} usuarios permanentes mantenidos:`);
      usuariosPermanentes.forEach(u => {
        console.log(`     - ${u.nombre} (${u.rol})`);
      });
    } else {
      // Si no existen, crear los usuarios permanentes
      crearUsuariosPermanentes();
    }
  } catch (error) {
    console.error('   ❌ Error manteniendo usuarios permanentes:', error);
    // Intentar crear usuarios permanentes como respaldo
    crearUsuariosPermanentes();
  }
}

/**
 * Crea los usuarios permanentes del sistema si no existen
 */
function crearUsuariosPermanentes(): void {
  console.log('👥 Creando usuarios permanentes...');
  
  const usuariosPermanentes = [
    {
      id: 'user-david-permanent',
      nombre: 'David',
      email: 'david@banquealimentaire.org',
      password: 'Lettycia26', // Contraseña: Lettycia26
      rol: 'desarrollador' as const,
      activo: true,
      permisos: ['todos'], // Acceso total
      createdAt: new Date().toISOString(),
      observaciones: 'Usuario desarrollador - SIEMPRE debe estar activo'
    },
    {
      id: 'user-admin-permanent',
      nombre: 'admin',
      email: 'admin@banquealimentaire.org',
      password: 'Admin2024!', // Contraseña: Admin2024!
      rol: 'administrador' as const,
      activo: true,
      permisos: ['todos'], // Acceso total
      createdAt: new Date().toISOString(),
      observaciones: 'Administrador principal del sistema'
    }
  ];
  
  guardarUsuarios(usuariosPermanentes);
  console.log('   ✓ 2 usuarios permanentes creados:');
  console.log('     - David (desarrollador) - Lettycia26');
  console.log('     - admin (administrador) - Admin2024!');
}

/**
 * Verifica si ya se ejecutó la limpieza
 */
export function yaEjecutadaLimpiezaCompleta(): boolean {
  return localStorage.getItem('limpieza_completa_ejecutada') === 'true';
}

/**
 * Obtiene la fecha de la última limpieza
 */
export function obtenerFechaUltimaLimpieza(): string | null {
  return localStorage.getItem('limpieza_completa_fecha');
}

/**
 * Fuerza una nueva limpieza (ignora si ya se ejecutó)
 * 🔒 FUNCIÓN DESHABILITADA - NO HACE NADA
 */
export function forzarLimpiezaCompleta(): void {
  console.log('🔒 forzarLimpiezaCompleta() - DESHABILITADA para protección de datos');
  console.log('🔒 No se puede forzar la limpieza. Todos los datos están protegidos.');
  
  // Asegurar que los flags de protección estén activos
  localStorage.setItem('limpieza_completa_ejecutada', 'true');
  localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
  localStorage.setItem('sistema_con_datos_reales', 'true');
  
  return; // NO HACER NADA
  
  /* CÓDIGO DESHABILITADO
  localStorage.removeItem('limpieza_completa_ejecutada');
  localStorage.removeItem('limpieza_completa_fecha');
  ejecutarLimpiezaCompleta();
  */
}