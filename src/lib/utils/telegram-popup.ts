export function markManagerTelegramPopupPending(windowRef: Window = window) {
  windowRef.sessionStorage.setItem('afficixo-manager-telegram-popup-pending', 'true')
}

export function consumeManagerTelegramPopupPending(windowRef: Window = window) {
  const pending = windowRef.sessionStorage.getItem('afficixo-manager-telegram-popup-pending') === 'true'

  if (pending) {
    windowRef.sessionStorage.removeItem('afficixo-manager-telegram-popup-pending')
  }

  return pending
}
