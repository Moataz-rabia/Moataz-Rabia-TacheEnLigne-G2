# Gestion des tâches — mode EN LIGNE

Application web de gestion de tâches en **React JS** (Vite).
Ce dépôt correspond à la **version en ligne** du projet : les données ne sont
pas stockées dans le navigateur, elles vivent sur un **backend `json-server`**
(fichier `db.json`) et sont accessibles par **`fetch`**.

- ✅ Backend `json-server` (port **3001**, version **0.17.4**)
- ✅ Requêtes `fetch` : `GET`, `POST`, `PATCH`, `DELETE`
- ❌ Aucun `localStorage` pour les tâches

> ℹ️ Ce projet existe en 3 versions (locale, en ligne, hybride).
> Ce dépôt ne gère **que** le mode en ligne.

> 🔖 **Pourquoi json-server 0.17.4 ?**
> Le cahier des charges impose un identifiant unique par tâche, généré côté
> client avec `crypto.randomUUID()`. Or **json-server 1.x écrase toujours
> l'id reçu** (`{ ...data, id: randomId() }` dans son `service.js`) : l'UUID
> envoyé par le navigateur serait perdu, et l'id stocké en base ne serait pas
> un UUID. Aucune route REST de la 1.x ne permet de fixer un id
> (`PUT /tasks` renvoie 404, `PATCH`/`PUT /tasks/:id` réimposent l'id de l'URL).
> La version **0.17.4** conserve l'id fourni dans le corps de la requête :
> c'est donc elle qui est utilisée ici, pour que `db.json` contienne
> réellement les UUID générés par l'application.

## Description

- **Ajouter** une tâche (bouton **+** en bas d'écran)
- **Modifier** une tâche (menu **⋮** d'une ligne, ou en cliquant sur une carte)
- **Marquer comme terminée** (menu **⋮** → « Marquer terminée »)
- **Supprimer** une tâche (menu **⋮** → « Supprimer »)
- Filtrer par état, trier (échéance, création, titre)
- **État de chargement** affiché pendant la lecture des données
- **Message d'erreur** affiché si le serveur est inaccessible
- **Accessible au clavier** (voir la section [Accessibilité](#accessibilité))

## Installation

```bash
npm install
```

## Lancement

### Solution n°1 : une seule commande (recommandée)

```bash
npm run start:all
```

Cette commande lance **en parallèle** :

| Processus | Commande | Rôle |
|---|---|---|
| 1 | `npm run server` | json-server sur `http://localhost:3001` (fichier `db.json`) |
| 2 | `npm run dev` | serveur de développement Vite (généralement `http://localhost:5173`) |

### Solution n° 2 : deux terminaux

```bash
# Terminal 1 — le backend
npm run server

# Terminal 2 — l'application React
npm run dev
```

Puis ouvre l'URL donnée par Vite (généralement http://localhost:5173).

### Autres scripts

| Commande | Rôle |
|---|---|
| `npm run server` | json-server seul, sur le port **3001** |
| `npm run start:all` | json-server + Vite en même temps |
| `npm run dev` | serveur de développement Vite |
| `npm run build` | build de production |
| `npm run preview` | prévisualise le build |
| `npm run lint` | vérifie le code avec ESLint |

## Architecture : le service `apiService`

```
taches-online/
├── db.json                 ← base de données json-server (clé "tasks")
├── src/
│   ├── services/
│   │   ├── apiService.js   ← le seul fichier qui appelle fetch()
│   │   └── index.js        ← point d'entrée (export par défaut)
│   ├── components/         ← n'appellent JAMAIS fetch directement
│   ├── App.jsx             ← utilise uniquement le service (try/catch + message d'erreur)
│   └── etats.js            ← référentiel des états (cree, accepte, ...)
└── package.json            ← scripts "server" et "start:all"
```

`src/services/apiService.js` expose 4 fonctions, toutes `async`, avec la
**même interface** que l'ancien service local :

| Fonction | Méthode HTTP | Rôle |
|---|---|---|
| `getAll()` | `GET /tasks` | renvoie le tableau complet des tâches |
| `add(task)` | `POST /tasks` | ajoute une tâche, id généré avec `crypto.randomUUID()` |
| `update(id, changes)` | `PATCH /tasks/:id` | met à jour uniquement les champs envoyés |
| `remove(id)` | `DELETE /tasks/:id` | supprime la tâche correspondante |

`add()` envoie `{ id: crypto.randomUUID(), ...task }` : json-server 0.17.4
conserve cet id tel quel, donc la tâche enregistrée dans `db.json` porte bien
l'UUID généré par le navigateur.

Chaque appel passe par un petit helper `requete()` qui :

1. fait le `fetch` ;
2. en cas d'échec réseau (serveur éteint), **lance** l'erreur
   `"Serveur inaccessible, lance json-server (npm run server)."` ;
3. vérifie `response.ok` et lance une erreur `HTTP xxx` sinon ;
4. parse la réponse JSON.

Côté React (`App.jsx`), chaque appel au service est entouré d'un `try/catch` :

- pendant la requête → l'état `chargement` affiche **« Chargement des tâches… »** ;
- si ça échoue → l'état `erreur` affiche le message **« Serveur inaccessible,
  lance json-server (npm run server). »** dans la liste de tâches.

## Comment ça marche : json-server ?

`json-server` fabrique une **API REST** à partir d'un simple fichier JSON.

1. Le fichier `db.json` contient un objet avec la clé `tasks` (un tableau) :
   c'est la **base de données**.
2. `npm run server` lance `json-server --watch db.json --port 3001` :
   - `--watch` = il **relit le fichier** à chaque modification ;
   - le serveur expose `http://localhost:3001/tasks`.
3. Chaque écriture depuis l'application **modifie `db.json` sur le disque** :
   c'est la persistance.

| URL | Méthode | Effet sur `db.json` |
|---|---|---|
| `http://localhost:3001/tasks` | GET | lit le tableau `tasks` |
| `http://localhost:3001/tasks` | POST | ajoute un objet au tableau |
| `http://localhost:3001/tasks/:id` | PATCH | modifie les champs envoyés |
| `http://localhost:3001/tasks/:id` | DELETE | retire l'objet du tableau |

## Comment prouver que ça marche (démo)

1. Lance `npm run start:all` (ou les deux terminaux) et ouvre l'application.
2. Les 5 tâches d'exemple s'affichent (état de chargement visible un instant).
3. Ouvre les DevTools (F12) → onglet **Network** : on voit les requêtes
   `GET http://localhost:3001/tasks`.
4. Ajoute une tâche → une requête **POST** apparaît, et **`db.json` change sur
   le disque** (ouvre le fichier : la nouvelle tâche y est, avec son id UUID).
5. Recharge la page (F5) : la tâche est toujours là → les données sont
   bien persistées **côté serveur**, pas dans le navigateur.
6. **Test du mode erreur** : arrête le terminal de json-server (Ctrl+C) puis
   recharge la page → le message
   **« Serveur inaccessible, lance json-server (npm run server). »** s'affiche
   à la place de la liste. Relance le serveur et recharge : tout revient.
7. Bonus : dans l'onglet **Application** des DevTools, la section
   **Local Storage** est **vide** → aucune tâche n'est stockée dans le navigateur.

## Accessibilité

L'interface est utilisable au clavier et annoncée correctement par les lecteurs
d'écran :

| Élément | Traitement |
|---|---|
| Fenêtre de formulaire (`TaskForm`) | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` sur le titre ; le focus arrive dans le champ « Titre » ; **Échap** ferme la fenêtre |
| Menu latéral (`App.jsx`) | `role="dialog"` + `aria-modal="true"` ; **Échap** ferme le menu |
| Champs du formulaire | chaque `<label>` est relié à son `<input>` (`htmlFor` / `id`) |
| Groupe d'états | `role="radiogroup"` ; les flèches ← → ↑ ↓ changent d'état (un seul bouton est atteignable au Tab) |
| Raccourcis de date | `aria-label` précisant le champ concerné (« Date de fin : Demain », car il y a deux jeux de boutons) |
| Onglets de filtre | `aria-pressed` sur l'onglet actif |
| Chargement / erreur / liste vide | `role="status"` et `role="alert"` : le message est lu automatiquement |

## Modèle de données d'une tâche

| Champ | Rempli par | Détail |
|---|---|---|
| `id` | `apiService` | généré avec `crypto.randomUUID()` (côté client) |
| `titre` | Utilisateur | via le formulaire |
| `etat` | Utilisateur | `cree`, `accepte`, `en_cours`, `termine`, `annule` |
| `date_debut` / `date_fin` | Utilisateur | via le formulaire (avec raccourcis rapides) |
| `date_creation` | Code | posée automatiquement à la création |
| `date_modification` | Code | mise à jour à chaque modification |
