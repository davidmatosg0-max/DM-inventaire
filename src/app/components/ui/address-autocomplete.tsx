import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';

interface AddressSuggestion {
  street: string;
  city: string;
  postalCode: string;
  apt: string;
  quartier?: string;
}

interface AddressAutocompleteProps {
  onAddressSelect?: (address: AddressSuggestion) => void;
  onChange?: (value: string, details?: { city?: string; postalCode?: string; apt?: string; quartier?: string }) => void;
  value?: string;
  disabled?: boolean;
  initialValue?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showAdditionalFields?: boolean;
  // Nuevos props para sincronizar valores
  initialCity?: string;
  initialPostalCode?: string;
  initialApartment?: string;
  initialQuartier?: string;
}

function AddressAutocompleteComponent({
  onAddressSelect,
  onChange,
  value: controlledValue,
  disabled = false,
  initialValue = '',
  placeholder = 'Ex: 123 Boulevard Saint-Martin Est',
  label = 'Adresse',
  required = false,
  showAdditionalFields = true,
  initialCity = '',
  initialPostalCode = '',
  initialApartment = '',
  initialQuartier = ''
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(controlledValue || initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [apartment, setApartment] = useState(initialApartment);
  const [quartier, setQuartier] = useState(initialQuartier);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserEditing = useRef(false);
  const isInitialized = useRef(false);

  // ✅ Sincronizar con value controlado (SIEMPRE en primera carga)
  useEffect(() => {
    if (controlledValue !== undefined) {
      if (!isInitialized.current || controlledValue !== inputValue) {
        console.log('🔄 AddressAutocomplete - Sincronizando inputValue:', controlledValue);
        setInputValue(controlledValue);
        isInitialized.current = true;
      }
    }
  }, [controlledValue]);

  // ✅ Sincronizar con valores iniciales de ciudad, código postal y apartamento (SIEMPRE en primera carga)
  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialCity:', initialCity);
    setCity(initialCity);
  }, [initialCity]);

  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialPostalCode:', initialPostalCode);
    setPostalCode(initialPostalCode);
  }, [initialPostalCode]);

  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialApartment:', initialApartment);
    setApartment(initialApartment);
  }, [initialApartment]);

  useEffect(() => {
    console.log('🔄 AddressAutocomplete - Sincronizando initialQuartier:', initialQuartier);
    // ✅ SIEMPRE sincronizar, sin condiciones que bloqueen la actualización
    setQuartier(initialQuartier);
  }, [initialQuartier]);

  // Base de datos de rues de Québec
  const streets = [
    // ========================================
    // LAVAL - BOULEVARDS PRINCIPAUX
    // ========================================
    'Boulevard Saint-Martin Est',
    'Boulevard Saint-Martin Ouest',
    'Boulevard de la Concorde Est',
    'Boulevard de la Concorde Ouest',
    'Boulevard des Laurentides',
    'Boulevard Lévesque Est',
    'Boulevard Lévesque Ouest',
    'Boulevard Dagenais Ouest',
    'Boulevard Dagenais Est',
    'Boulevard Le Corbusier',
    'Boulevard Cartier Ouest',
    'Boulevard Cartier Est',
    'Boulevard Chomedey',
    'Boulevard Curé-Labelle',
    'Boulevard Samson',
    'Boulevard Industriel',
    'Boulevard Le Carrefour',
    'Boulevard Sainte-Rose',
    'Boulevard des Prairies',
    'Boulevard Laval',
    'Boulevard Saint-Elzéar Ouest',
    'Boulevard Saint-Elzéar Est',
    'Boulevard Évolution',
    'Boulevard du Souvenir',
    'Boulevard Cléroux',
    'Boulevard Daniel-Johnson',
    'Boulevard Pie-X',
    'Boulevard Pie-XII',
    'Boulevard Notre-Dame',
    'Boulevard Sainte-Marie',
    'Boulevard Jarry',
    'Boulevard de l\'Avenir',
    'Boulevard Laval',
    'Boulevard Agricola',
    'Boulevard René-Laennec',
    'Boulevard Arthur-Sauvé',
    'Boulevard Saint-François',
    
    // ========================================
    // QUARTIER: AUTEUIL
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Rue de Beauharnois',
    'Rue de Lausanne',
    'Rue de Chambly',
    'Rue de Gaspé',
    'Rue de Verdun',
    'Rue de Dijon',
    'Rue de l\'Équerre',
    'Rue Valmont',
    'Rue Principale',
    'Rue Centrale',
    'Rue Saint-Elzéar',
    'Avenue des Bois',
    'Avenue des Perron',
    'Avenue Dumont',
    'Avenue de la Seigneurie',
    'Avenue de la Fabrique',
    'Montée Saint-François',
    'Montée Champagne',
    'Montée Monette',
    
    // ========================================
    // QUARTIER: CHOMEDEY
    // ========================================
    'Boulevard Le Corbusier',
    'Boulevard Cartier Ouest',
    'Boulevard Samson',
    'Boulevard Curé-Labelle',
    'Boulevard Chomedey',
    'Boulevard de la Concorde Ouest',
    'Boulevard Industriel',
    'Boulevard Le Carrefour',
    'Rue de l\'Avenir',
    'Rue du Parc',
    'Rue Principale',
    'Rue Desjardins',
    'Rue Paradis',
    'Rue de Dieppe',
    'Rue de Paris',
    'Rue de Strasbourg',
    'Rue de Lausanne',
    'Rue de Calais',
    'Rue de Menton',
    'Rue de Brest',
    'Rue de Bruges',
    'Rue de Monaco',
    'Rue de Grenade',
    'Rue de Sienne',
    'Rue de Naples',
    'Rue de Venise',
    'Rue de Milan',
    'Rue de Vérone',
    'Rue de Florence',
    'Rue de Mantoue',
    'Rue de Gênes',
    'Rue de Bologne',
    'Rue de Padoue',
    'Rue de Parme',
    'Rue de Trieste',
    'Rue de Ferrare',
    'Rue de Modène',
    'Rue de Ravenne',
    'Rue de Rimini',
    'Rue de Salerne',
    'Rue de Bari',
    'Rue de Brindisi',
    'Rue de Tarente',
    'Rue de Syracuse',
    'Rue de Palerme',
    'Rue de Messine',
    'Rue de Catane',
    'Rue de l\'Empereur',
    'Rue de Buckingham',
    'Rue de Versailles',
    'Rue du Louvre',
    'Rue du Consul',
    'Rue Berlier',
    'Rue Bertrand',
    'Rue Gauthier',
    'Rue Dumouchel',
    'Avenue Central',
    'Avenue Martin-Plouffe',
    'Avenue Léo-Lacombe',
    'Avenue Odilon-Gauthier',
    'Avenue Hector-Lanthier',
    'Avenue Olivier',
    'Avenue de Clichy',
    'Avenue de Vimy',
    'Avenue des Aristocrates',
    'Avenue Georges V',
    'Avenue du Pacifique',
    'Avenue de la Renaissance',
    'Avenue du Parc-Laval',
    'Avenue Ampère',
    'Avenue Desmarteau',
    'Avenue de la Concorde',
    'Avenue des Terrasses',
    'Avenue de la Gare',
    'Avenue Laval',
    'Avenue Saint-Charles',
    'Avenue de Lorimier',
    
    // ========================================
    // QUARTIER: DUVERNAY
    // ========================================
    'Boulevard Lévesque Est',
    'Boulevard de la Concorde Est',
    'Boulevard Saint-Martin Est',
    'Boulevard Pie-IX',
    'Rue de Java',
    'Rue de Bali',
    'Rue de Sumatra',
    'Rue de Timor',
    'Rue de Flores',
    'Rue de Lombok',
    'Rue de Célèbes',
    'Rue de Mindanao',
    'Rue de Luçon',
    'Rue de Palawan',
    'Rue de Négros',
    'Rue de Mindoro',
    'Rue de Samar',
    'Rue de Panay',
    'Rue de Leyte',
    'Rue de Cebu',
    'Rue des Orchidées',
    'Rue Benoit',
    'Rue Berri',
    'Rue Émile',
    'Rue Arthur',
    'Rue Louis',
    'Rue Ernest',
    'Rue Albert',
    'Rue Georges',
    'Rue Henri',
    'Rue Paul',
    'Rue Marcel',
    'Rue André',
    'Rue Pierre',
    'Rue Jean',
    'Rue Claude',
    'Rue Maurice',
    'Rue Roger',
    'Rue René',
    'Avenue de l\'Église',
    'Avenue Saint-Pierre',
    'Avenue Saint-Laurent',
    'Avenue des Érables',
    'Avenue des Pins',
    'Avenue des Ormes',
    'Avenue des Chênes',
    'Avenue des Cèdres',
    
    // ========================================
    // QUARTIER: FABREVILLE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard Dagenais Ouest',
    'Boulevard Curé-Labelle',
    'Boulevard des Laurentides',
    'Rue des Gouverneurs',
    'Rue de la Station',
    'Rue Promenade',
    'Rue du Ruisseau',
    'Rue des Trembles',
    'Rue Gaston-Dumoulin',
    'Rue Péladeau',
    'Rue Arthur-Sauvé',
    'Rue de la Goudrelle',
    'Rue des Patriotes',
    'Rue Saint-Louis',
    'Rue Saint-Georges',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de la Fabrique',
    'Rue du Collège',
    'Rue du Curé',
    'Avenue de l\'Empereur',
    'Avenue de Buckingham',
    'Avenue de Versailles',
    'Montée Champagne',
    'Montée Gagnon',
    
    // ========================================
    // QUARTIER: LAVAL-DES-RAPIDES
    // ========================================
    'Boulevard Cartier Est',
    'Boulevard de la Concorde Est',
    'Boulevard Lévesque Est',
    'Rue Éthier',
    'Rue Valmont',
    'Rue Guilbault',
    'Rue Provost',
    'Rue Leblanc',
    'Rue Préfontaine',
    'Rue Dufresne',
    'Rue Panet',
    'Rue de Chambly',
    'Rue de Verdun',
    'Rue de Dijon',
    'Avenue Marcel-Villeneuve',
    'Avenue Taniata',
    'Avenue des Flamands',
    'Avenue du Souvenir',
    
    // ========================================
    // QUARTIER: LAVAL-OUEST
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard Arthur-Sauvé',
    'Boulevard des Laurentides',
    '55e Avenue',
    '56e Avenue',
    '57e Avenue',
    '58e Avenue',
    '59e Avenue',
    '60e Avenue',
    '61e Avenue',
    '62e Avenue',
    '63e Avenue',
    '64e Avenue',
    '65e Avenue',
    'Rue de l\'Aqueduc',
    'Rue de la Fabrique',
    'Rue du Havre',
    'Montée Champagne',
    'Montée Saint-François',
    
    // ========================================
    // QUARTIER: LAVAL-SUR-LE-LAC
    // ========================================
    'Boulevard Sainte-Rose',
    'Rue de l\'Anse',
    'Rue de la Berge',
    'Rue du Boisé',
    'Rue du Lac',
    'Rue du Rivage',
    'Avenue du Golf',
    'Avenue du Parc',
    'Montée Monette',
    
    // ========================================
    // QUARTIER: PONT-VIAU
    // ========================================
    'Boulevard de la Concorde Est',
    'Boulevard Lévesque Est',
    'Boulevard Pie-IX',
    'Boulevard Cartier Est',
    'Rue de Lausanne',
    'Rue Berlier',
    'Rue Léonard-de-Vinci',
    'Rue Lamartine',
    'Rue Victor-Hugo',
    'Rue Balzac',
    'Rue Rousseau',
    'Rue Voltaire',
    'Rue Molière',
    'Rue Racine',
    'Rue Corneille',
    'Avenue Léonard-de-Vinci',
    'Avenue de la Concorde',
    
    // ========================================
    // QUARTIER: SAINTE-DOROTHÉE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard des Laurentides',
    'Boulevard Curé-Labelle',
    'Autoroute 13',
    'Autoroute 440',
    'Rue Principale',
    'Rue de la Station',
    'Rue Promenade',
    'Rue du Plateau',
    'Rue de la Seigneurie',
    'Montée Champagne',
    'Montée Saint-François',
    
    // ========================================
    // QUARTIER: SAINTE-ROSE
    // ========================================
    'Boulevard Sainte-Rose',
    'Boulevard des Laurentides',
    'Boulevard Curé-Labelle',
    'Boulevard du Souvenir',
    'Boulevard Cléroux',
    'Rue Principale',
    'Rue du Curé',
    'Rue de la Fabrique',
    'Rue Saint-Louis',
    'Rue Saint-Pierre',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de l\'Église',
    'Rue du Collège',
    'Rue des Patriotes',
    'Montée Saint-François',
    'Montée Champagne',
    'Montée Masson',
    'Montée du Moulin',
    
    // ========================================
    // QUARTIER: SAINT-FRANÇOIS
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Boulevard Saint-François',
    'Montée Masson',
    'Montée Saint-François',
    'Montée Champagne',
    'Rang du Haut-Saint-François',
    'Rang Saint-François',
    'Rue Principale',
    'Rue de la Seigneurie',
    'Rue de la Fabrique',
    
    // ========================================
    // QUARTIER: SAINT-VINCENT-DE-PAUL
    // ========================================
    'Boulevard des Mille-Îles',
    'Boulevard Lévesque Est',
    'Boulevard de la Concorde Est',
    'Boulevard Pie-IX',
    'Rue Principale',
    'Rue Saint-Pierre',
    'Rue Sainte-Marie',
    'Rue Notre-Dame',
    'Rue de l\'Église',
    'Rue du Curé',
    'Montée Saint-François',
    'Montée Champagne',
    
    // ========================================
    // QUARTIER: VIMONT
    // ========================================
    'Boulevard des Laurentides',
    'Boulevard Saint-Elzéar Est',
    'Boulevard Dagenais Est',
    'Boulevard Daniel-Johnson',
    'Boulevard de l\'Avenir',
    'Rue Michelin',
    'Rue Industrielle',
    'Rue des Affaires',
    'Rue Bombardier',
    'Rue de la Technologie',
    'Rue du Commerce',
    'Rue de l\'Industrie',
    'Rue des Entreprises',
    'Rue Innovation',
    'Rue des Satellites',
    'Rue Louis-Bisson',
    'Avenue de l\'Avenir',
    'Avenue Industrielle',
    
    // ========================================
    // QUARTIER: ÎLES-LAVAL
    // ========================================
    'Boulevard des Îles',
    'Boulevard de la Grande-Île',
    'Rue de l\'Île-Jésus',
    'Rue de l\'Île-Bigras',
    'Rue de l\'Île-Saint-Pierre',
    
    // ========================================
    // MONTRÉAL - RUES PRINCIPALES
    // ========================================
    'Boulevard Saint-Laurent',
    'Boulevard René-Lévesque Ouest',
    'Boulevard René-Lévesque Est',
    'Boulevard de Maisonneuve Est',
    'Boulevard de Maisonneuve Ouest',
    'Boulevard Saint-Michel',
    'Boulevard Pie-IX',
    'Boulevard Henri-Bourassa Est',
    'Boulevard Henri-Bourassa Ouest',
    'Boulevard Crémazie Est',
    'Boulevard Crémazie Ouest',
    'Boulevard Décarie',
    'Boulevard Gouin Est',
    'Boulevard Gouin Ouest',
    'Boulevard Newman',
    'Boulevard Monk',
    'Boulevard Lasalle',
    'Boulevard Angrignon',
    'Boulevard Cavendish',
    'Boulevard des Sources',
    'Boulevard Saint-Jean',
    'Boulevard Pierrefonds',
    'Boulevard Metropolitan Est',
    'Boulevard Metropolitan Ouest',
    'Boulevard Rosemont',
    'Boulevard Langelier',
    'Boulevard Viau',
    'Boulevard Lacordaire',
    'Boulevard Radisson',
    'Boulevard Perras',
    'Boulevard Maurice-Duplessis',
    'Avenue du Parc',
    'Avenue du Mont-Royal Est',
    'Avenue du Mont-Royal Ouest',
    'Avenue McGill College',
    'Avenue Papineau',
    'Avenue Christophe-Colomb',
    'Avenue de Lorimier',
    'Avenue des Pins Est',
    'Avenue des Pins Ouest',
    'Avenue Van Horne',
    'Avenue Atwater',
    'Avenue Laurier Ouest',
    'Avenue Bernard',
    'Rue Saint-Denis',
    'Rue Sainte-Catherine Est',
    'Rue Sainte-Catherine Ouest',
    'Rue Sherbrooke Est',
    'Rue Sherbrooke Ouest',
    'Rue Notre-Dame Est',
    'Rue Notre-Dame Ouest',
    'Rue Jean-Talon Est',
    'Rue Jean-Talon Ouest',
    'Rue Ontario Est',
    'Rue Ontario Ouest',
    'Rue Hochelaga',
    'Rue Masson',
    'Rue Beaubien Est',
    'Rue Beaubien Ouest',
    'Rue Saint-Hubert',
    'Rue Jarry Est',
    'Rue Jarry Ouest',
    'Rue Wellington',
    'Rue Peel',
    'Rue University',
    'Rue Saint-Jacques',
    'Montée de Liesse',
    'Montée Saint-Hubert',
    'Chemin de la Côte-des-Neiges',
    'Chemin Queen-Mary',
    'Chemin Côte-Sainte-Catherine',
    'Chemin de la Côte-Saint-Luc',
  ];

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para extraer el número cívico y el nombre de la calle
  const parseAddress = (value: string) => {
    // Buscar patrón: número seguido de texto
    const match = value.match(/^(\d+)\s+(.*)$/);
    if (match) {
      return {
        civicNumber: match[1],
        streetName: match[2]
      };
    }
    
    // Si empieza con número pero no hay espacio todavía
    const numberMatch = value.match(/^(\d+)$/);
    if (numberMatch) {
      return {
        civicNumber: numberMatch[1],
        streetName: ''
      };
    }
    
    return {
      civicNumber: '',
      streetName: value
    };
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // ✅ NOTIFICAR con los valores actuales de ciudad, código postal y apartamento
    onChange?.(value, { city: city, postalCode: postalCode, apt: apartment, quartier: quartier });
    
    const { civicNumber, streetName } = parseAddress(value);
    
    // Si no hay número cívico, no mostrar sugerencias
    if (!civicNumber) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    // Simular un pequeño delay para búsqueda
    setTimeout(() => {
      let filtered: string[] = [];
      
      if (streetName.length === 0) {
        // Si solo escribió el número, mostrar todas las calles
        filtered = streets.slice(0, 10);
      } else {
        // Filtrar calles según lo que escribió
        const searchTerm = streetName.toLowerCase();
        filtered = streets.filter(street => 
          street.toLowerCase().includes(searchTerm)
        ).slice(0, 10);
      }
      
      // Agregar el número cívico a cada sugerencia
      const suggestionsWithNumber = filtered.map(street => `${civicNumber} ${street}`);
      
      setSuggestions(suggestionsWithNumber);
      setShowSuggestions(filtered.length > 0);
      setIsSearching(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (fullAddress: string) => {
    setInputValue(fullAddress);
    setShowSuggestions(false);
    
    // Extraer información de la dirección
    const { civicNumber, streetName } = parseAddress(fullAddress);
    
    // Determinar ciudad, código postal y quartier basado en el nombre de la calle
    let detectedCity = 'Laval';
    let detectedPostalCode = 'H7T 1C7';
    let detectedQuartier = '';
    
    // LAVAL - AUTEUIL
    if (streetName.includes('Boulevard des Mille-Îles') || 
        streetName.includes('Mille-Îles') ||
        streetName.includes('Beauharnois') || 
        streetName.includes('Équerre') ||
        streetName.includes('Valmont') ||
        streetName.includes('Montée Saint-François') ||
        streetName.includes('Montée Champagne') ||
        streetName.includes('Montée Monette')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7T 1C7';
      detectedQuartier = 'Auteuil';
    }
    // LAVAL - CHOMEDEY
    else if (streetName.includes('Desmarteau') ||
             streetName.includes('Le Corbusier') ||
             streetName.includes('Cartier Ouest') ||
             streetName.includes('Samson') ||
             streetName.includes('Chomedey') ||
             streetName.includes('Concorde Ouest') ||
             streetName.includes('Industriel') ||
             streetName.includes('Le Carrefour') ||
             streetName.includes('de Paris') ||
             streetName.includes('de Strasbourg') ||
             streetName.includes('de Calais') ||
             streetName.includes('de Menton') ||
             streetName.includes('de Brest') ||
             streetName.includes('de Bruges') ||
             streetName.includes('de Monaco') ||
             streetName.includes('de Grenade') ||
             streetName.includes('de Sienne') ||
             streetName.includes('de Naples') ||
             streetName.includes('de Venise') ||
             streetName.includes('de Milan') ||
             streetName.includes('de Vérone') ||
             streetName.includes('de Florence') ||
             streetName.includes('de Mantoue') ||
             streetName.includes('de Gênes') ||
             streetName.includes('de Bologne') ||
             streetName.includes('de Padoue') ||
             streetName.includes('de Parme') ||
             streetName.includes('de Trieste') ||
             streetName.includes('de Ferrare') ||
             streetName.includes('de Modène') ||
             streetName.includes('de Ravenne') ||
             streetName.includes('de Rimini') ||
             streetName.includes('de Salerne') ||
             streetName.includes('de Bari') ||
             streetName.includes('de Brindisi') ||
             streetName.includes('de Tarente') ||
             streetName.includes('de Syracuse') ||
             streetName.includes('de Palerme') ||
             streetName.includes('de Messine') ||
             streetName.includes('de Catane') ||
             streetName.includes('Empereur') ||
             streetName.includes('Buckingham') ||
             streetName.includes('Versailles') ||
             streetName.includes('Louvre') ||
             streetName.includes('Consul') ||
             streetName.includes('Berlier') ||
             streetName.includes('Bertrand') ||
             streetName.includes('Gauthier') ||
             streetName.includes('Dumouchel') ||
             streetName.includes('Martin-Plouffe') ||
             streetName.includes('Léo-Lacombe') ||
             streetName.includes('Odilon-Gauthier') ||
             streetName.includes('Hector-Lanthier') ||
             streetName.includes('Olivier') ||
             streetName.includes('de Clichy') ||
             streetName.includes('de Vimy') ||
             streetName.includes('des Aristocrates') ||
             streetName.includes('Georges V') ||
             streetName.includes('du Pacifique') ||
             streetName.includes('de la Renaissance') ||
             streetName.includes('du Parc-Laval') ||
             streetName.includes('Ampère')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7N 3N8';
      detectedQuartier = 'Chomedey';
    }
    // LAVAL - VIMONT
    else if (streetName.includes('Michelin') ||
             streetName.includes('Saint-Elzéar Est') ||
             streetName.includes('Dagenais Est') ||
             streetName.includes('Daniel-Johnson') ||
             streetName.includes('de l\'Avenir') ||
             streetName.includes('Industrielle') ||
             streetName.includes('des Affaires') ||
             streetName.includes('Bombardier') ||
             streetName.includes('de la Technologie') ||
             streetName.includes('du Commerce') ||
             streetName.includes('de l\'Industrie') ||
             streetName.includes('des Entreprises') ||
             streetName.includes('Innovation') ||
             streetName.includes('des Satellites') ||
             streetName.includes('Louis-Bisson')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7L 4R3';
      detectedQuartier = 'Vimont';
    }
    // LAVAL - DUVERNAY
    else if (streetName.includes('de Java') ||
             streetName.includes('de Bali') ||
             streetName.includes('de Sumatra') ||
             streetName.includes('de Timor') ||
             streetName.includes('de Flores') ||
             streetName.includes('de Lombok') ||
             streetName.includes('de Célèbes') ||
             streetName.includes('de Mindanao') ||
             streetName.includes('de Luçon') ||
             streetName.includes('de Palawan') ||
             streetName.includes('de Négros') ||
             streetName.includes('de Mindoro') ||
             streetName.includes('de Samar') ||
             streetName.includes('de Panay') ||
             streetName.includes('de Leyte') ||
             streetName.includes('de Cebu') ||
             streetName.includes('des Orchidées') ||
             streetName.includes('Benoit') ||
             streetName.includes('Berri') ||
             streetName.includes('Émile') ||
             (streetName.includes('Pie-IX') && !streetName.includes('Pie-XII'))) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7E 2T7';
      detectedQuartier = 'Duvernay';
    }
    // LAVAL - PONT-VIAU
    else if (streetName.includes('Léonard-de-Vinci') ||
             streetName.includes('Lamartine') ||
             streetName.includes('Victor-Hugo') ||
             streetName.includes('Balzac') ||
             streetName.includes('Rousseau') ||
             streetName.includes('Voltaire') ||
             streetName.includes('Molière') ||
             streetName.includes('Racine') ||
             streetName.includes('Corneille')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7G 2V4';
      detectedQuartier = 'Pont-Viau';
    }
    // LAVAL - LAVAL-DES-RAPIDES
    else if (streetName.includes('Cartier Est') ||
             streetName.includes('Éthier') ||
             streetName.includes('Guilbault') ||
             streetName.includes('Provost') ||
             streetName.includes('Leblanc') ||
             streetName.includes('Préfontaine') ||
             streetName.includes('Dufresne') ||
             streetName.includes('Panet') ||
             streetName.includes('Marcel-Villeneuve') ||
             streetName.includes('Taniata') ||
             streetName.includes('des Flamands')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7N 5B3';
      detectedQuartier = 'Laval-des-Rapides';
    }
    // LAVAL - FABREVILLE
    else if (streetName.includes('des Gouverneurs') ||
             streetName.includes('Dagenais Ouest') ||
             streetName.includes('de la Station') ||
             streetName.includes('Promenade') ||
             streetName.includes('du Ruisseau') ||
             streetName.includes('des Trembles') ||
             streetName.includes('Gaston-Dumoulin') ||
             streetName.includes('Péladeau') ||
             streetName.includes('de la Goudrelle') ||
             streetName.includes('des Patriotes') ||
             streetName.includes('Montée Gagnon')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7P 1A3';
      detectedQuartier = 'Fabreville';
    }
    // LAVAL - SAINTE-ROSE
    else if (streetName.includes('Boulevard Sainte-Rose') ||
             streetName.includes('du Souvenir') ||
             streetName.includes('Cléroux') ||
             streetName.includes('Montée Masson') ||
             streetName.includes('Montée du Moulin')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7L 1M3';
      detectedQuartier = 'Sainte-Rose';
    }
    // LAVAL - LAVAL-OUEST
    else if (streetName.includes('55e Avenue') ||
             streetName.includes('56e Avenue') ||
             streetName.includes('57e Avenue') ||
             streetName.includes('58e Avenue') ||
             streetName.includes('59e Avenue') ||
             streetName.includes('60e Avenue') ||
             streetName.includes('61e Avenue') ||
             streetName.includes('62e Avenue') ||
             streetName.includes('63e Avenue') ||
             streetName.includes('64e Avenue') ||
             streetName.includes('65e Avenue') ||
             streetName.includes('de l\'Aqueduc') ||
             streetName.includes('du Havre')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7R 1A1';
      detectedQuartier = 'Laval-Ouest';
    }
    // LAVAL - LAVAL-SUR-LE-LAC
    else if (streetName.includes('de l\'Anse') ||
             streetName.includes('de la Berge') ||
             streetName.includes('du Boisé') ||
             streetName.includes('du Lac') ||
             streetName.includes('du Rivage') ||
             streetName.includes('du Golf')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7R 5Z8';
      detectedQuartier = 'Laval-sur-le-Lac';
    }
    // LAVAL - SAINT-VINCENT-DE-PAUL
    else if (streetName.includes('Saint-Pierre') ||
             streetName.includes('de l\'Église') ||
             streetName.includes('du Curé')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7C 1R7';
      detectedQuartier = 'Saint-Vincent-de-Paul';
    }
    // LAVAL - SAINT-FRANÇOIS
    else if (streetName.includes('Boulevard Saint-François') ||
             streetName.includes('Rang du Haut-Saint-François') ||
             streetName.includes('Rang Saint-François')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7B 1B3';
      detectedQuartier = 'Saint-François';
    }
    // LAVAL - SAINTE-DOROTHÉE
    else if (streetName.includes('du Plateau') ||
             streetName.includes('de la Seigneurie') ||
             (streetName.includes('Autoroute') && (streetName.includes('13') || streetName.includes('440')))) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7X 1S1';
      detectedQuartier = 'Sainte-Dorothée';
    }
    // LAVAL - ÎLES-LAVAL
    else if (streetName.includes('des Îles') ||
             streetName.includes('de la Grande-Île') ||
             streetName.includes('de l\'Île-Jésus') ||
             streetName.includes('de l\'Île-Bigras') ||
             streetName.includes('de l\'Île-Saint-Pierre')) {
      detectedCity = 'Laval';
      detectedPostalCode = 'H7W 1A1';
      detectedQuartier = 'Îles-Laval';
    }
    // MONTRÉAL - Plateau-Mont-Royal
    else if (streetName.includes('Saint-Laurent') || 
             streetName.includes('Mont-Royal') || 
             streetName.includes('Saint-Denis') ||
             streetName.includes('du Parc')) {
      detectedCity = 'Montréal';
      detectedPostalCode = 'H2J 1Y1';
      detectedQuartier = 'Le Plateau-Mont-Royal';
    }
    // MONTRÉAL - Centre-Ville
    else if (streetName.includes('Sainte-Catherine') ||
             streetName.includes('René-Lévesque') ||
             streetName.includes('Maisonneuve') ||
             streetName.includes('McGill') ||
             streetName.includes('Peel') ||
             streetName.includes('University')) {
      detectedCity = 'Montréal';
      detectedPostalCode = 'H3B 1A1';
      detectedQuartier = 'Ville-Marie';
    }
    // MONTRÉAL - Autres quartiers
    else if (streetName.includes('Sherbrooke') ||
             streetName.includes('Notre-Dame')) {
      detectedCity = 'Montréal';
      detectedPostalCode = 'H2J 1Y1';
      detectedQuartier = 'Montréal';
    }
    // QUÉBEC
    else if (streetName.includes('Grande Allée') || streetName.includes('Cartier')) {
      detectedCity = 'Québec';
      detectedPostalCode = 'G1R 2K5';
      detectedQuartier = 'La Cité-Limoilou';
    }
    
    // Actualizar estados locales
    setCity(detectedCity);
    setPostalCode(detectedPostalCode);
    
    // ✅ CRÍTICO: Solo actualizar quartier si se detectó uno nuevo
    // Esto preserva el valor escrito manualmente por el usuario
    if (detectedQuartier) {
      console.log('🏘️ Quartier detectado automáticamente:', detectedQuartier);
      setQuartier(detectedQuartier);
    } else {
      console.log('🏘️ No se detectó quartier, preservando valor existente:', quartier);
      // NO hacer nada, mantener el valor actual de quartier
    }
    
    // Notificar al componente padre (usar el quartier actual si no se detectó uno nuevo)
    const finalQuartier = detectedQuartier || quartier;
    
    onAddressSelect?.({
      street: fullAddress,
      city: detectedCity,
      postalCode: detectedPostalCode,
      apt: '',
      quartier: finalQuartier
    });
    
    // Notificar cambios a través de onChange
    onChange?.(fullAddress, { city: detectedCity, postalCode: detectedPostalCode, apt: '', quartier: finalQuartier });
  };

  // Notificar cambios cuando se editen los campos adicionales
  useEffect(() => {
    // ✅ NOTIFICAR SIEMPRE los cambios, sin condiciones restrictivas
    if (isUserEditing.current) {
      const timeoutId = setTimeout(() => {
        console.log('🔔 AddressAutocomplete - Notificando cambios:', {
          inputValue,
          city,
          postalCode,
          apartment,
          quartier
        });
        
        onAddressSelect?.({
          street: inputValue,
          city: city,
          postalCode: postalCode,
          apt: apartment,
          quartier: quartier
        });
        
        onChange?.(inputValue, { city: city, postalCode: postalCode, apt: apartment, quartier: quartier });
        isUserEditing.current = false;
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [postalCode, city, apartment, inputValue, quartier]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <Label className="mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666] z-10" />
        
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${disabled ? 'bg-[#F4F4F4]' : ''}`}
        />
        
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1E73BE] animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const { civicNumber, streetName } = parseAddress(suggestion);
            
            return (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-[#E3F2FD] transition-colors border-b border-[#EEEEEE] last:border-b-0 ${
                  highlightedIndex === index ? 'bg-[#E3F2FD]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1E73BE] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-[#333333]">
                      <span className="text-[#1E73BE] font-semibold">{civicNumber}</span>
                      {' '}
                      <span>{streetName}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showSuggestions && inputValue.length > 0 && suggestions.length === 0 && !isSearching && parseAddress(inputValue).civicNumber && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CCCCCC] rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#333333] mb-1">
                ✅ Vous pouvez continuer à taper librement
              </p>
              <p className="text-xs text-[#666666]">
                Cette rue n'est pas dans nos suggestions, mais vous pouvez l'écrire manuellement. L'adresse sera enregistrée telle quelle.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campos adicionales editables - SIEMPRE VISIBLES */}
      {showAdditionalFields && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Apartamento */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">
                Appartement <span className="text-[#999999]">(optionnel)</span>
              </Label>
              <Input
                type="text"
                value={apartment}
                onChange={(e) => {
                  const newApartment = e.target.value;
                  setApartment(newApartment);
                  isUserEditing.current = true;
                  // ✅ NOTIFICAR al padre cuando cambia el apartamento
                  console.log('🏢 AddressAutocomplete - Apartamento cambiado:', newApartment);
                  onChange?.(inputValue, { city, postalCode, apt: newApartment, quartier });
                }}
                placeholder="Ex: 101"
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Ciudad */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">Ville</Label>
              <Input
                type="text"
                value={city}
                onChange={(e) => {
                  const newCity = e.target.value;
                  setCity(newCity);
                  isUserEditing.current = true;
                  // ✅ NOTIFICAR al padre cuando cambia la ciudad
                  console.log('🏙️ AddressAutocomplete - Ciudad cambiada:', newCity);
                  onChange?.(inputValue, { city: newCity, postalCode, apt: apartment, quartier });
                }}
                placeholder="Ex: Laval"
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Quartier - EDITABLE */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">
                Quartier <span className="text-[#999999]">(auto)</span>
              </Label>
              <Input
                type="text"
                value={quartier}
                onChange={(e) => {
                  const newQuartier = e.target.value;
                  setQuartier(newQuartier);
                  isUserEditing.current = true;
                  // ✅ SIEMPRE notificar al padre, incluso si el valor está vacío
                  console.log('🏘️ AddressAutocomplete - Quartier cambiado manualmente:', newQuartier || '[vacío]');
                  // ✅ CRÍTICO: Pasar SIEMPRE el valor completo, no solo cuando hay cambios
                  onChange?.(inputValue, { 
                    city, 
                    postalCode, 
                    apt: apartment, 
                    quartier: newQuartier // ✅ SIEMPRE pasar el valor, incluso si es ''
                  });
                }}
                placeholder="Ex: Chomedey"
                disabled={disabled}
                className="w-full"
              />
            </div>

            {/* Código Postal - EDITABLE */}
            <div>
              <Label className="mb-2 block text-sm text-[#333333]">Code postal</Label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => {
                  // Formatear código postal canadiense automáticamente
                  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length > 3 && value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                  }
                  if (value.length > 7) {
                    value = value.slice(0, 7);
                  }
                  setPostalCode(value);
                  isUserEditing.current = true;
                  // ✅ NOTIFICAR al padre cuando cambia el código postal
                  console.log('📮 AddressAutocomplete - Código postal cambiado:', value);
                  onChange?.(inputValue, { city, postalCode: value, apt: apartment, quartier });
                }}
                placeholder="Ex: H7L 4R3"
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-base bg-input-background transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AddressAutocompleteComponent.displayName = 'AddressAutocomplete';

export const AddressAutocomplete = AddressAutocompleteComponent;