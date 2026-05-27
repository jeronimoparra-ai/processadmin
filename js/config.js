// ═══════════════════════════════════════════════════════════════════════
// CONFIG.JS - Estado global y constantes de configuración
// ═══════════════════════════════════════════════════════════════════════

function safeParse(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (err) {
    console.error('safeParse failed for', key, err);
    return fallback;
  }
}

const state = {
  activeView: 'panel',
  chartInstance: null,
  animationId: null,
  currentScore: 71,
  saveTimer: null,
  generatedCitations: safeParse('apa_generated_citations', []),
  countdownInterval: null,
  simulationHistory: [],
  workStartTime: localStorage.getItem('ws_work_start') ? parseInt(localStorage.getItem('ws_work_start')) : Date.now(),
  lastSaveTime: null,
  focusMode: false,
  rubricTemplates: safeParse('rubrica_templates', {}),
  currentRubric: safeParse('rubrica_current', []),
  organizerVersions: safeParse('organizer_versions', []),
  organizerNotes: safeParse('organizer_notes', {}),
  organizerSnapshots: safeParse('organizer_snapshots', []),
  organizerSnapshotInterval: null
};

const DELIVERY_DATE = new Date('2026-05-31T23:59:00');

const SECTION_RECOMMENDATIONS = {
  introduccion: 'Introducción: 150-250 palabras',
  desarrollo: 'Desarrollo: 300-600 palabras',
  conclusion: 'Conclusión: 100-150 palabras',
  marco: 'Marco teórico: 400-600 palabras',
  metodologia: 'Metodología: 200-300 palabras',
  resultados: 'Resultados: 200-350 palabras',
  discusion: 'Discusión: 250-400 palabras',
  objetivo: 'Objetivo: 40-80 palabras',
  justificacion: 'Justificación: 120-200 palabras'
};

const APA_REFERENCE_CHECKS = [
  { key: 'author', label: 'Autor' },
  { key: 'year', label: 'Año' },
  { key: 'title', label: 'Título' },
  { key: 'source', label: 'Fuente' },
  { key: 'doiOrUrl', label: 'DOI o URL' }
];

const RUBRIC_TEMPLATES_BASE = {
  ensayo: {
    label: 'Ensayo argumentativo',
    criteria: [
      { name: 'Tesis clara y argumentable', max: 20 },
      { name: 'Argumentos con evidencia', max: 30 },
      { name: 'Contrarargumentos', max: 15 },
      { name: 'Conclusión sólida', max: 20 },
      { name: 'Formato APA y ortografía', max: 15 }
    ]
  },
  informe: {
    label: 'Informe de laboratorio',
    criteria: [
      { name: 'Objetivos claros', max: 15 },
      { name: 'Metodología descrita', max: 25 },
      { name: 'Resultados precisos', max: 30 },
      { name: 'Discusión e interpretación', max: 20 },
      { name: 'Conclusiones y referencias', max: 10 }
    ]
  },
  monografia: {
    label: 'Monografía',
    criteria: [
      { name: 'Introducción y marco teórico', max: 25 },
      { name: 'Desarrollo y análisis', max: 40 },
      { name: 'Referencias y citas', max: 15 },
      { name: 'Estructura y coherencia', max: 12 },
      { name: 'Conclusiones', max: 8 }
    ]
  },
  investigacion: {
    label: 'Trabajo de investigación',
    criteria: [
      { name: 'Planteamiento del problema', max: 15 },
      { name: 'Objetivos e hipótesis', max: 15 },
      { name: 'Marco teórico', max: 20 },
      { name: 'Metodología', max: 20 },
      { name: 'Resultados y discusión', max: 20 },
      { name: 'Conclusiones y referencias', max: 10 }
    ]
  },
  anteproyecto: {
    label: 'Anteproyecto',
    criteria: [
      { name: 'Tema y problema', max: 20 },
      { name: 'Pregunta y objetivos', max: 20 },
      { name: 'Justificación', max: 20 },
      { name: 'Viabilidad y alcance', max: 20 },
      { name: 'Normas y presentación', max: 20 }
    ]
  }
};
