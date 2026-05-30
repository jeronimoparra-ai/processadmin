// ═══════════════════════════════════════════════════════════════════════
// STORAGE.JS - Funciones de persistencia y manipulación del localStorage
// ═══════════════════════════════════════════════════════════════════════

function loadJSON(key, fallback) {
  try {
    const value = safeStorageGet(key, null);
    return value ? validateStoredValue(JSON.parse(value), fallback) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  safeStorageSetJSON(key, value);
}

function saveField(key, value) {
  const statusEl = document.getElementById('save-status');
  if (statusEl) {
    statusEl.textContent = 'Guardando...';
    statusEl.classList.add('text-amber-400');
  }

  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    safeStorageSet(key, value);
    if (statusEl) {
      statusEl.textContent = 'Guardado automáticamente';
      statusEl.classList.remove('text-amber-400');
      statusEl.classList.add('text-green-600');
    }
    updateWriterProgress();
    if (typeof updateSectionCompleteness === 'function') {
      updateSectionCompleteness();
    }
    setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.classList.remove('text-green-600');
      }
    }, 3000);
  }, 800);
}

const DOCUMENT_HISTORY_KEY = 'export_document_history';

function loadDocumentHistory() {
  return loadJSON(DOCUMENT_HISTORY_KEY, []);
}

function saveDocumentHistory(history) {
  saveJSON(DOCUMENT_HISTORY_KEY, history);
  updateSavedDocumentCounter();
}

function createDocumentHistorySnapshot(data, snapshot = {}) {
  return {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: data.titulo || data.curso || data.nombre || 'Documento sin título',
    savedAt: new Date().toISOString(),
    data: { ...data },
    snapshot: {
      redactorContent: snapshot.redactorContent ?? safeStorageGet('redactor_content', ''),
      organizerOutline: snapshot.organizerOutline ?? loadJSON('organizer_outline', {}),
      generatedCitations: snapshot.generatedCitations ?? [...state.generatedCitations].map(ref => ref.replace(/<\/?em>/g, '')),
      exportFormatProfile: snapshot.exportFormatProfile ?? state.exportFormatProfile ?? null
    }
  };
}

function addDocumentHistoryEntry(data, snapshot = {}) {
  const history = loadDocumentHistory();
  const entry = createDocumentHistorySnapshot(data, snapshot);
  history.unshift(entry);
  saveDocumentHistory(history.slice(0, 12));
  return entry;
}

function removeDocumentHistoryEntry(entryId) {
  const history = loadDocumentHistory().filter(entry => entry.id !== entryId);
  saveDocumentHistory(history);
  return history;
}

function getDocumentHistoryCount() {
  return loadDocumentHistory().length;
}

function updateSavedDocumentCounter() {
  const count = getDocumentHistoryCount();
  const counter = document.getElementById('saved-document-count');
  if (counter) {
    counter.textContent = count.toString();
  }
}

function updateCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  const deliveryDate = getDeliveryDate();
  if (!deliveryDate) {
    el.textContent = 'Opcional: agrega una fecha de entrega si quieres ver el conteo';
    el.classList.remove('text-red-600');
    el.classList.add('text-slate-500');
    return;
  }

  const now = Date.now();
  const target = deliveryDate.getTime();
  const diff = target - now;

  if (diff <= 0) {
    el.textContent = 'Fecha de entrega vencida';
    el.classList.add('text-red-600');
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  el.textContent = `${days} días, ${hours} horas, ${mins} min, ${secs} seg`;
}

function startCountdown() {
  if (state.countdownInterval) clearInterval(state.countdownInterval);
  updateCountdown();
  state.countdownInterval = setInterval(updateCountdown, 1000);
}

function stopCountdown() {
  if (state.countdownInterval) {
    clearInterval(state.countdownInterval);
    state.countdownInterval = null;
  }
}

function animateScore(targetValue) {
  const display = document.getElementById('score-display');
  if (!display) return;

  const start = state.currentScore;
  const startTime = performance.now();
  const duration = 400;

  if (state.animationId) cancelAnimationFrame(state.animationId);

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(start + (targetValue - start) * progress);

    display.textContent = current;

    if (progress < 1) {
      state.animationId = requestAnimationFrame(tick);
    } else {
      state.currentScore = targetValue;
      updateScoreVisuals(targetValue);
    }
  }

  state.animationId = requestAnimationFrame(tick);
}

function updateScoreVisuals(score) {
  const card = document.getElementById('score-card');
  if (!card) return;

  let bgClass, borderClass, badgeClass, badgeText;

  if (score >= 90) {
    bgClass = 'from-green-50 to-green-100';
    borderClass = 'border-green-500 shadow-2xl shadow-green-100/60';
    badgeClass = 'bg-green-600 text-white';
    badgeText = 'Resultado alto';
  } else if (score >= 70) {
    bgClass = 'from-amber-50 to-amber-100';
    borderClass = 'border-amber-600 shadow-2xl shadow-amber-100/60';
    badgeClass = 'bg-amber-600 text-white';
    badgeText = 'Resultado aceptable';
  } else {
    bgClass = 'from-orange-50 to-orange-100';
    borderClass = 'border-orange-500 shadow-2xl shadow-orange-100/60';
    badgeClass = 'bg-orange-600 text-white';
    badgeText = 'Necesita revisión';
  }

  card.className = `rounded-2xl border-4 bg-gradient-to-br ${bgClass} ${borderClass} p-10 text-center`;

  const badge = document.getElementById('score-badge');
  if (badge) {
    badge.textContent = badgeText;
    badge.className = `${badgeClass} rounded-full px-6 py-2 text-sm font-bold mt-4 inline-block shadow-lg`;
  }
}

function calculateWriterProgress() {
  const fields = ['ws_empresa', 'ws_planeacion', 'ws_organizacion', 'ws_direccion', 'ws_control'];
  let filled = 0;

  fields.forEach(key => {
    const val = safeStorageGet(key, '');
    if (val.trim().length > 5) filled++;
  });

  return Math.round((filled / fields.length) * 100);
}

function updateWriterProgress() {
  const progress = calculateWriterProgress();
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  const exportBtn = document.getElementById('export-btn');

  if (bar) {
    bar.style.width = progress + '%';
    if (progress === 100) {
      bar.classList.remove('bg-indigo-500');
      bar.classList.add('bg-emerald-500');
    } else {
      bar.classList.remove('bg-emerald-500');
      bar.classList.add('bg-indigo-500');
    }
  }

  if (label) {
    if (progress === 100) {
      label.textContent = 'Borrador completo — listo para exportar';
    } else {
      label.textContent = `Progreso del borrador: ${progress}%`;
    }
  }

  if (exportBtn) {
    if (progress === 100) {
      exportBtn.classList.remove('opacity-40', 'cursor-not-allowed');
      exportBtn.classList.add('hover:bg-indigo-700');
    } else {
      exportBtn.classList.add('opacity-40', 'cursor-not-allowed');
      exportBtn.classList.remove('hover:bg-indigo-700');
    }
  }
}

function calculateQualityMetrics() {
  const structureChecklist = loadJSON('checklist_estructura', []);
  const formatChecklist = loadJSON('checklist_formato', []);
  const rubric = loadJSON('rubrica_current', []);
  const exportData = loadJSON('export_student_data', {});
  const apaSources = loadJSON('apa_sources', []);
  const citations = loadJSON('apa_generated_citations', state.generatedCitations || []);
  const redactorText = safeStorageGet('redactor_content', '');
  const inTextCitations = [...redactorText.matchAll(/\(([^)]+)\)/g)].length;

  const structureCompletion = structureChecklist.length > 0 ? (structureChecklist.filter(item => item.checked).length / structureChecklist.length) * 100 : 0;
  const apaCompletion = Math.min(100, (citations.length > 0 ? 40 : 0) + (apaSources.length > 0 ? 30 : 0) + (inTextCitations > 0 ? 30 : 0));

  let criteriaCompletion = 0;
  if (rubric.length > 0) {
    const obtained = rubric.reduce((sum, item) => sum + (parseInt(item.obtained, 10) || 0), 0);
    const max = rubric.reduce((sum, item) => sum + (parseInt(item.max, 10) || 0), 0);
    criteriaCompletion = max > 0 ? (obtained / max) * 100 : 0;
  }

  const wordCompletion = formatChecklist.length > 0 ? (formatChecklist.filter(item => item.checked).length / formatChecklist.length) * 100 : 0;
  const exportFields = ['nombre', 'codigo', 'curso', 'modalidad', 'docente', 'institucion', 'ciudad', 'fecha'];
  const exportFilled = exportFields.filter(field => String(exportData[field] || '').trim().length > 0).length;
  const exportCompletion = (exportFilled / exportFields.length) * 100;

  return {
    structure: Math.round(structureCompletion),
    apa: Math.round(apaCompletion),
    criteria: Math.round(criteriaCompletion),
    wordFormat: Math.round((wordCompletion + exportCompletion) / 2),
    overall: Math.round((structureCompletion + apaCompletion + criteriaCompletion + ((wordCompletion + exportCompletion) / 2)) / 4)
  };
}

function getMotivationalMessage(percentage) {
  if (percentage < 40) {
    return 'Sigue avanzando. Prioriza una sección y complétala paso a paso.';
  } else if (percentage < 80) {
    return 'Vas muy bien. Ya tienes una base sólida; ahora toca pulir detalles.';
  } else {
    return 'Casi listo. Solo faltan ajustes finales para dejarlo preparado.';
  }
}

function buildPendingItems(metrics) {
  const pendingItems = [];

  if (metrics.structure < 100) pendingItems.push({ label: 'Completar checklist de estructura', view: 'checklist' });
  if (metrics.apa < 100) pendingItems.push({ label: 'Revisar normas APA y referencias', view: 'apa' });
  if (metrics.criteria < 100) pendingItems.push({ label: 'Ajustar la rúbrica del profesor', view: 'simulador' });
  if (metrics.wordFormat < 100) pendingItems.push({ label: 'Completar datos de exportación Word', view: 'exportar' });
  if (safeStorageGet('redactor_content', '').trim().length < 120) pendingItems.push({ label: 'Avanzar en el redactor', view: 'redactor' });

  const organizerOutline = loadJSON('organizer_outline', {});
  const organizerValues = organizerOutline.values ? Object.values(organizerOutline.values) : Object.values(organizerOutline);
  if (organizerValues.flat().join(' ').trim().length < 40) {
    pendingItems.push({ label: 'Completar el organizador de ideas', view: 'organizador' });
  }

  return pendingItems.slice(0, 5);
}

function wordToHtml(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function sortReferencesByAuthor(references) {
  return references.sort((a, b) => {
    const authorA = a.author || a.institution || '';
    const authorB = b.author || b.institution || '';
    return authorA.localeCompare(authorB, 'es');
  });
}

function validateReference(ref) {
  const hasUrl = !!ref.url;
  const hasDoi = !!ref.doi;

  const validation = {
    author: !!ref.author,
    year: !!ref.year,
    title: !!ref.title,
    source: !!ref.source,
    urlOrDoi: hasUrl || hasDoi
  };

  return {
    isValid: Object.values(validation).every(v => v),
    issues: Object.keys(validation).filter(k => !validation[k]),
    validation
  };
}
