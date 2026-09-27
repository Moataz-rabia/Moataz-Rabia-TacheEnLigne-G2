import { useState } from 'react';
import { ETATS, formatDate } from '../etats';

export default function TaskListItem({ tache, onModifier, onSupprimer }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const etat = ETATS[tache.etat];

  return (
    <div className="task-row">
      <div className="task-row__icon" style={{ background: etat?.bg, color: etat?.color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
      </div>

      <div className="task-row__info">
        <p className="task-row__title">{tache.titre}</p>
        <p className="task-row__date">Échéance : {formatDate(tache.date_fin)}</p>
      </div>

      <span className="task-row__pill" style={{ background: etat?.bg, color: etat?.color }}>
        {etat?.label}
      </span>

      <div className="task-row__menu">
        <button
          className="task-row__menu-btn"
          onClick={() => setMenuOuvert((o) => !o)}
          aria-label="Actions"
        >
          ⋮
        </button>
        {menuOuvert && (
          <div className="task-row__menu-list">
            <button onClick={() => { setMenuOuvert(false); onModifier(tache); }}>Modifier</button>
            <button onClick={() => { setMenuOuvert(false); onSupprimer(tache.id); }}>Supprimer</button>
          </div>
        )}
      </div>
    </div>
  );
}
