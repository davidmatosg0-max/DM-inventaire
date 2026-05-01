# Guide d'utilisation des Balances Électroniques

## Vue d'ensemble

Le système intègre maintenant la prise en charge complète des balances électroniques via **Web Serial API**, permettant une connexion directe USB sans installation de logiciel supplémentaire.

## Caractéristiques

✅ **Détection automatique** des protocoles de balance
✅ **Compatible** avec les marques principales (Toledo, Mettler, CAS, Avery, etc.)
✅ **Connexion sécurisée** - Aucune donnée n'est envoyée à l'extérieur
✅ **Lecture en temps réel** du poids
✅ **Indicateur de stabilité** du poids
✅ **Reconnexion automatique** en cas de déconnexion

## Navigateurs supportés

- ✅ Google Chrome (version 89+)
- ✅ Microsoft Edge (version 89+)
- ✅ Opera (version 75+)
- ❌ Firefox (pas encore supporté)
- ❌ Safari (pas encore supporté)

## Balances compatibles

### Testées et validées

- **Toledo**: 8217, 8530, 8531, 8532
- **Mettler Toledo**: BC, PS, MS, PB series
- **Avery Weigh-Tronix**: série complète
- **CAS**: AP-1, AD series, SW series
- **Digi**: SM-100, SM-300
- **Ohaus**: Scout, Navigator, Defender
- **Adam Equipment**: PGW, GBK, LBK series
- **A&D Weighing**: série complète

### Configuration recommandée

```javascript
{
  baudRate: 9600,      // Standard pour la plupart des balances
  dataBits: 8,         // 7 ou 8 bits
  stopBits: 1,         // 1 ou 2
  parity: 'none',      // none, even, odd
  protocol: 'auto'     // Détection automatique
}
```

## Utilisation

### Page dédiée

Accédez à la configuration complète via le menu latéral:
**"Configuration de la Balance"**

### Intégration dans d'autres pages

#### Option 1: Widget compacto

```tsx
import { BalanceWidget } from './components/BalanceWidget';

function MyPage() {
  const handleWeightChange = (weight: number, unit: string) => {
    console.log(`Poids reçu: ${weight} ${unit}`);
  };

  return (
    <div>
      <BalanceWidget 
        onWeightChange={handleWeightChange}
        defaultExpanded={true}
      />
    </div>
  );
}
```

#### Option 2: Configuration inline

```tsx
import { ConfigurationBalance } from './components/ConfigurationBalance';

function MyPage() {
  const handleWeightChange = (weight: number, unit: string) => {
    // Utiliser le poids dans votre formulaire
    setFormData({ ...formData, weight, unit });
  };

  return (
    <ConfigurationBalance 
      onWeightChange={handleWeightChange}
      showInline={true}
    />
  );
}
```

#### Option 3: Hook personnalisé

```tsx
import { useBalance } from '../../hooks/useBalance';

function MyComponent() {
  const {
    isConnected,
    currentWeight,
    error,
    connect,
    disconnect
  } = useBalance();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connecter</button>
      ) : (
        <div>
          <p>Poids: {currentWeight?.weight} {currentWeight?.unit}</p>
          <button onClick={disconnect}>Déconnecter</button>
        </div>
      )}
    </div>
  );
}
```

## Instructions de connexion

1. **Connecter la balance** via USB à votre ordinateur
2. **Allumer la balance** et attendre qu'elle soit prête
3. **Ouvrir l'application** dans Chrome/Edge/Opera
4. **Cliquer sur "Connecter la Balance"**
5. **Sélectionner votre balance** dans la liste qui apparaît
6. **Autoriser la connexion** - Le navigateur demandera confirmation
7. **Le poids s'affiche** automatiquement

## Résolution des problèmes

### La balance n'apparaît pas dans la liste

- Vérifiez que le câble USB est bien connecté
- Essayez un autre port USB
- Redémarrez la balance
- Vérifiez que les drivers sont installés (Windows peut les installer automatiquement)

### Pas de lecture de poids

1. Changez la **vitesse de transmission** (baud rate):
   - Essayez 2400, 4800, 9600, 19200
2. Vérifiez les **paramètres de la balance**:
   - Mode de transmission doit être activé
   - Vérifiez le manuel de votre balance

### Valeurs incorrectes ou incohérentes

1. **Changez le protocole** de "Auto-detect" vers le protocole spécifique de votre marque:
   - Toledo pour balances Toledo
   - Mettler pour Mettler Toledo
   - Etc.
2. Vérifiez les **bits de données** (7 ou 8)
3. Ajustez la **parité** (none, even, odd)

### Poids instable (fluctuant)

- C'est normal! Attendez que l'icône devienne **verte** (✓)
- L'indicateur de stabilité montre quand le poids est stable
- Ne pas bouger la balance pendant la mesure

### Erreur "Browser not supported"

- Utilisez **Chrome**, **Edge** ou **Opera**
- Firefox et Safari ne supportent pas encore Web Serial API

## Sécurité et confidentialité

- ✅ **Aucune donnée n'est envoyée** sur Internet
- ✅ **Tout reste dans le navigateur** - traitement local uniquement
- ✅ **Permission explicite requise** - Le navigateur demande votre autorisation
- ✅ **Révocable à tout moment** - Vous pouvez déconnecter quand vous voulez

## Protocoles supportés

Le système détecte automatiquement les formats suivants:

### Toledo
```
STX + poids + unité + stabilité + ETX
Exemple: ^0012.34 kg *^
```

### Mettler Toledo
```
Status + poids + unité
Exemple: S 012.34 kg
```

### Avery
```
W + poids + unité
Exemple: W 12.34 kg
```

### CAS
```
poids + unité + stabilité
Exemple: 12.34 kg *
```

### Generic
```
poids + unité (optionnel)
Exemple: 12.34 kg
```

## Support technique

Pour toute question ou problème:

1. Consultez le **manuel de votre balance**
2. Vérifiez la **configuration recommandée** ci-dessus
3. Essayez le **mode générique** si la détection automatique échoue
4. Contactez le support technique de votre balance pour les paramètres de communication

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
