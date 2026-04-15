import { useState, useEffect } from "react";

/**
 * ToastContainer — fixed top-right overlay for reminder notifications.
 *
 * Props:
 *   toasts   — array of { id, type, message }
 *              type is "UPCOMING" (amber) or "MISSED" (red)
 *   onDismiss — called with the toast id when the user closes or the timer fires
 */
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on next frame
    const enter = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 7 s
    const exit  = setTimeout(() => dismiss(), 7000);
    return () => { clearTimeout(enter); clearTimeout(exit); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);   // wait for slide-out
  };

  const isUpcoming = toast.type === "UPCOMING";

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-xs text-sm
        transition-all duration-300 ease-out
        ${isUpcoming
          ? "bg-amber-50 border border-amber-200 text-amber-800"
          : "bg-red-50  border border-red-200   text-red-800"
        }
        ${visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
    >
      {/* Icon */}
      <span className="text-base leading-none mt-0.5 flex-shrink-0">
        {isUpcoming ? "⏰" : "⚠️"}
      </span>

      {/* Message */}
      <span className="flex-1 leading-snug">{toast.message}</span>

      {/* Close button */}
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition font-bold leading-none mt-0.5"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
