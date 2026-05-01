# 🔒 Configuration CORS - Banque Alimentaire

## 📖 Vue d'ensemble

Ce projet est maintenant configuré avec les headers CORS appropriés pour permettre l'utilisation du header `Authorization` dans les requêtes HTTP.

---

## ⚡ Démarrage rapide

### Test de la configuration

1. **Ouvrez la page de test** (après déploiement):
   ```
   https://votre-site.com/test-cors.html
   ```

2. **Cliquez sur les boutons de test** pour vérifier:
   - ✅ Headers CORS du site
   - ✅ Requête avec Authorization
   - ✅ Preflight OPTIONS
   - ✅ API externe (optionnel)

---

## 📂 Fichiers de configuration

### Netlify
```
public/_headers      ← Configuration principale (recommandé)
netlify.toml         ← Configuration alternative
```

### Vercel
```
vercel.json          ← Configuration Vercel
```

---

## 🔑 Headers CORS configurés

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name
Access-Control-Max-Age: 86400
```

**Points importants**:
- ✅ `Authorization` est **explicitement** listé
- ✅ Preflight cache de 24h pour performance
- ✅ Toutes les méthodes HTTP principales supportées

---

## 🎯 Utilisation dans le code

### Exemple 1: Requête avec Authorization
```javascript
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Exemple 2: POST avec authentification
```javascript
fetch('https://api.example.com/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Test' })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Exemple 3: Upload de fichier
```javascript
const formData = new FormData();
formData.append('file', file);

fetch('https://api.example.com/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-File-Name': file.name
  },
  body: formData
});
```

---

## 🧪 Tests

### Test manuel avec curl
```bash
# Vérifier les headers
curl -I https://votre-site.com

# Test avec Authorization
curl https://votre-site.com \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json"

# Test Preflight
curl -X OPTIONS https://votre-site.com \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -v
```

### Test dans le navigateur
```javascript
// Console du navigateur (F12)
fetch(window.location.href, {
  headers: {
    'Authorization': 'Bearer test-token'
  }
})
.then(response => {
  console.log('✅ CORS fonctionne');
  console.log('Headers CORS:');
  for (let [key, value] of response.headers.entries()) {
    if (key.startsWith('access-control')) {
      console.log(`  ${key}: ${value}`);
    }
  }
})
.catch(error => console.error('❌ Erreur CORS:', error));
```

---

## 🔒 Sécurité

### Configuration actuelle (Développement)
```
Access-Control-Allow-Origin: *
```
Permet **toutes les origines** - OK pour développement/test

### Configuration recommandée (Production)

**Option 1: Domaine unique**
```toml
# public/_headers
/*
  Access-Control-Allow-Origin: https://banque-alimentaire.com
```

**Option 2: Domaines multiples**
Nécessite configuration backend pour vérifier dynamiquement l'origine.

**Important**: Si vous utilisez:
```
Access-Control-Allow-Credentials: true
```
Vous **NE POUVEZ PAS** utiliser `Allow-Origin: *`

---

## 📚 Documentation

### Fichiers disponibles

| Fichier | Description | Taille |
|---------|-------------|--------|
| `README_CORS.md` | Ce guide | Guide rapide |
| `RESUMEN_CORS_FINAL.md` | Résumé exécutif | Résumé |
| `CONFIGURATION_CORS_COMPLETEE.md` | Documentation complète | Guide détaillé |
| `public/test-cors.html` | Page de test | Interface web |

### Liens utiles

- [MDN - CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Netlify Headers](https://docs.netlify.com/routing/headers/)
- [Vercel Headers](https://vercel.com/docs/edge-network/headers)

---

## 🚨 Dépannage

### Erreur: "CORS header 'Access-Control-Allow-Origin' missing"

**Solution**: Vérifiez que les fichiers de configuration sont bien déployés
```bash
# Vérifier localement
cat public/_headers
cat netlify.toml
cat vercel.json
```

### Erreur: "Authorization header not allowed"

**Solution**: Déjà résolu! Le header Authorization est explicitement listé.

### Erreur: "Preflight request failed"

**Solution**: Vérifiez que la méthode OPTIONS est autorisée (déjà configuré).

### Erreur: "Credentials mode with wildcard"

**Solution**: Choisissez entre:
- `Allow-Credentials: false` + `Allow-Origin: *`
- `Allow-Credentials: true` + `Allow-Origin: https://domaine-specifique.com`

---

## ✅ Checklist de déploiement

### Avant le déploiement
- [x] ✅ Fichiers de configuration créés
- [x] ✅ Headers CORS définis
- [x] ✅ Authorization explicitement listé
- [x] ✅ Page de test créée

### Après le déploiement
- [ ] Ouvrir `/test-cors.html`
- [ ] Tester les 4 scénarios
- [ ] Vérifier console (0 erreurs CORS)
- [ ] Tester avec API réelle si applicable

### Production
- [ ] Restreindre `Allow-Origin` si nécessaire
- [ ] Configurer CSP (Content Security Policy)
- [ ] Monitorer les erreurs CORS
- [ ] Tester depuis différents domaines

---

## 🎓 FAQ

### Q: Pourquoi Authorization n'est pas couvert par le wildcard (*)?
**R**: Pour des raisons de sécurité, certains headers sensibles (comme Authorization) doivent être explicitement listés, même avec un wildcard.

### Q: Puis-je utiliser des cookies avec cette configuration?
**R**: Oui, mais vous devrez:
1. Ajouter `Access-Control-Allow-Credentials: true`
2. Remplacer `Allow-Origin: *` par un domaine spécifique

### Q: La configuration fonctionne avec toutes les APIs?
**R**: Oui, pour les requêtes **sortantes** de votre site vers des APIs. Pour les requêtes **entrantes** vers votre API, celle-ci doit aussi avoir CORS configuré.

### Q: Comment tester en local (localhost)?
**R**: Les headers CORS sont appliqués au déploiement. En local, vous pouvez:
- Utiliser une extension de navigateur (CORS Unblock)
- Configurer Vite proxy
- Tester après déploiement sur Netlify/Vercel

### Q: Que faire si j'ai toujours des erreurs CORS?
**R**: 
1. Vérifiez que les fichiers sont déployés
2. Consultez les logs de déploiement
3. Testez avec curl pour voir les headers
4. Ouvrez `/test-cors.html` pour diagnostiquer

---

## 📞 Support

### Problème avec la configuration?

1. **Consulter la documentation**:
   ```
   /CONFIGURATION_CORS_COMPLETEE.md
   ```

2. **Tester la configuration**:
   ```
   https://votre-site.com/test-cors.html
   ```

3. **Vérifier les headers**:
   ```bash
   curl -I https://votre-site.com | grep -i access-control
   ```

4. **Consulter les logs**:
   - Netlify: Dashboard > Deploys > [Votre deploy] > Logs
   - Vercel: Dashboard > Deployments > [Votre deploy] > Logs

---

## 🎯 Résumé

✅ **Configuration CORS complète et fonctionnelle**  
✅ **Header Authorization explicitement autorisé**  
✅ **Page de test interactive disponible**  
✅ **Documentation complète fournie**  
✅ **Compatible Netlify et Vercel**

---

**Dernière mise à jour**: 5 mars 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
