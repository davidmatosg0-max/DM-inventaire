export type TipoOrganismoItem = {
  id: string;
  nombre: string;
  icono: string;
};

type TranslateFn = (key: string) => string;

export function obtenerTiposOrganismoCatalogo(t: TranslateFn): TipoOrganismoItem[] {
  return [
    { id: '1', nombre: t('organisms.organismTypes.communityKitchen'), icono: '🍽️' },
    { id: '2', nombre: t('organisms.organismTypes.foundation'), icono: '🏛️' },
    { id: '3', nombre: t('organisms.organismTypes.ngo'), icono: '🤝' },
    { id: '4', nombre: t('organisms.organismTypes.shelter'), icono: '🏠' },
    { id: '5', nombre: t('organisms.organismTypes.dayCenter'), icono: '☀️' },
    { id: '21', nombre: 'Collation', icono: '🥪' },
    { id: '6', nombre: t('organisms.organismTypes.school'), icono: '🎓' },
    { id: '7', nombre: t('organisms.organismTypes.daycare'), icono: '👶' },
    { id: '8', nombre: t('organisms.organismTypes.childrensHome'), icono: '👨‍👩‍👧‍👦' },
    { id: '9', nombre: t('organisms.organismTypes.seniorsHome'), icono: '👴' },
    { id: '10', nombre: t('organisms.organismTypes.rehabCenter'), icono: '💪' },
    { id: '11', nombre: t('organisms.organismTypes.hospital'), icono: '🏥' },
    { id: '12', nombre: t('organisms.organismTypes.church'), icono: '⛪' },
    { id: '13', nombre: t('organisms.organismTypes.civilAssociation'), icono: '📋' },
    { id: '14', nombre: t('organisms.organismTypes.communityCenter'), icono: '🏘️' },
    { id: '15', nombre: t('organisms.organismTypes.homelessShelter'), icono: '🛏️' },
    { id: '16', nombre: t('organisms.organismTypes.migrantCenter'), icono: '🌍' },
    { id: '17', nombre: t('organisms.organismTypes.womensHome'), icono: '👩' },
    { id: '18', nombre: t('organisms.organismTypes.disabilityCenter'), icono: '♿' },
    { id: '19', nombre: t('organisms.organismTypes.foodBank'), icono: '🛒' },
    { id: '20', nombre: t('organisms.organismTypes.other'), icono: '📌' },
  ];
}
