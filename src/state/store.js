// ═══════════════════════════════════════════════════════════════════════
// STORE.JS - Centralized application state
// ═══════════════════════════════════════════════════════════════════════

window.state = window.state || {
  activeView: 'panel',
  currentScore: 0,
  saveTimer: null,
  saveIndicatorTimer: null,
  countdownInterval: null,
  animationId: null,
  generatedCitations: [],
  exportFormatProfile: null,
  focusMode: false,
  lastTemplateFallback: false,
  exportValidationTimer: null,
  organizerSnapshotInterval: null,
  checklistDeadlineInterval: null,
  lastCleanupError: null
};
