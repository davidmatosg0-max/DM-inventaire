# 💾 Guide des Sauvegardes - Banque Alimentaire

## 📍 Accès aux Sauvegardes

Pour accéder à la gestion des sauvegardes :

1. **Connectez-vous** au système
2. Allez dans **⚙️ Configuración** (menu latéral)
3. Cliquez sur l'onglet **📥 Sauvegardes**

---

## ✅ Quoi Faire AVANT une Mise à Jour Importante

### **📋 Checklist Recommandée :**

- [ ] **Télécharger un backup complet** (bouton vert "Télécharger")
- [ ] **Sauvegarder le fichier** dans un endroit sûr (Drive, USB, etc.)
- [ ] **Noter la date** du backup dans le nom du fichier
- [ ] **Vérifier** que le fichier s'est téléchargé correctement

### **📅 Fréquence Recommandée :**

| Scénario | Fréquence |
|----------|-----------|
| Utilisation quotidienne | **Hebdomadaire** |
| Données critiques | **Quotidien** |
| Avant mise à jour majeure | **Immédiatement** |
| Après import massif de données | **Immédiatement** |

---

## 💾 Comment Télécharger un Backup

1. Allez dans **Configuración → Sauvegardes**
2. Cliquez sur le bouton **"Télécharger Backup"** (vert)
3. Le fichier se télécharge automatiquement avec un nom comme :
   ```
   banque-alimentaire-backup-2026-03-09.json
   ```
4. **Conservez ce fichier en lieu sûr** ⚠️

### **📝 Que contient le backup ?**

✅ Tous vos données :
- Utilisateurs et sessions
- Inventaire et produits
- Commandes et organismes
- Offres et demandes
- Transport et véhicules
- Départements et contacts
- Bénévoles et recrutement
- Toutes les configurations

---

## 📤 Comment Restaurer un Backup

⚠️ **ATTENTION : Cette opération remplace TOUTES les données actuelles !**

### **Avant de restaurer :**

1. **Téléchargez un backup actuel** (pour avoir une copie de sécurité)
2. **Vérifiez que le fichier de backup est correct** (extension .json)
3. **Assurez-vous d'avoir le bon fichier** (date récente)

### **Processus de restauration :**

1. Allez dans **Configuración → Sauvegardes**
2. Cliquez sur **"Restaurer Backup"** (orange)
3. Sélectionnez votre fichier `.json`
4. Confirmez l'avertissement (⚠️ remplace tout)
5. Le système restaure les données et recharge la page
6. **Vérifiez que tout est correct**

---

## 🔍 Inspecter les Données

Pour voir combien d'espace utilisent vos données :

1. Cliquez sur **"Inspecter (voir console)"**
2. Ouvrez la console du navigateur (**F12**)
3. Vous verrez une liste détaillée :

```
🔍 Inspección de localStorage:
═══════════════════════════════════════
📝 usuarios_banco_alimentos: 5.23 KB
📝 organismos_banco_alimentos: 12.45 KB
📝 comandas_banco_alimentos: 34.67 KB
📝 inventario_banco_alimentos: 89.12 KB
...
═══════════════════════════════════════
📊 Total: 245.67 KB
💾 Espacio usado: 4.68% de ~5MB
```

---

## ⚠️ Avertissements Importants

### **🔐 Sécurité**

- ❌ **Ne partagez JAMAIS votre fichier de backup** (contient données sensibles)
- ✅ Stockez-le dans un endroit sécurisé (Drive chiffré, USB protégé)
- ✅ Ne l'envoyez pas par email non chiffré
- ✅ Supprimez les anciens backups inutiles

### **💾 Stockage**

- Les données sont dans le **navigateur** (localStorage)
- Limite : **~5-10 MB** selon le navigateur
- Les backups sont des **fichiers JSON** sur votre ordinateur
- Pas de limite pour les fichiers de backup

### **🔄 Après Mise à Jour**

**Que se passe-t-il quand le code est mis à jour ?**

✅ **Se maintient :**
- Toutes vos données (dans localStorage)
- Sessions actives
- Configurations personnalisées

✅ **S'actualise :**
- Interface utilisateur
- Nouvelles fonctionnalités
- Corrections de bugs
- Améliorations de performance

❌ **NE se perd PAS :**
- Les données restent dans le navigateur
- Même après mise à jour du code
- Même après redémarrage du serveur

---

## 🛡️ Protection Automatique

Le système inclut des protections automatiques :

### **1. Versionado de Données**

```
✅ Versión actual: 1.0.0
```

Le système suit la version des données et applique des migrations automatiques si nécessaire.

### **2. Migrations Automatiques**

Si la structure des données change :
- ✅ Migration automatique au démarrage
- ✅ Transformation sécurisée des données
- ✅ Compatibilité préservée

### **3. Console Logs**

Informations utiles dans la console (F12) :

```javascript
✅ Sistema inicializado - Versión: 1.0.0
🔄 Migrando datos de 0.9.0 a 1.0.0...
✅ Migración completada exitosamente
```

---

## 💡 Conseils Pratiques

### **📁 Organisation des Backups**

Créez une structure de dossiers :

```
📁 Backups Banque Alimentaire/
  📁 2026/
    📁 Mars/
      📄 banque-alimentaire-backup-2026-03-09.json
      📄 banque-alimentaire-backup-2026-03-16.json
      📄 banque-alimentaire-backup-2026-03-23.json
```

### **📝 Nommage des Fichiers**

Le système nomme automatiquement :
```
banque-alimentaire-backup-YYYY-MM-DD.json
```

Vous pouvez renommer pour plus de clarté :
```
banque-alimentaire-backup-2026-03-09-avant-import-massif.json
banque-alimentaire-backup-2026-03-09-apres-mise-a-jour.json
```

### **☁️ Sauvegarde Cloud**

Synchronisez vos backups avec :
- Google Drive
- OneDrive
- Dropbox
- Serveur de l'organisation

**Automatisation possible avec scripts :**
```bash
# Exemple : Copie automatique vers Drive
cp banque-alimentaire-backup-*.json ~/Google\ Drive/Backups/
```

---

## 🔧 Dépannage

### **Problème : "Le backup ne se télécharge pas"**

**Solutions :**
1. Vérifiez les autorisations du navigateur (pop-ups)
2. Vérifiez l'espace disque disponible
3. Essayez un autre navigateur
4. Désactivez les bloqueurs de téléchargement

### **Problème : "Erreur lors de la restauration"**

**Solutions :**
1. Vérifiez que le fichier est valide (format JSON)
2. Ouvrez le fichier dans un éditeur de texte
3. Assurez-vous qu'il n'est pas corrompu
4. Essayez un backup plus récent

### **Problème : "localStorage plein"**

**Solutions :**
1. Téléchargez un backup complet
2. Supprimez les données anciennes/inutiles
3. Nettoyez les données temporaires
4. Considérez migration vers base de données externe

---

## 🆘 Support

En cas de problème :

1. **Téléchargez un backup** (si possible)
2. **Ouvrez la console** (F12)
3. **Copiez les messages d'erreur**
4. **Contactez le support** avec :
   - Screenshot de l'erreur
   - Version du navigateur
   - Étapes pour reproduire
   - Fichier de backup (si pertinent)

---

## ✨ Résumé Rapide

| Action | Bouton | Fréquence | Risque |
|--------|--------|-----------|--------|
| **Télécharger backup** | 🟢 Vert | Hebdomadaire | Aucun ✅ |
| **Restaurer backup** | 🟠 Orange | En cas de problème | ⚠️ Remplace tout |
| **Inspecter données** | ⚪ Blanc | Optionnel | Aucun ✅ |

**💡 Règle d'or : Téléchargez un backup AVANT toute opération importante !**

---

*Dernière mise à jour : 2026-03-09*
*Version : 1.0.0*
