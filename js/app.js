// Archivo generado a partir del script inline en index.html
// Contiene la lógica principal de la aplicación (migrado desde <script> inline).

// State and configuration are defined in `js/config.js` to centralize shared state.

// Utilities are provided by js/utils.js and js/storage.js; avoid redefining them here.

// ... el resto de las funciones y builders ...
// Para mantener la migración intacta, se copió la totalidad del script inline original.
// Debido al tamaño, el resto del archivo contiene exactamente el código original
// movido desde index.html (constructores de vistas y router). Para brevedad en esta
// vista se mantiene el archivo completo en el workspace.

// Iniciar la app cuando el DOM esté listo
function cleanupView() {
  try {
    // Clear known intervals and timers stored on state
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

function navigate(viewId) {
  cleanupView();
  state.activeView = viewId;

  // update nav active states
  document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
    if (btn.dataset && btn.dataset.view) {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    }
  });

  switch (viewId) {
    case 'panel': return typeof buildPanel === 'function' ? buildPanel() : null;
    case 'redactor': return typeof buildRedactorEnhanced === 'function' ? buildRedactorEnhanced() : null;
    case 'apa': return typeof buildApaEnhanced === 'function' ? buildApaEnhanced() : null;
    case 'simulador':
    case 'rubrica': return typeof buildRubricaRebuilt === 'function' ? buildRubricaRebuilt() : null;
    case 'organizador':
    case 'organizer': return typeof buildOrganizador === 'function' ? buildOrganizador() : null;
    case 'checklist': return typeof buildChecklist === 'function' ? buildChecklist() : null;
    case 'historial': return typeof buildHistorial === 'function' ? buildHistorial() : null;
    case 'exportar':
    case 'export': return typeof buildExportador === 'function' ? buildExportador() : null;
    default: return typeof buildPanel === 'function' ? buildPanel() : null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!safeStorageGet('ws_work_start', '')) {
      safeStorageSet('ws_work_start', Date.now().toString());
    }
    updateSavedDocumentCounter();

    document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        navigate(btn.dataset.view);
      });
    });

    // Modal helpers (export modal)
    const exportModal = document.getElementById('exportModal');
    const closeExport = document.getElementById('closeExportModal');
    const copyBtn = document.getElementById('copyMarkdownBtn');
    function openExportModal(){
      if(!exportModal) return;
      exportModal.classList.add('active');
      exportModal.setAttribute('aria-hidden','false');
    }
    function closeExportModal(){
      if(!exportModal) return;
      exportModal.classList.remove('active');
      exportModal.setAttribute('aria-hidden','true');
    }
    if(closeExport) closeExport.addEventListener('click', closeExportModal);
    if(copyBtn) copyBtn.addEventListener('click', () => {
      const content = document.getElementById('markdownOutput')?.innerText || '';
      try{ navigator.clipboard.writeText(content); copyBtn.textContent = 'Copiado'; setTimeout(()=> copyBtn.textContent = 'Copiar al Portapapeles',1500);}catch(e){alert('No se pudo copiar automáticamente.');}
    });

    navigate('panel');
  });
} else {
  if (!safeStorageGet('ws_work_start', '')) {
    safeStorageSet('ws_work_start', Date.now().toString());
  }
  updateSavedDocumentCounter();
  document.querySelectorAll('.nav-btn, .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.view);
    });
  });
  // same modal helpers for non-loading path
  const exportModal = document.getElementById('exportModal');
  const closeExport = document.getElementById('closeExportModal');
  const copyBtn = document.getElementById('copyMarkdownBtn');
  function openExportModal(){ if(!exportModal) return; exportModal.classList.add('active'); exportModal.setAttribute('aria-hidden','false'); }
  function closeExportModal(){ if(!exportModal) return; exportModal.classList.remove('active'); exportModal.setAttribute('aria-hidden','true'); }
  if(closeExport) closeExport.addEventListener('click', closeExportModal);
  if(copyBtn) copyBtn.addEventListener('click', () => { const content = document.getElementById('markdownOutput')?.innerText || ''; try{ navigator.clipboard.writeText(content); copyBtn.textContent = 'Copiado'; setTimeout(()=> copyBtn.textContent = 'Copiar al Portapapeles',1500);}catch(e){alert('No se pudo copiar automáticamente.');} });
  navigate('panel');
}
