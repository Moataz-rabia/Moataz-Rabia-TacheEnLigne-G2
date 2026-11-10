// Service de persistance EN LIGNE : toutes les tâches vivent sur le backend
// json-server (fichier db.json), accessibles via l'URL ci-dessous.
// C'est la seule porte d'entrée vers le réseau : les composants n'appellent
// JAMAIS fetch directement, ils passent uniquement par ce service.

// Adresse de base de l'API json-server (lancé avec : npm run server).
const URL_API = 'http://localhost:3001/tasks';

// Petit helper : effectue une requête fetch et VÉRifie que le serveur a répondu
// correctement. Si response.ok est faux (404, 500, serveur éteint...), on lance
// une erreur : les composants pourront l'attraper dans leur catch.
async function requete(url, options = {}) {
  let reponse;

  try {
    reponse = await fetch(url, options);
  } catch (err) {
    // fetch a échoué avant même d'avoir une réponse : le serveur n'est pas
    // lancé (ou l'adresse est fausse). On logge la cause dans la console et on
    // relance une erreur claire, que les composants pourront afficher.
    console.error('Appel réseau impossible :', err);
    throw new Error('Serveur inaccessible, lance json-server (npm run server).', { cause: err });
  }

  // response.ok vaut true pour un statut 2xx (200, 201...).
  if (!reponse.ok) {
    throw new Error(`Erreur HTTP ${reponse.status} sur ${url}`);
  }

  // La plupart des réponses json-server sont du JSON : on parse une seule fois.
  // Pour DELETE (204, pas de contenu), on renvoie null.
  const texte = await reponse.text();
  return texte ? JSON.parse(texte) : null;
}

export const apiService = {
  // Récupérer toutes les tâches : GET /tasks
  async getAll() {
    return requete(URL_API);
  },

  // Ajouter une tâche : POST /tasks
  // L'id est généré côté client avec crypto.randomUUID() (imposé par le cahier
  // des charges), json-server stockera tel quel la tâche renvoyée.
  // ATTENTION : c'est vrai pour json-server 0.17.x, mais PAS pour la 1.x, qui
  // écrase systématiquement l'id reçu par le sien ({ ...data, id: randomId() }).
  // Ne pas monter json-server en 1.x sans revoir ce point.
  async add(task) {
    const nouvelleTache = { id: crypto.randomUUID(), ...task };

    return requete(URL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouvelleTache)
    });
  },

  // Modifier une tâche existante : PATCH /tasks/:id
  // PATCH ne met à jour que les champs envoyés (on n'envoie que les changements).
  async update(id, changes) {
    return requete(`${URL_API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    });
  },

  // Supprimer une tâche : DELETE /tasks/:id
  async remove(id) {
    return requete(`${URL_API}/${id}`, {
      method: 'DELETE'
    });
  }
};
