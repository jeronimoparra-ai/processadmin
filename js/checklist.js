// ═══════════════════════════════════════════════════════════════════════
// CHECKLIST.JS - Listas de verificación por pestañas (Estructura, Formato, Criterios)
// ═══════════════════════════════════════════════════════════════════════

function buildChecklist() {
  const html = `
    <div class="max-w-6xl mx-auto">
      <div class="flex gap-0 mb-6 border-b-2 border-slate-300 overflow-x-auto">
        <button class="checklist-tab px-6 py-3 font-bold text-slate-600 hover:text-slate-900 border-b-4 border-transparent -mb-0.5 transition-all active" data-tab="estructura">📋 Estructura del trabajo</button>
        <button class="checklist-tab px-6 py-3 font-bold text-slate-600 hover:text-slate-900 border-b-4 border-transparent -mb-0.5 transition-all" data-tab="formato">📄 Formato Word APA 7</button>
        <button class="checklist-tab px-6 py-3 font-bold text-slate-600 hover:text-slate-900 border-b-4 border-transparent -mb-0.5 transition-all" data-tab="criterios">✅ Criterios del profesor</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="checklist-tab-content" data-tab="estructura">
            <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md space-y-4">
              <div class="flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-900">Estructura del trabajo</h3>
                <span id="progress-estructura" class="text-xs font-semibold text-slate-500">0/0 completados</span>
              </div>
              <div id="checklist-estructura" class="space-y-2"></div>
              <button class="mt-2 w-full bg-slate-600 text-white rounded px-4 py-2 text-sm hover:bg-slate-700 transition-colors add-checklist-item" data-tab="estructura">➕ Agregar ítem</button>
            </div>
          </div>

          <div class="checklist-tab-content hidden" data-tab="formato">
            <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md space-y-4">
              <div class="flex justify-between items-center gap-3">
                <h3 class="font-bold text-slate-900">Formato Word APA 7</h3>
                <span id="progress-formato" class="text-xs font-semibold text-slate-500">0/0 completados</span>
              </div>
              <div id="checklist-formato" class="space-y-2"></div>
              <button class="mt-2 w-full bg-slate-600 text-white rounded px-4 py-2 text-sm hover:bg-slate-700 transition-colors add-checklist-item" data-tab="formato">➕ Agregar ítem</button>
            </div>
          </div>

          <div class="checklist-tab-content hidden" data-tab="criterios">
            <div class="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-md space-y-4">
              <div class="flex justify-between items-center gap-3">
                <div>
                  <h3 class="font-bold text-slate-900">Criterios del profesor</h3>
                  <p class="text-xs text-slate-500">Se sincronizan con la rúbrica del módulo 3.</p>
                </div>
                <span id="progress-criterios" class="text-xs font-semibold text-slate-500">0/0 completados</span>
              </div>
              <div id="checklist-criterios" class="space-y-2"></div>
              <button class="mt-2 w-full bg-slate-600 text-white rounded px-4 py-2 text-sm hover:bg-slate-700 transition-colors add-checklist-item" data-tab="criterios">➕ Agregar ítem</button>
            </div>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6 shadow-md">
            <h3 class="font-bold text-blue-900 mb-3">📊 Progreso global</h3>
            <div class="h-3 bg-blue-200 rounded-full overflow-hidden mb-2">
              <div id="checklist-overall-bar" class="h-full bg-blue-600 rounded-full transition-all" style="width: 0%"></div>
            </div>
            <p id="checklist-overall-label" class="text-sm font-semibold text-blue-700">0% completado</p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6 sticky top-6 space-y-6">
            <div>
              <h3 class="font-bold text-blue-900 mb-2">📊 Progreso por pestaña</h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1"><span class="text-xs font-semibold text-blue-700">Estructura</span><span class="text-xs font-semibold text-blue-700" id="progress-count-estructura">0/0</span></div>
                  <div class="h-2 bg-blue-200 rounded-full overflow-hidden"><div id="bar-estructura" class="h-full bg-blue-600 w-0 transition-all"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1"><span class="text-xs font-semibold text-blue-700">Formato</span><span class="text-xs font-semibold text-blue-700" id="progress-count-formato">0/0</span></div>
                  <div class="h-2 bg-blue-200 rounded-full overflow-hidden"><div id="bar-formato" class="h-full bg-blue-600 w-0 transition-all"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1"><span class="text-xs font-semibold text-blue-700">Criterios</span><span class="text-xs font-semibold text-blue-700" id="progress-count-criterios">0/0</span></div>
                  <div class="h-2 bg-blue-200 rounded-full overflow-hidden"><div id="bar-criterios" class="h-full bg-blue-600 w-0 transition-all"></div></div>
                </div>
              </div>
            </div>

            <div class="border-t border-blue-300 pt-4">
              <h3 class="font-bold text-blue-900 mb-3">⏰ Entrega</h3>
              <input id="deadline-date" type="datetime-local" aria-label="Fecha de entrega" class="w-full border border-blue-300 rounded px-3 py-2 text-sm mb-2">
              <p class="text-xs text-blue-700 mb-2">Fecha compartida con el panel y la exportación.</p>
              <div id="countdown-display" class="text-center py-3 bg-white rounded border border-blue-300 transition-colors">
                <p class="text-sm font-bold text-blue-900">Faltan días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const defaultItems = {
    estructura: ['Portada', 'Tabla de contenido', 'Resumen/Abstract', 'Introducción', 'Marco teórico', 'Metodología', 'Resultados', 'Discusión', 'Conclusiones', 'Referencias', 'Anexos', 'Revisión ortográfica'],
    formato: ['Márgenes 2.54 cm', 'Fuente Times New Roman 12pt', 'Interlineado doble (2.0)', 'Sangría francesa en referencias', 'Numeración de páginas', 'Portada sin número', 'Títulos con jerarquía APA', 'Tabla de contenido actualizada']
  };

  const storedStructure = loadJSON('checklist_estructura', defaultItems.estructura.map(text => ({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, text, checked: false })));
  const storedFormato = loadJSON('checklist_formato', defaultItems.formato.map(text => ({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, text, checked: false })));
  const rubricCriteria = loadJSON('rubrica_current', []);
  const storedCriteria = loadJSON('checklist_criterios', []);
  const storedCriteriaById = new Map(storedCriteria.map(item => [item.id, item.checked]));
  const storedCriteriaByText = new Map(storedCriteria.map(item => [item.text, item.checked]));

  const checklists = {
    estructura: storedStructure,
    formato: storedFormato,
    criterios: rubricCriteria.map((criterion, index) => {
      const id = criterion.id || `rubric-${index}-${criterion.name}`;
      return {
        id,
        text: criterion.name || 'Nuevo criterio',
        checked: storedCriteriaById.get(id) ?? storedCriteriaByText.get(criterion.name) ?? false
      };
    })
  };

  function persistChecklist(tab) {
    saveJSON(`checklist_${tab}`, checklists[tab]);
  }

  function moveItem(tab, index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= checklists[tab].length) return;
    const items = checklists[tab];
    const [item] = items.splice(index, 1);
    items.splice(targetIndex, 0, item);
    persistChecklist(tab);
    renderChecklist(tab);
    updateChecklistProgress();
  }

  function renderChecklist(tab) {
    const container = document.getElementById(`checklist-${tab}`);
    const items = checklists[tab];

    container.innerHTML = items.map((item, idx) => `
      <div class="flex items-center gap-2 p-3 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors group">
        <input type="checkbox" ${item.checked ? 'checked' : ''} aria-label="Marcar ítem como completado" class="w-4 h-4 accent-blue-600 checklist-input" data-tab="${tab}" data-idx="${idx}">
        <input type="text" value="${escapeHtml(item.text)}" aria-label="Texto del ítem de checklist" class="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400" data-tab="${tab}" data-idx="${idx}">
        <button class="text-slate-500 hover:text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity move-item" data-tab="${tab}" data-idx="${idx}" data-direction="-1" aria-label="Mover ítem hacia arriba">▲</button>
        <button class="text-slate-500 hover:text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity move-item" data-tab="${tab}" data-idx="${idx}" data-direction="1" aria-label="Mover ítem hacia abajo">▼</button>
        <button class="text-red-600 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity delete-item" data-tab="${tab}" data-idx="${idx}" aria-label="Eliminar ítem">🗑️</button>
      </div>
    `).join('');

    container.querySelectorAll('.checklist-input').forEach(el => {
      el.addEventListener('change', (e) => {
        const t = e.target.dataset.tab;
        const i = parseInt(e.target.dataset.idx, 10);
        checklists[t][i].checked = e.target.checked;
        persistChecklist(t);
        updateChecklistProgress();
      });
    });

    container.querySelectorAll('input[type="text"]').forEach(el => {
      el.addEventListener('change', (e) => {
        const t = e.target.dataset.tab;
        const i = parseInt(e.target.dataset.idx, 10);
        checklists[t][i].text = e.target.value;
        persistChecklist(t);
        updateChecklistProgress();
      });
    });

    container.querySelectorAll('.move-item').forEach(btn => {
      btn.addEventListener('click', () => {
        moveItem(btn.dataset.tab, parseInt(btn.dataset.idx, 10), parseInt(btn.dataset.direction, 10));
      });
    });

    container.querySelectorAll('.delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        const idx = parseInt(btn.dataset.idx, 10);
        checklists[tabName].splice(idx, 1);
        persistChecklist(tabName);
        renderChecklist(tabName);
        updateChecklistProgress();
      });
    });
  }

  function updateChecklistProgress() {
    const overall = [];

    ['estructura', 'formato', 'criterios'].forEach(tab => {
      const items = checklists[tab];
      const checked = items.filter(i => i.checked).length;
      const total = items.length;
      const percent = total > 0 ? (checked / total) * 100 : 0;

      const progressLabel = document.getElementById(`progress-${tab}`);
      const progressCount = document.getElementById(`progress-count-${tab}`);
      const bar = document.getElementById(`bar-${tab}`);
      if (progressLabel) progressLabel.textContent = `${checked}/${total} completados`;
      if (progressCount) progressCount.textContent = `${checked}/${total}`;
      if (bar) bar.style.width = `${percent}%`;
      overall.push({ checked, total });
    });

    const totalChecked = overall.reduce((sum, item) => sum + item.checked, 0);
    const totalItems = overall.reduce((sum, item) => sum + item.total, 0);
    const overallPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
    const overallBar = document.getElementById('checklist-overall-bar');
    const overallLabel = document.getElementById('checklist-overall-label');
    if (overallBar) overallBar.style.width = `${overallPercent}%`;
    if (overallLabel) overallLabel.textContent = `${overallPercent}% completado`;
  }

  ['estructura', 'formato', 'criterios'].forEach(tab => renderChecklist(tab));
  updateChecklistProgress();

  document.querySelectorAll('.checklist-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.checklist-tab').forEach(tabButton => tabButton.classList.remove('active', 'text-blue-600', 'border-blue-600'));
      document.querySelectorAll('.checklist-tab-content').forEach(content => content.classList.add('hidden'));
      btn.classList.add('active', 'text-blue-600', 'border-blue-600');
      document.querySelector(`[data-tab="${tab}"].checklist-tab-content`).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.add-checklist-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      checklists[tab].push({ id: `${tab}-${Date.now()}`, text: 'Nuevo ítem', checked: false });
      persistChecklist(tab);
      renderChecklist(tab);
      updateChecklistProgress();
    });
  });

  const deadlineInput = document.getElementById('deadline-date');
  const countdownDisplay = document.getElementById('countdown-display');
  const savedDeadline = getDeliveryDateValue();
  if (savedDeadline) deadlineInput.value = savedDeadline;

  function updateDeadlineCountdown() {
    if (!deadlineInput.value) {
      countdownDisplay.className = 'text-center py-3 bg-white rounded border border-blue-300 transition-colors';
      countdownDisplay.innerHTML = '<p class="text-sm font-bold text-blue-900">Sin fecha configurada</p>';
      return;
    }

    const deadline = new Date(deadlineInput.value).getTime();
    const diff = deadline - Date.now();

    if (diff <= 0) {
      countdownDisplay.className = 'text-center py-3 bg-red-50 rounded border border-red-300 transition-colors animate-pulse';
      countdownDisplay.innerHTML = '<p class="text-lg font-bold text-red-600">⏰ Fecha de entrega vencida</p>';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    let colorClass = 'text-green-600';
    let panelClass = 'bg-white border-blue-300';

    if (days < 1) {
      colorClass = 'text-red-600';
      panelClass = 'bg-red-50 border-red-300 animate-pulse';
    } else if (days <= 3) {
      colorClass = 'text-yellow-600';
      panelClass = 'bg-yellow-50 border-yellow-300';
    }

    countdownDisplay.className = `text-center py-3 rounded border transition-colors ${panelClass}`;
    countdownDisplay.innerHTML = `<p class="text-lg font-bold ${colorClass}">Faltan ${days} días, ${hours} horas</p>`;
  }

  deadlineInput.addEventListener('change', () => {
    setDeliveryDateValue(deadlineInput.value);
    updateDeadlineCountdown();
  });

  updateDeadlineCountdown();
  if (state.checklistDeadlineInterval) clearInterval(state.checklistDeadlineInterval);
  state.checklistDeadlineInterval = setInterval(updateDeadlineCountdown, 60000);
}
