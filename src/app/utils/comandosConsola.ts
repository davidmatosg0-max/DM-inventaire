/**
 * 🔧 COMANDOS DE CONSOLA PARA DIAGNÓSTICO
 * 
 * Usa estos comandos en la consola del navegador (F12) para diagnosticar problemas
 */

import { 
  buscarVoluntarioPorNombre, 
  auditarIntegridad, 
  exportarDatosCompletos,
  listarBackups,
  crearBackupSeguridad 
} from './recuperarDatos';

// Exponer comandos globales en window
declare global {
  interface Window {
    BA: {
      buscarVoluntario: (nombre: string) => void;
      auditar: () => void;
      exportar: () => void;
      listarBackups: () => void;
      crearBackup: () => void;
      recuperarYves: () => void;
      listarTodos: () => void;
      verStorage: () => void;
    };
  }
}

/**
 * Buscar un voluntario por nombre, apellido o email
 * Uso: BA.buscarVoluntario('Yves')
 */
const buscarVoluntario = (nombre: string) => {
  console.log('🔍 Buscando voluntario:', nombre);
  const resultado = buscarVoluntarioPorNombre(nombre);
  
  if (resultado.encontrado) {
    console.log('%c✅ VOLUNTARIO ENCONTRADO', 'color: green; font-size: 16px; font-weight: bold');
    console.log('📍 Ubicaciones:', resultado.ubicaciones);
    console.log('📊 Datos:', resultado.datos);
  } else {
    console.log('%c❌ VOLUNTARIO NO ENCONTRADO', 'color: red; font-size: 16px; font-weight: bold');
    console.log('💡 Sugerencias:', resultado.sugerencias);
  }
  
  return resultado;
};

/**
 * Auditar integridad de todos los datos
 * Uso: BA.auditar()
 */
const auditar = () => {
  console.log('🔍 Ejecutando auditoría de integridad...');
  const reporte = auditarIntegridad();
  console.log('%c✅ AUDITORÍA COMPLETADA', 'color: blue; font-size: 16px; font-weight: bold');
  return reporte;
};

/**
 * Exportar todos los datos a archivo JSON
 * Uso: BA.exportar()
 */
const exportar = () => {
  console.log('💾 Exportando datos...');
  const resultado = exportarDatosCompletos();
  if (resultado) {
    console.log('%c✅ DATOS EXPORTADOS', 'color: green; font-size: 16px; font-weight: bold');
  }
  return resultado;
};

/**
 * Listar todos los backups disponibles
 * Uso: BA.listarBackups()
 */
const listarBackupsCmd = () => {
  console.log('📦 Listando backups...');
  const backups = listarBackups();
  return backups;
};

/**
 * Crear backup de seguridad
 * Uso: BA.crearBackup()
 */
const crearBackup = () => {
  console.log('💾 Creando backup...');
  const backupKey = crearBackupSeguridad('todos');
  if (backupKey) {
    console.log('%c✅ BACKUP CREADO: ' + backupKey, 'color: green; font-size: 14px; font-weight: bold');
  }
  return backupKey;
};

/**
 * Buscar específicamente a Yves
 * Uso: BA.recuperarYves()
 */
const recuperarYves = () => {
  console.log('%c🔍 BÚSQUEDA ESPECIAL: YVES', 'color: purple; font-size: 18px; font-weight: bold');
  console.log('==========================================');
  
  // Buscar en múltiples variaciones
  const variaciones = ['yves', 'Yves', 'YVES'];
  let encontrado = false;
  
  variaciones.forEach(nombre => {
    const resultado = buscarVoluntario(nombre);
    if (resultado.encontrado) {
      encontrado = true;
    }
  });
  
  if (!encontrado) {
    console.log('%c❌ YVES NO ENCONTRADO EN NINGUNA UBICACIÓN', 'color: red; font-size: 16px; font-weight: bold');
    console.log('');
    console.log('💡 PASOS SIGUIENTES:');
    console.log('1. Verifica si fue eliminado accidentalmente');
    console.log('2. Busca en backups: BA.listarBackups()');
    console.log('3. Revisa el historial del navegador');
    console.log('4. Verifica el localStorage completo: BA.verStorage()');
  }
  
  console.log('==========================================');
};

/**
 * Listar TODOS los voluntarios en el sistema
 * Uso: BA.listarTodos()
 */
const listarTodos = () => {
  console.log('%c📋 LISTADO COMPLETO DE VOLUNTARIOS', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('==========================================');
  
  // Módulo principal
  const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
  if (benevolesData) {
    const benevoles = JSON.parse(benevolesData);
    console.log(`\n1️⃣ MÓDULO BÉNÉVOLES PRINCIPAL (${benevoles.length} registros):`);
    benevoles.forEach((b: any, idx: number) => {
      console.log(`   ${idx + 1}. ${b.prenom} ${b.nom} - ${b.email} - ${b.statut}`);
    });
  }
  
  // Contactos de departamento
  const contactosData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
  if (contactosData) {
    const contactos = JSON.parse(contactosData);
    const benevolesContactos = contactos.filter((c: any) => c.tipo === 'benevole');
    console.log(`\n2️⃣ CONTACTOS DEPARTAMENTO (${benevolesContactos.length} bénévoles):`);
    benevolesContactos.forEach((c: any, idx: number) => {
      console.log(`   ${idx + 1}. ${c.nombre} ${c.apellido} - ${c.email} - Dept: ${c.departamentoId}`);
    });
  }
  
  console.log('\n==========================================');
};

/**
 * Ver TODO el contenido de localStorage
 * Uso: BA.verStorage()
 */
const verStorage = () => {
  console.log('%c💾 CONTENIDO DE LOCALSTORAGE', 'color: purple; font-size: 16px; font-weight: bold');
  console.log('==========================================');
  
  const keys = Object.keys(localStorage).filter(k => k.startsWith('banqueAlimentaire_'));
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Array.isArray(parsed) ? parsed.length : 'N/A';
        console.log(`\n📦 ${key}:`);
        console.log(`   Registros: ${count}`);
        console.log(`   Tamaño: ${(data.length / 1024).toFixed(2)} KB`);
      } catch (e) {
        console.log(`\n📦 ${key}: [No es JSON o está corrupto]`);
      }
    }
  });
  
  console.log('\n==========================================');
};

/**
 * Inicializar comandos en window
 */
export const inicializarComandosConsola = () => {
  window.BA = {
    buscarVoluntario,
    auditar,
    exportar,
    listarBackups: listarBackupsCmd,
    crearBackup,
    recuperarYves,
    listarTodos,
    verStorage
  };
  
  // Mensaje de bienvenida
  console.log('%c🏦 BANQUE ALIMENTAIRE - COMANDOS DE DIAGNÓSTICO', 'background: #1a4d7a; color: white; font-size: 16px; padding: 10px; font-weight: bold');
  console.log('');
  console.log('%c🆘 IMPORTANTE: ¿Has perdido un voluntario?', 'background: #dc3545; color: white; font-size: 14px; padding: 8px; font-weight: bold');
  console.log('');
  console.log('%c👉 Usa estos comandos para buscarlo:', 'font-size: 13px; font-weight: bold; color: #FF9800');
  console.log('%c   BA.recuperarYves()', 'background: #2d9561; color: white; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px');
  console.log('%c   BA.buscarVoluntario("nombre")', 'background: #2d9561; color: white; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px');
  console.log('');
  console.log('%c🔍 NUEVOS COMANDOS DE VERIFICACIÓN:', 'background: #FF9800; color: white; font-size: 14px; padding: 6px; font-weight: bold');
  console.log('%c   verificarVoluntarios()', 'background: #2196F3; color: white; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px', '- Ver TODOS los voluntarios actuales');
  console.log('%c   buscarVoluntario("nombre")', 'background: #2196F3; color: white; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px', '- Buscar voluntario específico');
  console.log('%c   contarActivos()', 'background: #2196F3; color: white; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px', '- Contar voluntarios activos');
  console.log('');
  console.log('%c🔧 COMANDO DE REPARACIÓN:', 'background: #dc3545; color: white; font-size: 14px; padding: 6px; font-weight: bold');
  console.log('%c   normalizarEstados()', 'background: #FFC107; color: black; font-size: 14px; padding: 4px 8px; font-weight: bold; border-radius: 4px', '- Corregir estados "Actif"→"actif"');
  console.log('');
  console.log('%cOtros comandos disponibles:', 'font-size: 14px; font-weight: bold');
  console.log('');
  console.log('%cBA.auditar()', 'color: #2d9561; font-weight: bold', '- Auditar integridad de datos');
  console.log('%cBA.exportar()', 'color: #2d9561; font-weight: bold', '- Exportar todos los datos a archivo JSON');
  console.log('%cBA.crearBackup()', 'color: #2d9561; font-weight: bold', '- Crear backup de seguridad');
  console.log('%cBA.listarBackups()', 'color: #2d9561; font-weight: bold', '- Listar backups disponibles');
  console.log('%cBA.listarTodos()', 'color: #2d9561; font-weight: bold', '- Listar TODOS los voluntarios');
  console.log('%cBA.verStorage()', 'color: #2d9561; font-weight: bold', '- Ver contenido completo de localStorage');
  console.log('');
  console.log('%c═══════════════════════════════════════════════', 'color: #1a4d7a');
  console.log('');
};