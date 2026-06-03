// ═══════════════════════════════════════════════════════════════════════
// ORGANIZADOR.JS - Planificación y Estructura de Investigación
// ═══════════════════════════════════════════════════════════════════════

function buildOrganizador() {
  const organizerSteps = {
    ensayo: [
      { key: 'tema', label: 'Tema del trabajo', hint: 'Define el eje central de tu ensayo.' },
      { key: 'problema', label: 'Problema de investigación', hint: 'Formula la tensión o debate principal.' },
      { key: 'pregunta', label: 'Pregunta de investigación', hint: 'Redacta una pregunta clara y discutible.' },
      { key: 'objetivo_general', label: 'Objetivo general', hint: 'Indica qué pretendes demostrar o analizar.' },
      { key: 'objetivos_especificos', label: 'Objetivos específicos', hint: 'Lista acciones concretas para desarrollar el trabajo.' },
      { key: 'justificacion', label: 'Justificación', hint: 'Explica por qué el tema merece estudiarse.' },
      { key: 'conclusiones_esperadas', label: 'Conclusiones esperadas', hint: 'Anticipa el aporte que esperas obtener.' }
    ],
    monografia: [
      { key: 'tema', label: 'Tema del trabajo', hint: 'Delimita con precisión el objeto de estudio.' },
      { key: 'problema', label: 'Problema de investigación', hint: 'Señala la necesidad de investigación.' },
      { key: 'pregunta', label: 'Pregunta de investigación', hint: 'Formula la pregunta guía del texto.' },
      { key: 'objetivo_general', label: 'Objetivo general', hint: 'Expresa el propósito del estudio.' },
      { key: 'objetivos_especificos', label: 'Objetivos específicos', hint: 'Desglosa metas medibles.' },
      { key: 'justificacion', label: 'Justificación', hint: 'Argumenta la relevancia académica.' },
      { key: 'conclusiones_esperadas', label: 'Conclusiones esperadas', hint: 'Indica los resultados conceptuales esperados.' }
    ],
    informe: [
      { key: 'tema', label: 'Tema del trabajo', hint: 'Indica el fenómeno o práctica analizada.' },
      { key: 'problema', label: 'Problema de investigación', hint: 'Describe qué se quiere comprobar.' },
      { key: 'objetivo_general', label: 'Objetivo general', hint: 'Resume el propósito del informe.' },
      { key: 'objetivos_especificos', label: 'Objetivos específicos', hint: 'Enumera los pasos a lograr.' },
      { key: 'justificacion', label: 'Justificación', hint: 'Explica el valor del informe.' },
      { key: 'conclusiones_esperadas', label: 'Conclusiones esperadas', hint: 'Anticipa los hallazgos esperados.' }
    ],
    investigacion: [
      { key: 'tema', label: 'Tema del trabajo', hint: 'Delimita el foco de investigación.' },
      { key: 'problema', label: 'Problema de investigación', hint: 'Formula la situación a resolver.' },
      { key: 'pregunta', label: 'Pregunta de investigación', hint: 'Traduce el problema en pregunta.' },
      { key: 'objetivo_general', label: 'Objetivo general', hint: 'Describe la meta principal.' },
      { key: 'objetivos_especificos', label: 'Objetivos específicos', hint: 'Desglosa metas operativas.' },
      { key: 'hipotesis', label: 'Hipótesis o supuesto', hint: 'Redacta la idea que vas a contrastar.' },
      { key: 'justificacion', label: 'Justificación', hint: 'Sustenta la utilidad del estudio.' },
      { key: 'conclusiones_esperadas', label: 'Conclusiones esperadas', hint: 'Anticipa el cierre de la investigación.' }
    ],
    anteproyecto: [
      { key: 'tema', label: 'Tema del trabajo', hint: 'Define la idea central del anteproyecto.' },
      { key: 'problema', label: 'Problema de investigación', hint: 'Explica la necesidad de intervenir.' },
      { key: 'pregunta', label: 'Pregunta de investigación', hint: 'Plantea la pregunta principal.' },
      { key: 'objetivo_general', label: 'Objetivo general', hint: 'Señala el objetivo principal.' },
      { key: 'objetivos_especificos', label: 'Objetivos específicos', hint: 'Enumera objetivos medibles.' },
      { key: 'justificacion', label: 'Justificación', hint: 'Argumenta la pertinencia del proyecto.' },
      { key: 'conclusiones_esperadas', label: 'Conclusiones esperadas', hint: 'Indica el resultado previsto.' }
    ]
  };

  const workTypeLabels = {
    ensayo: 'Ensayo argumentativo',
    monografia: 'Monografía',
    informe: 'Informe de laboratorio',
    investigacion: 'Trabajo de investigación',
    anteproyecto: 'Anteproyecto'
  };

  const savedType = loadStoredString('organizer_work_type', 'investigacion');

  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold">${docproIconHtml('ideas', 'Organizador de Ideas', 'docpro-icon docpro-icon--lg')}<span>Organizador de Ideas</span></h2>
          <p class="mb-6 text-[var(--dp-text-secondary)]">Define tu investigación paso a paso y guarda cada avance automáticamente.</p>

          <div class="dp-card space-y-6 p-8">
            <div>
              <label class="dp-label mb-3 block">Selecciona tipo de trabajo:</label>
              <select id="work-type" aria-label="Tipo de trabajo del organizador" class="dp-select">
                ${Object.entries(workTypeLabels).map(([value, label]) => `<option value="${value}" ${value === savedType ? 'selected' : ''}>${label}</option>`).join('')}
              </select>
            </div>

            <div class="dp-card bg-[var(--dp-surface-2)] p-4">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="font-bold text-[var(--dp-text-primary)]">Progreso del organizador</h3>
                <span id="organizer-progress-label" class="text-sm font-bold text-[var(--dp-accent-dark)]">0%</span>
              </div>
              <div class="dp-progress h-3">
                <div id="organizer-progress-bar" class="dp-progress-fill rounded-full transition-all" style="width: 0%"></div>
              </div>
            </div>

            <div id="outline-form" class="space-y-4"></div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <button id="save-outline-btn" class="dp-btn dp-btn-primary flex-1">Guardar avance</button>
              <button id="create-version-btn" class="dp-btn dp-btn-accent flex-1">Guardar versión</button>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="dp-card p-6">
            <h3 class="mb-4 flex items-center gap-2 font-bold">${docproIconHtml('review', 'Historial de versiones', 'docpro-icon docpro-icon--sm')}<span>Historial de versiones</span></h3>
            <div id="versions-list" class="max-h-64 space-y-2 overflow-y-auto text-xs"></div>
            <div id="version-preview" class="hidden mt-4 rounded-lg border border-[var(--dp-border)] bg-white p-4 text-xs"></div>
          </div>

          <div class="dp-card p-6">
            <h3 class="mb-4 flex items-center gap-2 font-bold">${docproIconHtml('review', 'Notas de sección', 'docpro-icon docpro-icon--sm')}<span>Notas de sección</span></h3>
            <div id="section-notes-list" class="space-y-2"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const workTypeSelect = document.getElementById('work-type');
  const outlineForm = document.getElementById('outline-form');
  const notesList = document.getElementById('section-notes-list');
  const versionPreview = document.getElementById('version-preview');
  const storedOutline = loadJSON('organizer_outline', {});
  let notesStore = loadJSON('organizer_notes', {});

  function getCurrentSteps() {
    return organizerSteps[workTypeSelect.value] || [];
  }

  function getOutlineData() {
    const outline = {};
    document.querySelectorAll('.outline-field').forEach(field => {
      if (field.dataset.field === 'objetivos_especificos') {
        outline[field.dataset.field] = field.value.split('\n').map(line => line.trim()).filter(Boolean);
      } else {
        outline[field.dataset.field] = field.value;
      }
    });
    return outline;
  }

  function getSnapshotFromForm() {
    const outline = getOutlineData();
    const noteValues = {};
    document.querySelectorAll('.section-note-input').forEach(input => {
      noteValues[input.dataset.noteKey] = input.value;
    });
    return { outline, notes: noteValues };
  }

  function renderProgress() {
    const steps = getCurrentSteps();
    const completed = steps.filter(step => {
      const field = document.querySelector(`[data-field="${step.key}"]`);
      return field && field.value.trim().length > 0;
    }).length;
    const percent = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;
    const bar = document.getElementById('organizer-progress-bar');
    const label = document.getElementById('organizer-progress-label');
    if (bar) bar.style.width = `${percent}%`;
    if (label) label.textContent = `${completed}/${steps.length} (${percent}%)`;
  }

  function renderNotes() {
    const steps = getCurrentSteps();
    notesList.innerHTML = steps.map(step => `
      <div class="dp-card p-3">
        <div class="flex justify-between items-center gap-2 mb-2">
          <p class="text-xs font-bold text-yellow-900">${step.label}</p>
          <button class="text-xs font-bold text-yellow-700 hover:text-yellow-900 toggle-note-panel" data-note-key="${step.key}">Nota</button>
        </div>
        <textarea rows="2" class="section-note-input hidden w-full border border-yellow-300 rounded px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400" data-note-key="${step.key}" placeholder="Recordatorio privado..." aria-label="Nota de sección">${escapeHtml(notesStore[workTypeSelect.value]?.[step.key] || '')}</textarea>
      </div>
    `).join('');

    notesList.querySelectorAll('.toggle-note-panel').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.dataset.noteKey;
        const field = notesList.querySelector(`[data-note-key="${key}"]`);
        field.classList.toggle('hidden');
        if (!field.classList.contains('hidden')) field.focus();
      });
    });

    notesList.querySelectorAll('.section-note-input').forEach(input => {
      input.addEventListener('input', () => {
        if (!notesStore[workTypeSelect.value]) notesStore[workTypeSelect.value] = {};
        notesStore[workTypeSelect.value][input.dataset.noteKey] = input.value;
        saveJSON('organizer_notes', notesStore);
      });
    });
  }

  function renderForm() {
    const steps = getCurrentSteps();
    const outlineValues = storedOutline.type === workTypeSelect.value ? (storedOutline.values || storedOutline) : {};

    outlineForm.innerHTML = steps.map((step, index) => {
      const value = step.key === 'objetivos_especificos'
        ? (Array.isArray(outlineValues[step.key]) ? outlineValues[step.key].join('\n') : (outlineValues[step.key] || ''))
        : (outlineValues[step.key] || '');

      return `
        <div class="dp-card p-4">
          <label class="mb-2 block text-sm font-bold text-[var(--dp-text-primary)]">Paso ${index + 1}: ${step.label}</label>
          <p class="mb-2 text-xs text-[var(--dp-text-muted)]">${step.hint}</p>
          ${step.key === 'objetivos_especificos'
            ? `<textarea rows="4" class="dp-textarea outline-field resize-none" data-field="${step.key}" placeholder="Escribe un objetivo por línea..." aria-label="${escapeHtml(step.label)}">${escapeHtml(value)}</textarea>`
            : `<textarea rows="3" class="dp-textarea outline-field resize-none" data-field="${step.key}" placeholder="Escribe aquí..." aria-label="${escapeHtml(step.label)}">${escapeHtml(value)}</textarea>`}
        </div>
      `;
    }).join('');

    renderProgress();
    renderNotes();
  }

  function saveCurrentOutline(createVersion = false, source = 'manual') {
    const snapshot = getSnapshotFromForm();
    const payload = {
      type: workTypeSelect.value,
      values: snapshot.outline,
      savedAt: new Date().toISOString(),
      source
    };

    saveJSON('organizer_outline', payload);
    if (createVersion) {
      state.organizerVersions.unshift({
        date: formatDateTimeValue(new Date()),
        type: workTypeSelect.value,
        content: payload.values,
        notes: snapshot.notes,
        source
      });
      state.organizerVersions = state.organizerVersions.slice(0, 20);
      saveJSON('organizer_versions', state.organizerVersions);
      renderVersions();
    }
  }

  function renderVersions() {
    const list = document.getElementById('versions-list');
    if (state.organizerVersions.length === 0) {
      list.innerHTML = '<p class="text-[var(--dp-text-muted)] italic">Sin versiones guardadas</p>';
      versionPreview.classList.add('hidden');
      return;
    }

    list.innerHTML = state.organizerVersions.map((version, index) => `
      <div class="dp-card p-2 text-xs font-semibold space-y-2">
        <div class="flex justify-between items-center gap-2">
          <div>
            <div>v${index + 1}</div>
            <div class="text-[var(--dp-accent-dark)] text-xs">${escapeHtml(version.date)}</div>
          </div>
          <span class="text-[10px] uppercase tracking-wide text-[var(--dp-accent-dark)]">${escapeHtml(workTypeLabels[version.type] || version.type)}</span>
        </div>
        <div class="flex gap-2">
          <button class="dp-btn dp-btn-ghost flex-1 preview-version" data-idx="${index}">Vista previa</button>
          <button class="dp-btn dp-btn-primary flex-1 restore-version" data-idx="${index}">Restaurar</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.preview-version').forEach(btn => {
      btn.addEventListener('click', () => {
        const version = state.organizerVersions[parseInt(btn.dataset.idx, 10)];
        versionPreview.classList.remove('hidden');
        versionPreview.innerHTML = `
          <p class="font-bold text-purple-900 mb-2">Vista previa: ${escapeHtml(version.date)}</p>
          <pre class="whitespace-pre-wrap text-[var(--dp-text-secondary)] font-mono">${escapeHtml(JSON.stringify(version.content, null, 2))}</pre>
        `;
      });
    });

    list.querySelectorAll('.restore-version').forEach(btn => {
      btn.addEventListener('click', () => {
        const version = state.organizerVersions[parseInt(btn.dataset.idx, 10)];
        workTypeSelect.value = version.type || 'investigacion';
        saveJSON('organizer_outline', { type: workTypeSelect.value, values: version.content, savedAt: new Date().toISOString(), source: 'restore' });
        renderForm();
      });
    });
  }

  document.getElementById('work-type').addEventListener('change', () => {
    safeStorageSet('organizer_work_type', workTypeSelect.value);
    renderForm();
  });

  document.getElementById('save-outline-btn').addEventListener('click', () => {
    saveCurrentOutline(true, 'manual');
    const btn = document.getElementById('save-outline-btn');
    btn.textContent = 'Guardado';
    setTimeout(() => {
      btn.textContent = 'Guardar avance';
    }, 2000);
  });

  document.getElementById('create-version-btn').addEventListener('click', () => {
    saveCurrentOutline(true, 'manual');
    const btn = document.getElementById('create-version-btn');
    btn.textContent = 'Versión guardada';
    setTimeout(() => {
      btn.textContent = 'Guardar versión';
    }, 2000);
  });

  document.getElementById('outline-form').addEventListener('input', () => {
    renderProgress();
  });

  renderForm();
  renderVersions();
  safeStorageSet('organizer_work_type', workTypeSelect.value);

  if (state.organizerSnapshotInterval) clearInterval(state.organizerSnapshotInterval);
  state.organizerSnapshotInterval = setInterval(() => {
    saveCurrentOutline(true, 'auto');
  }, 600000);
}
