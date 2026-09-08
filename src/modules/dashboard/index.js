// ═══════════════════════════════════════════════════════════════════════
// MODULES/DASHBOARD/INDEX.JS - Centro de trabajo (Inicio)
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { WORK_TYPES, DEFAULT_CHECKLIST_CRITERIA } from '../../core/constants.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml } from '../../utils/helpers.js';

export function renderDashboard(container) {
  const work = store.getCurrentWork();
  const typeDef = WORK_TYPES[work.workType] || WORK_TYPES.ensayo;
  const wordCount = store.getTotalWordCount();
  const paraCount = store.getTotalParagraphCount();
  const citationsCount = (work.citations || []).length;

  // Cálculo de progreso real y objetivo
  let checksPassed = 0;
  const criteriaResults = DEFAULT_CHECKLIST_CRITERIA.map(crit => {
    const passed = crit.check(work);
    if (passed) checksPassed++;
    return { ...crit, passed };
  });

  const progressPercent = Math.round((checksPassed / DEFAULT_CHECKLIST_CRITERIA.length) * 100);
  const pendingItems = criteriaResults.filter(c => !c.passed);

  const lastUpdatedFormatted = work.updatedAt
    ? new Date(work.updatedAt).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recién creado';

  // Identificar primera sección con contenido pendiente
  const emptySection = work.sections.find(s => !(s.content || '').trim());
  const activeSectionLabel = emptySection ? emptySection.title : (work.sections[0]?.title || 'Introducción');

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Tarjeta de bienvenida y trabajo activo -->
      <section class="app-card p-6 md:p-8 border-l-4 border-l-blue-600 bg-white">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-accent">${escapeHtml(typeDef.name)}</span>
              <span class="text-xs text-slate-500 font-mono">Modificado: ${escapeHtml(lastUpdatedFormatted)}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              ${escapeHtml(work.title || 'Trabajo académico sin título')}
            </h1>
            <p class="text-slate-600 text-sm mt-1 max-w-2xl">
              ${escapeHtml(typeDef.description)}
            </p>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
            <button id="btn-continue-work" class="btn btn-primary shadow-sm flex items-center gap-2">
              ${getIconSvg('editor', 'text-white', 18)}
              <span>Continuar redacción</span>
            </button>
            <button id="btn-plan-work" class="btn btn-secondary flex items-center gap-2">
              ${getIconSvg('planner', '', 18)}
              <span>Planificar</span>
            </button>
          </div>
        </div>

        <!-- Barra de avance general -->
        <div class="mt-8 pt-6 border-t border-slate-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-slate-700">Progreso del documento</span>
            <span class="text-sm font-bold text-blue-600">${progressPercent}%</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}" style="width: ${progressPercent}%"></div>
          </div>
        </div>
      </section>

      <!-- Métricas y estado real -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="app-card p-5 bg-white">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Palabras escritas</span>
            ${getIconSvg('editor', 'text-blue-500', 16)}
          </div>
          <p class="text-2xl font-bold text-slate-900">${wordCount}</p>
          <p class="text-xs text-slate-500 mt-1">${paraCount} ${paraCount === 1 ? 'párrafo' : 'párrafos'}</p>
        </div>

        <div class="app-card p-5 bg-white">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Referencias APA 7</span>
            ${getIconSvg('apa', 'text-indigo-500', 16)}
          </div>
          <p class="text-2xl font-bold text-slate-900">${citationsCount}</p>
          <p class="text-xs text-slate-500 mt-1">${citationsCount > 0 ? 'Listas para el documento' : 'Sin referencias aún'}</p>
        </div>

        <div class="app-card p-5 bg-white">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Secciones activas</span>
            ${getIconSvg('planner', 'text-emerald-500', 16)}
          </div>
          <p class="text-2xl font-bold text-slate-900">${work.sections.length}</p>
          <p class="text-xs text-slate-500 mt-1 truncate" title="Próxima sección sugerida">Sugerida: ${escapeHtml(activeSectionLabel)}</p>
        </div>

        <div class="app-card p-5 bg-white">
          <div class="flex items-center justify-between text-slate-500 mb-1">
            <span class="text-xs font-semibold uppercase tracking-wider">Estado pre-entrega</span>
            ${getIconSvg('review', progressPercent >= 80 ? 'text-emerald-500' : 'text-amber-500', 16)}
          </div>
          <p class="text-2xl font-bold ${progressPercent >= 80 ? 'text-emerald-600' : 'text-amber-600'}">
            ${progressPercent >= 80 ? 'Listo' : 'En redacción'}
          </p>
          <p class="text-xs text-slate-500 mt-1">${pendingItems.length} comprobaciones pendientes</p>
        </div>
      </div>

      <!-- Pendientes objetivos y comprobables -->
      <section class="app-card p-6 bg-white space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Comprobaciones para la entrega</h2>
            <p class="text-sm text-slate-500">Aspectos objetivos que deben completarse antes de generar el Word definitivo.</p>
          </div>
          <button id="btn-view-review" class="btn btn-ghost text-xs font-semibold text-blue-600">
            Ver revisión completa →
          </button>
        </div>

        <div class="space-y-2 mt-4">
          ${criteriaResults.map(item => `
            <div class="flex items-start gap-3 p-3 rounded-lg border ${item.passed ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'}">
              <span class="mt-0.5 ${item.passed ? 'text-emerald-600' : 'text-slate-400'}">
                ${getIconSvg(item.passed ? 'check' : 'alert', '', 18)}
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium ${item.passed ? 'line-through text-slate-500' : 'text-slate-800'}">
                  ${escapeHtml(item.label)}
                </p>
              </div>
              <span class="text-xs font-semibold uppercase px-2 py-0.5 rounded ${item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${item.passed ? 'Cumplido' : 'Pendiente'}
              </span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Acciones rápidas de flujo -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button id="quick-action-apa" class="app-card p-5 bg-white text-left hover:border-blue-300 transition-colors flex items-center gap-4">
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            ${getIconSvg('apa', '', 22)}
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Gestionar Referencias</h3>
            <p class="text-xs text-slate-500">Citas en texto y bibliografía APA 7</p>
          </div>
        </button>

        <button id="quick-action-review" class="app-card p-5 bg-white text-left hover:border-blue-300 transition-colors flex items-center gap-4">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            ${getIconSvg('review', '', 22)}
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Revisar Documento</h3>
            <p class="text-xs text-slate-500">Validaciones previas a la entrega</p>
          </div>
        </button>

        <button id="quick-action-export" class="app-card p-5 bg-white text-left hover:border-blue-300 transition-colors flex items-center gap-4">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
            ${getIconSvg('export', '', 22)}
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Exportar a Word</h3>
            <p class="text-xs text-slate-500">Descarga directa en formato .docx</p>
          </div>
        </button>
      </section>
    </div>
  `;

  // Bindings
  container.querySelector('#btn-continue-work')?.addEventListener('click', () => {
    window.appNavigate?.('redactor');
  });

  container.querySelector('#btn-plan-work')?.addEventListener('click', () => {
    window.appNavigate?.('planificar');
  });

  container.querySelector('#btn-view-review')?.addEventListener('click', () => {
    window.appNavigate?.('revisar');
  });

  container.querySelector('#quick-action-apa')?.addEventListener('click', () => {
    window.appNavigate?.('apa');
  });

  container.querySelector('#quick-action-review')?.addEventListener('click', () => {
    window.appNavigate?.('revisar');
  });

  container.querySelector('#quick-action-export')?.addEventListener('click', () => {
    window.appNavigate?.('exportar');
  });
}
