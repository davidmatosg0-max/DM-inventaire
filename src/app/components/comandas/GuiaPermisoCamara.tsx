import React from 'react';
import { Camera, Monitor, AlertCircle, CheckCircle, X } from 'lucide-react';

interface GuiaPermisoCamaraProps {
  onClose: () => void;
}

export function GuiaPermisoCamara({ onClose }: GuiaPermisoCamaraProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1E73BE] text-white p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-2xl" style={{ fontFamily: 'Montserrat' }}>
                Comment autoriser l'accès à la caméra
              </h2>
              <p className="text-white/80 text-sm">Guide étape par étape</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información general */}
          <div className="bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[#1E73BE] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Pourquoi avez-vous besoin d'autoriser la caméra?
                </h3>
                <p className="text-gray-700 text-sm">
                  Pour scanner les codes QR des commandes, le système a besoin d'accéder à votre caméra. 
                  Cette autorisation est sécurisée et contrôlée par votre navigateur.
                </p>
              </div>
            </div>
          </div>

          {/* Guía por navegador */}
          <h3 className="font-bold text-xl text-[#333] mb-4" style={{ fontFamily: 'Montserrat' }}>
            Instructions par navigateur
          </h3>

          {/* Google Chrome / Microsoft Edge */}
          <div className="mb-6 border-2 border-gray-200 rounded-lg p-5 hover:border-[#1E73BE] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#1E73BE] rounded-full flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#333]" style={{ fontFamily: 'Montserrat' }}>
                  Google Chrome / Microsoft Edge
                </h4>
                <p className="text-sm text-gray-600">Le plus courant</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Lorsque vous cliquez sur <span className="font-bold text-purple-600">"Scanner avec Caméra"</span>, 
                    une fenêtre apparaîtra en haut de la page.
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600 border-l-4 border-purple-600">
                    <strong>📷 https://votre-site.com souhaite utiliser votre caméra</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Cliquez sur le bouton <span className="font-bold text-[#1E73BE]">"Autoriser"</span> ou 
                    <span className="font-bold text-[#1E73BE]"> "Permettre"</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    La caméra s'activera automatiquement et vous pourrez scanner les codes QR.
                  </p>
                </div>
              </div>
            </div>

            {/* Si se bloqueó */}
            <div className="mt-4 bg-red-50 border-l-4 border-[#DC3545] p-4 rounded">
              <h5 className="font-bold text-[#DC3545] mb-2 text-sm">Si vous avez bloqué l'accès par erreur:</h5>
              <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                <li>Cliquez sur l'icône <strong className="text-[#DC3545]">🔒</strong> ou <strong className="text-[#DC3545]">🛡️</strong> à gauche de l'URL dans la barre d'adresse</li>
                <li>Trouvez l'option <strong>"Caméra"</strong> ou <strong>"Camera"</strong></li>
                <li>Changez de <strong>"Bloquer"</strong> à <strong>"Autoriser"</strong></li>
                <li>Rechargez la page (F5 ou Ctrl+R)</li>
              </ol>
            </div>
          </div>

          {/* Mozilla Firefox */}
          <div className="mb-6 border-2 border-gray-200 rounded-lg p-5 hover:border-[#1E73BE] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FF7139] rounded-full flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#333]" style={{ fontFamily: 'Montserrat' }}>
                  Mozilla Firefox
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Une notification apparaîtra en haut à gauche demandant l'autorisation de la caméra.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Sélectionnez votre caméra dans le menu déroulant.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    Cliquez sur <span className="font-bold text-[#1E73BE]">"Autoriser"</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-red-50 border-l-4 border-[#DC3545] p-4 rounded">
              <h5 className="font-bold text-[#DC3545] mb-2 text-sm">Pour débloquer:</h5>
              <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                <li>Cliquez sur l'icône <strong className="text-[#DC3545]">🔒</strong> dans la barre d'adresse</li>
                <li>Cliquez sur <strong>"Effacer les autorisations et recharger"</strong></li>
                <li>Essayez à nouveau et sélectionnez <strong>"Autoriser"</strong></li>
              </ol>
            </div>
          </div>

          {/* Safari */}
          <div className="mb-6 border-2 border-gray-200 rounded-lg p-5 hover:border-[#1E73BE] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#006CFF] rounded-full flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[#333]" style={{ fontFamily: 'Montserrat' }}>
                  Safari (Mac)
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Safari demandera l'autorisation avec une fenêtre contextuelle.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">
                    Cliquez sur <span className="font-bold text-[#1E73BE]">"Autoriser"</span> ou <span className="font-bold text-[#1E73BE]">"OK"</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-red-50 border-l-4 border-[#DC3545] p-4 rounded">
              <h5 className="font-bold text-[#DC3545] mb-2 text-sm">Pour débloquer:</h5>
              <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                <li>Allez dans <strong>Safari → Réglages → Sites web → Caméra</strong></li>
                <li>Trouvez votre site dans la liste</li>
                <li>Changez à <strong>"Autoriser"</strong></li>
                <li>Rechargez la page</li>
              </ol>
            </div>
          </div>

          {/* Alternative */}
          <div className="bg-[#4CAF50]/10 border-2 border-[#4CAF50] rounded-lg p-5">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-[#4CAF50] mb-2" style={{ fontFamily: 'Montserrat' }}>
                  Alternative: Scanner depuis une image
                </h4>
                <p className="text-gray-700 text-sm">
                  Si vous ne pouvez pas autoriser la caméra, vous pouvez utiliser l'option 
                  <span className="font-bold text-[#4CAF50]"> "Télécharger Image"</span> pour scanner une photo du code QR 
                  depuis votre appareil.
                </p>
              </div>
            </div>
          </div>

          {/* Bouton de fermeture */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-bold"
              style={{ fontFamily: 'Montserrat' }}
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
