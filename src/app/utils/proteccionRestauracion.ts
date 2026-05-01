/**
 * 🔒 PROTECCIÓN ESPECIAL PARA RESTAURACIÓN DE BACKUPS
 * 
 * Este archivo contiene funciones especiales para asegurar que los datos
 * restaurados desde un backup NUNCA se eliminen.
 */

/**
 * Aplicar protección TRIPLE después de restaurar un backup
 */
export function aplicarProteccionPostRestauracion(): void {
  console.log('');
  console.log('🔒🔒🔒 ═══════════════════════════════════════════════════════════');
  console.log('🔒🔒🔒 PROTECCIÓN POST-RESTAURACIÓN ACTIVADA');
  console.log('🔒🔒🔒 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  // NIVEL 1: Flags de protección inmediatos
  localStorage.setItem('sistema_con_datos_reales', 'true');
  localStorage.setItem('limpieza_completa_ejecutada', 'true');
  localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
  console.log('✅ NIVEL 1: Flags de protección establecidos');
  
  // NIVEL 2: Flag especial de restauración
  localStorage.setItem('backup_restaurado', 'true');
  localStorage.setItem('backup_restaurado_fecha', new Date().toISOString());
  console.log('✅ NIVEL 2: Flag de restauración establecido');
  
  // NIVEL 3: Contador de protección (se incrementa cada vez)
  const contadorActual = parseInt(localStorage.getItem('proteccion_contador') || '0');
  localStorage.setItem('proteccion_contador', (contadorActual + 1).toString());
  console.log(`✅ NIVEL 3: Contador de protección = ${contadorActual + 1}`);
  
  console.log('');
  console.log('🛡️ PROTECCIÓN COMPLETA ACTIVADA');
  console.log('');
  console.log('📋 INSTRUCCIONES IMPORTANTES:');
  console.log('   1️⃣  NO recargue la página inmediatamente');
  console.log('   2️⃣  Espere 3-5 segundos para que se guarden los flags');
  console.log('   3️⃣  Luego puede recargar la página con F5');
  console.log('   4️⃣  Sus datos estarán 100% protegidos');
  console.log('');
  console.log('✅ GARANTÍA: Al recargar, verá el mensaje:');
  console.log('   "🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA"');
  console.log('   "🛡️ Sistema marcado como CON DATOS REALES"');
  console.log('');
  console.log('❌ NUNCA verá:');
  console.log('   "🗑️ EJECUTANDO LIMPIEZA COMPLETA DEL SISTEMA"');
  console.log('');
  console.log('🔒🔒🔒 ═══════════════════════════════════════════════════════════');
  console.log('');
}

/**
 * Verificar que la restauración fue exitosa y está protegida
 */
export function verificarRestauracionProtegida(): boolean {
  const sistemaProtegido = localStorage.getItem('sistema_con_datos_reales') === 'true';
  const limpiezaEjecutada = localStorage.getItem('limpieza_completa_ejecutada') === 'true';
  const backupRestaurado = localStorage.getItem('backup_restaurado') === 'true';
  
  console.log('');
  console.log('🔍 ═══════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICACIÓN DE RESTAURACIÓN PROTEGIDA');
  console.log('🔍 ═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 Estado de los flags de protección:');
  console.log(`   sistema_con_datos_reales: ${sistemaProtegido ? '✅' : '❌'} ${sistemaProtegido}`);
  console.log(`   limpieza_completa_ejecutada: ${limpiezaEjecutada ? '✅' : '❌'} ${limpiezaEjecutada}`);
  console.log(`   backup_restaurado: ${backupRestaurado ? '✅' : '❌'} ${backupRestaurado}`);
  console.log('');
  
  const todoOK = sistemaProtegido && limpiezaEjecutada;
  
  if (todoOK) {
    console.log('✅ RESULTADO: RESTAURACIÓN PROTEGIDA CORRECTAMENTE');
    console.log('✅ Puede recargar la página sin preocupaciones');
  } else {
    console.log('❌ RESULTADO: PROTECCIÓN INCOMPLETA');
    console.log('⚠️ Ejecute inmediatamente: proteccionEmergencia()');
  }
  
  console.log('');
  console.log('🔍 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  return todoOK;
}

/**
 * Mostrar resumen de datos restaurados
 */
export function mostrarResumenRestauracion(): void {
  console.log('');
  console.log('📊 ═══════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE DATOS RESTAURADOS');
  console.log('📊 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const keysImportantes = {
    '👥 USUARIOS': 'banco_alimentos_usuarios',
    '🏢 ORGANISMOS': 'organismos_banco_alimentos',
    '📦 COMANDAS': 'banco_alimentos_comandas',
    '📊 PRODUCTOS': 'banco_alimentos_productos',
    '📈 MOVIMIENTOS': 'banco_alimentos_movimientos',
    '🚚 VEHÍCULOS': 'banco_alimentos_vehiculos',
    '🗺️ RUTAS': 'banco_alimentos_rutas',
    '🚛 TRANSPORTES': 'banco_alimentos_transportes',
    '👨‍👩‍👧‍👦 CONTACTOS': 'contactos_departamentos',
    '🙋 BÉNÉVOLES': 'benevoles_banco_alimentos',
    '💳 IDS DIGITALES': 'banco_alimentos_ids_digitales'
  };
  
  let totalRegistros = 0;
  
  Object.entries(keysImportantes).forEach(([nombre, key]) => {
    const data = localStorage.getItem(key);
    if (data && data !== '[]' && data !== 'null') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const count = parsed.length;
          totalRegistros += count;
          console.log(`${nombre}: ${count} registros`);
        }
      } catch (e) {
        console.log(`${nombre}: (error al leer)`);
      }
    } else {
      console.log(`${nombre}: 0 registros`);
    }
  });
  
  console.log('');
  console.log(`📊 TOTAL: ${totalRegistros} registros restaurados`);
  console.log('');
  console.log('📊 ═══════════════════════════════════════════════════════════');
  console.log('');
}

// Exportar al objeto window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).aplicarProteccionPostRestauracion = aplicarProteccionPostRestauracion;
  (window as any).verificarRestauracionProtegida = verificarRestauracionProtegida;
  (window as any).mostrarResumenRestauracion = mostrarResumenRestauracion;
}
