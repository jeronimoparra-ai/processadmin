// ═══════════════════════════════════════════════════════════════════════
// STORE.JS - Centralized application state
// ═══════════════════════════════════════════════════════════════════════

window.state = window.state || {
  currentScore: 0,
  saveTimer: null,
  saveIndicatorTimer: null,
  countdownInterval: null,
  animationId: null,
  generatedCitations: new Set(),
  exportFormatProfile: null
};
