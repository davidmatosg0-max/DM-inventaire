import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Globe,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  Send,
  HelpCircle
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { guardarMensajeContacto } from '../../utils/contactosStorage';

export function Contact() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = () => {
    // Validación de campos
    if (!formulario.nombre.trim()) {
      toast.error('❌ Veuillez entrer votre nom');
      return;
    }

    if (!formulario.email.trim()) {
      toast.error('❌ Veuillez entrer votre email');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formulario.email)) {
      toast.error('❌ Email invalide');
      return;
    }

    if (!formulario.asunto.trim()) {
      toast.error('❌ Veuillez entrer le sujet');
      return;
    }

    if (!formulario.mensaje.trim()) {
      toast.error('❌ Veuillez entrer votre message');
      return;
    }

    setEnviando(true);

    try {
      // Guardar en localStorage
      const mensajeGuardado = guardarMensajeContacto(
        formulario.nombre,
        formulario.email,
        formulario.asunto,
        formulario.mensaje
      );

      console.log('✅ Mensaje de contacto guardado:', mensajeGuardado);

      toast.success('✅ Message envoyé avec succès!', {
        description: `Nous vous répondrons à ${formulario.email} dans les plus brefs délais`,
        duration: 5000
      });

      // Limpiar formulario
      setFormulario({ nombre: '', email: '', asunto: '', mensaje: '' });
      
      // Esperar un momento antes de cerrar
      setTimeout(() => {
        setMostrarFormulario(false);
        setEnviando(false);
      }, 1500);
    } catch (error) {
      console.error('❌ Error al guardar mensaje:', error);
      toast.error('❌ Erreur lors de l\'envoi du message', {
        description: 'Veuillez réessayer'
      });
      setEnviando(false);
    }
  };

  // Información de contacto
  const contactInfo = [
    {
      icono: Mail,
      titulo: 'Email Principal',
      valor: 'support@banque-alimentaire.org',
      descripcion: 'Réponse sous 24h',
      color: branding.primaryColor,
      link: 'mailto:support@banque-alimentaire.org'
    },
    {
      icono: Mail,
      titulo: 'Email Technique',
      valor: 'technique@banque-alimentaire.org',
      descripcion: 'Support technique spécialisé',
      color: branding.secondaryColor,
      link: 'mailto:technique@banque-alimentaire.org'
    },
    {
      icono: Phone,
      titulo: 'Téléphone',
      valor: '+1 (514) 555-0100',
      descripcion: 'Lun-Ven, 9h-17h',
      color: '#4CAF50',
      link: 'tel:+15145550100'
    },
    {
      icono: MessageCircle,
      titulo: 'Chat en Direct',
      valor: 'Support instantané',
      descripcion: 'Disponible pendant les heures d\'ouverture',
      color: '#FF9800',
      action: () => toast.info('💬 Le chat sera bientôt disponible')
    },
    {
      icono: Globe,
      titulo: 'Site Web',
      valor: 'www.banque-alimentaire.org',
      descripcion: 'Documentation et ressources',
      color: '#9C27B0',
      link: 'https://www.banque-alimentaire.org'
    },
    {
      icono: MapPin,
      titulo: 'Adresse',
      valor: '123 Rue de la Solidarité',
      descripcion: 'Montréal, QC H2X 3Y7',
      color: '#DC3545',
      action: () => toast.info('📍 Carte à venir')
    }
  ];

  if (mostrarFormulario) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden" 
        style={{ 
          fontFamily: 'Roboto, sans-serif',
          background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
        }}
      >
        {/* Formas decorativas de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: branding.primaryColor }}
          />
          <div 
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: branding.secondaryColor }}
          />
        </div>

        {/* Contenedor principal con glassmorphism */}
        <div className="relative z-10 w-full max-w-2xl">
          <div 
            className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/60"
            style={{
              boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
            }}
          >
            <Button
              onClick={() => setMostrarFormulario(false)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
            >
              ← Retour
            </Button>

            {/* Logo con efecto glow */}
            <div className="flex justify-center mb-6">
              <div className="relative inline-block">
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div 
                  className="relative h-20 w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                  style={{ borderColor: branding.primaryColor }}
                >
                  {branding.logo ? (
                    <img 
                      src={branding.logo} 
                      alt="Logo" 
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex items-center justify-center text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <span className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        BA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Send 
                className="w-7 h-7" 
                style={{ color: branding.primaryColor }}
              />
              <h1 
                className="text-2xl sm:text-3xl font-bold tracking-tight" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: branding.primaryColor 
                }}
              >
                Nous Contacter
              </h1>
              <Sparkles 
                className="w-6 h-6 animate-pulse" 
                style={{ color: branding.secondaryColor }}
              />
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Complet *
                </label>
                <Input
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formulario.email}
                  onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sujet *
                </label>
                <Input
                  value={formulario.asunto}
                  onChange={(e) => setFormulario({ ...formulario, asunto: e.target.value })}
                  placeholder="Demande d'information"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <Textarea
                  value={formulario.mensaje}
                  onChange={(e) => setFormulario({ ...formulario, mensaje: e.target.value })}
                  placeholder="Décrivez votre demande..."
                  rows={6}
                />
              </div>

              <Button
                onClick={handleEnviar}
                className="w-full text-white text-lg py-6"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
                }}
                disabled={enviando}
              >
                <Send className="w-5 h-5 mr-2" />
                {enviando ? 'Envoi...' : 'Envoyer le Message'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal - Similar a Departamentos
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden" 
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: 'linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)',
      }}
    >
      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-5xl">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 border border-white/60"
          style={{
            boxShadow: '0 8px 32px 0 rgba(26, 77, 122, 0.2), 0 0 80px rgba(45, 149, 97, 0.1)'
          }}
        >
          {/* Logo con efecto glow */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                style={{ borderColor: branding.primaryColor }}
              >
                {branding.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                    }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      BA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Título con icono y efecto Sparkles */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <HelpCircle 
              className="w-6 h-6 sm:w-8 sm:h-8" 
              style={{ color: branding.primaryColor }}
            />
            <h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              Aide et Support
            </h1>
            <Sparkles 
              className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" 
              style={{ color: branding.secondaryColor }}
            />
          </div>

          <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
            Notre équipe est à votre disposition pour vous accompagner
          </p>

          {/* Tarjetas de contacto en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {contactInfo.map((contact, index) => {
              const Icono = contact.icono;
              
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                  onClick={() => {
                    if (contact.link) {
                      window.open(contact.link, '_blank');
                    } else if (contact.action) {
                      contact.action();
                    }
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${contact.color} 0%, ${contact.color}dd 100%)`,
                    boxShadow: `0 4px 12px ${contact.color}30`
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
                      >
                        <Icono className="w-6 h-6 text-white" />
                      </div>
                      {contact.link && (
                        <ExternalLink className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {contact.titulo}
                    </h3>
                    <p className="text-white/90 font-medium mb-2 text-sm">
                      {contact.valor}
                    </p>
                    <p className="text-white/70 text-xs">
                      {contact.descripcion}
                    </p>
                  </div>

                  {/* Efecto hover */}
                  <div 
                    className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Botón de formulario de contacto */}
          <div className="flex justify-center">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="relative h-16 px-10 text-lg font-semibold text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                minWidth: '280px'
              }}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Envoyer un Message
                </span>
              </div>
              
              {/* Efectos hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* Horarios de atención */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" style={{ color: branding.primaryColor }} />
              <span className="text-sm">
                <strong>Heures d'ouverture:</strong> Lundi - Vendredi, 9h00 - 17h00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}