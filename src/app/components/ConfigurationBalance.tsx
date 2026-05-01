import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBalanceContext } from '../../contexts/BalanceContext';
import { BalanceConfig } from '../../hooks/useBalance';
import { Scale, Wifi, WifiOff, Settings, CheckCircle, AlertCircle, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ConfigurationBalanceProps {
  onWeightChange?: (weight: number, unit: string) => void;
  showInline?: boolean;
}

// Marcas de balanzas soportadas con información detallada
const SUPPORTED_SCALES = [
  { value: 'auto', label: 'Détection Automatique', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'pennsylvania', label: 'Pennsylvania Scale (7500/7600)', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'toledo', label: 'Toledo', baudRate: 9600, dataBits: 7, stopBits: 1, parity: 'even' },
  { value: 'mettler', label: 'Mettler Toledo', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'avery', label: 'Avery Weigh-Tronix', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'cas', label: 'CAS', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'ohaus', label: 'Ohaus', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'digi', label: 'Digi', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'bizerba', label: 'Bizerba', baudRate: 9600, dataBits: 7, stopBits: 1, parity: 'even' },
  { value: 'sartorius', label: 'Sartorius', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'ad', label: 'A&D (AND)', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' },
  { value: 'generic', label: 'Générique', baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' }
];

export function ConfigurationBalance({ onWeightChange, showInline = false }: ConfigurationBalanceProps) {
  const { t } = useTranslation();
  const {
    isSupported,
    isConnected,
    currentWeight,
    error,
    detectedProtocol,
    connect,
    disconnect,
    updateConfig,
    config
  } = useBalanceContext();

  const [showSettings, setShowSettings] = useState(false);
  const [localConfig, setLocalConfig] = useState<BalanceConfig>(config);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sincronizar localConfig cuando cambia config (por ejemplo, al cargar desde localStorage)
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Notificar cambios de peso
  useEffect(() => {
    if (currentWeight && onWeightChange) {
      onWeightChange(currentWeight.weight, currentWeight.unit);
    }
  }, [currentWeight, onWeightChange]);

  // Manejar selección de marca de balanza
  const handleScaleSelect = (scaleValue: string) => {
    const selectedScale = SUPPORTED_SCALES.find(s => s.value === scaleValue);
    if (selectedScale) {
      setLocalConfig({
        ...localConfig,
        protocol: selectedScale.value as any,
        baudRate: selectedScale.baudRate,
        dataBits: selectedScale.dataBits as 7 | 8,
        stopBits: selectedScale.stopBits as 1 | 2,
        parity: selectedScale.parity as any
      });
    }
  };

  // Manejar conexión/desconexión
  const handleToggleConnection = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  // Aplicar configuración
  const handleApplyConfig = () => {
    updateConfig(localConfig);
    const scaleName = SUPPORTED_SCALES.find(s => s.value === localConfig.protocol)?.label || 'Balance';
    toast.success(`💾 Configuration enregistrée: ${scaleName}`, {
      description: 'La configuration de la balance a été mémorisée et sera restaurée automatiquement.',
      duration: 4000
    });
    setShowSettings(false);
  };

  // Vista compacta inline
  if (showInline) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
        <Scale className="w-5 h-5 text-blue-600" />
        
        {isConnected ? (
          <>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700">
                Balance connectée
              </span>
            </div>
            <button
              onClick={disconnect}
              className="ml-auto text-sm text-red-600 hover:text-red-700"
            >
              {t('balance.disconnect')}
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600">Balance déconnectée</span>
            <button
              onClick={connect}
              disabled={!isSupported}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {t('balance.connect')}
            </button>
          </>
        )}
      </div>
    );
  }

  // Vista completa
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-600" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{t('balance.title')}</h2>
                {config.protocol !== 'auto' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-300">
                    ✓ Configuration mémorisée
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {t('balance.subtitle')}
                {config.protocol !== 'auto' && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    • {SUPPORTED_SCALES.find(s => s.value === config.protocol)?.label}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('balance.settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advertencia de compatibilidad */}
      {!isSupported && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-900">{t('balance.notSupported')}</p>
            <p className="text-red-700 mt-1">{t('balance.notSupportedDesc')}</p>
            <div className="mt-3 p-3 bg-white rounded border border-red-300">
              <p className="font-semibold text-red-900 mb-2">Navegadores compatibles:</p>
              <ul className="space-y-1 text-xs text-red-800">
                <li>✅ <strong>Google Chrome</strong> (versión 89+) - Recomendado</li>
                <li>✅ <strong>Microsoft Edge</strong> (versión 89+)</li>
                <li>✅ <strong>Opera</strong> (versión 75+)</li>
                <li>❌ <strong>Firefox</strong> - No soportado</li>
                <li>❌ <strong>Safari</strong> - No soportado</li>
              </ul>
              <p className="mt-2 text-xs text-red-700">
                Por favor, abre esta página en Google Chrome o Microsoft Edge para usar la balanza USB.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Panel de configuración */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 bg-gray-50"
          >
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marque de Balance
                  </label>
                  <select
                    value={localConfig.protocol}
                    onChange={(e) => handleScaleSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUPPORTED_SCALES.map(scale => (
                      <option key={scale.value} value={scale.value}>{scale.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    La configuration sera automatiquement ajustée selon la marque sélectionnée
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('balance.baudRate')}
                  </label>
                  <select
                    value={localConfig.baudRate}
                    onChange={(e) => setLocalConfig({ ...localConfig, baudRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2400}>2400</option>
                    <option value={4800}>4800</option>
                    <option value={9600}>9600</option>
                    <option value={19200}>19200</option>
                    <option value={38400}>38400</option>
                    <option value={57600}>57600</option>
                    <option value={115200}>115200</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('balance.dataBits')}
                  </label>
                  <select
                    value={localConfig.dataBits}
                    onChange={(e) => setLocalConfig({ ...localConfig, dataBits: Number(e.target.value) as 7 | 8 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7</option>
                    <option value={8}>8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Bits
                  </label>
                  <select
                    value={localConfig.stopBits}
                    onChange={(e) => setLocalConfig({ ...localConfig, stopBits: Number(e.target.value) as 1 | 2 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('balance.parity')}
                  </label>
                  <select
                    value={localConfig.parity}
                    onChange={(e) => setLocalConfig({ ...localConfig, parity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">{t('balance.none')}</option>
                    <option value="even">{t('balance.even')}</option>
                    <option value="odd">{t('balance.odd')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flow Control
                  </label>
                  <select
                    value={localConfig.flowControl}
                    onChange={(e) => setLocalConfig({ ...localConfig, flowControl: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Aucun</option>
                    <option value="hardware">Hardware (RTS/CTS)</option>
                  </select>
                </div>
              </div>

              {/* Información sobre balanzas soportadas */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Balances compatibles:</p>
                    <p className="text-xs">
                      Toledo, Mettler Toledo, Avery Weigh-Tronix, CAS, Ohaus, Digi, Bizerba, Sartorius, A&D (AND), Pennsylvania Scale (7500/7600) et autres balances avec sortie série RS-232.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guía de instalación de drivers Pennsylvania Scale */}
              {localConfig.protocol === 'pennsylvania' && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏭</span>
                    <h4 className="font-bold text-orange-900">Pennsylvania Scale 7500/7600 - Guide d'installation</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="font-semibold text-orange-900 mb-2">📥 Installation des pilotes USB-RS232</p>
                      <ol className="ml-4 space-y-1 text-xs">
                        <li><strong>1.</strong> Si votre balance utilise un adaptateur USB-RS232, téléchargez et installez le pilote approprié:</li>
                        <li className="ml-4">• <strong>FTDI</strong>: <a href="https://ftdichip.com/drivers/vcp-drivers/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ftdichip.com/drivers</a> (recommandé)</li>
                        <li className="ml-4">• <strong>Prolific</strong>: pour puces PL2303</li>
                        <li className="ml-4">• <strong>CH340</strong>: pour adaptateurs économiques</li>
                        <li><strong>2.</strong> Redémarrez votre ordinateur après l'installation</li>
                      </ol>
                    </div>

                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="font-semibold text-orange-900 mb-2">⚙️ Configuration de l'indicateur</p>
                      <ul className="ml-4 space-y-1 text-xs">
                        <li>• Activez le mode <strong>"Serial Output"</strong> ou <strong>"Continuous"</strong></li>
                        <li>• Baud Rate: <strong>9600</strong></li>
                        <li>• Data Bits: <strong>8</strong>, Stop Bits: <strong>1</strong>, Parity: <strong>None</strong></li>
                        <li>• Consultez le manuel de votre modèle 7500/7600 pour accéder au menu Setup</li>
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border border-orange-200">
                      <p className="font-semibold text-orange-900 mb-2">🔌 Connexion</p>
                      <ul className="ml-4 space-y-1 text-xs">
                        <li><strong>1.</strong> Allumez votre Pennsylvania Scale 7500/7600</li>
                        <li><strong>2.</strong> Connectez le câble USB (ou USB-RS232) à votre ordinateur</li>
                        <li><strong>3.</strong> Attendez le son de reconnaissance USB de Windows/Mac</li>
                        <li><strong>4.</strong> Cliquez sur "Connecter la Balance" ci-dessous</li>
                      </ul>
                    </div>

                    <div className="p-2 bg-yellow-100 rounded text-xs text-yellow-800 border border-yellow-300">
                      💡 <strong>Astuce:</strong> Si vous ne savez pas quel pilote utiliser, essayez d'abord FTDI (le plus commun pour les adaptateurs USB-RS232).
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleApplyConfig}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('common.apply')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estado y visualización de peso */}
      <div className="px-6 py-6">
        <div className="text-center space-y-6">
          {/* Estado de conexión */}
          <div className="flex items-center justify-center gap-3">
            {isConnected ? (
              <>
                <Wifi className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {t('balance.connected')}
                </span>
                {detectedProtocol !== 'unknown' && (
                  <span className="text-xs text-gray-500">
                    ({detectedProtocol})
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {t('balance.disconnected')}
                </span>
              </>
            )}
          </div>

          {/* Mensaje informativo cuando está conectada */}
          {isConnected && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6 px-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
            >
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-800 font-medium mb-2">Balance connectée avec succès!</p>
              <p className="text-sm text-green-700">
                Le poids s'affichera automatiquement dans le <strong>Formulaire de Nouvelle Entrée</strong> lorsque vous sélectionnerez une unité de type <strong>Paleta (PLT)</strong>.
              </p>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Botón de conexión */}
          <button
            onClick={handleToggleConnection}
            disabled={!isSupported}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all
              ${isConnected 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}
              disabled:bg-gray-300 disabled:cursor-not-allowed
            `}
          >
            {isConnected ? t('balance.disconnect') : t('balance.connect')}
          </button>

          {/* Instrucciones */}
          {!isConnected && isSupported && (
            <div className="mt-4 space-y-4">
              {/* Guide de connexion détaillée */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900">
                    Guide de Connexion de la Balance
                  </h3>
                </div>

                {/* Prérequis */}
                <div className="mb-5 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    1. Prérequis Système
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 ml-7">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Navigateur compatible :</strong> Google Chrome, Microsoft Edge, ou Opera (version récente)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Câble requis :</strong> Câble USB vers RS-232 (si votre balance a uniquement un port série)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Pilote installé :</strong> Si vous utilisez un adaptateur USB-RS232, assurez-vous que le pilote est installé</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Balance allumée :</strong> Votre balance doit être sous tension</span>
                    </li>
                  </ul>
                </div>

                {/* Étapes de connexion */}
                <div className="mb-5 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    2. Étapes de Connexion
                  </h4>
                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Connecter physiquement la balance</p>
                        <p>Branchez votre balance à l'ordinateur via le câble USB ou USB-RS232. Attendez que Windows/Mac reconnaisse le périphérique (un son de connexion devrait se faire entendre).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Sélectionner la marque de votre balance</p>
                        <p>Cliquez sur l'icône <Settings className="w-3 h-3 inline mx-1" /> (Paramètres) ci-dessus, puis sélectionnez la marque de votre balance dans la liste déroulante "Marque de Balance". Si votre marque n'est pas listée, choisissez "Détection Automatique" ou "Générique".</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Appliquer la configuration</p>
                        <p>Après avoir sélectionné la marque, cliquez sur le bouton "Appliquer". Les paramètres de communication (Baud Rate, Data Bits, etc.) seront automatiquement configurés.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Cliquer sur "Connecter la Balance"</p>
                        <p>Cliquez sur le bouton bleu "Connecter la Balance" ci-dessus. Une fenêtre contextuelle s'ouvrira vous demandant de sélectionner un port.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        5
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Sélectionner le port série</p>
                        <p>Dans la fenêtre qui s'ouvre, vous verrez une liste de ports disponibles (par exemple : "USB Serial Port (COM3)" ou "usbserial-XXXX"). Sélectionnez le port correspondant à votre balance et cliquez sur "Connecter".</p>
                        <p className="text-xs text-gray-600 mt-1 italic">💡 Astuce : Si vous ne savez pas quel port choisir, déconnectez la balance, vérifiez les ports disponibles, puis reconnectez-la. Le nouveau port qui apparaît est celui de votre balance.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Connexion établie !</p>
                        <p>Une fois connectée, l'état affichera <Wifi className="w-3 h-3 inline mx-1 text-green-600" /> "Connectée". Le poids s'affichera automatiquement dans le <strong>Formulaire de Nouvelle Entrée</strong> lorsque vous sélectionnerez <strong>Paleta (PLT)</strong> comme unité.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dépannage */}
                <div className="p-4 bg-white rounded-lg border border-yellow-300">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    3. Résolution de Problèmes
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">❌ Aucun port n'apparaît dans la fenêtre de sélection</p>
                      <ul className="ml-5 space-y-1 text-xs">
                        <li>• Vérifiez que la balance est bien allumée et connectée</li>
                        <li>• Vérifiez que le pilote USB-RS232 est installé (si applicable)</li>
                        <li>• Essayez un autre port USB de votre ordinateur</li>
                        <li>• Redémarrez votre navigateur</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">❌ Le poids ne s'affiche pas après connexion</p>
                      <ul className="ml-5 space-y-1 text-xs">
                        <li>• Vérifiez que vous avez sélectionné la bonne marque de balance</li>
                        <li>• Essayez de sélectionner "Détection Automatique" dans les paramètres</li>
                        <li>• Vérifiez les paramètres de votre balance (elle doit être configurée pour envoyer le poids en continu ou sur demande)</li>
                        <li>• Consultez le manuel de votre balance pour vérifier les paramètres de communication série</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">❌ Le poids affiché est incorrect</p>
                      <ul className="ml-5 space-y-1 text-xs">
                        <li>• Effectuez une calibration de votre balance (voir le manuel de la balance)</li>
                        <li>• Vérifiez que l'unité affichée (kg, g, lb) correspond à la configuration de votre balance</li>
                        <li>• Assurez-vous qu'il n'y a rien sur le plateau de la balance lors de la connexion initiale</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">❌ Message "Navigateur non compatible"</p>
                      <ul className="ml-5 space-y-1 text-xs">
                        <li>• Utilisez Google Chrome (recommandé), Microsoft Edge ou Opera</li>
                        <li>• Mettez à jour votre navigateur vers la dernière version</li>
                        <li>• Firefox et Safari ne supportent pas encore l'API Web Serial</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Configuration manuelle */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Configuration manuelle avancée :</strong> Si la détection automatique ne fonctionne pas, vous pouvez ajuster manuellement les paramètres (Baud Rate, Data Bits, Stop Bits, Parity) dans les Paramètres <Settings className="w-3 h-3 inline" />. Consultez le manuel technique de votre balance pour connaître les valeurs exactes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}