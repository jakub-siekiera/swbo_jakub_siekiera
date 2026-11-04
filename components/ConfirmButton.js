'use client';
// Przycisk wysyłający formularz dopiero po potwierdzeniu (window.confirm)
export default function ConfirmButton({ message, className = 'btn btn-danger', tip, children }) {
  return (
    <button
      type="submit"
      className={className}
      data-tip={tip}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
