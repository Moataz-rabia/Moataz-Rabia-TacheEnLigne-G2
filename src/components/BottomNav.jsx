export default function BottomNav({ onAjouter }) {
  return (
    <nav className="bottom-nav">
      <button className="bottom-nav__add" onClick={onAjouter} aria-label="Ajouter une tâche">+</button>
    </nav>
  );
}