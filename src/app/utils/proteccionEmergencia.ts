/**
 * 🆘 SCRIPT DE EMERGENCIA - PROTECCIÓN INMEDIATA DE DATOS
 * 
 * Si tus datos se están eliminando, ejecuta esta función inmediatamente
 * desde la consola del navegador.
 * 
 * USO EN CONSOLA:
 * ```
 * proteccionEmergencia()
 * ```
 */

export function proteccionEmergencia(): void {
  console.log('');
  console.log('🆘 ═══════════════════════════════════════════════════════════');
  console.log('🆘 SCRIPT DE EMERGENCIA - PROTECCIÓN INMEDIATA DE DATOS');
  console.log('🆘 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    // 1. Marcar sistema como con datos reales
    localStorage.setItem('sistema_con_datos_reales', 'true');
    console.log('✅ 1/5 - Sistema marcado como CON DATOS REALES');
    
    // 2. Marcar limpieza como ejecutada
    localStorage.setItem('limpieza_completa_ejecutada', 'true');
    console.log('✅ 2/5 - Limpieza marcada como ejecutada');
    
    // 3. Establecer fecha de limpieza
    localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
    console.log('✅ 3/5 - Fecha de limpieza establecida');
    
    // 4. Verificar que los flags están establecidos
    const sistemaProtegido = localStorage.getItem('sistema_con_datos_reales') === 'true';
    const limpiezaEjecutada = localStorage.getItem('limpieza_completa_ejecutada') === 'true';
    
    if (sistemaProtegido && limpiezaEjecutada) {
      console.log('✅ 4/5 - Flags verificados correctamente');
    } else {
      console.error('❌ 4/5 - ERROR: Los flags no se establecieron correctamente');
      throw new Error('No se pudieron establecer los flags de protección');
    }
    
    // 5. Contar datos existentes
    let totalDatos = 0;
    const keysImportantes = [
      'banco_alimentos_usuarios',
      'organismos_banco_alimentos',
      'banco_alimentos_comandas',
      'banco_alimentos_productos',
      'banco_alimentos_movimientos',
      'banco_alimentos_vehiculos',
      'banco_alimentos_rutas',
      'banco_alimentos_transportes',
      'contactos_departamentos',
      'benevoles_banco_alimentos'
    ];
    
    keysImportantes.forEach(key => {
      const data = localStorage.getItem(key);
      if (data && data !== '[]' && data !== 'null') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            totalDatos += parsed.length;
          }
        } catch (e) {
          // Ignorar errores de parseo
        }
      }
    });
    
    console.log(`✅ 5/5 - Datos encontrados: ${totalDatos} registros`);
    
    console.log('');
    console.log('🎉 ═══════════════════════════════════════════════════════════');
    console.log('🎉 PROTECCIÓN ACTIVADA CON ÉXITO');
    console.log('🎉 ═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 ESTADO ACTUAL:');
    console.log('   🔒 Sistema con datos reales: ✅ ACTIVO');
    console.log('   🛡️ Limpieza automática: ❌ DESHABILITADA');
    console.log(`   📊 Total de registros protegidos: ${totalDatos}`);
    console.log('');
    console.log('✅ TUS DATOS ESTÁN AHORA PROTEGIDOS');
    console.log('✅ Puedes recargar la página sin preocuparte');
    console.log('');
    
    // Retornar resumen
    return {
      protegido: true,
      registros: totalDatos,
      timestamp: new Date().toISOString()
    } as any;
    
  } catch (error) {
    console.error('');
    console.error('❌ ═══════════════════════════════════════════════════════════');
    console.error('❌ ERROR EN LA PROTECCIÓN DE EMERGENCIA');
    console.error('❌ ═══════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('🆘 ACCIÓN REQUERIDA:');
    console.error('   1. Toma una captura de este error');
    console.error('   2. NO recargues la página');
    console.error('   3. Contacta al soporte técnico');
    console.error('');
    
    throw error;
  }
}

/**
 * Verificar el estado de protección actual
 */
export function verificarProteccion(): void {
  console.log('');
  console.log('🔍 ═══════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN DEL ESTADO DE PROTECCIÓN');
  console.log('🔍 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const sistemaProtegido = localStorage.getItem('sistema_con_datos_reales') === 'true';
  const limpiezaEjecutada = localStorage.getItem('limpieza_completa_ejecutada') === 'true';
  const fechaLimpieza = localStorage.getItem('limpieza_completa_fecha');
  
  console.log('📋 FLAGS DE PROTECCIÓN:');
  console.log(`   sistema_con_datos_reales: ${sistemaProtegido ? '✅ true' : '❌ false'}`);
  console.log(`   limpieza_completa_ejecutada: ${limpiezaEjecutada ? '✅ true' : '❌ false'}`);
  console.log(`   limpieza_completa_fecha: ${fechaLimpieza || '❌ no establecida'}`);
  console.log('');
  
  if (sistemaProtegido && limpiezaEjecutada) {
    console.log('✅ ESTADO: PROTEGIDO');
    console.log('✅ Tus datos NO se eliminarán al recargar');
  } else {
    console.log('⚠️ ESTADO: NO PROTEGIDO');
    console.log('⚠️ Tus datos pueden eliminarse al recargar');
    console.log('');
    console.log('🆘 EJECUTA INMEDIATAMENTE:');
    console.log('   proteccionEmergencia()');
  }
  console.log('');
}

/**
 * Listar todos los datos en localStorage
 */
export function listarDatos(): void {
  console.log('');
  console.log('📊 ═══════════════════════════════════════════════════════════');
  console.log('📊 LISTADO DE DATOS EN LOCALSTORAGE');
  console.log('📊 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const keysImportantes = {
    'USUARIOS': ['banco_alimentos_usuarios'],
    'ORGANISMOS': ['organismos_banco_alimentos'],
    'COMANDAS': ['banco_alimentos_comandas'],
    'INVENTARIO': ['banco_alimentos_productos', 'banco_alimentos_movimientos'],
    'TRANSPORTE': ['banco_alimentos_vehiculos', 'banco_alimentos_rutas', 'banco_alimentos_transportes'],
    'CONTACTOS': ['contactos_departamentos', 'benevoles_banco_alimentos'],
    'OFERTAS': ['ofertas_organismos'],
    'IDS DIGITALES': ['banco_alimentos_ids_digitales']
  };
  
  let totalGeneral = 0;
  
  Object.entries(keysImportantes).forEach(([categoria, keys]) => {
    console.log(`\n📁 ${categoria}:`);
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data && data !== '[]' && data !== 'null') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            const count = parsed.length;
            totalGeneral += count;
            console.log(`   ${key}: ${count} registros`);
          }
        } catch (e) {
          console.log(`   ${key}: (error al parsear)`);
        }
      } else {
        console.log(`   ${key}: 0 registros`);
      }
    });
  });
  
  console.log('');
  console.log(`📊 TOTAL: ${totalGeneral} registros en localStorage`);
  console.log('');
}

// Exportar funciones al objeto window para acceso desde consola
if (typeof window !== 'undefined') {
  (window as any).proteccionEmergencia = proteccionEmergencia;
  (window as any).verificarProteccion = verificarProteccion;
  (window as any).listarDatos = listarDatos;
  
  console.log('');
  console.log('🆘 ═══════════════════════════════════════════════════════════');
  console.log('🆘 FUNCIONES DE EMERGENCIA DISPONIBLES EN CONSOLA');
  console.log('🆘 ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Comandos disponibles:');
  console.log('   proteccionEmergencia()  - Proteger datos inmediatamente');
  console.log('   verificarProteccion()   - Ver estado de protección');
  console.log('   listarDatos()           - Listar todos los datos');
  console.log('');
}
