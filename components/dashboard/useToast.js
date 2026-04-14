import { useState, useCallback } from 'react';

/**
 * Minimal toast hook. Returns [toastEl, showToast].
 * showToast(message, type = 'success' | 'error', durationMs = 3000)
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', durationMs = 3000) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast(t => (t?.id === id ? null : t)), durationMs);
  }, []);

  const toastEl = toast ? (
    <div className={`db-toast db-toast--${toast.type}`} role="status">
      {toast.message}
      <button
        className="db-toast-close"
        onClick={() => setToast(null)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  ) : null;

  return [toastEl, showToast];
}
