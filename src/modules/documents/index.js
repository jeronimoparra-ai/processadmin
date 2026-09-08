// ═══════════════════════════════════════════════════════════════════════
// MODULES/DOCUMENTS/INDEX.JS - Gestor de Trabajos Académicos (Mis Trabajos)
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { WORK_TYPES } from '../../core/constants.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml } from '../../utils/helpers.js';

export function renderDocuments(container) {
  const currentWork = store.getCurrentWork();
  const works = store.getWorksList();

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Encabezado del módulo -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Mis Trabajos</h1>
          <p class="text-sm text-slate-600 mt-1">
            Administra tus trabajos académicos guardados localmente en este navegador.
          </p>
        </div>
        <button id="btn-create-new-work-top" class="btn btn-primary shadow-sm flex items-center gap-2">
          ${getIconSvg('plus', 'text-white', 16)}
          <span>Crear Nuevo Trabajo</span>
        </button>
      </div>

      <!-- Tarjeta del trabajo activo actual -->
      <div class="app-card p-6 bg-white border-2 border-blue-600 space-y-3">
        <div class="flex items-center justify-between">
          <span class="badge badge-accent">Trabajo actualmente abierto</span>
          <span class="text-xs text-slate-500 font-mono">ID: ${escapeHtml(currentWork.id)}</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900">${escapeHtml(currentWork.title)}</h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Tipo: ${escapeHtml(WORK_TYPES[currentWork.workType]?.name || currentWork.workType)} · 
              ${store.getTotalWordCount()} palabras · 
              ${(currentWork.citations || []).length} referencias
            </p>
          </div>

          <button id="btn-resume-current" class="btn btn-primary text-xs px-4 py-2 flex items-center gap-2">
            ${getIconSvg('editor', 'text-white', 14)}
            <span>Continuar Redactando</span>
          </button>
        </div>
      </div>

      <!-- Listado de trabajos guardados -->
      <section class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 class="text-base font-bold text-slate-800">Todos los Trabajos Guardados (${works.length})</h2>
        </div>

        ${works.length === 0 ? `
          <div class="app-card p-12 text-center bg-white space-y-3">
            <p class="text-sm font-semibold text-slate-700">No hay otros trabajos guardados.</p>
            <p class="text-xs text-slate-400">Puedes crear un nuevo trabajo en cualquier momento.</p>
            <button id="btn-create-first" class="btn btn-primary text-xs mt-2">Crear Nuevo Trabajo</button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${works.map(w => {
              const isCurrent = w.id === currentWork.id;
              const typeLabel = WORK_TYPES[w.workType]?.name || w.workType;
              const dateStr = w.updatedAt
                ? new Date(w.updatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Sin fecha';

              return `
                <div class="app-card p-5 bg-white space-y-3 border ${isCurrent ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200'} hover:border-slate-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <span class="badge ${isCurrent ? 'badge-accent' : 'badge-neutral'} text-[10px]">
                        ${escapeHtml(typeLabel)}
                      </span>
                      <span class="text-[11px] text-slate-400 font-mono">${escapeHtml(dateStr)}</span>
                    </div>
                    <h3 class="text-base font-bold text-slate-900 truncate" title="${escapeHtml(w.title)}">
                      ${escapeHtml(w.title || 'Sin título')}
                    </h3>
                    <p class="text-xs text-slate-500 mt-1">
                      ${w.wordCount || 0} palabras · ${w.author ? `Por: ${escapeHtml(w.author)}` : 'Sin autor'}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    ${isCurrent ? `
                      <span class="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        ${getIconSvg('check', '', 14)}
                        <span>Abierto</span>
                      </span>
                    ` : `
                      <button type="button" class="btn-open-work btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1" data-id="${w.id}">
                        ${getIconSvg('documents', '', 14)}
                        <span>Abrir Trabajo</span>
                      </button>
                    `}

                    ${works.length > 1 ? `
                      <button type="button" class="btn-delete-work text-slate-400 hover:text-red-600 p-1.5 text-xs transition-colors" data-id="${w.id}" title="Eliminar este trabajo">
                        ${getIconSvg('trash', '', 14)}
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </section>
    </div>

    <!-- Modal para crear nuevo trabajo -->
    <div id="modal-new-work" class="modal-backdrop" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="modal-new-work-title">
      <div class="modal-panel max-w-md w-full bg-white p-6 rounded-xl space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="modal-new-work-title" class="font-bold text-slate-900 text-base">Crear Nuevo Trabajo Académico</h3>
          <button id="btn-close-new-work-modal" class="text-slate-400 hover:text-slate-600 p-1">
            ${getIconSvg('close', '', 16)}
          </button>
        </div>

        <form id="form-create-new-work" class="space-y-4">
          <div>
            <label for="new-work-title-input" class="form-label">Título o tema inicial *</label>
            <input id="new-work-title-input" type="text" class="form-input text-sm" placeholder="Ej: Ensayo sobre Ética y Tecnología" required>
          </div>

          <div>
            <label for="new-work-type-select" class="form-label">Tipo de documento *</label>
            <select id="new-work-type-select" class="form-select text-sm font-medium">
              ${Object.values(WORK_TYPES).map(t => `
                <option value="${t.id}">${escapeHtml(t.name)}</option>
              `).join('')}
            </select>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="btn-cancel-new-work" class="btn btn-ghost text-xs">Cancelar</button>
            <button type="submit" class="btn btn-primary text-xs px-4 py-2 font-bold">Comenzar Trabajo</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Bindings
  container.querySelector('#btn-resume-current')?.addEventListener('click', () => {
    window.appNavigate?.('redactor');
  });

  const modalNewWork = container.querySelector('#modal-new-work');
  function openNewWorkModal() {
    if (modalNewWork) modalNewWork.style.display = 'flex';
  }
  function closeNewWorkModal() {
    if (modalNewWork) modalNewWork.style.display = 'none';
  }

  container.querySelector('#btn-create-new-work-top')?.addEventListener('click', openNewWorkModal);
  container.querySelector('#btn-create-first')?.addEventListener('click', openNewWorkModal);
  container.querySelector('#btn-close-new-work-modal')?.addEventListener('click', closeNewWorkModal);
  container.querySelector('#btn-cancel-new-work')?.addEventListener('click', closeNewWorkModal);

  // Formulario nuevo trabajo
  const formNew = container.querySelector('#form-create-new-work');
  formNew?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = container.querySelector('#new-work-title-input')?.value.trim();
    const type = container.querySelector('#new-work-type-select')?.value || 'ensayo';

    if (title) {
      store.createNewWork(type, title);
      closeNewWorkModal();
      if (typeof window.showToast === 'function') {
        window.showToast('Nuevo trabajo creado con éxito.', 'success');
      }
      window.appNavigate?.('planificar');
    }
  });

  // Abrir trabajo seleccionado
  container.querySelectorAll('.btn-open-work').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) {
        store.switchWork(id);
        if (typeof window.showToast === 'function') {
          window.showToast('Trabajo cargado.', 'info');
        }
        renderDocuments(container);
      }
    });
  });

  // Eliminar trabajo
  container.querySelectorAll('.btn-delete-work').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id && confirm('¿Estás seguro de que deseas eliminar este trabajo permanentemente? Esta acción no se puede deshacer.')) {
        store.deleteWork(id);
        if (typeof window.showToast === 'function') {
          window.showToast('Trabajo eliminado.', 'info');
        }
        renderDocuments(container);
      }
    });
  });
}
