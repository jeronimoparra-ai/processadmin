// ═══════════════════════════════════════════════════════════════════════
// APA.JS - Gestor de Citas y Referencias en Formato APA 7
// ═══════════════════════════════════════════════════════════════════════

function buildApaEnhanced() {
  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
          <h3 class="font-bold text-green-900 mb-4 flex items-center gap-2">${docproIconHtml('redactor', 'Generador de citas en texto', 'docpro-icon docpro-icon--sm')}<span>Generador de citas en texto</span></h3>
          <div class="space-y-3">
            <input id="cita-autor" type="text" placeholder="Apellido del autor" aria-label="Apellido del autor" class="w-full border border-green-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <input id="cita-anio" type="number" placeholder="Año" aria-label="Año de publicación" class="w-full border border-green-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <input id="cita-pagina" type="text" placeholder="Página (opcional)" aria-label="Página opcional" class="w-full border border-green-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <button id="gen-cita-btn" class="w-full bg-green-600 text-white rounded px-4 py-2 font-bold hover:bg-green-700 transition-colors text-sm">Generar cita en texto</button>
            <div class="flex items-center gap-2">
              <div id="cita-resultado" class="hidden flex-1 bg-green-50 border border-green-300 p-3 rounded text-sm font-mono"></div>
              <button id="copy-cita-btn" class="hidden bg-green-100 text-green-800 rounded px-3 py-2 text-xs font-bold hover:bg-green-200 transition-colors">Copiar</button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border-2 border-orange-200 p-6 shadow-md">
          <h3 class="font-bold text-orange-900 mb-4 flex items-center gap-2">${docproIconHtml('validation', 'Validador de referencias', 'docpro-icon docpro-icon--sm')}<span>Validador de referencias</span></h3>
          <textarea id="ref-validator" rows="4" placeholder="Pega una referencia aquí..." aria-label="Referencia para validar" class="w-full border border-orange-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 mb-2"></textarea>
          <button id="validate-ref-btn" class="w-full bg-orange-600 text-white rounded px-4 py-2 font-bold hover:bg-orange-700 transition-colors text-sm">Validar referencia</button>
          <div id="validator-resultado" class="hidden mt-3 space-y-2 text-xs"></div>
        </div>

        <div class="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
          <h3 class="font-bold text-purple-900 mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Rastreador de fuentes', 'docpro-icon docpro-icon--sm')}<span>Rastreador de fuentes</span></h3>
          <div class="space-y-2 text-sm mb-3">
            <input id="source-titulo" type="text" placeholder="Título" aria-label="Título de la fuente" class="w-full border border-purple-300 rounded px-3 py-2">
            <input id="source-autor" type="text" placeholder="Autor/Institución" aria-label="Autor o institución de la fuente" class="w-full border border-purple-300 rounded px-3 py-2">
            <input id="source-url" type="text" placeholder="URL o libro" aria-label="URL o libro de la fuente" class="w-full border border-purple-300 rounded px-3 py-2">
            <input id="source-fecha" type="date" aria-label="Fecha de consulta de la fuente" class="w-full border border-purple-300 rounded px-3 py-2">
            <textarea id="source-notas" rows="2" placeholder="Notas..." aria-label="Notas de la fuente" class="w-full border border-purple-300 rounded px-3 py-2 resize-none"></textarea>
          </div>
          <button id="add-source-btn" class="w-full bg-purple-600 text-white rounded px-4 py-2 font-bold hover:bg-purple-700 transition-colors text-sm">Registrar fuente</button>
          <div id="sources-list" class="mt-4 space-y-2 max-h-40 overflow-y-auto text-xs"></div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md sticky top-6">
          <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Referencias APA 7 generadas', 'docpro-icon docpro-icon--sm')}<span>Referencias APA 7 generadas (${state.generatedCitations.length})</span></h3>
          <div id="apa-referencias" class="space-y-2 max-h-64 overflow-y-auto mb-4 text-xs"></div>
          <div class="space-y-2">
            <button id="sort-refs-btn" class="w-full bg-slate-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-slate-700 transition-colors">Ordenar referencias A-Z</button>
            <button id="check-consistency-btn" class="w-full bg-slate-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-slate-700 transition-colors">Verificar consistencia</button>
            <button id="clear-refs-btn" class="w-full bg-red-600 text-white rounded px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors">Limpiar todo</button>
          </div>
        </div>

        <div class="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-md">
          <h3 class="font-bold text-blue-900 mb-4 flex items-center gap-2">${docproIconHtml('apa', 'Generador de referencia completa', 'docpro-icon docpro-icon--sm')}<span>Generador de referencia completa</span></h3>
          <div class="space-y-2 text-sm mb-3">
            <input id="apa-autor-full" type="text" placeholder="Autor/Institución" aria-label="Autor o institución de la referencia" class="w-full border border-blue-300 rounded px-3 py-2">
            <input id="apa-anio-full" type="number" placeholder="Año" aria-label="Año de la referencia" class="w-full border border-blue-300 rounded px-3 py-2">
            <input id="apa-titulo-full" type="text" placeholder="Título" aria-label="Título de la referencia" class="w-full border border-blue-300 rounded px-3 py-2">
            <input id="apa-fuente-full" type="text" placeholder="Editorial/Revista" aria-label="Editorial o revista de la referencia" class="w-full border border-blue-300 rounded px-3 py-2">
            <input id="apa-url-full" type="url" placeholder="URL (opcional)" aria-label="URL opcional de la referencia" class="w-full border border-blue-300 rounded px-3 py-2">
          </div>
          <button id="gen-ref-btn" class="w-full bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 transition-colors text-sm">Generar referencia</button>
          <div id="ref-resultado" class="hidden mt-3 bg-blue-50 border border-blue-300 p-3 rounded text-xs font-mono"></div>
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
    const normalized = String(reference || '').replace(/<[^>]+>/g, '');
    const checks = {
      author: /^[^(]+\(\d{4}\)/.test(normalized),
      year: /\(\d{4}\)/.test(normalized),
      title: /<em>.+<\/em>|\.[^\.]{3,}/.test(reference),
      source: /\)\.\s*.+/.test(normalized),
      doiOrUrl: /doi|https?:\/\//i.test(normalized)
    };

    const result = document.getElementById('validator-resultado');
    result.innerHTML = APA_REFERENCE_CHECKS.map(item => {
      const ok = checks[item.key];
      return `<div class="flex items-center gap-2 ${ok ? 'text-green-700' : 'text-red-700'}"><span>${ok ? '●' : '●'}</span><span>${item.label}: ${ok ? 'Presente' : 'Falta'}</span></div>`;
    }).join('') + `<div class="pt-2 border-t border-orange-200 text-slate-600">${Object.values(checks).every(Boolean) ? 'Referencia con estructura básica correcta.' : 'Revisa los campos faltantes antes de usarla.'}</div>`;
    result.classList.remove('hidden');
  }

  document.getElementById('gen-cita-btn').addEventListener('click', async () => {
    const button = document.getElementById('gen-cita-btn');
    const autor = document.getElementById('cita-autor').value.trim();
    const anio = document.getElementById('cita-anio').value.trim();
    const pagina = document.getElementById('cita-pagina').value.trim();

    if (!autor || !anio) {
      alert('Completa autor y año');
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
      alert('Pega una referencia');
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
      <div class="bg-purple-50 border border-purple-300 p-2 rounded">
        <div class="font-bold text-purple-900">${escapeHtml(source.titulo)}</div>
        <div class="text-purple-700 text-xs">${escapeHtml(source.autor)}</div>
        <button class="text-red-600 text-xs hover:text-red-700 delete-source" data-idx="${index}">Eliminar</button>
      </div>
    `).join('');

    list.querySelectorAll('.delete-source').forEach(button => {
      button.addEventListener('click', () => {
        sources.splice(parseInt(button.dataset.idx, 10), 1);
        saveJSON('apa_sources', sources);
        renderSources();
      });
    });
  }

  document.getElementById('add-source-btn').addEventListener('click', () => {
    const titulo = document.getElementById('source-titulo').value.trim();
    if (!titulo) {
      alert('Completa el título');
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
      alert('Completa autor, año y título');
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
    document.querySelector('h3.font-bold.text-slate-900.mb-4.flex.items-center.gap-2').innerHTML = `${docproIconHtml('apa', 'Referencias APA 7 generadas', 'docpro-icon docpro-icon--sm')}<span>Referencias APA 7 generadas (${state.generatedCitations.length})</span>`;

    if (state.generatedCitations.length === 0) {
      list.innerHTML = '<p class="text-gray-500 italic">Sin referencias aún</p>';
      saveCitations();
      return;
    }

    list.innerHTML = state.generatedCitations.map((reference, index) => `
      <div class="bg-slate-50 border border-slate-300 p-2 rounded text-xs">
        <div>${escapeHtml(reference.replace(/<\/?em>/g, ''))}</div>
        <button class="text-red-600 text-xs hover:text-red-700 mt-1 delete-ref" data-idx="${index}">Eliminar</button>
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
    state.generatedCitations.sort((a, b) => getReferenceAuthor(a).localeCompare(getReferenceAuthor(b), 'es'));
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

    alert(
      `Verificación de consistencia:\n\n` +
      `Citas en texto detectadas: ${citedAuthors.length}\n` +
      `Referencias registradas: ${referenceAuthors.length}\n` +
      `Citas sin referencia: ${citationsWithoutReference.length}\n` +
      `Referencias sin cita: ${referencesWithoutCitation.length}`
    );
  });

  document.getElementById('clear-refs-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro? Se eliminarán todas las referencias.')) {
      state.generatedCitations = [];
      saveCitations();
      renderReferences();
    }
  });

  renderReferences();
}
