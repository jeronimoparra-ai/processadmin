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

  const html = `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3"><span>🗂️</span> Historial de documentos</h2>
          <p class="text-slate-600">Reabre, revisa o descarga versiones que ya exportaste.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p class="text-xs uppercase tracking-wide text-slate-500">Documentos guardados</p>
            <p id="history-total" class="text-2xl font-bold text-blue-900">${history.length}</p>
          </div>
          <button id="go-export-btn" class="btn-primary">📤 Ir a exportación</button>
        </div>
      </div>

      <div id="history-list" class="space-y-4"></div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  updateSavedDocumentCounter();

  const list = document.getElementById('history-list');
  const total = document.getElementById('history-total');

  function renderHistory() {
    const items = loadDocumentHistory();
    if (total) total.textContent = items.length.toString();
    updateSavedDocumentCounter();

    if (items.length === 0) {
      list.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
          <div class="text-5xl">🕰️</div>
          <h3 class="text-2xl font-bold text-slate-900">Aún no hay documentos guardados</h3>
          <p class="text-slate-600">Cuando exportes un trabajo, aparecerá aquí para volver a abrirlo o descargarlo.</p>
          <button id="empty-history-export" class="btn-primary">Crear primer documento</button>
        </div>
      `;
      document.getElementById('empty-history-export')?.addEventListener('click', () => navigate('exportar'));
      return;
    }

    list.innerHTML = items.map(entry => {
      const data = entry.data || {};
      const details = buildHistoryEntrySummary(entry).filter(item => item !== entry.title);
      return `
        <article class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-xs uppercase tracking-wider text-slate-500">Guardado el ${escapeHtml(formatHistoryDate(entry.savedAt))}</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-1">${escapeHtml(entry.title || 'Documento sin título')}</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                ${details.map(item => `<span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">${escapeHtml(item)}</span>`).join('')}
              </div>
            </div>
            <div class="text-sm text-slate-500 lg:text-right">
              <p><span class="font-semibold text-slate-700">Nombre:</span> ${escapeHtml(data.nombre || 'Sin nombre')}</p>
              <p><span class="font-semibold text-slate-700">Fecha:</span> ${escapeHtml(data.fecha || 'Sin fecha')}</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button class="history-action btn-primary" data-action="open" data-id="${escapeHtml(entry.id)}">📂 Abrir</button>
            <button class="history-action btn" data-action="download" data-id="${escapeHtml(entry.id)}">⬇️ Descargar DOCX</button>
            <button class="history-action btn ghost" data-action="delete" data-id="${escapeHtml(entry.id)}">🗑️ Eliminar</button>
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
  renderHistory();
}
