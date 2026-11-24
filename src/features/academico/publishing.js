function academicPublication(project, course, doc) {
  const citations = new Map(project.citations.map(c => [c.id, c]));
  const sources = new Map(project.sources.map(s => [s.id, s]));
  const blocks = [{kind:'title', text:doc.title}, {kind:'paragraph', text:project.title + ' · ' + course.title}];
  function resolve(text) {
    return text.replace(/\[\[cita:([\w-]+)\]\]/g, (_, id) => {
      const c = citations.get(id), source = sources.get(c?.sourceId);
      return source ? '«' + c.quote + '» (' + [source.author || source.title, source.year, c.locator].filter(Boolean).join(', ') + ')' :
        '[Cita pendiente: ' + id + ']';
    });
  }
  for (const section of doc.sections) {
    blocks.push({kind:'heading', text:section.title});
    let table;
    for (const line of section.body.split(/\r?\n/)) {
      if (/^\s*\|.*\|\s*$/.test(line)) {
        const cells = line.trim().slice(1,-1).split('|').map(v => resolve(v.trim()));
        if (cells.every(v => /^:?-{3,}:?$/.test(v))) continue;
        if (!table) { table = {kind:'table', rows:[]}; blocks.push(table); }
        table.rows.push(cells);
      } else {
        table = null;
        const heading = /^#{1,6}\s+/.exec(line);
        const bullet = /^\s*[-*]\s+/.exec(line);
        const prefix = heading || bullet;
        blocks.push({kind: heading ? 'subheading' : bullet ? 'bullet' : 'paragraph',
          text:resolve(prefix ? line.slice(prefix[0].length) : line)});
      }
    }
  }
  if (project.sources.length) blocks.push({kind:'heading', text:'Referencias'});
  for (const source of project.sources) blocks.push({kind:'paragraph', text:AcademicDomain.reference(source)});
  return {projectId: project.id, courseId: course.id, documentId: doc.id, title: doc.title, blocks};
}

function academicDocx(snapshot) {
  const { Document, HeadingLevel, Paragraph, Table, TableRow, TableCell, Packer } = docx;
  const headings = {title: HeadingLevel.TITLE, heading: HeadingLevel.HEADING_1, subheading: HeadingLevel.HEADING_2};
  const children = snapshot.blocks.map(block => {
    if (block.kind === 'table') return new Table({rows: block.rows.map(row => new TableRow({
      children: row.map(value => new TableCell({children:[new Paragraph(value)]}))
    }))});
    return new Paragraph({text: block.text, heading: headings[block.kind],
      bullet: block.kind === 'bullet' ? {level:0} : undefined});
  });
  return Packer.toBlob(new Document({title:snapshot.title, sections:[{children}]}));
}

function buildAcademicPublishing() {
  const A = Academic, page = A.page('publishing', 3);
  if (!page) return;
  const {main, project, course, doc} = page;
  const snapshot = academicPublication(project, course, doc);
  const preview = A.panel(main, 'Vista previa');
  for (const block of snapshot.blocks) {
    if (block.kind === 'table') {
      const table = A.node('table');
      for (const cells of block.rows) {
        const row = table.insertRow();
        for (const value of cells) row.insertCell().textContent = value;
      }
      preview.append(table);
    } else {
      const tags = {title:'h2', heading:'h3', subheading:'h4', paragraph:'p', bullet:'p'};
      preview.append(A.node(tags[block.kind], (block.kind === 'bullet' ? '• ' : '') + block.text));
    }
  }
  const download = A.button('Descargar DOCX', async () => {
    download.disabled = true;
    try {
      if (typeof docx === 'undefined') throw new Error('La biblioteca DOCX no está disponible. Recarga la página para volver a intentarlo.');
      const blob = await academicDocx(snapshot);
      const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2,'0')).join('');
      const at = new Date().toISOString();
      if (!A.change(space => {
        const original = space.projects.find(p => p.id === snapshot.projectId)?.courses.find(c => c.id === snapshot.courseId)
          ?.documents.find(d => d.id === snapshot.documentId);
        if (!original) throw new Error('El documento ya no existe.');
        original.exports.push({at, hash, title:snapshot.title});
      })) return;
      const url = URL.createObjectURL(blob);
      const link = A.node('a'); link.href = url; link.download = snapshot.title + '.docx';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (window.state.activeView === 'publishing') A.render();
    } catch (error) { showToast(error.message, 'error'); }
    finally { download.disabled = false; }
  });
  main.append(download);
  const history = A.panel(main, 'Registro de exportaciones');
  if (!doc.exports.length) history.append(A.node('p', 'Las descargas de este documento aparecerán aquí.'));
  for (const item of doc.exports.slice().reverse()) {
    history.append(A.node('p', item.title + ' · ' + new Date(item.at).toLocaleString()), A.node('code','SHA-256 ' + item.hash));
  }
}
