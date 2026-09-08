// ═══════════════════════════════════════════════════════════════════════
// UTILS/HELPERS.JS - Utilidades puras reutilizables
// ═══════════════════════════════════════════════════════════════════════

export function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function countParagraphs(text) {
  return (text || '').trim().split(/\n\s*\n+/).filter(p => p.trim().length > 0).length;
}

export function formatDateTimeValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(date) {
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function normalizeSpanishText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function writeClipboardText(text) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    // Fallback con textarea
    try {
      const ta = document.createElement('textarea');
      ta.value = String(text || '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
  try {
    await navigator.clipboard.writeText(String(text || ''));
    return true;
  } catch {
    return false;
  }
}
