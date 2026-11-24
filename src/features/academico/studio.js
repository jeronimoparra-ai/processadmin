// A failed local write keeps the editor available for recovery.
window.addEventListener('beforeunload', event => {
  if (window.state.academic?.unsavedEditor) {
    event.preventDefault();
    event.returnValue = '';
  }
});

function buildAcademicStudio() {
  const A = Academic;
  const page = A.page('studio', 4);
  if (!page) return;
  const {main, project, section} = page;
  const s = A.session();
  const card = A.panel(main, section.title);
  const toolbar = A.node('div', undefined, 'academic-actions');
  const editor = A.node('textarea', undefined, 'dp-textarea');
  editor.setAttribute('aria-label', 'Contenido de ' + section.title);
  editor.rows = 14;
  editor.value = section.body;
  const count = A.node('output');
  const status = A.node('span', 'Listo');
  status.setAttribute('role','status');
  function updateCount() {
    const words = editor.value.trim().split(/\s+/).filter(Boolean).length;
    count.textContent = words + ' palabras · ' + editor.value.length + ' caracteres';
  }
  function save() {
    status.textContent = 'Guardando…';
    const ok = A.change((_, ctx) => { ctx.section.body = editor.value; });
    status.textContent = ok ? (navigator.onLine ? 'Guardado' : 'Guardado sin conexión') : 'Pendiente de guardar';
    s.unsavedEditor = ok ? null : save;
    updateCount();
    return ok;
  }
  editor.oninput = save;
  function insert(before, placeholder, after = '') {
    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
    editor.setRangeText(before + (selected || placeholder) + after, editor.selectionStart, editor.selectionEnd, 'end');
    editor.focus(); save();
  }
  toolbar.append(A.button('Encabezado', () => insert('\n## ', 'Encabezado', '\n')),
    A.button('Lista', () => insert('\n- ', 'Elemento', '\n')),
    A.button('Tabla', () => insert('\n', '| Columna 1 | Columna 2 |\n| --- | --- |\n| Dato | Dato |', '\n')),
    A.button('Figura', () => insert('\nFigura: ', 'Descripción', '\n')));
  if (project.citations.length) {
    const options = project.citations.map(c => [c.id, c.quote]);
    const chooser = A.select(options, options[0][0], () => {}, 'Cita textual');
    toolbar.append(chooser, A.button('Insertar cita', () => {
      editor.setRangeText('[[cita:' + chooser.value + ']]', editor.selectionStart, editor.selectionEnd, 'end');
      editor.focus(); save();
    }));
  } else toolbar.append(A.button('Agregar citas en la biblioteca', () => navigate('library')));
  const focus = A.button('', () => { s.focus = !s.focus; setFocus(); editor.focus(); });
  function setFocus() {
    main.classList.toggle('academic-focus', s.focus);
    focus.textContent = s.focus ? 'Salir de concentración' : 'Modo concentración';
    focus.setAttribute('aria-pressed', String(s.focus));
  }
  toolbar.append(focus);
  card.append(toolbar, editor, count, status);
  const history = A.panel(main, 'Historial de la sección');
  history.append(A.button('Guardar versión', () => {
    if (A.change((_, ctx) => ctx.section.history.push({at: new Date().toISOString(), body: editor.value}))) A.render();
  }));
  for (const version of section.history.slice().reverse()) {
    history.append(A.button('Restaurar ' + new Date(version.at).toLocaleString(), () => {
      if (A.change((_, ctx) => {
        ctx.section.history.push({at: new Date().toISOString(), body: ctx.section.body});
        ctx.section.body = version.body;
      })) A.render();
    }));
  }
  updateCount(); setFocus();
}
