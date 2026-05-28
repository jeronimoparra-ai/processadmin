// ═══════════════════════════════════════════════════════════════════════
// PANEL.JS - Panel de Control y Visualización de Métricas
// ═══════════════════════════════════════════════════════════════════════

function buildPanel() {
  const metrics = calculateQualityMetrics();
  const motivationalMsg = getMotivationalMessage(metrics.overall);
  const pendingItems = buildPendingItems(metrics);

  const html = `
    <div class="space-y-8 max-w-7xl mx-auto">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div class="relative">
          <h1 class="text-5xl font-black mb-3">📝 Tu Proyecto Empieza Aquí</h1>
          <p class="text-lg text-blue-100 leading-relaxed max-w-2xl">
            Crea documentos profesionales con formato APA 7, redacción de calidad y referencias bibliográficas correctas. Paso a paso, hacia la excelencia académica.
          </p>
        </div>
      </div>

      <!-- Quality Dashboard -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <span>📊</span> Panel de Calidad
        </h2>
        <p class="text-gray-600 text-sm mb-8">Monitoreo en tiempo real de tu progreso en cada área</p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-blue-900 text-sm">📋 Estructura</h3>
              <span class="text-2xl font-bold text-blue-600">${metrics.structure}%</span>
            </div>
            <div class="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-600 rounded-full transition-all" style="width: ${metrics.structure}%"></div>
            </div>
            <p class="text-xs text-blue-700 mt-2">Documento completado</p>
          </div>

          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-purple-900 text-sm">📐 Normas APA 7</h3>
              <span class="text-2xl font-bold text-purple-600">${metrics.apa}%</span>
            </div>
            <div class="h-2 bg-purple-200 rounded-full overflow-hidden">
              <div class="h-full bg-purple-600 rounded-full transition-all" style="width: ${metrics.apa}%"></div>
            </div>
            <p class="text-xs text-purple-700 mt-2">Cumplimiento de normas</p>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-green-900 text-sm">✅ Criterios Docente</h3>
              <span class="text-2xl font-bold text-green-600">${metrics.criteria}%</span>
            </div>
            <div class="h-2 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-green-600 rounded-full transition-all" style="width: ${metrics.criteria}%"></div>
            </div>
            <p class="text-xs text-green-700 mt-2">Criterios completados</p>
          </div>

          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-300">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-orange-900 text-sm">📄 Formato Word</h3>
              <span class="text-2xl font-bold text-orange-600">${metrics.wordFormat}%</span>
            </div>
            <div class="h-2 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-orange-600 rounded-full transition-all" style="width: ${metrics.wordFormat}%"></div>
            </div>
            <p class="text-xs text-orange-700 mt-2">Listo para exportar</p>
          </div>
        </div>

        <!-- Overall Readiness -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">🎯 Preparación General</h3>
            <span class="text-5xl font-black text-blue-300">${metrics.overall}%</span>
          </div>
          <p class="text-lg text-slate-100 mb-4">${motivationalMsg}</p>
          <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style="width: ${metrics.overall}%"></div>
          </div>
        </div>

        <div class="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <h3 class="text-xl font-bold text-slate-900 mb-4">🧭 Pendientes críticos</h3>
          <div class="space-y-2">
            ${pendingItems.length > 0 ? pendingItems.map(item => `
              <button class="w-full text-left bg-white border border-amber-200 rounded-lg px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-amber-50 transition-colors pending-nav" data-view="${item.view}">
                ${item.label}
              </button>
            `).join('') : '<p class="text-sm text-emerald-700 font-semibold">No tienes pendientes críticos en este momento.</p>'}
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group bg-white rounded-2xl border-2 border-blue-100 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-blue-600 text-4xl mb-3">⏰</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Fecha de Entrega</p>
          <p class="text-3xl font-bold text-blue-900 mb-1">31 Mayo</p>
          <p id="countdown" class="text-sm text-blue-600 font-semibold">Calculando...</p>
        </div>

        <div class="group bg-white rounded-2xl border-2 border-purple-100 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-purple-600 text-4xl mb-3">📊</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Puntuación Máxima</p>
          <p class="text-3xl font-bold text-purple-900 mb-1">100 pts</p>
          <p class="text-sm text-slate-500">Escala definitiva</p>
        </div>

        <div class="group bg-white rounded-2xl border-2 border-pink-100 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-pink-600 text-4xl mb-3">👥</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Modalidad</p>
          <p class="text-3xl font-bold text-pink-900 mb-1">Individual</p>
          <p class="text-sm text-slate-500">O máx. 3 integrantes</p>
        </div>

        <div class="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div class="text-emerald-600 text-4xl mb-3">📈</div>
          <p class="text-slate-600 text-sm font-medium mb-2">Tu Progreso</p>
          <p id="overall-progress-percent" class="text-3xl font-bold text-emerald-900 mb-2">${metrics.overall}%</p>
          <div class="h-2.5 bg-emerald-200 rounded-full overflow-hidden">
            <div id="overall-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style="width: ${metrics.overall}%"></div>
          </div>
        </div>
      </div>

      <!-- Getting Started Guide -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span class="text-3xl">🎯</span> Guía de Inicio Rápido
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="relative p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 hover:shadow-lg transition-all cursor-pointer" onclick="document.querySelector('[data-view=organizador]')?.click() || false">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h3 class="text-lg font-bold text-blue-900 mb-3">Planifica tu Investigación</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Usa el <strong>Organizador de Ideas</strong> para definir tema, problema, preguntas y objetivos.
            </p>
          </div>

          <div class="relative p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600 hover:shadow-lg transition-all cursor-pointer" onclick="document.querySelector('[data-view=redactor]')?.click() || false">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
            <h3 class="text-lg font-bold text-purple-900 mb-3">Redacta tu Contenido</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Usa el <strong>Redactor Premium</strong> con contador de palabras y sugerencias de conectores académicos.
            </p>
          </div>

          <div class="relative p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border-l-4 border-pink-600 hover:shadow-lg transition-all cursor-pointer" onclick="document.querySelector('[data-view=exportar]')?.click() || false">
            <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">3</div>
            <h3 class="text-lg font-bold text-pink-900 mb-3">Exporta a Word</h3>
            <p class="text-slate-700 text-sm leading-relaxed">
              Genera un <strong>documento Word profesional</strong> con portada, índice y formato APA 7 automático.
            </p>
          </div>
        </div>
      </div>

      <!-- Document Structure Requirements -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span class="text-3xl">📋</span> Estructura de tu Documento
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          ${['📑 Portada profesional', '📝 Introducción detallada', '🎯 Misión y Visión', '📊 Análisis DOFA', '🏢 Organigrama claro', '🧭 Análisis de Dirección', '📈 Indicadores KPI', '✅ Conclusiones sólidas', '📚 Referencias APA 7', '✏️ Sin errores ortográficos', '📄 Máximo 20 páginas', '⏰ Entregado a tiempo'].map((item, idx) => `
            <label class="flex items-center gap-4 p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors group">
              <input type="checkbox" class="section-check w-6 h-6 accent-blue-600 cursor-pointer" data-section="${idx}">
              <span class="text-slate-700 font-medium group-hover:text-blue-700 transition-colors">${item}</span>
            </label>
          `).join('')}
        </div>
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">📊</span>
            <p class="font-bold text-slate-900">Tu Progreso de Completitud</p>
          </div>
          <div class="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
            <div id="section-progress" class="h-full bg-gradient-to-r from-blue-600 to-purple-600 w-0 transition-all duration-500 rounded-full"></div>
          </div>
          <p class="text-sm text-slate-600 font-semibold"><span id="section-count">0/12</span> elementos completados</p>
        </div>
      </div>

      <!-- Section Progress Overview -->
      <div class="bg-white rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span class="text-3xl">🔍</span> Avance por Sección
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-blue-900">📋 Planeación</h3>
              <span id="planeacion-status" class="text-2xl font-bold text-blue-600">0%</span>
            </div>
            <div class="h-3 bg-blue-200 rounded-full overflow-hidden">
              <div id="planeacion-bar" class="h-full bg-gradient-to-r from-blue-500 to-blue-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 250+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-purple-900">🏗️ Organización</h3>
              <span id="organizacion-status" class="text-2xl font-bold text-purple-600">0%</span>
            </div>
            <div class="h-3 bg-purple-200 rounded-full overflow-hidden">
              <div id="organizacion-bar" class="h-full bg-gradient-to-r from-purple-500 to-purple-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-orange-900">🧭 Dirección</h3>
              <span id="direccion-status" class="text-2xl font-bold text-orange-600">0%</span>
            </div>
            <div class="h-3 bg-orange-200 rounded-full overflow-hidden">
              <div id="direccion-bar" class="h-full bg-gradient-to-r from-orange-500 to-orange-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>

          <div class="p-6 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-300">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-red-900">📊 Control</h3>
              <span id="control-status" class="text-2xl font-bold text-red-600">0%</span>
            </div>
            <div class="h-3 bg-red-200 rounded-full overflow-hidden">
              <div id="control-bar" class="h-full bg-gradient-to-r from-red-500 to-red-700 w-0 transition-all duration-500"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">Meta: 150+ palabras</p>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-10 text-white">
        <h2 class="text-3xl font-bold mb-8">📈 Estadísticas del Proyecto</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-4xl font-black text-blue-400 mb-2" id="stat-content-words">0</div>
            <p class="text-slate-300 font-medium">Palabras Redactadas</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-purple-400 mb-2" id="stat-work-time">0 min</div>
            <p class="text-slate-300 font-medium">Tiempo de Trabajo</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-green-400 mb-2" id="stat-citations">0</div>
            <p class="text-slate-300 font-medium">Referencias APA</p>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-pink-400 mb-2" id="stat-simulations">0</div>
            <p class="text-slate-300 font-medium">Evaluaciones</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  document.querySelectorAll('.pending-nav').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });
  startCountdown();

  // Restore checklist
  const checks = loadJSON('ws_checklist_main', Array(12).fill(false));

  document.querySelectorAll('.section-check').forEach((el, idx) => {
    el.checked = checks[idx];
        el.addEventListener('change', () => {
          checks[idx] = el.checked;
          saveJSON('ws_checklist_main', checks);
          updateSectionProgress(checks);
        });
  });

  updateSectionProgress(checks);
  updateSectionCompleteness();
}

function updateSectionProgress(checks) {
  const count = checks.filter(c => c).length;
  const total = checks.length;
  const percent = (count / total) * 100;

  const bar = document.getElementById('section-progress');
  const counter = document.getElementById('section-count');

  if (bar) bar.style.width = percent + '%';
  if (counter) counter.textContent = `${count}/${total}`;
}

function updateSectionCompleteness() {
  const fields = {
    planeacion: localStorage.getItem('ws_planeacion') || '',
    organizacion: localStorage.getItem('ws_organizacion') || '',
    direccion: localStorage.getItem('ws_direccion') || '',
    control: localStorage.getItem('ws_control') || ''
  };

  const targetWords = { planeacion: 250, organizacion: 150, direccion: 150, control: 150 };
  let totalPercent = 0;
  let totalWords = 0;

  Object.keys(fields).forEach(key => {
    const wordCount = fields[key].trim().split(/\s+/).filter(w => w.length > 0).length;
    totalWords += wordCount;
    const percent = Math.min((wordCount / targetWords[key]) * 100, 100);
    totalPercent += percent;

    const bar = document.getElementById(`${key}-bar`);
    const status = document.getElementById(`${key}-status`);
    if (bar) bar.style.width = percent + '%';
    if (status) status.textContent = Math.round(percent) + '%';
  });

  const overallPercent = Math.round(totalPercent / 4);
  const overallBar = document.getElementById('overall-progress-bar');
  const overallText = document.getElementById('overall-progress-percent');
  if (overallBar) overallBar.style.width = overallPercent + '%';
  if (overallText) overallText.textContent = overallPercent + '%';

  const statWords = document.getElementById('stat-content-words');
  if (statWords) statWords.textContent = totalWords;

  const workStartTime = localStorage.getItem('ws_work_start') ? new Date(parseInt(localStorage.getItem('ws_work_start'))) : null;
  const workMinutes = workStartTime ? Math.round((Date.now() - workStartTime.getTime()) / 1000 / 60) : 0;
  const statTime = document.getElementById('stat-work-time');
  if (statTime) statTime.textContent = workMinutes + ' min';

  const statCitations = document.getElementById('stat-citations');
  if (statCitations) statCitations.textContent = state.generatedCitations.length;

  const statSimulations = document.getElementById('stat-simulations');
  if (statSimulations) statSimulations.textContent = state.simulationHistory.length;
}
