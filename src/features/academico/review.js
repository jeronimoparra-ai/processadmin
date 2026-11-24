function academicFindings(project, doc) {
  const findings = [];
  const normalize = value => value.trim().toLocaleLowerCase();
  for (const requirement of doc.requirements) {
    const matches = doc.sections.filter(s => [s.title, s.sectionType].some(v => normalize(v) === normalize(requirement)));
    if (!matches.some(s => s.body.trim())) {
      findings.push({message: 'Falta contenido para el requisito «' + requirement + '».',
        view: matches.length ? 'studio' : 'planner', section: matches[0]?.id});
    }
  }
  if (!doc.sections.length) findings.push({message: 'El documento todavía no tiene secciones.', view: 'planner'});
  const sources = new Map(project.sources.map(s => [s.id, s]));
  const citations = new Map(project.citations.map(c => [c.id,c]));
  for (const section of doc.sections) {
    if (!section.body.trim()) findings.push({message: section.title + ' está vacía.', view: 'studio', section: section.id});
    for (const id of new Set(AcademicDomain.markers(section.body))) {
      const citation = citations.get(id);
      const source = sources.get(citation?.sourceId);
      const evidence = section.title + ' · ' + (citation?.quote || id);
      if (!source) findings.push({message: 'Cita sin fuente vinculada: ' + evidence, view: 'studio', section: section.id});
      else if (!citation.locator) findings.push({message: 'Falta el localizador de «' + citation.quote + '» en ' + section.title,
        view: 'library', source: source.id});
    }
  }
  const seen = new Set();
  for (const source of project.sources) {
    if (!source.author || !source.year) findings.push({message: 'Completa autoría y año de «' + source.title + '».',
      view: 'library', source: source.id});
    for (const code of [source.doi.toLowerCase(), source.isbn.replace(/[\s-]/g,'')].filter(Boolean)) {
      if (seen.has(code)) findings.push({message: 'Identificador duplicado en «' + source.title + '»: ' + code,
        view: 'library', source: source.id});
      seen.add(code);
    }
  }
  return findings;
}

function buildAcademicReview() {
  const A = Academic;
  const page = A.page('review', 3);
  if (!page) return;
  const {main, project, doc} = page;
  const findings = academicFindings(project, doc);
  const panel = A.panel(main, doc.title + ' · ' + findings.length + ' pendientes');
  if (!findings.length) panel.append(A.node('p', 'Se han comprobado las secciones, los requisitos y los vínculos bibliográficos.'));
  for (const issue of findings) {
    const row = A.node('div', undefined, 'academic-actions');
    row.append(A.node('p', issue.message), A.button('Revisar', () => {
      if (issue.section) A.choose({section: issue.section});
      A.session().sourceTarget = issue.source;
      navigate(issue.view);
    }));
    panel.append(row);
  }
  panel.append(A.button('Vista previa', () => navigate('publishing')));
}
