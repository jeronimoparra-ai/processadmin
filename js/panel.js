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
  const formatLabel = formatProfile?.name || 'Ningún formato cargado';
  const formatDetail = formatProfile?.description || 'Carga una plantilla Word .docx opcional para reutilizarla al exportar.';
  const structureStorageKey = 'ws_document_structure_parts';
  const structureOpenStorageKey = 'ws_document_structure_open';
  const isStructureOpen = loadJSON(structureOpenStorageKey, false);
  const structureToggleLabel = isStructureOpen ? 'Ocultar tabla' : 'Ver tabla';
  const structureStatusLabel = isStructureOpen ? 'Tabla desplegada' : 'Tabla recogida';
  const defaultStructureParts = [
    'Portada',
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
        <div class="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[var(--dp-border)] bg-[var(--dp-surface-2)] p-4">
          <input type="checkbox" class="structure-item-check h-5 w-5 cursor-pointer accent-[var(--dp-accent)]" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
          <input type="text" class="structure-item-text w-full rounded-lg border border-[var(--dp-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--dp-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--dp-accent)]" data-id="${item.id}" value="${escapeHtml(item.text)}">
          <button type="button" class="structure-item-delete dp-btn dp-btn-ghost dp-btn-sm text-red-600" data-id="${item.id}">Eliminar</button>
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
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <!-- Welcome Section -->
      <div class="dp-card relative overflow-hidden p-12">
        <div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-[rgba(201,169,110,0.12)] -mr-32 -mt-32 blur-3xl"></div>
        <div class="relative">
          <h1 class="mb-3 flex items-center gap-4 text-5xl font-black"><span class="shrink-0">${docproIconHtml('redactor', 'Redacción académica en ProcessAdmin', 'docpro-icon docpro-icon--lg')}</span><span>ProcessAdmin: redacta y organiza trabajos académicos en APA 7</span></h1>
          <p class="max-w-2xl text-lg leading-relaxed text-[var(--dp-text-secondary)]">
            Redacta borradores académicos, organiza ideas, revisa referencias APA 7 y exporta en Word desde el navegador. El contenido se guarda en el dispositivo con localStorage.
          </p>
          <div class="hero-pills mt-6">
            <span class="header-pill header-pill--accent">Guardado local</span>
            <span class="header-pill header-pill--success">Sin servidor</span>
            <span class="header-pill">Actualizado 29 may 2026</span>
          </div>
        </div>
      </div>

      <div class="dp-card p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <h2 class="flex items-center gap-3 text-2xl font-bold">${docproIconHtml('panel', 'Transparencia del proyecto', 'docpro-icon docpro-icon--sm')}<span>Transparencia del proyecto</span></h2>
            <p class="text-sm text-[var(--dp-text-secondary)]">Autoría visible, contacto sugerido y aviso de almacenamiento local para que la interfaz se lea como un producto completo.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="dp-btn dp-btn-ghost project-nav" data-view="legal">Ver privacidad y términos</button>
            <button type="button" class="dp-btn dp-btn-primary project-nav" data-view="exportar">Ir a exportación</button>
          </div>
        </div>
      </div>

      <!-- Quality Dashboard -->
      <div class="dp-card p-10">
        <div class="dp-card-header">
          <h2 class="dp-card-title flex items-center gap-3 text-3xl">
          ${docproIconHtml('panel', 'Indicadores de calidad', 'docpro-icon docpro-icon--lg')} <span>Indicadores de calidad</span>
          </h2>
        </div>
        <p class="mb-8 text-sm text-[var(--dp-text-secondary)]">Seguimiento del avance en estructura, APA 7, criterios y formato Word</p>

        <div class="dp-grid-4 mb-8">
          <div class="dp-stat">
            <div class="flex justify-between items-center mb-2">
              <h3 class="dp-stat-label flex items-center gap-2 text-sm">${docproIconHtml('validation', 'Estructura', 'docpro-icon docpro-icon--sm')}<span>Estructura</span></h3>
              <span class="text-2xl font-bold text-[var(--dp-accent-dark)]">${metrics.structure}%</span>
            </div>
            <div class="dp-progress">
              <div class="dp-progress-fill" style="width: ${metrics.structure}%"></div>
            </div>
            <p class="dp-stat-sub">Documento completado</p>
          </div>

          <div class="dp-stat">
            <div class="flex justify-between items-center mb-2">
              <h3 class="dp-stat-label flex items-center gap-2 text-sm">${docproIconHtml('apa', 'Normas APA 7', 'docpro-icon docpro-icon--sm')}<span>Normas APA 7</span></h3>
              <span class="text-2xl font-bold text-[var(--dp-accent-dark)]">${metrics.apa}%</span>
            </div>
            <div class="dp-progress">
              <div class="dp-progress-fill" style="width: ${metrics.apa}%"></div>
            </div>
            <p class="dp-stat-sub">Cumplimiento de normas</p>
          </div>

          <div class="dp-stat">
            <div class="flex justify-between items-center mb-2">
              <h3 class="dp-stat-label flex items-center gap-2 text-sm">${docproIconHtml('validation', 'Criterios docente', 'docpro-icon docpro-icon--sm')}<span>Criterios Docente</span></h3>
              <span class="text-2xl font-bold text-[var(--dp-accent-dark)]">${metrics.criteria}%</span>
            </div>
            <div class="dp-progress">
              <div class="dp-progress-fill" style="width: ${metrics.criteria}%"></div>
            </div>
            <p class="dp-stat-sub">Criterios completados</p>
          </div>

          <div class="dp-stat">
            <div class="flex justify-between items-center mb-2">
              <h3 class="dp-stat-label flex items-center gap-2 text-sm">${docproIconHtml('exportWord', 'Formato Word', 'docpro-icon docpro-icon--sm')}<span>Formato Word</span></h3>
              <span class="text-2xl font-bold text-[var(--dp-accent-dark)]">${metrics.wordFormat}%</span>
            </div>
            <div class="dp-progress">
              <div class="dp-progress-fill" style="width: ${metrics.wordFormat}%"></div>
            </div>
            <p class="dp-stat-sub">Listo para exportar</p>
          </div>
        </div>

        <!-- Overall Readiness -->
        <div class="dp-card p-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold flex items-center gap-3">${docproIconHtml('achievement', 'Preparación general', 'docpro-icon docpro-icon--lg')}<span>Preparación general</span></h3>
            <span class="text-5xl font-black text-[var(--dp-accent-dark)]">${metrics.overall}%</span>
          </div>
          <p class="mb-4 text-lg text-[var(--dp-text-secondary)]">${motivationalMsg}</p>
          <div class="dp-progress h-3">
            <div class="dp-progress-fill" style="width: ${metrics.overall}%"></div>
          </div>
        </div>

        <div class="dp-card mt-8 p-6">
          <h3 class="mb-4 flex items-center gap-2 text-xl font-bold">${docproIconHtml('review', 'Pendientes prioritarios', 'docpro-icon docpro-icon--sm')}<span>Pendientes prioritarios</span></h3>
          <div class="space-y-2">
            ${pendingItems.length > 0 ? pendingItems.map(item => `
              <button class="dp-btn dp-btn-ghost w-full justify-start pending-nav" data-view="${item.view}">
                ${item.label}
              </button>
            `).join('') : '<p class="text-sm text-emerald-700 font-semibold">No tienes pendientes críticos en este momento.</p>'}
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="dp-grid-4">
        <div class="dp-card p-8">
          <div class="mb-3">${docproIconHtml('review', 'Fecha de entrega', 'docpro-icon docpro-icon--xl')}</div>
          <p class="mb-2 text-sm font-medium text-[var(--dp-text-secondary)]">Fecha de entrega</p>
          <p id="delivery-date-label" class="mb-1 text-3xl font-bold text-[var(--dp-text-primary)]">${deliveryDateLabel}</p>
          <label class="mb-2 block text-xs font-semibold text-[var(--dp-text-muted)]" for="delivery-date-input">Modificar fecha</label>
          <input id="delivery-date-input" type="date" value="${deliveryDateInputValue}" class="dp-input max-w-[220px] text-sm">
          <p id="delivery-date-sync-badge" class="mt-2 inline-flex items-center rounded-full ${deliveryDate ? 'dp-badge dp-badge-info' : 'dp-badge dp-badge-neutral'}">${deliveryDate ? 'Sincronizado con checklist y exportación' : 'Opcional: puedes agregar una fecha de entrega'}</p>
          <p id="countdown" class="text-sm font-semibold text-[var(--dp-accent-dark)]">Calculando...</p>
        </div>

        <div class="dp-card p-8">
          <div class="mb-3">${docproIconHtml('panel', 'Meta de calificación', 'docpro-icon docpro-icon--xl')}</div>
          <p class="mb-2 text-sm font-medium text-[var(--dp-text-secondary)]">Meta de calificación</p>
          <p class="mb-1 text-3xl font-bold text-[var(--dp-text-primary)]">100 pts</p>
          <p class="text-sm text-[var(--dp-text-muted)]">Referencia de evaluación</p>
        </div>

        <div class="dp-card p-8">
          <div class="mb-3">${docproIconHtml('achievement', 'Progreso general', 'docpro-icon docpro-icon--xl')}</div>
          <p class="mb-2 text-sm font-medium text-[var(--dp-text-secondary)]">Progreso general</p>
          <p id="overall-progress-percent" class="mb-2 text-3xl font-bold text-[var(--dp-text-primary)]">${metrics.overall}%</p>
          <div class="dp-progress h-2.5">
            <div id="overall-progress-bar" class="dp-progress-fill" style="width: ${metrics.overall}%"></div>
          </div>
        </div>
      </div>

      <!-- Getting Started Guide -->
      <div class="dp-card p-10">
        <h2 class="mb-8 flex items-center gap-3 text-3xl font-bold">
          ${docproIconHtml('ideas', 'Guía de inicio', 'docpro-icon docpro-icon--lg')} <span>Guía de inicio</span>
        </h2>
        <div class="dp-grid-4">
            <div class="dp-card relative cursor-pointer p-6 quick-start-card" data-view="organizador">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h3 class="mb-3 text-lg font-bold">Organiza tu tema</h3>
            <p class="text-sm leading-relaxed text-[var(--dp-text-secondary)]">
              Usa el <strong>Organizador de ideas</strong> para definir tema, problema, preguntas y objetivos.
            </p>
          </div>

          <div class="dp-card relative cursor-pointer p-6 quick-start-card" data-view="redactor">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
            <h3 class="mb-3 text-lg font-bold">Redacta con apoyo</h3>
            <p class="text-sm leading-relaxed text-[var(--dp-text-secondary)]">
              Usa el <strong>Redactor asistido</strong> con contador de palabras y sugerencias de conectores académicos.
            </p>
          </div>

          <div class="dp-card relative cursor-pointer p-6 quick-start-card" data-view="exportar">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">3</div>
            <h3 class="mb-3 text-lg font-bold">Exporta a Word</h3>
            <p class="text-sm leading-relaxed text-[var(--dp-text-secondary)]">
              Genera un <strong>documento Word</strong> con portada, índice y formato APA 7 a partir del contenido guardado.
            </p>
          </div>

          <div class="dp-card relative cursor-pointer p-6 quick-start-card" data-view="historial">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">4</div>
            <h3 class="mb-3 text-lg font-bold">Consulta guardados</h3>
            <p class="text-sm leading-relaxed text-[var(--dp-text-secondary)]">
              Revisa documentos guardados, vuelve a exportarlos o elimínalos cuando ya no los necesites.
            </p>
          </div>
        </div>
      </div>

      <!-- Document Structure Requirements -->
      <div class="dp-card p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="flex items-center gap-3 text-3xl font-bold">
              ${docproIconHtml('validation', 'Estructura de tu documento', 'docpro-icon docpro-icon--lg')} <span>Estructura de tu Documento</span>
            </h2>
            <p id="structure-status" class="mt-2 text-sm text-[var(--dp-text-muted)]">${structureStatusLabel}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button id="structure-toggle" type="button" class="dp-btn dp-btn-ghost">${structureToggleLabel}</button>
            <button id="structure-add-btn" type="button" class="dp-btn dp-btn-primary">+ Agregar parte</button>
          </div>
        </div>
        <div id="structure-table" class="mb-8 space-y-4 ${isStructureOpen ? '' : 'hidden'}"></div>
        <div class="dp-card bg-[var(--dp-surface-2)] p-6">
          <div class="flex items-center gap-3 mb-3">
            ${docproIconHtml('panel', 'Tu progreso de completitud', 'docpro-icon docpro-icon--sm')}
            <p class="font-bold text-[var(--dp-text-primary)]">Tu Progreso de Completitud</p>
          </div>
          <div class="dp-progress h-3 mb-2">
            <div id="section-progress" class="dp-progress-fill w-0 transition-all duration-500"></div>
          </div>
          <p class="text-sm font-semibold text-[var(--dp-text-secondary)]"><span id="section-count">0</span> partes configuradas</p>
        </div>
      </div>

      <!-- Section Progress Overview -->
      <div class="dp-card p-10">
        <h2 class="mb-8 flex items-center gap-3 text-3xl font-bold">
          ${docproIconHtml('review', 'Avance por sección', 'docpro-icon docpro-icon--lg')} <span>Avance por Sección</span>
        </h2>
        <div class="dp-grid-2">
          <div class="dp-stat p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">${docproIconHtml('ideas', 'Planeación', 'docpro-icon docpro-icon--sm')}<span>Planeación</span></h3>
              <span id="planeacion-status" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0%</span>
            </div>
            <div class="dp-progress h-3">
              <div id="planeacion-bar" class="dp-progress-fill w-0 transition-all duration-500"></div>
            </div>
            <p class="mt-2 text-xs text-[var(--dp-text-secondary)]">Meta: 250+ palabras</p>
          </div>

          <div class="dp-stat p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">${docproIconHtml('redactor', 'Organización', 'docpro-icon docpro-icon--sm')}<span>Organización</span></h3>
              <span id="organizacion-status" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0%</span>
            </div>
            <div class="dp-progress h-3">
              <div id="organizacion-bar" class="dp-progress-fill w-0 transition-all duration-500"></div>
            </div>
            <p class="mt-2 text-xs text-[var(--dp-text-secondary)]">Meta: 150+ palabras</p>
          </div>

          <div class="dp-stat p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">${docproIconHtml('review', 'Dirección', 'docpro-icon docpro-icon--sm')}<span>Dirección</span></h3>
              <span id="direccion-status" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0%</span>
            </div>
            <div class="dp-progress h-3">
              <div id="direccion-bar" class="dp-progress-fill w-0 transition-all duration-500"></div>
            </div>
            <p class="mt-2 text-xs text-[var(--dp-text-secondary)]">Meta: 150+ palabras</p>
          </div>

          <div class="dp-stat p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">${docproIconHtml('panel', 'Control', 'docpro-icon docpro-icon--sm')}<span>Control</span></h3>
              <span id="control-status" class="text-2xl font-bold text-[var(--dp-accent-dark)]">0%</span>
            </div>
            <div class="dp-progress h-3">
              <div id="control-bar" class="dp-progress-fill w-0 transition-all duration-500"></div>
            </div>
            <p class="mt-2 text-xs text-[var(--dp-text-secondary)]">Meta: 150+ palabras</p>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="dp-card p-10">
        <h2 class="mb-8 flex items-center gap-3 text-3xl font-bold">${docproIconHtml('achievement', 'Estadísticas del proyecto', 'docpro-icon docpro-icon--lg')}<span>Estadísticas del Proyecto</span></h2>
        <div class="dp-grid-4">
          <div class="text-center dp-stat p-6">
            <div class="mb-2 text-4xl font-black text-[var(--dp-accent-dark)]" id="stat-content-words">0</div>
            <p class="font-medium text-[var(--dp-text-secondary)]">Palabras Redactadas</p>
          </div>
          <div class="text-center dp-stat p-6">
            <div class="mb-2 text-4xl font-black text-[var(--dp-accent-dark)]" id="stat-work-time">0 min</div>
            <p class="font-medium text-[var(--dp-text-secondary)]">Tiempo de Trabajo</p>
          </div>
          <div class="text-center dp-stat p-6">
            <div class="mb-2 text-4xl font-black text-[var(--dp-accent-dark)]" id="stat-citations">0</div>
            <p class="font-medium text-[var(--dp-text-secondary)]">Referencias APA</p>
          </div>
          <div class="text-center dp-stat p-6">
            <div class="mb-2 text-4xl font-black text-[var(--dp-accent-dark)]" id="stat-simulations">0</div>
            <p class="font-medium text-[var(--dp-text-secondary)]">Evaluaciones</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  document.querySelectorAll('.pending-nav').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });
  document.querySelectorAll('.project-nav').forEach(button => {
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
