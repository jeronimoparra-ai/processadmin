function buildAcademicLibrary() {
  const A = Academic, D = AcademicDomain;
  const page = A.page('library', 1);
  if (!page) return;
  const {main, project} = page;
  function edit(source) {
    A.form(source ? 'Editar fuente' : 'Nueva fuente', [
      ['title','Título','text',source?.title,true], ['type','Tipo',D.sourceTypes,source?.type],
      ['author','Autoría','text',source?.author], ['year','Año','text',source?.year],
      ['publisher','Editorial o revista','text',source?.publisher], ['doi','DOI','text',source?.doi],
      ['isbn','ISBN','text',source?.isbn], ['notes','Notas de investigación','textarea',source?.notes]
    ], values => A.change((_, ctx) => {
      const next = D.createSource(values.type, {...source, ...values});
      if (source) ctx.project.sources[ctx.project.sources.findIndex(item => item.id === source.id)] = next;
      else ctx.project.sources.push(next);
    }));
  }
  main.append(A.button('Añadir fuente', () => edit()));
  if (!project.sources.length) main.append(A.node('p','Añade una fuente para registrar notas y citas textuales.'));
  for (const source of project.sources) {
    const card = A.panel(main, source.title);
    card.id = 'academic-source-' + source.id;
    card.tabIndex = -1;
    card.append(A.node('p', D.reference(source)), A.node('p', source.notes), A.button('Editar fuente', () => edit(source)));
    card.append(A.button('Registrar cita textual', () => A.form('Cita de ' + source.title, [
      ['quote','Texto citado','textarea','',true], ['locator','Página o localizador','text']
    ], values => A.change((_, ctx) => {
      ctx.project.citations.push(D.createCitation({...values, sourceId: source.id}));
    }))));
    for (const citation of project.citations.filter(item => item.sourceId === source.id)) {
      card.append(A.node('blockquote', '«' + citation.quote + '» ' + citation.locator),
        A.button('Editar cita', () => A.form('Editar cita textual', [
          ['quote','Texto citado','textarea',citation.quote,true], ['locator','Página o localizador','text',citation.locator]
        ], values => A.change((_, ctx) => {
          const index = ctx.project.citations.findIndex(item => item.id === citation.id);
          ctx.project.citations[index] = D.createCitation({...citation, ...values});
        }))));
    }
    const label = A.node('label','Adjuntar al proyecto (PDF o TXT, hasta 250 KiB)');
    const file = A.node('input'); file.type = 'file'; file.accept = '.pdf,.txt';
    file.onchange = async () => {
      const selected = file.files[0];
      if (!selected) return;
      try {
        if (selected.size > 250 * 1024 || !/\.(pdf|txt)$/i.test(selected.name)) throw new Error('Elige un PDF o TXT de hasta 250 KiB.');
        const pdf = /\.pdf$/i.test(selected.name);
        if (pdf && await selected.slice(0,5).text() !== '%PDF-') throw new Error('El archivo no contiene una cabecera PDF.');
        const data = await readFileAsDataUrl(new Blob([selected], {type: pdf ? 'application/pdf' : 'text/plain'}));
        if (A.change(space => {
          const target = space.projects.find(p => p.id === project.id)?.sources.find(row => row.id === source.id);
          if (!target) throw new Error('Esta fuente ya no existe.');
          target.attachments.push({name: selected.name, data});
        }) && window.state.activeView === 'library') A.render();
      } catch (error) { showToast(error.message, 'error'); }
      file.value = '';
    };
    label.append(file); card.append(label);
    source.attachments.forEach((attachment, index) => {
      const link = A.node('a', attachment.name);
      link.href = attachment.data; link.download = attachment.name;
      const row = A.node('div', undefined, 'academic-actions');
      row.append(link, A.button('Quitar adjunto', () => {
        if (A.change((_, ctx) => ctx.project.sources.find(s => s.id === source.id).attachments.splice(index, 1))) A.render();
      }));
      card.append(row);
    });
  }
  const target = A.session().sourceTarget;
  if (target) document.getElementById('academic-source-' + target)?.focus();
  A.session().sourceTarget = null;
}
