// ═══════════════════════════════════════════════════════════════════════
// CORE/CONSTANTS.JS - Constantes del dominio académico
// ═══════════════════════════════════════════════════════════════════════

export const WORK_TYPES = Object.freeze({
  ensayo: {
    id: 'ensayo',
    name: 'Ensayo académico',
    description: 'Texto argumentativo centrado en una tesis sustentada con fuentes.',
    defaultSections: [
      { key: 'introduccion', title: 'Introducción', targetWords: '150 - 250 palabras', purpose: 'Presentar el tema, la tesis central y la ruta del ensayo.' },
      { key: 'desarrollo', title: 'Desarrollo argumentativo', targetWords: '400 - 800 palabras', purpose: 'Argumentos principales sustentados con citas y evidencias.' },
      { key: 'conclusion', title: 'Conclusiones', targetWords: '120 - 200 palabras', purpose: 'Síntesis de hallazgos y cierre reflexivo de la tesis.' }
    ]
  },
  monografia: {
    id: 'monografia',
    name: 'Monografía',
    description: 'Estudio documental profundo y delimitado sobre un tema específico.',
    defaultSections: [
      { key: 'introduccion', title: 'Introducción', targetWords: '200 - 350 palabras', purpose: 'Contexto, justificación, delimitación del tema y objetivos.' },
      { key: 'marco_teorico', title: 'Marco teórico y conceptual', targetWords: '500 - 800 palabras', purpose: 'Revisión bibliográfica y conceptos clave de autores.' },
      { key: 'desarrollo', title: 'Desarrollo temático', targetWords: '600 - 1000 palabras', purpose: 'Análisis comparativo, discusión y cuerpo del estudio.' },
      { key: 'conclusion', title: 'Conclusiones', targetWords: '150 - 250 palabras', purpose: 'Aportes, conclusiones derivadas del análisis y límites.' }
    ]
  },
  informe: {
    id: 'informe',
    name: 'Informe técnico / académico',
    description: 'Presentación organizada de hechos, procedimientos y resultados.',
    defaultSections: [
      { key: 'objetivos', title: 'Objetivos del informe', targetWords: '50 - 100 palabras', purpose: 'Definir el propósito general y los alcances concretos.' },
      { key: 'metodologia', title: 'Metodología / Procedimiento', targetWords: '200 - 350 palabras', purpose: 'Descripción de instrumentos, pasos y métodos aplicados.' },
      { key: 'resultados', title: 'Resultados y datos', targetWords: '250 - 450 palabras', purpose: 'Presentación objetiva de datos observados o medidos.' },
      { key: 'discusion', title: 'Análisis y recomendaciones', targetWords: '200 - 400 palabras', purpose: 'Interpretación práctica y sugerencias de acción.' }
    ]
  },
  investigacion: {
    id: 'investigacion',
    name: 'Trabajo de investigación',
    description: 'Indagación sistemática con planteamiento, metodología y análisis.',
    defaultSections: [
      { key: 'introduccion', title: 'Introducción y problema', targetWords: '200 - 350 palabras', purpose: 'Planteamiento de la situación problema y justificación.' },
      { key: 'marco_teorico', title: 'Marco teórico', targetWords: '400 - 700 palabras', purpose: 'Antecedentes, bases teóricas y estado del arte.' },
      { key: 'metodologia', title: 'Metodología', targetWords: '250 - 400 palabras', purpose: 'Diseño metodológico, población/muestra e instrumentos.' },
      { key: 'resultados', title: 'Resultados', targetWords: '300 - 500 palabras', purpose: 'Exposición de hallazgos respaldados en datos.' },
      { key: 'discusion', title: 'Discusión y conclusiones', targetWords: '250 - 450 palabras', purpose: 'Contraste con la literatura, conclusiones y proyecciones.' }
    ]
  },
  anteproyecto: {
    id: 'anteproyecto',
    name: 'Anteproyecto de grado',
    description: 'Propuesta formal que justifica la viabilidad de una futura investigación.',
    defaultSections: [
      { key: 'tema_problema', title: 'Planteamiento del problema', targetWords: '200 - 350 palabras', purpose: 'Descripción del problema, pregunta guía y antecedentes.' },
      { key: 'justificacion', title: 'Justificación y viabilidad', targetWords: '150 - 250 palabras', purpose: 'Por qué es relevante, factible e innovador el proyecto.' },
      { key: 'objetivos', title: 'Objetivos (General y específicos)', targetWords: '80 - 150 palabras', purpose: 'Metas directas con verbos en infinitivo medibles.' },
      { key: 'metodologia_previa', title: 'Metodología propuesta', targetWords: '200 - 350 palabras', purpose: 'Ruta metodológica proyectada y cronograma base.' }
    ]
  }
});

export const APA_SOURCE_TYPES = Object.freeze({
  libro: {
    id: 'libro',
    label: 'Libro impreso o digital',
    fields: [
      { name: 'authors', label: 'Autor(es) (Apellido, Iniciales)', placeholder: 'Ej: Hernández Sampieri, R. & Mendoza, C.', required: true },
      { name: 'year', label: 'Año de publicación', placeholder: 'Ej: 2018', type: 'number', required: true },
      { name: 'title', label: 'Título del libro (en cursiva)', placeholder: 'Ej: Metodología de la investigación', required: true },
      { name: 'publisher', label: 'Editorial', placeholder: 'Ej: McGraw-Hill Interamericana', required: true },
      { name: 'doiOrUrl', label: 'DOI o URL (opcional)', placeholder: 'Ej: https://doi.org/... o URL' }
    ],
    format(data) {
      const auth = (data.authors || 'Autor desconocido').trim();
      const yr = (data.year || 's.f.').trim();
      const tit = (data.title || 'Sin título').trim();
      const pub = (data.publisher || '').trim();
      const doi = (data.doiOrUrl || '').trim();
      
      let ref = `${auth} (${yr}). <em>${tit}</em>.`;
      if (pub) ref += ` ${pub}.`;
      if (doi) ref += ` ${doi}`;
      return ref;
    }
  },
  articulo: {
    id: 'articulo',
    label: 'Artículo de revista científica',
    fields: [
      { name: 'authors', label: 'Autor(es)', placeholder: 'Ej: Parra, A. & Gómez, L.', required: true },
      { name: 'year', label: 'Año de publicación', placeholder: 'Ej: 2024', type: 'number', required: true },
      { name: 'title', label: 'Título del artículo', placeholder: 'Ej: Impacto de las normas APA en la divulgación académica', required: true },
      { name: 'journal', label: 'Nombre de la revista (en cursiva)', placeholder: 'Ej: Revista Iberoamericana de Educación', required: true },
      { name: 'volume', label: 'Volumen', placeholder: 'Ej: 14' },
      { name: 'issue', label: 'Número o fascículo', placeholder: 'Ej: 2' },
      { name: 'pages', label: 'Páginas', placeholder: 'Ej: 45-62' },
      { name: 'doiOrUrl', label: 'DOI o enlace web', placeholder: 'Ej: https://doi.org/10.1234/rie.2024.01' }
    ],
    format(data) {
      const auth = (data.authors || 'Autor desconocido').trim();
      const yr = (data.year || 's.f.').trim();
      const tit = (data.title || 'Sin título').trim();
      const jnl = (data.journal || 'Revista no especificada').trim();
      const vol = (data.volume || '').trim();
      const iss = (data.issue || '').trim();
      const pgs = (data.pages || '').trim();
      const doi = (data.doiOrUrl || '').trim();

      let ref = `${auth} (${yr}). ${tit}. <em>${jnl}</em>`;
      if (vol) ref += `, <em>${vol}</em>`;
      if (iss) ref += `(${iss})`;
      if (pgs) ref += `, ${pgs}`;
      ref += '.';
      if (doi) ref += ` ${doi}`;
      return ref;
    }
  },
  capitulo: {
    id: 'capitulo',
    label: 'Capítulo de libro editado',
    fields: [
      { name: 'authors', label: 'Autor(es) del capítulo', placeholder: 'Ej: González, M.', required: true },
      { name: 'year', label: 'Año', placeholder: 'Ej: 2021', type: 'number', required: true },
      { name: 'chapterTitle', label: 'Título del capítulo', placeholder: 'Ej: Epistemología de la investigación social', required: true },
      { name: 'editors', label: 'Editor(es) o compilador(es)', placeholder: 'Ej: J. Pérez & E. Soto (Eds.)' },
      { name: 'bookTitle', label: 'Título del libro (en cursiva)', placeholder: 'Ej: Fundamentos de ciencias sociales', required: true },
      { name: 'pages', label: 'Páginas del capítulo (pp.)', placeholder: 'Ej: 112-140' },
      { name: 'publisher', label: 'Editorial', placeholder: 'Ej: Alianza Editorial' },
      { name: 'doiOrUrl', label: 'DOI o URL' }
    ],
    format(data) {
      const auth = (data.authors || 'Autor desconocido').trim();
      const yr = (data.year || 's.f.').trim();
      const cTit = (data.chapterTitle || 'Sin título de capítulo').trim();
      const eds = (data.editors || '').trim();
      const bTit = (data.bookTitle || 'Sin título de libro').trim();
      const pgs = (data.pages || '').trim();
      const pub = (data.publisher || '').trim();
      const doi = (data.doiOrUrl || '').trim();

      let ref = `${auth} (${yr}). ${cTit}. `;
      if (eds) ref += `En ${eds}, `;
      ref += `<em>${bTit}</em>`;
      if (pgs) ref += ` (pp. ${pgs})`;
      ref += '.';
      if (pub) ref += ` ${pub}.`;
      if (doi) ref += ` ${doi}`;
      return ref;
    }
  },
  web: {
    id: 'web',
    label: 'Página o sitio web',
    fields: [
      { name: 'authors', label: 'Autor o Institución responsable', placeholder: 'Ej: Organización Mundial de la Salud', required: true },
      { name: 'year', label: 'Año o fecha específica', placeholder: 'Ej: 2023 o 2023, 14 de mayo', required: true },
      { name: 'title', label: 'Título de la página o artículo web (en cursiva)', placeholder: 'Ej: Directrices sobre salud mental', required: true },
      { name: 'siteName', label: 'Nombre del sitio web', placeholder: 'Ej: OMS' },
      { name: 'doiOrUrl', label: 'URL directa', placeholder: 'Ej: https://www.who.int/...', required: true }
    ],
    format(data) {
      const auth = (data.authors || 'Autor o Entidad').trim();
      const yr = (data.year || 's.f.').trim();
      const tit = (data.title || 'Sin título').trim();
      const site = (data.siteName || '').trim();
      const url = (data.doiOrUrl || '').trim();

      let ref = `${auth} (${yr}). <em>${tit}</em>.`;
      if (site && site.toLowerCase() !== auth.toLowerCase()) ref += ` ${site}.`;
      if (url) ref += ` ${url}`;
      return ref;
    }
  },
  tesis: {
    id: 'tesis',
    label: 'Tesis o trabajo de grado',
    fields: [
      { name: 'authors', label: 'Autor(es)', placeholder: 'Ej: Ramírez, D.', required: true },
      { name: 'year', label: 'Año', placeholder: 'Ej: 2022', type: 'number', required: true },
      { name: 'title', label: 'Título de la tesis (en cursiva)', placeholder: 'Ej: Modelo predictivo para deserción escolar', required: true },
      { name: 'degree', label: 'Grado académico y tipo', placeholder: 'Ej: Tesis de maestría, Universidad de Antioquia' },
      { name: 'repository', label: 'Repositorio institucional', placeholder: 'Ej: Repositorio Digital UdeA' },
      { name: 'doiOrUrl', label: 'Enlace web o URI' }
    ],
    format(data) {
      const auth = (data.authors || 'Autor').trim();
      const yr = (data.year || 's.f.').trim();
      const tit = (data.title || 'Sin título').trim();
      const deg = (data.degree || 'Tesis de grado').trim();
      const rep = (data.repository || '').trim();
      const url = (data.doiOrUrl || '').trim();

      let ref = `${auth} (${yr}). <em>${tit}</em> [${deg}].`;
      if (rep) ref += ` ${rep}.`;
      if (url) ref += ` ${url}`;
      return ref;
    }
  }
});

export const ACADEMIC_CONNECTORS = Object.freeze({
  introduccion: ['En primer lugar,', 'Para comenzar,', 'En el contexto actual,', 'Con el propósito de', 'Conviene destacar que'],
  argumentacion: ['Asimismo,', 'Por un lado,', 'De acuerdo con la evidencia,', 'En consonancia con lo anterior,', 'Es relevante notar que'],
  contraste: ['Sin embargo,', 'No obstante,', 'Por el contrario,', 'A pesar de lo expuesto,', 'En contraposición a esto,'],
  causa_efecto: ['Por consiguiente,', 'En consecuencia,', 'Debido a esto,', 'Como resultado,', 'Por esta razón,'],
  cierre: ['En conclusión,', 'En definitiva,', 'A modo de cierre,', 'En síntesis,', 'Finalmente,']
});

export const DEFAULT_CHECKLIST_CRITERIA = Object.freeze([
  { id: 'chk_title', label: 'Título claro y representativo del trabajo', category: 'estructura', check(work) { return !!(work.title && work.title.trim().length >= 6); } },
  { id: 'chk_authors', label: 'Datos del autor, institución y curso completos', category: 'estructura', check(work) { return !!(work.metadata?.author && work.metadata?.institution && work.metadata?.course); } },
  { id: 'chk_plan', label: 'Planificación base definida (tema y objetivos)', category: 'plan', check(work) { return !!(work.plan?.topic && (work.plan?.generalObjective || work.plan?.problem)); } },
  { id: 'chk_content_length', label: 'Cuerpo del documento con redacción suficiente (mín. 150 palabras)', category: 'redaccion', check(work) {
    const text = (work.sections || []).map(s => s.content || '').join(' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return words >= 150;
  } },
  { id: 'chk_sections_not_empty', label: 'Todas las secciones definidas tienen contenido', category: 'redaccion', check(work) {
    if (!work.sections || work.sections.length === 0) return false;
    return work.sections.every(s => (s.content || '').trim().length > 30);
  } },
  { id: 'chk_apa_references', label: 'Al menos una referencia APA 7 registrada con datos completos', category: 'apa', check(work) {
    return Array.isArray(work.citations) && work.citations.length >= 1;
  } },
  { id: 'chk_in_text_citations', label: 'Presencia de citas entre paréntesis en el texto (Autor, Año)', category: 'apa', check(work) {
    const fullText = (work.sections || []).map(s => s.content || '').join(' ');
    return /\([A-ZÁÉÍÓÚÑa-záéíóúñ\s&.,]+,\s*\d{4}[^)]*\)/.test(fullText);
  } },
  { id: 'chk_word_format', label: 'Configuración de entrega y formato APA 7 listo para exportar', category: 'entrega', check(work) {
    return !!(work.metadata?.date);
  } }
]);
