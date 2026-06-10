# MiData — Cartographie / SIG

Plateforme web personnelle de présentation de cartes thématiques réalisées dans le cadre de projets **MEAL** (Monitoring, Evaluation, Accountability & Learning) et **SIG** (Systèmes d'Information Géographique).

> Auteur : **C. GOUESSE**

## ✨ Fonctionnalités

- **Visualiseur interactif** de cartes (Leaflet) avec marqueurs, popups, contrôle de couches
- **Galerie** de toutes les réalisations sous forme de grille visuelle
- **Mode édition** complet : ajout, modification, suppression de cartes
- **Upload d'image** pour chaque carte (PNG/JPG)
- **Sauvegarde locale** des données (localStorage du navigateur)
- **Métadonnées structurées** : titre, pays, zone, date, thématique, étude, auteurs, indicateurs, conclusions
- **Recherche et filtres** par thème
- **Design sombre moderne** responsive

## 🛠️ Stack technique

- **React 19** + **TypeScript**
- **Vite 7** (build ultra-rapide)
- **Tailwind CSS 4**
- **Leaflet** / **React-Leaflet** (cartographie)
- **Lucide React** (icônes)
- **vite-plugin-singlefile** (tout inline en 1 fichier HTML pour GitHub Pages)

## 🚀 Installation locale

```bash
npm install
npm run dev
```

## 📦 Build de production

```bash
npm run build
```

Le fichier `dist/index.html` est entièrement autonome (HTML + JS + CSS inline) et prêt à être déployé.

## 🌐 Déploiement sur GitHub Pages

1. Pousser le code sur un repo GitHub
2. Aller dans **Settings → Pages**
3. Source : **GitHub Actions**
4. Le workflow `.github/workflows/deploy.yml` déploie automatiquement à chaque push sur `main`

L'application sera accessible à : `https://<votre-user>.github.io/<nom-du-repo>/`

## 📁 Structure

```
src/
  App.tsx          # Composant principal (visualiseur + galerie + éditeur)
  main.tsx         # Point d'entrée React
  index.css        # Styles globaux (Tailwind + Leaflet)
  utils/cn.ts      # Utilitaire de classes CSS
```

## 📝 Ajouter / modifier une carte

1. Cliquer sur **« Nouvelle carte »** (en haut à droite)
2. Remplir l'onglet **Général** : titre, pays, zone, date, thématique, auteurs, étude, descriptions
3. *(Optionnel)* Uploader une image de la carte
4. *(Optionnel)* Onglet **Indicateurs** : valeurs chiffrées clés
5. *(Optionnel)* Onglet **Conclusions** : résultats principaux
6. *(Optionnel)* Onglet **Points & Zone** : ajouter des points géolocalisés
7. **Enregistrer**

Toutes les données sont sauvegardées dans le navigateur (localStorage).
