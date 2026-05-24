# Akoua Studio — Website

Premium creatieve ruimte · Roosendaal

## 🚀 Déploiement GitHub → Netlify

### Étape 1 — Créer le repo GitHub
1. Va sur [github.com](https://github.com) → **New repository**
2. Nom : `akoua-studio`
3. Visibilité : **Private** (recommandé) ou Public
4. **Ne pas** initialiser avec README (on va uploader nos fichiers)
5. Clique **Create repository**

### Étape 2 — Uploader les fichiers
Sur la page du repo vide, clique **"uploading an existing file"** puis :
- Glisse-dépose TOUS les fichiers du projet :
  - `index.html`
  - `css/style.css`
  - `js/i18n.js`
  - `js/main.js`
  - `images/` (ton dossier de photos)
- Clique **Commit changes**

### Étape 3 — Connecter à Netlify
1. Va sur [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Choisit **GitHub**
3. Autorise Netlify à accéder à ton GitHub
4. Sélectionne le repo `akoua-studio`
5. Settings : laisse tout par défaut (Build command vide, Publish directory vide)
6. Clique **Deploy site**

✅ Netlify déploie automatiquement chaque fois que tu modifies un fichier sur GitHub !

### Étape 4 — Nom de domaine personnalisé
1. Dans Netlify → **Domain settings** → **Add custom domain**
2. Entre `akouastudio.com`
3. Suis les instructions pour mettre à jour les DNS chez ton registrar

---

## 📁 Structure du projet

```
akoua-studio/
├── index.html          → Page principale (1 seul fichier HTML)
├── css/
│   └── style.css       → Tous les styles
├── js/
│   ├── i18n.js         → Traductions NL/EN/FR/ES
│   └── main.js         → Interactions, modal, chatbot
└── images/             → Tes photos du studio (à ajouter)
    ├── hero-bg.jpg
    ├── zone-lounge.jpg
    ├── zone-studio.jpg
    └── ...
```

## 🖼️ Ajouter les photos

Dans `index.html`, les sections sont prêtes pour tes photos.
Pour chaque zone, ajoute une photo :
```html
<!-- Remplace les emoji par des vraies images -->
<img src="images/zone-lounge.jpg" alt="Relax Lounge" loading="lazy" />
```

## 📱 Réservations

Les réservations passent par WhatsApp (`wa.me/31627374813`).
Le formulaire de réservation envoie automatiquement un message WhatsApp structuré avec toutes les informations du client.

## 🌐 Langues

Le site est en **4 langues** : NL (défaut) · EN · FR · ES
Toutes les traductions sont dans `js/i18n.js`

## 📞 Contact

- Tel : 06 27 37 48 13
- Email : akouastudio@gmail.com
- Instagram : @akoua.studio
- Adresse : Keulsveld 17, kantoor 4, 4705 RS Roosendaal

---
© 2026 Akoua Studio · Roosendaal · KVK 42042214
