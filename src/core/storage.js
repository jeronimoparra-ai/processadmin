// ═══════════════════════════════════════════════════════════════════════
// CORE/STORAGE.JS - Capa de almacenamiento local y migración de datos
// ═══════════════════════════════════════════════════════════════════════

export const STORAGE_KEYS = Object.freeze({
  ACTIVE_WORK: 'processadmin_active_work',
  WORKS_LIST: 'processadmin_works_list',
  PREFERENCES: 'processadmin_prefs',
  // Claves legacy para migración
  LEGACY_CONTENT: 'redactor_content',
  LEGACY_CITATIONS: 'apa_generated_citations',
  LEGACY_DOC_TYPE: 'ws_document_type',
  LEGACY_STRUCTURE: 'ws_document_structure_parts',
  LEGACY_STUDENT: 'export_student_data',
  LEGACY_HISTORY: 'export_document_history',
  LEGACY_OUTLINE: 'organizer_outline'
});

export function safeGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val === null ? fallback : val;
  } catch (err) {
    console.warn(`[ProcessAdmin Storage] Error leyendo clave "${key}":`, err);
    return fallback;
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch (err) {
    console.error(`[ProcessAdmin Storage] Error guardando clave "${key}":`, err);
    return false;
  }
}

export function safeGetJSON(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    const parsed = JSON.parse(val);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[ProcessAdmin Storage] Error parseando JSON en clave "${key}":`, err);
    return fallback;
  }
}

export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
      console.error('[ProcessAdmin Storage] Cuota de almacenamiento excedida:', err);
      window.dispatchEvent(new CustomEvent('processadmin:quota-exceeded', { detail: { key } }));
    } else {
      console.error(`[ProcessAdmin Storage] Error guardando JSON en clave "${key}":`, err);
    }
    return false;
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}

// ── Migración de datos existentes ──────────────────────────────────
export function migrateLegacyDataIfNeeded() {
  const existingActive = safeGetJSON(STORAGE_KEYS.ACTIVE_WORK, null);
  if (existingActive && existingActive.id) {
    return existingActive; // Ya existe en formato nuevo
  }

  // Verificar si hay datos del sistema anterior
  const legacyContent = safeGet(STORAGE_KEYS.LEGACY_CONTENT, '');
  const legacyType = safeGet(STORAGE_KEYS.LEGACY_DOC_TYPE, 'ensayo');
  const legacyCitations = safeGetJSON(STORAGE_KEYS.LEGACY_CITATIONS, []);
  const legacyStructure = safeGetJSON(STORAGE_KEYS.LEGACY_STRUCTURE, []);
  const legacyStudent = safeGetJSON(STORAGE_KEYS.LEGACY_STUDENT, {});
  const legacyOutline = safeGetJSON(STORAGE_KEYS.LEGACY_OUTLINE, {});
  const legacyHistory = safeGetJSON(STORAGE_KEYS.LEGACY_HISTORY, []);

  const hasLegacyData = legacyContent || (Array.isArray(legacyCitations) && legacyCitations.length > 0) || (legacyStudent && Object.keys(legacyStudent).length > 0);

  if (!hasLegacyData) {
    return null;
  }

  console.info('[ProcessAdmin Migration] Detectados datos heredados, realizando migración automática sin pérdida...');

  // Convertir citas heredadas a formato de objetos uniformes
  const normalizedCitations = (Array.isArray(legacyCitations) ? legacyCitations : []).map((cite, index) => {
    if (typeof cite === 'object' && cite !== null && cite.formattedHtml) {
      return cite;
    }
    const rawStr = typeof cite === 'string' ? cite : (cite?.text || cite?.referencia || JSON.stringify(cite));
    const clean = rawStr.replace(/<\/?em>/g, '').trim();
    const authorMatch = clean.match(/^([^(]+)\s*\(/);
    const yearMatch = clean.match(/\((\d{4}[a-z]?)\)/);
    const author = authorMatch ? authorMatch[1].trim() : 'Autor desconocido';
    const year = yearMatch ? yearMatch[1] : 's.f.';
    
    return {
      id: `cite_migrated_${index}_${Date.now()}`,
      type: 'libro',
      authors: author,
      year: year,
      title: clean,
      publisher: '',
      doiOrUrl: (clean.match(/https?:\/\/\S+/i) || [])[0] || '',
      formattedHtml: rawStr,
      inText: `(${author}, ${year})`
    };
  });

  // Convertir contenido a secciones
  const outlineValues = legacyOutline.values ? Object.values(legacyOutline.values) : Object.values(legacyOutline);
  const outlineText = outlineValues.flat().join('\n\n').trim();
  const mainContent = (legacyContent || outlineText || '').trim();

  const migratedWork = {
    id: `work_${Date.now()}`,
    title: legacyStudent.titulo || legacyStudent.curso || 'Mi Trabajo Académico',
    workType: legacyType || 'ensayo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      author: legacyStudent.nombre || '',
      code: legacyStudent.codigo || '',
      institution: legacyStudent.institucion || '',
      course: legacyStudent.curso || '',
      professor: legacyStudent.docente || '',
      city: legacyStudent.ciudad || '',
      date: legacyStudent.fecha || new Date().toISOString().slice(0, 10),
      deadline: safeGet('checklist_deadline', '')
    },
    plan: {
      topic: legacyOutline.tema || '',
      problem: legacyOutline.problema || '',
      question: legacyOutline.pregunta || '',
      generalObjective: legacyOutline.objetivo_general || '',
      specificObjectives: Array.isArray(legacyOutline.objetivos_especificos) ? legacyOutline.objetivos_especificos : [],
      justification: legacyOutline.justificacion || '',
      expectedConclusions: legacyOutline.conclusiones_esperadas || '',
      notes: safeGetJSON('organizer_notes', {})
    },
    sections: [
      {
        id: 'sec_migrated_main',
        key: 'cuerpo_principal',
        title: 'Cuerpo del documento',
        content: mainContent
      }
    ],
    citations: normalizedCitations,
    checklist: Array.isArray(legacyStructure) ? legacyStructure : []
  };

  // Guardar trabajo activo migrado
  safeSetJSON(STORAGE_KEYS.ACTIVE_WORK, migratedWork);

  // Migrar historial a lista de trabajos
  const worksList = safeGetJSON(STORAGE_KEYS.WORKS_LIST, []);
  if (!worksList.some(w => w.id === migratedWork.id)) {
    worksList.unshift({
      id: migratedWork.id,
      title: migratedWork.title,
      workType: migratedWork.workType,
      updatedAt: migratedWork.updatedAt,
      author: migratedWork.metadata.author,
      wordCount: mainContent.split(/\s+/).filter(Boolean).length
    });
  }

  // Migrar también entradas del historial anterior si existían
  if (Array.isArray(legacyHistory)) {
    legacyHistory.forEach(hist => {
      if (hist && hist.id && !worksList.some(w => w.id === hist.id)) {
        worksList.push({
          id: hist.id,
          title: hist.title || hist.data?.titulo || 'Documento archivado',
          workType: hist.data?.workType || 'ensayo',
          updatedAt: hist.savedAt || new Date().toISOString(),
          author: hist.data?.nombre || '',
          wordCount: (hist.snapshot?.redactorContent || '').split(/\s+/).filter(Boolean).length
        });
      }
    });
  }

  safeSetJSON(STORAGE_KEYS.WORKS_LIST, worksList);
  console.info('[ProcessAdmin Migration] Migración completada con éxito.');

  return migratedWork;
}
