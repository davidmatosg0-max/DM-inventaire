import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Share2, Mail, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export interface IDDigitalData {
  // Información básica
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  
  // Información del rol/departamento
  role: string; // Ej: "Bénévole", "Employé", "Bénéficiaire", etc.
  departement?: string;
  
  // Fechas
  dateInscription: string;
  
  // Estadísticas/métricas (opcional)
  metrique?: {
    label: string;
    valor: string | number;
  };
  
  // Estado
  statut: 'actif' | 'inactif' | 'en pause';
  
  // Color del tema (para personalización por módulo)
  couleurTheme?: string;
  
  // Datos adicionales para el QR
  qrData?: Record<string, any>;
}

interface IDDigitalGenericoProps {
  data: IDDigitalData;
  isOpen: boolean;
  onClose: () => void;
}

export function IDDigitalGenerico({ data, isOpen, onClose }: IDDigitalGenericoProps) {
  const couleurPrincipale = data.couleurTheme || '#4CAF50';
  const couleurSecondaire = data.couleurTheme === '#1E73BE' ? '#1557A0' : '#45a049';
  
  const qrData = JSON.stringify({
    type: data.role.toLowerCase(),
    id: data.identifiant,
    nom: data.nom,
    prenom: data.prenom,
    departement: data.departement,
    ...(data.qrData || {})
  });

  const handleDownload = () => {
    const idCard = document.getElementById('id-digital-card');
    if (!idCard) return;

    // Aquí se implementaría la lógica de descarga usando html2canvas o similar
    toast.success('ID Digital téléchargé avec succès');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ID Digital - ${data.prenom} ${data.nom}`,
        text: `Carte d'identification pour ${data.prenom} ${data.nom} - ${data.role}`,
        url: window.location.href
      }).catch(() => {
        toast.error('Erreur lors du partage');
      });
    } else {
      toast.info('Fonction de partage non disponible sur ce navigateur');
    }
  };

  const handleSendByEmail = () => {
    toast.success('ID Digital envoyé par email à ' + data.email);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" aria-describedby="id-digital-description">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>ID Digital - {data.role}</DialogTitle>
            <DialogDescription id="id-digital-description">
              Carte d'identification digitale pour {data.prenom} {data.nom}
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {/* Header avec actions */}
        <div 
          className="p-4 flex items-center justify-between no-print" 
          style={{ backgroundColor: couleurPrincipale }}
        >
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            ID Digital - {data.role}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Carte ID */}
        <div className="p-8 bg-gradient-to-br from-[#F4F4F4] to-white">
          <div 
            id="id-digital-card"
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 mx-auto"
            style={{ 
              maxWidth: '600px',
              borderColor: couleurPrincipale
            }}
          >
            {/* Header con logo */}
            <div 
              className="p-6 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(to right, ${couleurPrincipale}, ${couleurSecondaire})` 
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-2xl mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    BANQUE ALIMENTAIRE
                  </h3>
                  <p className="text-white opacity-90 text-sm">Laval, Quebec, Canadá</p>
                </div>
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${couleurPrincipale}, ${couleurSecondaire})` 
                    }}
                  >
                    <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-8">
              <div className="flex gap-6">
                {/* Foto/Ícono */}
                <div className="flex-shrink-0">
                  <div 
                    className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${couleurPrincipale}, ${couleurSecondaire})` 
                    }}
                  >
                    <span className="text-white font-bold text-5xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {data.prenom.charAt(0)}{data.nom.charAt(0)}
                    </span>
                  </div>
                  <Badge 
                    className="text-white mt-3 w-full justify-center py-1 shadow-md"
                    style={{ backgroundColor: couleurPrincipale }}
                  >
                    {data.role}
                  </Badge>
                </div>

                {/* Información */}
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">Nom complet</p>
                    <h4 className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {data.prenom} {data.nom}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">ID {data.role}</p>
                      <p className="font-mono font-bold text-[#1E73BE] text-lg">
                        {data.identifiant}
                      </p>
                    </div>
                    {data.departement && (
                      <div>
                        <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">Département</p>
                        <p className="font-semibold text-[#333333]">
                          {data.departement}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">Date d'inscription</p>
                      <p className="text-sm text-[#666666]">
                        {new Date(data.dateInscription).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {data.metrique && (
                      <div>
                        <p className="text-xs text-[#999999] uppercase tracking-wider mb-1">{data.metrique.label}</p>
                        <p 
                          className="text-sm font-bold"
                          style={{ color: couleurPrincipale }}
                        >
                          {data.metrique.valor}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Código QR */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-[#E0E0E0]">
                    <QRCodeSVG
                      value={qrData}
                      size={120}
                      level="H"
                      includeMargin={false}
                      fgColor="#333333"
                    />
                  </div>
                  <p className="text-xs text-[#999999] mt-2 text-center">Scannez pour vérifier</p>
                </div>
              </div>

              {/* Footer con información de contacto */}
              <div className="mt-6 pt-6 border-t-2 border-[#F4F4F4]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#999999] text-xs mb-1">Email</p>
                    <p className="text-[#666666] truncate">{data.email}</p>
                  </div>
                  <div>
                    <p className="text-[#999999] text-xs mb-1">Téléphone</p>
                    <p className="text-[#666666]">{data.telephone}</p>
                  </div>
                </div>
              </div>

              {/* Estatuto */}
              <div className="mt-4 text-center">
                {data.statut === 'actif' && (
                  <Badge 
                    className="text-[#4CAF50] border-2 px-4 py-1"
                    style={{ 
                      backgroundColor: '#E8F5E9',
                      borderColor: '#4CAF50'
                    }}
                  >
                    ✓ Statut: Actif
                  </Badge>
                )}
                {data.statut === 'inactif' && (
                  <Badge className="bg-[#FFEBEE] text-[#DC3545] border-2 border-[#DC3545] px-4 py-1">
                    Statut: Inactif
                  </Badge>
                )}
                {data.statut === 'en pause' && (
                  <Badge className="bg-[#FFF3E0] text-[#FFC107] border-2 border-[#FFC107] px-4 py-1">
                    Statut: En pause
                  </Badge>
                )}
              </div>
            </div>

            {/* Footer de la tarjeta */}
            <div className="bg-[#F9F9F9] px-8 py-4 border-t-2 border-[#E0E0E0]">
              <p className="text-xs text-center text-[#999999]">
                Ce document certifie que la personne identifiée est {data.role.toLowerCase()} autorisé(e) de la Banque Alimentaire de Laval
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-[#F4F4F4] p-4 flex flex-wrap gap-3 justify-center border-t no-print">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            style={{ 
              borderColor: couleurPrincipale,
              color: couleurPrincipale
            }}
            className="hover:text-white"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = couleurPrincipale}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button
            variant="outline"
            onClick={handleSendByEmail}
            className="border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Envoyer par email
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="border-[#666666] text-[#666666] hover:bg-[#666666] hover:text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>

        {/* Estilos para impresión */}
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}