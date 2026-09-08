// ═══════════════════════════════════════════════════════════════════════
// APP/ROUTER.JS - Router y navegación de ProcessAdmin
// ═══════════════════════════════════════════════════════════════════════

import { renderDashboard } from '../modules/dashboard/index.js';
import { renderPlanner } from '../modules/planner/index.js';
import { renderEditor } from '../modules/editor/index.js';
import { renderApa } from '../modules/apa/index.js';
import { renderReview } from '../modules/review/index.js';
import { renderExport } from '../modules/export/index.js';
import { renderDocuments } from '../modules/documents/index.js';
import { renderInfo } from '../modules/info/index.js';

export const ROUTES = Object.freeze({
  panel: { id: 'panel', title: 'Inicio', subtitle: 'Centro de trabajo y avance real del documento', render: renderDashboard },
  planificar: { id: 'planificar', title: 'Planificar', subtitle: 'Estructura, objetivos y esquema de redacción', render: renderPlanner },
  redactor: { id: 'redactor', title: 'Redactar', subtitle: 'Redacción asistida con formato académico y citas', render: renderEditor },
  apa: { id: 'apa', title: 'APA 7', subtitle: 'Gestión de referencias bibliográficas y citas en texto', render: renderApa },
  revisar: { id: 'revisar', title: 'Revisar', subtitle: 'Comprobaciones objetivas previas a la entrega', render: renderReview },
  exportar: { id: 'exportar', title: 'Exportar Word', subtitle: 'Descarga de documento .docx con normas APA 7', render: renderExport },
  trabajos: { id: 'trabajos', title: 'Mis Trabajos', subtitle: 'Administración de trabajos académicos guardados', render: renderDocuments },
  legal: { id: 'legal', title: 'Información Legal', subtitle: 'Privacidad, términos y alcance académico', render: (c) => renderInfo(c, 'legal') },
  acerca: { id: 'acerca', title: 'Acerca de ProcessAdmin', subtitle: 'Sobre el proyecto y su autoría', render: (c) => renderInfo(c, 'acerca') }
});

export function normalizeRoute(viewId) {
  const map = {
    inicio: 'panel',
    organizador: 'planificar',
    ideas: 'planificar',
    simulador: 'revisar',
    rubrica: 'revisar',
    checklist: 'revisar',
    historial: 'trabajos',
    documents: 'trabajos',
    export: 'exportar'
  };
  return map[viewId] || viewId || 'panel';
}

export function navigateTo(viewId) {
  const canonicalId = normalizeRoute(viewId);
  const route = ROUTES[canonicalId] || ROUTES.panel;

  const workspace = document.getElementById('main-workspace');
  if (!workspace) return;

  // Actualizar encabezado
  const headerTitle = document.getElementById('header-title');
  const headerSub = document.getElementById('header-subtitle');
  if (headerTitle) headerTitle.textContent = route.title;
  if (headerSub) headerSub.textContent = route.subtitle;

  // Actualizar navegación activa en sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const btnView = normalizeRoute(btn.dataset.view);
    btn.classList.toggle('active', btnView === canonicalId);
  });

  // Limpiar y renderizar
  workspace.innerHTML = '';
  try {
    route.render(workspace);
  } catch (err) {
    console.error(`[ProcessAdmin Router] Error renderizando vista "${canonicalId}":`, err);
    workspace.innerHTML = `
      <div class="app-card p-8 text-center text-red-600 space-y-2">
        <h3 class="text-lg font-bold">Error al cargar la sección</h3>
        <p class="text-xs text-slate-500">${escape(err.message)}</p>
        <button onclick="window.appNavigate('panel')" class="btn btn-secondary text-xs mt-2">Volver al Inicio</button>
      </div>
    `;
  }

  // Scroll arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
