// ═══════════════════════════════════════════════════════════════════════
// MODULES/REVIEW/INDEX.JS - Módulo de Revisión Pre-entrega (Checklist y Validación)
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml } from '../../utils/helpers.js';

export function renderReview(container) {
  const work = store.getCurrentWork();
  const totalWords = store.getTotalWordCount();

  // ── Auditoría Objetiva del Documento ──────────────────────────────
  const issues = [];
  const passes = [];

  // 1. Título y datos de portada
  if (!work.title || work.title.trim().length < 6 || work.title.toLowerCase().includes('sin título')) {
    issues.push({
      category: 'Portada',
      severity: 'high',
      title: 'Falta un título definitivo',
      desc: 'El documento no tiene un título representativo o aún conserva el nombre por defecto.',
      action: 'planificar',
      actionLabel: 'Asignar título'
    });
  } else {
    passes.push({ category: 'Portada', label: `Título asignado: "${work.title}"` });
  }

  if (!work.metadata?.author) {
    issues.push({
      category: 'Portada',
      severity: 'medium',
      title: 'Nombre de autor(a) pendiente',
      desc: 'No has registrado el nombre del estudiante en los datos de portada.',
      action: 'planificar',
      actionLabel: 'Agregar autor'
    });
  } else {
    passes.push({ category: 'Portada', label: `Autor registrado: ${work.metadata.author}` });
  }

  // 2. Secciones y Contenido
  if (!work.sections || work.sections.length === 0) {
    issues.push({
      category: 'Estructura',
      severity: 'high',
      title: 'No hay secciones creadas',
      desc: 'Tu documento no tiene ninguna sección definida.',
      action: 'planificar',
      actionLabel: 'Crear secciones'
    });
  } else {
    const emptySections = work.sections.filter(s => !(s.content || '').trim());
    const shortSections = work.sections.filter(s => {
      const w = (s.content || '').trim().split(/\s+/).filter(Boolean).length;
      return w > 0 && w < 40;
    });

    if (emptySections.length > 0) {
      issues.push({
        category: 'Redacción',
        severity: 'high',
        title: `${emptySections.length} ${emptySections.length === 1 ? 'sección vacía' : 'secciones vacías'}`,
        desc: `Las secciones: ${emptySections.map(s => `"${s.title}"`).join(', ')} no contienen texto.`,
        action: 'redactor',
        actionLabel: 'Completar en redactor'
      });
    }

    if (shortSections.length > 0) {
      issues.push({
        category: 'Redacción',
        severity: 'medium',
        title: `${shortSections.length} ${shortSections.length === 1 ? 'sección muy breve' : 'secciones muy breves'}`,
        desc: `Las secciones: ${shortSections.map(s => `"${s.title}"`).join(', ')} tienen menos de 40 palabras.`,
        action: 'redactor',
        actionLabel: 'Ampliar contenido'
      });
    }

    if (emptySections.length === 0 && shortSections.length === 0) {
      passes.push({ category: 'Redacción', label: `Todas las secciones (${work.sections.length}) tienen contenido suficiente.` });
    }
  }

  // 3. Extensión global
  if (totalWords < 150) {
    issues.push({
      category: 'Extensión',
      severity: 'medium',
      title: 'Volumen de texto incipiente',
      desc: `El documento cuenta actualmente con ${totalWords} palabras. La mayoría de entregas académicas requieren mayor desarrollo.`,
      action: 'redactor',
      actionLabel: 'Continuar redactando'
    });
  } else {
    passes.push({ category: 'Extensión', label: `Volumen de redacción actual: ${totalWords} palabras.` });
  }

  // 4. Referencias y Citas APA 7
  const fullText = (work.sections || []).map(s => s.content || '').join(' ');
  const hasInTextCitation = /\([A-ZÁÉÍÓÚÑa-záéíóúñ\s&.,]+,\s*\d{4}[^)]*\)/.test(fullText);
  const citationsCount = (work.citations || []).length;

  if (citationsCount === 0) {
    issues.push({
      category: 'APA 7',
      severity: 'high',
      title: 'Sin fuentes bibliográficas registradas',
      desc: 'El trabajo no incluye ninguna referencia en formato APA 7.',
      action: 'apa',
      actionLabel: 'Agregar referencias'
    });
  } else {
    passes.push({ category: 'APA 7', label: `${citationsCount} ${citationsCount === 1 ? 'referencia bibliográfica registrada' : 'referencias bibliográficas registradas'}.` });
  }

  if (citationsCount > 0 && !hasInTextCitation) {
    issues.push({
      category: 'APA 7',
      severity: 'medium',
      title: 'Referencias sin citas en el texto',
      desc: 'Tienes fuentes registradas en la bibliografía pero no se detectan citas directas o parentéticas (Autor, Año) en el cuerpo del documento.',
      action: 'redactor',
      actionLabel: 'Insertar citas'
    });
  } else if (hasInTextCitation) {
    passes.push({ category: 'APA 7', label: 'Se detectan citas en texto correspondientes a normas APA 7.' });
  }

  // Checklist de formato APA 7
  const apaFormatChecklist = [
    { text: 'Márgenes de 2.54 cm (1 pulgada) en todos los lados', hint: 'Configurado automáticamente al exportar a Word.' },
    { text: 'Fuente tipográfica legible (Times New Roman 12pt)', hint: 'Aplicada por defecto en la exportación.' },
    { text: 'Interlineado doble (2.0) sin espacio adicional entre párrafos', hint: 'Garantizado por el motor Word DOCX.' },
    { text: 'Sangría en la primera línea de cada párrafo (1.27 cm / 0.5 pulg)', hint: 'Generada automáticamente al exportar.' },
    { text: 'Sangría francesa en la lista de referencias', hint: 'Aplicada a todas las fuentes generadas en el gestor APA.' }
  ];

  const isReady = issues.filter(i => i.severity === 'high').length === 0;

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Encabezado del módulo -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Revisión Pre-Entrega</h1>
          <p class="text-sm text-slate-600 mt-1">
            Comprobaciones objetivas para saber qué corregir antes de generar el Word definitivo.
          </p>
        </div>
        <button id="btn-review-export" class="btn ${isReady ? 'btn-primary' : 'btn-secondary'} shadow-sm flex items-center gap-2">
          ${getIconSvg('export', isReady ? 'text-white' : '', 16)}
          <span>Proceder a Exportar</span>
        </button>
      </div>

      <!-- Estado General de Preparación -->
      <div class="app-card p-6 border-l-4 ${isReady ? 'border-l-emerald-500 bg-white' : 'border-l-amber-500 bg-white'} space-y-2">
        <div class="flex items-center gap-3">
          <span class="${isReady ? 'text-emerald-600' : 'text-amber-500'}">
            ${getIconSvg(isReady ? 'check' : 'alert', '', 24)}
          </span>
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              ${isReady ? 'Documento preparado para entrega' : `${issues.length} aspectos por resolver`}
            </h2>
            <p class="text-xs text-slate-600">
              ${isReady
                ? 'El trabajo cumple con los requisitos estructurales, citas mínimas y formato necesarios para exportar.'
                : 'Revisa las observaciones marcadas a continuación antes de descargar tu archivo final.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de Observaciones por Resolver -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 space-y-4">
          <div class="app-card p-6 bg-white space-y-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span>¿Qué debo corregir?</span>
              <span class="badge ${issues.length === 0 ? 'badge-success' : 'badge-warning'}">
                ${issues.length} ${issues.length === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </h3>

            ${issues.length === 0 ? `
              <div class="text-center py-8 text-slate-500 text-sm">
                ${getIconSvg('check', 'text-emerald-500 mx-auto mb-2', 32)}
                <p class="font-bold text-slate-800">¡Excelente trabajo!</p>
                <p class="text-xs mt-1">No se encontraron inconsistencias críticas en el documento.</p>
              </div>
            ` : `
              <div class="space-y-3">
                ${issues.map(iss => `
                  <div class="p-4 rounded-lg border ${iss.severity === 'high' ? 'border-red-200 bg-red-50/40' : 'border-amber-200 bg-amber-50/40'} space-y-2">
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="badge ${iss.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'} text-[10px] font-bold uppercase">
                          ${escapeHtml(iss.category)}
                        </span>
                        <h4 class="text-sm font-bold text-slate-900">${escapeHtml(iss.title)}</h4>
                      </div>
                      ${iss.action ? `
                        <button type="button" class="btn-action-goto btn btn-ghost text-xs px-2 py-1 text-blue-600 hover:text-blue-800" data-view="${iss.action}">
                          ${escapeHtml(iss.actionLabel)} →
                        </button>
                      ` : ''}
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(iss.desc)}</p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Elementos Verificados con Éxito -->
          <div class="app-card p-6 bg-white space-y-3">
            <h3 class="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
              Comprobaciones superadas (${passes.length})
            </h3>
            <div class="space-y-2">
              ${passes.map(p => `
                <div class="flex items-center gap-2.5 text-xs text-slate-600 py-1">
                  <span class="text-emerald-500">${getIconSvg('check', '', 14)}</span>
                  <span><strong>${escapeHtml(p.category)}:</strong> ${escapeHtml(p.label)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Checklist de Formato APA 7 -->
        <div class="lg:col-span-5 space-y-4">
          <section class="app-card p-6 bg-white space-y-4 sticky top-6">
            <h3 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              ${getIconSvg('review', 'text-blue-600', 16)}
              <span>Verificación de Formato APA 7</span>
            </h3>
            <p class="text-xs text-slate-500">
              Requisitos que el generador de Word de ProcessAdmin garantiza automáticamente:
            </p>

            <div class="space-y-3">
              ${apaFormatChecklist.map((item, idx) => `
                <div class="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span class="text-emerald-600 mt-0.5">${getIconSvg('check', '', 14)}</span>
                  <div>
                    <p class="font-semibold text-slate-800">${escapeHtml(item.text)}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(item.hint)}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="pt-4 border-t border-slate-100">
              <button id="btn-direct-export" class="btn btn-primary w-full flex items-center justify-center gap-2">
                ${getIconSvg('export', 'text-white', 16)}
                <span>Ir al Módulo de Exportación</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  // Bindings
  container.querySelectorAll('.btn-action-goto').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) window.appNavigate?.(view);
    });
  });

  container.querySelector('#btn-review-export')?.addEventListener('click', () => {
    window.appNavigate?.('exportar');
  });

  container.querySelector('#btn-direct-export')?.addEventListener('click', () => {
    window.appNavigate?.('exportar');
  });
}
