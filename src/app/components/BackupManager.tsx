import React, { useState } from 'react';
import { Download, Upload, Database, CheckCircle, AlertTriangle, Info, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { backupLocalStorage, restoreLocalStorage, downloadBackup, inspectLocalStorage } from '../utils/dataMigration';
import { AutoBackupConfig } from './backup/AutoBackupConfig';
import { marcarComoSistemaConDatosReales, sistemaConDatosReales } from '../utils/inicializarDatosEjemplo';

export function BackupManager() {
  const [backupInfo, setBackupInfo] = useState<string>('');
  const [datosProtegidos, setDatosProtegidos] = useState<boolean>(sistemaConDatosReales());

  const handleDownloadBackup = () => {
    try {
      // Mostrar información en consola antes de descargar
      console.log('');
      console.log('╔═══════════════════════════════════════╗');
      console.log('║   TÉLÉCHARGEMENT DU BACKUP COMPLET    ║');
      console.log('╚═══════════════════════════════════════╝');
      console.log('');
      console.log('📦 Création du backup de TOUTES les données...');
      console.log('');
      
      downloadBackup();
      
      toast.success('✅ Backup complet téléchargé avec succès!', {
        description: '📋 Consultez la console pour voir les statistiques détaillées. Conservez ce fichier en lieu sûr.',
        duration: 6000
      });
      
      // Mostrar recordatorio después de la descarga
      setTimeout(() => {
        console.log('');
        console.log('💡 RAPPEL IMPORTANT:');
        console.log('   • Le backup contient TOUTES vos données');
        console.log('   • Conservez ce fichier en lieu sûr');
        console.log('   • Vous pouvez le restaurer à tout moment');
        console.log('   • Vérifiez les statistiques ci-dessus');
        console.log('');
      }, 500);
    } catch (error) {
      toast.error('Erreur lors du téléchargement du backup');
      console.error(error);
    }
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (confirm('⚠️ ATTENTION: Cette opération remplacera toutes les données actuelles. Voulez-vous continuer?')) {
        // 🔒 MARCAR COMO PROTEGIDO ANTES DE RESTAURAR
        localStorage.setItem('sistema_con_datos_reales', 'true');
        localStorage.setItem('limpieza_completa_ejecutada', 'true');
        localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
        
        const success = restoreLocalStorage(content);
        
        if (success) {
          // 🔒 MARCAR NUEVAMENTE COMO PROTEGIDO DESPUÉS DE RESTAURAR
          localStorage.setItem('sistema_con_datos_reales', 'true');
          localStorage.setItem('limpieza_completa_ejecutada', 'true');
          localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
          marcarComoSistemaConDatosReales();
          
          // Actualizar estado de protección
          setDatosProtegidos(true);
          
          toast.success('✅ Données restaurées avec succès!', {
            description: '🔄 Migration automatique des clés de stockage effectuée. Rechargez la page (F5) pour voir les changements.',
            duration: 8000
          });
          
          // Mostrar instrucciones en consola
          console.log('');
          console.log('═══════════════════════════════════════');
          console.log('✅ BACKUP RESTAURÉ AVEC SUCCÈS');
          console.log('═══════════════════════════════════════');
          console.log('🔄 Migrations appliquées:');
          console.log('   • productos_banco_alimentos → banco_alimentos_productos');
          console.log('   • categorias_banco_alimentos → banco_alimentos_categorias');
          console.log('');
          console.log('📋 PROCHAINES ÉTAPES:');
          console.log('   1. Rechargez la page (appuyez sur F5)');
          console.log('   2. Vérifiez que vos produits et catégories sont visibles');
          console.log('   3. Vos données sont maintenant protégées 🔒');
          console.log('═══════════════════════════════════════');
          console.log('');
          
          // 🔒 NO RECARGAR AUTOMÁTICAMENTE - Dejar que el usuario lo haga manualmente
          // setTimeout(() => window.location.reload(), 1500);
          
          console.log('🔒🔒🔒 BACKUP RESTAURÉ ET PROTÉGÉ');
          console.log('🛡️ Vous pouvez recharger la page en toute sécurité (F5)');
        } else {
          toast.error('Erreur lors de la restauration des données');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
  };

  const handleInspect = () => {
    const backup = backupLocalStorage();
    setBackupInfo(backup);
    inspectLocalStorage(); // También muestra en consola
    toast.info('📋 Inspection complète affichée dans la console', {
      description: 'Vérifiez toutes les données stockées et leurs tailles',
      duration: 4000
    });
  };

  const handleVerifierBackup = () => {
    console.log('');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   VÉRIFICATION DU BACKUP COMPLET      ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('');
    
    // Crear backup temporal para verificar
    const backupTemp = backupLocalStorage();
    const backupObj = JSON.parse(backupTemp);
    const keysCount = Object.keys(backupObj).length;
    const localStorageCount = localStorage.length;
    
    console.log('🔍 VÉRIFICATION:');
    console.log(`   • Clés dans localStorage: ${localStorageCount}`);
    console.log(`   • Clés dans le backup: ${keysCount}`);
    
    if (keysCount === localStorageCount) {
      console.log('   ✅ TOUTES les clés sont incluses dans le backup!');
      toast.success('✅ Vérification réussie!', {
        description: `Le backup contient TOUTES les ${keysCount} clés du système`,
        duration: 5000
      });
    } else {
      console.warn('   ⚠️ ATTENTION: Il manque des clés dans le backup!');
      console.warn(`   Différence: ${localStorageCount - keysCount} clés manquantes`);
      toast.warning('⚠️ Vérification incomplète', {
        description: `${localStorageCount - keysCount} clés manquantes dans le backup`,
        duration: 5000
      });
    }
    
    console.log('');
    console.log('📊 MODULES DÉTECTÉS:');
    
    // Verificar módulos específicos
    const modulesCheck = {
      'Productos': ['producto', 'banco_alimentos_productos'],
      'Categorías': ['categoria', 'banco_alimentos_categorias'],
      'Comandas': ['comanda'],
      'Organismos': ['organismo'],
      'Usuarios': ['usuario'],
      'Inventario': ['inventario', 'entrada'],
      'Departamentos': ['departamento'],
      'Contactos': ['contacto'],
      'Bénévoles': ['benevole'],
      'Unidades': ['unidad'],
      'Ofertas': ['oferta'],
      'Donateurs/Fournisseurs': ['donateur', 'fournisseur'],
      'Recetas': ['receta'],
      'Auditoría': ['audit', 'log'],
    };
    
    Object.entries(modulesCheck).forEach(([module, keywords]) => {
      const keysFound = Object.keys(backupObj).filter(key => 
        keywords.some(keyword => key.toLowerCase().includes(keyword))
      );
      
      if (keysFound.length > 0) {
        console.log(`   ✅ ${module}: ${keysFound.length} clé(s) trouvée(s)`);
        keysFound.forEach(key => console.log(`      • ${key}`));
      } else {
        console.log(`   ⚪ ${module}: Aucune clé trouvée`);
      }
    });
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('✅ VÉRIFICATION TERMINÉE');
    console.log('═══════════════════════════════════════');
    console.log('');
  };

  const handleProtegerDatos = () => {
    if (confirm('🔒 PROTEGER DATOS\n\nEsta acción marcará sus datos actuels comme DATOS REALES et évitera que se eliminen automatiquement.\n\n¿Desea continuar?')) {
      marcarComoSistemaConDatosReales();
      setDatosProtegidos(true);
      toast.success('✅ Datos protegidos avec succès', {
        description: 'Sus datos no se eliminarán automatiquement al recargar la page'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔒 PANEL DE PROTECCIÓN DE DATOS - EMERGENCIA */}
      <div className={`rounded-xl border p-6 shadow-sm ${datosProtegidos ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-3 rounded-lg ${datosProtegidos ? 'bg-green-100' : 'bg-red-100'}`}>
              <Shield className={`w-6 h-6 ${datosProtegidos ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: datosProtegidos ? '#059669' : '#DC2626' }}>
                {datosProtegidos ? '🔒 Données Protégées' : '⚠️ Données Non Protégées'}
              </h3>
              <p className={`text-sm mb-2 ${datosProtegidos ? 'text-green-800' : 'text-red-800'}`}>
                {datosProtegidos 
                  ? 'Vos données sont marquées comme DONNÉES RÉELLES et ne seront PAS supprimées automatiquement lors du rechargement de la page.'
                  : 'ATTENTION: Vos données peuvent être supprimées lors du rechargement. Protégez-les maintenant!'
                }
              </p>
              {!datosProtegidos && (
                <ul className="text-xs text-red-700 space-y-1 ml-4">
                  <li>• La première fois que vous rechargez, le système nettoie les données d'exemple</li>
                  <li>• Si vos données ne sont pas protégées, elles seront supprimées</li>
                  <li>• Utilisez le bouton ci-dessous pour les protéger IMMÉDIATEMENT</li>
                </ul>
              )}
            </div>
          </div>
          {!datosProtegidos && (
            <Button
              onClick={handleProtegerDatos}
              className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
            >
              <Shield className="w-4 h-4 mr-2" />
              Protéger Maintenant
            </Button>
          )}
          {datosProtegidos && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Activé</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Gestion des Sauvegardes
            </h3>
            <p className="text-sm text-gray-600">
              Sauvegardez et restaurez vos données
            </p>
          </div>
        </div>

        {/* Información importante */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">Importante</p>
              <p className="text-blue-800 mb-2">
                Les données sont stockées dans le navigateur (localStorage). Elles persistent entre les sessions mais peuvent être perdues si:
              </p>
              <ul className="text-blue-700 space-y-1 ml-4">
                <li>• Vous videz le cache du navigateur</li>
                <li>• Vous utilisez un autre navigateur ou appareil</li>
                <li>• Les données du navigateur sont supprimées</li>
              </ul>
              <p className="text-blue-800 mt-2 font-semibold">
                💡 Recommandation: Téléchargez régulièrement un backup de sécurité
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Descargar Backup */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Télécharger Backup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Créez une copie de toutes vos données au format JSON
            </p>
            <Button
              onClick={handleDownloadBackup}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>

          {/* Restaurar Backup */}
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Restaurer Backup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Restaurez vos données depuis un fichier de sauvegarde
            </p>
            <label htmlFor="restore-backup" className="cursor-pointer">
              <Button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => document.getElementById('restore-backup')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Restaurer
              </Button>
            </label>
            <input
              id="restore-backup"
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </div>
        </div>

        {/* Inspeccionar y Verificar datos - Grid de 2 columnas */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Inspeccionar datos */}
          <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Inspecter les Données</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Consultez la taille et le contenu de votre localStorage
            </p>
            <Button
              onClick={handleInspect}
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <Info className="w-4 h-4 mr-2" />
              Inspecter (voir console)
            </Button>
          </div>

          {/* Verificar Backup */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Vérifier le Backup</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Vérifiez que TOUTES les clés sont incluses dans le backup
            </p>
            <Button
              onClick={handleVerifierBackup}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Vérifier Intégrité
            </Button>
          </div>
        </div>

        {/* Advertencias */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 mb-1">Avertissement</p>
              <ul className="text-yellow-800 space-y-1">
                <li>• Ne partagez jamais votre fichier de backup (contient des données sensibles)</li>
                <li>• La restauration remplace TOUTES les données actuelles</li>
                <li>• Assurez-vous d'avoir un backup récent avant de restaurer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Características de localStorage */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Qu'est-ce qui est sauvegardé automatiquement?
          </h4>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Utilisateurs et sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Inventaire et produits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Commandes et organismes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Offres et demandes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Transport et véhicules</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Configurations système</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Départements et contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Bénévoles et recrutement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Automatización */}
      <AutoBackupConfig />
    </div>
  );
}