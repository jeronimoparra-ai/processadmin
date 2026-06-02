const VIEW_META = {
  panel: { title: 'Panel de control', sub: 'Resumen del estado de tu documento y del guardado local' },
  redactor: { title: 'Redactor asistido', sub: 'Redacta cada sección con orientación APA 7' },
  apa: { title: 'Gestor APA 7', sub: 'Genera y gestiona tus referencias bibliográficas' },
  simulador: { title: 'Evaluador de rúbrica', sub: 'Revisa criterios y puntajes antes de entregar' },
  organizador: { title: 'Organizador de ideas', sub: 'Estructura y organiza tus ideas principales' },
  checklist: { title: 'Checklist inteligente', sub: 'Verifica los requisitos visibles del documento' },
  exportar: { title: 'Exportación a Word', sub: 'Descarga tu documento en formato compatible' },
  historial: { title: 'Historial de documentos', sub: 'Reabre y administra tus exportaciones anteriores' },
  legal: { title: 'Información legal', sub: 'Privacidad, términos, contacto y alcance del sitio' },
  acerca: { title: 'Acerca del autor', sub: 'Sobre el proyecto y su creador' }
};

function getCanonicalViewId(viewId) {
  switch (viewId) {
    case 'rubrica':
      return 'simulador';
    case 'organizer':
      return 'organizador';
    case 'export':
      return 'exportar';
    default:
      return viewId || 'panel';
  }
}

function cleanupView() {
  try {
    if (state.countdownInterval) { clearInterval(state.countdownInterval); state.countdownInterval = null; }
    if (state.organizerSnapshotInterval) { clearInterval(state.organizerSnapshotInterval); state.organizerSnapshotInterval = null; }
    if (state.checklistDeadlineInterval) { clearInterval(state.checklistDeadlineInterval); state.checklistDeadlineInterval = null; }
    if (state.saveTimer) { clearTimeout(state.saveTimer); state.saveTimer = null; }
    if (state.exportValidationTimer) { clearTimeout(state.exportValidationTimer); state.exportValidationTimer = null; }
    if (state.animationId) { cancelAnimationFrame(state.animationId); state.animationId = null; }
  } catch (err) {
    state.lastCleanupError = err;
  }
}

function updateHeaderForView(viewId) {
  const canonicalViewId = getCanonicalViewId(viewId);
  const meta = VIEW_META[canonicalViewId] || VIEW_META.panel;
  const title = document.getElementById('header-title');
  const subtitle = document.getElementById('header-subtitle');

  if (title) title.textContent = meta.title;
  if (subtitle) subtitle.textContent = meta.sub;
}

function updateActiveNavigation(viewId) {
  const canonicalViewId = getCanonicalViewId(viewId);
  document.querySelectorAll('.nav-btn, .nav-item').forEach(button => {
    if (!button.dataset || !button.dataset.view) return;
    const buttonView = getCanonicalViewId(button.dataset.view);
    button.classList.toggle('active', buttonView === canonicalViewId);
  });
}

function resetWorkspaceAnimation() {
  const workspace = document.getElementById('main-workspace');
  if (!workspace) return;
  workspace.classList.remove('dp-view', 'dp-stagger');
  void workspace.offsetWidth;
  workspace.classList.add('dp-view', 'dp-stagger');
}

function openExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (!exportModal) return;
  exportModal.style.display = 'flex';
  exportModal.setAttribute('aria-hidden', 'false');
  const modal = exportModal.querySelector('.modal-panel');
  if (modal) {
    modal.classList.remove('dp-modal-anim');
    void modal.offsetWidth;
    modal.classList.add('dp-modal-anim');
  }
}

function closeExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (!exportModal) return;
  exportModal.style.display = 'none';
  exportModal.setAttribute('aria-hidden', 'true');
  const modal = exportModal.querySelector('.modal-panel');
  if (modal) {
    modal.classList.remove('dp-modal-anim');
    void modal.offsetWidth;
    modal.classList.add('dp-modal-anim');
  }
}

function bindExportModalControls() {
  const closeExport = document.getElementById('closeExportModal');
  const copyBtn = document.getElementById('copyMarkdownBtn');
  const exportModal = document.getElementById('exportModal');

  if (closeExport && !closeExport.dataset.bound) {
    closeExport.dataset.bound = 'true';
    closeExport.addEventListener('click', closeExportModal);
  }

  if (copyBtn && !copyBtn.dataset.bound) {
    copyBtn.dataset.bound = 'true';
    copyBtn.addEventListener('click', async () => {
      const content = document.getElementById('markdownOutput')?.innerText || '';
      try {
        await navigator.clipboard.writeText(content);
        const originalText = copyBtn.textContent || 'Copiar contenido';
        copyBtn.textContent = 'Copiado';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1500);
      } catch (error) {
        alert('No se pudo copiar automáticamente.');
      }
    });
  }

  if (exportModal && !exportModal.dataset.bound) {
    exportModal.dataset.bound = 'true';
    exportModal.addEventListener('click', event => {
      if (event.target === exportModal) closeExportModal();
    });
  }

  window.openExportModal = openExportModal;
  window.closeExportModal = closeExportModal;
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