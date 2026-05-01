# 📚 Guide d'Utilisation - Système de Gestion de Banque Alimentaire

## 🌟 Bienvenue

Ce guide vous accompagnera dans l'utilisation complète du système de gestion de la Banque Alimentaire. Le système est conçu pour simplifier et optimiser toutes les opérations de gestion d'inventaire, commandes, organismes bénéficiaires et bien plus encore.

---

## 📖 Table des Matières

1. [Premiers Pas](#premiers-pas)
2. [Tableau de Bord Principal](#tableau-de-bord-principal)
3. [Module Entrepôt](#module-entrepôt)
   - [Inventaire](#inventaire)
   - [Étiquettes](#étiquettes)
   - [Commandes](#commandes)
   - [Organismes](#organismes)
   - [Offres](#offres)
   - [Transport](#transport)
   - [Rapports](#rapports)
   - [Contacts Internes](#contacts-internes)
4. [Module Cuisine](#module-cuisine)
5. [Module Liaison](#module-liaison)
6. [Module Communication Interne](#module-communication-interne)
7. [Module Recrutement](#module-recrutement)
8. [Module Utilisateurs/Rôles](#module-utilisateurs-rôles)
9. [Module Comptoir (ID Digital)](#module-comptoir)
10. [Panneau de Marque](#panneau-de-marque)
11. [Configuration](#configuration)
12. [Accès Organismes](#accès-organismes)
13. [Système Multilingue](#système-multilingue)
14. [FAQ & Dépannage](#faq--dépannage)

---

## 🚀 Premiers Pas

### Connexion au Système

1. **Accédez à l'application** via votre navigateur web
2. **Entrez vos identifiants** :
   - Nom d'utilisateur
   - Mot de passe
3. **Option "Se souvenir de moi"** : Cochez cette case pour rester connecté
4. **Cliquez sur "Connexion"**

> **Note** : Pour l'environnement de démonstration, utilisez :
> - Utilisateur : `admin`
> - Mot de passe : `admin`

### Interface Principale

Après la connexion, vous verrez :

- **En-tête** : Logo, nom du système, notifications, sélecteur de langue, profil utilisateur
- **Menu latéral** : Navigation principale avec tous les modules
- **Zone de contenu** : Affiche le module actif
- **Bouton flottant** : Accès rapide pour les organismes (vert, en bas à gauche)

### Navigation

- **Cliquez sur les icônes du menu** pour accéder aux différents modules
- **Le menu "Entrepôt"** contient des sous-menus (cliquez sur la flèche pour développer)
- **Icône Maison** en haut : Retour aux départements
- **Icône Déconnexion** en haut à droite : Fermer la session

---

## 📊 Tableau de Bord Principal

Le tableau de bord vous donne une vue d'ensemble de votre Banque Alimentaire en temps réel.

### Statistiques Principales

**4 Cartes de Résumé** affichant :
- **Inventaire Total** : Poids total en kg de tous les produits
- **Commandes Actives** : Nombre de commandes en cours
- **PRS en Attente** : Enregistrements du Programme de Récupération des Supermarchés
- **Organismes Actifs** : Nombre d'organismes bénéficiaires actifs

### Sections Interactives

1. **Inventaire par Catégorie**
   - Visualisation graphique (graphique circulaire)
   - Poids en kg par catégorie
   - Valeur monétaire totale

2. **Produits à Stock Faible**
   - Liste des produits nécessitant réapprovisionnement
   - Quantité actuelle vs quantité minimale
   - Alertes visuelles (rouge/orange/jaune)

3. **Commandes Récentes**
   - Dernières commandes créées
   - État actuel de chaque commande
   - Accès rapide aux détails

4. **Mouvements d'Inventaire**
   - Graphique des entrées/sorties de la dernière semaine
   - Tendances du stock

### Actions Rapides

Depuis le tableau de bord, vous pouvez :
- Cliquer sur "Voir Détails" pour accéder aux modules complets
- Accéder directement à l'inventaire, commandes ou organismes
- Consulter les alertes intelligentes (icône cloche en haut)

---

## 🏭 Module Entrepôt

Le module Entrepôt contient 8 sous-modules essentiels pour la gestion quotidienne.

---

### 📦 Inventaire

Le cœur du système - gérez tous vos produits ici.

#### Vue d'Ensemble

**Onglets disponibles** :
1. **Liste des Produits** : Tous les produits en stock
2. **Historique des Entrées** : Enregistrements d'entrées (dons/achats)
3. **Vérifications Récentes** : Audit des entrées récentes
4. **Mouvements** : Historique complet des mouvements
5. **Catégories** : Configuration des catégories et sous-catégories

#### Enregistrer une Nouvelle Entrée

**Étapes** :

1. **Cliquez sur "Nouvelle entrée"** (bouton vert en haut)

2. **Sélectionnez le Type d'Entrée** :
   - 🎁 **Don** : Produits donnés par des particuliers ou entreprises
   - 🛒 **Achat** : Produits achetés
   - 🏪 **Programme** : Récupération de supermarchés (PRS)

3. **Informations du Contact** :
   - Recherchez un donateur/fournisseur existant
   - Ou créez un contact personnalisé

4. **Ajoutez les Produits** :
   
   **a) Sélectionnez la Catégorie** :
   - Exemple : Fruits et Légumes, Produits Laitiers, etc.
   
   **b) Sélectionnez la Sous-catégorie** :
   - Exemple : Pommes, Lait, Pain, etc.
   
   **c) Variante (optionnelle)** :
   - Exemple : Pommes Gala, Pommes Granny Smith
   
   **d) Quantité et Poids** :
   - Quantité : Nombre d'unités
   - Unité de mesure : kg, unités, boîtes, etc.
   - Poids unitaire : En kilogrammes
   - *Le poids total se calcule automatiquement*
   
   **e) Température de Stockage** :
   - 🌡️ **Ambiant** : Température ambiante (conserves, pâtes, etc.)
   - ❄️ **Réfrigéré** : 0-4°C (produits frais)
   - 🧊 **Congelé** : -18°C ou moins (viandes, glaces)
   
   **f) Détails Optionnels** :
   - Numéro de lot
   - Date d'expiration
   - Observations

5. **Cliquez sur "Ajouter un produit à l'entrée"**
   - Le produit s'ajoute à la liste
   - Vous pouvez ajouter plusieurs produits

6. **Options avant de finaliser** :
   - ☑️ **Garder ouvert après l'enregistrement** : Pour ajouter plus d'entrées
   - 🖨️ **Imprimer l'étiquette automatiquement** : Génère l'étiquette après l'enregistrement

7. **Cliquez sur "Terminer et fermer"**

#### Gérer les Produits en Stock

**Recherche et Filtres** :
- Barre de recherche : Cherchez par nom ou code
- Filtre par catégorie : Sélectionnez une catégorie spécifique
- Filtre par température : Ambiant, Réfrigéré, Congelé
- Filtre par lot : Recherchez par numéro de lot

**Actions sur les Produits** :

1. **📋 Voir l'historique** : Consultez tous les mouvements du produit
2. **🔄 Transformer le produit** : Convertissez un produit en un autre
3. **➕ Ajouter au panier** : Pour créer des commandes

#### Panier de Produits

Le panier vous permet de préparer des commandes :

1. **Ajoutez des produits** depuis la liste d'inventaire
2. **Ajustez les quantités** dans le panier
3. **Options** :
   - **Créer une Commande Individuelle** : Pour un seul organisme
   - **Créer des Commandes en Groupe** : Pour plusieurs organismes simultanément
4. **Vider** : Supprime tous les produits du panier

#### Catégories et Sous-catégories

**Gérer la Structure** :

1. **Accédez à l'onglet "Catégories"**
2. **Créez une Nouvelle Catégorie** :
   - Nom (Ex: Produits Laitiers)
   - Description
   - Icône (emoji)
   - Couleur
   - **Valeur par kg** : IMPORTANT - Définissez la valeur monétaire en CAD$
3. **Créez des Sous-catégories** :
   - Appartiennent à une catégorie parent
   - Héritent automatiquement de la valeur par kg
   - Exemple : Lait Entier, Lait Écrémé (sous Produits Laitiers)

> **💡 Astuce** : Les valeurs monétaires se définissent UNIQUEMENT au niveau catégorie et se propagent automatiquement à toutes les sous-catégories.

---

### 🏷️ Étiquettes

Générez et imprimez des étiquettes pour vos produits.

#### Fonctionnalités

1. **Génération Automatique** : Lors de l'enregistrement d'une entrée
2. **Réimpression** : Depuis l'historique des entrées
3. **Informations sur l'Étiquette** :
   - Code QR unique
   - Nom du produit et catégorie
   - Donateur/Fournisseur
   - Quantité et poids
   - Température de stockage
   - Date d'entrée
   - Numéro de lot
   - Date d'expiration
   - Logo de votre banque

#### Imprimer une Étiquette

1. **Depuis l'Inventaire** :
   - Historique des Entrées → Cliquez sur une entrée → "Imprimer l'étiquette"

2. **Depuis les Vérifications Récentes** :
   - Cliquez sur une entrée → "Réimprimer l'étiquette"

3. **L'étiquette s'ouvre** dans une nouvelle fenêtre pour impression

---

### 📋 Commandes

Créez et gérez les commandes pour les organismes bénéficiaires.

#### Créer une Commande Individuelle

**Méthode 1 : Depuis le Panier**

1. Ajoutez des produits au panier depuis l'inventaire
2. Cliquez sur "Créer une Commande"
3. Sélectionnez le type : **Commande Individuelle**
4. Choisissez l'organisme destinataire
5. Définissez la date de livraison
6. Ajoutez des observations (optionnel)
7. Cliquez sur "Générer la Commande"

**Méthode 2 : Depuis le Module Commandes**

1. Accédez au module "Commandes"
2. Cliquez sur "Créer une Commande"
3. Suivez les mêmes étapes

#### Créer des Commandes en Groupe

Idéal pour distribuer les mêmes produits à plusieurs organismes :

1. **Ajoutez des produits au panier**
2. **Cliquez sur "Créer une Commande"**
3. **Sélectionnez "Commandes en Groupe"**
4. **Sélectionnez les organismes** (cochez plusieurs organismes)
5. **Date de livraison** : Commune à toutes les commandes
6. **Date limite de réponse** : Pour que les organismes confirment
7. **Observations** : Seront ajoutées à toutes les commandes
8. **Résumé** :
   - Nombre de commandes qui seront créées
   - Produits qui seront répliqués
9. **Cliquez sur "Générer la Répartition"**

#### Gérer les Commandes

**Filtres disponibles** :
- Par état : En Attente, En Préparation, Terminée, Livrée, Annulée
- Par organisme
- Par numéro de commande

**États des Commandes** :
- 🟡 **En Attente** : Commande créée, attend confirmation
- 🔵 **En Préparation** : Commande acceptée, en cours de préparation
- 🟢 **Terminée** : Prête pour livraison
- ✅ **Livrée** : Livraison effectuée
- 🔴 **Annulée** : Commande annulée

**Actions sur les Commandes** :
- **Voir** : Consulter les détails complets
- **Accepter** : Passer de "En Attente" à "En Préparation"
- **Imprimer** : Générer un document de commande
- **Annuler** : Annuler la commande

#### Offres Spéciales

Créez des offres que les organismes peuvent demander :

1. **Accédez à "Offres pour Organismes"** (sous-menu d'Entrepôt)
2. **Créez une nouvelle offre** avec des produits disponibles
3. **Les organismes reçoivent une notification** via email
4. **Consultez les demandes** dans la section Offres
5. **Acceptez ou Rejetez** les demandes des organismes

---

### 🏢 Organismes

Gérez vos organismes bénéficiaires et leurs informations.

#### Vue d'Ensemble des Organismes

**Sections** :
1. **Liste des Organismes** : Tous les organismes enregistrés
2. **Programme PRS** : Organismes participants au Programme de Récupération
3. **Statistiques** : Sauvetages, distributions, historiques

#### Ajouter un Nouvel Organisme

1. **Cliquez sur "Nouvel Organisme"**
2. **Informations de base** :
   - Nom de l'organisme
   - Type (Association, ONG, Centre communautaire, etc.)
   - Numéro d'identification
3. **Coordonnées** :
   - Adresse complète
   - Téléphone
   - Email
   - Personne de contact
4. **Paramètres** :
   - Participe au PRS (Oui/Non)
   - État (Actif/Inactif)
   - Capacité de stockage
   - Fréquence de livraison préférée
5. **Cliquez sur "Enregistrer"**

#### Programme PRS (Récupération Supermarchés)

**Qu'est-ce que le PRS ?**
Les organismes récupèrent des produits directement dans les supermarchés. Vous devez enregistrer ces récupérations dans le système.

**Enregistrer une Récupération PRS** :

1. **Accédez à "Organismes" → Onglet "PRS"**
2. **Cliquez sur "Nouveau enregistrement"**
3. **Sélectionnez** :
   - Organisme donateur (supermarché)
   - Mois de récupération
4. **Ajoutez les produits récupérés** :
   - Catégorie PRS
   - Sous-catégorie
   - Nom du produit
   - Quantité/Poids
   - Unité de mesure
   - Température de stockage
5. **Ajoutez plusieurs produits** (bouton "Ajouter un Article")
6. **Observations** : Notes supplémentaires
7. **Cliquez sur "Enregistrer"**

**Statistiques PRS** :
- Total sauvé par organisme
- Sauvetage mensuel
- Produits les plus récupérés
- Valeur monétaire totale sauvée

---

### 🚚 Transport

Planifiez et gérez la logistique de livraison.

#### Gérer les Véhicules

1. **Ajoutez vos véhicules** :
   - Marque et modèle
   - Plaque d'immatriculation
   - Capacité de charge
   - Type (Réfrigéré, Congelé, Ambiant)
   - État (Disponible, En maintenance)

2. **Assignez un conducteur** à chaque véhicule

#### Planifier une Livraison

1. **Créez une commande** avec date de livraison
2. **Accédez au module "Transport"**
3. **Assignez** :
   - Véhicule disponible
   - Conducteur
   - Itinéraire de livraison
4. **Suivez l'état** :
   - En attente
   - En route
   - Livrée

#### Optimisation des Routes

Le système suggère automatiquement :
- Routes optimales basées sur les adresses
- Groupement de livraisons par zone géographique
- Priorisation selon les dates d'expiration

---

### 📊 Rapports

Générez des rapports détaillés sur toutes les opérations.

#### Types de Rapports Disponibles

1. **Rapport d'Inventaire** :
   - Stock actuel par catégorie
   - Valeur monétaire totale
   - Produits à stock faible
   - Prévisions de réapprovisionnement

2. **Rapport de Mouvements** :
   - Entrées et sorties par période
   - Par catégorie ou produit spécifique
   - Graphiques de tendances

3. **Rapport de Commandes** :
   - Commandes par organisme
   - Taux de complétion
   - Produits les plus commandés
   - Statistiques temporelles

4. **Rapport de Distribution** :
   - Quantités distribuées par organisme
   - Équité de distribution
   - Impact social (kg distribués)

5. **Rapport PRS** :
   - Sauvetages par organisme donateur
   - Évolution mensuelle
   - Valeur monétaire sauvée

6. **Rapport Financier** :
   - Valeur totale d'inventaire
   - Dons reçus
   - Achats effectués
   - Distributions

#### Générer un Rapport

1. **Accédez au module "Rapports"**
2. **Sélectionnez le type de rapport**
3. **Définissez les filtres** :
   - Période (date de début et fin)
   - Catégories spécifiques
   - Organismes spécifiques
4. **Aperçu** : Visualisez avant impression
5. **Options** :
   - 📄 **Exporter en PDF**
   - 📊 **Exporter en Excel**
   - 🖨️ **Imprimer**
   - 📧 **Envoyer par email**

---

### 👥 Contacts Internes

Gérez votre équipe et les contacts de la banque alimentaire.

#### Ajouter un Contact Interne

1. **Cliquez sur "Nouveau Contact"**
2. **Informations** :
   - Prénom et nom
   - Fonction/Rôle
   - Département
   - Email professionnel
   - Téléphone
   - Photo (optionnelle)
3. **Permissions** : Définissez les accès au système
4. **Enregistrez**

#### Catégories de Contacts

- **Administration** : Direction, gestion
- **Entrepôt** : Gestionnaires de stock, préparateurs
- **Logistique** : Conducteurs, coordinateurs de transport
- **Relations** : Liaison avec les organismes
- **Bénévoles** : Bénévoles réguliers

---

## 👨‍🍳 Module Cuisine

Gérez la transformation de produits et la production de repas.

### Fonctionnalités Principales

1. **Recettes** :
   - Créez des recettes avec ingrédients
   - Calculez automatiquement les coûts
   - Gérez les allergènes

2. **Production** :
   - Planifiez la production de repas
   - Consommez automatiquement les ingrédients de l'inventaire
   - Ajoutez les repas produits au stock

3. **Transformation** :
   - Convertissez des produits bruts en produits transformés
   - Exemple : Fruits frais → Compote de fruits
   - Mise à jour automatique de l'inventaire

### Créer une Recette

1. **Accédez au module "Cuisine"**
2. **Cliquez sur "Nouvelle Recette"**
3. **Informations** :
   - Nom de la recette
   - Portions produites
   - Catégorie (Plat principal, Dessert, etc.)
4. **Ajoutez les ingrédients** :
   - Sélectionnez depuis l'inventaire
   - Quantité nécessaire
   - Le coût se calcule automatiquement
5. **Instructions de préparation**
6. **Enregistrez**

### Produire des Repas

1. **Sélectionnez une recette**
2. **Définissez la quantité** à produire
3. **Le système vérifie** la disponibilité des ingrédients
4. **Confirmez la production** :
   - Les ingrédients sont retirés de l'inventaire
   - Les repas produits sont ajoutés au stock

---

## 📧 Module Liaison

Communication et coordination avec les organismes bénéficiaires.

### Envoyer des Communications

1. **Email individuel** :
   - Sélectionnez un organisme
   - Rédigez votre message
   - Joignez des documents (listes, catalogues)
   - Envoyez

2. **Email en groupe** :
   - Sélectionnez plusieurs organismes
   - Message commun ou personnalisé
   - Envoi groupé

### Partager des Listes de Produits

1. **Créez une liste** depuis l'inventaire
2. **Options** :
   - Inclure les stocks disponibles
   - Inclure les prix
   - Inclure les photos
3. **Partagez avec** :
   - Organismes spécifiques
   - Tous les organismes actifs
4. **Format** : PDF professionnel avec votre logo

### Historique des Communications

Consultez toutes les communications envoyées :
- Date et heure
- Destinataires
- Objet
- État (Envoyé, Lu, Répondu)

---

## 💬 Module Communication Interne

Facilitez la communication au sein de votre équipe.

### Fonctionnalités

1. **Messagerie Interne** :
   - Messages directs entre membres de l'équipe
   - Messages de groupe par département
   - Notifications en temps réel

2. **Annonces** :
   - Publiez des annonces importantes
   - Visible pour toute l'équipe
   - Épinglez les annonces prioritaires

3. **Tâches et Rappels** :
   - Créez des tâches pour les membres
   - Définissez des échéances
   - Suivez la complétion

### Envoyer un Message

1. **Cliquez sur "Nouveau Message"**
2. **Sélectionnez les destinataires**
3. **Objet et contenu**
4. **Pièces jointes** (optionnel)
5. **Envoyez**

---

## 👔 Module Recrutement

Gérez les candidatures de bénévoles et employés.

### Publier une Offre

1. **Cliquez sur "Nouvelle Offre"**
2. **Informations** :
   - Titre du poste
   - Type (Bénévolat, Emploi)
   - Description des tâches
   - Compétences requises
   - Disponibilité demandée
3. **Publiez** : L'offre devient visible

### Gérer les Candidatures

1. **Consultez les candidatures reçues**
2. **Pour chaque candidat** :
   - CV et lettre de motivation
   - Notes internes
   - Historique des contacts
3. **Actions** :
   - Accepter pour entretien
   - Rejeter poliment
   - Mettre en attente

### Planifier un Entretien

1. **Sélectionnez un candidat**
2. **Proposez des créneaux**
3. **Le candidat reçoit une notification**
4. **Confirmez la date finale**

---

## 👥 Module Utilisateurs/Rôles

Gérez les accès et permissions au système.

### Créer un Utilisateur

1. **Accédez à "Utilisateurs/Rôles"**
2. **Cliquez sur "Nouvel Utilisateur"**
3. **Informations** :
   - Nom d'utilisateur (login)
   - Mot de passe initial
   - Email
   - Nom complet
4. **Assignez un rôle**
5. **Enregistrez**

### Rôles Prédéfinis

1. **Super Administrateur** :
   - Accès total au système
   - Gestion des utilisateurs
   - Configuration globale

2. **Administrateur** :
   - Accès à tous les modules opérationnels
   - Ne peut pas modifier la configuration système

3. **Gestionnaire d'Entrepôt** :
   - Inventaire complet
   - Commandes
   - Rapports

4. **Gestionnaire de Commandes** :
   - Création et gestion des commandes
   - Communication avec organismes

5. **Chauffeur** :
   - Module Transport uniquement
   - Consultation des commandes assignées

6. **Bénévole** :
   - Accès limité selon les tâches

### Créer un Rôle Personnalisé

1. **Cliquez sur "Nouveau Rôle"**
2. **Nom du rôle**
3. **Sélectionnez les permissions** :
   - Par module (cochez les modules accessibles)
   - Par action (lecture, écriture, suppression)
4. **Enregistrez**

### Gestion des Permissions

**Exemple de configuration** :

```
Rôle : Gestionnaire PRS
Modules accessibles :
✅ Organismes (Lecture, Écriture)
✅ PRS (Lecture, Écriture)
✅ Rapports PRS (Lecture)
❌ Inventaire (Accès refusé)
❌ Configuration (Accès refusé)
```

---

## 🏪 Module Comptoir (ID Digital)

Point de distribution pour bénéficiaires individuels.

### Configuration du Comptoir

1. **Activez le mode Comptoir**
2. **Définissez** :
   - Produits disponibles au comptoir
   - Limites par personne
   - Jours et horaires d'ouverture

### Enregistrer un Bénéficiaire

1. **Cliquez sur "Nouveau Bénéficiaire"**
2. **Informations** :
   - Nom et prénom
   - Carte d'identité ou numéro de référence
   - Situation familiale (nombre de personnes)
   - Restrictions alimentaires
3. **Générez une carte digitale** :
   - QR Code unique
   - Photo du bénéficiaire
   - Valide pour X visites par mois

### Processus de Distribution

1. **Le bénéficiaire présente** sa carte ou QR Code
2. **Scannez le QR Code**
3. **Le profil s'affiche** avec :
   - Historique des visites
   - Allocation restante ce mois
   - Restrictions alimentaires
4. **Sélectionnez les produits distribués**
5. **Validez la distribution**
6. **Imprimez un reçu** (optionnel)

### Statistiques Comptoir

- Nombre de bénéficiaires servis
- Produits les plus distribués
- Fréquence des visites
- Impact social mesuré

---

## 🎨 Panneau de Marque

Personnalisez l'apparence de votre système.

### Accéder au Panneau

1. **Cliquez sur "Panneau de Marque"** dans le menu
2. **Vous verrez 3 sections** : Identité, Couleurs, Aperçu

### Personnaliser l'Identité

**Logo** :
1. Cliquez sur "Téléverser un Logo"
2. Choisissez une image (PNG, JPG, SVG)
3. Le logo apparaît immédiatement

**Nom du Système** :
1. Entrez le nom de votre banque alimentaire
2. Exemple : "Banque Alimentaire de Montréal"
3. Ce nom apparaît dans l'en-tête

### Personnaliser les Couleurs

Le système utilise 2 couleurs principales :

1. **Couleur Primaire** :
   - En-tête et menu de navigation
   - Par défaut : Bleu #1E73BE
   - Cliquez sur le sélecteur pour changer

2. **Couleur Secondaire** :
   - Boutons et accents
   - Par défaut : Vert #4CAF50
   - Cliquez sur le sélecteur pour changer

> **💡 Conseil** : Choisissez des couleurs contrastées pour une meilleure lisibilité

### Aperçu en Direct

- Les changements s'appliquent immédiatement
- Testez sur différents modules
- Si vous n'aimez pas, cliquez sur "Restaurer les valeurs par défaut"

### Enregistrer

1. **Cliquez sur "Enregistrer les Modifications"**
2. **Votre marque est sauvegardée** et visible par tous les utilisateurs

---

## ⚙️ Configuration

Paramètres généraux du système.

### Paramètres Généraux

1. **Informations de l'organisation** :
   - Nom légal
   - Adresse du siège
   - Téléphone et email principaux
   - Site web

2. **Paramètres Régionaux** :
   - Fuseau horaire
   - Format de date (JJ/MM/AAAA ou MM/JJ/AAAA)
   - Devise : CAD$ (Dollar Canadien)
   - Séparateur décimal

### Paramètres d'Inventaire

1. **Unités de Mesure** :
   - Gérez les unités disponibles
   - Ajoutez des unités personnalisées
   - Exemple : kg, g, L, mL, unité, boîte, sac

2. **Alertes de Stock** :
   - Seuil de stock faible (%)
   - Seuil d'alerte d'expiration (jours avant)
   - Notifications automatiques

3. **Températures de Stockage** :
   - Définissez les plages de température
   - Ambiant : 15-25°C
   - Réfrigéré : 0-4°C
   - Congelé : ≤ -18°C

### Notifications

1. **Activez/Désactivez** :
   - Notifications d'inventaire
   - Notifications de commandes
   - Alertes d'expiration
   - Communications avec organismes

2. **Canaux** :
   - Email
   - Push (dans l'application)
   - SMS (optionnel)

### Sauvegarde et Sécurité

1. **Sauvegardes automatiques** :
   - Fréquence : Quotidienne, Hebdomadaire
   - Conservation : 30 jours

2. **Exportation des données** :
   - Exportez toutes vos données en JSON
   - Utile pour migrations ou audits

3. **Politique de mots de passe** :
   - Longueur minimale
   - Expiration des mots de passe
   - Authentification à deux facteurs (2FA)

---

## 🔑 Accès Organismes

Permettez aux organismes de consulter leur profil et faire des demandes.

### Activer l'Accès

1. **Accédez au profil d'un organisme**
2. **Section "Accès Digital"**
3. **Générez une Clé d'Accès** :
   - Cliquez sur "Générer Clé"
   - Une clé unique est créée
4. **Partagez la clé** avec l'organisme (email automatique)

### Ce que l'Organisme Peut Voir

Avec la clé d'accès, l'organisme accède à :

1. **Son Profil** :
   - Coordonnées
   - Historique de distributions
   - Statistiques reçues

2. **Commandes** :
   - Commandes en cours
   - Historique des commandes
   - Télécharger les bons de livraison

3. **Faire des Demandes** :
   - Consulter les offres disponibles
   - Demander des produits spécifiques
   - Confirmer les commandes en attente

4. **Calendrier** :
   - Prochaines livraisons programmées
   - Rappels de dates limites

### Interface Organisme

L'organisme accède via :
- URL : `votre-systeme.com/organisme`
- Clé d'accès unique
- Interface simplifiée et intuitive

---

## 🌍 Système Multilingue

Le système supporte 4 langues : Français, Espagnol, Anglais et Arabe.

### Changer de Langue

1. **Cliquez sur le sélecteur de langue** (drapeau en haut à droite)
2. **Sélectionnez votre langue** :
   - 🇫🇷 Français
   - 🇪🇸 Español
   - 🇬🇧 English
   - 🇸🇦 العربية (Arabe)
3. **L'interface change immédiatement**

### Support RTL pour l'Arabe

Lorsque vous sélectionnez l'arabe :
- L'interface s'inverse (droite vers gauche)
- Les menus s'alignent à droite
- Les textes sont en arabe
- Navigation naturelle pour les utilisateurs arabophones

### Personnaliser les Traductions

**Pour les administrateurs** :

1. Accédez à **Configuration → Langues**
2. Sélectionnez une langue à modifier
3. Modifiez les traductions spécifiques
4. Enregistrez

> **Note** : Idéal pour adapter certains termes à votre contexte local

---

## 🎯 Workflows Recommandés

### Workflow 1 : Réception d'un Don

```
1. Don arrive → Module Inventaire → Nouvelle entrée
2. Sélectionnez "Don" → Ajoutez le donateur
3. Enregistrez chaque produit avec détails
4. Cochez "Imprimer étiquette automatiquement"
5. Terminez et fermez
6. Étiquettes imprimées → Collez sur les produits
7. Produits stockés selon température
8. Inventaire mis à jour automatiquement
```

### Workflow 2 : Distribution Hebdomadaire

```
1. Lundi : Consultez les demandes des organismes
2. Mardi : Créez les commandes en groupe
   - Ajoutez produits au panier
   - Commandes en groupe → Sélectionnez organismes
   - Date de livraison : Vendredi
3. Mercredi : Les organismes confirment (email)
4. Jeudi : Préparez les commandes
   - Imprimez les bons de commande
   - Préparation en entrepôt
   - Marquez "En préparation"
5. Vendredi : Livraison
   - Module Transport → Assignez véhicules
   - Itinéraires optimisés
   - Marquez "Livrée" après chaque livraison
6. Fin de semaine : Générez le rapport de distribution
```

### Workflow 3 : Gestion d'Alerte de Stock

```
1. Notification : "Stock faible - Riz blanc"
2. Vérifiez les détails dans Inventaire
3. Options :
   a) Contacter donateurs habituels
   b) Planifier un achat
   c) Redistribuer depuis autre entrepôt
4. Enregistrez l'entrée quand réapprovisionné
5. Alerte disparaît automatiquement
```

---

## 💡 Conseils et Bonnes Pratiques

### Pour l'Inventaire

✅ **À FAIRE** :
- Enregistrez TOUTES les entrées immédiatement
- Utilisez toujours les numéros de lot
- Vérifiez les dates d'expiration
- Imprimez les étiquettes systématiquement
- Faites des inventaires physiques mensuels

❌ **À ÉVITER** :
- Ne pas enregistrer de petites entrées ("je le ferai plus tard")
- Ignorer les alertes de stock faible
- Mélanger des lots différents
- Oublier de mettre à jour les sorties

### Pour les Commandes

✅ **À FAIRE** :
- Communiquez les dates de livraison à l'avance
- Confirmez toujours avec les organismes
- Utilisez les commandes en groupe pour gagner du temps
- Imprimez les bons de livraison
- Demandez une signature à la livraison

❌ **À ÉVITER** :
- Créer des commandes sans vérifier le stock
- Oublier d'assigner un véhicule
- Livrer sans bon de commande
- Ne pas marquer les commandes livrées

### Pour les Données

✅ **À FAIRE** :
- Exportez les rapports mensuellement
- Sauvegardez régulièrement
- Nettoyez les données périmées annuellement
- Formez tous les utilisateurs
- Documentez vos processus spécifiques

❌ **À ÉVITER** :
- Partager vos identifiants
- Utiliser un seul compte pour toute l'équipe
- Ignorer les erreurs de données
- Supprimer sans vérifier

---

## 🆘 FAQ & Dépannage

### Questions Fréquentes

**Q : Comment puis-je retrouver un produit rapidement ?**
R : Utilisez la recherche dans Inventaire (par nom ou code), ou filtrez par catégorie. Chaque produit a un code unique.

**Q : Puis-je modifier une commande déjà créée ?**
R : Oui, tant qu'elle est en état "En Attente". Après acceptation, créez une nouvelle commande ou contactez l'organisme.

**Q : Comment gérer un produit endommagé ?**
R : Inventaire → Mouvements → Nouveau Mouvement → Correction Manuelle → Réduisez la quantité et expliquez la raison.

**Q : Les organismes ne reçoivent pas les emails**
R : Vérifiez leurs adresses email dans leur profil. Consultez aussi Configuration → Notifications.

**Q : Comment imprimer plusieurs étiquettes d'un coup ?**
R : Depuis Historique des Entrées, cochez plusieurs entrées et cliquez sur "Imprimer les étiquettes sélectionnées".

**Q : Puis-je exporter l'inventaire complet ?**
R : Oui, Inventaire → Bouton "Exporter" → Choisissez le format (Excel ou PDF).

**Q : Comment calculer la valeur de mon inventaire ?**
R : Rapports → Rapport d'Inventaire → La valeur totale s'affiche automatiquement (basée sur les valeurs par kg).

**Q : Un organisme a perdu sa clé d'accès**
R : Organismes → Sélectionnez l'organisme → Régénérez la clé → Envoyez-la par email.

### Problèmes Techniques

**Problème : Le système est lent**
Solutions :
1. Videz le cache de votre navigateur
2. Vérifiez votre connexion Internet
3. Fermez les onglets inutilisés
4. Contactez le support technique si persistant

**Problème : Je ne peux pas me connecter**
Solutions :
1. Vérifiez que le mot de passe est correct (sensible à la casse)
2. Essayez "Mot de passe oublié"
3. Contactez votre administrateur

**Problème : Les étiquettes ne s'impriment pas correctement**
Solutions :
1. Vérifiez les paramètres d'impression (format A4 ou Lettre)
2. Assurez-vous que le PDF s'ouvre correctement
3. Mettez à jour Adobe Reader ou utilisez Chrome

**Problème : Les notifications ne s'affichent pas**
Solutions :
1. Vérifiez Configuration → Notifications (activées ?)
2. Autorisez les notifications dans votre navigateur
3. Vérifiez le centre de notifications (icône cloche)

**Problème : Erreur lors de l'ajout d'un produit**
Solutions :
1. Vérifiez que tous les champs obligatoires (*) sont remplis
2. La quantité doit être > 0
3. Assurez-vous d'avoir sélectionné une catégorie ET sous-catégorie
4. Rechargez la page et réessayez

---

## 📞 Support et Assistance

### Obtenir de l'Aide

**Dans l'Application** :
- Icône "?" dans chaque module pour aide contextuelle
- Tutoriels vidéo intégrés
- Chat de support (coin inférieur droit)

**Documentation** :
- Ce guide (Menu → Aide → Guide Utilisateur)
- Base de connaissances en ligne
- Vidéos tutoriels sur notre chaîne

**Contact Direct** :
- Email : support@votre-banque.org
- Téléphone : +1 (XXX) XXX-XXXX
- Heures : Lundi-Vendredi, 9h-17h

### Signaler un Bug

Si vous rencontrez un problème :
1. Notez exactement ce que vous faisiez
2. Faites une capture d'écran si possible
3. Menu → Aide → Signaler un problème
4. Décrivez le problème en détail
5. Notre équipe vous répondra sous 24-48h

---

## 🚀 Mises à Jour et Nouvelles Fonctionnalités

Le système est régulièrement mis à jour avec de nouvelles fonctionnalités.

### Prochaines Fonctionnalités (Roadmap)

- 📱 **Application Mobile** : Pour gestionnaires en déplacement
- 🤖 **IA Prédictive** : Prévision des besoins en stocks
- 📊 **Tableaux de Bord Personnalisables** : Créez vos propres vues
- 🔗 **API Publique** : Intégration avec d'autres systèmes
- 🌡️ **Capteurs IoT** : Monitoring température en temps réel
- 📧 **Email Marketing** : Campagnes pour donateurs

### Notes de Version

Consultez Menu → Aide → Notes de Version pour voir :
- Nouvelles fonctionnalités ajoutées
- Améliorations de performance
- Corrections de bugs
- Modifications de l'interface

---

## 🎓 Certification Utilisateur

Devenez un expert du système !

### Programme de Formation

**Niveau 1 : Utilisateur Basique** (2 heures)
- Navigation et interface
- Inventaire de base
- Consultation des rapports

**Niveau 2 : Utilisateur Avancé** (4 heures)
- Gestion complète de l'inventaire
- Création et gestion de commandes
- Communication avec organismes

**Niveau 3 : Administrateur** (8 heures)
- Configuration système
- Gestion des utilisateurs
- Personnalisation et optimisation

### Obtenir la Certification

1. Suivez les modules de formation
2. Passez le test en ligne
3. Obtenez votre certificat digital
4. Accédez à la communauté des utilisateurs certifiés

---

## 🌟 Conclusion

Félicitations ! Vous avez maintenant toutes les connaissances pour utiliser efficacement le système de gestion de votre Banque Alimentaire.

### Points Clés à Retenir

✨ **Le système est conçu pour** :
- Simplifier votre travail quotidien
- Réduire les pertes et le gaspillage
- Améliorer la distribution aux bénéficiaires
- Fournir des données précises pour les rapports
- Faciliter la collaboration entre équipes

### Prochaines Étapes

1. **Explorez le système** : La meilleure façon d'apprendre est de pratiquer
2. **Formez votre équipe** : Partagez ce guide avec vos collègues
3. **Personnalisez** : Adaptez le système à vos besoins (marque, workflows)
4. **Donnez votre feedback** : Vos suggestions nous aident à améliorer le système

### Ressources Supplémentaires

- 📖 **Glossaire des Termes** : Menu → Aide → Glossaire
- 🎥 **Vidéos Tutoriels** : Menu → Aide → Tutoriels
- 👥 **Forum Communautaire** : Partagez avec d'autres banques alimentaires
- 📧 **Newsletter** : Recevez les mises à jour et bonnes pratiques

---

## 📄 Annexes

### Annexe A : Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl + N` | Nouvelle entrée (contexte actuel) |
| `Ctrl + S` | Enregistrer |
| `Ctrl + F` | Rechercher |
| `Ctrl + P` | Imprimer |
| `Esc` | Fermer modal/dialogue |
| `Tab` | Navigation entre champs |

### Annexe B : Codes de Température

| Code | Signification | Température |
|------|---------------|-------------|
| AMB | Ambiant | 15-25°C |
| RÉF | Réfrigéré | 0-4°C |
| CONG | Congelé | ≤ -18°C |

### Annexe C : États des Commandes

| État | Couleur | Signification |
|------|---------|---------------|
| En Attente | 🟡 Jaune | Créée, attend confirmation |
| En Préparation | 🔵 Bleu | Acceptée, en cours |
| Terminée | 🟢 Vert | Prête à livrer |
| Livrée | ✅ Vert | Livraison effectuée |
| Annulée | 🔴 Rouge | Annulée |

### Annexe D : Unités de Mesure Standards

| Unité | Abréviation | Usage |
|-------|-------------|-------|
| Kilogramme | kg | Poids |
| Gramme | g | Poids léger |
| Litre | L | Liquides |
| Millilitre | mL | Petits liquides |
| Unité | unité | Articles individuels |
| Boîte | boîte | Conserves, emballages |
| Sac | sac | Sacs de farine, riz, etc. |
| Caisse | caisse | Caisses de produits |

### Annexe E : Glossaire

**Banque Alimentaire** : Organisation qui collecte et redistribue des denrées alimentaires aux personnes dans le besoin.

**Bénéficiaire** : Personne ou organisme recevant une aide alimentaire.

**Commande** : Liste de produits à préparer pour un organisme.

**Don** : Produits donnés gratuitement par des particuliers ou entreprises.

**Inventaire** : Liste complète de tous les produits en stock.

**Lot** : Ensemble de produits fabriqués ou reçus en même temps.

**Organisme** : Association, ONG ou groupe recevant des produits de la banque.

**PRS** : Programme de Récupération des Supermarchés - partenariat avec commerces.

**Température de Stockage** : Conditions nécessaires pour conserver un produit (ambiant, réfrigéré, congelé).

---

## 📝 Notes Finales

Cette guide est un document vivant, mis à jour régulièrement.

**Version** : 1.0  
**Dernière mise à jour** : Février 2026  
**Langues disponibles** : Français, Español, English, العربية

**Crédits** :
- Développé avec ❤️ pour les Banques Alimentaires
- Interface multilingue avec support RTL
- Optimisé pour tous les appareils (ordinateur, tablette, mobile)

**Licence** :
Ce guide est fourni avec le système de gestion de Banque Alimentaire.
Tous droits réservés © 2026

---

## 🙏 Remerciements

Merci d'utiliser notre système pour votre noble mission d'aider ceux qui en ont besoin.

**Ensemble, nous combattons la faim et le gaspillage alimentaire.** 🌍💚

---

**Pour toute question, n'hésitez pas à nous contacter.**

**Bonne utilisation ! 🚀**
