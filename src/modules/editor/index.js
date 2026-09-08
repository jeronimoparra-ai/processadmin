// ═══════════════════════════════════════════════════════════════════════
// MODULES/EDITOR/INDEX.JS - Redactor Académico Principal
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { WORK_TYPES, ACADEMIC_CONNECTORS } from '../../core/constants.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml } from '../../utils/helpers.js';

let activeSectionId = null;
let viewMode = 'section'; // 'section' o 'full'

export function renderEditor(container) {
  const work = store.getCurrentWork();
  const typeDef = WORK_TYPES[work.workType] || WORK_TYPES.ensayo;

  if (!work.sections || work.sections.length === 0) {
    store.addSection('Introducción', 'introduccion');
  }

  if (!activeSectionId || !work.sections.some(s => s.id === activeSectionId)) {
    activeSectionId = work.sections[0].id;
  }

  const activeSection = work.sections.find(s => s.id === activeSectionId) || work.sections[0];
  const sectionWords = countWords(activeSection.content || '');
  const totalWords = store.getTotalWordCount();
  const totalParas = store.getTotalParagraphCount();

  container.innerHTML = `
    <div class="space-y-4 max-w-6xl mx-auto">
      <!-- Barra superior de control del editor -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div class="flex items-center gap-3">
          <span class="badge badge-accent">${escapeHtml(typeDef.name)}</span>
          <h1 class="text-lg font-bold text-slate-900 truncate max-w-md" title="${escapeHtml(work.title)}">
            ${escapeHtml(work.title || 'Trabajo académico')}
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <!-- Switch de modo: Sección vs Documento Completo -->
          <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button id="btn-mode-section" class="px-3 py-1.5 rounded-md ${viewMode === 'section' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'}">
              Por secciones
            </button>
            <button id="btn-mode-full" class="px-3 py-1.5 rounded-md ${viewMode === 'full' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'}">
              Texto continuo
            </button>
          </div>

          <button id="btn-insert-cite" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" title="Insertar cita APA 7 en el texto">
            ${getIconSvg('apa', 'text-indigo-600', 14)}
            <span>Insertar Cita</span>
          </button>

          <button id="btn-editor-export" class="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
            ${getIconSvg('export', 'text-white', 14)}
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <!-- Layout del editor -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Navegación lateral de secciones y guías -->
        <aside class="lg:col-span-3 space-y-4">
          <!-- Lista de secciones -->
          <div class="app-card p-4 bg-white space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Secciones</span>
              <button id="btn-quick-add-sec" class="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                ${getIconSvg('plus', '', 12)}
                <span>Nueva</span>
              </button>
            </div>

            <div class="space-y-1 max-h-72 overflow-y-auto pr-1">
              ${work.sections.map((sec, idx) => {
                const words = countWords(sec.content || '');
                const isActive = sec.id === activeSectionId;
                return `
                  <button type="button" class="btn-select-section w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${isActive ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}" data-id="${sec.id}">
                    <span class="truncate pr-2">${idx + 1}. ${escapeHtml(sec.title)}</span>
                    <span class="text-[11px] font-mono ${words > 0 ? 'text-slate-500' : 'text-slate-300'}">${words} p.</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Conectores académicos rápidos -->
          <div class="app-card p-4 bg-white space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
              Conectores académicos
            </span>
            <p class="text-[11px] text-slate-500">Haz clic para insertar en la posición actual del cursor:</p>

            <div class="space-y-2">
              <details class="text-xs" open>
                <summary class="font-semibold text-slate-700 cursor-pointer py-1">Introducción / Apertura</summary>
                <div class="flex flex-wrap gap-1.5 pt-1.5">
                  ${ACADEMIC_CONNECTORS.introduccion.map(con => `
                    <button type="button" class="btn-insert-text px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] text-slate-700 transition-colors" data-text="${con} ">
                      ${con}
                    </button>
                  `).join('')}
                </div>
              </details>

              <details class="text-xs">
                <summary class="font-semibold text-slate-700 cursor-pointer py-1">Contraste y objeción</summary>
                <div class="flex flex-wrap gap-1.5 pt-1.5">
                  ${ACADEMIC_CONNECTORS.contraste.map(con => `
                    <button type="button" class="btn-insert-text px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] text-slate-700 transition-colors" data-text="${con} ">
                      ${con}
                    </button>
                  `).join('')}
                </div>
              </details>

              <details class="text-xs">
                <summary class="font-semibold text-slate-700 cursor-pointer py-1">Causa, efecto y cierre</summary>
                <div class="flex flex-wrap gap-1.5 pt-1.5">
                  ${[...ACADEMIC_CONNECTORS.causa_efecto, ...ACADEMIC_CONNECTORS.cierre].map(con => `
                    <button type="button" class="btn-insert-text px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[11px] text-slate-700 transition-colors" data-text="${con} ">
                      ${con}
                    </button>
                  `).join('')}
                </div>
              </details>
            </div>
          </div>
        </aside>

        <!-- Área de escritura central -->
        <main class="lg:col-span-9 space-y-4">
          <div class="app-card p-6 bg-white space-y-4 shadow-xs">
            ${viewMode === 'section' ? `
              <!-- Vista por sección -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <input id="input-section-title" type="text" class="text-xl font-bold text-slate-900 border-none hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 transition-colors" value="${escapeHtml(activeSection.title)}" title="Clic para renombrar la sección">
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Consejo: redacta párrafos de 4 a 7 líneas con oraciones temáticas claras.
                  </p>
                </div>
                <div class="text-right">
                  <span class="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    ${sectionWords} palabras
                  </span>
                </div>
              </div>

              <!-- Barra de herramientas tipográficas simples -->
              <div class="flex flex-wrap items-center gap-1.5 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <button type="button" id="btn-format-bold" class="px-2 py-1 rounded hover:bg-white text-slate-700 font-bold" title="Negrita (**texto**)">B</button>
                <button type="button" id="btn-format-italic" class="px-2 py-1 rounded hover:bg-white text-slate-700 italic font-serif" title="Cursiva (*texto*)">I</button>
                <button type="button" id="btn-format-subhead" class="px-2 py-1 rounded hover:bg-white text-slate-700 font-semibold" title="Subtítulo Nivel 2">H2</button>
                <button type="button" id="btn-format-list" class="px-2 py-1 rounded hover:bg-white text-slate-700" title="Lista de viñetas">• Lista</button>
                <div class="h-4 w-px bg-slate-300 mx-1"></div>
                <button type="button" id="btn-quick-intext" class="px-2 py-1 rounded hover:bg-white text-indigo-700 font-medium flex items-center gap-1" title="Insertar cita APA 7">
                  ${getIconSvg('apa', 'text-indigo-600', 12)}
                  <span>Cita (Autor, Año)</span>
                </button>
              </div>

              <!-- Editor principal de la sección -->
              <textarea
                id="editor-textarea"
                class="w-full min-h-[420px] p-4 text-base font-serif text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed resize-y bg-white"
                placeholder="Comienza a redactar aquí esta sección. Utiliza párrafos claros y sustenta con citas..."
                aria-label="Contenido de la sección ${escapeHtml(activeSection.title)}"
              >${escapeHtml(activeSection.content || '')}</textarea>
            ` : `
              <!-- Vista de texto continuo (documento completo) -->
              <div class="border-b border-slate-100 pb-3">
                <h2 class="text-xl font-bold text-slate-900">Documento Completo</h2>
                <p class="text-xs text-slate-500 mt-1">
                  Vista continua de todas las secciones en el orden de entrega.
                </p>
              </div>

              <div class="space-y-6">
                ${work.sections.map((sec, idx) => `
                  <div class="space-y-2 p-4 rounded-lg bg-slate-50/60 border border-slate-200">
                    <div class="flex justify-between items-center">
                      <h3 class="font-bold text-slate-800 text-sm">${idx + 1}. ${escapeHtml(sec.title)}</h3>
                      <span class="text-xs font-mono text-slate-500">${countWords(sec.content || '')} palabras</span>
                    </div>
                    <textarea
                      class="full-view-section-textarea w-full min-h-[140px] p-3 text-sm font-serif text-slate-900 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 leading-relaxed bg-white"
                      data-id="${sec.id}"
                      aria-label="Contenido de ${escapeHtml(sec.title)}"
                    >${escapeHtml(sec.content || '')}</textarea>
                  </div>
                `).join('')}
              </div>
            `}

            <!-- Barra inferior con métricas consolidadas -->
            <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div class="flex items-center gap-4">
                <span>Total documento: <strong class="text-slate-800">${totalWords}</strong> palabras</span>
                <span>Párrafos: <strong class="text-slate-800">${totalParas}</strong></span>
                <span>Referencias registradas: <strong class="text-slate-800">${(work.citations || []).length}</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Guardado automático activo</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Modal para insertar cita en texto -->
    <div id="modal-insert-citation" class="modal-backdrop" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="modal-cite-title">
      <div class="modal-panel max-w-md w-full bg-white p-6 rounded-xl space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 id="modal-cite-title" class="font-bold text-slate-900 text-base">Insertar Cita en Texto</h3>
          <button id="btn-close-cite-modal" class="text-slate-400 hover:text-slate-600 p-1">
            ${getIconSvg('close', '', 16)}
          </button>
        </div>

        ${work.citations && work.citations.length > 0 ? `
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <p class="text-xs text-slate-500 mb-2">Selecciona una referencia existente para insertar su cita:</p>
            ${work.citations.map(c => `
              <div class="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors btn-select-cite-item" data-citation="${escapeHtml(c.inText || `(${c.authors || 'Autor'}, ${c.year || 's.f.'})`)}">
                <p class="text-xs font-bold text-blue-700">${escapeHtml(c.inText || `(${c.authors || 'Autor'}, ${c.year || 's.f.'})`)}</p>
                <p class="text-[11px] text-slate-600 truncate mt-0.5">${escapeHtml(c.title || '')}</p>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-center py-6 space-y-2">
            <p class="text-sm text-slate-600 font-medium">Aún no has registrado referencias bibliográficas.</p>
            <p class="text-xs text-slate-400">Puedes crearlas en el módulo APA 7 o ingresar una cita rápida ahora.</p>
          </div>
        `}

        <div class="pt-3 border-t border-slate-100 space-y-3">
          <p class="text-xs font-semibold text-slate-700">O ingresa una cita manual:</p>
          <div class="grid grid-cols-2 gap-2">
            <input id="input-manual-author" type="text" placeholder="Apellido (ej: Parra)" class="form-input text-xs">
            <input id="input-manual-year" type="number" placeholder="Año (ej: 2024)" class="form-input text-xs">
          </div>
          <button id="btn-apply-manual-cite" class="btn btn-primary w-full text-xs py-2">
            Insertar Cita
          </button>
        </div>
      </div>
    </div>
  `;

  // Helper de conteo de palabras
  function countWords(str) {
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  // Insertar texto en posición del cursor
  function insertAtCursor(textarea, text) {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const original = textarea.value;
    textarea.value = original.substring(0, start) + text + original.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
    // Guardar cambio
    store.updateSection(activeSectionId, textarea.value);
  }

  // Bindings del editor principal
  const editorTextarea = container.querySelector('#editor-textarea');
  if (editorTextarea) {
    editorTextarea.addEventListener('input', () => {
      store.updateSection(activeSectionId, editorTextarea.value);
    });
  }

  // Título de la sección
  const sectionTitleInput = container.querySelector('#input-section-title');
  if (sectionTitleInput) {
    sectionTitleInput.addEventListener('change', () => {
      const newTitle = sectionTitleInput.value.trim() || 'Sección';
      const sec = work.sections.find(s => s.id === activeSectionId);
      if (sec) {
        sec.title = newTitle;
        store.updateCurrentWork({ sections: work.sections });
        renderEditor(container);
      }
    });
  }

  // Modo switch
  container.querySelector('#btn-mode-section')?.addEventListener('click', () => {
    viewMode = 'section';
    renderEditor(container);
  });

  container.querySelector('#btn-mode-full')?.addEventListener('click', () => {
    viewMode = 'full';
    renderEditor(container);
  });

  // Editor en vista completa
  container.querySelectorAll('.full-view-section-textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      const id = ta.dataset.id;
      store.updateSection(id, ta.value);
    });
  });

  // Selector de sección lateral
  container.querySelectorAll('.btn-select-section').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSectionId = btn.dataset.id;
      viewMode = 'section';
      renderEditor(container);
    });
  });

  // Botón nueva sección rápida
  container.querySelector('#btn-quick-add-sec')?.addEventListener('click', () => {
    const title = prompt('Nombre de la nueva sección:');
    if (title && title.trim()) {
      const newSec = store.addSection(title.trim());
      if (newSec) activeSectionId = newSec.id;
      renderEditor(container);
    }
  });

  // Inserción de conectores
  container.querySelectorAll('.btn-insert-text').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToInsert = btn.dataset.text || '';
      if (viewMode === 'section' && editorTextarea) {
        insertAtCursor(editorTextarea, textToInsert);
      }
    });
  });

  // Formato rápido
  container.querySelector('#btn-format-bold')?.addEventListener('click', () => {
    if (editorTextarea) {
      const start = editorTextarea.selectionStart;
      const end = editorTextarea.selectionEnd;
      const selected = editorTextarea.value.substring(start, end);
      insertAtCursor(editorTextarea, `**${selected || 'texto'}**`);
    }
  });

  container.querySelector('#btn-format-italic')?.addEventListener('click', () => {
    if (editorTextarea) {
      const start = editorTextarea.selectionStart;
      const end = editorTextarea.selectionEnd;
      const selected = editorTextarea.value.substring(start, end);
      insertAtCursor(editorTextarea, `*${selected || 'texto'}*`);
    }
  });

  container.querySelector('#btn-format-subhead')?.addEventListener('click', () => {
    if (editorTextarea) insertAtCursor(editorTextarea, '\n\n### Subtítulo Nivel 2\n');
  });

  container.querySelector('#btn-format-list')?.addEventListener('click', () => {
    if (editorTextarea) insertAtCursor(editorTextarea, '\n- Elemento 1\n- Elemento 2\n');
  });

  // Modal de Citas
  const modalCite = container.querySelector('#modal-insert-citation');
  function openCiteModal() {
    if (modalCite) modalCite.style.display = 'flex';
  }
  function closeCiteModal() {
    if (modalCite) modalCite.style.display = 'none';
  }

  container.querySelector('#btn-insert-cite')?.addEventListener('click', openCiteModal);
  container.querySelector('#btn-quick-intext')?.addEventListener('click', openCiteModal);
  container.querySelector('#btn-close-cite-modal')?.addEventListener('click', closeCiteModal);

  container.querySelectorAll('.btn-select-cite-item').forEach(item => {
    item.addEventListener('click', () => {
      const citeText = item.dataset.citation;
      if (editorTextarea && citeText) {
        insertAtCursor(editorTextarea, ` ${citeText}`);
      }
      closeCiteModal();
    });
  });

  container.querySelector('#btn-apply-manual-cite')?.addEventListener('click', () => {
    const author = container.querySelector('#input-manual-author')?.value.trim();
    const year = container.querySelector('#input-manual-year')?.value.trim();
    if (author && year) {
      const inText = `(${author}, ${year})`;
      if (editorTextarea) insertAtCursor(editorTextarea, ` ${inText}`);
      closeCiteModal();
    }
  });

  container.querySelector('#btn-editor-export')?.addEventListener('click', () => {
    window.appNavigate?.('exportar');
  });
}
