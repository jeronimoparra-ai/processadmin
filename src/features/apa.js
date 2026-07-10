// ═══════════════════════════════════════════════════════════════════════
// APA.JS - Gestor de Citas y Referencias en Formato APA 7
// ═══════════════════════════════════════════════════════════════════════

function buildApaEnhanced() {
  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div class="dp-card p-6">
            <h3 class="dp-card-title mb-4 flex items-center gap-2">${docproIconHtml('redactor', 'Generador de citas en texto', 'docpro-icon docpro-icon--sm')}<span>Generador de citas en texto</span></h3>
            <div class="space-y-3">
              <input id="cita-autor" type="text" placeholder="Apellido del autor" aria-label="Apellido del autor" class="dp-input text-sm">
              <input id="cita-anio" type="number" placeholder="Año" aria-label="Año de publicación" class="dp-input text-sm">
              <input id="cita-pagina" type="text" placeholder="Página (opcional)" aria-label="Página opcional" class="dp-input text-sm">
              <button id="gen-cita-btn" class="dp-btn dp-btn-primary w-full">Generar cita en texto</button>
              <div class="flex items-center gap-2">
                <div id="cita-resultado" class="hidden flex-1 dp-ref-item font-mono text-sm"></div>
                <button id="copy-cita-btn" class="hidden dp-btn dp-btn-ghost dp-btn-sm">Copiar</button>
              </div>
            </div>
          </div>

          <div class="dp-card p-6">
            <h3 class="dp-card-title mb-4 flex items-center gap-2">${docproIconHtml('validation', 'Validador de referencias', 'docpro-icon docpro-icon--sm')}<span>Validador de referencias</span></h3>
            <textarea id="ref-validator" rows="4" placeholder="Pega una referencia aquí..." aria-label="Referencia para validar" class="dp-textarea mb-2 text-sm"></textarea>
            <button id="validate-ref-btn" class="dp-btn dp-btn-primary w-full">Validar referencia</button>
            <div id="validator-resultado" class="hidden mt-3 space-y-2 text-xs"></div>
          </div>

          <div class="dp-card p-6">
            <h3 class="dp-card-title mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Rastreador de fuentes', 'docpro-icon docpro-icon--sm')}<span>Rastreador de fuentes</span></h3>
            <div class="mb-3 space-y-2 text-sm">
              <input id="source-titulo" type="text" placeholder="Título" aria-label="Título de la fuente" class="dp-input">
              <input id="source-autor" type="text" placeholder="Autor/Institución" aria-label="Autor o institución de la fuente" class="dp-input">
              <input id="source-url" type="text" placeholder="URL o libro" aria-label="URL o libro de la fuente" class="dp-input">
              <input id="source-fecha" type="date" aria-label="Fecha de consulta de la fuente" class="dp-input">
              <textarea id="source-notas" rows="2" placeholder="Notas..." aria-label="Notas de la fuente" class="dp-textarea"></textarea>
            </div>
            <button id="add-source-btn" class="dp-btn dp-btn-primary w-full">Registrar fuente</button>
            <div id="sources-list" class="mt-4 max-h-40 space-y-2 overflow-y-auto text-xs"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="dp-card p-6 sticky top-6">
            <h3 id="apa-referencias-title" class="dp-card-title mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Referencias APA 7 generadas', 'docpro-icon docpro-icon--sm')}<span>Referencias APA 7 generadas (${state.generatedCitations.length})</span></h3>
            <div id="apa-referencias" class="mb-4 max-h-64 space-y-2 overflow-y-auto text-xs"></div>
            <div class="space-y-2">
              <button id="sort-refs-btn" class="dp-btn dp-btn-ghost w-full">Ordenar referencias A-Z</button>
              <button id="check-consistency-btn" class="dp-btn dp-btn-ghost w-full">Verificar consistencia</button>
              <button id="clear-refs-btn" class="dp-btn dp-btn-ghost w-full text-red-600">Limpiar todo</button>
            </div>
          </div>

          <div class="dp-card p-6">
            <h3 class="dp-card-title mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Generador de referencia completa', 'docpro-icon docpro-icon--sm')}<span>Generador de referencia completa</span></h3>
            <div class="mb-3 space-y-2 text-sm">
              <input id="apa-autor-full" type="text" placeholder="Autor/Institución" aria-label="Autor o institución de la referencia" class="dp-input">
              <input id="apa-anio-full" type="number" placeholder="Año" aria-label="Año de la referencia" class="dp-input">
              <input id="apa-titulo-full" type="text" placeholder="Título" aria-label="Título de la referencia" class="dp-input">
              <input id="apa-fuente-full" type="text" placeholder="Editorial/Revista" aria-label="Editorial o revista de la referencia" class="dp-input">
              <input id="apa-url-full" type="url" placeholder="URL (opcional)" aria-label="URL opcional de la referencia" class="dp-input">
            </div>
            <button id="gen-ref-btn" class="dp-btn dp-btn-primary w-full">Generar referencia</button>
            <div id="ref-resultado" class="hidden mt-3 dp-ref-item text-xs font-mono"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const citationResult = document.getElementById('cita-resultado');
  const copyCitationBtn = document.getElementById('copy-cita-btn');

  function saveCitations() {
    saveJSON('apa_generated_citations', state.generatedCitations);
  }

  function renderReferenceChecklist(reference) {
    // Reuse domain validation from services/apa.js when available
    const parsedReference = {
      author: getReferenceAuthor(reference),
      year: (String(reference || '').match(/\((\d{4})\)/) || [])[1] || '',
      title: (String(reference || '').match(/<em>(.*?)<\/em>/) || [])[1] || '',
      source: String(reference || '').replace(/<[^>]+>/g, '').split(').')[1]?.trim() || '',
      url: (String(reference || '').match(/https?:\/\/\S+/i) || [])[0] || '',
      doi: (String(reference || '').match(/doi\S*/i) || [])[0] || ''
    };

    const validationResult = typeof validateReference === 'function'
      ? (function mapValidation() {
          const result = validateReference(parsedReference);
          return {
            isValid: result.isValid,
            validation: {
              author: result.validation.author,
              year: result.validation.year,
              title: result.validation.title,
              source: result.validation.source,
              doiOrUrl: result.validation.urlOrDoi
            }
          };
        })()
      : typeof validateReferenceString === 'function'
      ? validateReferenceString(reference)
      : (function fallback() {
          const normalized = String(reference || '').replace(/<[^>]+>/g, '');
          const checks = {
            author: /^[^(]+\(\d{4}\)/.test(normalized),
            year: /\(\d{4}\)/.test(normalized),
            title: /<em>.+<\/em>|\.[^\.]{3,}/.test(reference),
            source: /\)\.\s*.+/.test(normalized),
            doiOrUrl: /doi|https?:\/\//i.test(normalized)
          };
          return { isValid: Object.values(checks).every(Boolean), validation: checks };
        })();

    const checks = validationResult.validation || {};
    const result = document.getElementById('validator-resultado');
    result.innerHTML = APA_REFERENCE_CHECKS.map(item => {
      const ok = checks[item.key];
      return `<div class="flex items-center gap-2 ${ok ? 'text-green-700' : 'text-red-700'}"><span>${ok ? '●' : '●'}</span><span>${item.label}: ${ok ? 'Presente' : 'Falta'}</span></div>`;
    }).join('') + `<div class="pt-2 border-t border-orange-200 text-slate-600">${validationResult.isValid ? 'Referencia con estructura básica correcta.' : 'Revisa los campos faltantes antes de usarla.'}</div>`;
    result.classList.remove('hidden');
  }

  document.getElementById('gen-cita-btn').addEventListener('click', async () => {
    const button = document.getElementById('gen-cita-btn');
    const autor = document.getElementById('cita-autor').value.trim();
    const anio = document.getElementById('cita-anio').value.trim();
    const pagina = document.getElementById('cita-pagina').value.trim();

    if (!autor || !anio) {
      showToast('Ingresa autor y año para continuar.', 'error');
      return;
    }

    const citation = generateInTextCitation(autor, anio, pagina);
    citationResult.textContent = citation;
    citationResult.classList.remove('hidden');
    copyCitationBtn.classList.remove('hidden');
    await writeClipboardText(citation);
    if (button) button.textContent = 'Copiado';
    setTimeout(() => {
      if (button) button.textContent = 'Generar cita en texto';
    }, 2000);
  });

  copyCitationBtn.addEventListener('click', async () => {
    if (!citationResult.textContent) return;
    await writeClipboardText(citationResult.textContent);
    copyCitationBtn.textContent = 'Copiado';
    setTimeout(() => { copyCitationBtn.textContent = 'Copiar'; }, 1500);
  });

  document.getElementById('validate-ref-btn').addEventListener('click', () => {
    const ref = document.getElementById('ref-validator').value.trim();
    if (!ref) {
      showToast('Pega una referencia para revisarla.', 'error');
      return;
    }
    renderReferenceChecklist(ref);
  });

  let sources = loadJSON('apa_sources', []);

  function renderSources() {
    const list = document.getElementById('sources-list');
    if (sources.length === 0) {
      list.innerHTML = '<p class="text-gray-500 italic">Sin fuentes registradas</p>';
      return;
    }

    list.innerHTML = sources.map((source, index) => `
      <div class="dp-ref-item">
        <div class="font-bold text-[var(--dp-text-primary)]">${escapeHtml(source.titulo)}</div>
        <div class="text-xs text-[var(--dp-text-secondary)]">${escapeHtml(source.autor)}</div>
        <div class="mt-2 flex gap-2">
          <button class="convert-source dp-btn dp-btn-ghost dp-btn-sm" data-idx="${index}">Convertir en referencia APA</button>
          <button class="delete-source text-xs font-bold text-red-600 hover:text-red-700" data-idx="${index}">Eliminar</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.delete-source').forEach(button => {
      button.addEventListener('click', () => {
        sources.splice(parseInt(button.dataset.idx, 10), 1);
        saveJSON('apa_sources', sources);
        renderSources();
      });
    });

    list.querySelectorAll('.convert-source').forEach(button => {
      button.addEventListener('click', () => {
        const idx = parseInt(button.dataset.idx, 10);
        const src = sources[idx];
        if (!src) return;
        const autor = src.autor || 'Autor desconocido';
        const year = src.fecha ? (String(src.fecha).slice(0,4)) : '';
        const titulo = src.titulo || '';
        const fuente = src.url || '';

        let reference = `${escapeHtml(autor)}${year ? ` (${escapeHtml(year)})` : ''}. <em>${escapeHtml(titulo)}</em>`;
        if (fuente) reference += `. Recuperado de ${escapeHtml(fuente)}`;

        state.generatedCitations.push(reference);
        saveCitations();
        renderReferences();

        // Provide quick feedback
        button.textContent = 'Convertida';
        setTimeout(() => { button.textContent = 'Convertir en referencia APA'; }, 1800);
      });
    });
  }

  document.getElementById('add-source-btn').addEventListener('click', () => {
    const titulo = document.getElementById('source-titulo').value.trim();
    if (!titulo) {
      showToast('Ingresa el título de la fuente.', 'error');
      return;
    }

    sources.push({
      titulo,
      autor: document.getElementById('source-autor').value.trim(),
      url: document.getElementById('source-url').value.trim(),
      fecha: document.getElementById('source-fecha').value,
      notas: document.getElementById('source-notas').value.trim()
    });

    saveJSON('apa_sources', sources);
    ['source-titulo', 'source-autor', 'source-url', 'source-fecha', 'source-notas'].forEach(id => { document.getElementById(id).value = ''; });
    renderSources();

    const button = document.getElementById('add-source-btn');
    button.textContent = 'Fuente registrada';
    setTimeout(() => { button.textContent = 'Registrar fuente'; }, 2000);
  });

  renderSources();

  document.getElementById('gen-ref-btn').addEventListener('click', () => {
    const autor = document.getElementById('apa-autor-full').value.trim();
    const anio = document.getElementById('apa-anio-full').value.trim();
    const titulo = document.getElementById('apa-titulo-full').value.trim();
    const fuente = document.getElementById('apa-fuente-full').value.trim();
    const url = document.getElementById('apa-url-full').value.trim();

    if (!autor || !anio || !titulo) {
      showToast('Ingresa autor, año y título para generar la referencia.', 'error');
      return;
    }

    let reference = `${escapeHtml(autor)} (${escapeHtml(anio)}). <em>${escapeHtml(titulo)}</em>`;
    if (fuente) reference += `. ${escapeHtml(fuente)}`;
    if (url) reference += `. Recuperado de ${escapeHtml(url)}`;

    state.generatedCitations.push(reference);
    saveCitations();
    document.getElementById('ref-resultado').innerHTML = reference;
    document.getElementById('ref-resultado').classList.remove('hidden');
    renderReferences();

    const button = document.getElementById('gen-ref-btn');
    button.textContent = 'Agregada';
    setTimeout(() => { button.textContent = 'Generar referencia'; }, 2000);
  });

  function getReferenceAuthor(reference) {
    return String(reference || '').replace(/<[^>]+>/g, '').split('(')[0].trim();
  }

  function renderReferences() {
    const list = document.getElementById('apa-referencias');
    const heading = document.getElementById('apa-referencias-title');
    if (heading) {
      heading.innerHTML = `${docproIconHtml('apa', 'Referencias APA 7 generadas', 'docpro-icon docpro-icon--sm')}<span>Referencias APA 7 generadas (${state.generatedCitations.length})</span>`;
    }

    if (state.generatedCitations.length === 0) {
      list.innerHTML = '<p class="text-gray-500 italic">Sin referencias aún</p>';
      saveCitations();
      return;
    }

    list.innerHTML = state.generatedCitations.map((reference, index) => `
      <div class="dp-ref-item text-xs">
        <div>${escapeHtml(reference.replace(/<\/?em>/g, ''))}</div>
        <button class="delete-ref mt-1 text-xs font-bold text-red-600 hover:text-red-700" data-idx="${index}">Eliminar</button>
      </div>
    `).join('');

    list.querySelectorAll('.delete-ref').forEach(button => {
      button.addEventListener('click', () => {
        state.generatedCitations.splice(parseInt(button.dataset.idx, 10), 1);
        saveCitations();
        renderReferences();
      });
    });
  }

  document.getElementById('sort-refs-btn').addEventListener('click', () => {
    if (typeof sortReferencesByAuthor === 'function') {
      const referencesWithAuthor = state.generatedCitations.map(ref => ({ raw: ref, author: getReferenceAuthor(ref) }));
      sortReferencesByAuthor(referencesWithAuthor);
      state.generatedCitations = referencesWithAuthor.map(item => item.raw);
    } else if (typeof sortReferenceStringsByAuthor === 'function') {
      sortReferenceStringsByAuthor(state.generatedCitations);
    } else {
      state.generatedCitations.sort((a, b) => getReferenceAuthor(a).localeCompare(getReferenceAuthor(b), 'es'));
    }
    saveCitations();
    renderReferences();

    const button = document.getElementById('sort-refs-btn');
    button.textContent = 'Ordenadas';
    setTimeout(() => { button.textContent = 'Ordenar referencias A-Z'; }, 2000);
  });

  document.getElementById('check-consistency-btn').addEventListener('click', () => {
    const content = safeStorageGet('redactor_content', '');
    const inTextMatches = [...content.matchAll(/\(([^)]+)\)/g)].map(match => match[1]);
    const citedAuthors = inTextMatches.map(text => text.split(',')[0].trim()).filter(Boolean);
    const referenceAuthors = state.generatedCitations.map(getReferenceAuthor).filter(Boolean);

    const citationsWithoutReference = citedAuthors.filter(author => !referenceAuthors.some(referenceAuthor => normalizeSpanishText(referenceAuthor) === normalizeSpanishText(author)));
    const referencesWithoutCitation = referenceAuthors.filter(referenceAuthor => !citedAuthors.some(author => normalizeSpanishText(author) === normalizeSpanishText(referenceAuthor)));

    showToast(
      `Consistencia: citas ${citedAuthors.length}, referencias ${referenceAuthors.length}, sin referencia ${citationsWithoutReference.length}, sin cita ${referencesWithoutCitation.length}`,
      (citationsWithoutReference.length + referencesWithoutCitation.length) === 0 ? 'success' : 'info',
      5000
    );
  });

  document.getElementById('clear-refs-btn').addEventListener('click', async () => {
    const confirmed = await showConfirm({
      title: 'Eliminar referencias',
      message: '¿Estás seguro? Se eliminarán todas las referencias.',
      confirmText: 'Eliminar'
    });
    if (!confirmed) return;
    state.generatedCitations = [];
    saveCitations();
    renderReferences();
    showToast('Referencias eliminadas.', 'success');
  });

  renderReferences();
}
