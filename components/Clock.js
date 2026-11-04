'use client';
// JS – NOWE INFORMACJE: aktualna data i godzina, odświeżane co sekundę
import { useEffect, useState } from 'react';

export default function Clock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return <p className="clock">&nbsp;</p>;

  return (
    <p className="clock">
      <time dateTime={now.toISOString()}>
        {now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        {', '}
        <strong>{now.toLocaleTimeString('pl-PL')}</strong>
      </time>
    </p>
  );
}
