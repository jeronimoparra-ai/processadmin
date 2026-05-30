// ═══════════════════════════════════════════════════════════════════════
// REDACTOR.JS - Editor de contenido asistido con guías y métricas
// ═══════════════════════════════════════════════════════════════════════

function buildRedactorEnhanced() {
  const connectors = {
    introduccion: ['En primer lugar', 'Para empezar', 'Inicialmente', 'Cabe destacar', 'Es importante señalar'],
    contraste: ['Sin embargo', 'No obstante', 'Aunque', 'Por el contrario', 'En cambio'],
    conclusion: ['En conclusión', 'Por lo tanto', 'En definitiva', 'Finalmente', 'Para concluir'],
    ejemplificacion: ['Por ejemplo', 'Como ilustración', 'A modo de ejemplo', 'Casos como', 'Véase'],
    causa_efecto: ['Por esta razón', 'Como resultado', 'Debido a que', 'En consecuencia', 'Esto causa'],
    secuencia: ['Primero', 'Luego', 'Entonces', 'Subsecuentemente', 'Finalmente']
  };

  const workTypeGuides = {
    ensayo: [
      { key: 'introduccion', title: 'Introducción', purpose: 'Presentar el tema y la tesis.', length: '150-250 palabras', include: 'Contexto, tesis, enfoque y ruta del texto.', mistakes: 'Ser demasiado general o no plantear postura.' },
      { key: 'desarrollo', title: 'Desarrollo', purpose: 'Argumentar con evidencia.', length: '300-600 palabras', include: 'Argumentos, ejemplos, citas y contraargumentos.', mistakes: 'Listar ideas sin sostenerlas.' },
      { key: 'conclusion', title: 'Conclusión', purpose: 'Cerrar y reafirmar la tesis.', length: '100-150 palabras', include: 'Síntesis, hallazgos y reflexión final.', mistakes: 'Repetir literal la introducción.' }
    ],
    monografia: [
      { key: 'introduccion', title: 'Introducción', purpose: 'Ubicar el tema y su relevancia.', length: '200-300 palabras', include: 'Tema, problema, objetivos y estructura.', mistakes: 'Omitir el propósito del trabajo.' },
      { key: 'marco', title: 'Marco teórico', purpose: 'Sostener el análisis con autores.', length: '400-600 palabras', include: 'Conceptos, teorías, antecedentes y citas.', mistakes: 'Copiar definiciones sin relacionarlas.' },
      { key: 'desarrollo', title: 'Desarrollo', purpose: 'Exponer el análisis central.', length: '600-900 palabras', include: 'Comparaciones, análisis crítico y evidencias.', mistakes: 'Desordenar los subtemas.' },
      { key: 'conclusion', title: 'Conclusión', purpose: 'Presentar cierre argumentado.', length: '150-250 palabras', include: 'Síntesis, aportes y proyecciones.', mistakes: 'Incluir información nueva sin analizar.' }
    ],
    informe: [
      { key: 'objetivos', title: 'Objetivos', purpose: 'Definir qué se buscó.', length: '40-80 palabras', include: 'Objetivo general y específicos.', mistakes: 'Redactarlos de forma ambigua.' },
      { key: 'metodologia', title: 'Metodología', purpose: 'Explicar cómo se trabajó.', length: '200-300 palabras', include: 'Materiales, procedimientos y criterios.', mistakes: 'Dejar pasos sin explicar.' },
      { key: 'resultados', title: 'Resultados', purpose: 'Mostrar lo obtenido.', length: '200-350 palabras', include: 'Datos, tablas, gráficos y observaciones.', mistakes: 'Interpretar demasiado pronto.' },
      { key: 'discusion', title: 'Discusión', purpose: 'Interpretar los hallazgos.', length: '250-400 palabras', include: 'Relación con objetivos y teoría.', mistakes: 'No conectar datos con el propósito.' }
    ],
    investigacion: [
      { key: 'introduccion', title: 'Introducción', purpose: 'Plantear el foco del estudio.', length: '150-250 palabras', include: 'Tema, contexto y dirección general.', mistakes: 'Empezar sin problema claro.' },
      { key: 'marco', title: 'Marco teórico', purpose: 'Sustentar la investigación.', length: '350-500 palabras', include: 'Autores, teorías y antecedentes.', mistakes: 'Acumular citas sin análisis.' },
      { key: 'metodologia', title: 'Metodología', purpose: 'Explicar diseño y método.', length: '200-300 palabras', include: 'Población, instrumentos y procedimiento.', mistakes: 'Omitir criterios de selección.' },
      { key: 'resultados', title: 'Resultados', purpose: 'Presentar evidencias.', length: '200-350 palabras', include: 'Hallazgos organizados.', mistakes: 'Mezclar resultados con discusión.' },
      { key: 'discusion', title: 'Discusión', purpose: 'Analizar el sentido de los datos.', length: '250-400 palabras', include: 'Interpretación, comparación y alcance.', mistakes: 'No responder al problema.' },
      { key: 'conclusion', title: 'Conclusión', purpose: 'Cerrar con aporte académico.', length: '100-150 palabras', include: 'Conclusiones, límites y proyección.', mistakes: 'Repetir el desarrollo.' }
    ],
    anteproyecto: [
      { key: 'objetivo', title: 'Objetivo general', purpose: 'Definir la meta central.', length: '40-80 palabras', include: 'Verbo en infinitivo, alcance y resultado esperado.', mistakes: 'Usar verbos poco medibles.' },
      { key: 'justificacion', title: 'Justificación', purpose: 'Explicar por qué vale la pena.', length: '120-200 palabras', include: 'Relevancia, impacto y beneficio.', mistakes: 'Hablar solo de interés personal.' },
      { key: 'conclusion', title: 'Conclusiones esperadas', purpose: 'Anticipar el cierre del proyecto.', length: '80-120 palabras', include: 'Resultados esperados y alcance.', mistakes: 'Prometer más de lo viable.' }
    ]
  };

  const workTypeOptions = [
    ['ensayo', 'Ensayo'],
    ['monografia', 'Monografía'],
    ['informe', 'Informe de laboratorio'],
    ['investigacion', 'Trabajo de investigación'],
    ['anteproyecto', 'Anteproyecto']
  ];

  const savedType = loadStoredString('redactor_work_type', 'ensayo');

  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div id="redactor-shell" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div id="redactor-side-panels" class="lg:col-span-4 space-y-4">
          <div class="dp-card p-4">
            <label class="dp-label mb-2 block">Tipo de trabajo</label>
            <select id="work-type-select" aria-label="Tipo de trabajo" class="dp-select">
              ${workTypeOptions.map(([value, label]) => `<option value="${value}" ${value === savedType ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
          </div>

          <div class="dp-accordion">
            <button class="dp-accordion-btn accordion-btn-red" data-accordion-red="0">
              <span class="flex items-center gap-2 font-semibold">${docproIconHtml('review', 'Guía de estructura', 'docpro-icon docpro-icon--sm')}<span>Guía de estructura</span></span>
              <span class="dp-chevron accordion-chevron-red open text-xl">▼</span>
            </button>
            <div class="dp-accordion-body accordion-content-red open max-h-[26rem] overflow-y-auto p-4 text-sm text-[var(--dp-text-secondary)]">
              <div id="structure-guide-content" class="space-y-3"></div>
            </div>
          </div>

          <div class="dp-accordion">
            <button class="dp-accordion-btn accordion-btn-red" data-accordion-red="1">
              <span class="flex items-center gap-2 font-semibold">${docproIconHtml('ideas', 'Conectores académicos', 'docpro-icon docpro-icon--sm')}<span>Conectores académicos</span></span>
              <span class="dp-chevron accordion-chevron-red text-xl">▼</span>
            </button>
            <div class="dp-accordion-body accordion-content-red p-4 text-sm">
              <div id="connectors-content" class="space-y-3"></div>
            </div>
          </div>
        </div>

        <div id="redactor-editor-panel" class="lg:col-span-8">
          <div class="dp-card p-8 space-y-6">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="flex items-center gap-3 text-2xl font-bold">
                  ${docproIconHtml('redactor', 'Redactor asistido', 'docpro-icon docpro-icon--lg')}<span>Redactor asistido</span>
                </h2>
                <p id="redactor-recommendation" class="mt-1 text-xs text-[var(--dp-text-muted)]"></p>
              </div>
              <button id="focus-mode-btn" class="dp-btn dp-btn-ghost dp-btn-sm" title="Modo Enfoque">Modo Enfoque</button>
            </div>

            <textarea id="redactor-main" rows="20" placeholder="Redacta aquí tu contenido..." aria-label="Contenido principal de redacción" class="dp-textarea dp-mono resize-none"></textarea>

            <div id="section-warning-list" class="space-y-2"></div>

            <div id="redactor-metrics" class="dp-grid-auto rounded-xl bg-[var(--dp-surface-2)] p-4">
              <div class="text-center dp-stat p-4">
                <p id="word-count" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0</p>
                <p class="text-xs text-[var(--dp-text-muted)]">Palabras</p>
              </div>
              <div class="text-center dp-stat p-4">
                <p id="para-count" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0</p>
                <p class="text-xs text-[var(--dp-text-muted)]">Párrafos</p>
              </div>
              <div class="text-center dp-stat p-4">
                <p id="char-count" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0</p>
                <p class="text-xs text-[var(--dp-text-muted)]">Caracteres</p>
              </div>
            </div>

            <button id="save-redactor-btn" class="dp-btn dp-btn-primary w-full">
              Guardar redacción
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const sidePanels = document.getElementById('redactor-side-panels');
  const editorPanel = document.getElementById('redactor-editor-panel');
  const savedContent = safeStorageGet('redactor_content', '');
  const textarea = document.getElementById('redactor-main');
  const recommendation = document.getElementById('redactor-recommendation');
  const warningList = document.getElementById('section-warning-list');
  const workTypeSelect = document.getElementById('work-type-select');
  const redactorMetrics = document.getElementById('redactor-metrics');
  textarea.value = savedContent;

  function getActiveSections() {
    return workTypeGuides[workTypeSelect.value] || [];
  }

  function renderGuide() {
    const sections = getActiveSections();
    const guide = document.getElementById('structure-guide-content');
    const text = textarea.value || '';
    const normalizedText = normalizeSpanishText(text);
    const totalWords = countWords(text);
    recommendation.textContent = sections.map(section => SECTION_RECOMMENDATIONS[section.key] || section.length).join(' • ');

    guide.innerHTML = sections.map(section => {
      const hasHeading = normalizedText.includes(normalizeSpanishText(section.title));
      const minWords = parseInt(section.length.match(/\d+/)?.[0] || '0', 10);
      const isReady = hasHeading && totalWords >= minWords;

      return `
      <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <p class="font-bold text-blue-900">${section.title}</p>
            <p class="text-[11px] text-blue-700 font-semibold mt-1">${section.length}</p>
          </div>
          <span class="shrink-0">${docproIconHtml(isReady ? 'validation' : 'review', isReady ? 'Sección validada' : 'Sección pendiente', 'docpro-icon docpro-icon--sm')}</span>
        </div>
        <p class="text-xs text-slate-700 mb-2"><strong>Propósito:</strong> ${section.purpose}</p>
        <p class="text-xs text-slate-700 mb-2"><strong>Qué incluir:</strong> ${section.include}</p>
        <p class="text-xs text-slate-700"><strong>Evita:</strong> ${section.mistakes}</p>
      </div>
      `;
    }).join('');
  }

  function renderConnectors() {
    const container = document.getElementById('connectors-content');
    container.innerHTML = Object.entries(connectors).map(([group, words]) => `
      <div>
        <p class="font-semibold text-purple-700 text-xs mb-2 capitalize">${group.replace('_', ' y ')}:</p>
        <div class="flex flex-wrap gap-2">
          ${words.map(word => `
            <button class="bg-purple-100 text-purple-900 px-2.5 py-1 rounded text-xs hover:bg-purple-200 transition-colors copy-connector" data-text="${escapeHtml(word)}">
              ${escapeHtml(word)}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderWarnings() {
    const text = textarea.value || '';
    const normalizedText = normalizeSpanishText(text);
    const totalWords = countWords(text);
    const sections = getActiveSections();

    warningList.innerHTML = sections.map(section => {
      const hasHeading = normalizedText.includes(normalizeSpanishText(section.title));
      const minWords = parseInt(section.length.match(/\d+/)?.[0] || '0', 10);
      const isReady = hasHeading && totalWords >= minWords;
      const warningClass = isReady ? 'border-green-200 bg-green-50 text-green-800' : 'border-yellow-200 bg-yellow-50 text-yellow-800';
      const warningIcon = isReady
        ? docproIconHtml('validation', 'Sección validada', 'docpro-icon docpro-icon--sm')
        : docproIconHtml('review', 'Sección pendiente', 'docpro-icon docpro-icon--sm');

      return `
        <div class="flex items-start gap-3 rounded-lg border px-4 py-3 ${warningClass}">
          <span class="mt-0.5 shrink-0">${warningIcon}</span>
          <div class="min-w-0">
            <p class="font-bold text-sm">${section.title}</p>
            <p class="text-xs mt-1">${isReady ? 'Sección dentro del rango recomendado.' : `Faltan contenido o encabezado. Meta: ${section.length}.`}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateCounters() {
    const text = textarea.value;
    const words = countWords(text);
    const chars = text.length;
    const paras = countParagraphs(text);

    document.getElementById('word-count').textContent = words;
    document.getElementById('char-count').textContent = chars;
    document.getElementById('para-count').textContent = paras;

    saveField('redactor_content', text);
    renderWarnings();
  }

  function syncFocusMode(enable) {
    state.focusMode = enable;
    sidePanels.classList.toggle('hidden', enable);
    editorPanel.classList.toggle('lg:col-span-8', !enable);
    editorPanel.classList.toggle('lg:col-span-12', enable);
    redactorMetrics.classList.toggle('hidden', enable);
    warningList.classList.toggle('hidden', enable);
    recommendation.classList.toggle('hidden', enable);
    document.getElementById('focus-mode-btn').textContent = enable ? 'Vista completa' : 'Modo Enfoque';
  }

  renderGuide();
  renderConnectors();
  updateCounters();
  syncFocusMode(false);

  textarea.addEventListener('input', updateCounters);
  workTypeSelect.addEventListener('change', () => {
    safeStorageSet('redactor_work_type', workTypeSelect.value);
    renderGuide();
    renderWarnings();
  });

  document.getElementById('save-redactor-btn').addEventListener('click', () => {
    saveField('redactor_content', textarea.value);
    const btn = document.getElementById('save-redactor-btn');
    btn.textContent = 'Guardado';
    setTimeout(() => {
      btn.textContent = 'Guardar redacción';
    }, 2000);
  });

  document.getElementById('focus-mode-btn').addEventListener('click', () => {
    syncFocusMode(!state.focusMode);
  });

  document.querySelectorAll('.copy-connector').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.text || '';
      await writeClipboardText(text);
      const previous = btn.textContent;
      btn.textContent = 'Copiado';
      setTimeout(() => {
        btn.textContent = previous;
      }, 1200);
    });
  });

  document.querySelectorAll('.accordion-btn-red').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.accordionRed, 10);
      document.querySelectorAll('.accordion-btn-red').forEach((currentButton, buttonIndex) => {
        const content = currentButton.nextElementSibling;
        const chevron = currentButton.querySelector('.accordion-chevron-red');
        if (buttonIndex === idx) {
          content.classList.toggle('open');
          chevron.classList.toggle('open');
        } else {
          content.classList.remove('open');
          chevron.classList.remove('open');
        }
      });
    });
  });
}
