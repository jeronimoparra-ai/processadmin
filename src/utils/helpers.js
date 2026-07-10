// ═══════════════════════════════════════════════════════════════════════
// HELPERS.JS - Reusable pure functions and utilities
// ═══════════════════════════════════════════════════════════════════════

function debounce(fn, delay) {
  return function(...args) {
    clearTimeout(window.state.saveTimer);
    window.state.saveTimer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function xmlEscape(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wordToHtml(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function countWords(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

function countParagraphs(text) {
  return (text || '').trim().split(/\n\s*\n+/).filter(p => p.trim().length > 0).length;
}

function formatDateTimeValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(date) {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function normalizeSpanishText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCitationAuthor(citation) {
  const clean = String(citation || '').replace(/<[^>]+>/g, '');
  const match = clean.match(/^\(([^,;]+)[,;]/);
  return match ? match[1].trim() : '';
}

function generateInTextCitation(author, year, page) {
  if (page) {
    return `(${author}, ${year}, p. ${page})`;
  }
  return `(${author}, ${year})`;
}

// createZipBlob, crc32 and related low-level ZIP helpers were removed.
// The app uses JSZip (via CDN) for ZIP/DOCX generation; keeping a single
// implementation avoids duplication and reduces maintenance surface.

async function writeClipboardText(text) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') return false;
  try {
    await navigator.clipboard.writeText(String(text || ''));
    return true;
  } catch (err) {
    return false;
  }
}

function copyToClipboard(text, event) {
  writeClipboardText(text).then((copied) => {
    if (!copied) return;
    const btn = event && event.target ? event.target : document.activeElement;
    const original = btn && btn.textContent ? btn.textContent : '';
    if (btn && btn.textContent !== undefined) btn.textContent = 'Copiado';
    setTimeout(() => {
      if (btn && btn.textContent !== undefined) btn.textContent = original;
    }, 2000);
  });
}
