import { ETATS } from '../etats';

// Dégradés associés à chaque état, pour retrouver l'esprit "carte colorée"
// du design de référence sans dépendre d'un seul violet partout.
const GRADIENTS = {
  cree: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)',
  accepte: 'linear-gradient(135deg, #F0B84C 0%, #C08A2E 100%)',
  en_cours: 'linear-gradient(135deg, #8B7CF6 0%, #4C3BCF 100%)',
  termine: 'linear-gradient(135deg, #34D399 0%, #0F8F5F 100%)',
  annule: 'linear-gradient(135deg, #F87171 0%, #B4394F 100%)'
};

function joursRestants(dateFin) {
  if (!dateFin) return null;
  const diff = Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function TaskCard({ tache, onClick }) {
  const jours = joursRestants(tache.date_fin);
  const label =
    jours === null ? '' : jours < 0 ? 'En retard' : jours === 0 ? "Aujourd'hui" : `${jours} j restants`;

  return (
    <button
      className="task-card"
      style={{ background: GRADIENTS[tache.etat] || GRADIENTS.cree }}
      onClick={() => onClick(tache)}
    >
      {label && <span className="task-card__badge">{label}</span>}
      <h3 className="task-card__title">{tache.titre}</h3>
      <div className="task-card__progress">
        <span className="task-card__progress-label">{ETATS[tache.etat]?.label}</span>
        <div className="task-card__bar">
          <div
            className="task-card__bar-fill"
            style={{ width: tache.etat === 'termine' ? '100%' : tache.etat === 'en_cours' ? '55%' : '15%' }}
          />
        </div>
      </div>
    </button>
  );
}
