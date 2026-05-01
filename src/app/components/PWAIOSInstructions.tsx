import React from 'react';
import { Button } from './ui/button';
import { X, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PWAIOSInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAIOSInstructions({ isOpen, onClose }: PWAIOSInstructionsProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl p-3">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-bold text-xl text-gray-900">{t('pwa.iosInstallTitle')}</h3>
        </div>
        
        <div className="space-y-4 text-gray-700">
          <p className="font-medium">{t('pwa.iosInstallSteps')}</p>
          
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">1</span>
              <span>{t('pwa.iosStep1')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">2</span>
              <span>{t('pwa.iosStep2')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">3</span>
              <span>{t('pwa.iosStep3')}</span>
            </li>
          </ol>
        </div>
        
        <Button
          onClick={onClose}
          className="w-full mt-6 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] hover:opacity-90"
        >
          {t('common.close')}
        </Button>
      </div>
    </div>
  );
}
