import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { QrCode, X, CheckCircle, AlertCircle, Camera, Upload, HelpCircle, Shield, ShoppingCart, Package, Edit, MapPin, Printer, Eye, Truck, XCircle } from 'lucide-react';
import type { Html5Qrcode as Html5QrcodeInstance } from 'html5-qrcode';
import { normalizeScannedComandaQR } from '../../utils/comandaQr';
import { normalizeScannedLocationQR, normalizeScannedProductQR } from '../../utils/barcode';

const GuiaPermisoCamara = lazy(async () => {
  const module = await import('../comandas/GuiaPermisoCamara');
  return { default: module.GuiaPermisoCamara };
});

const loadHtml5Qrcode = () => import('html5-qrcode');

interface EscanerQRInventarioProps {
  onScanSuccess: (data: any, action: string) => void;
  onClose: () => void;
  autoStartCamera?: boolean;
  knownLocationCodes?: string[];
  pendingLocationAction?: {
    ubicacion: string;
    action: 'localizar_productos' | 'delocalizar_productos';
  } | null;
}

export function EscanerQRInventario({
  onScanSuccess,
  onClose,
  autoStartCamera = false,
  knownLocationCodes = [],
  pendingLocationAction = null,
}: EscanerQRInventarioProps) {
  const [modoEscaneo, setModoEscaneo] = useState<'camara' | 'archivo' | 'preparandoCamara' | null>(autoStartCamera ? 'camara' : null);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoStartRef = useRef(false);
  const explicitTipo = typeof resultado?.tipo === 'string' ? resultado.tipo : '';
  const detectedLocation = normalizeScannedLocationQR(resultado, knownLocationCodes);
  const detectedProduct = normalizeScannedProductQR(resultado);
  const detectedComanda = normalizeScannedComandaQR(resultado);
  const showingLocationActions = explicitTipo === 'ubicacion' || Boolean(detectedLocation?.ubicacion);
  const showingComandaActions = explicitTipo === 'comanda' || (!showingLocationActions && !detectedProduct && Boolean(resultado?.comanda || resultado?.numeroComanda || detectedComanda?.comanda));
  const showingPendingLocationConfirmation = Boolean(pendingLocationAction && detectedProduct && !showingComandaActions && !showingLocationActions);

  useEffect(() => {
    return () => {
      detenerScanner();
      cerrarStream();
    };
  }, []);

  useEffect(() => {
    if (!autoStartCamera || autoStartRef.current) {
      return;
    }

    autoStartRef.current = true;
    void iniciarEscaneoCamara();
  }, [autoStartCamera]);

  const cerrarStream = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      } catch (err) {
        // Ignorar errores al cerrar stream
      }
    }
  };

  const prepararCamara = () => {
    setError(null);
    setModoEscaneo('preparandoCamara');
  };

  const iniciarEscaneoCamara = async () => {
    setError(null);
    setModoEscaneo('camara');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('browser_not_supported');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' }
          } 
        });
        streamRef.current = stream;
      } catch (permError: any) {
        console.log('⚠️ Permiso de cámara requerido');
        
        if (permError.name === 'NotAllowedError' || permError.message?.includes('Permission denied')) {
          setError('permission_denied');
          setTimeout(() => setMostrarGuia(true), 500);
        } else if (permError.name === 'NotFoundError') {
          setError('camera_not_found');
        } else if (permError.name === 'NotReadableError') {
          setError('camera_in_use');
        } else if (permError.name === 'OverconstrainedError') {
          setError('camera_constraints');
        } else if (permError.name === 'SecurityError') {
          setError('security_error');
        } else {
          setError('unknown_error');
        }
        return;
      }

      cerrarStream();
      await new Promise(resolve => setTimeout(resolve, 200));
      await detenerScanner();
      
      const scannerId = 'qr-reader-camera-inventario';
      const { Html5Qrcode } = await loadHtml5Qrcode();
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      const devices = await Html5Qrcode.getCameras();
      
      if (!devices || devices.length === 0) {
        setError('camera_not_found');
        return;
      }

      let selectedCamera = devices[0];
      
      const rearCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('trasera') ||
        device.label.toLowerCase().includes('arrière') ||
        device.label.toLowerCase().includes('environment')
      );
      
      if (rearCamera) {
        selectedCamera = rearCamera;
        console.log('✓ Cámara trasera seleccionada:', rearCamera.label);
      } else {
        console.log('→ Usando cámara:', selectedCamera.label);
      }

      await scanner.start(
        selectedCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: { ideal: 'environment' }
          }
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Silenciar errores de búsqueda de QR
        }
      );

      setEscaneando(true);
      setError(null);
      
    } catch (err: any) {
      console.error('Error inesperado al iniciar escáner:', err);
      setError('unknown_error');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await detenerScanner();
    setEscaneando(false);

    try {
      const data = JSON.parse(decodedText);
      setResultado(data);
    } catch (e) {
      setResultado({ text: decodedText });
    }
  };

  const handleAction = (action: string) => {
    if (resultado) {
      onScanSuccess(resultado, action);
    }
  };

  const escanearNuevamente = async () => {
    setResultado(null);
    setError(null);
    await iniciarEscaneoCamara();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setModoEscaneo('archivo');
    setError(null);

    try {
      await detenerScanner();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const scannerId = 'qr-reader-file-inventario';
      const { Html5Qrcode } = await loadHtml5Qrcode();
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      const decodedText = await scanner.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      console.error('Error al escanear archivo:', err);
      setError('qr_not_found_in_image');
    } finally {
      await detenerScanner();
    }
  };

  const detenerScanner = async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        const state = await scanner.getState();
        
        if (state === 2) {
          await scanner.stop();
        }
        
        await scanner.clear();
      } catch (err) {
        // Ignorar errores al detener
      } finally {
        scannerRef.current = null;
      }
    }
    cerrarStream();
  };

  const handleCerrar = async () => {
    await detenerScanner();
    onClose();
  };

  const handleClickCargarArchivo = () => {
    fileInputRef.current?.click();
  };

  const volverASeleccion = async () => {
    await detenerScanner();
    setError(null);
    setEscaneando(false);

    if (autoStartCamera) {
      setResultado(null);
      await iniciarEscaneoCamara();
      return;
    }

    setModoEscaneo(null);
  };

  const getErrorMessage = (errorCode: string) => {
    const messages: Record<string, { title: string; description: string; showGuide: boolean }> = {
      permission_denied: {
        title: 'Accès à la caméra refusé',
        description: 'Vous avez bloqué l\'accès à la caméra. Pour utiliser le scanner, vous devez autoriser l\'accès dans les paramètres de votre navigateur.',
        showGuide: true
      },
      camera_not_found: {
        title: 'Aucune caméra trouvée',
        description: 'Aucune caméra n\'a été détectée sur cet appareil. Veuillez vérifier que votre caméra est connectée et fonctionne correctement.',
        showGuide: false
      },
      camera_in_use: {
        title: 'Caméra déjà utilisée',
        description: 'La caméra est utilisée par une autre application. Fermez les autres applications utilisant la caméra et réessayez.',
        showGuide: false
      },
      camera_constraints: {
        title: 'Caméra non compatible',
        description: 'Les paramètres de la caméra ne sont pas compatibles avec votre appareil.',
        showGuide: false
      },
      security_error: {
        title: 'Erreur de sécurité',
        description: 'Accès à la caméra bloqué pour des raisons de sécurité. Assurez-vous d\'utiliser HTTPS ou localhost.',
        showGuide: false
      },
      browser_not_supported: {
        title: 'Navigateur non supporté',
        description: 'Votre navigateur ne supporte pas l\'accès à la caméra. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Safari).',
        showGuide: false
      },
      qr_not_found_in_image: {
        title: 'QR non trouvé',
        description: 'Aucun code QR n\'a été trouvé dans l\'image. Veuillez essayer une autre image avec un code QR bien visible et de bonne qualité.',
        showGuide: false
      },
      unknown_error: {
        title: 'Erreur inconnue',
        description: 'Une erreur inattendue s\'est produite lors de l\'accès à la caméra.',
        showGuide: false
      }
    };
    return messages[errorCode] || messages.unknown_error;
  };

  const renderCameraError = () => {
    if (!error) return null;
    
    const errorInfo = getErrorMessage(error);
    const isPermissionError = error === 'permission_denied';

    return (
      <div className="text-center py-8">
        <AlertCircle className={`w-20 h-20 mx-auto mb-4 ${isPermissionError ? 'text-[#DC3545]' : 'text-[#FFC107]'}`} />
        <h3 className="text-2xl font-bold text-[#333] mb-3" style={{ fontFamily: 'Montserrat' }}>
          {errorInfo.title}
        </h3>
        <p className="text-gray-700 mb-6 max-w-md mx-auto">
          {errorInfo.description}
        </p>

        {isPermissionError && (
          <div className="bg-red-50 border-2 border-[#DC3545] rounded-lg p-5 mb-6 max-w-md mx-auto text-left">
            <h4 className="font-bold text-[#DC3545] mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Comment débloquer l'accès:
            </h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="font-bold text-[#DC3545]">1.</span>
                <span>Regardez dans la barre d'adresse de votre navigateur</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#DC3545]">2.</span>
                <span>Cliquez sur l'icône <strong>🔒</strong> ou <strong>🛡️</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#DC3545]">3.</span>
                <span>Trouvez "Caméra" et changez à <strong className="text-[#4CAF50]">"Autoriser"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[#DC3545]">4.</span>
                <span>Rechargez la page (F5) et réessayez</span>
              </li>
            </ol>
          </div>
        )}

        <div className="space-y-3 max-w-md mx-auto">
          {errorInfo.showGuide && (
            <button
              onClick={() => setMostrarGuia(true)}
              className="w-full px-6 py-3 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-bold flex items-center justify-center gap-2 text-lg"
              style={{ fontFamily: 'Montserrat' }}
            >
              <HelpCircle className="w-5 h-5" />
              Guide complet avec images
            </button>
          )}

          <div className={`${errorInfo.showGuide ? 'border-t-2 border-gray-200 pt-4 mt-4' : ''}`}>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Alternative sans caméra:
            </p>
            <button
              onClick={handleClickCargarArchivo}
              className="w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-bold flex items-center justify-center gap-2"
              style={{ fontFamily: 'Montserrat' }}
            >
              <Upload className="w-5 h-5" />
              Télécharger une image du QR
            </button>
            <p className="text-xs text-gray-500 mt-2">
              ✓ Fonctionne sans autorisation de caméra
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            {!isPermissionError && (
              <button
                onClick={prepararCamara}
                className="flex-1 px-6 py-2 border-2 border-[#1E73BE] text-[#1E73BE] rounded-lg hover:bg-[#1E73BE] hover:text-white transition-colors font-medium"
              >
                Réessayer
              </button>
            )}
            <button
              onClick={volverASeleccion}
              className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {mostrarGuia && (
        <Suspense fallback={null}>
          <GuiaPermisoCamara onClose={() => setMostrarGuia(false)} />
        </Suspense>
      )}
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-[#1E73BE] text-white p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6" />
              <h2 className="font-bold text-xl" style={{ fontFamily: 'Montserrat' }}>
                Scanner Code QR - Inventaire
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarGuia(true)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Aide: Comment autoriser la caméra"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={handleCerrar}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              data-testid="inventory-qr-file-input"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div id="qr-reader-file-inventario" className="hidden"></div>

            {resultado ? (
              // Success state - Menú de acciones para inventario
              <div className="py-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-[#4CAF50] mx-auto mb-4" />
                  <p className="text-[#4CAF50] font-bold text-xl mb-2">Code QR scanné avec succès!</p>
                  <p className="text-gray-600 text-sm">
                    {showingComandaActions
                      ? 'Choisissez l\'action à effectuer pour cette commande.'
                      : showingLocationActions
                        ? 'Choisissez l\'action à effectuer pour cet emplacement.'
                        : showingPendingLocationConfirmation
                          ? `Confirmez l'action pour ${pendingLocationAction?.ubicacion}.`
                          : 'Que souhaitez-vous faire avec ce produit?'}
                  </p>
                </div>
                
                {/* Información escaneada */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  {showingComandaActions ? (
                    <>
                      {detectedComanda?.comanda && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">N° Commande: </span>
                          <span className="text-[#1E73BE] font-bold text-lg">{detectedComanda.comanda}</span>
                        </div>
                      )}
                      {detectedComanda?.organismo && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Organisme: </span>
                          <span className="text-[#333]">{detectedComanda.organismo}</span>
                        </div>
                      )}
                      {detectedComanda?.fecha && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Date: </span>
                          <span className="text-[#333]">{detectedComanda.fecha}</span>
                        </div>
                      )}
                      {detectedComanda?.items !== undefined && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Articles: </span>
                          <span className="text-[#4CAF50] font-bold">{detectedComanda.items}</span>
                        </div>
                      )}
                      {resultado.text && !detectedComanda?.comanda && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Données: </span>
                          <span className="text-[#333] text-sm break-all">{resultado.text}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {resultado.producto && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Produit: </span>
                          <span className="text-[#1E73BE] font-bold text-lg">{resultado.producto}</span>
                        </div>
                      )}
                      {resultado.categoria && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Catégorie: </span>
                          <span className="text-[#333]">{resultado.categoria}</span>
                        </div>
                      )}
                      {resultado.codigo && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Code: </span>
                          <span className="text-[#333] font-mono">{resultado.codigo}</span>
                        </div>
                      )}
                      {resultado.stock !== undefined && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Stock actuel: </span>
                          <span className={`font-bold ${resultado.stock > 0 ? 'text-[#4CAF50]' : 'text-[#DC3545]'}`}>
                            {resultado.stock} {resultado.unidad || 'unités'}
                          </span>
                        </div>
                      )}
                      {resultado.ubicacion && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Emplacement: </span>
                          <span className="text-[#333]">{resultado.ubicacion}</span>
                        </div>
                      )}
                      {resultado.text && !resultado.producto && (
                        <div className="mb-2">
                          <span className="font-bold text-[#666]">Données: </span>
                          <span className="text-[#333] text-sm break-all">{resultado.text}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Menú de acciones para inventario */}
                <div className="max-w-md mx-auto space-y-3 mb-6">
                  <h3 className="font-bold text-[#333] text-center mb-4" style={{ fontFamily: 'Montserrat' }}>
                    {showingComandaActions ? 'Actions disponibles pour cette commande' : 'Actions disponibles'}
                  </h3>

                  {showingComandaActions ? (
                    <>
                      <button
                        onClick={() => handleAction('ver_detalles')}
                        className="w-full group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <Eye className="w-6 h-6 text-[#1E73BE] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Voir les détails</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Consulter toutes les informations de la commande
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('marcar_entregado')}
                        className="w-full group border-2 border-[#4CAF50] hover:bg-[#4CAF50] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <Package className="w-6 h-6 text-[#4CAF50] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Marquer comme livré</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Confirmer la livraison de cette commande
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('gestionar_transporte')}
                        className="w-full group border-2 border-[#FFC107] hover:bg-[#FFC107] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <Truck className="w-6 h-6 text-[#FFC107] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Gérer le transport</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Assigner ou modifier les informations de transport
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('modificar')}
                        className="w-full group border-2 border-[#666] hover:bg-[#666] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <Edit className="w-6 h-6 text-[#666] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Modifier la commande</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Éditer les détails ou articles de la commande
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('cancelar')}
                        className="w-full group border-2 border-[#DC3545] hover:bg-[#DC3545] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <XCircle className="w-6 h-6 text-[#DC3545] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Annuler la commande</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Annuler ou supprimer cette commande
                          </p>
                        </div>
                      </button>
                    </>
                  ) : showingLocationActions ? (
                    <>
                      <button
                        onClick={() => handleAction('localizar_productos')}
                        className="w-full group border-2 border-[#4CAF50] bg-[#4CAF50] hover:bg-[#45A049] rounded-lg p-4 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                      >
                        <MapPin className="w-7 h-7 text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-white transition-colors text-lg">Localiser des produits</h4>
                          <p className="text-sm text-white/90 transition-colors">
                            Scanner ensuite le produit à assigner à {detectedLocation?.ubicacion || resultado?.text || resultado?.codigo}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('delocalizar_productos')}
                        className="w-full group border-2 border-[#DC3545] hover:bg-[#DC3545] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <XCircle className="w-6 h-6 text-[#DC3545] group-hover:text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Délocaliser un produit</h4>
                          <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                            Scanner ensuite le produit à retirer de {detectedLocation?.ubicacion || resultado?.text || resultado?.codigo}
                          </p>
                        </div>
                      </button>
                    </>
                  ) : showingPendingLocationConfirmation ? (
                    <>
                      <button
                        onClick={() => handleAction(pendingLocationAction?.action || 'localizar_productos')}
                        className="w-full group border-2 border-[#1E73BE] bg-[#1E73BE] hover:bg-[#1764a6] rounded-lg p-4 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                      >
                        <MapPin className="w-7 h-7 text-white transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-white transition-colors text-lg">
                            {pendingLocationAction?.action === 'delocalizar_productos'
                              ? `Délocaliser depuis ${pendingLocationAction?.ubicacion}`
                              : `Localiser à ${pendingLocationAction?.ubicacion}`}
                          </h4>
                          <p className="text-sm text-white/90 transition-colors">
                            Appliquer cette action au produit scanné
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('annuler_accion_ubicacion')}
                        className="w-full group border-2 border-gray-300 hover:bg-gray-100 rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                      >
                        <X className="w-6 h-6 text-gray-500 transition-colors" />
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-[#333] transition-colors">Annuler l'action d'emplacement</h4>
                          <p className="text-sm text-gray-600 transition-colors">
                            Revenir au scan normal des produits
                          </p>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>

                  {/* Agregar al carrito - ACCIÓN PRINCIPAL */}
                  <button
                    onClick={() => handleAction('agregar_carrito')}
                    className="w-full group border-2 border-[#4CAF50] bg-[#4CAF50] hover:bg-[#45A049] rounded-lg p-4 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    <ShoppingCart className="w-7 h-7 text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-white transition-colors text-lg">Ajouter au panier</h4>
                      <p className="text-sm text-white/90 transition-colors">
                        Ajouter ce produit au panier pour distribution
                      </p>
                    </div>
                  </button>

                  {/* Ver ubicación */}
                  <button
                    onClick={() => handleAction('ver_ubicacion')}
                    className="w-full group border-2 border-[#9C27B0] hover:bg-[#9C27B0] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                  >
                    <MapPin className="w-6 h-6 text-[#9C27B0] group-hover:text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Modifier ou ajouter l'emplacement</h4>
                      <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                        Ouvrir la gestion d'emplacement du produit scanné
                      </p>
                    </div>
                  </button>

                  {/* Modificar producto */}
                  <button
                    onClick={() => handleAction('modificar_producto')}
                    className="w-full group border-2 border-gray-400 hover:bg-gray-400 rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                  >
                    <Edit className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Modifier le produit</h4>
                      <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                        Ouvrir le produit dans Inventaire pour modification
                      </p>
                    </div>
                  </button>

                  {/* Imprimir etiqueta */}
                  <button
                    onClick={() => handleAction('imprimir_etiqueta')}
                    className="w-full group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3"
                  >
                    <Printer className="w-6 h-6 text-[#1E73BE] group-hover:text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-[#333] group-hover:text-white transition-colors">Imprimer l'étiquette</h4>
                      <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                        Générer et imprimer l'étiquette standard du produit
                      </p>
                    </div>
                  </button>
                    </>
                  )}
                </div>

                {/* Botones secundarios */}
                <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={escanearNuevamente}
                    className="px-6 py-2 border-2 border-[#1E73BE] text-[#1E73BE] rounded-lg hover:bg-[#1E73BE] hover:text-white transition-colors font-medium flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    {showingLocationActions ? 'Scanner un autre emplacement' : 'Scanner un autre produit'}
                  </button>
                  <button
                    onClick={handleCerrar}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : modoEscaneo === null ? (
              // Selection mode
              <div className="py-6">
                <div className="text-center mb-6">
                  <Package className="w-16 h-16 text-[#1E73BE] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#333] mb-2" style={{ fontFamily: 'Montserrat' }}>
                    Scanner un produit
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choisissez comment scanner le code QR du produit
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={prepararCamara}
                    className="group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-xl p-6 transition-all hover:shadow-lg"
                  >
                    <Camera className="w-12 h-12 text-[#1E73BE] group-hover:text-white mx-auto mb-3 transition-colors" />
                    <h4 className="font-bold text-[#333] group-hover:text-white mb-2 transition-colors" style={{ fontFamily: 'Montserrat' }}>
                      Scanner avec Caméra
                    </h4>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                      Utilisez la caméra de votre appareil
                    </p>
                  </button>

                  <button
                    onClick={handleClickCargarArchivo}
                    className="group border-2 border-[#4CAF50] hover:bg-[#4CAF50] rounded-xl p-6 transition-all hover:shadow-lg"
                  >
                    <Upload className="w-12 h-12 text-[#4CAF50] group-hover:text-white mx-auto mb-3 transition-colors" />
                    <h4 className="font-bold text-[#333] group-hover:text-white mb-2 transition-colors" style={{ fontFamily: 'Montserrat' }}>
                      Télécharger Image
                    </h4>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                      Sélectionnez une image avec QR
                    </p>
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleCerrar}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : modoEscaneo === 'preparandoCamara' ? (
              // Preparando cámara
              <div className="py-6">
                <div className="text-center mb-6">
                  <Shield className="w-20 h-20 text-[#1E73BE] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#333] mb-3" style={{ fontFamily: 'Montserrat' }}>
                    Autorisation de la caméra requise
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Pour scanner les codes QR, nous avons besoin d'accéder à votre caméra. 
                    Votre navigateur va vous demander l'autorisation.
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-5 mb-6 max-w-md mx-auto">
                  <h4 className="font-bold text-[#1E73BE] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat' }}>
                    <AlertCircle className="w-5 h-5" />
                    Ce que vous devez faire:
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-[#1E73BE] flex-shrink-0">1.</span>
                      <span>Cliquez sur <span className="font-bold">"Activer la caméra"</span> ci-dessous</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-[#1E73BE] flex-shrink-0">2.</span>
                      <span>Une notification apparaîtra en haut</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-[#1E73BE] flex-shrink-0">3.</span>
                      <span>Cliquez sur <span className="font-bold text-[#4CAF50]">"Autoriser"</span></span>
                    </li>
                  </ol>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={iniciarEscaneoCamara}
                    className="w-full max-w-md px-8 py-4 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    style={{ fontFamily: 'Montserrat' }}
                  >
                    <Camera className="w-6 h-6" />
                    Activer la caméra maintenant
                  </button>

                  <button
                    onClick={() => setMostrarGuia(true)}
                    className="text-[#1E73BE] hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Besoin d'aide?
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-200 w-full max-w-md">
                    <p className="text-sm text-gray-600 text-center mb-3">
                      Vous préférez ne pas utiliser la caméra?
                    </p>
                    <button
                      onClick={handleClickCargarArchivo}
                      className="w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Télécharger une image
                    </button>
                  </div>

                  <button
                    onClick={volverASeleccion}
                    className="mt-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Retour
                  </button>
                </div>
              </div>
            ) : modoEscaneo === 'camara' ? (
              // Camera mode
              <div>
                {!error ? (
                  <>
                    <div className="mb-4 text-center">
                      <Camera className="w-12 h-12 text-[#1E73BE] mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-700 font-medium mb-2">
                        Positionnez le code QR devant la caméra
                      </p>
                      <p className="text-gray-500 text-sm">
                        Le scanner détectera automatiquement le code
                      </p>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border-4 border-[#1E73BE] bg-black">
                      <div id="qr-reader-camera-inventario" className="w-full min-h-[300px]"></div>
                      
                      {escaneando && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            Scan en cours...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-center gap-4">
                      <button
                        onClick={volverASeleccion}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        {autoStartCamera ? 'Redémarrer' : 'Retour'}
                      </button>
                      <button
                        onClick={handleCerrar}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  renderCameraError()
                )}
              </div>
            ) : (
              // File mode
              <div className="text-center py-8">
                {!error ? (
                  <>
                    <Upload className="w-16 h-16 text-[#4CAF50] mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-700 font-medium mb-4">
                      Analyse de l'image en cours...
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-[#DC3545] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#333] mb-3" style={{ fontFamily: 'Montserrat' }}>
                      {getErrorMessage(error).title}
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                      <p className="text-sm text-gray-700">{getErrorMessage(error).description}</p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleClickCargarArchivo}
                        className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium"
                      >
                        Essayer une autre image
                      </button>
                      <button
                        onClick={volverASeleccion}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        {autoStartCamera ? 'Retour caméra' : 'Retour'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}