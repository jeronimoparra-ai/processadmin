// ═══════════════════════════════════════════════════════════════════════
// APP.JS - Main application entry point and router
// ═══════════════════════════════════════════════════════════════════════

function cleanupView() {
  try {
    if (window.state.countdownInterval) { clearInterval(window.state.countdownInterval); window.state.countdownInterval = null; }
    if (window.state.organizerSnapshotInterval) { clearInterval(window.state.organizerSnapshotInterval); window.state.organizerSnapshotInterval = null; }
    if (window.state.checklistDeadlineInterval) { clearInterval(window.state.checklistDeadlineInterval); window.state.checklistDeadlineInterval = null; }
    if (window.state.saveTimer) { clearTimeout(window.state.saveTimer); window.state.saveTimer = null; }
    if (window.state.exportValidationTimer) { clearTimeout(window.state.exportValidationTimer); window.state.exportValidationTimer = null; }
    if (window.state.animationId) { cancelAnimationFrame(window.state.animationId); window.state.animationId = null; }
  } catch (err) {
    window.state.lastCleanupError = err;
  }
}


function navigate(viewId) {
  cleanupView();
  state.activeView = viewId;

  updateHeaderForView(viewId);
  updateActiveNavigation(viewId);
  resetWorkspaceAnimation();

  switch (getCanonicalViewId(viewId)) {
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

  document.querySelectorAll('.nav-btn, .nav-item').forEach(button => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      navigate(button.dataset.view);
    });
  });

  document.querySelectorAll('.header-quick').forEach(button => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      navigate(button.dataset.view);
    });
  });

  navigate(state.activeView || 'panel');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}