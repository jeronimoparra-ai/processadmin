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

// ======= Toasts and Confirmation Modal (non-blocking) =======
function _ensureToastContainer() {
  let container = document.getElementById('dp-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dp-toast-container';
    container.style.position = 'fixed';
    container.style.right = '1rem';
    container.style.bottom = '1rem';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', timeout = 3000) {
  const container = _ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `dp-toast dp-toast-${type}`;
  toast.style.marginTop = '8px';
  toast.style.minWidth = '220px';
  toast.style.padding = '10px 14px';
  toast.style.borderRadius = '8px';
  toast.style.background = type === 'error' ? 'rgba(220,38,38,0.95)' : type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(17,24,39,0.95)';
  toast.style.color = 'white';
  toast.style.boxShadow = '0 8px 20px rgba(2,6,23,0.4)';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.remove(); }, 400);
  }, timeout);
  return toast;
}

function _buildConfirmModal() {
  let modal = document.getElementById('dp-confirm-modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'dp-confirm-modal';
  modal.className = 'modal-backdrop';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <div class="modal-header"><h2 id="dp-confirm-title" class="font-bold"></h2></div>
      <div class="modal-body"><p id="dp-confirm-message"></p></div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="dp-confirm-cancel" class="dp-btn dp-btn-ghost">Cancelar</button>
        <button id="dp-confirm-ok" class="dp-btn dp-btn-accent">Aceptar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function showConfirm(options) {
  const modal = _buildConfirmModal();
  const titleEl = modal.querySelector('#dp-confirm-title');
  const messageEl = modal.querySelector('#dp-confirm-message');
  const okBtn = modal.querySelector('#dp-confirm-ok');
  const cancelBtn = modal.querySelector('#dp-confirm-cancel');

  titleEl.textContent = options.title || 'Confirmar';
  messageEl.textContent = options.message || '';
  okBtn.textContent = options.confirmText || 'Aceptar';
  cancelBtn.textContent = options.cancelText || 'Cancelar';

  return new Promise(resolve => {
    modal.style.display = 'flex';
    function cleanup() {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

let exportModalLastFocus = null;

function focusExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (!exportModal) return;

  const focusable = exportModal.querySelector('#closeExportModal, #copyMarkdownBtn, [href], button, [tabindex]:not([tabindex="-1"])');
  (focusable || exportModal).focus?.();
}

function handleExportModalKeydown(event) {
  if (event.key === 'Escape') {
    closeExportModal();
  }
}

function openExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (!exportModal) return;
  exportModalLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  exportModal.style.display = 'flex';
  exportModal.setAttribute('aria-hidden', 'false');
  exportModal.setAttribute('aria-modal', 'true');
  const modal = exportModal.querySelector('.modal-panel');
  if (modal) {
    modal.classList.remove('dp-modal-anim');
    void modal.offsetWidth;
    modal.classList.add('dp-modal-anim');
  }
  document.addEventListener('keydown', handleExportModalKeydown);
  focusExportModal();
}

function closeExportModal() {
  const exportModal = document.getElementById('exportModal');
  if (!exportModal) return;
  exportModal.style.display = 'none';
  exportModal.setAttribute('aria-hidden', 'true');
  exportModal.removeAttribute('aria-modal');
  const modal = exportModal.querySelector('.modal-panel');
  if (modal) {
    modal.classList.remove('dp-modal-anim');
    void modal.offsetWidth;
    modal.classList.add('dp-modal-anim');
  }
  document.removeEventListener('keydown', handleExportModalKeydown);
  if (exportModalLastFocus && typeof exportModalLastFocus.focus === 'function') {
    exportModalLastFocus.focus();
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
        showToast('No se pudo copiar automáticamente.', 'error');
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
