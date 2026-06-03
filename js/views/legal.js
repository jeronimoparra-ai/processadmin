// ═══════════════════════════════════════════════════════════════════════
// LEGAL.JS - Información del proyecto, privacidad, términos y contacto
// ═══════════════════════════════════════════════════════════════════════

function buildLegalView() {
  const updatedLabel = '29 de mayo de 2026';

  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <div class="dp-card p-8">
        <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold">${docproIconHtml('panel', 'Información legal y del proyecto', 'docpro-icon docpro-icon--lg')}<span>Información legal y del proyecto</span></h2>
        <p class="max-w-3xl text-[var(--dp-text-secondary)]">ProcessAdmin es una herramienta web para redactar, organizar y exportar trabajos académicos en APA 7. Este espacio resume quién lo presenta, cómo se guarda la información y qué expectativas razonables puede tener la persona usuaria.</p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="dp-card p-6">
          <h3 class="mb-3 flex items-center gap-2 text-xl font-bold">${docproIconHtml('achievement', 'Identidad del proyecto', 'docpro-icon docpro-icon--sm')}<span>Identidad del proyecto</span></h3>
          <div class="space-y-3 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p><strong class="text-[var(--dp-text-primary)]">Nombre:</strong> ProcessAdmin</p>
            <p><strong class="text-[var(--dp-text-primary)]">Autoría visible:</strong> Equipo editorial de ProcessAdmin</p>
            <p><strong class="text-[var(--dp-text-primary)]">Fecha de actualización:</strong> ${updatedLabel}</p>
            <p>La interfaz está pensada para uso académico personal, con énfasis en redacción asistida, revisión de estructura y exportación local.</p>
          </div>
        </section>

        <section class="dp-card p-6">
          <h3 class="mb-3 flex items-center gap-2 text-xl font-bold">${docproIconHtml('review', 'Contacto y soporte', 'docpro-icon docpro-icon--sm')}<span>Contacto y soporte</span></h3>
          <div class="space-y-3 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p>Canal sugerido para el proyecto: <a class="text-[var(--dp-accent-dark)] underline decoration-dotted underline-offset-2" href="mailto:andresjeroparra@gmail.com">andresjeroparra@gmail.com</a></p>
            <p>Si publicas este sitio con un equipo real, sustituye ese correo por el canal oficial del proyecto.</p>
            <p>No hay formulario de contacto ni registro de usuarios dentro de esta versión.</p>
          </div>
        </section>

        <section class="dp-card p-6">
          <h3 class="mb-3 flex items-center gap-2 text-xl font-bold">${docproIconHtml('validation', 'Privacidad', 'docpro-icon docpro-icon--sm')}<span>Privacidad</span></h3>
          <div class="space-y-3 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p>Los textos, referencias, listas y configuraciones se guardan en <strong class="text-[var(--dp-text-primary)]">localStorage</strong> del navegador.</p>
            <p>No se envían datos a un servidor propio desde esta interfaz y no se solicita una cuenta para usar las herramientas visibles.</p>
            <p>Si borras los datos del sitio en el navegador, se elimina también la información guardada localmente.</p>
          </div>
        </section>

        <section class="dp-card p-6">
          <h3 class="mb-3 flex items-center gap-2 text-xl font-bold">${docproIconHtml('ideas', 'Términos de uso', 'docpro-icon docpro-icon--sm')}<span>Términos de uso</span></h3>
          <div class="space-y-3 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p>ProcessAdmin ofrece apoyo de redacción y organización. El resultado debe revisarse antes de entregar cualquier trabajo académico.</p>
            <p>La herramienta no sustituye la verificación de fuentes, la revisión docente ni las normas institucionales específicas de cada curso.</p>
            <p>Las plantillas, citas y exportaciones se generan con los datos que introduce la persona usuaria.</p>
          </div>
        </section>
      </div>

      <section class="dp-card p-6">
        <h3 class="mb-3 flex items-center gap-2 text-xl font-bold">${docproIconHtml('panel', 'Resumen de confianza', 'docpro-icon docpro-icon--sm')}<span>Resumen de confianza</span></h3>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-[var(--dp-border)] bg-[var(--dp-surface-2)] p-4 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p class="font-semibold text-[var(--dp-text-primary)]">Guardado local</p>
            <p>La información vive en el navegador del usuario.</p>
          </div>
          <div class="rounded-xl border border-[var(--dp-border)] bg-[var(--dp-surface-2)] p-4 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p class="font-semibold text-[var(--dp-text-primary)]">Uso orientativo</p>
            <p>Las recomendaciones ayudan a redactar, pero no garantizan una calificación.</p>
          </div>
          <div class="rounded-xl border border-[var(--dp-border)] bg-[var(--dp-surface-2)] p-4 text-sm leading-6 text-[var(--dp-text-secondary)]">
            <p class="font-semibold text-[var(--dp-text-primary)]">Sitio sin cuenta</p>
            <p>No se solicita inicio de sesión para usar la interfaz pública.</p>
          </div>
        </div>
      </section>

      <div class="flex flex-wrap gap-3">
        <button class="dp-btn dp-btn-primary" data-view="panel">Volver al panel</button>
        <button class="dp-btn dp-btn-ghost" data-view="exportar">Ir a exportación</button>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  document.getElementById('main-workspace')?.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });
}