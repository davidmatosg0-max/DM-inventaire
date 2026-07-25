import React from 'react';
import { Users } from 'lucide-react';
import { ContactosAlmacen } from '../almacen/ContactosAlmacen';
import { ModulePageHeader } from '../shared/ModulePageHeader';
import { useBranding } from '../../../hooks/useBranding';

/**
 * 📄 PÁGINA DE CONTACTOS DE ALMACÉN
 * 
 * Página wrapper para el módulo de contactos de almacén.
 * Se integra en el sistema de navegación principal.
 */

interface ContactosAlmacenPageProps {
  onNavigate?: (page: string) => void;
}

export function ContactosAlmacenPage({ onNavigate: _onNavigate }: ContactosAlmacenPageProps) {
  const branding = useBranding();

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
      <ModulePageHeader
        title="Contacts de l'entrepôt"
        subtitle="Gestion centralisée des personnes ressources de l'entrepôt et de leurs coordonnées."
        icon={<Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        compact
        showExperienceChips={false}
        showContextChips={false}
      />
      <ContactosAlmacen />
    </div>
  );
}
