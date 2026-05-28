// ═══════════════════════════════════════════════════════════════════════
// REDACTOR.JS - Editor de Contenido Premium con Guías y Métricas
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

  const savedType = localStorage.getItem('redactor_work_type') || 'ensayo';

  const html = `
    <div id="redactor-shell" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div id="redactor-side-panels" class="lg:col-span-4 space-y-4">
        <div class="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-md">
          <label class="text-sm font-bold text-blue-900 mb-2 block">Tipo de trabajo</label>
          <select id="work-type-select" class="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            ${workTypeOptions.map(([value, label]) => `<option value="${value}" ${value === savedType ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>

        <div class="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-md">
          <button class="accordion-btn-red w-full flex justify-between items-center p-4 hover:bg-blue-50 transition-colors border-b border-blue-200" data-accordion-red="0">
            <span class="font-semibold text-blue-900">📋 Guía de estructura</span>
            <span class="accordion-chevron-red open text-xl">▼</span>
          </button>
          <div class="accordion-content-red open p-4 text-gray-700 text-sm space-y-3 max-h-[26rem] overflow-y-auto">
            <div id="structure-guide-content" class="space-y-3"></div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-purple-200 overflow-hidden shadow-md">
          <button class="accordion-btn-red w-full flex justify-between items-center p-4 hover:bg-purple-50 transition-colors border-b border-purple-200" data-accordion-red="1">
            <span class="font-semibold text-purple-900">🔗 Conectores académicos</span>
            <span class="accordion-chevron-red text-xl">▼</span>
          </button>
          <div class="accordion-content-red p-4 text-sm space-y-3">
            <div id="connectors-content" class="space-y-3"></div>
          </div>
        </div>
      </div>

      <div id="redactor-editor-panel" class="lg:col-span-8">
        <div class="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 space-y-6">
          <div class="flex justify-between items-center gap-3">
            <div>
              <h2 class="text-2xl font-bold text-blue-900 flex items-center gap-3">
                <span>✍️</span> Redactor Premium
              </h2>
              <p id="redactor-recommendation" class="text-xs text-slate-500 mt-1"></p>
            </div>
            <button id="focus-mode-btn" class="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors" title="Modo Enfoque">🎯 Modo Enfoque</button>
          </div>

          <textarea id="redactor-main" rows="20" placeholder="Redacta aquí tu contenido..." class="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none font-mono text-sm"></textarea>

          <div id="section-warning-list" class="space-y-2"></div>

          <div id="redactor-metrics" class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-blue-50 rounded-lg p-4">
            <div class="text-center">
              <p id="word-count" class="text-2xl font-bold text-blue-600">0</p>
              <p class="text-xs text-gray-600">Palabras</p>
            </div>
            <div class="text-center">
              <p id="para-count" class="text-2xl font-bold text-blue-600">0</p>
              <p class="text-xs text-gray-600">Párrafos</p>
            </div>
            <div class="text-center">
              <p id="char-count" class="text-2xl font-bold text-blue-600">0</p>
              <p class="text-xs text-gray-600">Caracteres</p>
            </div>
          </div>

          <button id="save-redactor-btn" class="w-full bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition-colors shadow-lg">
            💾 Guardar Redacción
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const shell = document.getElementById('redactor-shell');
  const sidePanels = document.getElementById('redactor-side-panels');
  const editorPanel = document.getElementById('redactor-editor-panel');
  const savedContent = localStorage.getItem('redactor_content') || '';
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
    recommendation.textContent = sections.map(section => SECTION_RECOMMENDATIONS[section.key] || section.length).join(' • ');

    guide.innerHTML = sections.map(section => `
      <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <p class="font-bold text-blue-900">${section.title}</p>
            <p class="text-[11px] text-blue-700 font-semibold mt-1">${section.length}</p>
          </div>
          <span class="text-yellow-500 text-sm font-bold">⚠️</span>
        </div>
        <p class="text-xs text-slate-700 mb-2"><strong>Propósito:</strong> ${section.purpose}</p>
        <p class="text-xs text-slate-700 mb-2"><strong>Qué incluir:</strong> ${section.include}</p>
        <p class="text-xs text-slate-700"><strong>Evita:</strong> ${section.mistakes}</p>
      </div>
    `).join('');
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
      const warningIcon = isReady ? '✅' : '⚠️';

      return `
        <div class="flex items-start gap-3 rounded-lg border px-4 py-3 ${warningClass}">
          <span class="mt-0.5">${warningIcon}</span>
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

    try {
      saveField('redactor_content', text);
    } catch (err) {
      console.error('Failed saving redactor content', err);
    }
    saveJSON('redactor_work_type', workTypeSelect.value);
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
    document.getElementById('focus-mode-btn').textContent = enable ? '↩️ Vista completa' : '🎯 Modo Enfoque';
  }

  renderGuide();
  renderConnectors();
  updateCounters();
  syncFocusMode(false);

  textarea.addEventListener('input', updateCounters);
  workTypeSelect.addEventListener('change', () => {
    saveJSON('redactor_work_type', workTypeSelect.value);
    renderGuide();
    renderWarnings();
  });

  document.getElementById('save-redactor-btn').addEventListener('click', () => {
    try {
      saveField('redactor_content', textarea.value);
    } catch (err) {
      console.error('Failed saving redactor content', err);
    }
    const btn = document.getElementById('save-redactor-btn');
    btn.textContent = '✅ Guardado';
    setTimeout(() => {
      btn.textContent = '💾 Guardar Redacción';
    }, 2000);
  });

  document.getElementById('focus-mode-btn').addEventListener('click', () => {
    syncFocusMode(!state.focusMode);
  });

  document.querySelectorAll('.copy-connector').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.text || '';
      await navigator.clipboard.writeText(text);
      const previous = btn.textContent;
      btn.textContent = '✓';
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
