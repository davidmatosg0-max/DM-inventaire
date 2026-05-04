import { inicializarUnidades } from './unidadStorage';
import { inicializarDepartamentos } from './departamentosStorage';
import { migrarClavesDeAcceso } from './organismosStorage';
import { inicializarConfigSupport } from './supportConfig';
import { logger } from './logger';
import { runDataMigrations } from './dataMigration';
import {
  diagnosticarAutoBackup,
  ejecutarBackupAutomatico,
  limpiarTodosLosBackups,
  verificarTamañoBackups,
} from './autoBackupStorage';
import { inicializarFileSystem } from './fileSystemAccess';
import './verificarPRS';
import './proteccionEmergencia';
import './proteccionRestauracion';
import { inicializarSincronizacionAutomatica } from './sincronizarVoluntariosEntrepot';
import './debugSincronizacion';
import { inicializarComandosConsola } from './comandosConsola';
import './verificarVoluntarios';
import './normalizarEstadosBenevoles';
import { migrarFlagsCostco, yaMigradoCostco, marcarMigracionCostco } from './migrateCostcoFlags';
import './migrateCostcoFlags';
import { migrarProgramasEntrada, yaMigradoProgramas, marcarMigracionProgramas } from './migrateProgramasEntrada';
import './migrateProgramasEntrada';
import { migrarPesoUnitarioProductos } from './productStorage';
import { migrarProductosDuplicadosInventario } from './entradaInventarioStorage';
import { inicializarProteccionDatos } from './proteccionDatos';
import './debugBenevoles';
import { sincronizarTodosLosBenevolesConContactos } from './debugBenevoles';
import './debugContactosDepartamentos';
import './limpiarContactosDepartamento';
import './ejemplosFuncionalesPrueba';

export async function runAppBootstrap() {
  inicializarProteccionDatos();

  localStorage.setItem('sistema_con_datos_reales', 'true');
  localStorage.setItem('limpieza_completa_ejecutada', 'true');
  localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());

  logger.info('🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA');
  logger.info('🛡️ Sistema marcado como CON DATOS REALES');
  logger.info('🛡️ Limpieza automática PERMANENTEMENTE DESHABILITADA');

  runDataMigrations();
  logger.info('✅ Sistema protegido - Limpieza automática omitida');

  inicializarUnidades();

  if (!localStorage.getItem('departamentos_banco_alimentos')) {
    inicializarDepartamentos();
  }

  migrarClavesDeAcceso();
  inicializarConfigSupport();

  try {
    console.log('🧹 Verificando backups en localStorage...');
    const backupsExistentes = localStorage.getItem('storedBackups');
    if (backupsExistentes) {
      const tamañoBackups = new Blob([backupsExistentes]).size;
      console.warn(`⚠️ Encontrados backups almacenados: ${(tamañoBackups / 1024 / 1024).toFixed(2)} MB`);
      console.warn('⚠️ LIMPIANDO TODOS los backups para prevenir errores de cuota...');
      localStorage.removeItem('storedBackups');
      console.log('✅ Backups eliminados exitosamente');
    } else {
      console.log('✅ No hay backups almacenados');
    }

    const configBackup = localStorage.getItem('autoBackupConfig');
    if (configBackup) {
      try {
        const config = JSON.parse(configBackup);
        if (config.enabled) {
          console.warn('⚠️ Backups automáticos estaban activados, DESACTIVANDO...');
          config.enabled = false;
          localStorage.setItem('autoBackupConfig', JSON.stringify(config));
          console.log('✅ Backups automáticos DESACTIVADOS permanentemente');
        }
      } catch {
        console.warn('⚠️ Error al verificar config de backups, eliminando...');
        localStorage.removeItem('autoBackupConfig');
      }
    }

    console.log('💡 IMPORTANTE: Los backups automáticos están DESACTIVADOS por defecto');
    console.log('💡 Para crear backups, usa el botón "Descargar Backup" manualmente');
  } catch (cleanError) {
    console.error('⚠️ Error al verificar backups:', cleanError);
    try {
      localStorage.removeItem('storedBackups');
      localStorage.removeItem('autoBackupConfig');
      console.log('✅ Backups y configuración eliminados por seguridad');
    } catch (error) {
      console.error('❌ No se pudo limpiar backups:', error);
    }
  }

  logger.info('⏸️ Sistema de backup automático desactivado (usa backups manuales)');

  if (typeof window !== 'undefined') {
    (window as any).diagnosticarBackup = diagnosticarAutoBackup;
    (window as any).ejecutarBackupManual = ejecutarBackupAutomatico;
    (window as any).limpiarBackups = limpiarTodosLosBackups;
    (window as any).verificarBackups = verificarTamañoBackups;
    console.log('🔧 Funciones de diagnóstico de backup disponibles en consola:');
    console.log('  - diagnosticarBackup() - Ver estado completo del sistema');
    console.log('  - ejecutarBackupManual() - Ejecutar backup inmediato');
    console.log('  - verificarBackups() - Ver tamaño y uso de espacio ✅ NUEVO');
    console.log('  - limpiarBackups() - Limpiar TODOS los backups (emergencia) ✅ NUEVO');
  }

  inicializarFileSystem().then(() => {
    logger.info('📁 Sistema de archivos inicializado');
  }).catch((error) => {
    logger.warn('⚠️ No se pudo inicializar el sistema de archivos:', error);
  });

  inicializarSincronizacionAutomatica();
  logger.info('🔄 Sincronización automática de voluntarios Entrepôt inicializada');

  if (!yaMigradoCostco()) {
    migrarFlagsCostco();
    marcarMigracionCostco();
    logger.info('🔄 Flags de Costco migrados');
  }

  if (!yaMigradoProgramas()) {
    migrarProgramasEntrada();
    marcarMigracionProgramas();
    logger.info('🔄 Programas de entrada migrados');
  }

  const productosCorregidos = migrarPesoUnitarioProductos();
  if (productosCorregidos > 0) {
    logger.info(`🔄 Peso unitario de productos migrado: ${productosCorregidos} producto(s) corregido(s)`);
  }

  const duplicadosInventario = migrarProductosDuplicadosInventario();
  if (duplicadosInventario.productosFusionados > 0) {
    logger.info(
      `🔄 Duplicados de inventario fusionados: ${duplicadosInventario.productosFusionados} producto(s), ${duplicadosInventario.entradasReasignadas} entrada(s), ${duplicadosInventario.movimientosReasignados} movimiento(s)`
    );
  }

  inicializarComandosConsola();
  logger.info('🔧 Comandos de diagnóstico en consola inicializados');

  try {
    const resultado = sincronizarTodosLosBenevolesConContactos();
    if (resultado.actualizados > 0) {
      logger.info(`🔄 Sincronización de benevoles: ${resultado.actualizados}/${resultado.total} actualizado(s)`);
    }
  } catch (error) {
    logger.warn('⚠️ Error al sincronizar benevoles:', error);
  }
}