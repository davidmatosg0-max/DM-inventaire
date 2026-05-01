/**
 * Quartiers de Laval - Liste complète des quartiers officiels
 * Source: Ville de Laval, Québec, Canada
 * 
 * Laval est divisée en 14 districts électoraux et compte 18 quartiers principaux
 */

export const QUARTIERS_LAVAL = [
  'Auteuil',
  'Chomedey',
  'Duvernay',
  'Duvernay-Est',
  'Fabreville',
  'Fabreville-Ouest',
  'Îles-Laval',
  'Laval-des-Rapides',
  'Laval-Ouest',
  'Laval-sur-le-Lac',
  'Pont-Viau',
  'Renaud',
  'Sainte-Dorothée',
  'Sainte-Rose',
  'Saint-François',
  'Saint-Vincent-de-Paul',
  'Val-des-Brises',
  'Vimont'
] as const;

/**
 * Type pour les quartiers de Laval
 */
export type QuartierLaval = typeof QUARTIERS_LAVAL[number];

/**
 * Obtenir tous les quartiers de Laval
 */
export const obtenirQuartiersLaval = (): string[] => {
  return [...QUARTIERS_LAVAL];
};

/**
 * Vérifier si un quartier existe dans la liste
 */
export const estQuartierLavalValide = (quartier: string): boolean => {
  return QUARTIERS_LAVAL.includes(quartier as QuartierLaval);
};

/**
 * Districts électoraux de Laval (pour référence)
 */
export const DISTRICTS_LAVAL = [
  'Auteuil',
  'Chomedey',
  'Concorde-Bois-de-Boulogne',
  'Duvernay-Pont-Viau',
  'Fabreville',
  'Laval-les-Îles',
  'Marigot',
  'Renaud-Coursol',
  'Sainte-Dorothée',
  'Sainte-Rose',
  'Saint-Bruno',
  'Saint-François',
  'Saint-Vincent-de-Paul',
  'Souvenir-Labelle'
] as const;

/**
 * Information sur les principaux quartiers
 */
export const INFO_QUARTIERS: Record<string, { population?: number; secteur?: string }> = {
  'Chomedey': { secteur: 'Centre', population: 100000 },
  'Vimont': { secteur: 'Est', population: 42000 },
  'Auteuil': { secteur: 'Nord-Ouest', population: 30000 },
  'Sainte-Rose': { secteur: 'Ouest', population: 27000 },
  'Duvernay': { secteur: 'Est', population: 26000 },
  'Pont-Viau': { secteur: 'Centre-Sud', population: 21000 },
  'Laval-des-Rapides': { secteur: 'Centre-Sud', population: 19000 },
  'Fabreville': { secteur: 'Ouest', population: 18000 },
  'Saint-François': { secteur: 'Nord-Est', population: 16000 },
  'Saint-Vincent-de-Paul': { secteur: 'Est', population: 15000 },
  'Sainte-Dorothée': { secteur: 'Ouest', population: 14000 },
  'Laval-Ouest': { secteur: 'Ouest', population: 13000 },
  'Laval-sur-le-Lac': { secteur: 'Centre-Ouest', population: 1800 },
  'Îles-Laval': { secteur: 'Centre', population: 5000 },
  'Duvernay-Est': { secteur: 'Est' },
  'Fabreville-Ouest': { secteur: 'Ouest' },
  'Renaud': { secteur: 'Centre' },
  'Val-des-Brises': { secteur: 'Est' }
};
