import React from 'react';
import { IDDigitalGenerico, IDDigitalData } from '../shared/IDDigitalGenerico';

interface UsuarioInterno {
  id: string;
  numeroID: string;
  nombre: string;
  apellido: string;
  categoria: 'benevole' | 'empleado' | 'programa' | 'ptc' | 'donador' | 'vendedor';
  email: string;
  telefono: string;
  fechaIngreso: string;
  activo: boolean;
  departamento?: string;
  puesto?: string;
}

interface IDDigitalUsuarioInternoProps {
  usuario: UsuarioInterno;
  isOpen: boolean;
  onClose: () => void;
}

export function IDDigitalUsuarioInterno({ usuario, isOpen, onClose }: IDDigitalUsuarioInternoProps) {
  // Mapear la categoría a un rol en francés
  const roleMap: Record<string, string> = {
    'benevole': 'Bénévole',
    'empleado': 'Employé',
    'programa': 'Programme',
    'ptc': 'PTC',
    'donador': 'Donateur',
    'vendedor': 'Vendeur'
  };

  // Asignar colores por categoría
  const colorMap: Record<string, string> = {
    'benevole': '#4CAF50',    // Verde
    'empleado': '#1E73BE',    // Azul
    'programa': '#9C27B0',    // Púrpura
    'ptc': '#FF9800',         // Naranja
    'donador': '#2196F3',     // Azul claro
    'vendedor': '#E91E63'     // Rosa
  };

  const idData: IDDigitalData = {
    identifiant: usuario.numeroID,
    nom: usuario.apellido,
    prenom: usuario.nombre,
    email: usuario.email,
    telephone: usuario.telefono,
    role: roleMap[usuario.categoria] || usuario.categoria,
    departement: usuario.departamento || usuario.puesto,
    dateInscription: usuario.fechaIngreso,
    statut: usuario.activo ? 'actif' : 'inactif',
    couleurTheme: colorMap[usuario.categoria] || '#1E73BE',
    qrData: {
      categoria: usuario.categoria,
      departamento: usuario.departamento
    }
  };

  return (
    <IDDigitalGenerico
      data={idData}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
