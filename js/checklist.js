// ═══════════════════════════════════════════════════════════════════════
// CHECKLIST.JS - Listas de verificación por pestañas (Estructura, Formato, Criterios)
// ═══════════════════════════════════════════════════════════════════════

function buildChecklist() {
  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div class="flex gap-0 mb-6 overflow-x-auto border-b border-[var(--dp-border)]">
        <button class="checklist-tab active border-b-4 border-transparent px-6 py-3 font-bold text-[var(--dp-text-secondary)] transition-all hover:text-[var(--dp-text-primary)]" data-tab="estructura">Estructura del trabajo</button>
        <button class="checklist-tab border-b-4 border-transparent px-6 py-3 font-bold text-[var(--dp-text-secondary)] transition-all hover:text-[var(--dp-text-primary)]" data-tab="formato">Formato Word APA 7</button>
        <button class="checklist-tab border-b-4 border-transparent px-6 py-3 font-bold text-[var(--dp-text-secondary)] transition-all hover:text-[var(--dp-text-primary)]" data-tab="criterios">Criterios del profesor</button>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="checklist-tab-content" data-tab="estructura">
            <div class="dp-card p-6 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <h3 class="dp-card-title">Estructura del trabajo</h3>
                <span id="progress-estructura" class="text-xs font-semibold text-[var(--dp-text-muted)]">0/0 completados</span>
              </div>
              <div id="checklist-estructura" class="space-y-2"></div>
              <button class="add-checklist-item dp-btn dp-btn-ghost w-full" data-tab="estructura">Agregar ítem</button>
            </div>
          </div>

          <div class="checklist-tab-content hidden" data-tab="formato">
            <div class="dp-card p-6 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <h3 class="dp-card-title">Formato Word APA 7</h3>
                <span id="progress-formato" class="text-xs font-semibold text-[var(--dp-text-muted)]">0/0 completados</span>
              </div>
              <div id="checklist-formato" class="space-y-2"></div>
              <button class="add-checklist-item dp-btn dp-btn-ghost w-full" data-tab="formato">Agregar ítem</button>
            </div>
          </div>

          <div class="checklist-tab-content hidden" data-tab="criterios">
            <div class="dp-card p-6 space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="dp-card-title">Criterios del profesor</h3>
                  <p class="text-xs text-[var(--dp-text-muted)]">Se sincronizan con la rúbrica del módulo 3.</p>
                </div>
                <span id="progress-criterios" class="text-xs font-semibold text-[var(--dp-text-muted)]">0/0 completados</span>
              </div>
              <div id="checklist-criterios" class="space-y-2"></div>
              <button class="add-checklist-item dp-btn dp-btn-ghost w-full" data-tab="criterios">Agregar ítem</button>
            </div>
          </div>

          <div class="dp-card p-6">
            <h3 class="mb-3 flex items-center gap-2 font-bold">${docproIconHtml('panel', 'Progreso global', 'docpro-icon docpro-icon--sm')}<span>Progreso global</span></h3>
            <div class="dp-progress mb-2 h-3">
              <div id="checklist-overall-bar" class="dp-progress-fill" style="width: 0%"></div>
            </div>
            <p id="checklist-overall-label" class="text-sm font-semibold text-[var(--dp-text-secondary)]">0% completado</p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="dp-card sticky top-6 space-y-6 p-6">
            <div>
              <h3 class="mb-2 flex items-center gap-2 font-bold">${docproIconHtml('panel', 'Progreso por pestaña', 'docpro-icon docpro-icon--sm')}<span>Progreso por pestaña</span></h3>
              <div class="space-y-4">
                <div>
                  <div class="mb-1 flex justify-between"><span class="text-xs font-semibold text-[var(--dp-text-secondary)]">Estructura</span><span class="text-xs font-semibold text-[var(--dp-text-secondary)]" id="progress-count-estructura">0/0</span></div>
                  <div class="dp-progress h-2"><div id="bar-estructura" class="dp-progress-fill w-0"></div></div>
                </div>
                <div>
                  <div class="mb-1 flex justify-between"><span class="text-xs font-semibold text-[var(--dp-text-secondary)]">Formato</span><span class="text-xs font-semibold text-[var(--dp-text-secondary)]" id="progress-count-formato">0/0</span></div>
                  <div class="dp-progress h-2"><div id="bar-formato" class="dp-progress-fill w-0"></div></div>
                </div>
                <div>
                  <div class="mb-1 flex justify-between"><span class="text-xs font-semibold text-[var(--dp-text-secondary)]">Criterios</span><span class="text-xs font-semibold text-[var(--dp-text-secondary)]" id="progress-count-criterios">0/0</span></div>
                  <div class="dp-progress h-2"><div id="bar-criterios" class="dp-progress-fill w-0"></div></div>
                </div>
              </div>
            </div>

            <div class="border-t border-[var(--dp-border)] pt-4">
              <h3 class="mb-3 flex items-center gap-2 font-bold">${docproIconHtml('review', 'Entrega', 'docpro-icon docpro-icon--sm')}<span>Entrega</span></h3>
              <input id="deadline-date" type="datetime-local" aria-label="Fecha de entrega" class="dp-input mb-2 text-sm">
              <p class="mb-2 text-xs text-[var(--dp-text-muted)]">Fecha compartida con el panel y la exportación.</p>
              <div id="countdown-display" class="rounded-lg border border-[var(--dp-border)] bg-white px-3 py-3 text-center transition-colors">
                <p class="text-sm font-bold text-[var(--dp-text-primary)]">Pendiente de fecha</p>
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
      <div class="dp-card flex items-center gap-2 p-3 transition-colors group hover:bg-[var(--dp-surface-2)]">
        <input type="checkbox" ${item.checked ? 'checked' : ''} aria-label="Marcar ítem como completado" class="w-4 h-4 accent-blue-600 checklist-input" data-tab="${tab}" data-idx="${idx}">
        <input type="text" value="${escapeHtml(item.text)}" aria-label="Texto del ítem de checklist" class="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400" data-tab="${tab}" data-idx="${idx}">
        <button class="text-slate-500 hover:text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity move-item" data-tab="${tab}" data-idx="${idx}" data-direction="-1" aria-label="Mover ítem hacia arriba">▲</button>
        <button class="text-slate-500 hover:text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity move-item" data-tab="${tab}" data-idx="${idx}" data-direction="1" aria-label="Mover ítem hacia abajo">▼</button>
        <button class="text-red-600 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity delete-item" data-tab="${tab}" data-idx="${idx}" aria-label="Eliminar ítem">Eliminar</button>
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
      countdownDisplay.innerHTML = '<p class="text-lg font-bold text-red-600">Fecha de entrega vencida</p>';
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
