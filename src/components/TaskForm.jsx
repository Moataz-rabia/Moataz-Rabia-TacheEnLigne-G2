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
  const choisirDate = (champ, jours) => {
    onChange({ target: { name: champ, value: versISO(jours), type: 'date' } });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2>{modeEdition ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button className="modal-card__close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form onSubmit={onSubmit} className="task-form">
          <div className="input-group">
            <label>Titre</label>
            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={onChange}
              placeholder="Ex : Conception de l'interface"
              required
            />
          </div>

          <div className="input-group">
            <label>État</label>
            <div className="etat-picker" role="radiogroup" aria-label="État de la tâche">
              {ORDRE_ETATS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={form.etat === key}
                  className={`etat-picker__btn ${form.etat === key ? 'etat-picker__btn--active' : ''}`}
                  style={
                    form.etat === key
                      ? { background: ETATS[key].bg, color: ETATS[key].color, borderColor: ETATS[key].color }
                      : undefined
                  }
                  onClick={() => onChange({ target: { name: 'etat', value: key, type: 'radio' } })}
                >
                  {ETATS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Date de début</label>
              <input type="date" name="date_debut" value={form.date_debut} onChange={onChange} required />
              <div className="date-shortcuts">
                {RACCOURCIS_DATE.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className="date-shortcuts__btn"
                    onClick={() => choisirDate('date_debut', r.jours)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Date de fin</label>
              <input type="date" name="date_fin" value={form.date_fin} onChange={onChange} required />
              <div className="date-shortcuts">
                {RACCOURCIS_DATE.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    className="date-shortcuts__btn"
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
