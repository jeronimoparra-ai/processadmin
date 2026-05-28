// ═══════════════════════════════════════════════════════════════════════
// RUBRICA.JS - Evaluador de Rúbrica Personalizable
// ═══════════════════════════════════════════════════════════════════════

function buildRubricaRebuilt() {
  const baseTemplates = RUBRIC_TEMPLATES_BASE;
  const savedTemplates = state.rubricTemplates || {};
  let criteria = Array.isArray(state.currentRubric) ? state.currentRubric : [];

  function buildTemplateOptions() {
    const builtinOptions = Object.entries(baseTemplates).map(([key, template]) => `<option value="builtin:${key}">${template.label}</option>`).join('');
    const customOptions = Object.keys(savedTemplates).map(name => `<option value="custom:${encodeURIComponent(name)}">${escapeHtml(name)}</option>`).join('');
    return `
      <option value="builtin:blank">Personalizado (vacío)</option>
      ${builtinOptions}
      ${customOptions}
    `;
  }

  const html = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <h2 class="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3"><span>📈</span> Evaluador de rúbrica personalizable</h2>

        <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md space-y-4">
          <div class="flex flex-col gap-3">
            <label class="block text-sm font-bold text-slate-900">Plantillas rápidas</label>
            <select id="template-select" aria-label="Plantillas rápidas" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Seleccionar plantilla...</option>
              ${buildTemplateOptions()}
            </select>
            <button id="load-template-btn" class="w-full bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 transition-colors text-sm">Cargar plantilla</button>
          </div>
        </div>

        <div class="bg-white rounded-lg border-2 border-orange-200 p-6 shadow-md space-y-4">
          <div>
            <h3 class="font-bold text-orange-900 mb-2">📝 Criterios del profesor</h3>
            <textarea id="prof-input" rows="4" placeholder="Pega aquí lo que el profesor pidió..." aria-label="Criterios del profesor" class="w-full border border-orange-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"></textarea>
          </div>
          <button id="parse-prof-btn" class="w-full bg-orange-600 text-white rounded px-4 py-2 font-bold hover:bg-orange-700 transition-colors text-sm">Convertir en criterios</button>
        </div>

        <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md space-y-4">
          <div class="flex justify-between items-center gap-3">
            <h3 class="font-bold text-slate-900">Criterios actuales</h3>
            <button id="add-criteria-btn" class="bg-green-600 text-white rounded px-3 py-1 text-sm font-bold hover:bg-green-700 transition-colors">➕ Agregar criterio</button>
          </div>
          <div id="criteria-list" class="space-y-3 max-h-96 overflow-y-auto"></div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-4 border-blue-600 p-8 text-center shadow-lg sticky top-6">
          <p class="text-blue-700 text-sm font-bold mb-2">PUNTUACIÓN ACTUAL</p>
          <p id="score-display-rubrica" class="text-5xl font-black text-blue-900">0/0</p>
          <p id="grade-display-rubrica" class="text-lg font-bold text-blue-800 mt-2">0.0/5 · 0.0/10</p>
          <div id="traffic-light" class="text-5xl mt-4">🟡</div>
          <p id="traffic-label" class="text-blue-900 font-bold text-sm mt-2">Escala: 60-79%</p>
          <div class="mt-4 h-3 bg-blue-200 rounded-full overflow-hidden">
            <div id="rubric-progress-bar" class="h-full bg-blue-600 rounded-full transition-all" style="width: 0%"></div>
          </div>
        </div>

        <div class="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
          <h3 class="font-bold text-purple-900 mb-3">💾 Guardar plantilla personalizada</h3>
          <input id="template-name" type="text" placeholder="Nombre de la plantilla" aria-label="Nombre de la plantilla" class="w-full border border-purple-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
          <button id="save-template-btn" class="w-full bg-purple-600 text-white rounded px-4 py-2 font-bold hover:bg-purple-700 transition-colors text-sm">💾 Guardar como mi plantilla</button>
        </div>

        <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md">
          <button id="reset-rubric-btn" class="w-full bg-slate-600 text-white rounded px-4 py-2 font-bold hover:bg-slate-700 transition-colors text-sm">🔄 Restablecer</button>
          <p class="text-xs text-slate-500 mt-3">Se borran solo los criterios activos y se conserva la biblioteca de plantillas guardadas.</p>
        </div>

        <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-6">
          <p class="text-xs text-slate-300 mb-2 font-bold">ESCALA DE CUMPLIMIENTO:</p>
          <div class="space-y-1 text-xs">
            <div><span class="text-red-400 font-bold">🔴 0-59%</span> - Deficiente</div>
            <div><span class="text-yellow-400 font-bold">🟡 60-79%</span> - Aceptable</div>
            <div><span class="text-green-400 font-bold">🟢 80-100%</span> - Excelente</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  function persistRubric() {
    state.currentRubric = criteria;
    saveJSON('rubrica_current', criteria);
  }

  function loadCriteria(templateKey) {
    if (templateKey === 'builtin:blank') return [];
    if (templateKey.startsWith('builtin:')) {
      const key = templateKey.replace('builtin:', '');
      return (baseTemplates[key]?.criteria || []).map(item => ({ name: item.name, max: item.max, obtained: 0 }));
    }
    if (templateKey.startsWith('custom:')) {
      const key = decodeURIComponent(templateKey.replace('custom:', ''));
      return (savedTemplates[key] || []).map(item => ({ name: item.name, max: item.max, obtained: item.obtained || 0 }));
    }
    return [];
  }

  function parseProfessorText(text) {
    const normalizedText = String(text || '').replace(/\n+/g, ',');

    return normalizedText
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const pointsMatch = part.match(/(\d+)\s*puntos?/i);
        const name = part.replace(/\d+\s*puntos?/i, '').replace(/[:.-]+$/g, '').trim();
        return {
          name: name || part.substring(0, 80),
          max: pointsMatch ? parseInt(pointsMatch[1], 10) : 10,
          obtained: 0
        };
      });
  }

  function createCriterionId() {
    return crypto.randomUUID?.() || `criterion-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function normalizeCriterion(criterion) {
    const id = criterion.id || createCriterionId();
    const name = String(criterion.name || 'Nuevo criterio');
    const max = Math.max(parseInt(criterion.max, 10) || 0, 1);
    const obtained = Math.min(Math.max(parseInt(criterion.obtained, 10) || 0, 0), max);
    return { ...criterion, id, name, max, obtained };
  }

  function updateSummary() {
    const totalObtained = criteria.reduce((sum, item) => sum + (parseInt(item.obtained, 10) || 0), 0);
    const totalMax = criteria.reduce((sum, item) => sum + (parseInt(item.max, 10) || 0), 0);
    const percent = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const score100 = percent;
    const grade5 = (score100 / 20).toFixed(1);
    const grade10 = (score100 / 10).toFixed(1);

    document.getElementById('score-display-rubrica').textContent = totalMax > 0 ? `${score100}%` : '0/0';
    document.getElementById('grade-display-rubrica').textContent = totalMax > 0 ? `${totalObtained}/${totalMax} pts · ${grade5}/5 · ${grade10}/10` : '0% · 0.0/5 · 0.0/10';
    document.getElementById('rubric-progress-bar').style.width = `${percent}%`;

    const light = document.getElementById('traffic-light');
    const label = document.getElementById('traffic-label');
    if (percent >= 80) {
      light.textContent = '🟢';
      label.textContent = 'Excelente: 80-100%';
    } else if (percent >= 60) {
      light.textContent = '🟡';
      label.textContent = 'Aceptable: 60-79%';
    } else {
      light.textContent = '🔴';
      label.textContent = 'Deficiente: 0-59%';
    }
  }

  function renderCriteria() {
    const list = document.getElementById('criteria-list');
    criteria = criteria.map(normalizeCriterion);

    if (criteria.length === 0) {
      list.innerHTML = '<p class="text-slate-500 italic text-sm">Sin criterios activos.</p>';
      updateSummary();
      persistRubric();
      return;
    }

    list.innerHTML = criteria.map((criterion, index) => {
      const normalized = normalizeCriterion(criterion);
      const ratio = normalized.max > 0 ? normalized.obtained / normalized.max : 0;
      const trafficClass = ratio >= 0.8 ? 'text-green-600 bg-green-50 border-green-200' : ratio >= 0.6 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-red-600 bg-red-50 border-red-200';

      return `
        <div class="border-2 border-slate-300 rounded p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <input type="text" value="${escapeHtml(normalized.name)}" aria-label="Nombre del criterio" class="flex-1 font-bold text-slate-900 border-b-2 border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none px-1" data-idx="${index}" data-field="name">
            <button class="text-red-600 hover:text-red-700 font-bold delete-criteria" data-idx="${index}" aria-label="Eliminar criterio">🗑️ Eliminar</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm items-end">
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">Máximo</label>
              <input type="number" min="1" value="${normalized.max}" aria-label="Puntuación máxima del criterio" class="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" data-idx="${index}" data-field="max">
            </div>
            <div>
              <label class="text-xs font-bold text-slate-700 block mb-1">Obtenido</label>
              <select aria-label="Puntuación obtenida del criterio" class="w-full border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" data-idx="${index}" data-field="obtained">
                ${Array.from({ length: normalized.max + 1 }, (_, value) => `<option value="${value}" ${value === normalized.obtained ? 'selected' : ''}>${value}</option>`).join('')}
              </select>
            </div>
            <div class="px-3 py-2 rounded border text-xs font-bold ${trafficClass}">
              ${Math.round(ratio * 100)}% · ${ratio >= 0.8 ? '🟢' : ratio >= 0.6 ? '🟡' : '🔴'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('input, select').forEach(element => {
      element.addEventListener('change', () => {
        const index = parseInt(element.dataset.idx, 10);
        const field = element.dataset.field;
        if (field === 'name') {
          criteria[index].name = element.value;
        } else if (field === 'max') {
          criteria[index].max = Math.max(parseInt(element.value, 10) || 1, 1);
          criteria[index].obtained = Math.min(criteria[index].obtained || 0, criteria[index].max);
        } else if (field === 'obtained') {
          criteria[index].obtained = parseInt(element.value, 10) || 0;
        }
        criteria[index] = normalizeCriterion(criteria[index]);
        persistRubric();
        renderCriteria();
      });
    });

    list.querySelectorAll('.delete-criteria').forEach(button => {
      button.addEventListener('click', () => {
        criteria.splice(parseInt(button.dataset.idx, 10), 1);
        persistRubric();
        renderCriteria();
      });
    });

    updateSummary();
    persistRubric();
  }

  document.getElementById('add-criteria-btn').addEventListener('click', () => {
    criteria.push({ id: createCriterionId(), name: 'Nuevo criterio', max: 10, obtained: 0 });
    persistRubric();
    renderCriteria();
  });

  document.getElementById('load-template-btn').addEventListener('click', () => {
    const selected = document.getElementById('template-select').value;
    if (!selected) return;
    criteria = loadCriteria(selected).map(normalizeCriterion);
    persistRubric();
    renderCriteria();

    const button = document.getElementById('load-template-btn');
    button.textContent = '✅ Cargada';
    setTimeout(() => { button.textContent = 'Cargar plantilla'; }, 2000);
  });

  document.getElementById('save-template-btn').addEventListener('click', () => {
    const name = document.getElementById('template-name').value.trim();
    if (!name) {
      alert('⚠️ Ingresa nombre para la plantilla');
      return;
    }

    state.rubricTemplates[name] = criteria.map(item => ({ name: item.name, max: item.max }));
    saveJSON('rubrica_templates', state.rubricTemplates);
    document.getElementById('template-name').value = '';

    const select = document.getElementById('template-select');
    const customValue = `custom:${encodeURIComponent(name)}`;
    const option = document.createElement('option');
    option.value = customValue;
    option.textContent = name;
    select.appendChild(option);

    const button = document.getElementById('save-template-btn');
    button.textContent = '✅ Guardada';
    setTimeout(() => { button.textContent = '💾 Guardar como mi plantilla'; }, 2000);
  });

  document.getElementById('parse-prof-btn').addEventListener('click', () => {
    const text = document.getElementById('prof-input').value.trim();
    if (!text) {
      alert('⚠️ Pega los criterios del profesor');
      return;
    }

    const parsedCriteria = [...text.matchAll(/([^,\n]+?)\s*(\d+)\s*puntos?/gi)].map(match => ({
      name: match[1].trim(),
      max: parseInt(match[2], 10),
      obtained: 0
    }));

    criteria = parsedCriteria.length > 0 ? parsedCriteria : parseProfessorText(text);
    persistRubric();
    renderCriteria();

    const button = document.getElementById('parse-prof-btn');
    button.textContent = '✅ Convertidos';
    setTimeout(() => { button.textContent = 'Convertir en criterios'; }, 2000);
  });

  document.getElementById('reset-rubric-btn').addEventListener('click', () => {
    if (!confirm('¿Restablecer la rúbrica actual?')) return;
    criteria = [];
    persistRubric();
    renderCriteria();
  });

  renderCriteria();
}
