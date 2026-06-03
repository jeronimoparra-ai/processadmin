// ═══════════════════════════════════════════════════════════════════════
// COMPONENTS/UICOMPONENTS.JS - Modals, alerts, and shared UI behaviors
// ═══════════════════════════════════════════════════════════════════════

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
