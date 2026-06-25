// ═══════════════════════════════════════════════════════════════════════
// COMPONENTS/SIDEBAR.JS - Navigation and responsive toggle logic
// ═══════════════════════════════════════════════════════════════════════

function updateActiveNavigation(viewId) {
  const canonicalViewId = getCanonicalViewId(viewId);
  document.querySelectorAll('.nav-btn, .nav-item').forEach(button => {
    if (!button.dataset || !button.dataset.view) return;
    const buttonView = getCanonicalViewId(button.dataset.view);
    button.classList.toggle('active', buttonView === canonicalViewId);
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('is-open');
  if (overlay) overlay.classList.toggle('is-visible');
}

function initSidebarControls() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  // Close sidebar on mobile when navigating
  document.querySelectorAll('.nav-btn, .nav-item').forEach(button => {
    button.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        toggleSidebar();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initSidebarControls);
