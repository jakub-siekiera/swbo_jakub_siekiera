// Komunikat po przekierowaniu (?msg=... albo ?error=...)
export default function Flash({ msg, error }) {
  if (error) return <p className="flash flash-error" role="alert">{error}</p>;
  if (msg) return <p className="flash flash-ok" role="status">{msg}</p>;
  return null;
}
