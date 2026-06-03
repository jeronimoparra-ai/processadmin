// ═══════════════════════════════════════════════════════════════════════
// COMPONENTS/HEADER.JS - Header view synchronization logic
// ═══════════════════════════════════════════════════════════════════════

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
    case 'rubrica': return 'simulador';
    case 'organizer': return 'organizador';
    case 'export': return 'exportar';
    default: return viewId || 'panel';
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
