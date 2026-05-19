/**
 * @file notifications.js — Toast notifications do admin
 */

/**
 * Exibe notificação temporária.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='success']
 */
export function showNotification(message, type = 'success') {
  const colors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  };

  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    background: ${colors[type] || colors.success};
    color: white; padding: 1rem 1.5rem; border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3); max-width: 400px;
    animation: adminSlideIn 0.3s ease;
  `;
  el.textContent = message;
  document.body.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'adminSlideOut 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, type === 'error' ? 5000 : 3000);
}

/** Injeta keyframes uma única vez */
if (!document.getElementById('admin-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-notification-styles';
  style.textContent = `
    @keyframes adminSlideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes adminSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
  `;
  document.head.appendChild(style);
}
