import React from 'react';
import { IDDigitalGenerico, IDDigitalData } from '../shared/IDDigitalGenerico';

interface Benevole {
  id: number;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string;
  dateInscription: string;
  statut: 'actif' | 'inactif' | 'en pause';
  heuresTotal: number;
  numeroArchivo?: string;
}

interface IDDigitalBenevoleProps {
  benevole: Benevole;
  isOpen: boolean;
  onClose: () => void;
}

export function IDDigitalBenevole({ benevole, isOpen, onClose }: IDDigitalBenevoleProps) {
  const idData: IDDigitalData = {
    identifiant: benevole.numeroArchivo || '',
    nom: benevole.nom,
    prenom: benevole.prenom,
    email: benevole.email,
    telephone: benevole.telephone,
    role: 'Bénévole',
    departement: benevole.departement,
    dateInscription: benevole.dateInscription,
    statut: benevole.statut,
    metrique: {
      label: 'Heures accumulées',
      valor: `${Math.round(benevole.heuresTotal)}h`
    },
    couleurTheme: '#4CAF50' // Verde para bénévoles
  };

  return (
    <IDDigitalGenerico
      data={idData}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}