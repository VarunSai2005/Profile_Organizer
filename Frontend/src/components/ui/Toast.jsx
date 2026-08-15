import { useCallback, useState } from 'react'

let toastIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 320)
    }, duration)
  }, [])

  const ICONS = { success: '✓', error: '✕', info: 'ℹ' }

  const ToastContainer = useCallback(
    () => (
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}${t.exiting ? ' exit' : ''}`}
            role="alert"
          >
            <span className="toast-icon">{ICONS[t.type] ?? 'ℹ'}</span>
            <span className="toast-text">{t.message}</span>
          </div>
        ))}
      </div>
    ),
    [toasts]
  )

  return { toasts, showToast, ToastContainer }
}
