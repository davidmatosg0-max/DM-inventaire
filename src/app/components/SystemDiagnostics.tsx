/**
 * COMPONENTE DE DIAGNÓSTICO DEL SISTEMA
 * Muestra el estado de salud del sistema y permite realizar acciones de mantenimiento
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  RefreshCw,
  Trash2,
  XCircle,
  TrendingUp,
  Package,
  Users,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useBranding } from '../../hooks/useBranding';
import {
  verificarIntegridadSistema,
  generarReporteSalud,
  limpiarDatosAntiguos,
  exportarDatosCompletos,
  repararDatosCorruptos,
} from '../utils/systemValidation';
import { logger } from '../utils/logger';
import { descargarArchivoConCarpetaPredefinida } from '../utils/fileSystemAccess';

export function SystemDiagnostics() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [salud, setSalud] = useState<{
    ok: boolean;
    errores: string[];
    advertencias: string[];
  } | null>(null);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  // Cargar estadísticas al montar
  useEffect(() => {
    verificarSalud();
    cargarEstadisticas();
  }, []);

  const verificarSalud = () => {
    const resultado = verificarIntegridadSistema();
    setSalud(resultado);
    
    if (!resultado.ok) {
      logger.warn('Problemas detectados en el sistema', resultado);
    }
  };

  const cargarEstadisticas = () => {
    try {
      const stats = {
        productos: JSON.parse(localStorage.getItem('productos_banco_alimentos') || '[]').length,
        comandas: JSON.parse(localStorage.getItem('comandas_banco_alimentos') || '[]').length,
        organismos: JSON.parse(localStorage.getItem('organismos_banco_alimentos') || '[]').length,
        contactos: JSON.parse(localStorage.getItem('banque_alimentaire_contactos_departamento') || '[]').length,
        benevoles: JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]').length, // ✅ CORREGIDO
        departamentos: JSON.parse(localStorage.getItem('departamentos_banco_alimentos') || '[]').length,
      };
      setEstadisticas(stats);
    } catch (e) {
      logger.error('Error al cargar estadísticas', e);
    }
  };

  const handleExportarDatos = async () => {
    try {
      const datos = exportarDatosCompletos();
      const nombreArchivo = `backup-banque-alimentaire-${new Date().toISOString().split('T')[0]}.json`;
      
      const resultado = await descargarArchivoConCarpetaPredefinida(nombreArchivo, datos, 'application/json');
      
      if (resultado.success) {
        if (resultado.usedCustomFolder) {
          toast.success('Backup sauvegardé dans le dossier prédéfini');
        } else {
          toast.success('Datos exportados exitosamente');
        }
        logger.info('Backup creado exitosamente');
      } else {
        throw new Error(resultado.error || 'Error desconocido');
      }
    } catch (e: any) {
      toast.error('Error al exportar datos');
      logger.error('Error al exportar datos', e);
    }
  };

  const handleLimpiarDatosAntiguos = async () => {
    setCargando(true);
    try {
      const { eliminados, detalles } = limpiarDatosAntiguos(90);
      
      if (eliminados > 0) {
        toast.success(`${eliminados} registros eliminados`);
        detalles.forEach(detalle => logger.info(detalle));
      } else {
        toast.info('No hay datos antiguos para limpiar');
      }
      
      cargarEstadisticas();
      verificarSalud();
    } catch (e) {
      toast.error('Error al limpiar datos');
      logger.error('Error al limpiar datos', e);
    } finally {
      setCargando(false);
    }
  };

  const handleRepararDatos = async () => {
    setCargando(true);
    try {
      const { reparado, acciones } = repararDatosCorruptos();
      
      if (reparado) {
        if (acciones.length > 0) {
          toast.success('Datos reparados exitosamente');
          acciones.forEach(accion => logger.info(accion));
        } else {
          toast.info('No se encontraron datos corruptos');
        }
      } else {
        toast.error('No se pudieron reparar los datos');
      }
      
      verificarSalud();
      cargarEstadisticas();
    } catch (e) {
      toast.error('Error al reparar datos');
      logger.error('Error al reparar datos', e);
    } finally {
      setCargando(false);
    }
  };

  const handleGenerarReporte = async () => {
    try {
      const reporte = generarReporteSalud();
      console.log(reporte);
      
      const nombreArchivo = `reporte-salud-${new Date().toISOString().split('T')[0]}.txt`;
      const resultado = await descargarArchivoConCarpetaPredefinida(nombreArchivo, reporte, 'text/plain');
      
      if (resultado.success) {
        if (resultado.usedCustomFolder) {
          toast.success('Rapport sauvegardé dans le dossier prédéfini');
        } else {
          toast.success('Reporte generado y descargado');
        }
      } else {
        throw new Error(resultado.error || 'Error desconocido');
      }
    } catch (e) {
      toast.error('Error al generar reporte');
      logger.error('Error al generar reporte', e);
    }
  };

  if (!salud) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: branding.primaryColor }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: branding.primaryColor, fontFamily: 'Montserrat, sans-serif' }}>
            {t('system.diagnostics') || 'Diagnostics du Système'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('system.diagnosticsSubtitle') || 'Vérification de l\'intégrité et santé du système'}
          </p>
        </div>
        <Button
          onClick={verificarSalud}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh') || 'Actualiser'}
        </Button>
      </div>

      {/* Estado general */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {salud.ok ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {salud.ok ? (
                <span className="text-green-600">{t('system.healthy') || 'Système Sain'}</span>
              ) : (
                <span className="text-red-600">{t('system.needsAttention') || 'Attention Requise'}</span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {salud.ok
                ? t('system.noIssues') || 'Aucun problème détecté'
                : `${salud.errores.length} erreur(s), ${salud.advertencias.length} avertissement(s)`}
            </p>
          </div>
        </div>

        {/* Errores */}
        {salud.errores.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                {t('system.criticalErrors') || 'Erreurs Critiques'}
              </h3>
            </div>
            <ul className="space-y-1 ml-7">
              {salud.errores.map((error, index) => (
                <li key={index} className="text-sm text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Advertencias */}
        {salud.advertencias.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">
                {t('system.warnings') || 'Avertissements'}
              </h3>
            </div>
            <ul className="space-y-1 ml-7">
              {salud.advertencias.map((adv, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  • {adv}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.primaryColor}15` }}>
                <Package className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.products') || 'Produits'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {estadisticas.productos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.secondaryColor}15` }}>
                <FileText className="w-6 h-6" style={{ color: branding.secondaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.orders') || 'Commandes'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                  {estadisticas.comandas}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.primaryColor}15` }}>
                <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.organisms') || 'Organismes'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {estadisticas.organismos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.secondaryColor}15` }}>
                <Users className="w-6 h-6" style={{ color: branding.secondaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('contacts.title') || 'Contacts'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                  {estadisticas.contactos}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.primaryColor}15` }}>
                <Users className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('benevoles.title') || 'Bénévoles'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                  {estadisticas.benevoles}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.secondaryColor}15` }}>
                <Database className="w-6 h-6" style={{ color: branding.secondaryColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('departments.title') || 'Départements'}</p>
                <p className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                  {estadisticas.departamentos}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Acciones de mantenimiento */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: branding.primaryColor }}>
          {t('system.maintenanceActions') || 'Actions de Maintenance'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleExportarDatos}
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
          >
            <Download className="w-5 h-5" style={{ color: branding.primaryColor }} />
            <div className="text-left">
              <p className="font-semibold">{t('system.exportData') || 'Exporter les Données'}</p>
              <p className="text-xs text-gray-600">
                {t('system.exportDataDesc') || 'Créer une sauvegarde complète'}
              </p>
            </div>
          </Button>

          <Button
            onClick={handleGenerarReporte}
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
          >
            <Activity className="w-5 h-5" style={{ color: branding.secondaryColor }} />
            <div className="text-left">
              <p className="font-semibold">{t('system.generateReport') || 'Générer un Rapport'}</p>
              <p className="text-xs text-gray-600">
                {t('system.generateReportDesc') || 'Rapport détaillé de santé'}
              </p>
            </div>
          </Button>

          <Button
            onClick={handleLimpiarDatosAntiguos}
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            disabled={cargando}
          >
            <Trash2 className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold">{t('system.cleanOldData') || 'Nettoyer les Données'}</p>
              <p className="text-xs text-gray-600">
                {t('system.cleanOldDataDesc') || 'Supprimer les données de +90 jours'}
              </p>
            </div>
          </Button>

          <Button
            onClick={handleRepararDatos}
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            disabled={cargando}
          >
            <RefreshCw className={`w-5 h-5 text-blue-600 ${cargando ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <p className="font-semibold">{t('system.repairData') || 'Réparer les Données'}</p>
              <p className="text-xs text-gray-600">
                {t('system.repairDataDesc') || 'Corriger les données corrompues'}
              </p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SystemDiagnostics;