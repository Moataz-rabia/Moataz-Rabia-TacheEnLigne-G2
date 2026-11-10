import { useState, useEffect } from 'react';
import './App.css';
import TaskCard from './components/TaskCard';
import TaskListItem from './components/TaskListItem';
import TaskForm from './components/TaskForm';
import BottomNav from './components/BottomNav';
import { ORDRE_ETATS, ETATS } from './etats';
// Service de données : seules les fonctions de ce service parlent au backend
// json-server (les composants n'appellent JAMAIS fetch directement).
import apiService from './services';

const FORM_VIDE = { titre: '', etat: 'cree', date_debut: '', date_fin: '' };

const OPTIONS_TRI = [
  { value: 'echeance_asc', label: 'Échéance : plus proche' },
  { value: 'echeance_desc', label: 'Échéance : plus lointaine' },
  { value: 'creation_desc', label: 'Créées récemment' },
  { value: 'titre_asc', label: 'Titre (A → Z)' }
];

function trierTaches(liste, tri) {
  const copie = [...liste];
  switch (tri) {
    case 'echeance_asc':
      return copie.sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin));
    case 'echeance_desc':
      return copie.sort((a, b) => new Date(b.date_fin) - new Date(a.date_fin));
    case 'creation_desc':
      return copie.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
    case 'titre_asc':
      return copie.sort((a, b) => a.titre.localeCompare(b.titre));
    default:
      return copie;
  }
}

export default function App() {
  const [taches, setTaches] = useState([]);
  const [filtre, setFiltre] = useState('en_cours');
  const [formOuvert, setFormOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEnEdition, setIdEnEdition] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [triOuvert, setTriOuvert] = useState(false);
  const [tri, setTri] = useState('echeance_asc');
  const [menuOuvert, setMenuOuvert] = useState(false);
  // Vrai pendant la lecture des tâches : permet d'afficher un état de chargement.
  const [chargement, setChargement] = useState(true);
  // Message d'erreur affiché à l'écran si le backend est inaccessible.
  const [erreur, setErreur] = useState(null);

  // Chargement initial des tâches via le service (aucun fetch dans les composants).
  const chargerTaches = async () => {
    try {
      setErreur(null);
      const data = await apiService.getAll();
      setTaches(data);
    } catch (err) {
      // On affiche un message clair à l'écran (et on log l'erreur dans la console).
      console.error('Erreur lors du chargement des tâches:', err);
      setErreur(err.message || 'Serveur inaccessible, lance json-server (npm run server).');
    } finally {
      // Dans tous les cas, on arrête l'indicateur de chargement.
      setChargement(false);
    }
  };

  useEffect(() => {
    // Un effet React ne peut pas être async lui-même : on déclare une petite
    // fonction async à l'intérieur, puis on l'appelle (pattern recommandé par ESLint).
    async function chargerAuDemarrage() {
      await chargerTaches();
    }
    chargerAuDemarrage();
  }, []);

  // La touche Échap ferme le menu latéral (comme pour la fenêtre de formulaire).
  useEffect(() => {
    if (!menuOuvert) return undefined;
    const surEchap = (e) => {
      if (e.key === 'Escape') setMenuOuvert(false);
    };
    window.addEventListener('keydown', surEchap);
    return () => window.removeEventListener('keydown', surEchap);
  }, [menuOuvert]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(FORM_VIDE);
    setModeEdition(false);
    setIdEnEdition(null);
    setFormOuvert(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const maintenant = new Date().toISOString();
    const payload = modeEdition
      ? { ...form, date_modification: maintenant }
      : { ...form, date_creation: maintenant, date_modification: maintenant };

    try {
      if (modeEdition) {
        // Modification : on n'envoie que les champs changés + l'id.
        await apiService.update(idEnEdition, payload);
      } else {
        // Création : le service génère l'id et ajoute la tâche au serveur.
        await apiService.add(payload);
      }
      resetForm();
      chargerTaches();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setErreur(err.message || 'Serveur inaccessible, lance json-server (npm run server).');
    }
  };

  const modifierTache = (tache) => {
    setForm({
      titre: tache.titre,
      etat: tache.etat,
      date_debut: tache.date_debut,
      date_fin: tache.date_fin
    });
    setIdEnEdition(tache.id);
    setModeEdition(true);
    setFormOuvert(true);
  };

  const supprimerTache = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await apiService.remove(id);
      chargerTaches();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setErreur(err.message || 'Serveur inaccessible, lance json-server (npm run server).');
    }
  };

  // Raccourci « Marquer comme terminée » depuis le menu ⋮ d'une ligne.
  const terminerTache = async (id) => {
    try {
      await apiService.update(id, {
        etat: 'termine',
        date_modification: new Date().toISOString()
      });
      chargerTaches();
    } catch (err) {
      console.error('Erreur lors du marquage comme terminée:', err);
      setErreur(err.message || 'Serveur inaccessible, lance json-server (npm run server).');
    }
  };

  const tachesFiltrees = trierTaches(filtre ? taches.filter((t) => t.etat === filtre) : taches, tri);
  // Les cartes en tête (mises en avant) : tout ce qui n'est pas terminé/annulé
  const tachesEnAvant = taches.filter((t) => t.etat === 'en_cours' || t.etat === 'accepte');

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="topbar">
          <button
            className="icon-btn"
            aria-label="Ouvrir le menu"
            aria-haspopup="dialog"
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert(true)}
          >☰</button>
          <div className="topbar__actions">
            <div className="sort-menu">
              <button
                className="icon-btn"
                aria-label="Trier les tâches"
                aria-haspopup="menu"
                aria-expanded={triOuvert}
                onClick={() => setTriOuvert((o) => !o)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
              </button>
              {triOuvert && (
                <ul className="sort-menu__list" role="menu">
                  {OPTIONS_TRI.map((opt) => (
                    <li key={opt.value} role="none">
                      <button
                        role="menuitemradio"
                        aria-checked={tri === opt.value}
                        className={`sort-menu__item ${tri === opt.value ? 'sort-menu__item--active' : ''}`}
                        onClick={() => { setTri(opt.value); setTriOuvert(false); }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </header>

        <section className="greeting">
          <div className="greeting__avatar">🙂</div>
          <div>
            <h1>Bonjour, <strong>Jasmine</strong></h1>
            <p>Bienvenue de retour</p>
          </div>
        </section>

        <h2 className="section-title">Mes tâches</h2>

        <div className="tabs" role="group" aria-label="Filtrer les tâches par état">
          {ORDRE_ETATS.map((key) => (
            <button
              key={key}
              className={`tab ${filtre === key ? 'tab--active' : ''}`}
              // aria-pressed indique quel filtre est actif (bouton à deux états).
              aria-pressed={filtre === key}
              onClick={() => setFiltre(key)}
            >
              {ETATS[key].label}
            </button>
          ))}
        </div>

        {!chargement && tachesEnAvant.length > 0 && (
          <div className="cards-row">
            {tachesEnAvant.map((t) => (
              <TaskCard key={t.id} tache={t} onClick={modifierTache} />
            ))}
          </div>
        )}

        <div className="task-list">
          {chargement ? (
            // État de chargement : affiché pendant la lecture des tâches sur le serveur.
            <p className="loading-state" role="status">Chargement des tâches…</p>
          ) : erreur ? (
            // Message d'erreur : affiché si json-server est injoignable.
            <p className="error-state" role="alert">{erreur}</p>
          ) : (
            <>
              {tachesFiltrees.length === 0 && (
                <p className="empty-state" role="status">Aucune tâche dans cet état pour le moment.</p>
              )}
              {tachesFiltrees.map((t) => (
                <TaskListItem
                  key={t.id}
                  tache={t}
                  onModifier={modifierTache}
                  onSupprimer={supprimerTache}
                  onTerminer={terminerTache}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <BottomNav onAjouter={() => { setForm(FORM_VIDE); setModeEdition(false); setFormOuvert(true); }} />

      {menuOuvert && (
        <div className="drawer-overlay" onClick={() => setMenuOuvert(false)}>
          <nav
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="drawer__header">
              <span id="drawer-title">Menu</span>
              <button className="modal-card__close" onClick={() => setMenuOuvert(false)} aria-label="Fermer le menu">✕</button>
            </div>

            <div className="drawer__group" role="group" aria-label="Filtrer les tâches par état">
              <button
                className={`drawer__link ${filtre === null ? 'drawer__link--active' : ''}`}
                aria-pressed={filtre === null}
                onClick={() => { setFiltre(null); setMenuOuvert(false); }}
              >
                Toutes les tâches
              </button>

              {ORDRE_ETATS.map((key) => (
                <button
                  key={key}
                  className={`drawer__link ${filtre === key ? 'drawer__link--active' : ''}`}
                  aria-pressed={filtre === key}
                  onClick={() => { setFiltre(key); setMenuOuvert(false); }}
                >
                  {ETATS[key].label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {formOuvert && (
        <TaskForm
          form={form}
          modeEdition={modeEdition}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />
      )}
    </div>
  );
}
