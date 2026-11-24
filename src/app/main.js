// ═══════════════════════════════════════════════════════════════════════
// APP.JS - Main application entry point and router
// ═══════════════════════════════════════════════════════════════════════

function cleanupView() {
  try {
    if (window.state.countdownInterval) { clearInterval(window.state.countdownInterval); window.state.countdownInterval = null; }
    if (window.state.organizerSnapshotInterval) { clearInterval(window.state.organizerSnapshotInterval); window.state.organizerSnapshotInterval = null; }
    if (window.state.checklistDeadlineInterval) { clearInterval(window.state.checklistDeadlineInterval); window.state.checklistDeadlineInterval = null; }
    if (window.state.exportValidationTimer) { clearTimeout(window.state.exportValidationTimer); window.state.exportValidationTimer = null; }
    if (window.state.animationId) { cancelAnimationFrame(window.state.animationId); window.state.animationId = null; }
  } catch (err) {
    window.state.lastCleanupError = err;
  }
}


function finishTemplateSave() {
  window.state.pendingTemplate = null;
  const next = window.state.afterTemplateSave;
  window.state.afterTemplateSave = null;
  if (next) next();
}

function guardPendingFields() {
  if (flushPendingFields()) return true;
  showToast('No se pudieron guardar los cambios en este navegador.', 'error');
  return false;
}

function openProject(id, view = 'panel') {
  if (window.state.pendingTemplate) {
    window.state.afterTemplateSave = () => openProject(id, view);
    return;
  }
  if (!guardPendingFields()) return;
  const url = new URL(location.href);
  url.searchParams.set('project', id);
  url.searchParams.set('view', view);
  location.assign(url);
}

function initProjectSelector() {
  const select = document.getElementById('project-select');
  for (const project of listProjects()) select.add(new Option(project.name, project.id));
  select.value = activeProjectId;
  select.addEventListener('change', () => {
    const id = select.value;
    select.value = activeProjectId;
    openProject(id);
  });
  document.getElementById('create-project').addEventListener('click', () => {
    const name = window.prompt('Nombre del proyecto')?.trim();
    if (!name || !guardPendingFields()) return;
    const id = createProject(name);
    if (id) openProject(id);
    else showToast('No se pudo guardar el proyecto en este navegador.', 'error');
  });
}

window.addEventListener('pagehide', flushPendingFields);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushPendingFields();
});

function navigate(viewId) {
  if (window.state.academic?.unsavedEditor && !window.state.academic.unsavedEditor()) return false;
  if (window.state.pendingTemplate) {
    window.state.afterTemplateSave = () => navigate(viewId);
    return;
  }
  if (!guardPendingFields()) return;
  cleanupView();
  window.state.activeView = viewId;

  updateHeaderForView(viewId);
  updateActiveNavigation(viewId);
  resetWorkspaceAnimation();

  switch (getCanonicalViewId(viewId)) {
    case 'planner': return buildAcademicPlanner();
    case 'library': return buildAcademicLibrary();
    case 'studio': return buildAcademicStudio();
    case 'review': return buildAcademicReview();
    case 'publishing': return buildAcademicPublishing();
    case 'panel':
      return typeof buildPanel === 'function' ? buildPanel() : null;
    case 'redactor':
      return typeof buildRedactorEnhanced === 'function' ? buildRedactorEnhanced() : null;
    case 'apa':
      return typeof buildApaEnhanced === 'function' ? buildApaEnhanced() : null;
    case 'simulador':
      return typeof buildRubricaRebuilt === 'function' ? buildRubricaRebuilt() : null;
    case 'organizador':
      return typeof buildOrganizador === 'function' ? buildOrganizador() : null;
    case 'checklist':
      return typeof buildChecklist === 'function' ? buildChecklist() : null;
    case 'historial':
      return typeof buildHistorial === 'function' ? buildHistorial() : null;
    case 'legal':
      return typeof buildLegalView === 'function' ? buildLegalView() : null;
    case 'acerca':
      return typeof buildAcercaView === 'function' ? buildAcercaView() : null;
    case 'exportar':
      return typeof buildExportador === 'function' ? buildExportador() : null;
    default:
      return typeof buildPanel === 'function' ? buildPanel() : null;
  }
}

function initApp() {
  if (!safeStorageGet('ws_work_start', '')) {
    safeStorageSet('ws_work_start', Date.now().toString());
  }

  updateSavedDocumentCounter();
  bindExportModalControls();
  initSidebarControls();
  initProjectSelector();

  document.querySelectorAll('.nav-btn, .nav-item').forEach(button => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      navigate(button.dataset.view);
    });
  });

  navigate(window.state.activeView || 'panel');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}