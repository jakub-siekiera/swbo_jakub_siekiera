'use client';
// JS – zmiana WIDOCZNOŚCI: przycisk „do góry” (position: fixed) pojawia się po przewinięciu
import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      data-tip="Wróć na górę strony"
      aria-label="Wróć na górę strony"
    >
      ↑
    </button>
  );
}
