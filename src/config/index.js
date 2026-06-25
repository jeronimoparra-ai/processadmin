// ═══════════════════════════════════════════════════════════════════════
// CONFIG.JS - Estado global y constantes de configuración
// ═══════════════════════════════════════════════════════════════════════

function validateStoredValue(value, fallback) {
  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? value : fallback;
  }

  if (fallback && typeof fallback === 'object') {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  }

  if (typeof fallback === 'string') {
    return typeof value === 'string' ? value : fallback;
  }

  if (typeof fallback === 'number') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  if (typeof fallback === 'boolean') {
    return typeof value === 'boolean' ? value : fallback;
  }

  return value ?? fallback;
}

function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (err) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch (err) {
    return false;
  }
}

function safeStorageSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    return false;
  }
}

function loadStoredString(key, fallback = '') {
  const value = safeStorageGet(key, null);
  if (value === null) return fallback;

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : value;
  } catch (err) {
    return value;
  }
}

function safeParse(key, fallback) {
  try {
    const v = safeStorageGet(key, null);
    return v ? validateStoredValue(JSON.parse(v), fallback) : fallback;
  } catch (err) {
    return fallback;
  }
}

const DELIVERY_DATE_STORAGE_KEY = 'checklist_deadline';
const EXPORT_FORMAT_PROFILE_KEY = 'export_format_profile';

const workStartRaw = safeStorageGet('ws_work_start', '');
const parsedWorkStart = parseInt(workStartRaw, 10);

const state = {
  activeView: 'panel',
  chartInstance: null,
  animationId: null,
  currentScore: 71,
  saveTimer: null,
  generatedCitations: safeParse('apa_generated_citations', []),
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
  saveIndicatorTimer: null
};

function normalizeExportFormatProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return null;

  const templateDataUrl = typeof profile.templateDataUrl === 'string' && profile.templateDataUrl.trim()
    ? profile.templateDataUrl.trim()
    : '';
  const templateBase64 = typeof profile.templateBase64 === 'string' && profile.templateBase64.trim()
    ? profile.templateBase64.trim()
    : '';

  if (templateDataUrl || templateBase64) {
    return {
      kind: 'word-template',
      name: typeof profile.name === 'string' ? profile.name.trim() : '',
      description: typeof profile.description === 'string' ? profile.description.trim() : '',
      fileName: typeof profile.fileName === 'string' ? profile.fileName.trim() : '',
      templateDataUrl,
      templateBase64,
      updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : new Date().toISOString()
    };
  }

  const normalizedParts = Array.isArray(profile.structureParts)
    ? profile.structureParts
        .filter(part => part && typeof part === 'object')
        .map((part, index) => ({
          id: typeof part.id === 'string' && part.id ? part.id : `format-part-${index + 1}`,
          text: typeof part.text === 'string' && part.text.trim() ? part.text.trim() : `Parte ${index + 1}`,
          checked: !!part.checked
        }))
    : [];

  return {
    kind: 'legacy-json',
    name: typeof profile.name === 'string' ? profile.name.trim() : '',
    description: typeof profile.description === 'string' ? profile.description.trim() : '',
    title: typeof profile.title === 'string' ? profile.title.trim() : '',
    curso: typeof profile.curso === 'string' ? profile.curso.trim() : '',
    modalidad: typeof profile.modalidad === 'string' ? profile.modalidad.trim() : '',
    docente: typeof profile.docente === 'string' ? profile.docente.trim() : '',
    institucion: typeof profile.institucion === 'string' ? profile.institucion.trim() : '',
    ciudad: typeof profile.ciudad === 'string' ? profile.ciudad.trim() : '',
    fecha: typeof profile.fecha === 'string' ? profile.fecha.trim() : '',
    structureParts: normalizedParts,
    updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : new Date().toISOString()
  };
}

function loadExportFormatProfile() {
  return normalizeExportFormatProfile(safeParse(EXPORT_FORMAT_PROFILE_KEY, null));
}

function saveExportFormatProfile(profile) {
  const normalized = normalizeExportFormatProfile(profile);
  if (!normalized) {
    try {
      localStorage.removeItem(EXPORT_FORMAT_PROFILE_KEY);
    } catch (err) {}
    state.exportFormatProfile = null;
    return null;
  }

  normalized.updatedAt = new Date().toISOString();
  safeStorageSetJSON(EXPORT_FORMAT_PROFILE_KEY, normalized);
  state.exportFormatProfile = normalized;
  return normalized;
}

function clearExportFormatProfile() {
  try {
    localStorage.removeItem(EXPORT_FORMAT_PROFILE_KEY);
  } catch (err) {}
  state.exportFormatProfile = null;
}

function getDeliveryDateValue() {
  return loadStoredString(DELIVERY_DATE_STORAGE_KEY, '');
}

function getDeliveryDate() {
  const value = getDeliveryDateValue();
  if (!value) return null;

  const deliveryDate = new Date(value);
  return Number.isNaN(deliveryDate.getTime()) ? null : deliveryDate;
}

function setDeliveryDateValue(value) {
  safeStorageSet(DELIVERY_DATE_STORAGE_KEY, value);
}

function normalizeDeliveryDateInput(value) {
  if (!value) return '';
  return value.includes('T') ? value : `${value}T23:59:00`;
}

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

const PLANTILLAS_RUBRICA = {
  ensayo: {
    nombre: 'Ensayo académico',
    criterios: [
      { nombre: 'Coherencia argumentativa', peso: 25 },
      { nombre: 'Uso de fuentes APA 7', peso: 25 },
      { nombre: 'Redacción y ortografía', peso: 25 },
      { nombre: 'Estructura y formato', peso: 25 }
    ]
  },
  informe: {
    nombre: 'Informe técnico',
    criterios: [
      { nombre: 'Introducción y objetivos', peso: 20 },
      { nombre: 'Desarrollo metodológico', peso: 30 },
      { nombre: 'Resultados y análisis', peso: 30 },
      { nombre: 'Conclusiones y referencias', peso: 20 }
    ]
  },
  proyecto: {
    nombre: 'Proyecto de investigación',
    criterios: [
      { nombre: 'Planteamiento del problema', peso: 20 },
      { nombre: 'Marco teórico y citas APA', peso: 25 },
      { nombre: 'Metodología', peso: 25 },
      { nombre: 'Resultados y conclusiones', peso: 30 }
    ]
  }
};

const RUBRIC_TEMPLATES_BASE = {
  ...Object.fromEntries(Object.entries(PLANTILLAS_RUBRICA).map(([key, template]) => [
    key,
    {
      label: template.nombre,
      criteria: template.criterios.map(criterion => ({
        name: criterion.nombre,
        max: criterion.peso
      }))
    }
  ])),
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
