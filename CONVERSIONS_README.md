# 🔄 Système de Conversion de Produits - Banco de Alimentos

## Vue d'ensemble

Le système de conversion de produits permet de transformer un produit spécifique en un ou plusieurs autres produits, avec traçabilité complète, gestion des pertes et modèles réutilisables.

## 🎯 Cas d'usage

### 1. Reconditionnement de tailles
**Exemple:** Céréales 2kg → Céréales 3kg
- **Origine:** 40 boîtes de céréales 2kg (80kg total)
- **Résultat:** 26 boîtes de céréales 3kg (78kg total)
- **Perte:** 2kg (céréales abîmées)
- **Utilité:** Optimiser l'espace de stockage

### 2. Tri de produits variés
**Exemple:** Fruits Variés (PRS) → Pommes
- **Origine:** 100kg de fruits variés
- **Résultat:** 92kg de pommes spécifiques
- **Perte:** 8kg (fruits abîmés)
- **Utilité:** Classification pour distribution ciblée

### 3. Classification multiple
**Exemple:** Légumes Variés → Carottes + Pommes de terre + Brocoli
- **Origine:** 80kg de légumes variés (PRS)
- **Résultat:** 35kg carottes, 30kg pommes de terre, 10kg brocoli
- **Perte:** 5kg (légumes non utilisables)
- **Utilité:** Tri complet pour optimiser la distribution

### 4. Reconditionnement vrac → portions
**Exemple:** Riz 25kg → Paquets 1kg
- **Origine:** 5 sacs de riz 25kg (125kg total)
- **Résultat:** 123 paquets de 1kg
- **Perte:** 2kg (perte lors reconditionnement)
- **Utilité:** Portions familiales standardisées

### 5. Classification de conserves
**Exemple:** Conserves Variées → Types spécifiques
- **Origine:** 60 boîtes de conserves variées
- **Résultat:** 25 tomates, 20 maïs, 15 haricots
- **Perte:** 0 (pas de perte)
- **Utilité:** Organisation par type pour faciliter distribution

## 📊 Structure des données

### Produit
```typescript
{
  id: 'prod-cereal-2kg',
  nombre: 'Céréales (Boîte 2kg)',
  categoria: 'Aliments Secs',
  subcategoria: 'Céréales',
  unidad: 'boîtes',
  stockActual: 50,
  pesoUnitario: 2.0
}
```

### Conversion
```typescript
{
  id: 'conv-123',
  fecha: '2025-02-10T10:30:00Z',
  productoOrigen: {
    productoId: 'prod-cereal-2kg',
    productoNombre: 'Céréales (Boîte 2kg)',
    cantidad: 40,
    unidad: 'boîtes'
  },
  productosDestino: [
    {
      productoId: 'prod-cereal-3kg',
      productoNombre: 'Céréales (Boîte 3kg)',
      cantidad: 26,
      unidad: 'boîtes'
    }
  ],
  merma: 2,
  mermaMotivo: 'Céréales abîmées lors du reconditionnement',
  observaciones: 'Reconditionnement pour optimiser l\'espace',
  revertida: false
}
```

### Plantilla de Conversion
```typescript
{
  id: 'plantilla-1',
  nombre: 'Céréales 2kg → 3kg',
  descripcion: 'Reconditionnement de céréales',
  productoOrigenId: 'prod-cereal-2kg',
  configuracion: [
    {
      productoDestinoId: 'prod-cereal-3kg',
      productoDestinoNombre: 'Céréales (Boîte 3kg)',
      ratio: 0.65 // 40 boîtes de 2kg → 26 boîtes de 3kg
    }
  ],
  mermaEsperada: 2.5,
  activa: true,
  vecesUsada: 15
}
```

## 🔧 Fonctionnalités

### 1. Création de conversion
1. Sélectionner le produit source (avec stock disponible)
2. Définir la quantité à convertir
3. Ajouter un ou plusieurs produits de destination
4. Documenter les pertes (optionnel)
5. Enregistrer → mise à jour automatique du stock

### 2. Modèles de conversion
- Créer des recettes réutilisables
- Ratios précalculés
- Gain de temps pour conversions récurrentes
- Statistiques d'utilisation

### 3. Historique complet
- Toutes les conversions enregistrées
- Traçabilité complète
- Possibilité de réversion en cas d'erreur
- Statistiques et rapports

### 4. Gestion des pertes
- Enregistrement précis de la merma
- Motifs documentés
- Statistiques de pertes par type de conversion

## 📁 Architecture des fichiers

```
/src/app/
├── utils/
│   ├── conversionStorage.ts          # Gestion localStorage des conversions
│   ├── conversionEjemplos.ts          # Exemples de conversions
│   ├── productosEjemplo.ts            # Produits d'exemple
│   └── productStorage.ts              # Gestion des produits
├── components/
│   ├── conversion/
│   │   ├── ConversionDialog.tsx       # Dialog de création
│   │   ├── HistorialConversiones.tsx  # Historique
│   │   ├── PlantillasConversion.tsx   # Gestion de modèles
│   │   └── GuiaConversiones.tsx       # Guide d'utilisation
│   └── pages/
│       └── Inventario.tsx             # Page principale (onglet Conversions)
```

## 🚀 Utilisation

### Créer des exemples
```typescript
import { inicializarEjemplosConversion } from './utils/conversionEjemplos';

// Créer 10 conversions d'exemple + 9 modèles + 20 produits
inicializarEjemplosConversion();
```

### Créer une conversion manuelle
1. Aller dans **Inventario → Conversions**
2. Cliquer sur **Nouvelle Conversion**
3. Sélectionner le produit source et quantité
4. Ajouter les produits de destination
5. Documenter les pertes si nécessaire
6. Enregistrer

### Utiliser un modèle
1. Cliquer sur **Modèles**
2. Sélectionner un modèle existant
3. Ajuster les quantités si nécessaire
4. Appliquer

## 📈 Statistiques disponibles

- **Total de conversions** effectuées
- **Conversions cette semaine**
- **Conversions annulées**
- **Nombre de modèles** actifs
- **Merma totale** (pertes cumulées)
- **Modèles les plus utilisés**

## ✅ Bonnes pratiques

1. **Créer des modèles** pour les conversions récurrentes
2. **Documenter les pertes** systématiquement pour améliorer les ratios
3. **Vérifier le stock** avant de créer une conversion
4. **Utiliser des noms descriptifs** pour les observations
5. **Réviser régulièrement** les statistiques pour optimiser les processus

## 🔍 Exemples de produits créés

### Céréales
- Céréales 2kg (boîtes) - Stock: 50
- Céréales 3kg (boîtes) - Stock: 0
- Céréales 500g (paquets) - Stock: 0

### Fruits
- Fruits Variés PRS (kg) - Stock: 150
- Pommes (kg) - Stock: 0
- Bananes (kg) - Stock: 0
- Oranges (kg) - Stock: 0

### Légumes
- Légumes Variés PRS (kg) - Stock: 200
- Carottes (kg) - Stock: 0
- Pommes de terre (kg) - Stock: 0
- Brocoli (kg) - Stock: 0

### Produits secs
- Riz 25kg (sacs) - Stock: 20
- Riz 1kg (paquets) - Stock: 0
- Pâtes 5kg (sacs) - Stock: 30
- Pâtes 500g (paquets) - Stock: 0

### Conserves
- Conserves Variées (boîtes) - Stock: 80
- Conserve de Tomate (boîtes) - Stock: 0
- Conserve de Maïs (boîtes) - Stock: 0
- Conserve de Haricots (boîtes) - Stock: 0

### Produits laitiers
- Lait en poudre 25kg (sacs) - Stock: 10
- Lait en poudre 1kg (paquets) - Stock: 0

## 🎓 Guide d'utilisation

Un guide complet est disponible dans l'interface en cliquant sur le bouton **Guide** dans l'onglet Conversions.

Le guide inclut:
- Qu'est-ce qu'une conversion de produit?
- Cas d'usage typiques avec exemples visuels
- Avantages du système
- Instructions étape par étape
- Conseils professionnels

## 💡 Support

Pour toute question ou suggestion concernant le système de conversion:
1. Consulter le guide intégré dans l'application
2. Vérifier les exemples créés automatiquement
3. Contacter l'équipe technique du Banco de Alimentos
