const Academic = (() => {
  const key = 'academic_workspace_v2';
  const routes = Object.freeze({
    planner: 'Planificador', library: 'Biblioteca', studio: 'Escritura', review: 'Revisión', publishing: 'Publicación'
  });
  function node(tag, content, className) {
    const el = document.createElement(tag);
    if (content !== undefined) el.textContent = content;
    if (className) el.className = className;
    return el;
  }
  function button(label, action) {
    const el = node('button', label, 'dp-btn dp-btn-ghost dp-btn-sm');
    el.type = 'button';
    el.onclick = action;
    return el;
  }
  function select(options, value, change, label) {
    const el = node('select', undefined, 'dp-select');
    el.setAttribute('aria-label', label);
    for (const [id, text] of options) el.add(new Option(text, id));
    el.value = value;
    el.onchange = () => change(el.value);
    return el;
  }
  function session() {
    if (!window.state.academic) {
      const raw = safeStorageGet(key);
      window.state.academic = {raw, space: AcademicDomain.workspace(raw === null ? undefined : JSON.parse(raw)),
        selection: safeParse('academic_selection', {}), filter: '', status: '', focus: false};
    }
    return window.state.academic;
  }
  function context() {
    return AcademicDomain.context(session().space, session().selection);
  }
  function choose(selection) {
    session().selection = {...session().selection, ...selection};
    safeStorageSetJSON('academic_selection', session().selection);
  }
  function change(edit) {
    try {
      const s = session();
      if (safeStorageGet(key) !== s.raw) throw new Error('El espacio cambió en otra pestaña. Copia el texto pendiente y recarga.');
      const next = structuredClone(s.space);
      edit(next, AcademicDomain.context(next, s.selection));
      const valid = AcademicDomain.workspace(next);
      const raw = JSON.stringify(valid);
      if (!safeStorageSet(key, raw)) throw new Error('No hay espacio para guardar los cambios.');
      Object.assign(s, {space: valid, raw});
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  }
  function render() { navigate(window.state.activeView); }
  function form(title, fields, submit) {
    const dialog = node('dialog', undefined, 'academic-dialog dp-card');
    const form = node('form');
    form.append(node('h2', title, 'dp-card-title'));
    for (const [name, label, kind, value = '', required = false] of fields) {
      const wrap = node('label', label);
      let input;
      if (Array.isArray(kind)) {
        input = select(kind.map(item => [item, item]), value || kind[0], () => {}, label);
      } else {
        input = node(kind === 'textarea' ? 'textarea' : 'input', undefined, 'dp-input');
        if (input.tagName === 'INPUT') input.type = kind;
        input.value = value;
      }
      input.name = name;
      input.required = required;
      wrap.append(input);
      form.append(wrap);
    }
    const save = node('button', 'Guardar', 'dp-btn dp-btn-primary');
    form.append(save, button('Cancelar', () => dialog.close()));
    form.onsubmit = event => {
      event.preventDefault();
      if (submit(Object.fromEntries(new FormData(form)))) { dialog.close(); render(); }
    };
    dialog.onclose = () => dialog.remove();
    dialog.append(form); document.body.append(dialog); dialog.showModal();
  }
  function panel(parent, title) {
    const card = node('section', undefined, 'academic-card dp-card');
    card.append(node('h2', title, 'dp-card-title'));
    parent.append(card);
    return card;
  }
  function page(view, depth) {
    const root = document.getElementById('main-workspace');
    const main = node('div', undefined, 'academic');
    root.replaceChildren(main);
    try { session(); } catch {
      main.append(node('p', 'No se pudo leer el espacio académico guardado. Recupera una copia antes de continuar.'));
      return null;
    }
    const nav = node('nav', undefined, 'academic-actions');
    nav.setAttribute('aria-label', 'Flujo académico');
    for (const [id, label] of Object.entries(routes)) {
      const link = button(label, () => navigate(id));
      if (id === view) link.setAttribute('aria-current', 'page');
      nav.append(link);
    }
    main.append(nav);
    const ctx = context();
    const levels = [
      ['project', 'Proyecto', session().space.projects], ['course', 'Curso', ctx.project?.courses],
      ['doc', 'Documento', ctx.course?.documents], ['section', 'Sección', ctx.doc?.sections]
    ];
    const controls = node('div', undefined, 'academic-actions');
    main.append(controls);
    for (const [key, label, rows] of levels.slice(0, depth)) {
      if (!rows?.length) {
        main.append(node('p', 'Para continuar, crea un elemento de tipo «' + label + '» en el planificador.'),
          button('Abrir planificador', () => navigate('planner')));
        return null;
      }
      const wrap = node('label', label);
      wrap.append(select(rows.map(row => [row.id, row.title]), ctx[key].id, value => {
        if (session().unsavedEditor && !session().unsavedEditor()) { wrap.querySelector('select').value = ctx[key].id; return; }
        choose({[key]: value}); render();
      }, label));
      controls.append(wrap);
    }
    return {main, ...ctx};
  }
  return {node, button, select, page, panel, form, render, session, context, choose, change};
})();

function buildAcademicPlanner() {
  const A = Academic, D = AcademicDomain;
  const page = A.page('planner', 0);
  if (!page) return;
  const {main, project, course, doc} = page;
  const s = A.session();
  const dashboard = A.panel(main, 'Espacio académico');
  const sections = s.space.projects.flatMap(p => p.courses.flatMap(c => c.documents.flatMap(d => d.sections)));
  dashboard.append(A.node('p', s.space.projects.length + ' proyectos · ' +
    sections.filter(row => row.status === 'Completado').length + ' de ' + sections.length + ' secciones completadas'));
  if (project) dashboard.append(A.button('Continuar en ' + project.title, () => navigate(doc?.sections.length ? 'studio' : 'library')));
  const search = A.node('input', undefined, 'dp-input');
  search.type = 'search'; search.placeholder = 'Buscar proyecto'; search.setAttribute('aria-label', search.placeholder);
  search.value = s.filter;
  const filters = A.node('div', undefined, 'academic-actions');
  filters.append(search, A.select([['', 'Todos los estados'], ...D.states.map(v => [v,v])], s.status,
    value => { s.status = value; applyFilter(); }, 'Filtrar por estado'));
  dashboard.append(filters);
  search.oninput = () => { s.filter = search.value; applyFilter(); };

  const levels = [
    ['project','Proyecto', 'projects', null, D.createProject],
    ['course','Curso','courses', 'project', D.createCourse],
    ['doc','Documento','documents', 'course', D.createDocument],
    ['section','Sección','sections','doc', row => D.createSection(row.sectionType, row)]
  ];
  for (const [key, label, collection, parent, create] of levels) {
    if (parent && !page[parent]) break;
    const getRows = (space, ctx) => parent ? ctx[parent][collection] : space[collection];
    const rows = getRows(s.space, page);
    const heading = parent ? label + ' · ' + page[parent].title : 'Proyectos';
    const card = A.panel(main, heading);
    function edit(row) {
      const fields = [['title','Nombre','text', row?.title,true], ['status','Estado',D.states,row?.status]];
      if (key === 'project') fields.push(['instructions','Instrucciones del docente','textarea',row?.instructions],
        ['objective','Objetivo','textarea',row?.objective], ['due','Fecha de entrega','date',row?.due]);
      if (key === 'doc') fields.push(['requirements','Secciones requeridas (un título o tipo por línea)','textarea',row?.requirements.join('\n')]);
      if (key === 'section') fields.push(['sectionType','Tipo de sección',D.sectionTypes,row?.sectionType]);
      A.form((row ? 'Editar' : 'Crear') + ' · ' + label, fields, values => {
        if (values.requirements !== undefined) values.requirements = values.requirements.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
        let saved;
        const ok = A.change((space, ctx) => {
          const list = getRows(space, ctx);
          saved = create({...row, ...values});
          if (row) list[list.findIndex(item => item.id === row.id)] = saved;
          else list.push(saved);
        });
        if (ok) A.choose({[key]: saved.id});
        return ok;
      });
    }
    card.append(A.button('Crear ' + label.toLowerCase(), () => edit()));
    for (const row of rows) {
      const line = A.node('div', undefined, 'academic-actions');
      if (key === 'project') { line.dataset.projectTitle = row.title.toLocaleLowerCase(); line.dataset.status = row.status; }
      const open = A.button(row.title, () => { A.choose({[key]: row.id}); A.render(); });
      if (page[key]?.id === row.id) open.setAttribute('aria-current','true');
      line.append(open, A.node('span',row.status), A.button('Editar', () => edit(row)),
        A.button('Eliminar', () => {
          if (window.confirm('¿Eliminar «' + row.title + '» y su contenido?') && A.change((space, ctx) => {
            const list = getRows(space, ctx);
            list.splice(list.findIndex(item => item.id === row.id), 1);
          })) A.render();
        }));
      card.append(line);
    }
    if (!rows.length) card.append(A.node('p', 'Todavía no hay elementos. Usa «Crear ' + label.toLowerCase() + '» para empezar.'));
  }
  if (project && (project.objective || project.instructions || project.due)) {
    const details = A.panel(main, 'Plan de ' + project.title);
    for (const value of [project.objective, project.instructions, project.due && 'Entrega: ' + project.due]) {
      if (value) details.append(A.node('p', value));
    }
  }
  const empty = A.node('p', 'Ningún proyecto coincide con los filtros.');
  dashboard.append(empty);
  function applyFilter() {
    const rows = [...main.querySelectorAll('[data-project-title]')];
    rows.forEach(row => { row.hidden = !row.dataset.projectTitle.includes(s.filter.trim().toLocaleLowerCase()) ||
      Boolean(s.status && row.dataset.status !== s.status); });
    empty.hidden = !rows.length || rows.some(row => !row.hidden);
  }
  applyFilter();
}
