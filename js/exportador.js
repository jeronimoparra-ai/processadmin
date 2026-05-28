// ═══════════════════════════════════════════════════════════════════════
// EXPORTADOR.JS - Exportación a Formato DOCX (APA 7)
// ═══════════════════════════════════════════════════════════════════════

function buildExportSnapshot() {
  return {
    redactorContent: safeStorageGet('redactor_content', ''),
    organizerOutline: loadJSON('organizer_outline', {}),
    generatedCitations: [...state.generatedCitations].map(reference => reference.replace(/<\/?em>/g, '')),
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

function buildGeneratedDocxPackage(data, snapshot = {}) {
  const references = (snapshot.generatedCitations || [...state.generatedCitations].map(ref => ref.replace(/<\/?em>/g, '')));
  const outline = snapshot.organizerOutline || loadJSON('organizer_outline', {});
  const outlineValues = outline.values || outline;
  const redactorContent = snapshot.redactorContent ?? safeStorageGet('redactor_content', '');
  const exportFormatProfile = snapshot.exportFormatProfile ?? state.exportFormatProfile;
  const formatSections = Array.isArray(exportFormatProfile?.structureParts)
    ? exportFormatProfile.structureParts.map(part => part.text).filter(Boolean)
    : [];
  const title = data.titulo || data.curso || 'Trabajo académico';

  const paragraphs = [];
  paragraphs.push(buildWordParagraph(data.institucion || 'Institución', { align: 'center', size: 24, double: false }));
  paragraphs.push(buildWordParagraph(data.curso || 'Nombre del curso', { align: 'center', size: 24 }));
  if (data.modalidad) paragraphs.push(buildWordParagraph(`Modalidad: ${data.modalidad}`, { align: 'center', size: 20 }));
  paragraphs.push(buildWordParagraph(data.docente || 'Nombre del docente', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(title, { align: 'center', size: 32, bold: true }));
  paragraphs.push(buildWordParagraph(data.nombre || 'Nombre completo', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(data.codigo || 'Código estudiantil', { align: 'center', size: 24 }));
  paragraphs.push(buildWordParagraph(data.ciudad || 'Ciudad', { align: 'center', size: 24 }));
  if (data.fecha) paragraphs.push(buildWordParagraph(data.fecha, { align: 'center', size: 24 }));
  paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  paragraphs.push(buildWordParagraph('Tabla de contenido', { style: 'Heading1', bold: true, size: 28 }));
  (formatSections.length > 0 ? formatSections : ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Referencias']).forEach((entry, index) => {
    paragraphs.push(buildWordParagraph(`${index + 1}. ${entry}`, { size: 22 }));
  });
  paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  paragraphs.push(buildWordParagraph('Introducción', { style: 'Heading1', bold: true, size: 28 }));
  const formatBody = formatSections.length > 0 ? formatSections.join('\n\n') : Object.values(outlineValues).flat().join('\n');
  (redactorContent || formatBody || 'Contenido pendiente.').split(/\n\s*\n+/).forEach(paragraph => {
    if (paragraph.trim()) paragraphs.push(buildWordParagraph(paragraph.trim(), { size: 24, double: true }));
  });
  paragraphs.push(buildWordParagraph('Referencias', { style: 'Heading1', bold: true, size: 28 }));
  if (references.length === 0) {
    paragraphs.push(buildWordParagraph('Sin referencias aún', { size: 24, hanging: true }));
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

async function buildTemplateDocxPackage(data, snapshot = {}) {
  const references = (snapshot.generatedCitations || [...state.generatedCitations].map(ref => ref.replace(/<\/?em>/g, '')));
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

  const metadataReplacements = {
    institucion: data.institucion || 'Institución',
    curso: data.curso || 'Nombre del curso',
    modalidad: data.modalidad || '',
    docente: data.docente || 'Nombre del docente',
    titulo: title,
    nombre: data.nombre || 'Nombre completo',
    codigo: data.codigo || 'Código estudiantil',
    ciudad: data.ciudad || 'Ciudad',
    fecha: data.fecha || ''
  };

  const tocXml = tocItems.map((entry, index) => buildWordParagraph(`${index + 1}. ${entry}`, { size: 22 })).join('\n');
  const bodyXml = bodyText.split(/\n\s*\n+/).filter(Boolean).map(paragraph => buildWordParagraph(paragraph, { size: 24, double: true })).join('\n');
  const referencesXml = (references.length > 0 ? references : ['Sin referencias aún']).map(reference => buildWordParagraph(reference, { size: 24, hanging: true })).join('\n');

  await Promise.all(textFiles.map(async file => {
    let content = await file.async('string');
    Object.entries(metadataReplacements).forEach(([key, value]) => {
      content = replaceXmlText(content, key, value);
    });
    content = replaceXmlParagraph(content, 'toc', tocXml);
    content = replaceXmlParagraph(content, 'tabla_de_contenido', tocXml);
    content = replaceXmlParagraph(content, 'contenido', bodyXml);
    content = replaceXmlParagraph(content, 'cuerpo', bodyXml);
    content = replaceXmlParagraph(content, 'referencias', referencesXml);
    zip.file(file.name, content);
  }));

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
  const formatLabel = formatProfile?.name || 'Sin formato cargado';
  const formatDetail = formatProfile?.description || 'Puedes cargar un formato JSON opcional para reutilizar datos y estructura.';
  const html = `
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3"><span>📤</span> Exportación a Word (Formato APA 7)</h2>
      <p class="text-gray-600 mb-8">Completa tus datos, revisa la validación y genera tu archivo local sin perder el formato.</p>

      <div class="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-5 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-blue-900">Formato de trabajo</p>
           <p class="text-sm text-slate-600">${escapeHtml(formatLabel)} · ${escapeHtml(formatDetail)}</p>
        </div>
        <div class="flex flex-wrap gap-3">
           <button id="load-format-btn" class="bg-blue-600 text-white rounded-lg px-4 py-2 font-bold hover:bg-blue-700 transition-colors text-sm">📂 Cargar formato Word</button>
          <button id="clear-format-btn" class="bg-white text-slate-700 rounded-lg px-4 py-2 font-bold border border-slate-200 hover:bg-slate-50 transition-colors text-sm">Quitar formato</button>
        </div>
      </div>

       <input id="load-format-input" type="file" accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/json,.json" class="hidden">

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8 space-y-5">
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Nombre completo *</label>
              <input id="export-nombre" type="text" aria-label="Nombre completo" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Código estudiantil</label>
              <input id="export-codigo" type="text" aria-label="Código estudiantil" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Nombre del curso</label>
              <input id="export-curso" type="text" aria-label="Nombre del curso" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-2">Modalidad</label>
                  <select id="export-modalidad" aria-label="Modalidad del trabajo" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Seleccionar modalidad</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Híbrida">Híbrida</option>
                  </select>
                </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Nombre del docente</label>
              <input id="export-docente" type="text" aria-label="Nombre del docente" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Institución</label>
              <input id="export-institucion" type="text" aria-label="Institución" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Ciudad</label>
              <input id="export-ciudad" type="text" aria-label="Ciudad" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 mb-2">Fecha de entrega</label>
              <input id="export-fecha" type="date" aria-label="Fecha de entrega" class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <p id="export-fecha-help" class="mt-2 text-xs text-slate-500">Opcional: agrega la fecha si quieres incluirla en la exportación.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button id="generate-docx-btn" class="flex-1 bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition-colors">📥 Generar archivo Word</button>
              <button id="export-anyway-btn" class="flex-1 bg-slate-600 text-white rounded-lg py-3 font-bold hover:bg-slate-700 transition-colors">Exportar de todos modos</button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6">
            <h3 class="font-bold text-slate-900 mb-3">🖥️ Vista previa del documento</h3>
            <div id="document-preview" class="bg-slate-50 rounded-lg border border-slate-200 p-6 max-h-[42rem] overflow-y-auto"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-300 p-6">
            <h3 class="font-bold text-green-900 mb-4">✅ Validación pre-exportación</h3>
            <div id="validation-checklist" class="space-y-2 text-sm"></div>
            <div id="export-summary" class="mt-4 space-y-3 text-xs"></div>
            <div class="mt-4 space-y-2">
              <button id="fix-issues-btn" class="w-full bg-green-600 text-white rounded px-4 py-2 font-bold hover:bg-green-700 transition-colors text-sm">Ir a revisar pendientes</button>
              <button id="history-shortcut-btn" class="w-full bg-white text-slate-700 rounded px-4 py-2 font-bold border border-green-200 hover:bg-green-50 transition-colors text-sm">Ver historial de documentos</button>
            </div>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-6">
            <h3 class="font-bold text-blue-900 mb-3">📋 Pendientes directos</h3>
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
  const formatProfile = state.exportFormatProfile;

  if (formatProfile && formatProfile.kind === 'legacy-json') {
    savedData.curso = savedData.curso || formatProfile.curso;
    savedData.modalidad = savedData.modalidad || formatProfile.modalidad;
    savedData.docente = savedData.docente || formatProfile.docente;
    savedData.institucion = savedData.institucion || formatProfile.institucion;
    savedData.ciudad = savedData.ciudad || formatProfile.ciudad;
    savedData.fecha = savedData.fecha || formatProfile.fecha;
    savedData.titulo = savedData.titulo || formatProfile.title || savedData.curso;
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
    const references = state.generatedCitations.map(ref => ref.replace(/<\/?em>/g, ''));
    const formatSections = Array.isArray(state.exportFormatProfile?.structureParts)
      ? state.exportFormatProfile.structureParts.map(part => part.text).filter(Boolean)
      : [];
      const templateLoaded = state.exportFormatProfile?.kind === 'word-template';

    return `
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-900" style="font-family: 'Times New Roman', serif; line-height: 2;">
        <div class="text-center min-h-[16rem] flex flex-col justify-center border-b border-slate-200 pb-8 mb-8">
           ${templateLoaded ? '<p class="text-xs uppercase tracking-[0.2em] text-blue-600 mb-4">Plantilla Word cargada</p>' : ''}
          <p class="text-base">${escapeHtml(data.institucion || 'Institución')}</p>
          <p class="text-base mt-1">${escapeHtml(data.curso || 'Nombre del curso')}</p>
          <p class="text-base mt-1">${escapeHtml(data.modalidad || '')}</p>
          <p class="text-base mt-1">${escapeHtml(data.docente || 'Nombre del docente')}</p>
          <div class="flex-1"></div>
          <h1 class="text-2xl font-bold mt-6">${escapeHtml(data.titulo || 'Título del trabajo')}</h1>
          <div class="mt-6 text-base space-y-1">
            <p>${escapeHtml(data.nombre || 'Nombre completo')}</p>
            <p>${escapeHtml(data.codigo || 'Código estudiantil')}</p>
            <p>${escapeHtml([data.ciudad || '', data.modalidad || '', data.fecha || ''].filter(Boolean).join(' · ') || 'Ciudad · Modalidad · Fecha')}</p>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-lg font-bold mb-3">Tabla de contenido</h2>
          <ol class="list-decimal list-inside text-sm space-y-1">
            ${(formatSections.length > 0 ? formatSections : ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Referencias']).map(entry => `<li>${escapeHtml(entry)}</li>`).join('')}
          </ol>
        </div>

        <div class="mb-6">
          <h2 class="text-lg font-bold mb-3">Cuerpo del documento</h2>
          <p class="text-sm whitespace-pre-wrap">${escapeHtml(redactorContent || Object.values(outlineValues).flat().join('\n'))}</p>
        </div>

        <div>
          <h2 class="text-lg font-bold mb-3">Referencias</h2>
          <div class="space-y-2 text-sm">
            ${references.length > 0 ? references.map(reference => `<p class="pl-4 -indent-4">${escapeHtml(reference)}</p>`).join('') : '<p class="italic text-slate-500">Sin referencias aún</p>'}
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
      <div class="flex items-center gap-2">
        <span class="${item.ok ? 'text-green-600' : 'text-red-600'} text-lg">${item.ok ? '✓' : '✗'}</span>
        <span class="text-slate-700">${item.name}</span>
      </div>
    `).join('');

    summary.innerHTML = `
      <div><span class="font-bold">Estructura:</span> ${metrics.structure}%</div>
      <div><span class="font-bold">APA 7:</span> ${metrics.apa}%</div>
      <div><span class="font-bold">Criterios:</span> ${metrics.criteria}%</div>
      <div><span class="font-bold">Formato Word:</span> ${metrics.wordFormat}%</div>
      <div class="border-t pt-2 mt-2"><span class="font-bold text-blue-900">General: ${metrics.overall}%</span></div>
    `;

    pendingList.innerHTML = pendingItems.length > 0
      ? pendingItems.map(item => `<button class="w-full text-left bg-white border border-blue-200 rounded px-3 py-2 hover:bg-blue-50 transition-colors pending-export-nav" data-view="${item.view}">${item.label}</button>`).join('')
      : '<p class="text-emerald-700 font-semibold">No hay pendientes críticos.</p>';

    preview.innerHTML = buildDocumentPreview({
      ...savedData,
      titulo: savedData.titulo || document.getElementById('export-curso')?.value || 'Título del trabajo'
    });

    document.querySelectorAll('.pending-export-nav').forEach(button => {
      button.addEventListener('click', () => navigate(button.dataset.view));
    });
  }

  function buildDocxPackage(data) {
    const references = state.generatedCitations.map(ref => ref.replace(/<\/?em>/g, ''));
    const outline = loadJSON('organizer_outline', {});
    const outlineValues = outline.values || outline;
    const title = data.titulo || data.curso || 'Trabajo académico';

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
    paragraphs.push(p(title, { align: 'center', size: 32, bold: true }));
    paragraphs.push(p(data.nombre || 'Nombre completo', { align: 'center', size: 24 }));
    paragraphs.push(p(data.codigo || 'Código estudiantil', { align: 'center', size: 24 }));
    paragraphs.push(p(data.ciudad || 'Ciudad', { align: 'center', size: 24 }));
    paragraphs.push(p(data.fecha || 'Fecha de entrega', { align: 'center', size: 24 }));
    paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    paragraphs.push(p('Tabla de contenido', { style: 'Heading1', bold: true, size: 28 }));
    ['Portada', 'Introducción', 'Desarrollo', 'Conclusiones', 'Referencias'].forEach((entry, index) => {
      paragraphs.push(p(`${index + 1}. ${entry}`, { size: 22 }));
    });
    paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    paragraphs.push(p('Introducción', { style: 'Heading1', bold: true, size: 28 }));
    (safeStorageGet('redactor_content', '') || Object.values(outlineValues).flat().join('\n') || 'Contenido pendiente.').split(/\n\s*\n+/).forEach(paragraph => {
      if (paragraph.trim()) paragraphs.push(p(paragraph.trim(), { size: 24, double: true }));
    });
    paragraphs.push(p('Referencias', { style: 'Heading1', bold: true, size: 28 }));
    if (references.length === 0) {
      paragraphs.push(p('Sin referencias aún', { size: 24, hanging: true }));
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
      alert('⚠️ Por favor completa al menos tu nombre');
      return;
    }

    persistData();
    const metrics = calculateQualityMetrics();
    const pendingItems = buildPendingItems(metrics);
    if (!forceExport && pendingItems.length > 0) {
      const shouldContinue = confirm('Hay pendientes por revisar. ¿Deseas exportar de todos modos?');
      if (!shouldContinue) return;
    }

    const snapshot = buildExportSnapshot();
    addDocumentHistoryEntry(data, snapshot);
    await downloadExportDocx(data, snapshot);

    const button = document.getElementById('generate-docx-btn');
    if (button) {
      button.textContent = '✅ Archivo generado';
      setTimeout(() => { button.textContent = '📥 Generar archivo Word'; }, 2500);
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
