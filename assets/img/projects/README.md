# Images des projets Class S

## Comment ajouter une image à un projet

1. Dépose ton fichier image dans ce dossier (`assets/img/projects/`)
   - Format : JPG ou PNG
   - Taille conseillée : 1200×800px max, moins de 500 Ko
   - Nommage : `nom-du-projet.jpg` (sans espaces ni accents)

2. Commite et pousse sur GitHub :
   ```
   git add assets/img/projects/nom-du-projet.jpg
   git commit -m "ajout image projet nom-du-projet"
   git push
   ```

3. Dans l'admin, champ "Images du projet", colle :
   ```
   assets/img/projects/nom-du-projet.jpg
   ```
   OU l'URL complète :
   ```
   https://wendclass.github.io/bf/assets/img/projects/nom-du-projet.jpg
   ```

## Structure recommandée des noms de fichiers

| Projet | Fichier |
|---|---|
| Koulba Coffee — logo | `koulba-coffee-logo.jpg` |
| Yiré Studio — identité | `yire-studio-identite.jpg` |
| Festival Sahel — affiche | `festival-sahel-affiche.jpg` |

## Tu peux aussi utiliser des URLs externes

Si tu héberges ton image ailleurs (Cloudinary, imgBB, etc.) :
```
https://res.cloudinary.com/xxx/image/upload/v1234/mon-image.jpg
```
