# Gestion des tâches — mise en place

## Structure du projet

```
mon-projet/
├── backend/
│   └── db.json          ← les données (servies par JSON Server)
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── etats.js
│   └── components/
│       ├── TaskCard.jsx
│       ├── TaskListItem.jsx
│       ├── TaskForm.jsx
│       └── BottomNav.jsx
└── package.json
```

## Installation

1. Clone le dépôt :
   ```bash
   git clone <url-du-depot>
   cd nom-du-dossier
   ```
2. Installe les dépendances :
   ```bash
   npm install
   ```

## (Optionnel) Script npm pour lancer l'API en une commande

Ajoute dans `package.json` :
```json
"scripts": {
  "dev": "vite",
  "server": "json-server --watch backend/db.json --port 3000"
}
```

## Lancer le projet

Il faut **deux terminaux** ouverts en parallèle :

**Terminal 1 — l'API (JSON Server)**
```bash
npm run server
# équivalent à : npx json-server --watch backend/db.json --port 3000
```

**Terminal 2 — React (Vite)**
```bash
npm run dev
```

Ouvre ensuite l'URL donnée par Vite (généralement http://localhost:5173).

> ℹ️ Le chemin du fichier `db.json` change (`backend/db.json` au lieu de la
> racine), mais `API_URL` dans `App.jsx` reste `http://localhost:3000/taches` :
> JSON Server sert toujours ses routes sur ce port, peu importe où se trouve
> le fichier sur le disque.

## Modèle de données d'une tâche

| Champ | Rempli par | Détail |
|---|---|---|
| `id` | JSON Server | généré automatiquement |
| `titre` | Utilisateur | via le formulaire |
| `etat` | Utilisateur | `cree`, `accepte`, `en_cours`, `termine`, `annule` |
| `date_debut` / `date_fin` | Utilisateur | via le formulaire (avec raccourcis rapides) |
| `date_creation` | Code | posée automatiquement à la création |
| `date_modification` | Code | mise à jour automatiquement à chaque modification |