/**
 * Base de données complète des rues principales de Laval par quartier
 * Données obtenues depuis "Internet" pour synchronisation
 */

import { Rue } from './adressesQuartiersStorage';

/**
 * Base de datos de rues principales par quartier de Laval depuis "Internet"
 */
export function obtenirRuesLavalParQuartier(): Record<string, Rue[]> {
  const timestamp = Date.now();
  const genRueId = (index: number) => `rue-${timestamp}-${index}-${Math.random().toString(36).substring(2, 11)}`;
  
  const createRue = (index: number, nom: string, type: Rue['type']): Rue => ({
    id: genRueId(index),
    nom,
    type,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  });

  return {
    'Auteuil': [
      createRue(1, 'Samson', 'boulevard'),
      createRue(2, 'des Laurentides', 'boulevard'),
      createRue(3, 'Dagenais Est', 'boulevard'),
      createRue(4, 'René-Laennec', 'boulevard'),
      createRue(5, 'Pie-IX', 'boulevard'),
      createRue(6, 'Cléroux', 'rue'),
      createRue(7, 'Dumont', 'rue'),
      createRue(8, 'Lajeunesse', 'rue'),
      createRue(9, 'des Oeillets', 'rue'),
      createRue(10, 'Lévesque Est', 'boulevard'),
    ],
    'Chomedey': [
      createRue(1, 'Curé-Labelle', 'boulevard'),
      createRue(2, 'des Laurentides', 'boulevard'),
      createRue(3, 'Notre-Dame', 'boulevard'),
      createRue(4, 'Chomedey', 'boulevard'),
      createRue(5, 'Le Corbusier', 'boulevard'),
      createRue(6, 'Saint-Martin Ouest', 'boulevard'),
      createRue(7, 'Lévesque Ouest', 'boulevard'),
      createRue(8, 'de la Concorde Ouest', 'boulevard'),
      createRue(9, 'Industriel', 'boulevard'),
      createRue(10, 'Cartier Ouest', 'boulevard'),
      createRue(11, 'Souvenir', 'boulevard'),
      createRue(12, 'Cléroux', 'rue'),
      createRue(13, 'du Souvenir', 'boulevard'),
      createRue(14, 'Laval', 'avenue'),
      createRue(15, 'Paradis', 'rue'),
    ],
    'Duvernay': [
      createRue(1, 'de la Concorde Est', 'boulevard'),
      createRue(2, 'des Mille-Îles', 'boulevard'),
      createRue(3, 'Lévesque Est', 'boulevard'),
      createRue(4, 'Industriel', 'boulevard'),
      createRue(5, 'Cartier Est', 'boulevard'),
      createRue(6, 'Saint-Élzéar Est', 'boulevard'),
      createRue(7, 'du Souvenir', 'boulevard'),
      createRue(8, 'Laval', 'avenue'),
      createRue(9, 'Saint-Martin Est', 'boulevard'),
      createRue(10, 'des Oiseaux', 'rue'),
    ],
    'Duvernay-Est': [
      createRue(1, 'de la Concorde Est', 'boulevard'),
      createRue(2, 'Lévesque Est', 'boulevard'),
      createRue(3, 'Saint-Martin Est', 'boulevard'),
      createRue(4, 'Montée Masson', 'montée'),
      createRue(5, 'des Oiseaux', 'rue'),
      createRue(6, 'Cartier Est', 'boulevard'),
      createRue(7, 'de la Seigneurie', 'boulevard'),
      createRue(8, 'des Mille-Îles', 'boulevard'),
      createRue(9, 'Maurice-Duplessis', 'rue'),
      createRue(10, 'des Entreprises', 'rue'),
    ],
    'Fabreville-Est': [
      createRue(1, 'Dagenais Ouest', 'boulevard'),
      createRue(2, 'Curé-Labelle', 'boulevard'),
      createRue(3, 'Sainte-Rose', 'boulevard'),
      createRue(4, 'des Laurentides', 'boulevard'),
      createRue(5, 'Samson', 'boulevard'),
      createRue(6, 'Cléroux', 'rue'),
      createRue(7, 'de la Renaissance', 'boulevard'),
      createRue(8, 'de la Concorde Ouest', 'boulevard'),
      createRue(9, 'Mattawa', 'rue'),
      createRue(10, 'Marius-Dufresne', 'rue'),
    ],
    'Fabreville': [
      createRue(1, 'Dagenais Ouest', 'boulevard'),
      createRue(2, 'Curé-Labelle', 'boulevard'),
      createRue(3, 'Sainte-Rose', 'boulevard'),
      createRue(4, 'des Laurentides', 'boulevard'),
      createRue(5, 'Samson', 'boulevard'),
      createRue(6, 'de la Renaissance', 'boulevard'),
      createRue(7, 'de la Concorde Ouest', 'boulevard'),
      createRue(8, 'Arthur-Sauvé', 'boulevard'),
      createRue(9, 'Cléroux', 'rue'),
      createRue(10, 'Mattawa', 'rue'),
      createRue(11, 'Mainville', 'rue'),
      createRue(12, 'du Souvenir Ouest', 'boulevard'),
    ],
    'Fabreville-Ouest': [
      createRue(1, 'Dagenais Ouest', 'boulevard'),
      createRue(2, 'Curé-Labelle', 'boulevard'),
      createRue(3, 'Sainte-Rose', 'boulevard'),
      createRue(4, 'des Laurentides', 'boulevard'),
      createRue(5, 'de la Renaissance', 'boulevard'),
      createRue(6, 'de la Concorde Ouest', 'boulevard'),
      createRue(7, 'Arthur-Sauvé', 'boulevard'),
      createRue(8, 'Matthieu', 'rue'),
      createRue(9, 'Mainville', 'rue'),
      createRue(10, 'du Souvenir Ouest', 'boulevard'),
    ],
    'Renaud': [
      createRue(1, 'Le Corbusier', 'boulevard'),
      createRue(2, 'des Laurentides', 'boulevard'),
      createRue(3, 'Lévesque Ouest', 'boulevard'),
      createRue(4, 'Cartier Ouest', 'boulevard'),
      createRue(5, 'Notre-Dame', 'boulevard'),
      createRue(6, 'Industriel', 'boulevard'),
      createRue(7, 'Le Carrefour', 'boulevard'),
      createRue(8, 'du Souvenir', 'boulevard'),
      createRue(9, 'Laval', 'avenue'),
      createRue(10, 'Jacques-Bureau', 'rue'),
    ],
    'Val-des-Brises': [
      createRue(1, 'Dagenais Est', 'boulevard'),
      createRue(2, 'Saint-Élzéar Est', 'boulevard'),
      createRue(3, 'de la Concorde Est', 'boulevard'),
      createRue(4, 'des Laurentides', 'boulevard'),
      createRue(5, 'Montée Masson', 'montée'),
      createRue(6, 'des Oiseaux', 'rue'),
      createRue(7, 'de Normandie', 'rue'),
      createRue(8, 'de la Pinière', 'boulevard'),
      createRue(9, 'des Jockeys', 'rue'),
      createRue(10, 'des Brises', 'rue'),
    ],
    'Vimont': [
      createRue(1, 'de la Concorde Est', 'boulevard'),
      createRue(2, 'Dagenais Est', 'boulevard'),
      createRue(3, 'des Laurentides', 'boulevard'),
      createRue(4, 'Saint-Élzéar Est', 'boulevard'),
      createRue(5, 'Saint-Martin Est', 'boulevard'),
      createRue(6, 'Curé-Labelle', 'boulevard'),
      createRue(7, 'des Oiseaux', 'rue'),
      createRue(8, 'de Normandie', 'rue'),
      createRue(9, 'Armand-Frappier', 'rue'),
      createRue(10, 'de la Pinière', 'boulevard'),
      createRue(11, 'des Jockeys', 'rue'),
      createRue(12, 'Maurice-Duplessis', 'rue'),
    ]
  };
}