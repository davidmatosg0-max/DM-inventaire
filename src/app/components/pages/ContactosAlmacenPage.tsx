import React from 'react';
import { ContactosAlmacen } from '../almacen/ContactosAlmacen';

/**
 * 📄 PÁGINA DE CONTACTOS DE ALMACÉN
 * 
 * Página wrapper para el módulo de contactos de almacén.
 * Se integra en el sistema de navegación principal.
 */

interface ContactosAlmacenPageProps {
  onNavigate?: (page: string) => void;
}

export function ContactosAlmacenPage({ onNavigate }: ContactosAlmacenPageProps) {
  return (
    <div className="p-6">
      <ContactosAlmacen />
    </div>
  );
}
