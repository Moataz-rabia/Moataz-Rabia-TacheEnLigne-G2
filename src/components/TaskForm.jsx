import { useEffect, useRef } from 'react';
import { ORDRE_ETATS, ETATS } from '../etats';

function versISO(joursDepuisAujourdhui) {
  const d = new Date();
  d.setDate(d.getDate() + joursDepuisAujourdhui);
  return d.toISOString().slice(0, 10);
}

const RACCOURCIS_DATE = [
  { label: "Aujourd'hui", jours: 0 },
  { label: 'Demain', jours: 1 },
  { label: '+ 1 semaine', jours: 7 },
  { label: '+ 1 mois', jours: 30 }
];

export default function TaskForm({ form, modeEdition, onChange, onSubmit, onClose }) {
  // Référence sur le champ « Titre » : on y place le curseur à l'ouverture.
  const champTitre = useRef(null);

  const choisirDate = (champ, jours) => {
    onChange({ target: { name: champ, value: versISO(jours), type: 'date' } });
  };

  // À l'ouverture du formulaire, le focus va directement dans le champ « Titre ».
  useEffect(() => {
    champTitre.current?.focus();
  }, []);

  // La touche Échap ferme le formulaire : comportement attendu d'une boîte de dialogue.
  useEffect(() => {
    const surEchap = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', surEchap);
    return () => window.removeEventListener('keydown', surEchap);
  }, [onClose]);

  // Dans le groupe d'états, les flèches gauche/droite/haut/bas changent d'état
  // (pattern « radiogroup » du WAI-ARIA : un seul bouton est atteignable au Tab,
  //  les flèches font le reste).
  const surToucheEtat = (e, index) => {
    const sens = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (sens === undefined) return;
    e.preventDefault();
    const suivant = (index + sens + ORDRE_ETATS.length) % ORDRE_ETATS.length;
    onChange({ target: { name: 'etat', value: ORDRE_ETATS[suivant], type: 'radio' } });
    e.currentTarget.parentElement.querySelectorAll('.etat-picker__btn')[suivant]?.focus();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="modal-card__header">
          <h2 id="task-form-title">{modeEdition ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={onSubmit} className="task-form">
          <div className="input-group">
            <label htmlFor="tache-titre">Titre</label>
            <input
              ref={champTitre}
              id="tache-titre"
              type="text"
              name="titre"
              value={form.titre}
              onChange={onChange}
              placeholder="Ex : Conception de l'interface"
              required
            />
          </div>

          <div className="input-group">
            <label id="tache-etat-label">État</label>
            <div className="etat-picker" role="radiogroup" aria-labelledby="tache-etat-label">
              {ORDRE_ETATS.map((key, index) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={form.etat === key}
                  // Un seul état est atteignable au Tab, les flèches permettent de changer.
                  tabIndex={form.etat === key ? 0 : -1}
                  className={`etat-picker__btn ${form.etat === key ? 'etat-picker__btn--active' : ''}`}
                  style={
                    form.etat === key
                      ? { background: ETATS[key].bg, color: ETATS[key].color, borderColor: ETATS[key].color }
                      : undefined
                  }
                  onKeyDown={(e) => surToucheEtat(e, index)}
                  onClick={() => onChange({ target: { name: 'etat', value: key, type: 'radio' } })}
                >
                  {ETATS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="tache-date-debut">Date de début</label>
              <input
                id="tache-date-debut"
                type="date"
                name="date_debut"
                value={form.date_debut}
                onChange={onChange}
                required
              />
              <div className="date-shortcuts">
                {RACCOURCIS_DATE.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className="date-shortcuts__btn"
                    // Le libellé précise le champ concerné (il y a deux jeux de raccourcis).
                    aria-label={`Date de début : ${r.label}`}
                    onClick={() => choisirDate('date_debut', r.jours)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="tache-date-fin">Date de fin</label>
              <input
                id="tache-date-fin"
                type="date"
                name="date_fin"
                value={form.date_fin}
                onChange={onChange}
                required
              />
              <div className="date-shortcuts">
                {RACCOURCIS_DATE.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className="date-shortcuts__btn"
                    aria-label={`Date de fin : ${r.label}`}
                    onClick={() => choisirDate('date_fin', r.jours)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {modeEdition ? 'Enregistrer' : 'Créer la tâche'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
