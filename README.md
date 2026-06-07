# Class S — Site Vitrine v3

> Agence de Design Visuel · Ouagadougou, Burkina Faso

---

## Corrections v3
- **Accès admin sécurisé** : la page admin affiche toujours la page de connexion par défaut
- **Logo** : le texte "Class S" disparaît quand un logo est importé
- **Intro** : l'animation d'intro affiche votre logo si importé, sinon le texte
- **Images** : toutes les images s'importent depuis l'appareil (pas d'URL)
- **Rognage carré** : les photos d'équipe sont rognées en carré avec prévisualisation interactive
- **Clients** : bande défilante (marquee) — logo affiché sans filtre
- **Services** : processus en 4 étapes affiché + livrables par service
- **Behance** : icône SVG corrigée
- **Analytics** : statistiques générales + par page + par visiteur + sources + appareils
- **Médias** : aperçu de chaque élément importé (favicon, logo, brochure)


## Déploiement GitHub Pages

1. Créer un repo public sur github.com
2. Uploader tous les fichiers du dossier `v3/`
3. Settings → Pages → Branch: main → / (root) → Save
4. Site en ligne : `https://[username].github.io/[repo]/`

---

## Architecture

```
v3/
├── index.html          Accueil (intro logo, marquee clients)
├── about.html          À propos (Scott Nana, valeurs, équipe)
├── works.html          Projets (filtres + modal détail)
├── services.html       Services (grille + processus + PDF)
├── blog.html           Blog
├── article.html        Article (SEO, auteur, hashtags)
├── contact.html        Contact (EmailJS + sauvegarde admin)
├── 404.html            Erreur 404
├── sx9kp-admin.html    Administration (accès sécurisé)
├── css/style.css       Design system + marquee + crop modal
├── css/animations.css  Animations scroll
├── css/admin.css       Interface admin complète
├── js/main.js          Cursor, navbar, intro logo, marquee
├── js/analytics.js     Tracking visiteurs/pages/clics
├── js/admin.js         Auth, CRUD, upload, crop, analytics
├── js/works.js         Filtres + modal projets
└── js/blog.js          Rendu articles
```

---

*© 2025 Class S — Ouagadougou, Burkina Faso*
