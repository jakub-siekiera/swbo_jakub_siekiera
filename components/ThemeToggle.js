'use client';
// JS – zmiana WYGLĄDU: tryb ciemny (classList.toggle na <html>)
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch {}
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
    setDark(isDark);
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
  }

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-pressed={dark}
      data-tip={dark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
