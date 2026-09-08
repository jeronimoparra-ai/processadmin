// ═══════════════════════════════════════════════════════════════════════
// APP/MAIN.JS - Punto de entrada principal modular de ProcessAdmin
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../core/state.js';
import { navigateTo } from './router.js';

// Exponer navegación global
window.appNavigate = navigateTo;
window.navigate = navigateTo; // Compatibilidad

// Helper Toast global minimalista
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-800 text-white' : type === 'error' ? 'bg-red-800 text-white' : 'bg-slate-900 text-white';
  toast.className = `p-3 rounded-lg shadow-lg text-xs font-medium ${bg} transition-all transform duration-300 opacity-0 translate-y-2 pointer-events-auto flex items-center justify-between gap-3`;
  toast.textContent = message;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
window.showToast = showToast;

function updateSidebarCount() {
  const countEl = document.getElementById('saved-document-count');
  if (countEl) {
    const list = store.getWorksList();
    countEl.textContent = list.length.toString();
  }
}

function initSidebar() {
  const sidebar = document.getElementById('side-panel');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar?.classList.add('is-open');
    overlay?.classList.add('is-visible');
    document.body.classList.add('sidebar-open');
  }

  function closeSidebar() {
    sidebar?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    document.body.classList.remove('sidebar-open');
  }

  toggleBtn?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) {
        navigateTo(view);
        if (window.innerWidth <= 900) {
          closeSidebar();
        }
      }
    });
  });
}

function initApp() {
  console.info('[ProcessAdmin] Inicializando arquitectura académica...');

  // 1. Inicializar tienda y cargar datos
  store.init();

  // 2. Suscribir actualización del contador de documentos
  store.subscribe(() => {
    updateSidebarCount();
  });
  updateSidebarCount();

  // 3. Inicializar Sidebar responsive
  initSidebar();

  // 4. Navegar a la vista inicial
  navigateTo('panel');

  console.info('[ProcessAdmin] Aplicación lista y operativa.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}