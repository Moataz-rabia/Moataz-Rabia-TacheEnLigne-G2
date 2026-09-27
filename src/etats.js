// Référentiel unique des états d'une tâche : source de vérité pour
// labels affichés et couleurs, utilisé par tous les composants.
export const ETATS = {
  cree: { label: 'Créée', color: '#8A94A6', bg: '#F1F3F6' },
  accepte: { label: 'Acceptée', color: '#C08A2E', bg: '#FBF1DF' },
  en_cours: { label: 'En cours', color: '#5B4CE0', bg: '#EFEAFE' },
  termine: { label: 'Terminée', color: '#1F9D6B', bg: '#E4F7EE' },
  annule: { label: 'Annulée', color: '#D0455C', bg: '#FBE7EA' }
};

export const ORDRE_ETATS = ['cree', 'accepte', 'en_cours', 'termine', 'annule'];

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
