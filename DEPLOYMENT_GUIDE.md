# 🚀 Guide de Déploiement - Banque Alimentaire

## Système Complet Prêt pour la Production

Ce guide explique comment déployer votre système de gestion de Banque Alimentaire en production.

---

## 📦 1. Construction du Build de Production

### Commande de Build

```bash
npm run build
```

ou si vous utilisez pnpm:

```bash
pnpm build
```

Cette commande va:
- ✅ Compiler et optimiser tout le code React/TypeScript
- ✅ Minifier JavaScript et CSS
- ✅ Optimiser les images et assets
- ✅ Générer des hashes pour le cache
- ✅ Créer la structure dans `/dist`

### Structure Générée

```
/dist
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js  (JavaScript optimisé)
  │   ├── index-[hash].css (CSS compilé)
  │   └── [images et autres assets]
  └── public/ (fichiers statiques)
```

---

## 🌐 2. Options de Déploiement

### ⭐ Option A: Netlify (Recommandé - Gratuit)

**Méthode 1: Drag & Drop (Plus Simple)**

1. Allez sur [netlify.com](https://netlify.com)
2. Créez un compte gratuit
3. Glissez-déposez le dossier `/dist` dans l'interface
4. Votre app sera en ligne en quelques secondes!

**Méthode 2: Git Déploiement Continu**

1. Poussez votre code sur GitHub/GitLab
2. Connectez votre repo à Netlify
3. Configuration:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Netlify déploiera automatiquement à chaque commit

**Fichiers de configuration inclus:**
- ✅ `/netlify.toml` - Déjà configuré
- ✅ `/public/_redirects` - Routes React Router

---

### 🔷 Option B: Vercel (Gratuit)

**Méthode CLI:**

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

**Méthode Web:**

1. Allez sur [vercel.com](https://vercel.com)
2. Importez votre projet depuis Git
3. Vercel détectera automatiquement Vite
4. Déploiement automatique!

**Fichier de configuration inclus:**
- ✅ `/vercel.json` - Routes configurées

---

### 📘 Option C: GitHub Pages (Gratuit)

1. **Installer gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Ajouter dans package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://votre-username.github.io/nom-repo"
   }
   ```

3. **Déployer:**
   ```bash
   npm run deploy
   ```

---

### 🖥️ Option D: Serveur Propre (VPS/Hébergement Web)

**Pour Apache (.htaccess):**

Créez `/dist/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Pour Nginx (nginx.conf):**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Déploiement:**
1. Uploadez le contenu de `/dist` via FTP/SSH
2. Placez-le dans le dossier web (ex: `/var/www/html` ou `/public_html`)
3. Configurez votre serveur web comme ci-dessus

---

## ⚙️ 3. Configuration Importante

### Variables d'Environnement (si nécessaire)

Si vous utilisez des APIs externes, créez `.env.production`:

```env
VITE_API_URL=https://votre-api.com
VITE_APP_NAME=Banque Alimentaire
```

### Domaine Personnalisé

**Netlify:**
1. Settings → Domain management
2. Ajoutez votre domaine
3. Configurez les DNS

**Vercel:**
1. Project Settings → Domains
2. Ajoutez votre domaine
3. Suivez les instructions DNS

---

## ✅ 4. Vérifications Post-Déploiement

### Checklist:

- [ ] ✅ L'application charge correctement
- [ ] ✅ Navigation entre pages fonctionne
- [ ] ✅ localStorage fonctionne (inventaire, organismes)
- [ ] ✅ Toutes les images se chargent
- [ ] ✅ Les 4 langues fonctionnent (FR, ES, EN, AR)
- [ ] ✅ Le mode RTL fonctionne en arabe
- [ ] ✅ Les formulaires fonctionnent
- [ ] ✅ L'impression des étiquettes fonctionne
- [ ] ✅ L'export PDF/Excel fonctionne
- [ ] ✅ Les codes QR se génèrent correctement
- [ ] ✅ Version mobile responsive

### Tester en Production:

1. **Navigation:** Testez toutes les routes
2. **Fonctionnalités:** Créez produit, comande, organisme
3. **Multilingue:** Changez entre les 4 langues
4. **Mobile:** Testez sur smartphone
5. **Performance:** Vérifiez la vitesse de chargement

---

## 🔒 5. Sécurité et Bonnes Pratiques

### LocalStorage - Important! ⚠️

Votre application utilise localStorage pour stocker:
- Inventaire de produits
- Organismes
- Comandas
- Utilisateurs

**⚠️ ATTENTION:** 
- localStorage est local au navigateur
- Les données ne sont PAS synchronisées entre appareils
- Sauvegardez régulièrement via Export Excel

**Pour un système multi-utilisateurs en production:**
- Considérez migrer vers une base de données (Supabase, Firebase)
- Implémenter authentification réelle
- Synchronisation en temps réel

### HTTPS

- ✅ Netlify et Vercel incluent HTTPS automatiquement
- ⚠️ Sur serveur propre, configurez un certificat SSL (Let's Encrypt gratuit)

---

## 📊 6. Monitoring et Analytics (Optionnel)

### Google Analytics

Ajoutez dans `/index.html` avant `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🆘 7. Dépannage

### Problème: Page blanche après déploiement

**Solution:**
- Vérifiez la console du navigateur (F12)
- Assurez-vous que les fichiers de redirection sont en place
- Vérifiez le chemin de base dans vite.config.ts

### Problème: Routes 404

**Solution:**
- Vérifiez que `_redirects` (Netlify) ou `vercel.json` existe
- Pour serveur propre, configurez les rewrites

### Problème: Assets ne chargent pas

**Solution:**
- Vérifiez que tous les chemins sont relatifs
- Pas de chemins absolus dans le code

---

## 📱 8. URLs de Test Recommandées

Après le déploiement, testez ces routes:

```
/                          → Dashboard
/inventario                → Inventaire
/comandas                  → Comandas
/organismos                → Organismes
/transporte                → Transport
/reportes                  → Reportes
/usuarios                  → Utilisateurs
/comptoir                  → Comptoir
/etiquetas                 → Étiquettes
/configuracion             → Configuration
```

---

## 🎯 9. Commandes Rapides

```bash
# Build local
npm run build

# Preview du build localement
npx vite preview

# Deploy Netlify
netlify deploy --prod

# Deploy Vercel
vercel --prod

# Deploy GitHub Pages
npm run deploy
```

---

## 📞 10. Support

### Fichiers de configuration créés:

- ✅ `/netlify.toml` - Configuration Netlify
- ✅ `/vercel.json` - Configuration Vercel
- ✅ `/public/_redirects` - Redirections pour SPA

### Documentation du système:

- `/README.md` - Documentation générale
- `/INDICE_DOCUMENTACION.md` - Index de toute la documentation
- `/docs/` - Documentation technique

---

## 🎉 Félicitations!

Votre système de Banque Alimentaire est maintenant prêt pour la production!

### Fonctionnalités Déployées:

- ✅ Gestion complète d'inventaire
- ✅ Système de comandas avec QR
- ✅ Gestion d'organismes
- ✅ Transport et logistique
- ✅ Reportes avancés
- ✅ Système de rôles et permissions
- ✅ Module Comptoir
- ✅ Génération d'étiquettes et codes-barres
- ✅ Support multilingue (FR, ES, EN, AR)
- ✅ Mode responsive mobile
- ✅ Exports PDF et Excel

---

**Version:** 1.0.0  
**Date:** 14 février 2026  
**Système:** Banque Alimentaire - Gestion Intégrale
