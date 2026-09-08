// ═══════════════════════════════════════════════════════════════════════
// MODULES/PLANNER/INDEX.JS - Módulo Planificar (Organizador + Estructura)
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { WORK_TYPES } from '../../core/constants.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml } from '../../utils/helpers.js';

export function renderPlanner(container) {
  const work = store.getCurrentWork();
  const currentType = work.workType || 'ensayo';

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Encabezado del módulo -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Planificar Trabajo</h1>
          <p class="text-sm text-slate-600 mt-1">
            Define el tema, objetivos y estructura antes de comenzar la redacción.
          </p>
        </div>
        <button id="btn-proceed-editor" class="btn btn-primary shadow-sm flex items-center gap-2">
          <span>Pasar a Redactar</span>
          ${getIconSvg('arrowRight', 'text-white', 16)}
        </button>
      </div>

      <!-- Configuración del Documento y Tipo -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <section class="app-card p-6 bg-white space-y-4">
            <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              ${getIconSvg('planner', 'text-blue-600', 18)}
              <span>1. Definición General</span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label for="plan-title" class="form-label">Título tentativo o tema central *</label>
                <input id="plan-title" type="text" class="form-input" value="${escapeHtml(work.title || '')}" placeholder="Ej: Análisis del impacto ambiental en la cuenca del Río Cauca">
              </div>

              <div>
                <label for="plan-work-type" class="form-label">Tipo de trabajo académico *</label>
                <select id="plan-work-type" class="form-select">
                  ${Object.values(WORK_TYPES).map(t => `
                    <option value="${t.id}" ${t.id === currentType ? 'selected' : ''}>${escapeHtml(t.name)}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label for="plan-author" class="form-label">Autor(a) del trabajo</label>
                <input id="plan-author" type="text" class="form-input" value="${escapeHtml(work.metadata?.author || '')}" placeholder="Nombre completo del estudiante">
              </div>
            </div>
          </section>

          <!-- Objetivos y Planteamiento -->
          <section class="app-card p-6 bg-white space-y-4">
            <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              ${getIconSvg('editor', 'text-indigo-600', 18)}
              <span>2. Enfoque e Ideas Principales</span>
            </h2>

            <div class="space-y-4">
              <div>
                <label for="plan-problem" class="form-label">Problema o pregunta de investigación</label>
                <textarea id="plan-problem" rows="3" class="form-textarea" placeholder="¿Qué problema busca responder o analizar este trabajo?">${escapeHtml(work.plan?.problem || '')}</textarea>
              </div>

              <div>
                <label for="plan-objective" class="form-label">Objetivo general</label>
                <input id="plan-objective" type="text" class="form-input" value="${escapeHtml(work.plan?.generalObjective || '')}" placeholder="Ej: Determinar los factores que inciden en...">
              </div>

              <div>
                <label for="plan-justification" class="form-label">Justificación o relevancia</label>
                <textarea id="plan-justification" rows="3" class="form-textarea" placeholder="¿Por qué es importante estudiar o tratar este tema?">${escapeHtml(work.plan?.justification || '')}</textarea>
              </div>
            </div>
          </section>
        </div>

        <!-- Estructura de Secciones -->
        <div class="space-y-6">
          <section class="app-card p-6 bg-white space-y-4 sticky top-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                ${getIconSvg('documents', 'text-emerald-600', 18)}
                <span>3. Estructura</span>
              </h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                ${work.sections.length} secciones
              </span>
            </div>

            <p class="text-xs text-slate-500">
              Estas son las secciones que redactarás. Puedes agregar nuevas o eliminar las que no requieras.
            </p>

            <div id="planner-sections-list" class="space-y-2 max-h-80 overflow-y-auto pr-1">
              ${work.sections.map((sec, idx) => `
                <div class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white text-sm" data-id="${sec.id}">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-mono font-bold text-slate-400">${idx + 1}.</span>
                    <span class="font-medium text-slate-800 truncate">${escapeHtml(sec.title)}</span>
                  </div>
                  ${work.sections.length > 1 ? `
                    <button type="button" class="btn-delete-section text-slate-400 hover:text-red-600 p-1 transition-colors" data-id="${sec.id}" title="Eliminar sección">
                      ${getIconSvg('trash', '', 14)}
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>

            <!-- Formulario para agregar nueva sección -->
            <div class="pt-3 border-t border-slate-100 flex gap-2">
              <input id="input-new-section-title" type="text" class="form-input text-xs" placeholder="Nombre de nueva sección...">
              <button id="btn-add-section" class="btn btn-secondary text-xs px-3 whitespace-nowrap flex items-center gap-1">
                ${getIconSvg('plus', '', 14)}
                <span>Agregar</span>
              </button>
            </div>

            <div class="pt-4 border-t border-slate-100">
              <button id="btn-save-planner" class="btn btn-primary w-full flex items-center justify-center gap-2">
                ${getIconSvg('check', '', 16)}
                <span>Guardar Planificación</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  // Event Listeners
  const titleInput = container.querySelector('#plan-title');
  const typeSelect = container.querySelector('#plan-work-type');
  const authorInput = container.querySelector('#plan-author');
  const problemInput = container.querySelector('#plan-problem');
  const objectiveInput = container.querySelector('#plan-objective');
  const justInput = container.querySelector('#plan-justification');

  function persistCurrentForm() {
    store.updateCurrentWork({
      title: titleInput.value.trim() || 'Trabajo académico sin título'
    });
    store.updateMetadata({
      author: authorInput.value.trim()
    });
    store.updatePlan({
      problem: problemInput.value.trim(),
      generalObjective: objectiveInput.value.trim(),
      justification: justInput.value.trim()
    });
  }

  [titleInput, authorInput, problemInput, objectiveInput, justInput].forEach(el => {
    el?.addEventListener('input', () => persistCurrentForm());
  });

  typeSelect?.addEventListener('change', () => {
    persistCurrentForm();
    store.changeWorkType(typeSelect.value);
    renderPlanner(container);
  });

  container.querySelector('#btn-add-section')?.addEventListener('click', () => {
    const input = container.querySelector('#input-new-section-title');
    const title = input.value.trim();
    if (!title) return;
    store.addSection(title);
    renderPlanner(container);
  });

  container.querySelectorAll('.btn-delete-section').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id) {
        store.removeSection(id);
        renderPlanner(container);
      }
    });
  });

  container.querySelector('#btn-save-planner')?.addEventListener('click', () => {
    persistCurrentForm();
    if (typeof window.showToast === 'function') {
      window.showToast('Planificación guardada correctamente.', 'success');
    }
  });

  container.querySelector('#btn-proceed-editor')?.addEventListener('click', () => {
    persistCurrentForm();
    window.appNavigate?.('redactor');
  });
}
