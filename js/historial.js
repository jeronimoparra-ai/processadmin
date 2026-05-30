// ═══════════════════════════════════════════════════════════════════════
// HISTORIAL.JS - Acceso a documentos guardados y exportaciones previas
// ═══════════════════════════════════════════════════════════════════════

function formatHistoryDate(value) {
  if (!value) return 'Sin fecha';

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

function buildHistoryEntrySummary(entry) {
  const data = entry.data || {};
  return [
    data.curso || 'Sin curso',
    data.modalidad ? `Modalidad: ${data.modalidad}` : null,
    data.ciudad ? `Ciudad: ${data.ciudad}` : null,
    data.docente ? `Docente: ${data.docente}` : null
  ].filter(Boolean);
}

function buildHistorial() {
  const history = loadDocumentHistory();
  let searchTerm = '';
  let sortMode = 'recent';

  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold">${docproIconHtml('review', 'Historial de documentos', 'docpro-icon docpro-icon--lg')}<span>Historial de documentos</span></h2>
          <p class="text-[var(--dp-text-secondary)]">Reabre, revisa o descarga versiones guardadas.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="dp-card px-4 py-3">
            <p class="text-xs uppercase tracking-wide text-[var(--dp-text-muted)]">Documentos guardados</p>
            <p id="history-total" class="text-2xl font-bold text-[var(--dp-text-primary)]">${history.length}</p>
          </div>
          <button id="go-export-btn" class="dp-btn dp-btn-primary">Ir a exportación</button>
        </div>
      </div>

      <div class="dp-card flex flex-col gap-4 p-4 md:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <label class="mb-2 block text-sm font-semibold text-[var(--dp-text-secondary)]" for="history-search">Buscar documento</label>
          <input id="history-search" type="search" placeholder="Título, curso, nombre, ciudad o modalidad" class="dp-input">
        </div>
        <div class="min-w-[220px]">
          <label class="mb-2 block text-sm font-semibold text-[var(--dp-text-secondary)]" for="history-sort">Ordenar por</label>
          <select id="history-sort" class="dp-select">
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="title">Título A-Z</option>
          </select>
        </div>
      </div>

      <div id="history-list" class="space-y-4"></div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  updateSavedDocumentCounter();

  const list = document.getElementById('history-list');
  const total = document.getElementById('history-total');
  const searchInput = document.getElementById('history-search');
  const sortSelect = document.getElementById('history-sort');

  function getFilteredItems() {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const items = loadDocumentHistory().filter(entry => {
      if (!normalizedTerm) return true;

      const data = entry.data || {};
      const haystack = [
        entry.title,
        data.nombre,
        data.curso,
        data.modalidad,
        data.ciudad,
        data.docente,
        data.institucion,
        data.fecha,
        entry.savedAt
      ].filter(Boolean).join(' ').toLowerCase();

      return haystack.includes(normalizedTerm);
    });

    if (sortMode === 'oldest') {
      return items.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
    }

    if (sortMode === 'title') {
      return items.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'es'));
    }

    return items.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }

  function renderHistory() {
    const items = getFilteredItems();
    if (total) total.textContent = items.length.toString();
    updateSavedDocumentCounter();

    if (items.length === 0) {
      list.innerHTML = `
        <div class="dp-card space-y-3 p-8 text-center">
          <div class="flex justify-center">${docproIconHtml('review', 'Sin documentos guardados', 'docpro-icon docpro-icon--xl')}</div>
          <h3 class="text-2xl font-bold text-[var(--dp-text-primary)]">${searchTerm ? 'No se encontraron resultados' : 'Todavía no hay documentos guardados'}</h3>
          <p class="text-[var(--dp-text-secondary)]">${searchTerm ? 'Prueba con otro término o limpia el filtro.' : 'Cuando exportes un trabajo, aparecerá aquí para volver a abrirlo o descargarlo.'}</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button id="empty-history-export" class="dp-btn dp-btn-primary">${searchTerm ? 'Limpiar filtro' : 'Crear primer documento'}</button>
            ${searchTerm ? '<button id="empty-history-export-doc" class="dp-btn dp-btn-ghost">Ir a exportación</button>' : ''}
          </div>
        </div>
      `;
      document.getElementById('empty-history-export')?.addEventListener('click', () => {
        if (searchTerm) {
          searchTerm = '';
          if (searchInput) searchInput.value = '';
          renderHistory();
          return;
        }
        navigate('exportar');
      });
      document.getElementById('empty-history-export-doc')?.addEventListener('click', () => navigate('exportar'));
      return;
    }

    list.innerHTML = items.map(entry => {
      const data = entry.data || {};
      const details = buildHistoryEntrySummary(entry).filter(item => item !== entry.title);
      return `
        <article class="dp-card space-y-4 p-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider text-[var(--dp-text-muted)]">Guardado el ${escapeHtml(formatHistoryDate(entry.savedAt))}</p>
              <h3 class="mt-1 text-2xl font-bold text-[var(--dp-text-primary)]">${escapeHtml(entry.title || 'Documento sin título')}</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                ${details.map(item => `<span class="dp-badge dp-badge-neutral">${escapeHtml(item)}</span>`).join('')}
              </div>
            </div>
            <div class="text-sm text-[var(--dp-text-secondary)] lg:text-right">
              <p><span class="font-semibold text-[var(--dp-text-primary)]">Nombre:</span> ${escapeHtml(data.nombre || 'Sin nombre')}</p>
              <p><span class="font-semibold text-[var(--dp-text-primary)]">Fecha:</span> ${escapeHtml(data.fecha || 'Sin fecha')}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button class="history-action dp-btn dp-btn-primary" data-action="open" data-id="${escapeHtml(entry.id)}">Abrir</button>
            <button class="history-action dp-btn dp-btn-ghost" data-action="download" data-id="${escapeHtml(entry.id)}">Descargar DOCX</button>
            <button class="history-action dp-btn dp-btn-ghost" style="color: var(--dp-danger)" data-action="delete" data-id="${escapeHtml(entry.id)}">Eliminar</button>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('.history-action').forEach(button => {
      button.addEventListener('click', () => {
        const entryId = button.dataset.id;
        const action = button.dataset.action;
        const entry = loadDocumentHistory().find(item => item.id === entryId);
        if (!entry) return;

        if (action === 'open') {
          saveJSON('export_student_data', entry.data || {});
          navigate('exportar');
          return;
        }

        if (action === 'download') {
          const title = (entry.title || 'documento').replace(/\s+/g, '_');
          downloadExportDocx(entry.data || {}, entry.snapshot || {}, `${title}_APA7.docx`);
          return;
        }

        if (action === 'delete') {
          const confirmed = confirm(`¿Eliminar "${entry.title || 'este documento'}" del historial?`);
          if (!confirmed) return;
          removeDocumentHistoryEntry(entryId);
          renderHistory();
        }
      });
    });
  }

  document.getElementById('go-export-btn')?.addEventListener('click', () => navigate('exportar'));
  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value;
    renderHistory();
  });
  sortSelect?.addEventListener('change', () => {
    sortMode = sortSelect.value;
    renderHistory();
  });
  renderHistory();
}
