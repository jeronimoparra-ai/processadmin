// ═══════════════════════════════════════════════════════════════════════
// UI-ICONS.JS - Rutas compartidas para íconos visuales de la interfaz
// ═══════════════════════════════════════════════════════════════════════

function docproEscapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DOCPRO_ICON_PATHS = Object.freeze({
  panel: 'assets/icons/panel.svg',
  redactor: 'assets/icons/redactor.svg',
  apa: 'assets/icons/apa.svg',
  rubric: 'assets/icons/rubric.svg',
  ideas: 'assets/icons/ideas.svg',
  exportWord: 'assets/icons/export-word.svg',
  review: 'assets/icons/review.svg',
  validation: 'assets/icons/validation.svg',
  achievement: 'assets/icons/achievement.svg'
});

function docproIconHtml(name, alt, className = 'docpro-icon') {
  const src = DOCPRO_ICON_PATHS[name] || DOCPRO_ICON_PATHS.panel;
  return `<img src="${docproEscapeAttr(src)}" alt="${docproEscapeAttr(alt)}" class="${docproEscapeAttr(className)}" loading="lazy" decoding="async">`;
}
