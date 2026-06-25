// ═══════════════════════════════════════════════════════════════════════
// EXPORTADOR.JS - Exportación a Formato DOCX (APA 7)
// ═══════════════════════════════════════════════════════════════════════

function leerStorage(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return localStorage.getItem(key) || null;
  }
}

function stripInlineHtml(value) {
  return String(value || '').replace(/<\/?em>/g, '').replace(/<[^>]+>/g, '').trim();
}

function flattenStoredText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(flattenStoredText).filter(Boolean).join('\n\n');
  }
  if (typeof value === 'object') {
    const preferredKeys = ['content', 'contenido', 'text', 'texto', 'body', 'secciones', 'sections', 'values', 'outline'];
    const preferredText = preferredKeys
      .filter(key => value[key] !== undefined)
      .map(key => flattenStoredText(value[key]))
      .filter(Boolean)
      .join('\n\n');
    if (preferredText) return preferredText;
    return Object.values(value).map(flattenStoredText).filter(Boolean).join('\n\n');
  }
  return String(value);
}

function normalizeRedactorContent(value) {
  return flattenStoredText(value).trim();
}

function normalizeStructureParts(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) && Array.isArray(value.parts)
    ? value.parts
    : value;

  if (!Array.isArray(source)) return [];

  return source
    .map((part, index) => {
      if (typeof part === 'string') {
        return { id: `structure-${index + 1}`, text: part.trim(), checked: false };
      }
      if (part && typeof part === 'object') {
        return {
          id: part.id || `structure-${index + 1}`,
          text: String(part.text || part.label || part.nombre || part.title || '').trim(),
          checked: !!part.checked
        };
      }
      return null;
    })
    .filter(part => part && part.text);
}

function normalizeCitation(value) {
  if (typeof value === 'string') return stripInlineHtml(value);
  if (value && typeof value === 'object') {
    return stripInlineHtml(value.formatted || value.texto || value.referencia || value.citation || value.text || value.value || '');
  }
  return '';
}

function getStoredStudentData() {
  const studentData = leerStorage('export_student_data') || {};
  return studentData && typeof studentData === 'object' && !Array.isArray(studentData) ? studentData : {};
}

function getStoredDocumentStructure(snapshot = {}) {
  if (Array.isArray(snapshot.documentStructureParts)) return normalizeStructureParts(snapshot.documentStructureParts);

  const storedParts = normalizeStructureParts(leerStorage('ws_document_structure_parts'));
  if (storedParts.length > 0) return storedParts;

  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  return Array.isArray(exportFormatProfile?.structureParts)
    ? normalizeStructureParts(exportFormatProfile.structureParts)
    : [];
}

function buildExportSnapshot() {
  const redactorData = leerStorage('redactor_content');

  return {
    studentData: getStoredStudentData(),
    redactorContent: normalizeRedactorContent(redactorData ?? safeStorageGet('redactor_content', '')),
    organizerOutline: loadJSON('organizer_outline', {}),
    generatedCitations: getExportReferences(),
    documentStructureParts: getStoredDocumentStructure(),
    checklistDeadline: leerStorage('checklist_deadline') || getDeliveryDateValue(),
    exportFormatProfile: state.exportFormatProfile
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToArrayBuffer(dataUrl) {
  const base64 = String(dataUrl || '').split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function escapeRegExp(text) {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildWordParagraph(text, options = {}) {
  const align = options.align || 'left';
  const bold = options.bold ? '<w:b/>' : '';
  const size = options.size || 24;
  const style = options.style ? `<w:pStyle w:val="${options.style}"/>` : '';
  const spacing = options.double ? '<w:spacing w:line="480" w:lineRule="auto"/>' : '';
  const firstLine = options.firstLine ? '<w:ind w:firstLine="720"/>' : '';
  const hanging = options.hanging ? '<w:ind w:left="720" w:hanging="720"/>' : '';
  const italic = options.italic ? '<w:i/>' : '';
  const indent = firstLine || hanging;
  return `<w:p><w:pPr><w:jc w:val="${align}"/>${style}${spacing}${indent}</w:pPr><w:r><w:rPr>${bold}${italic}<w:sz w:val="${size}"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}

function replaceXmlText(xml, token, value) {
  return xml.split(`{{${token}}}`).join(xmlEscape(value));
}

function replaceXmlParagraph(xml, token, replacementXml) {
  const tokenRegex = escapeRegExp(`{{${token}}}`);
  const paragraphRegex = new RegExp(`<w:p\\b[^>]*>[\\s\\S]*?${tokenRegex}[\\s\\S]*?<\\/w:p>`, 'g');
  return xml.replace(paragraphRegex, replacementXml);
}

function getWordTemplateDataUrl(profile) {
  if (!profile || typeof profile !== 'object') return '';
  if (typeof profile.templateDataUrl === 'string' && profile.templateDataUrl.trim()) return profile.templateDataUrl.trim();
  if (typeof profile.templateBase64 === 'string' && profile.templateBase64.trim()) {
    return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${profile.templateBase64.trim()}`;
  }
  return '';
}

function readFirstStoredValue(...keys) {
  for (const key of keys) {
    const value = safeStorageGet(key, '');
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function parseStoredReferences(rawValue) {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return String(item.texto || item.referencia || item.text || item.value || JSON.stringify(item)).trim();
          }
          return '';
        })
        .filter(Boolean);
    }
  } catch (error) {}

  return String(rawValue)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function getExportReferences(snapshot = {}) {
  if (Array.isArray(snapshot.generatedCitations) && snapshot.generatedCitations.length > 0) {
    return snapshot.generatedCitations.map(normalizeCitation).filter(Boolean);
  }

  const fromState = Array.isArray(state.generatedCitations) ? state.generatedCitations : [];
  if (fromState.length > 0) {
    return fromState.map(normalizeCitation).filter(Boolean);
  }

  const citations = leerStorage('apa_generated_citations') || [];
  if (Array.isArray(citations)) {
    return citations.map(normalizeCitation).filter(Boolean);
  }

  return parseStoredReferences(citations).map(normalizeCitation).filter(Boolean);
}

function formatApaDate(value) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  return safeDate.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function buildToCFieldParagraph() {
  return `
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">Tabla de contenido</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText xml:space="preserve"> TOC \\o &quot;1-2&quot; \\h \\z \\u </w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t xml:space="preserve">Actualice la tabla de contenido en Word.</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  `;
}

function buildSettingsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:updateFields w:val="true"/>
</w:settings>`;
}

async function buildGeneratedDocxPackage(data, snapshot = {}) {
  const references = getExportReferences(snapshot);
  const outline = snapshot.organizerOutline || loadJSON('organizer_outline', {});
  const outlineValues = outline.values || outline;
  const redactorContent = normalizeRedactorContent(snapshot.redactorContent ?? leerStorage('redactor_content') ?? safeStorageGet('redactor_content', ''));
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  const structureParts = getStoredDocumentStructure({ ...snapshot, exportFormatProfile });
  const formatSections = structureParts.map(part => part.text).filter(Boolean);
  const title = data.titulo || data.curso || 'Trabajo académico';
  const formattedDate = formatApaDate(data.fecha || snapshot.checklistDeadline || getDeliveryDateValue() || new Date().toISOString());
  const outlineText = normalizeRedactorContent(Object.values(outlineValues).flat());
  const bodyText = redactorContent || outlineText || 'Contenido pendiente.';
  const {
    AlignmentType,
    Document,
    HeadingLevel,
    Packer,
    PageBreak,
    Paragraph,
    TextRun
  } = docx;

  const paragraph = (text, options = {}) => new Paragraph({
    heading: options.heading,
    alignment: options.align === 'center'
      ? AlignmentType.CENTER
      : options.align === 'right'
        ? AlignmentType.RIGHT
        : AlignmentType.LEFT,
    spacing: {
      line: options.double === false ? 240 : 480,
      before: options.before || 0,
      after: options.after ?? 160
    },
    indent: options.hanging
      ? { left: 720, hanging: 720 }
      : options.firstLine
        ? { firstLine: 720 }
        : undefined,
    children: [
      new TextRun({
        text: stripInlineHtml(text),
        bold: !!options.bold,
        italics: !!options.italic,
        size: options.size || 24,
        font: 'Times New Roman'
      })
    ]
  });

  const pageBreak = () => new Paragraph({ children: [new PageBreak()] });
  const children = [
    paragraph(data.institucion || 'Institución', { align: 'center', double: false }),
    paragraph(data.curso || 'Nombre del curso', { align: 'center' }),
    ...(data.modalidad ? [paragraph(`Modalidad: ${data.modalidad}`, { align: 'center', size: 20 })] : []),
    paragraph(data.docente || 'Nombre del docente', { align: 'center' }),
    paragraph(title, { align: 'center', bold: true, before: 720 }),
    paragraph(data.nombre || 'Nombre completo', { align: 'center', bold: true, before: 720 }),
    paragraph(data.codigo || 'Código estudiantil', { align: 'center' }),
    paragraph(data.ciudad || 'Ciudad', { align: 'center' }),
    paragraph(formattedDate, { align: 'center' }),
    pageBreak(),
    paragraph('Tabla de contenido', { heading: HeadingLevel.HEADING_1, bold: true, align: 'center', size: 28 }),
    ...(formatSections.length > 0
      ? formatSections.map((section, index) => paragraph(`${index + 1}. ${section}`, { double: false }))
      : [paragraph('Actualice la tabla de contenido en Word.', { italic: true, double: false })]),
    pageBreak(),
    paragraph(title, { heading: HeadingLevel.HEADING_1, align: 'center', bold: true, size: 28 })
  ];

  bodyText.split(/\n\s*\n+/).forEach(textBlock => {
    const cleanBlock = stripInlineHtml(textBlock);
    if (cleanBlock) children.push(paragraph(cleanBlock, { firstLine: true }));
  });

  children.push(
    pageBreak(),
    paragraph('Referencias', { heading: HeadingLevel.HEADING_1, bold: true, size: 28, align: 'center' })
  );

  if (references.length === 0) {
    children.push(paragraph('No se han generado referencias aún.', { italic: true }));
  } else {
    references.forEach(reference => children.push(paragraph(reference, { hanging: true })));
  }

  const doc = new Document({
    creator: 'ProcessAdmin',
    title,
    description: 'Documento académico APA 7 generado localmente en ProcessAdmin',
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
          paragraph: { spacing: { line: 480 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  });

  return Packer.toBlob(doc);
}

async function buildTemplateDocxPackage(data, snapshot = {}) {
  const references = getExportReferences(snapshot);
  const outline = snapshot.organizerOutline || loadJSON('organizer_outline', {});
  const outlineValues = outline.values || outline;
  const redactorContent = normalizeRedactorContent(snapshot.redactorContent ?? leerStorage('redactor_content') ?? safeStorageGet('redactor_content', ''));
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  const formatSections = getStoredDocumentStructure({ ...snapshot, exportFormatProfile }).map(part => part.text).filter(Boolean);
  const title = data.titulo || data.curso || exportFormatProfile?.title || 'Trabajo académico';
  const bodyText = redactorContent || formatSections.join('\n\n') || normalizeRedactorContent(Object.values(outlineValues).flat()) || 'Contenido pendiente.';
  const dataUrl = getWordTemplateDataUrl(exportFormatProfile);

  if (!dataUrl || typeof JSZip === 'undefined') {
    return buildGeneratedDocxPackage(data, snapshot);
  }

  const zip = await JSZip.loadAsync(dataUrlToArrayBuffer(dataUrl));
  const textFiles = Object.values(zip.files).filter(file => /\.(xml|rels)$/i.test(file.name) && !file.dir);
  let replacedAnyToken = false;

  const metadataReplacements = {
    institucion: data.institucion || 'Institución',
    curso: data.curso || 'Nombre del curso',
    modalidad: data.modalidad || '',
    docente: data.docente || 'Nombre del docente',
    titulo: title,
    nombre: data.nombre || 'Nombre completo',
    codigo: data.codigo || 'Código estudiantil',
    ciudad: data.ciudad || 'Ciudad',
    fecha: formatApaDate(data.fecha || getDeliveryDateValue() || new Date().toISOString())
  };

  const tocXml = buildToCFieldParagraph();
  const bodyXml = bodyText.split(/\n\s*\n+/).filter(Boolean).map(paragraph => buildWordParagraph(paragraph, { size: 24, double: true })).join('\n');
  const referencesXml = (references.length > 0 ? references : ['Sin referencias registradas.']).map(reference => buildWordParagraph(reference, { size: 24, hanging: true })).join('\n');

  await Promise.all(textFiles.map(async file => {
    let content = await file.async('string');
    const originalContent = content;
    Object.entries(metadataReplacements).forEach(([key, value]) => {
      content = replaceXmlText(content, key, value);
    });
    content = replaceXmlParagraph(content, 'toc', tocXml);
    content = replaceXmlParagraph(content, 'tabla_de_contenido', tocXml);
    content = replaceXmlParagraph(content, 'contenido', bodyXml);
    content = replaceXmlParagraph(content, 'cuerpo', bodyXml);
    content = replaceXmlParagraph(content, 'referencias', referencesXml);
    if (content !== originalContent) replacedAnyToken = true;
    zip.file(file.name, content);
  }));

  if (!replacedAnyToken) {
    return buildGeneratedDocxPackage(data, snapshot);
  }

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

async function buildExportDocxPackage(data, snapshot = {}) {
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  if (getWordTemplateDataUrl(exportFormatProfile)) {
    return buildTemplateDocxPackage(data, snapshot);
  }
  return buildGeneratedDocxPackage(data, snapshot);
}

async function downloadExportDocx(data, snapshot = {}, fileName = null) {
  if (typeof docx === 'undefined' || !docx.Packer || typeof docx.Packer.toBlob !== 'function') {
    alert('Error: la librería de exportación no está cargada. Verifica tu conexión a internet y recarga la página.');
    return false;
  }

  const blob = await buildExportDocxPackage(data, snapshot);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const nombreArchivo = (fileName || `${(data.nombre || 'documento').replace(/\s+/g, '_')}_APA7`).replace(/\.docx$/i, '');

  a.href = url;
  a.download = `${nombreArchivo}.docx`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  return true;
}

function buildExportador() {
  const formatProfile = state.exportFormatProfile;
  const formatLabel = formatProfile?.name || 'Ningún formato cargado';
  const formatDetail = formatProfile?.description || 'Puedes cargar una plantilla Word o un JSON opcional para reutilizar datos y estructura.';
  const html = `
    <div class="dp-stagger" style="display:flex;flex-direction:column;gap:20px;max-width:1000px">
      <h2 class="mb-2 flex items-center gap-3 text-3xl font-bold">${docproIconHtml('exportWord', 'Exportación a Word', 'docpro-icon docpro-icon--lg')}<span>Exportación a Word (Formato APA 7)</span></h2>
      <p class="mb-8 text-[var(--dp-text-secondary)]">Completa tus datos, revisa la validación y genera tu archivo local sin perder el formato.</p>

      <div class="dp-card mb-8 flex flex-col gap-4 border-dashed lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-bold text-[var(--dp-text-primary)]">Formato de trabajo</p>
          <p class="text-sm text-[var(--dp-text-secondary)]">${escapeHtml(formatLabel)} · ${escapeHtml(formatDetail)}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button id="load-format-btn" class="dp-btn dp-btn-primary text-sm">Cargar plantilla Word</button>
          <button id="clear-format-btn" class="dp-btn dp-btn-ghost text-sm">Eliminar formato cargado</button>
        </div>
      </div>

      <input id="load-format-input" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/json,.json" class="hidden">

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <div class="dp-card space-y-5 p-8">
            <div>
              <label class="dp-label mb-2 block">Nombre completo *</label>
              <input id="export-nombre" type="text" aria-label="Nombre completo" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Código estudiantil</label>
              <input id="export-codigo" type="text" aria-label="Código estudiantil" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Nombre del curso</label>
              <input id="export-curso" type="text" aria-label="Nombre del curso" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Modalidad</label>
              <select id="export-modalidad" aria-label="Modalidad del trabajo" class="dp-select">
                <option value="">Seleccionar modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>
            <div>
              <label class="dp-label mb-2 block">Nombre del docente</label>
              <input id="export-docente" type="text" aria-label="Nombre del docente" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Institución</label>
              <input id="export-institucion" type="text" aria-label="Institución" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Ciudad</label>
              <input id="export-ciudad" type="text" aria-label="Ciudad" class="dp-input">
            </div>
            <div>
              <label class="dp-label mb-2 block">Fecha de entrega</label>
              <input id="export-fecha" type="date" aria-label="Fecha de entrega" class="dp-input">
              <p id="export-fecha-help" class="mt-2 text-xs text-[var(--dp-text-muted)]">Opcional: agrega la fecha si quieres incluirla en la exportación.</p>
            </div>

            <div class="flex flex-col gap-3 pt-2 sm:flex-row">
              <button id="generate-docx-btn" class="dp-btn dp-btn-primary flex-1">Generar documento Word</button>
              <button id="export-anyway-btn" class="dp-btn dp-btn-ghost flex-1">Exportar igualmente</button>
            </div>
          </div>

          <div class="dp-card p-6">
            <h3 class="mb-3 flex items-center gap-2 font-bold">${docproIconHtml('review', 'Vista previa del documento', 'docpro-icon docpro-icon--sm')}<span>Vista previa del documento</span></h3>
            <div id="document-preview" class="max-h-[42rem] overflow-y-auto rounded-lg border border-[var(--dp-border)] bg-[var(--dp-surface-2)] p-6"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="dp-card p-6">
            <h3 class="mb-4 flex items-center gap-2 font-bold">${docproIconHtml('validation', 'Validación pre-exportación', 'docpro-icon docpro-icon--sm')}<span>Validación pre-exportación</span></h3>
            <div id="validation-checklist" class="space-y-2 text-sm"></div>
            <div id="export-summary" class="mt-4 space-y-3 text-xs"></div>
            <div class="mt-4 space-y-2">
              <button id="fix-issues-btn" class="dp-btn dp-btn-accent w-full text-sm">Ir a revisar pendientes</button>
              <button id="history-shortcut-btn" class="dp-btn dp-btn-ghost w-full text-sm">Ver historial de documentos</button>
            </div>
          </div>

          <div class="dp-card p-6">
            <h3 class="mb-3 flex items-center gap-2 font-bold">${docproIconHtml('review', 'Pendientes directos', 'docpro-icon docpro-icon--sm')}<span>Pendientes directos</span></h3>
            <div id="export-pending-list" class="space-y-2 text-xs"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('main-workspace').innerHTML = html;
  stopCountdown();

  const fields = ['nombre', 'codigo', 'curso', 'modalidad', 'docente', 'institucion', 'ciudad', 'fecha'];
  const savedData = loadJSON('export_student_data', {});
  const storedDeliveryDate = getDeliveryDateValue();
  const savedFormatProfile = state.exportFormatProfile;

  if (savedFormatProfile && savedFormatProfile.kind === 'legacy-json') {
    savedData.curso = savedData.curso || savedFormatProfile.curso;
    savedData.modalidad = savedData.modalidad || savedFormatProfile.modalidad;
    savedData.docente = savedData.docente || savedFormatProfile.docente;
    savedData.institucion = savedData.institucion || savedFormatProfile.institucion;
    savedData.ciudad = savedData.ciudad || savedFormatProfile.ciudad;
    savedData.fecha = savedData.fecha || savedFormatProfile.fecha;
    savedData.titulo = savedData.titulo || savedFormatProfile.title || savedData.curso;
  }

  if (!savedData.fecha && storedDeliveryDate) {
    savedData.fecha = storedDeliveryDate.slice(0, 10);
  }

  function persistData() {
    saveJSON('export_student_data', savedData);
  }

  fields.forEach(field => {
    const element = document.getElementById(`export-${field}`);
    if (element && savedData[field]) element.value = savedData[field];
    if (element) {
      element.addEventListener('input', () => {
        savedData[field] = element.value;
        if (field === 'fecha') {
          setDeliveryDateValue(normalizeDeliveryDateInput(element.value));
        }
        persistData();
        scheduleValidation();
      });
    }
  });

  const loadFormatInput = document.getElementById('load-format-input');
  const loadFormatButton = document.getElementById('load-format-btn');
  const clearFormatButton = document.getElementById('clear-format-btn');

  if (loadFormatButton && loadFormatInput) {
    loadFormatButton.addEventListener('click', () => loadFormatInput.click());
    loadFormatInput.addEventListener('change', async () => {
      const file = loadFormatInput.files?.[0];
      if (!file) return;

      try {
        const isDocx = /\.docx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        let normalized = null;

        if (isDocx) {
          const dataUrl = await readFileAsDataUrl(file);
          normalized = saveExportFormatProfile({
            kind: 'word-template',
            name: file.name.replace(/\.docx$/i, ''),
            description: 'Plantilla Word cargada desde un documento DOCX',
            fileName: file.name,
            templateDataUrl: dataUrl
          });
        } else {
          const raw = await file.text();
          const parsed = JSON.parse(raw);
          const candidate = parsed.profile || parsed.formato || parsed;
          normalized = saveExportFormatProfile({
            ...candidate,
            kind: 'legacy-json',
            name: candidate.name || file.name.replace(/\.json$/i, ''),
            description: candidate.description || 'Formato personalizado cargado desde archivo'
          });
        }

        if (normalized) {
          if (normalized.kind === 'legacy-json') {
            savedData.curso = savedData.curso || normalized.curso;
            savedData.modalidad = savedData.modalidad || normalized.modalidad;
            savedData.docente = savedData.docente || normalized.docente;
            savedData.institucion = savedData.institucion || normalized.institucion;
            savedData.ciudad = savedData.ciudad || normalized.ciudad;
            savedData.fecha = savedData.fecha || normalized.fecha;
            savedData.titulo = savedData.titulo || normalized.title || savedData.curso;
          }
          persistData();
          updateValidation();
        }
      } catch (err) {
        alert('No se pudo cargar el formato. Verifica que sea un archivo Word .docx válido o un JSON compatible.');
      } finally {
        loadFormatInput.value = '';
      }
    });
  }

  if (clearFormatButton) {
    clearFormatButton.addEventListener('click', () => {
      clearExportFormatProfile();
      updateValidation();
    });
  }

  function buildDocumentPreview(data) {
    const outline = loadJSON('organizer_outline', {});
    const outlineValues = outline.values || outline;
    const redactorContent = normalizeRedactorContent(leerStorage('redactor_content') ?? safeStorageGet('redactor_content', ''));
    const references = getExportReferences();
    const formatSections = getStoredDocumentStructure().map(part => part.text).filter(Boolean);
    const templateLoaded = state.exportFormatProfile?.kind === 'word-template';
    const previewDate = formatApaDate(data.fecha || getDeliveryDateValue() || new Date().toISOString());

    return `
      <div class="dp-card p-6 text-[var(--dp-text-primary)]" style="font-family: 'Times New Roman', serif; line-height: 2;">
        <div class="min-h-[16rem] border-b border-[var(--dp-border)] pb-8 mb-8 text-center flex flex-col justify-center">
          ${templateLoaded ? '<p class="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--dp-accent-dark)]">Plantilla Word cargada</p>' : ''}
          <p class="text-base">${escapeHtml(data.institucion || 'Institución')}</p>
          <p class="text-base mt-1">${escapeHtml(data.curso || 'Nombre del curso')}</p>
          <p class="text-base mt-1">${escapeHtml(data.modalidad || '')}</p>
          <p class="text-base mt-1">${escapeHtml(data.docente || 'Nombre del docente')}</p>
          <div class="flex-1"></div>
          <h1 class="mt-6 text-2xl font-bold">${escapeHtml(data.titulo || 'Título del trabajo')}</h1>
          <div class="mt-6 space-y-1 text-base">
            <p>${escapeHtml(data.nombre || 'Nombre completo')}</p>
            <p>${escapeHtml(data.codigo || 'Código estudiantil')}</p>
            <p>${escapeHtml([data.ciudad || '', data.modalidad || '', previewDate || ''].filter(Boolean).join(' · ') || 'Ciudad · Modalidad · Fecha')}</p>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="mb-3 text-lg font-bold">Tabla de contenido</h2>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${(formatSections.length > 0 ? formatSections : ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Referencias']).map(entry => `<li>${escapeHtml(entry)}</li>`).join('')}
          </ol>
        </div>

        <div class="mb-6">
          <h2 class="mb-3 text-lg font-bold">Cuerpo del documento</h2>
          <p class="whitespace-pre-wrap text-sm">${escapeHtml(redactorContent || normalizeRedactorContent(Object.values(outlineValues).flat()))}</p>
        </div>

        <div>
          <h2 class="mb-3 text-lg font-bold">Referencias</h2>
          <div class="space-y-2 text-sm">
            ${references.length > 0 ? references.map(reference => `<p class="pl-4 -indent-4">${escapeHtml(reference)}</p>`).join('') : '<p class="italic text-[var(--dp-text-muted)]">Sin referencias registradas.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  function updateValidation() {
    const metrics = calculateQualityMetrics();
    const pendingItems = buildPendingItems(metrics);
    const checklist = document.getElementById('validation-checklist');
    const summary = document.getElementById('export-summary');
    const pendingList = document.getElementById('export-pending-list');
    const preview = document.getElementById('document-preview');

    const validations = [
      { name: 'Nombre del estudiante', ok: !!document.getElementById('export-nombre').value },
      { name: 'Datos básicos del curso', ok: !!document.getElementById('export-curso').value },
      { name: 'Fecha de entrega', ok: true },
      { name: 'Estructura completada', ok: metrics.structure >= 80 },
      { name: 'Normas APA 7', ok: metrics.apa >= 70 },
      { name: 'Rúbrica activa', ok: metrics.criteria > 0 }
    ];

    checklist.innerHTML = validations.map(item => `
      <div class="dp-ref-item flex items-center gap-2">
        <span style="color: ${item.ok ? 'var(--dp-success)' : 'var(--dp-danger)'}" class="text-lg flex items-center justify-center">${docproIconHtml('validation', item.ok ? 'Válido' : 'Inválido', 'docpro-icon docpro-icon--sm')}</span>
        <span class="text-[var(--dp-text-primary)]">${item.name}</span>
      </div>
    `).join('');

    summary.innerHTML = `
      <div><span class="font-bold">Estructura:</span> ${metrics.structure}%</div>
      <div><span class="font-bold">APA 7:</span> ${metrics.apa}%</div>
      <div><span class="font-bold">Criterios:</span> ${metrics.criteria}%</div>
      <div><span class="font-bold">Formato Word:</span> ${metrics.wordFormat}%</div>
      <div class="border-t border-[var(--dp-border)] pt-2 mt-2"><span class="font-bold text-[var(--dp-text-primary)]">General: ${metrics.overall}%</span></div>
    `;

    pendingList.innerHTML = pendingItems.length > 0
      ? pendingItems.map(item => `<button class="dp-btn dp-btn-ghost w-full justify-start text-left pending-export-nav" data-view="${item.view}">${item.label}</button>`).join('')
      : '<p style="color: var(--dp-success)" class="font-semibold">No hay pendientes críticos.</p>';

    preview.innerHTML = buildDocumentPreview({
      ...savedData,
      titulo: savedData.titulo || document.getElementById('export-curso')?.value || 'Título del trabajo'
    });

    document.querySelectorAll('.pending-export-nav').forEach(button => {
      button.addEventListener('click', () => navigate(button.dataset.view));
    });
  }

  async function exportarDocx(forceExport = false) {
    if (typeof docx === 'undefined' || !docx.Packer || typeof docx.Packer.toBlob !== 'function') {
      alert('Error: la librería de exportación no está cargada. Verifica tu conexión a internet y recarga la página.');
      return;
    }

    const data = fields.reduce((accumulator, field) => {
      accumulator[field] = document.getElementById(`export-${field}`).value.trim();
      return accumulator;
    }, {});

    if (!data.nombre) {
      alert('Por favor completa al menos tu nombre');
      return;
    }

    Object.assign(savedData, data);
    savedData.titulo = savedData.titulo || data.curso || 'Trabajo académico';
    persistData();
    const storedData = getStoredStudentData();
    const metrics = calculateQualityMetrics();
    const pendingItems = buildPendingItems(metrics);
    if (!forceExport && pendingItems.length > 0) {
      const shouldContinue = confirm('Hay pendientes por revisar. ¿Quieres exportar igualmente?');
      if (!shouldContinue) return;
    }

    const snapshot = buildExportSnapshot();
    const downloaded = await downloadExportDocx(storedData, snapshot);
    if (!downloaded) return;
    addDocumentHistoryEntry(storedData, snapshot);

    const button = document.getElementById('generate-docx-btn');
    if (button) {
      button.textContent = 'Archivo generado';
      setTimeout(() => { button.textContent = 'Generar documento Word'; }, 2500);
    }
  }

  async function exportWordFile(forceExport = false) {
    return exportarDocx(forceExport);
  }

  window.exportarDocx = exportarDocx;
  window.exportWordFile = exportWordFile;

  updateValidation();

  function scheduleValidation() {
    if (state.exportValidationTimer) clearTimeout(state.exportValidationTimer);
    state.exportValidationTimer = setTimeout(() => {
      state.exportValidationTimer = null;
      updateValidation();
    }, 150);
  }

  document.getElementById('generate-docx-btn').addEventListener('click', () => exportarDocx(false));
  document.getElementById('export-anyway-btn').addEventListener('click', () => exportarDocx(true));
  document.getElementById('fix-issues-btn').addEventListener('click', () => {
    const metrics = calculateQualityMetrics();
    const pendingItems = buildPendingItems(metrics);
    if (pendingItems.length > 0) {
      navigate(pendingItems[0].view);
    } else {
      navigate('panel');
    }
  });
  document.getElementById('history-shortcut-btn').addEventListener('click', () => navigate('historial'));
}
