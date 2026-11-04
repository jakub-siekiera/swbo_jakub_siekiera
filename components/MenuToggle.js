'use client';
// JS – zmiana WIDOCZNOŚCI: hamburger pokazuje/ukrywa menu na telefonie
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function MenuToggle() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // klasa .open na <ul id="main-menu"> (bezpośrednia operacja na DOM)
  useEffect(() => {
    document.getElementById('main-menu')?.classList.toggle('open', open);
  }, [open]);

  // po przejściu na inną stronę zamknij menu
  useEffect(() => setOpen(false), [pathname]);

  return (
    <button
      type="button"
      className="menu-toggle"
      aria-controls="main-menu"
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      title="Pokaż / ukryj menu"
    >
      <span className="sr-only">Menu</span>
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </button>
  );
}
