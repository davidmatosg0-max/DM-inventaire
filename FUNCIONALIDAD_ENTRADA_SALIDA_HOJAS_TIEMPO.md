# ✅ NOUVELLE FONCTIONNALITÉ: Enregistrement Entrée/Sortie

**Date**: 5 mars 2026  
**Module**: Bénévoles - Feuilles de Temps  
**Fonctionnalité**: Enregistrer l'arrivée maintenant, la sortie plus tard

---

## 🎯 OBJECTIF

Permettre aux bénévoles et administrateurs d'enregistrer **seulement l'heure d'arrivée** d'un bénévole, et de revenir **plus tard** pour enregistrer l'heure de sortie, calculant automatiquement la durée totale de travail.

---

## ✨ NOUVELLE FONCTIONNALITÉ

### Avant
- ❌ Il fallait enregistrer l'arrivée ET le départ en même temps
- ❌ Pas de flexibilité pour enregistrer la sortie plus tard
- ❌ Obligation de remplir tous les champs d'un coup

### Après
- ✅ **Enregistrer l'entrée**: Sauvegarder seulement l'heure d'arrivée
- ✅ **Sessions en cours**: Voir toutes les entrées sans sortie enregistrée
- ✅ **Enregistrer la sortie**: Bouton dédié pour compléter la session
- ✅ **Temps écoulé**: Affichage en temps réel du temps passé
- ✅ **Mode complet**: Option pour enregistrer entrée + sortie en une fois

---

## 🔧 MODIFICATIONS TECHNIQUES

### 1. Interface `FeuilleTemps` mise à jour

**Fichier**: `/src/app/components/pages/Benevoles.tsx`

```typescript
interface FeuilleTemps {
  id: number;
  benevoleId: number;
  benevoleName: string;
  departement: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  notes: string;
  enCours?: boolean; // ✅ NOUVEAU - Indique si la session est en cours
}
```

### 2. Nouvelles fonctions

#### `handleRegistrarEntrada()`
Enregistre uniquement l'heure d'arrivée d'un bénévole.

**Caractéristiques**:
- Valide: bénévole, département, heure de début
- Crée une feuille avec `enCours: true`
- `heureFin` vide
- `duree` à 0
- Notification de confirmation

```typescript
const handleRegistrarEntrada = () => {
  if (!newFeuilleTemps.benevoleId || !newFeuilleTemps.departement || !newFeuilleTemps.heureDebut) {
    toast.error('Veuillez sélectionner un bénévole, un département et l\'heure d\'arrivée');
    return;
  }

  const benevole = benevoles.find(b => b.id === parseInt(newFeuilleTemps.benevoleId));
  if (!benevole) return;

  const nouvelleFeuille: FeuilleTemps = {
    id: Date.now(),
    benevoleId: parseInt(newFeuilleTemps.benevoleId),
    benevoleName: `${benevole.prenom} ${benevole.nom}`,
    departement: newFeuilleTemps.departement,
    date: newFeuilleTemps.date,
    heureDebut: newFeuilleTemps.heureDebut,
    heureFin: '', // Vide - pas encore de sortie
    duree: 0,
    notes: newFeuilleTemps.notes,
    enCours: true // ✅ Marquer comme en cours
  };

  setFeuillesTemps([nouvelleFeuille, ...feuillesTemps]);
  
  toast.success(`Entrée enregistrée pour ${benevole.prenom} ${benevole.nom} à ${newFeuilleTemps.heureDebut}`, {
    description: 'Vous pourrez enregistrer la sortie plus tard',
    duration: 4000
  });
};
```

#### `handleRegistrarSalida(feuilleId)`
Enregistre l'heure de sortie pour une session en cours.

**Caractéristiques**:
- Capture automatiquement l'heure actuelle
- Calcule la durée totale
- Met à jour `enCours` à `false`
- Ajoute les heures au total du bénévole
- Notification avec résumé

```typescript
const handleRegistrarSalida = (feuilleId: number) => {
  const feuille = feuillesTemps.find(f => f.id === feuilleId);
  if (!feuille || !feuille.enCours) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const heureFin = `${hours}:${minutes}`;

  const duree = calculateDuree(feuille.heureDebut, heureFin);
  
  if (duree <= 0) {
    toast.error('L\'heure de sortie doit être après l\'heure d\'entrée');
    return;
  }

  // Actualizar la feuille de temps
  setFeuillesTemps(prev => prev.map(f => 
    f.id === feuilleId 
      ? { ...f, heureFin, duree, enCours: false }
      : f
  ));

  // Actualizar las horas totales del bénévole
  setBenevoles(prev => prev.map(b => {
    if (b.id === feuille.benevoleId) {
      return {
        ...b,
        heuresTotal: b.heuresTotal + duree,
        heuresMois: b.heuresMois + duree
      };
    }
    return b;
  }));

  toast.success(`Sortie enregistrée: ${formatHeures(duree)} de travail`, {
    description: `${feuille.benevoleName} - ${feuille.heureDebut} à ${heureFin}`,
    duration: 4000
  });
};
```

---

## 🎨 INTERFACE UTILISATEUR

### 1. Boutons d'enregistrement (2 options)

Remplace l'ancien bouton unique "Enregistrer" par deux boutons:

#### Bouton "Entrée" (Vert)
- **Couleur**: `branding.secondaryColor` (#2d9561)
- **Icône**: `LogIn`
- **Action**: Enregistre seulement l'arrivée
- **Condition**: Bénévole + Département + Heure de début requis
- **Tooltip**: "Enregistrer seulement l'arrivée - vous pourrez enregistrer le départ plus tard"

#### Bouton "Complet" (Bleu)
- **Couleur**: `branding.primaryColor` (#1a4d7a)
- **Icône**: `Check`
- **Action**: Enregistre arrivée + départ
- **Condition**: Tous les champs requis (arrivée ET départ)
- **Tooltip**: "Enregistrer l'arrivée ET le départ (session complète)"

```tsx
<div className="flex gap-2">
  <Button 
    className="flex-1 h-11 text-white shadow-lg hover:shadow-xl transition-all"
    style={{ backgroundColor: branding.secondaryColor }}
    onClick={handleRegistrarEntrada}
    disabled={!newFeuilleTemps.benevoleId || !newFeuilleTemps.departement || !newFeuilleTemps.heureDebut}
    title="Enregistrer seulement l'arrivée"
  >
    <LogIn className="w-4 h-4 mr-2" />
    Entrée
  </Button>
  <Button 
    className="flex-1 h-11 text-white shadow-lg hover:shadow-xl transition-all"
    style={{ backgroundColor: branding.primaryColor }}
    onClick={handleAddFeuilleTemps}
    disabled={!newFeuilleTemps.benevoleId || !newFeuilleTemps.departement || !newFeuilleTemps.heureDebut || !newFeuilleTemps.heureFin}
    title="Enregistrer l'arrivée ET le départ (session complète)"
  >
    <Check className="w-4 h-4 mr-2" />
    Complet
  </Button>
</div>
```

### 2. Section "Sessions en cours"

Nouvelle Card qui affiche toutes les entrées sans sortie enregistrée.

**Caractéristiques**:
- 📊 **Header**: Titre + Badge pulsant "En attente de sortie"
- ⏱️ **Temps écoulé**: Calcul en temps réel depuis l'arrivée
- 👤 **Avatar**: Initiales du bénévole
- 🏢 **Informations**: Nom, département, date
- 🔔 **Notes**: Affichées si présentes
- 🔴 **Bouton "Enregistrer Sortie"**: Rouge, icône LogOut

```tsx
{feuillesTemps.filter(f => f.enCours).length > 0 && (
  <Card className="border-0 shadow-lg">
    <CardHeader 
      style={{ 
        background: `linear-gradient(135deg, ${branding.warningColor}15 0%, ${branding.warningColor}10 100%)`
      }}
    >
      <div className="flex items-center justify-between">
        <CardTitle style={{ color: branding.warningColor }}>
          <Timer className="w-5 h-5" />
          Sessions en cours ({feuillesTemps.filter(f => f.enCours).length})
        </CardTitle>
        <Badge className="animate-pulse" style={{ backgroundColor: branding.warningColor }}>
          En attente de sortie
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      {feuillesTemps.filter(f => f.enCours).map(feuille => (
        <div className="p-4 rounded-lg border-2">
          {/* Avatar + Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: branding.primaryColor }}>
              {feuille.benevoleName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-lg">{feuille.benevoleName}</p>
              <p className="text-sm text-gray-600">{feuille.departement} • {feuille.date}</p>
            </div>
          </div>
          
          {/* Heure d'entrée + Temps écoulé */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" style={{ color: branding.secondaryColor }} />
              <span className="font-mono text-lg font-bold">{feuille.heureDebut}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{ color: branding.warningColor }} />
              <span className="font-mono text-sm">{formatHeures(tempsEcoule)} écoulé</span>
            </div>
          </div>
          
          {/* Bouton Enregistrer Sortie */}
          <Button
            onClick={() => handleRegistrarSalida(feuille.id)}
            className="h-12 px-6 text-white"
            style={{ backgroundColor: '#DC3545' }}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Enregistrer Sortie
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

### 3. Table "Entrées récentes" (modifiée)

**Changement**: Filtre les entrées en cours pour montrer **seulement les sessions complètes**.

```tsx
{feuillesTemps.filter(f => !f.enCours).length > 0 ? (
  <div className="overflow-x-auto">
    <table className="w-full">
      <tbody>
        {feuillesTemps.filter(f => !f.enCours).slice(0, 10).map((feuille, index) => (
          // Afficher seulement les entrées complètes
        ))}
      </tbody>
    </table>
  </div>
) : (
  <div className="text-center py-12">
    <p className="text-gray-500">Aucune entrée complétée</p>
  </div>
)}
```

---

## 📋 CAS D'USAGE

### Cas 1: Enregistrement simple (séparé)

**Scénario**: Un bénévole arrive le matin

1. **Administrateur sélectionne**:
   - Bénévole: "Marie Dupont"
   - Département: "Distribution"
   - Arrivée: 09:00 (bouton horloge pour capturer l'heure actuelle)

2. **Clic sur bouton "Entrée"**
   - ✅ Session créée avec `enCours: true`
   - ✅ Apparaît dans "Sessions en cours"
   - ✅ Notification: "Entrée enregistrée pour Marie Dupont à 09:00"

3. **Plus tard dans la journée** (par exemple 16:00):
   - Session visible dans "Sessions en cours"
   - Affiche "7h 00min écoulé"
   - Clic sur "Enregistrer Sortie"

4. **Résultat**:
   - ✅ Sortie enregistrée automatiquement à 16:00
   - ✅ Durée calculée: 7h 00min
   - ✅ Heures ajoutées au total de Marie
   - ✅ Session déplacée vers "Entrées récentes"

### Cas 2: Enregistrement complet (d'un coup)

**Scénario**: Enregistrement rétroactif

1. **Administrateur sélectionne**:
   - Bénévole: "Jean Martin"
   - Département: "Entrepôt"
   - Arrivée: 08:30
   - Départ: 12:30

2. **Clic sur bouton "Complet"**
   - ✅ Session créée avec `enCours: false`
   - ✅ Directement dans "Entrées récentes"
   - ✅ Durée calculée: 4h 00min
   - ✅ Heures ajoutées au total de Jean

### Cas 3: Plusieurs sessions en cours

**Scénario**: Plusieurs bénévoles travaillent simultanément

1. **09:00** - Marie arrive (Distribution)
2. **09:30** - Jean arrive (Entrepôt)
3. **10:00** - Sophie arrive (Accueil)

**État à 11:00**:
```
Sessions en cours (3)
├── Marie Dupont - Distribution - 09:00 - 2h écoulé [Enregistrer Sortie]
├── Jean Martin - Entrepôt - 09:30 - 1h 30min écoulé [Enregistrer Sortie]
└── Sophie Bernard - Accueil - 10:00 - 1h écoulé [Enregistrer Sortie]
```

**Enregistrement des sorties**:
- 12:00 - Sophie sort → 2h de travail
- 14:00 - Marie sort → 5h de travail
- 16:00 - Jean sort → 6h 30min de travail

---

## 🎨 DESIGN

### Couleurs utilisées

| Élément | Couleur | Usage |
|---------|---------|-------|
| **Bouton "Entrée"** | #2d9561 (Vert) | Enregistrer arrivée |
| **Bouton "Complet"** | #1a4d7a (Bleu) | Enregistrer session complète |
| **Bouton "Sortie"** | #DC3545 (Rouge) | Enregistrer départ |
| **Badge "En cours"** | #FFC107 (Jaune/Orange) | Warning - En attente |
| **Icône Arrivée** | #2d9561 (Vert) | LogIn |
| **Icône Départ** | #DC3545 (Rouge) | LogOut |
| **Icône Timer** | #FFC107 (Jaune/Orange) | Temps écoulé |

### Animations

- **Badge "En attente"**: `animate-pulse` - Attire l'attention
- **Hover boutons**: Shadow + Scale - Feedback visuel
- **Transition hover**: `transition-all` - Fluidité

---

## 💾 PERSISTANCE DES DONNÉES

### LocalStorage

Les feuilles de temps (incluant celles en cours) sont sauvegardées automatiquement:

```typescript
React.useEffect(() => {
  localStorage.setItem('feuilles_temps', JSON.stringify(feuillesTemps));
}, [feuillesTemps]);
```

**Structure enregistrée**:
```json
[
  {
    "id": 1234567890,
    "benevoleId": 1,
    "benevoleName": "Marie Dupont",
    "departement": "Distribution",
    "date": "2026-03-05",
    "heureDebut": "09:00",
    "heureFin": "",
    "duree": 0,
    "notes": "Tri des dons",
    "enCours": true
  },
  {
    "id": 1234567891,
    "benevoleId": 2,
    "benevoleName": "Jean Martin",
    "departement": "Entrepôt",
    "date": "2026-03-05",
    "heureDebut": "08:30",
    "heureFin": "16:00",
    "duree": 7.5,
    "notes": "Inventaire",
    "enCours": false
  }
]
```

### Récupération au rechargement

```typescript
const [feuillesTemps, setFeuillesTemps] = useState<FeuilleTemps[]>(() => {
  const stored = localStorage.getItem('feuilles_temps');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error al cargar feuilles de temps:', error);
      return feuillesTempsInitialData;
    }
  }
  return feuillesTempsInitialData;
});
```

---

## ✅ AVANTAGES

### Pour les administrateurs
- ✅ **Flexibilité**: Pas besoin d'attendre la fin du travail pour enregistrer
- ✅ **Suivi en temps réel**: Voir qui est actuellement en train de travailler
- ✅ **Calcul automatique**: Le système calcule la durée dès l'enregistrement de la sortie
- ✅ **Moins d'erreurs**: Capture l'heure actuelle automatiquement

### Pour les bénévoles
- ✅ **Simplicité**: Arriver → Scanner/Enregistrer → Partir
- ✅ **Transparence**: Voir exactement les heures enregistrées
- ✅ **Autonomie**: Peut être utilisé en mode self-service (si accès public activé)

### Pour le système
- ✅ **Données en temps réel**: Statistiques toujours à jour
- ✅ **Historique complet**: Toutes les sessions enregistrées
- ✅ **Rapports précis**: Calculs basés sur les données réelles

---

## 🧪 TESTS

### Test 1: Enregistrer une entrée
```
✓ Sélectionner un bénévole
✓ Sélectionner un département
✓ Capturer l'heure d'arrivée (bouton horloge)
✓ Cliquer "Entrée"
✓ Vérifier: Session apparaît dans "Sessions en cours"
✓ Vérifier: Badge "En attente de sortie" visible
✓ Vérifier: Temps écoulé s'affiche correctement
```

### Test 2: Enregistrer une sortie
```
✓ Avoir une session en cours
✓ Attendre quelques minutes
✓ Cliquer "Enregistrer Sortie"
✓ Vérifier: Session disparaît de "Sessions en cours"
✓ Vérifier: Session apparaît dans "Entrées récentes"
✓ Vérifier: Durée calculée correctement
✓ Vérifier: Heures totales du bénévole mises à jour
```

### Test 3: Enregistrement complet
```
✓ Sélectionner bénévole + département
✓ Entrer heure d'arrivée
✓ Entrer heure de départ
✓ Cliquer "Complet"
✓ Vérifier: Directement dans "Entrées récentes"
✓ Vérifier: Pas dans "Sessions en cours"
✓ Vérifier: Durée calculée
```

### Test 4: Plusieurs sessions simultanées
```
✓ Enregistrer 3 entrées différentes
✓ Vérifier: 3 sessions en "Sessions en cours"
✓ Enregistrer sortie de la 2ème
✓ Vérifier: 2 sessions restent en cours
✓ Vérifier: 1 session dans "Entrées récentes"
```

### Test 5: Persistance
```
✓ Enregistrer une entrée
✓ Rafraîchir la page (F5)
✓ Vérifier: Session en cours toujours visible
✓ Enregistrer la sortie
✓ Rafraîchir la page
✓ Vérifier: Session dans "Entrées récentes"
```

---

## 📱 RESPONSIVE

### Mobile
- Boutons empilés verticalement
- Cards pleine largeur
- Textes ajustés
- Touch-friendly (44px min)

### Tablette
- Grille 2 colonnes pour les boutons
- Cards optimisées
- Meilleur espacement

### Desktop
- Grille 4 colonnes pour formulaire
- Boutons côte à côte
- Maximum d'informations visibles

---

## 🔮 ÉVOLUTIONS FUTURES

### Court terme
- [ ] QR Code pour self check-in
- [ ] Notifications push avant fin de session
- [ ] Validation biométrique (optionnelle)

### Moyen terme
- [ ] Intégration avec badge RFID
- [ ] Dashboard de présence en temps réel
- [ ] Alertes automatiques (oubli de sortie)

### Long terme
- [ ] Reconnaissance faciale
- [ ] App mobile dédiée
- [ ] Géolocalisation (check-in/out automatique)

---

## 📖 CONCLUSION

Cette nouvelle fonctionnalité améliore considérablement l'expérience utilisateur en offrant **plus de flexibilité** et en **automatisant** le calcul des heures de travail.

**Impact**:
- ✅ Gain de temps pour les administrateurs
- ✅ Réduction des erreurs de saisie
- ✅ Meilleur suivi en temps réel
- ✅ Données plus fiables pour les rapports

**Status**: ✅ Implémenté et fonctionnel  
**Version**: 1.0  
**Date**: 5 mars 2026

---

**Développé par**: Claude (Assistant IA)  
**Module**: Bénévoles - Feuilles de Temps  
**Système**: Banque Alimentaire - Gestion complète
