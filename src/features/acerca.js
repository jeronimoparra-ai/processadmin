function buildAcercaView() {
  const workspace = document.getElementById('main-workspace');
  if (!workspace) return;

  workspace.innerHTML = `
    <div class="dp-stagger" style="display:flex; flex-direction:column; gap:20px; max-width:760px;">

      <!-- Tarjeta del autor -->
      <div class="dp-card">
        <div style="display:flex; align-items:flex-start; gap:24px; flex-wrap:wrap;">

          <!-- Avatar -->
          <div style="
            width:72px; height:72px; border-radius:50%;
            background: var(--dp-accent-light);
            border: 2px solid var(--dp-accent-border);
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0;
            font-family: var(--dp-font-serif);
            font-size:24px; font-weight:700;
            color: var(--dp-accent-dark);
          ">AJ</div>

          <div style="flex:1; min-width:200px;">
            <h3 style="font-family:var(--dp-font-serif); font-size:20px; font-weight:700; margin:0 0 4px; color:var(--dp-text-primary);">
              Andrés Jeronimo Parra
            </h3>
            <p style="font-size:13px; color:var(--dp-text-secondary); margin:0 0 12px;">
              Tecnología en Desarrollo de Software · IU Digital de Antioquia
            </p>

            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
              <span class="dp-badge dp-badge-accent">IU Digital</span>
              <span class="dp-badge dp-badge-neutral">SENA · Ficha 3412544</span>
              <span class="dp-badge dp-badge-neutral">Bajo Cauca, Antioquia</span>
            </div>

            <p style="font-size:14px; color:var(--dp-text-secondary); line-height:1.7; margin:0 0 12px;">
              Estudiante de segundo semestre con enfoque en desarrollo web y sistemas IoT.
              ProcessAdmin nació como respuesta a una necesidad real: muchos estudiantes
              pierden tiempo valioso dando formato a sus trabajos en lugar de enfocarse
              en el contenido. Esta herramienta automatiza ese proceso y garantiza el
              cumplimiento de las normas APA 7 desde el primer párrafo.
            </p>

            <a href="mailto:andresjeroparra@gmail.com" style="
              display:inline-flex; align-items:center; gap:6px;
              font-size:13px; color:var(--dp-accent-dark);
              text-decoration:none; font-weight:600;
            ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              andresjeroparra@gmail.com
            </a>
          </div>
        </div>
      </div>

      <!-- Sobre el proyecto -->
      <div class="dp-card">
        <div class="dp-card-header">
          <h3 class="dp-card-title">Sobre ProcessAdmin</h3>
          <span class="dp-badge dp-badge-success">v1.0.0</span>
        </div>

        <p style="font-size:14px; color:var(--dp-text-secondary); line-height:1.7; margin:0 0 16px;">
              ProcessAdmin es una aplicación web académica construida completamente en HTML5,
              CSS3 y JavaScript vanilla. No utiliza frameworks, no requiere instalación y
              funciona directamente desde el navegador. Todo el contenido se guarda en el
              dispositivo del usuario mediante <code style="font-family:var(--dp-font-mono); font-size:12px; background:var(--dp-surface-2); padding:1px 5px; border-radius:3px;">localStorage</code>.
        </p>

        <div class="dp-grid-2">
          <div>
            <p class="dp-section-label">Tecnologías</p>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px;">
              ${[
      ['HTML5 + CSS3 + JS Vanilla', 'Sin frameworks'],
      ['CSS modular', 'Tokens y utilidades propias'],
      ['Chart.js', 'Gráficos de rúbrica'],
      ['docx.js v8.5.0', 'Exportación Word real'],
      ['Google Fonts', 'Lora + Plus Jakarta Sans'],
    ].map(([name, desc]) => `
                <li style="font-size:13px; display:flex; align-items:center; gap:8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--dp-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style="color:var(--dp-text-primary); font-weight:500;">${name}</span>
                  <span style="color:var(--dp-text-muted);">— ${desc}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <p class="dp-section-label">Módulos</p>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px;">
              ${[
      'Panel de control',
      'Redactor asistido',
      'Gestor APA 7',
      'Evaluador de rúbrica',
      'Organizador de ideas',
      'Checklist inteligente',
      'Exportación a Word',
    ].map(m => `
                <li style="font-size:13px; display:flex; align-items:center; gap:8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--dp-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style="color:var(--dp-text-secondary);">${m}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Contexto académico -->
      <div class="dp-card">
        <div class="dp-card-header">
          <h3 class="dp-card-title">Contexto académico</h3>
        </div>
        <div class="dp-grid-2">
          <div style="padding:16px; background:var(--dp-surface-2); border-radius:var(--dp-r-md); border:1px solid var(--dp-border);">
            <p style="font-size:11px; font-weight:700; color:var(--dp-text-muted); text-transform:uppercase; letter-spacing:0.06em; margin:0 0 6px;">Institución principal</p>
            <p style="font-size:14px; font-weight:600; color:var(--dp-text-primary); margin:0 0 4px;">IU Digital de Antioquia</p>
            <p style="font-size:13px; color:var(--dp-text-secondary); margin:0;">Tecnología en Desarrollo de Software · 2.° semestre</p>
          </div>
          <div style="padding:16px; background:var(--dp-surface-2); border-radius:var(--dp-r-md); border:1px solid var(--dp-border);">
            <p style="font-size:11px; font-weight:700; color:var(--dp-text-muted); text-transform:uppercase; letter-spacing:0.06em; margin:0 0 6px;">SENA</p>
            <p style="font-size:14px; font-weight:600; color:var(--dp-text-primary); margin:0 0 4px;">Centro de Formación Ambiental</p>
            <p style="font-size:13px; color:var(--dp-text-secondary); margin:0;">Ficha 3412544 · Proyecto IoT Apícola</p>
          </div>
        </div>
      </div>

      <!-- Repositorio y privacidad -->
      <div class="dp-card">
        <div class="dp-card-header">
          <h3 class="dp-card-title">Código abierto y privacidad</h3>
        </div>
        <div class="dp-alert dp-alert-accent" style="margin-bottom:16px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:1px;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>ProcessAdmin no recopila, almacena ni transmite ningún dato a servidores externos. Todo permanece en tu navegador mediante localStorage.</span>
        </div>
        <a href="https://github.com/jeronimoparra-ai/processadmin"
           target="_blank" rel="noopener noreferrer"
           style="
             display:inline-flex; align-items:center; gap:8px;
             padding:10px 18px; border-radius:var(--dp-r-sm);
             background:var(--dp-text-primary); color:var(--dp-text-inverse);
             font-family:var(--dp-font-sans); font-size:14px; font-weight:600;
             text-decoration:none; transition:background 0.15s;
           ">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Ver en GitHub
        </a>
      </div>

    </div>
  `;
}