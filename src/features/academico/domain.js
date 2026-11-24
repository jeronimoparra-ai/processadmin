// Factories share a namespace with the legacy app's global createProject.
const AcademicDomain = (() => {
  const states = Object.freeze(['Pendiente', 'En curso', 'Completado']);
  const sectionTypes = Object.freeze(['Introducción', 'Desarrollo', 'Metodología', 'Resultados', 'Conclusiones', 'Anexo']);
  const sourceTypes = Object.freeze(['journal', 'book', 'article', 'booklet', 'website', 'thesis', 'other']);

  function check(condition, message) {
    if (!condition) throw new Error(message);
  }
  function string(value, label, required = false) {
    check(typeof value === 'string' && (!required || value.trim()), 'Campo inválido: ' + label);
    return value;
  }
  function id(value = crypto.randomUUID()) {
    check(typeof value === 'string' && /^[\w-]{1,100}$/.test(value), 'Identificador inválido');
    return value;
  }
  function choice(value, choices) {
    check(choices.includes(value), 'Valor no permitido: ' + value);
    return value;
  }
  function list(value, parse) {
    check(Array.isArray(value), 'Colección inválida');
    return value.map(parse);
  }
  function entities(value, parse) {
    const rows = list(value, row => {
      check(row && typeof row.id === 'string', 'Falta un identificador');
      return parse(row);
    });
    check(new Set(rows.map(row => row.id)).size === rows.length, 'Identificador duplicado');
    return rows;
  }
  function named(row) {
    return { id: id(row.id), title: string(row.title, 'nombre', true).trim(),
      status: choice(row.status ?? states[0], states) };
  }
  function createSection(sectionType, row = {}) {
    return { ...named(row), sectionType: choice(sectionType, sectionTypes),
      body: string(row.body ?? '', 'contenido'),
      history: list(row.history ?? [], version => ({
        at: string(version.at, 'fecha', true), body: string(version.body, 'versión')
      })) };
  }
  function createDocument(row) {
    return { ...named(row), requirements: list(row.requirements ?? [], item => string(item, 'requisito', true)),
      sections: entities(row.sections ?? [], item => createSection(item.sectionType, item)),
      exports: list(row.exports ?? [], item => {
        check(/^[a-f0-9]{64}$/.test(item.hash), 'Huella de exportación inválida');
        return { at: string(item.at, 'fecha', true), hash: item.hash, title: string(item.title, 'título', true) };
      }) };
  }
  function createCourse(row) {
    return { ...named(row), documents: entities(row.documents ?? [], createDocument) };
  }
  function createCitation(row) {
    check(typeof row.sourceId === 'string', 'Falta la fuente de la cita');
    return { id: id(row.id), sourceId: id(row.sourceId), quote: string(row.quote, 'cita', true).trim(),
      locator: string(row.locator ?? '', 'localizador') };
  }
  function createSource(type, row) {
    const source = { id: id(row.id), title: string(row.title, 'título', true).trim(), type: choice(type, sourceTypes) };
    for (const key of ['author', 'year', 'publisher', 'doi', 'isbn', 'notes']) source[key] = string(row[key] ?? '', key).trim();
    check(!source.year || /^\d{4}$/.test(source.year), 'El año debe tener cuatro dígitos');
    check(!source.doi || /^10\.\d{4,9}\/\S+$/i.test(source.doi), 'DOI inválido');
    const isbn = source.isbn.replace(/[\s-]/g, '');
    check(!isbn || /^(?:\d{9}[\dX]|\d{13})$/i.test(isbn), 'ISBN inválido');
    source.attachments = list(row.attachments ?? [], file => {
      check(typeof file.data === 'string' && file.data.length <= 350000 &&
        /^data:(application\/pdf|text\/plain);base64,[A-Za-z0-9+/]*={0,2}$/.test(file.data), 'Adjunto inválido');
      return { name: string(file.name, 'archivo', true), data: file.data };
    });
    return source;
  }
  function createProject(row) {
    return { ...named(row), instructions: string(row.instructions ?? '', 'instrucciones'),
      objective: string(row.objective ?? '', 'objetivo'), due: string(row.due ?? '', 'entrega'),
      courses: entities(row.courses ?? [], createCourse),
      sources: entities(row.sources ?? [], item => createSource(item.type, item)),
      citations: entities(row.citations ?? [], createCitation) };
  }
  function workspace(row = {version: 1, projects: []}) {
    check(row?.version === 1, 'Versión de espacio académico incompatible');
    return { version: 1, projects: entities(row.projects, createProject) };
  }
  function context(space, selection = {}) {
    const pick = (rows = [], key) => rows.find(row => row.id === selection[key]) || rows[0];
    const project = pick(space.projects, 'project');
    const course = pick(project?.courses, 'course');
    const doc = pick(course?.documents, 'doc');
    return {project, course, doc, section: pick(doc?.sections, 'section')};
  }
  function markers(body) {
    return [...body.matchAll(/\[\[cita:([\w-]+)\]\]/g)].map(match => match[1]);
  }
  function reference(source) {
    return [source.author, source.year, source.title, source.publisher, source.doi, source.isbn].filter(Boolean).join('. ');
  }
  return Object.freeze({ states, sectionTypes, sourceTypes, createProject, createCourse, createDocument,
    createSection, createSource, createCitation, workspace, context, markers, reference });
})();
