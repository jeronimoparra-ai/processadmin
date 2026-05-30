// ═══════════════════════════════════════════════════════════════════════
// EXPORTADOR.JS - Exportación a Formato DOCX (APA 7)
// ═══════════════════════════════════════════════════════════════════════

function buildExportSnapshot() {
  return {
    redactorContent: safeStorageGet('redactor_content', ''),
    organizerOutline: loadJSON('organizer_outline', {}),
    generatedCitations: getExportReferences(),
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
  const indent = options.hanging ? '<w:ind w:hanging="720"/>' : '';
  return `<w:p><w:pPr><w:jc w:val="${align}"/>${style}${spacing}${indent}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${size}"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
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
    return snapshot.generatedCitations.map(reference => String(reference || '').replace(/<\/?em>/g, '').trim()).filter(Boolean);
  }

  const fromState = Array.isArray(state.generatedCitations) ? state.generatedCitations : [];
  if (fromState.length > 0) {
    return fromState.map(reference => String(reference || '').replace(/<\/?em>/g, '').trim()).filter(Boolean);
  }

  const storedRaw = readFirstStoredValue('apa_generated_citations', 'apa_sources', 'docpro_referencias', 'processadmin_referencias', 'docpro_citas', 'pa_citas');
  if (!storedRaw) return [];

  return parseStoredReferences(storedRaw);
}

function formatApaDate(value) {
  if (!value) return '';

  const source = String(value).trim();
  const candidate = source.includes('T') ? source : `${source}T00:00:00`;
  const parsed = new Date(candidate);

  if (Number.isNaN(parsed.getTime())) {
    return source;
  }

  return parsed.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

function buildGeneratedDocxPackage(data, snapshot = {}) {
  const references = getExportReferences(snapshot);
  const outline = snapshot.organizerOutline || loadJSON('organizer_outline', {});
  const outlineValues = outline.values || outline;
  const redactorContent = snapshot.redactorContent ?? safeStorageGet('redactor_content', '');
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  const formatSections = Array.isArray(exportFormatProfile?.structureParts)
    ? exportFormatProfile.structureParts.map(part => part.text).filter(Boolean)
    : [];
  const title = data.titulo || data.curso || 'Trabajo académico';
  const formattedDate = formatApaDate(data.fecha || getDeliveryDateValue() || new Date().toISOString());

  const paragraphs = [];
  paragraphs.push(buildWordParagraph(data.institucion || 'Institución', { align: 'center', size: 24, double: false }));
  paragraphs.push(buildWordParagraph(data.curso || 'Nombre del curso', { align: 'center', size: 24 }));
  if (data.modalidad) paragraphs.push(buildWordParagraph(`Modalidad: ${data.modalidad}`, { align: 'center', size: 20 }));
  paragraphs.push(buildWordParagraph(data.docente || 'Nombre del docente', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(title, { align: 'center', size: 44, bold: true }));
  paragraphs.push(buildWordParagraph(data.nombre || 'Nombre completo', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(data.codigo || 'Código estudiantil', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(data.ciudad || 'Ciudad', { align: 'center', size: 24 }));
  if (formattedDate) paragraphs.push(buildWordParagraph(formattedDate, { align: 'center', size: 24 }));
  paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  paragraphs.push(buildToCFieldParagraph());
  paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  paragraphs.push(buildWordParagraph('Introducción', { style: 'Heading1', bold: true, size: 28 }));
  const formatBody = formatSections.length > 0 ? formatSections.join('\n\n') : Object.values(outlineValues).flat().join('\n');
  (redactorContent || formatBody || 'Contenido pendiente.').split(/\n\s*\n+/).forEach(paragraph => {
    if (paragraph.trim()) paragraphs.push(buildWordParagraph(paragraph.trim(), { size: 24, double: true }));
  });
  paragraphs.push(buildWordParagraph('Referencias', { style: 'Heading1', bold: true, size: 28 }));
  if (references.length === 0) {
    paragraphs.push(buildWordParagraph('Sin referencias registradas.', { size: 24, hanging: true }));
  } else {
    references.forEach(reference => paragraphs.push(buildWordParagraph(reference, { size: 24, hanging: true })));
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    ${paragraphs.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:titlePg/>
      <w:headerReference w:type="default" r:id="rId1"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:hdr>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:line="480" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:line="480" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:line="480" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:line="480" w:lineRule="auto"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:line="480" w:lineRule="auto"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:line="480" w:lineRule="auto"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`;

  const settingsXml = buildSettingsXml();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="R1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  return createZipBlob([
    { path: '[Content_Types].xml', content: contentTypesXml },
    { path: '_rels/.rels', content: relsXml },
    { path: 'word/_rels/document.xml.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>` },
    { path: 'word/document.xml', content: documentXml },
    { path: 'word/header1.xml', content: headerXml },
    { path: 'word/styles.xml', content: stylesXml },
    { path: 'word/settings.xml', content: settingsXml }
  ]);
}

async function buildTemplateDocxPackage(data, snapshot = {}) {
  const references = getExportReferences(snapshot);
  const outline = snapshot.organizerOutline || loadJSON('organizer_outline', {});
  const outlineValues = outline.values || outline;
  const redactorContent = snapshot.redactorContent ?? safeStorageGet('redactor_content', '');
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  const formatSections = Array.isArray(exportFormatProfile?.structureParts)
    ? exportFormatProfile.structureParts.map(part => part.text).filter(Boolean)
    : [];
  const title = data.titulo || data.curso || exportFormatProfile?.title || 'Trabajo académico';
  const tocItems = formatSections.length > 0 ? formatSections : ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Referencias'];
  const bodyText = redactorContent || formatSections.join('\n\n') || Object.values(outlineValues).flat().join('\n') || 'Contenido pendiente.';
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
  const blob = await buildExportDocxPackage(data, snapshot);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || `${(data.nombre || 'documento').replace(/\s+/g, '_')}_APA7.docx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    const redactorContent = safeStorageGet('redactor_content', '');
    const references = getExportReferences();
    const formatSections = Array.isArray(state.exportFormatProfile?.structureParts)
      ? state.exportFormatProfile.structureParts.map(part => part.text).filter(Boolean)
      : [];
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
          <p class="whitespace-pre-wrap text-sm">${escapeHtml(redactorContent || Object.values(outlineValues).flat().join('\n'))}</p>
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
        <span style="color: ${item.ok ? 'var(--dp-success)' : 'var(--dp-danger)'}" class="text-lg">${item.ok ? '✓' : '✗'}</span>
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

  function buildDocxPackage(data) {
    const references = getExportReferences();
    const outline = loadJSON('organizer_outline', {});
    const outlineValues = outline.values || outline;
    const title = data.titulo || data.curso || 'Trabajo académico';
    const formattedDate = formatApaDate(data.fecha || getDeliveryDateValue() || new Date().toISOString());

    const paragraphs = [];
    const p = (text, options = {}) => {
      const align = options.align || 'left';
      const bold = options.bold ? '<w:b/>' : '';
      const size = options.size || 24;
      const style = options.style ? `<w:pStyle w:val="${options.style}"/>` : '';
      const spacing = options.double ? '<w:spacing w:line="480" w:lineRule="auto"/>' : '';
      const indent = options.hanging ? '<w:ind w:hanging="720"/>' : '';
      return `<w:p><w:pPr><w:jc w:val="${align}"/>${style}${spacing}${indent}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${size}"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
    };

    paragraphs.push(p(data.institucion || 'Institución', { align: 'center', size: 24, double: false }));
    paragraphs.push(p(data.curso || 'Nombre del curso', { align: 'center', size: 24 }));
    if (data.modalidad) paragraphs.push(p(`Modalidad: ${data.modalidad}`, { align: 'center', size: 20 }));
    paragraphs.push(p(data.docente || 'Nombre del docente', { align: 'center', size: 24 }));
    paragraphs.push(p(title, { align: 'center', size: 44, bold: true }));
    paragraphs.push(p(data.nombre || 'Nombre completo', { align: 'center', size: 24 }));
    paragraphs.push(p(data.codigo || 'Código estudiantil', { align: 'center', size: 24 }));
    paragraphs.push(p(data.ciudad || 'Ciudad', { align: 'center', size: 24 }));
    paragraphs.push(p(formattedDate || 'Fecha de entrega', { align: 'center', size: 24 }));
    paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    paragraphs.push(p('Tabla de contenido', { style: 'Heading1', bold: true, size: 28 }));
    paragraphs.push(p('Actualice la tabla de contenido en Word.', { size: 22 }));
    paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    paragraphs.push(p('Introducción', { style: 'Heading1', bold: true, size: 28 }));
    (safeStorageGet('redactor_content', '') || Object.values(outlineValues).flat().join('\n') || 'Contenido pendiente.').split(/\n\s*\n+/).forEach(paragraph => {
      if (paragraph.trim()) paragraphs.push(p(paragraph.trim(), { size: 24, double: true }));
    });
    paragraphs.push(p('Referencias', { style: 'Heading1', bold: true, size: 28 }));
    if (references.length === 0) {
      paragraphs.push(p('Sin referencias registradas.', { size: 24, hanging: true }));
    } else {
      references.forEach(reference => paragraphs.push(p(reference, { size: 24, hanging: true }))); 
    }

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    ${paragraphs.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:titlePg/>
      <w:headerReference w:type="default" r:id="rId1"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>
  </w:p>
</w:hdr>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:line="480" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="R1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    return createZipBlob([
      { path: '[Content_Types].xml', content: contentTypesXml },
      { path: '_rels/.rels', content: relsXml },
      { path: 'word/_rels/document.xml.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
</Relationships>` },
      { path: 'word/document.xml', content: documentXml },
      { path: 'word/header1.xml', content: headerXml },
      { path: 'word/styles.xml', content: stylesXml }
    ]);
  }

  async function exportWordFile(forceExport = false) {
    const data = fields.reduce((accumulator, field) => {
      accumulator[field] = document.getElementById(`export-${field}`).value.trim();
      return accumulator;
    }, {});

    if (!data.nombre) {
      alert('Por favor completa al menos tu nombre');
      return;
    }

    persistData();
    const metrics = calculateQualityMetrics();
    const pendingItems = buildPendingItems(metrics);
    if (!forceExport && pendingItems.length > 0) {
      const shouldContinue = confirm('Hay pendientes por revisar. ¿Quieres exportar igualmente?');
      if (!shouldContinue) return;
    }

    const snapshot = buildExportSnapshot();
    addDocumentHistoryEntry(data, snapshot);
    await downloadExportDocx(data, snapshot);

    const button = document.getElementById('generate-docx-btn');
    if (button) {
      button.textContent = 'Archivo generado';
      setTimeout(() => { button.textContent = 'Generar documento Word'; }, 2500);
    }
  }

  updateValidation();

  function scheduleValidation() {
    if (state.exportValidationTimer) clearTimeout(state.exportValidationTimer);
    state.exportValidationTimer = setTimeout(() => {
      state.exportValidationTimer = null;
      updateValidation();
    }, 150);
  }

  document.getElementById('generate-docx-btn').addEventListener('click', () => exportWordFile(false));
  document.getElementById('export-anyway-btn').addEventListener('click', () => exportWordFile(true));
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
