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
  const history = typeof loadDocumentHistory === 'function' ? loadDocumentHistory() : [];
  const exportData = loadJSON('export_student_data', {});
  const redactorContent = safeStorageGet('redactor_content', '');
  const redactorWords = countWords(redactorContent);
  const redactorParagraphs = countParagraphs(redactorContent);
  const citations = loadJSON('apa_generated_citations', state.generatedCitations || []);
  const organizerOutline = loadJSON('organizer_outline', {});
  const organizerValues = organizerOutline.values || organizerOutline;
  const organizerText = Object.values(organizerValues).flat().join('\n');
  const paperBody = (redactorContent || organizerText || '').trim();
  const paperParagraphs = paperBody
    ? paperBody.split(/\n\s*\n+/).map(paragraph => paragraph.trim()).filter(Boolean).slice(0, 2)
    : [];
  const savedDocumentCount = history.length;
  const savedDocsLabel = `${savedDocumentCount} ${savedDocumentCount === 1 ? 'documento' : 'documentos'}`;
  const latestHistory = history[0] || null;
  const lastEditLabel = latestHistory?.savedAt
    ? formatDateTimeValue(latestHistory.savedAt)
    : (redactorWords > 0 ? 'Sesión local activa' : 'Sin edición reciente');
  const apaStatusLabel = metrics.apa >= 80 ? 'Sólido' : metrics.apa >= 40 ? 'En progreso' : 'Pendiente';
  const apaStatusClass = metrics.apa >= 80 ? 'dp-badge-success' : (metrics.apa >= 40 ? 'dp-badge-warning' : 'dp-badge-neutral');
  const formatStatusLabel = formatProfile ? 'Plantilla cargada' : 'Formato base APA 7';
  const paperTitle = exportData.titulo || exportData.curso || 'Título del trabajo académico';
  const paperAuthor = exportData.nombre || 'Nombre del estudiante';
  const paperInstitution = exportData.institucion || 'Institución académica';
  const paperCourse = exportData.curso || 'Curso o asignatura';
  const paperDate = deliveryDate
    ? deliveryDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Fecha de entrega';
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
        <div class="structure-row">
          <input type="checkbox" class="structure-item-check h-5 w-5 cursor-pointer accent-[var(--dp-accent)]" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
          <input type="text" class="structure-item-text dp-input" data-id="${item.id}" value="${escapeHtml(item.text)}">
          <button type="button" class="structure-item-delete dp-btn dp-btn-ghost dp-btn-sm text-red-600" data-id="${item.id}">Eliminar</button>
        </div>
      `).join('')
      : '<p class="text-sm text-[var(--dp-text-muted)] italic">Todavía no has agregado partes al documento.</p>';

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
    <div class="dashboard-shell dp-stagger">
      <section class="dashboard-hero" aria-labelledby="dashboard-title">
        <div class="dashboard-hero__inner">
          <div>
            <p class="dashboard-kicker">Software académico local</p>
            <h1 id="dashboard-title" class="dashboard-title">ProcessAdmin para trabajos APA 7 claros, medibles y listos para exportar</h1>
            <p class="dashboard-copy">Redacta, organiza, valida referencias y prepara un documento Word desde un entorno privado en el navegador. La interfaz prioriza avance real, formato académico y control del contenido.</p>
            <div class="hero-actions">
              <button type="button" class="dp-btn dp-btn-primary project-nav" data-view="redactor">${docproIconHtml('redactor', 'Continuar trabajo', 'docpro-icon docpro-icon--sm')}Continuar trabajo</button>
              <button type="button" class="dp-btn dp-btn-ghost project-nav" data-view="organizador">${docproIconHtml('ideas', 'Nuevo documento', 'docpro-icon docpro-icon--sm')}Nuevo documento</button>
              <button type="button" class="dp-btn dp-btn-ghost project-nav" data-view="exportar">${docproIconHtml('exportWord', 'Exportar', 'docpro-icon docpro-icon--sm')}Exportar</button>
            </div>
          </div>

          <aside class="hero-brief" aria-label="Estado general del documento">
            <div>
              <p id="overall-progress-percent" class="hero-brief__score">${metrics.overall}%</p>
              <p class="hero-brief__label">Preparación general del documento</p>
              <div class="dp-progress mt-4 h-3">
                <div id="overall-progress-bar" class="dp-progress-fill" style="width: ${metrics.overall}%"></div>
              </div>
            </div>
            <ul class="hero-brief__list">
              <li><span class="status-dot" aria-hidden="true"></span><span>${escapeHtml(motivationalMsg)}</span></li>
              <li><span class="status-dot" aria-hidden="true"></span><span>${escapeHtml(savedDocsLabel)} guardados localmente</span></li>
              <li><span class="status-dot" aria-hidden="true"></span><span>Ultima edicion: ${escapeHtml(lastEditLabel)}</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="trust-strip" aria-label="Confianza y alcance">
        <div class="trust-item">
          <strong>Privacidad local</strong>
          <span>El contenido permanece en localStorage del navegador y no requiere cuenta.</span>
        </div>
        <div class="trust-item">
          <strong>Formato APA 7</strong>
          <span>Vista previa, referencias, checklist y exportación se alinean al flujo académico.</span>
        </div>
        <div class="trust-item">
          <strong>Productividad medible</strong>
          <span>Métricas de avance, palabras, citas y pendientes visibles desde el primer vistazo.</span>
        </div>
      </section>

      <section class="dashboard-metrics" aria-label="Métricas del documento">
        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('review', 'Documentos creados')}</span>
            <span class="dp-badge dp-badge-neutral">Local</span>
          </div>
          <p class="metric-card__value">${savedDocumentCount}</p>
          <p class="metric-card__label">Documentos creados</p>
          <p class="metric-card__hint">Versiones exportadas o guardadas.</p>
        </article>

        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('redactor', 'Palabras escritas')}</span>
            <span class="dp-badge dp-badge-info">${redactorParagraphs} parrafos</span>
          </div>
          <p id="stat-content-words" class="metric-card__value">${redactorWords}</p>
          <p class="metric-card__label">Palabras escritas</p>
          <p class="metric-card__hint">Contenido activo en el redactor.</p>
        </article>

        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('apa', 'Citaciones generadas')}</span>
            <span class="dp-badge ${apaStatusClass}">${metrics.apa}% APA</span>
          </div>
          <p id="stat-citations" class="metric-card__value">${citations.length}</p>
          <p class="metric-card__label">Citaciones generadas</p>
          <p class="metric-card__hint">Referencias y citas en texto.</p>
        </article>

        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('panel', 'Tiempo de trabajo')}</span>
            <span class="dp-badge dp-badge-neutral">Sesion</span>
          </div>
          <p id="stat-work-time" class="metric-card__value">0 min</p>
          <p class="metric-card__label">Tiempo de trabajo</p>
          <p class="metric-card__hint">${escapeHtml(lastEditLabel)}</p>
        </article>

        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('achievement', 'Progreso del documento')}</span>
            <span class="dp-badge dp-badge-accent">General</span>
          </div>
          <p class="metric-card__value">${metrics.overall}%</p>
          <p class="metric-card__label">Progreso del documento</p>
          <p class="metric-card__hint">Estructura, APA, rúbrica y Word.</p>
        </article>

        <article class="metric-card">
          <div class="metric-card__top">
            <span class="metric-icon">${docproIconHtml('validation', 'Estado APA')}</span>
            <span class="dp-badge ${apaStatusClass}">${apaStatusLabel}</span>
          </div>
          <p class="metric-card__value">${metrics.apa}%</p>
          <p class="metric-card__label">Estado APA</p>
          <p class="metric-card__hint">Consistencia de fuentes y citas.</p>
        </article>
      </section>

      <section class="dashboard-main-grid">
        <div class="dashboard-panel">
          <div class="panel-section-header">
            <div>
              <p class="dashboard-kicker dashboard-kicker--light">Acciones principales</p>
              <h2 class="panel-section-title">Flujo de trabajo académico</h2>
              <p class="panel-section-copy">Accesos directos a las tareas que más impacto tienen en una entrega APA: planear, redactar, citar, guardar, previsualizar y exportar.</p>
            </div>
          </div>

          <div class="action-grid">
            <button type="button" class="action-card quick-start-card" data-view="organizador">
              <span>${docproIconHtml('ideas', 'Nuevo documento')}</span>
              <strong>Nuevo documento</strong>
              <small>Define tema, problema y objetivos.</small>
            </button>
            <button type="button" class="action-card quick-start-card" data-view="redactor">
              <span>${docproIconHtml('redactor', 'Continuar trabajo')}</span>
              <strong>Continuar trabajo</strong>
              <small>Retoma el borrador guardado.</small>
            </button>
            <button type="button" class="action-card quick-start-card" data-view="apa">
              <span>${docproIconHtml('apa', 'Generar citación')}</span>
              <strong>Generar citación</strong>
              <small>Crea citas y referencias APA 7.</small>
            </button>
            <button type="button" class="action-card panel-save-now">
              <span>${docproIconHtml('validation', 'Guardar')}</span>
              <strong>Guardar</strong>
              <small>Confirma el guardado local.</small>
            </button>
            <button type="button" class="action-card preview-scroll">
              <span>${docproIconHtml('review', 'Vista previa')}</span>
              <strong>Vista previa</strong>
              <small>Revisa el aspecto de hoja académica.</small>
            </button>
            <button type="button" class="action-card quick-start-card" data-view="exportar">
              <span>${docproIconHtml('exportWord', 'Exportar')}</span>
              <strong>Exportar</strong>
              <small>Genera un documento Word.</small>
            </button>
          </div>

          <div class="readiness-panel">
            <div>
              <p class="readiness-score">${metrics.overall}%</p>
              <p class="readiness-label">Preparación general</p>
            </div>
            <div class="readiness-body">
              <p>${escapeHtml(motivationalMsg)}</p>
              <div class="quality-grid">
                <div class="quality-item">
                  <span>Estructura</span>
                  <strong>${metrics.structure}%</strong>
                  <div class="dp-progress"><div class="dp-progress-fill" style="width: ${metrics.structure}%"></div></div>
                </div>
                <div class="quality-item">
                  <span>APA 7</span>
                  <strong>${metrics.apa}%</strong>
                  <div class="dp-progress"><div class="dp-progress-fill" style="width: ${metrics.apa}%"></div></div>
                </div>
                <div class="quality-item">
                  <span>Rúbrica</span>
                  <strong>${metrics.criteria}%</strong>
                  <div class="dp-progress"><div class="dp-progress-fill" style="width: ${metrics.criteria}%"></div></div>
                </div>
                <div class="quality-item">
                  <span>Word</span>
                  <strong>${metrics.wordFormat}%</strong>
                  <div class="dp-progress"><div class="dp-progress-fill" style="width: ${metrics.wordFormat}%"></div></div>
                </div>
              </div>
            </div>
          </div>

          <div class="pending-panel">
            <h3>${docproIconHtml('review', 'Pendientes prioritarios', 'docpro-icon docpro-icon--sm')}<span>Pendientes prioritarios</span></h3>
            <div class="pending-list">
              ${pendingItems.length > 0 ? pendingItems.map(item => `
                <button type="button" class="pending-item pending-nav" data-view="${item.view}">
                  <span>${docproIconHtml('validation', 'Revisar pendiente', 'docpro-icon docpro-icon--sm')}</span>
                  ${item.label}
                </button>
              `).join('') : '<p class="pending-empty">No tienes pendientes críticos en este momento.</p>'}
            </div>
          </div>
        </div>

        <aside id="panel-document-preview" class="preview-card dashboard-panel">
          <div class="panel-section-header">
            <div>
              <p class="dashboard-kicker dashboard-kicker--light">Vista previa</p>
              <h2 class="panel-section-title">Documento académico</h2>
              <p class="panel-section-copy">Simulación visual de portada, cuerpo y referencias para que el trabajo se sienta tangible antes de exportar.</p>
            </div>
          </div>
          <div class="paper-stage">
            <article class="paper-preview paper-preview--compact" aria-label="Vista previa del documento">
              <span class="paper-page-number">1</span>
              <section class="paper-cover">
                <span class="template-badge">${escapeHtml(formatStatusLabel)}</span>
                <p>${escapeHtml(paperInstitution)}</p>
                <p>${escapeHtml(paperCourse)}</p>
                <h1>${escapeHtml(paperTitle)}</h1>
                <p>${escapeHtml(paperAuthor)}</p>
                <p>${escapeHtml(paperDate)}</p>
              </section>
              <section class="paper-section">
                <h2>Introducción</h2>
                ${paperParagraphs.length > 0
                  ? paperParagraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')
                  : '<p class="paper-empty">El cuerpo del documento aparecerá aquí cuando redactes contenido o completes el organizador de ideas.</p>'}
              </section>
              <section class="paper-section">
                <h2>Referencias</h2>
                ${citations.length > 0
                  ? citations.slice(0, 3).map(reference => `<p class="paper-reference">${escapeHtml(String(reference).replace(/<\/?em>/g, ''))}</p>`).join('')
                  : '<p class="paper-empty">Sin referencias registradas todavía.</p>'}
              </section>
            </article>
          </div>
        </aside>
      </section>

      <section class="dashboard-secondary-grid">
        <div class="dashboard-panel">
          <div class="panel-section-header">
            <div>
              <p class="dashboard-kicker dashboard-kicker--light">Estructura</p>
              <h2 class="panel-section-title">${docproIconHtml('validation', 'Estructura de tu documento', 'docpro-icon docpro-icon--sm')}Partes del documento</h2>
              <p id="structure-status" class="panel-section-copy">${structureStatusLabel}</p>
            </div>
            <div class="panel-actions">
              <button id="structure-toggle" type="button" class="dp-btn dp-btn-ghost">${structureToggleLabel}</button>
              <button id="structure-add-btn" type="button" class="dp-btn dp-btn-primary">Agregar parte</button>
            </div>
          </div>
          <div id="structure-table" class="structure-table ${isStructureOpen ? '' : 'hidden'}"></div>
          <div class="progress-summary">
            <div>
              <strong>Completitud de estructura</strong>
              <span><span id="section-count">0</span> partes configuradas</span>
            </div>
            <div class="dp-progress h-3">
              <div id="section-progress" class="dp-progress-fill w-0"></div>
            </div>
          </div>
        </div>

        <div class="dashboard-panel">
          <div class="panel-section-header">
            <div>
              <p class="dashboard-kicker dashboard-kicker--light">Entrega</p>
              <h2 class="panel-section-title">${docproIconHtml('review', 'Fecha de entrega', 'docpro-icon docpro-icon--sm')}Fecha y formato</h2>
              <p class="panel-section-copy">Sincroniza la fecha con checklist y exportación; carga una plantilla Word si tu institución exige un formato particular.</p>
            </div>
          </div>
          <div class="delivery-layout">
            <div>
              <p class="metric-card__label">Fecha de entrega</p>
              <p id="delivery-date-label" class="delivery-date-value">${deliveryDateLabel}</p>
              <label class="dp-label" for="delivery-date-input">Modificar fecha</label>
              <input id="delivery-date-input" type="date" value="${deliveryDateInputValue}" class="dp-input">
              <p id="delivery-date-sync-badge" class="mt-2 inline-flex items-center rounded-full ${deliveryDate ? 'dp-badge dp-badge-info' : 'dp-badge dp-badge-neutral'}">${deliveryDate ? 'Sincronizado con checklist y exportación' : 'Opcional: puedes agregar una fecha de entrega'}</p>
              <p id="countdown" class="delivery-countdown">Calculando...</p>
            </div>
            <div class="format-panel">
              <p class="metric-card__label">Formato de exportación</p>
              <strong>${escapeHtml(formatLabel)}</strong>
              <span>${escapeHtml(formatDetail)}</span>
              <input id="panel-load-format-input" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/json,.json" class="hidden">
              <div class="panel-actions mt-4">
                <button id="panel-load-format-btn" type="button" class="dp-btn dp-btn-primary">Cargar plantilla</button>
                <button id="panel-clear-format-btn" type="button" class="dp-btn dp-btn-ghost">Limpiar</button>
                <button id="panel-open-export-btn" type="button" class="dp-btn dp-btn-ghost">Exportar</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-panel">
        <div class="panel-section-header">
          <div>
            <p class="dashboard-kicker dashboard-kicker--light">Redacción</p>
            <h2 class="panel-section-title">${docproIconHtml('achievement', 'Avance por sección', 'docpro-icon docpro-icon--sm')}Avance por sección</h2>
            <p class="panel-section-copy">Lectura rápida de metas internas de planeación, organización, dirección y control.</p>
          </div>
          <div class="stats-mini">
            <div><strong id="stat-simulations">0</strong><span>evaluaciones</span></div>
            <div><strong>100 pts</strong><span>meta</span></div>
          </div>
        </div>
        <div class="section-progress-grid">
          <div class="section-progress-item">
            <div><span>Planeación</span><strong id="planeacion-status">0%</strong></div>
            <div class="dp-progress h-3"><div id="planeacion-bar" class="dp-progress-fill w-0"></div></div>
            <small>Meta: 250+ palabras</small>
          </div>
          <div class="section-progress-item">
            <div><span>Organización</span><strong id="organizacion-status">0%</strong></div>
            <div class="dp-progress h-3"><div id="organizacion-bar" class="dp-progress-fill w-0"></div></div>
            <small>Meta: 150+ palabras</small>
          </div>
          <div class="section-progress-item">
            <div><span>Dirección</span><strong id="direccion-status">0%</strong></div>
            <div class="dp-progress h-3"><div id="direccion-bar" class="dp-progress-fill w-0"></div></div>
            <small>Meta: 150+ palabras</small>
          </div>
          <div class="section-progress-item">
            <div><span>Control</span><strong id="control-status">0%</strong></div>
            <div class="dp-progress h-3"><div id="control-bar" class="dp-progress-fill w-0"></div></div>
            <small>Meta: 150+ palabras</small>
          </div>
        </div>
      </section>

      <div class="dp-card">
        <div class="dp-card-header">
          <h3 class="dp-card-title">¿Quién usa ProcessAdmin?</h3>
          <span class="dp-badge dp-badge-accent">Comunidad</span>
        </div>
        <div class="dp-grid-2">
          <div style="padding:16px; background:var(--dp-surface-2); border-radius:var(--dp-r-md); border:1px solid var(--dp-border);">
            <p style="font-size:13px; font-style:italic; color:var(--dp-text-secondary); line-height:1.7; margin:0 0 12px;">
              "ProcessAdmin me ahorró horas de formateo. Entrego mis trabajos con confianza de que el APA está correcto."
            </p>
            <p style="font-size:12px; font-weight:700; color:var(--dp-text-primary); margin:0;">Estudiante — IU Digital de Antioquia</p>
            <p style="font-size:11px; color:var(--dp-text-muted); margin:2px 0 0;">Tecnología en Desarrollo de Software</p>
          </div>
          <div style="padding:16px; background:var(--dp-surface-2); border-radius:var(--dp-r-md); border:1px solid var(--dp-border);">
            <p style="font-size:13px; font-style:italic; color:var(--dp-text-secondary); line-height:1.7; margin:0 0 12px;">
              "El evaluador de rúbrica es increíble. Me permite saber mi nota antes de entregar y mejorar lo necesario."
            </p>
            <p style="font-size:12px; font-weight:700; color:var(--dp-text-primary); margin:0;">Aprendiz — SENA</p>
            <p style="font-size:11px; color:var(--dp-text-muted); margin:2px 0 0;">Centro de Formación Ambiental · Caucasia</p>
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
  document.querySelectorAll('.preview-scroll').forEach(button => {
    button.addEventListener('click', () => {
      document.getElementById('panel-document-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('.panel-save-now').forEach(button => {
    button.addEventListener('click', () => {
      safeStorageSet('processadmin_last_manual_save', new Date().toISOString());
      if (typeof flashSaveIndicator === 'function') flashSaveIndicator();
      const label = button.querySelector('strong');
      const previous = label ? label.textContent : button.textContent;
      if (label) label.textContent = 'Guardado';
      setTimeout(() => {
        if (label) label.textContent = previous;
      }, 1400);
    });
  });

  const deliveryDateInput = document.getElementById('delivery-date-input');
  const deliveryDateLabelEl = document.getElementById('delivery-date-label');
  const deliveryDateSyncBadge = document.getElementById('delivery-date-sync-badge');
  const panelLoadFormatInput = document.getElementById('panel-load-format-input');
  const panelLoadFormatButton = document.getElementById('panel-load-format-btn');
  const panelClearFormatButton = document.getElementById('panel-clear-format-btn');
  const panelOpenExportButton = document.getElementById('panel-open-export-btn');

  if (panelOpenExportButton) {
    panelOpenExportButton.addEventListener('click', () => navigate('exportar'));
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

        if (normalized) navigate('exportar');
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
          deliveryDateSyncBadge.className = 'mt-2 inline-flex items-center rounded-full dp-badge dp-badge-danger px-3 py-1 text-[11px] font-semibold';
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
        deliveryDateSyncBadge.className = 'mt-2 inline-flex items-center rounded-full dp-badge dp-badge-success px-3 py-1 text-[11px] font-semibold';
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
  let sectionWords = 0;

  Object.keys(fields).forEach(key => {
    const wordCount = countWords(fields[key]);
    sectionWords += wordCount;
    const percent = Math.min((wordCount / targetWords[key]) * 100, 100);
    totalPercent += percent;

    const bar = document.getElementById(`${key}-bar`);
    const status = document.getElementById(`${key}-status`);
    if (bar) bar.style.width = percent + '%';
    if (status) status.textContent = Math.round(percent) + '%';
  });

  const totalWords = sectionWords + countWords(safeStorageGet('redactor_content', ''));
  const qualityMetrics = calculateQualityMetrics();
  const overallPercent = qualityMetrics.overall || Math.round(totalPercent / 4);
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
  if (statCitations) statCitations.textContent = loadJSON('apa_generated_citations', state.generatedCitations || []).length;

  const statSimulations = document.getElementById('stat-simulations');
  if (statSimulations) statSimulations.textContent = loadJSON('rubrica_current', []).length;
}
