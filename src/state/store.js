// ═══════════════════════════════════════════════════════════════════════
// STORE.JS - Centralized application state
// ═══════════════════════════════════════════════════════════════════════

const workStartRaw = safeStorageGet('ws_work_start', '');
const parsedWorkStart = parseInt(workStartRaw, 10);

function loadGeneratedCitations() {
  const stored = safeStorageGet('apa_generated_citations', '');
  if (!stored) return [];
  try {
    const value = JSON.parse(stored);
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(/\r?\n/).filter(Boolean);
  } catch {
    // Older installations could store references as plain lines.
    if (!/^[\s]*[\[{]/.test(stored)) return stored.split(/\r?\n/).filter(Boolean);
  }
  return [];
}

window.state = {
  activeView: new URLSearchParams(location.search).get('view') === 'exportar' ? 'exportar' : 'panel',
  chartInstance: null,
  animationId: null,
  currentScore: 71,
  pendingTemplate: null,
  afterTemplateSave: null,
  pendingFields: new Map(),
  lastCleanupError: null,
  saveTimer: null,
  generatedCitations: loadGeneratedCitations(),
  countdownInterval: null,
  simulationHistory: [],
  workStartTime: Number.isFinite(parsedWorkStart) ? parsedWorkStart : Date.now(),
  lastSaveTime: null,
  focusMode: false,
  rubricTemplates: safeParse('rubrica_templates', {}),
  currentRubric: safeParse('rubrica_current', []),
  organizerVersions: safeParse('organizer_versions', []),
  organizerNotes: safeParse('organizer_notes', {}),
  organizerSnapshots: safeParse('organizer_snapshots', []),
  exportFormatProfile: loadExportFormatProfile(),
  organizerSnapshotInterval: null,
  checklistDeadlineInterval: null,
  exportValidationTimer: null,
  saveIndicatorTimer: null,
  lastTemplateFallback: false
};
