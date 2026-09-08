// ═══════════════════════════════════════════════════════════════════════
// MODULES/APA/INDEX.JS - Gestor de Citas y Referencias APA 7
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { APA_SOURCE_TYPES } from '../../core/constants.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml, writeClipboardText } from '../../utils/helpers.js';

let selectedSourceType = 'libro';

export function renderApa(container) {
  const work = store.getCurrentWork();
  const citations = work.citations || [];
  const currentSourceDef = APA_SOURCE_TYPES[selectedSourceType] || APA_SOURCE_TYPES.libro;

  container.innerHTML = `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Encabezado del módulo -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Gestor APA 7.ª Edición</h1>
          <p class="text-sm text-slate-600 mt-1">
            Genera referencias bibliográficas estructuradas y citas en texto para tu trabajo.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-sort-apa-az" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5" ${citations.length === 0 ? 'disabled' : ''}>
            <span>Ordenar A-Z</span>
          </button>
          <button id="btn-return-editor" class="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
            ${getIconSvg('editor', 'text-white', 14)}
            <span>Ir al Redactor</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Generador de referencias estructuradas -->
        <div class="lg:col-span-6 space-y-6">
          <section class="app-card p-6 bg-white space-y-5">
            <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              ${getIconSvg('apa', 'text-indigo-600', 18)}
              <span>Nueva Referencia Bibliográfica</span>
            </h2>

            <!-- Selector de tipo de fuente -->
            <div>
              <label for="apa-source-type-select" class="form-label">Tipo de fuente documental</label>
              <select id="apa-source-type-select" class="form-select text-sm font-medium">
                ${Object.values(APA_SOURCE_TYPES).map(st => `
                  <option value="${st.id}" ${st.id === selectedSourceType ? 'selected' : ''}>${escapeHtml(st.label)}</option>
                `).join('')}
              </select>
            </div>

            <!-- Campos específicos del tipo de fuente -->
            <form id="apa-reference-form" class="space-y-3">
              ${currentSourceDef.fields.map(field => `
                <div>
                  <label for="field-${field.name}" class="form-label">
                    ${escapeHtml(field.label)} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                  </label>
                  <input
                    id="field-${field.name}"
                    name="${field.name}"
                    type="${field.type || 'text'}"
                    placeholder="${escapeHtml(field.placeholder || '')}"
                    class="form-input text-sm"
                    ${field.required ? 'required' : ''}
                  >
                </div>
              `).join('')}

              <div class="pt-3">
                <button type="submit" class="btn btn-primary w-full flex items-center justify-center gap-2">
                  ${getIconSvg('plus', '', 16)}
                  <span>Agregar Referencia al Documento</span>
                </button>
              </div>
            </form>
          </section>

          <!-- Generador rápido de cita en texto -->
          <section class="app-card p-6 bg-white space-y-4">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              ${getIconSvg('editor', 'text-blue-600', 16)}
              <span>Generador de Cita en Texto (Parentética o Narrativa)</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label for="quick-author" class="form-label">Apellido(s)</label>
                <input id="quick-author" type="text" placeholder="Ej: Gómez & Parra" class="form-input text-xs">
              </div>
              <div>
                <label for="quick-year" class="form-label">Año</label>
                <input id="quick-year" type="number" placeholder="2024" class="form-input text-xs">
              </div>
              <div>
                <label for="quick-page" class="form-label">Página (opcional)</label>
                <input id="quick-page" type="text" placeholder="p. 45" class="form-input text-xs">
              </div>
            </div>

            <div class="flex gap-2">
              <button type="button" id="btn-gen-parenthetical" class="btn btn-secondary text-xs flex-1">
                Generar Parentética: (Autor, Año)
              </button>
              <button type="button" id="btn-gen-narrative" class="btn btn-ghost text-xs flex-1 border border-slate-200">
                Generar Narrativa: Autor (Año)
              </button>
            </div>

            <div id="quick-cite-result" class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 flex items-center justify-between" style="display:none;">
              <span id="quick-cite-text"></span>
              <button type="button" id="btn-copy-quick-cite" class="btn btn-ghost text-xs py-1 px-2 text-blue-600 font-sans">
                Copiar
              </button>
            </div>
          </section>
        </div>

        <!-- Lista de referencias del documento actual -->
        <div class="lg:col-span-6 space-y-4">
          <section class="app-card p-6 bg-white space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Referencias del Documento</h2>
                <p class="text-xs text-slate-500">Se incluirán al final del trabajo y al exportar en Word.</p>
              </div>
              <span class="badge badge-accent font-bold">
                ${citations.length} ${citations.length === 1 ? 'referencia' : 'referencias'}
              </span>
            </div>

            ${citations.length === 0 ? `
              <div class="text-center py-12 space-y-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  ${getIconSvg('apa', '', 24)}
                </div>
                <h3 class="text-sm font-bold text-slate-700">Sin referencias bibliográficas</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">
                  Completa el formulario de la izquierda con libros, artículos, tesis o sitios web para armar tu bibliografía.
                </p>
              </div>
            ` : `
              <div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                ${citations.map((c, idx) => `
                  <div class="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-2 hover:border-slate-300 transition-colors" data-id="${c.id}">
                    <div class="flex items-start justify-between gap-2">
                      <span class="badge badge-neutral text-[10px] uppercase font-bold tracking-wider">${escapeHtml(c.type || 'fuente')}</span>
                      <div class="flex items-center gap-1">
                        <button type="button" class="btn-copy-ref-html text-slate-500 hover:text-blue-600 p-1 text-xs" title="Copiar referencia completa" data-html="${escapeHtml(c.formattedHtml || '')}">
                          ${getIconSvg('copy', '', 14)}
                        </button>
                        <button type="button" class="btn-delete-citation text-slate-400 hover:text-red-600 p-1" title="Eliminar referencia" data-id="${c.id}">
                          ${getIconSvg('trash', '', 14)}
                        </button>
                      </div>
                    </div>

                    <!-- Texto de la referencia APA 7 con sangría francesa visual -->
                    <div class="text-sm text-slate-800 leading-relaxed pl-6 -indent-6">
                      ${c.formattedHtml || escapeHtml(c.title)}
                    </div>

                    <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span>Cita en texto: <code class="font-mono text-indigo-700 font-semibold">${escapeHtml(c.inText || '')}</code></span>
                      <button type="button" class="btn-copy-intext text-indigo-600 hover:underline text-[11px] font-medium" data-intext="${escapeHtml(c.inText || '')}">
                        Copiar cita
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </section>
        </div>
      </div>
    </div>
  `;

  // Cambiar tipo de fuente
  container.querySelector('#apa-source-type-select')?.addEventListener('change', (e) => {
    selectedSourceType = e.target.value;
    renderApa(container);
  });

  // Enviar formulario de referencia
  const refForm = container.querySelector('#apa-reference-form');
  refForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(refForm);
    const data = Object.fromEntries(formData.entries());

    const formatter = currentSourceDef.format;
    const formattedHtml = formatter(data);

    // Extraer autor principal y año para la cita en texto
    const authors = (data.authors || 'Autor').trim();
    const year = (data.year || 's.f.').trim();
    const firstAuthor = authors.split(/[,&]/)[0].trim();
    const inText = `(${firstAuthor}, ${year})`;

    store.addCitation({
      type: selectedSourceType,
      authors: data.authors,
      year: data.year,
      title: data.title || data.chapterTitle || '',
      sourceData: data,
      formattedHtml,
      inText
    });

    if (typeof window.showToast === 'function') {
      window.showToast('Referencia agregada con éxito.', 'success');
    }

    renderApa(container);
  });

  // Cita rápida parentética
  const quickResultBox = container.querySelector('#quick-cite-result');
  const quickResultText = container.querySelector('#quick-cite-text');

  container.querySelector('#btn-gen-parenthetical')?.addEventListener('click', () => {
    const author = container.querySelector('#quick-author')?.value.trim() || 'Autor';
    const year = container.querySelector('#quick-year')?.value.trim() || 's.f.';
    const page = container.querySelector('#quick-page')?.value.trim();
    const cite = page ? `(${author}, ${year}, p. ${page})` : `(${author}, ${year})`;

    if (quickResultText && quickResultBox) {
      quickResultText.textContent = cite;
      quickResultBox.style.display = 'flex';
    }
  });

  // Cita rápida narrativa
  container.querySelector('#btn-gen-narrative')?.addEventListener('click', () => {
    const author = container.querySelector('#quick-author')?.value.trim() || 'Autor';
    const year = container.querySelector('#quick-year')?.value.trim() || 's.f.';
    const page = container.querySelector('#quick-page')?.value.trim();
    const cite = page ? `${author} (${year}, p. ${page})` : `${author} (${year})`;

    if (quickResultText && quickResultBox) {
      quickResultText.textContent = cite;
      quickResultBox.style.display = 'flex';
    }
  });

  // Copiar cita rápida
  container.querySelector('#btn-copy-quick-cite')?.addEventListener('click', async () => {
    const text = quickResultText?.textContent;
    if (text) {
      await writeClipboardText(text);
      if (typeof window.showToast === 'function') {
        window.showToast('Cita copiada al portapapeles.', 'success');
      }
    }
  });

  // Ordenar A-Z
  container.querySelector('#btn-sort-apa-az')?.addEventListener('click', () => {
    store.sortCitationsAZ();
    renderApa(container);
    if (typeof window.showToast === 'function') {
      window.showToast('Referencias ordenadas alfabéticamente.', 'info');
    }
  });

  // Copiar HTML de referencia
  container.querySelectorAll('.btn-copy-ref-html').forEach(btn => {
    btn.addEventListener('click', async () => {
      const html = btn.dataset.html;
      const clean = html.replace(/<[^>]+>/g, '');
      await writeClipboardText(clean);
      if (typeof window.showToast === 'function') {
        window.showToast('Referencia copiada.', 'success');
      }
    });
  });

  // Copiar cita en texto
  container.querySelectorAll('.btn-copy-intext').forEach(btn => {
    btn.addEventListener('click', async () => {
      const intext = btn.dataset.intext;
      await writeClipboardText(intext);
      if (typeof window.showToast === 'function') {
        window.showToast('Cita copiada.', 'success');
      }
    });
  });

  // Eliminar referencia
  container.querySelectorAll('.btn-delete-citation').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (id && confirm('¿Deseas eliminar esta referencia del documento?')) {
        store.removeCitation(id);
        renderApa(container);
      }
    });
  });

  container.querySelector('#btn-return-editor')?.addEventListener('click', () => {
    window.appNavigate?.('redactor');
  });
}
