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
import { hydrateCriticalStorageFromCloud, isCloudPersistenceEnabled } from './cloudPersistence';

const CLAVES_OBSOLETAS_CUISINE = ['productos_cocina_pendientes'];

function limpiarDatosObsoletosCuisine(): void {
  CLAVES_OBSOLETAS_CUISINE.forEach((clave) => {
    if (localStorage.getItem(clave) !== null) {
      localStorage.removeItem(clave);
      logger.info(`🧹 Clave obsoleta eliminada: ${clave}`);
    }
  });

  if (localStorage.getItem('comandas-tab-activo') === 'ofertas-cocina') {
    localStorage.removeItem('comandas-tab-activo');
    logger.info('🧹 Tab obsoleto de ofertas cuisine eliminado');
  }
}

export async function runAppBootstrap() {
  inicializarProteccionDatos();

  if (isCloudPersistenceEnabled()) {
    await hydrateCriticalStorageFromCloud();
    logger.info('Persistencia remota crítica hidratada desde Supabase');
  }

  localStorage.setItem('sistema_con_datos_reales', 'true');
  localStorage.setItem('limpieza_completa_ejecutada', 'true');
  localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());

  logger.info('🔒🔒🔒 PROTECCIÓN MÁXIMA ACTIVADA');
  logger.info('🛡️ Sistema marcado como CON DATOS REALES');
  logger.info('🛡️ Limpieza automática PERMANENTEMENTE DESHABILITADA');

  runDataMigrations();
  limpiarDatosObsoletosCuisine();
  logger.info('✅ Sistema protegido - Limpieza automática omitida');

  inicializarUnidades();

  if (!localStorage.getItem('departamentos_banco_alimentos')) {
    inicializarDepartamentos();
  }

  migrarClavesDeAcceso();
  inicializarConfigSupport();

  try {
    console.log('🧹 Vérification des sauvegardes dans localStorage...');
    const backupsExistentes = localStorage.getItem('storedBackups');
    if (backupsExistentes) {
      const tamañoBackups = new Blob([backupsExistentes]).size;
      console.warn(`⚠️ Sauvegardes stockées détectées : ${(tamañoBackups / 1024 / 1024).toFixed(2)} MB`);
      console.warn('⚠️ SUPPRESSION de toutes les sauvegardes pour éviter les erreurs de quota...');
      localStorage.removeItem('storedBackups');
      console.log('✅ Sauvegardes supprimées avec succès');
    } else {
      console.log('✅ Aucune sauvegarde stockée');
    }

    const configBackup = localStorage.getItem('autoBackupConfig');
    if (configBackup) {
      try {
        const config = JSON.parse(configBackup);
        if (config.enabled) {
          console.warn('⚠️ Les sauvegardes automatiques étaient activées, désactivation en cours...');
          config.enabled = false;
          localStorage.setItem('autoBackupConfig', JSON.stringify(config));
          console.log('✅ Sauvegardes automatiques DÉSACTIVÉES de façon permanente');
        }
      } catch {
        console.warn('⚠️ Erreur lors de la vérification de la configuration des sauvegardes, suppression...');
        localStorage.removeItem('autoBackupConfig');
      }
    }

    console.log('💡 IMPORTANT : les sauvegardes automatiques sont DÉSACTIVÉES par défaut');
    console.log('💡 Pour créer des sauvegardes, utilisez manuellement le bouton « Télécharger la sauvegarde »');
  } catch (cleanError) {
    console.error('⚠️ Erreur lors de la vérification des sauvegardes :', cleanError);
    try {
      localStorage.removeItem('storedBackups');
      localStorage.removeItem('autoBackupConfig');
      console.log('✅ Sauvegardes et configuration supprimées par sécurité');
    } catch (error) {
      console.error('❌ Impossible de nettoyer les sauvegardes :', error);
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
    console.log('  - nettoyerSauvegardes() - Nettoyer TOUTES les sauvegardes (urgence) ✅ NOUVEAU');
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