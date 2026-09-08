// ═══════════════════════════════════════════════════════════════════════
// MODULES/INFO/INDEX.JS - Información Legal y Acerca del Proyecto
// ═══════════════════════════════════════════════════════════════════════

import { getIconSvg } from '../../components/icons/icons.js';

export function renderInfo(container, section = 'legal') {
  container.innerHTML = `
    <div class="space-y-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <button id="tab-btn-legal" class="px-3 py-1.5 rounded-lg text-sm font-bold ${section === 'legal' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}">
            Información Legal y Privacidad
          </button>
          <button id="tab-btn-acerca" class="px-3 py-1.5 rounded-lg text-sm font-bold ${section === 'acerca' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}">
            Acerca de ProcessAdmin
          </button>
        </div>
        <button id="btn-info-back" class="btn btn-secondary text-xs px-3 py-1.5">
          ← Volver al Inicio
        </button>
      </div>

      ${section === 'legal' ? `
        <div class="space-y-6">
          <section class="app-card p-6 md:p-8 bg-white space-y-4">
            <h2 class="text-xl font-bold text-slate-900">Privacidad y Almacenamiento Local</h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              ProcessAdmin opera bajo una política estricta de privacidad orientada al estudiante:
            </p>
            <ul class="space-y-2 text-sm text-slate-700">
              <li class="flex items-start gap-2">
                <span class="text-emerald-500 mt-1">${getIconSvg('check', '', 14)}</span>
                <span><strong>100% Client-Side:</strong> Todos tus borradores, citas bibliográficas y configuraciones se procesan y almacenan exclusivamente en el almacenamiento local (<code class="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">localStorage</code>) de tu navegador.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-500 mt-1">${getIconSvg('check', '', 14)}</span>
                <span><strong>Sin cuentas ni contraseñas:</strong> No requerimos registro, inicio de sesión ni recolección de datos personales o académicos.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-500 mt-1">${getIconSvg('check', '', 14)}</span>
                <span><strong>Sin telemetría invasiva:</strong> No rastreamos ni enviamos el contenido de tus textos académicos a ningún servidor externo.</span>
              </li>
            </ul>
          </section>

          <section class="app-card p-6 md:p-8 bg-white space-y-3">
            <h2 class="text-lg font-bold text-slate-900">Términos de Uso y Alcance Académico</h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              ProcessAdmin es una herramienta de apoyo para la redacción, organización y citación en normas APA 7.ª edición.
              Las sugerencias tipográficas, conectores y listas de verificación son orientativas y no reemplazan la consulta directa
              de las directrices institucionales específicas de tu universidad o docente evaluador.
            </p>
          </section>
        </div>
      ` : `
        <div class="space-y-6">
          <section class="app-card p-6 md:p-8 bg-white space-y-4">
            <h2 class="text-xl font-bold text-slate-900">Acerca de ProcessAdmin</h2>
            <p class="text-sm text-slate-600 leading-relaxed">
              ProcessAdmin es una plataforma académica de código abierto diseñada para asistir a estudiantes en la
              planificación, redacción estructurada, citación APA 7 y exportación directa a Microsoft Word.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-xs uppercase font-bold text-slate-400 block mb-1">Autoría</span>
                <p class="text-sm font-bold text-slate-800">Andrés Jeronimo Parra</p>
                <p class="text-xs text-slate-500 mt-0.5">Institución Universitaria Digital de Antioquia</p>
              </div>
              <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-xs uppercase font-bold text-slate-400 block mb-1">Contacto y Repositorio</span>
                <p class="text-sm font-bold text-blue-600">
                  <a href="mailto:andresjeroparra@gmail.com" class="hover:underline">andresjeroparra@gmail.com</a>
                </p>
                <p class="text-xs text-slate-500 mt-0.5">GitHub: jeronimoparra-ai/processadmin</p>
              </div>
            </div>
          </section>
        </div>
      `}
    </div>
  `;

  container.querySelector('#tab-btn-legal')?.addEventListener('click', () => renderInfo(container, 'legal'));
  container.querySelector('#tab-btn-acerca')?.addEventListener('click', () => renderInfo(container, 'acerca'));
  container.querySelector('#btn-info-back')?.addEventListener('click', () => {
    window.appNavigate?.('panel');
  });
}
