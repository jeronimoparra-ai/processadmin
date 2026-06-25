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

function utf8Bytes(text) {
  return new TextEncoder().encode(String(text || ''));
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let j = 0; j < 8; j++) {
      value = (value & 1) ? (0xEDB88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBlob(files) {
  const fileParts = [];
  const centralParts = [];
  let offset = 0;

  const writeUint16 = (value) => [value & 0xff, (value >>> 8) & 0xff];
  const writeUint32 = (value) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];

  files.forEach(file => {
    const nameBytes = utf8Bytes(file.path);
    const contentBytes = utf8Bytes(file.content);
    const checksum = crc32(contentBytes);
    const size = contentBytes.length;

    const localHeader = Uint8Array.from([
      0x50, 0x4b, 0x03, 0x04,
      0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
      ...writeUint16(0), ...writeUint16(0),
      ...writeUint32(checksum),
      ...writeUint32(size), ...writeUint32(size),
      ...writeUint16(nameBytes.length), ...writeUint16(0)
    ]);

    fileParts.push(localHeader, nameBytes, contentBytes);

    const centralHeader = Uint8Array.from([
      0x50, 0x4b, 0x01, 0x02,
      0x14, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
      ...writeUint16(0), ...writeUint16(0),
      ...writeUint32(checksum),
      ...writeUint32(size), ...writeUint32(size),
      ...writeUint16(nameBytes.length), ...writeUint16(0),
      ...writeUint16(0), ...writeUint16(0), ...writeUint16(0),
      ...writeUint32(0), ...writeUint32(offset)
    ]);

    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const centralOffset = fileParts.reduce((sum, part) => sum + part.length, 0);
  const eocd = Uint8Array.from([
    0x50, 0x4b, 0x05, 0x06,
    ...writeUint16(0), ...writeUint16(0),
    ...writeUint16(files.length), ...writeUint16(files.length),
    ...writeUint32(centralSize), ...writeUint32(centralOffset),
    0x00, 0x00
  ]);

  return new Blob([...fileParts, ...centralParts, eocd], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

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
