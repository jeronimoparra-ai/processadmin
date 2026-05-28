// ═══════════════════════════════════════════════════════════════════════
// PANEL.JS - Panel de Control y Visualización de Métricas
// ═══════════════════════════════════════════════════════════════════════

function buildPanel() {
  const metrics = calculateQualityMetrics();
  const motivationalMsg = getMotivationalMessage(metrics.overall);
  const pendingItems = buildPendingItems(metrics);
  const deliveryDateValue = getDeliveryDateValue();
  const deliveryDate = getDeliveryDate();
  const deliveryDateInputValue = deliveryDateValue ? deliveryDateValue.slice(0, 10) : '';
  const deliveryDateLabel = deliveryDate
    ? deliveryDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
    : 'Sin fecha';
  const deliveryDateWarning = deliveryDate ? '' : 'Debes ingresar una fecha de entrega';
  const formatProfile = state.exportFormatProfile;
  const formatLabel = formatProfile?.name || 'Sin formato cargado';
  const formatDetail = formatProfile?.description || 'Carga una plantilla Word .docx opcional para reutilizarla al exportar.';
  const structureStorageKey = 'ws_document_structure_parts';
  const structureOpenStorageKey = 'ws_document_structure_open';
  const isStructureOpen = loadJSON(structureOpenStorageKey, false);
  const structureToggleLabel = isStructureOpen ? 'Ocultar tabla' : 'Ver tabla';
  const structureStatusLabel = isStructureOpen ? 'Tabla desplegada' : 'Tabla recogida';
  const defaultStructureParts = [
    'Portada profesional',
    'Introducción',
    'Planteamiento del problema',
    'Objetivos',
    'Desarrollo',
    'Análisis / discusión',
    'Conclusiones',
    'Referencias APA 7'
  ].map((text, index) => ({
    id: `structure-${index + 1}`,
    text,
    checked: false
  }));
  const structureItems = loadJSON(structureStorageKey, defaultStructureParts);

  function persistStructure(nextItems = structureItems) {
    saveJSON(structureStorageKey, nextItems);
    updateSectionProgress(nextItems);
  }

  function setStructureOpen(open) {
    saveJSON(structureOpenStorageKey, open);
    const table = document.getElementById('structure-table');
    const toggle = document.getElementById('structure-toggle');
    const status = document.getElementById('structure-status');

    if (table) table.classList.toggle('hidden', !open);
    if (toggle) toggle.textContent = open ? 'Ocultar tabla' : 'Ver tabla';
    if (status) status.textContent = open ? 'Tabla desplegada' : 'Tabla recogida';
  }

  function renderStructureItems() {
    const container = document.getElementById('structure-table');
    const count = document.getElementById('structure-count');
    if (!container) return;

    if (count) count.textContent = `${structureItems.length}`;

    container.innerHTML = structureItems.length > 0
      ? structureItems.map(item => `
        <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-4 rounded-xl border border-slate-200 bg-slate-50">
          <input type="checkbox" class="structure-item-check w-5 h-5 accent-blue-600 cursor-pointer" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
          <input type="text" class="structure-item-text w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" data-id="${item.id}" value="${escapeHtml(item.text)}">
          <button type="button" class="structure-item-delete rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" data-id="${item.id}">Eliminar</button>
        </div>
      `).join('')
      : '<p class="text-sm text-slate-500 italic">Todavía no has agregado partes al documento.</p>';

    container.querySelectorAll('.structure-item-check').forEach(input => {
      input.addEventListener('change', () => {
        const item = structureItems.find(entry => entry.id === input.dataset.id);
        if (!item) return;
        item.checked = input.checked;
        persistStructure();
      });
    });

    container.querySelectorAll('.structure-item-text').forEach(input => {
      input.addEventListener('input', () => {
        const item = structureItems.find(entry => entry.id === input.dataset.id);
        if (!item) return;
        item.text = input.value;
        persistStructure();
      });
    });

    container.querySelectorAll('.structure-item-delete').forEach(button => {
      button.addEventListener('click', () => {
        const nextItems = structureItems.filter(entry => entry.id !== button.dataset.id);
        structureItems.splice(0, structureItems.length, ...nextItems);
        persistStructure(structureItems);
        renderStructureItems();
        if (structureItems.length === 0) setStructureOpen(false);
      });
    });
  }

  const html = `
    <div class="space-y-8 max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="relative">
          <h1 class="text-5xl font-black mb-3">📝 Redacta, organiza y exporta en APA 7</h1>
          <p class="text-lg text-blue-100 leading-relaxed max-w-2xl">
            Diseña trabajos académicos claros y consistentes con redacción guiada, organización de ideas, referencias APA 7 y exportación profesional a Word.
          </p>
        </div>
      </div>

      <!-- Quality Dashboard -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <span>📊</span> Indicadores de calidad
        </h2>
        <p class="text-gray-600 text-sm mb-8">Seguimiento claro del avance en estructura, APA 7, criterios y formato Word</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-blue-900 text-sm">📋 Estructura</h3>
              <span class="text-2xl font-bold text-blue-600">${metrics.structure}%</span>
            </div>
            <div class="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-600 rounded-full transition-all" style="width: ${metrics.structure}%"></div>
            </div>
            <p class="text-xs text-blue-700 mt-2">Documento completado</p>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-purple-900 text-sm">📐 Normas APA 7</h3>
              <span class="text-2xl font-bold text-purple-600">${metrics.apa}%</span>
            </div>
            <div class="h-2 bg-purple-200 rounded-full overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full transition-all" style="width: ${metrics.apa}%"></div>
            </div>
            <p class="text-xs text-purple-700 mt-2">Cumplimiento de normas</p>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-green-900 text-sm">✅ Criterios Docente</h3>
              <span class="text-2xl font-bold text-green-600">${metrics.criteria}%</span>
            </div>
            <div class="h-2 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-600 rounded-full transition-all" style="width: ${metrics.criteria}%"></div>
            </div>
            <p class="text-xs text-green-700 mt-2">Criterios completados</p>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-orange-900 text-sm">📄 Formato Word</h3>
              <span class="text-2xl font-bold text-orange-600">${metrics.wordFormat}%</span>
            </div>
            <div class="h-2 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-orange-600 rounded-full transition-all" style="width: ${metrics.wordFormat}%"></div>
            </div>
            <p class="text-xs text-orange-700 mt-2">Listo para exportar</p>
          </div>
        </div>

        <!-- Overall Readiness -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">🎯 Preparación general</h3>
            <span class="text-5xl font-black text-blue-300">${metrics.overall}%</span>
          </div>
          <p class="text-lg text-slate-100 mb-4">${motivationalMsg}</p>
          <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style="width: ${metrics.overall}%"></div>
          </div>
        </div>

        <div class="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <h3 class="text-xl font-bold text-slate-900 mb-4">🧭 Pendientes prioritarios</h3>
          <div class="space-y-2">
            ${pendingItems.length > 0 ? pendingItems.map(item => `
              <button class="w-full text-left bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-amber-50 transition-colors pending-nav" data-view="${item.view}">
                ${item.label}
              </button>
            `).join('') : '<p class="text-sm text-emerald-700 font-semibold">No tienes pendientes críticos en este momento.</p>'}
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl border-2 border-blue-100 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-blue-600 text-4xl mb-3">⏰</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Fecha de entrega</p>
          <p id="delivery-date-label" class="text-3xl font-bold text-blue-900 mb-1">${deliveryDateLabel}</p>
          <label class="block text-xs font-semibold text-slate-500 mb-2" for="delivery-date-input">Modificar fecha</label>
          <input id="delivery-date-input" type="date" value="${deliveryDateInputValue}" class="w-full max-w-[220px] border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          <p id="delivery-date-sync-badge" class="mt-2 inline-flex items-center rounded-full ${deliveryDate ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'} px-3 py-1 text-[11px] font-semibold border">${deliveryDate ? 'Sincronizado con checklist y exportación' : 'Opcional: puedes agregar una fecha de entrega'}</p>
          <p id="countdown" class="text-sm text-blue-600 font-semibold">Calculando...</p>
        </div>

        <div class="group bg-white rounded-2xl border-2 border-purple-100 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-purple-600 text-4xl mb-3">📊</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Meta de calificación</p>
          <p class="text-3xl font-bold text-purple-900 mb-1">100 pts</p>
          <p class="text-sm text-slate-500">Referencia de evaluación</p>
        </div>

        <div class="group sm:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-emerald-600 text-4xl mb-3">📈</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Progreso general</p>
          <p id="overall-progress-percent" class="text-3xl font-bold text-emerald-900 mb-2">${metrics.overall}%</p>
          <div class="h-2.5 bg-emerald-200 rounded-full overflow-hidden">
            <div id="overall-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style="width: ${metrics.overall}%"></div>
          </div>
        </div>
      </div>

      <!-- Getting Started Guide -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span class="text-3xl">🎯</span> Guía de inicio
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div class="quick-start-card relative p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 hover:shadow-lg transition-all cursor-pointer" data-view="organizador">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h3 class="text-lg font-bold text-blue-900 mb-3">Organiza tu tema</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Usa el <strong>Organizador de Ideas</strong> para definir tema, problema, preguntas y objetivos.
            </p>
          </div>

          <div class="quick-start-card relative p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 hover:shadow-lg transition-all cursor-pointer" data-view="redactor">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
            <h3 class="text-lg font-bold text-purple-900 mb-3">Redacta con apoyo</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Usa el <strong>Redactor</strong> con contador de palabras y sugerencias de conectores académicos.
            </p>
          </div>

          <div class="quick-start-card relative p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border-l-4 border-pink-600 hover:shadow-lg transition-all cursor-pointer" data-view="exportar">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">3</div>
            <h3 class="text-lg font-bold text-pink-900 mb-3">Exporta a Word</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Genera un <strong>documento Word profesional</strong> con portada, índice y formato APA 7 automático.
            </p>
          </div>

          <div class="quick-start-card relative p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-slate-600 hover:shadow-lg transition-all cursor-pointer" data-view="historial">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">4</div>
            <h3 class="text-lg font-bold text-slate-900 mb-3">Consulta guardados</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Revisa documentos guardados, vuelve a exportarlos o elimínalos cuando ya no los necesites.
            </p>
          </div>
        </div>
      </div>

      <!-- Document Structure Requirements -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <span class="text-3xl">📋</span> Estructura de tu Documento
            </h2>
            <p id="structure-status" class="text-sm text-slate-500 mt-2">${structureStatusLabel}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button id="structure-toggle" type="button" class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">${structureToggleLabel}</button>
            <button id="structure-add-btn" type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">+ Agregar parte</button>
          </div>
        </div>
        <div id="structure-table" class="mb-8 space-y-4 ${isStructureOpen ? '' : 'hidden'}"></div>
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">📊</span>
            <p class="font-bold text-slate-900">Tu Progreso de Completitud</p>
          </div>
          <div class="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div id="section-progress" class="h-full bg-gradient-to-r from-blue-600 to-purple-600 w-0 transition-all duration-500 rounded-full"></div>
          </div>
          <p class="text-sm text-slate-600 font-semibold"><span id="section-count">0</span> partes configuradas</p>
        </div>
      </div>

      <!-- Section Progress Overview -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span class="text-3xl">🔍</span> Avance por Sección
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-blue-900">📋 Planeación</h3>
              <span id="planeacion-status" class="text-2xl font-bold text-blue-600">0%</span>
            </div>
            <div class="h-3 bg-blue-200 rounded-full overflow-hidden">
              <div id="planeacion-bar" class="h-full bg-gradient-to-r from-blue-500 to-blue-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 250+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-purple-900">🏗️ Organización</h3>
              <span id="organizacion-status" class="text-2xl font-bold text-purple-600">0%</span>
            </div>
            <div class="h-3 bg-purple-200 rounded-full overflow-hidden">
              <div id="organizacion-bar" class="h-full bg-gradient-to-r from-purple-500 to-purple-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-orange-900">🧭 Dirección</h3>
              <span id="direccion-status" class="text-2xl font-bold text-orange-600">0%</span>
            </div>
            <div class="h-3 bg-orange-200 rounded-full overflow-hidden">
              <div id="direccion-bar" class="h-full bg-gradient-to-r from-orange-500 to-orange-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-red-900">📊 Control</h3>
              <span id="control-status" class="text-2xl font-bold text-red-600">0%</span>
            </div>
            <div class="h-3 bg-red-200 rounded-full overflow-hidden">
              <div id="control-bar" class="h-full bg-gradient-to-r from-red-500 to-red-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-10 text-white">
        <h2 class="text-3xl font-bold mb-8">📈 Estadísticas del Proyecto</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-4xl font-black text-blue-400 mb-2" id="stat-content-words">0</div>
            <p class="text-slate-300 font-medium">Palabras Redactadas</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-purple-400 mb-2" id="stat-work-time">0 min</div>
            <p class="text-slate-300 font-medium">Tiempo de Trabajo</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-green-400 mb-2" id="stat-citations">0</div>
            <p class="text-slate-300 font-medium">Referencias APA</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-pink-400 mb-2" id="stat-simulations">0</div>
            <p class="text-slate-300 font-medium">Evaluaciones</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  document.querySelectorAll('.pending-nav').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });
  document.querySelectorAll('.quick-start-card').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.view));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigate(card.dataset.view);
      }
    });
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
  });

  const deliveryDateInput = document.getElementById('delivery-date-input');
  const deliveryDateLabelEl = document.getElementById('delivery-date-label');
  const deliveryDateSyncBadge = document.getElementById('delivery-date-sync-badge');
  const panelLoadFormatInput = document.getElementById('panel-load-format-input');
  const panelLoadFormatButton = document.getElementById('panel-load-format-btn');
  const panelClearFormatButton = document.getElementById('panel-clear-format-btn');
  const panelOpenExportButton = document.getElementById('panel-open-export-btn');

  if (panelOpenExportButton) {
    panelOpenExportButton.addEventListener('click', () => navigate('exportador'));
  }

  if (panelLoadFormatButton && panelLoadFormatInput) {
    panelLoadFormatButton.addEventListener('click', () => panelLoadFormatInput.click());
    panelLoadFormatInput.addEventListener('change', async () => {
      const file = panelLoadFormatInput.files?.[0];
      if (!file) return;

      try {
        const isDocx = /\.docx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        let normalized = null;

        if (isDocx) {
          const dataUrl = await readFileAsDataUrl(file);
          normalized = saveExportFormatProfile({
            kind: 'word-template',
            name: file.name.replace(/\.docx$/i, ''),
            description: 'Plantilla Word cargada desde un documento DOCX',
            fileName: file.name,
            templateDataUrl: dataUrl
          });
        } else {
          const raw = await file.text();
          const parsed = JSON.parse(raw);
          const candidate = parsed.profile || parsed.formato || parsed;
          normalized = saveExportFormatProfile({
            ...candidate,
            kind: 'legacy-json',
            name: candidate.name || file.name.replace(/\.json$/i, ''),
            description: candidate.description || 'Formato personalizado cargado desde el panel'
          });
        }

        if (normalized) navigate('exportador');
      } catch (err) {
        alert('No se pudo cargar el formato. Verifica que sea una plantilla Word .docx válida o un JSON compatible.');
      } finally {
        panelLoadFormatInput.value = '';
      }
    });
  }

  if (panelClearFormatButton) {
    panelClearFormatButton.addEventListener('click', () => {
      clearExportFormatProfile();
      navigate('panel');
    });
  }

  if (deliveryDateInput) {
    deliveryDateInput.addEventListener('change', () => {
      const normalizedValue = normalizeDeliveryDateInput(deliveryDateInput.value);
      if (!normalizedValue) {
        setDeliveryDateValue('');
        if (deliveryDateLabelEl) deliveryDateLabelEl.textContent = 'Sin fecha';
        if (deliveryDateSyncBadge) {
          deliveryDateSyncBadge.textContent = 'Debes ingresar una fecha de entrega';
          deliveryDateSyncBadge.className = 'mt-2 inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 border border-red-200';
        }
        if (typeof updateCountdown === 'function') updateCountdown();
        return;
      }
      setDeliveryDateValue(normalizedValue);
      if (deliveryDateLabelEl) {
        const updatedDate = getDeliveryDate();
        deliveryDateLabelEl.textContent = updatedDate ? updatedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Sin fecha';
      }
      if (deliveryDateSyncBadge) {
        deliveryDateSyncBadge.textContent = 'Fecha actualizada y sincronizada';
        deliveryDateSyncBadge.className = 'mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200';
      }
      if (typeof updateCountdown === 'function') updateCountdown();
      if (typeof updateSectionCompleteness === 'function') updateSectionCompleteness();
    });
  }
  startCountdown();

  const structureTable = document.getElementById('structure-table');
  const structureToggle = document.getElementById('structure-toggle');
  const structureAddBtn = document.getElementById('structure-add-btn');
  const structureStatus = document.getElementById('structure-status');

  if (structureToggle) {
    structureToggle.addEventListener('click', () => {
      setStructureOpen(structureTable.classList.contains('hidden'));
    });
  }

  if (structureAddBtn) {
    structureAddBtn.addEventListener('click', () => {
      structureItems.push({
        id: `structure-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text: `Nueva parte ${structureItems.length + 1}`,
        checked: false
      });
      persistStructure(structureItems);
      renderStructureItems();
      setStructureOpen(true);
      const newestItem = structureItems[structureItems.length - 1];
      setTimeout(() => {
        const lastInput = structureTable.querySelector(`.structure-item-text[data-id="${newestItem.id}"]`);
        if (lastInput) lastInput.focus();
      }, 0);
      if (structureStatus) structureStatus.textContent = 'Tabla desplegada y lista para editar';
    });
  }

  setStructureOpen(isStructureOpen);

  // Restore checklist
  const checks = loadJSON('ws_checklist_main', Array(12).fill(false));

  renderStructureItems();
  updateSectionProgress(structureItems);
  updateSectionCompleteness();
}

function updateSectionProgress(checks) {
  const items = Array.isArray(checks) ? checks : [];
  const count = items.filter(item => (typeof item === 'boolean' ? item : item?.checked)).length;
  const total = items.length;
  const percent = total > 0 ? (count / total) * 100 : 0;

  const bar = document.getElementById('section-progress');
  const counter = document.getElementById('section-count');

  if (bar) bar.style.width = percent + '%';
  if (counter) counter.textContent = `${count}/${total}`;
}

function updateSectionCompleteness() {
  const fields = {
    planeacion: safeStorageGet('ws_planeacion', ''),
    organizacion: safeStorageGet('ws_organizacion', ''),
    direccion: safeStorageGet('ws_direccion', ''),
    control: safeStorageGet('ws_control', '')
  };

  const targetWords = { planeacion: 250, organizacion: 150, direccion: 150, control: 150 };
  let totalPercent = 0;
  let totalWords = 0;

  Object.keys(fields).forEach(key => {
    const wordCount = fields[key].trim().split(/\s+/).filter(w => w.length > 0).length;
    totalWords += wordCount;
    const percent = Math.min((wordCount / targetWords[key]) * 100, 100);
    totalPercent += percent;

    const bar = document.getElementById(`${key}-bar`);
    const status = document.getElementById(`${key}-status`);
    if (bar) bar.style.width = percent + '%';
    if (status) status.textContent = Math.round(percent) + '%';
  });

  const overallPercent = Math.round(totalPercent / 4);
  const overallBar = document.getElementById('overall-progress-bar');
  const overallText = document.getElementById('overall-progress-percent');
  if (overallBar) overallBar.style.width = overallPercent + '%';
  if (overallText) overallText.textContent = overallPercent + '%';

  const statWords = document.getElementById('stat-content-words');
  if (statWords) statWords.textContent = totalWords;

  const workStartRaw = safeStorageGet('ws_work_start', '');
  const parsedWorkStart = parseInt(workStartRaw, 10);
  const workStartTime = Number.isFinite(parsedWorkStart) ? new Date(parsedWorkStart) : null;
  const workMinutes = workStartTime ? Math.round((Date.now() - workStartTime.getTime()) / 1000 / 60) : 0;
  const statTime = document.getElementById('stat-work-time');
  if (statTime) statTime.textContent = workMinutes + ' min';

  const statCitations = document.getElementById('stat-citations');
  if (statCitations) statCitations.textContent = state.generatedCitations.length;

  const statSimulations = document.getElementById('stat-simulations');
  if (statSimulations) statSimulations.textContent = state.simulationHistory.length;
}
