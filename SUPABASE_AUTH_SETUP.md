# Configuration Supabase Auth et rôles

Ce projet supporte maintenant deux couches Supabase distinctes:

- Persistance opérationnelle partagée pour organismes, produits, entrées, mouvements et commandes.
- Authentification distante optionnelle via Supabase Auth avec profils et rôles applicatifs.

Fichiers de référence:

- .env.local.example
- .env.deploy.example
- GUIA_FRONTEND_SUPABASE_PRODUCCION.md

## 1. Variables d'environnement

Configurer ces variables dans l'hébergement et en local:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH=true

Pour GitHub Pages, ces variables doivent exister comme secrets GitHub Actions afin que le build Vite puisse les injecter au moment de la compilation.

## 2. SQL à exécuter

Exécuter dans cet ordre dans l'éditeur SQL de Supabase:

1. supabase/app_storage.sql
2. supabase/auth_roles.sql

Alternative reproductible avec Supabase CLI:

1. Définir SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD, SUPABASE_ACCESS_TOKEN et SUPABASE_SERVICE_ROLE_KEY
2. Lancer npm run supabase:deploy:dry-run
3. Lancer npm run supabase:deploy

Alternative GitHub Actions:

1. Définir les secrets GitHub SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD, SUPABASE_ACCESS_TOKEN et SUPABASE_SERVICE_ROLE_KEY
2. Lancer manuellement le workflow .github/workflows/deploy-supabase.yml en mode simulation
3. Relancer le même workflow avec dry_run désactivé pour le déploiement réel

## 3. Création des utilisateurs

La connexion distante utilise Supabase Auth.
Chaque utilisateur doit exister dans auth.users.
Le trigger on_auth_user_created crée automatiquement son profil dans public.user_profiles à partir des métadonnées.

Métadonnées recommandées à définir lors de la création d'un utilisateur:

- username
- nombre
- apellido
- role_id
- descripcion
- telefono
- departamento_id

Exemple de role_id:

- desarrollador
- administrador
- coordinador
- responsable_entrepot
- responsable_transport
- liaison_organisme
- visualizador

## 4. Comportement de l'application

- Si Supabase Auth est activé, l'écran de login accepte nom d'utilisateur ou email.
- L'application résout le login via la fonction SQL public.resolve_auth_login.
- Après authentification Supabase, l'application continue à générer son JWT interne pour conserver le reste de la logique actuelle.
- Si l'utilisateur n'existe pas encore dans Supabase, le fallback local continue à fonctionner.

## 5. Limite actuelle

La gestion sécurisée des utilisateurs en production passe maintenant par l'Edge Function admin-users.
Cette fonction permet de lister, créer, mettre à jour le profil et désactiver des utilisateurs via le service role côté serveur.
La limite restante est surtout opérationnelle: il faut déployer cette fonction et définir SUPABASE_SERVICE_ROLE_KEY dans les secrets Supabase avant d'utiliser l'administration distante.

## 6. GitHub Pages

Le workflow .github/workflows/deploy-pages.yml compile déjà le frontend avec les secrets GitHub suivants:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH

Les deux premiers sont obligatoires pour que le build aboutisse.
Si ces secrets ne sont pas définis, le workflow échoue avant npm run build.

## 7. Déploiement CLI exact

Le workflow GitHub .github/workflows/deploy-supabase.yml exécute le même chemin validé que l'usage local Windows: npm run supabase:deploy:dry-run ou npm run supabase:deploy sur windows-latest.
Cela garde le workflow aligné avec le script PowerShell déjà utilisé dans ce repo.

Variables PowerShell minimales:

- $env:SUPABASE_PROJECT_REF='tu-projet-ref'
- $env:SUPABASE_DB_PASSWORD='mot-de-passe-bdd'
- $env:SUPABASE_ACCESS_TOKEN='token-cli'
- $env:SUPABASE_SERVICE_ROLE_KEY='service-role-key'

Commandes:

- npm run supabase:deploy:dry-run
- npm run supabase:deploy