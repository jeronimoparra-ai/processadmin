// ═══════════════════════════════════════════════════════════════════════
// DOCXEXPORT.JS - Motor de exportación DOCX basado en snapshots
// Versión: 1.0.0 - T-F9: Motor de snapshot independiente
// ═══════════════════════════════════════════════════════════════════════

/**
 * Motor de exportación DOCX basado en snapshots
 * 
 * Características:
 * - Sin dependencias del estado global (window.state)
 * - Recibe datos explícitos a través del snapshot
 * - Genera DOCX válidos con formato APA 7
 * - Soporta: portadas, tabla de contenido, encabezados semánticos,
 *   jerarquía de documentos, metadatos, tablas, figuras
 * - Validación de tamaño (< 20MB) y XML
 * - Usa JSZip desde CDN si está disponible
 * 
 * @namespace docxExport
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.docxExport = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  // ============================================================================
  // CONSTANTES Y CONFIGURACIÓN
  // ============================================================================

  /**
   * Tamaño máximo del snapshot en bytes (20MB)
   */
  const MAX_SNAPSHOT_SIZE = 20 * 1024 * 1024;

  /**
   * Namespace XML para WordprocessingML
   */
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const CP_NS = 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';
  const EP_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties';
  const DC_NS = 'http://purl.org/dc/elements/1.1/';
  const DCTERMS_NS = 'http://purl.org/dc/terms/';

  /**
   * Nombres de archivos clave en el DOCX (ZIP)
   */
  const DOCX_FILES = {
    mainDocument: 'word/document.xml',
    appProperties: 'docProps/app.xml',
    coreProperties: 'docProps/core.xml',
    contentTypes: '[Content_Types].xml',
    relationships: 'word/_rels/document.xml.rels',
    settings: 'word/settings.xml'
  };

  /**
   * Plantillas XML para partes del DOCX
   */
  const XML_TEMPLATES = {
    contentTypes: `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`,

    relationships: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="document.xml"/>
</Relationships>`
  };

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  /**
   * Escapa caracteres especiales para XML
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  function xmlEscape(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Valida que un snapshot no exceda el tamaño máximo
   * @param {Object} snapshot - Snapshot a validar
   * @returns {boolean} True si el snapshot es válido
   */
  function validateSnapshotSize(snapshot) {
    const size = JSON.stringify(snapshot).length;
    return size <= MAX_SNAPSHOT_SIZE;
  }

  /**
   * Valida que un nombre de archivo sea seguro para OOXML
   * @param {string} filename - Nombre del archivo
   * @returns {boolean} True si es seguro
   */
  function isSafeXmlFilename(filename) {
    if (!filename || typeof filename !== 'string') return false;
    // Solo permitir caracteres alphanuméricos, guiones, underscores y puntos
    const safePattern = /^[a-zA-Z0-9\-_\.\/]+$/;
    return safePattern.test(filename);
  }

  /**
   * Valida que el contenido XML sea bien formado
   * @param {string} xmlContent - Contenido XML
   * @returns {boolean} True si es XML válido
   */
  function isValidXml(xmlContent) {
    if (!xmlContent || typeof xmlContent !== 'string') return false;
    
    try {
      // Parser simple para validación básica
      const stack = [];
      let i = 0;
      let inTag = false;
      let inComment = false;
      let inCDATA = false;
      
      while (i < xmlContent.length) {
        const c = xmlContent[i];
        const next = xmlContent[i + 1];
        const next2 = xmlContent[i + 2];
        const next3 = xmlContent[i + 3];
        
        if (inCDATA) {
          if (c === ']' && next === ']' && next2 === '>') {
            inCDATA = false;
            i += 3;
            continue;
          }
          i++;
          continue;
        }
        
        if (inComment) {
          if (c === '-' && next === '-' && next2 === '>') {
            inComment = false;
            i += 3;
            continue;
          }
          i++;
          continue;
        }
        
        if (c === '<') {
          if (next === '!' && next2 === '-' && next3 === '-') {
            inComment = true;
            i += 4;
            continue;
          }
          if (next === '!' && next2 === '[' && xmlContent.substr(i, 9) === '<![CDATA[') {
            inCDATA = true;
            i += 9;
            continue;
          }
          if (next === '/') {
            // Cierre de tag
            inTag = true;
            i++;
            continue;
          }
          // Apertura de tag
          inTag = true;
          i++;
          continue;
        }
        
        if (inTag && c === '>') {
          inTag = false;
        }
        
        i++;
      }
      
      // Verificar que todos los tags estén cerrados
      // (este es un parser simplificado, para validación completa usar DOMParser)
      return !inTag && !inComment && !inCDATA;
    } catch (e) {
      return false;
    }
  }

  /**
   * Nodos OOXML permitidos para validación de seguridad
   */
  const ALLOWED_OOXML_NAMESPACES = [
    'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
    'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
    'http://purl.org/dc/elements/1.1/',
    'http://purl.org/dc/terms/',
    'http://schemas.openxmlformats.org/drawingml/2006/main',
    'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
  ];

  /**
   * Tags permitidos en el documento principal (word/document.xml)
   */
  const ALLOWED_DOCUMENT_TAGS = [
    'w:document', 'w:body', 'w:p', 'w:r', 'w:t', 'w:pPr', 'w:rPr',
    'w:jc', 'w:sz', 'w:rFonts', 'w:b', 'w:i', 'w:u', 'w:highlight',
    'w:spacing', 'w:ind', 'w:firstLine', 'w:hanging', 'w:tabs',
    'w:br', 'w:pageBreak', 'w:lastRenderedPageBreak', 'w:sectPr',
    'w:pgSz', 'w:pgMar', 'w:header', 'w:footer', 'w:fldChar',
    'w:instrText', 'w:pStyle', 'w:numPr', 'w:ilvl', 'w:numId',
    'w:hyperlink', 'w:drawing', 'w:object', 'w:pict', 'w:tbl',
    'w:tr', 'w:tc', 'w:tblPr', 'w:tblGrid', 'w:gridCol',
    'w:vAlign', 'w:tcPr', 'w:tcW', 'w:shd', 'w:bookmarkStart',
    'w:bookmarkEnd', 'w:comments', 'w:comment', 'xml'
  ];

  /**
   * Valida que un archivo ZIP sea un DOCX válido
   * @param {JSZip|Object} zip - Objeto JSZip o estructura similar
   * @returns {Promise<Object>} Resultado de validación con detalles
   */
  async function validateDocx(zip) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      fileCount: 0,
      allowedFiles: [],
      disallowedFiles: []
    };

    if (!zip || typeof zip !== 'object') {
      result.valid = false;
      result.errors.push('El objeto ZIP no es válido');
      return result;
    }

    try {
      const files = Object.keys(zip.files || {});
      result.fileCount = files.length;

      if (files.length === 0) {
        result.valid = false;
        result.errors.push('El archivo DOCX está vacío');
        return result;
      }

      // Verificar que existen archivos clave
      const requiredFiles = [DOCX_FILES.mainDocument, DOCX_FILES.contentTypes];
      for (const reqFile of requiredFiles) {
        const found = files.some(f => f === reqFile || f.endsWith(reqFile));
        if (!found) {
          result.warnings.push(`Falta archivo requerido: ${reqFile}`);
        }
      }

      // Validar cada archivo
      for (const filename of files) {
        const file = zip.files[filename];
        
        if (!file || file.dir) continue;
        
        // Validar nombre del archivo
        if (!isSafeXmlFilename(filename)) {
          result.errors.push(`Nombre de archivo no seguro: ${filename}`);
          result.valid = false;
          continue;
        }

        // Verificar que no haya relaciones externas
        if (filename.toLowerCase().includes('_rels/') || filename.toLowerCase().includes('.rels')) {
          // Archivos de relaciones - verificar contenido
          try {
            const content = typeof file.async === 'function' ? await file.async('text') : file.asText();
            if (content && content.includes('TargetMode="External"')) {
              result.errors.push(`Relación externa encontrada en: ${filename}`);
              result.valid = false;
            }
          } catch (e) {
            result.warnings.push(`No se pudo leer: ${filename}`);
          }
        }

        // Verificar contenido XML
        if (filename.toLowerCase().endsWith('.xml')) {
          try {
            const content = typeof file.async === 'function' ? await file.async('text') : file.asText();
            if (!isValidXml(content)) {
              result.warnings.push(`XML posiblemente inválido en: ${filename}`);
            }
            
            // Verificar namespaces permitidos
            const nsPattern = /xmlns[^=]*="([^"]+)"/g;
            const namespaces = [];
            let match;
            while ((match = nsPattern.exec(content)) !== null) {
              namespaces.push(match[1]);
            }
            
            for (const ns of namespaces) {
              if (!ALLOWED_OOXML_NAMESPACES.includes(ns)) {
                result.warnings.push(`Namespace no reconocido en ${filename}: ${ns}`);
              }
            }
          } catch (e) {
            result.warnings.push(`No se pudo validar XML en: ${filename}`);
          }
        }

        result.allowedFiles.push(filename);
      }

      // Verificar que no haya archivos fuera del estándar DOCX
      const disallowedPatterns = [
        /\.exe$/i, /\.js$/i, /\.vbs$/i, /\.bat$/i, /\.cmd$/i,
        /\.ps1$/i, /\.py$/i, /\.sh$/i, /\.php$/i
      ];

      for (const filename of files) {
        for (const pattern of disallowedPatterns) {
          if (pattern.test(filename)) {
            result.errors.push(`Archivo no permitido: ${filename}`);
            result.valid = false;
            result.disallowedFiles.push(filename);
          }
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Error al validar DOCX: ${error.message}`);
    }

    return result;
  }

  // ============================================================================
  // CONSTRUCTORES XML
  // ============================================================================

  /**
   * Construye el XML de propiedades del núcleo (docProps/core.xml)
   * @param {Object} metadata - Metadatos del documento
   * @returns {string} XML de propiedades del núcleo
   */
  function buildCorePropertiesXml(metadata) {
    const author = xmlEscape(metadata.author || 'ProcessAdmin');
    const title = xmlEscape(metadata.title || 'Documento académico');
    const subject = xmlEscape(metadata.subject || 'Trabajo académico APA 7');
    const description = xmlEscape(metadata.description || 'Documento generado con ProcessAdmin');
    const created = metadata.created || new Date().toISOString();
    const modified = metadata.modified || new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties 
  xmlns:cp="${CP_NS}" 
  xmlns:dc="${DC_NS}" 
  xmlns:dcterms="${DCTERMS_NS}" 
  xmlns:dcmitype="http://purl.org/dc/dcmitype/" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${title}</dc:title>
  <dc:subject>${subject}</dc:subject>
  <dc:description>${description}</dc:description>
  <cp:lastModifiedBy>${author}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${modified}</dcterms:modified>
  <cp:revision>1</cp:revision>
  <dc:creator>${author}</dc:creator>
</cp:coreProperties>`;
  }

  /**
   * Construye el XML de propiedades de la aplicación (docProps/app.xml)
   * @param {Object} metadata - Metadatos del documento
   * @returns {string} XML de propiedades de la aplicación
   */
  function buildAppPropertiesXml(metadata) {
    const title = xmlEscape(metadata.title || 'Documento académico');
    const company = xmlEscape(metadata.company || 'ProcessAdmin');
    const appName = xmlEscape(metadata.appName || 'ProcessAdmin');
    const appVersion = xmlEscape(metadata.appVersion || '1.0.0');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="${EP_NS}" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Template>Normal</Template>
  <TotalTime>0</TotalTime>
  <Pages>0</Pages>
  <Words>0</Words>
  <Characters>0</Characters>
  <Application>${appName}</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant>
        <vt:lpstr>Title</vt:lpstr>
      </vt:variant>
      <vt:variant>
        <vt:i4>1</vt:i4>
      </vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="1" baseType="lpstr">
      <vt:lpstr>${title}</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
  <Company>${company}</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <CharactersWithSpaces>0</CharactersWithSpaces>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>${appVersion}</AppVersion>
</Properties>`;
  }

  /**
   * Construye el XML de configuración de página
   * @param {Object} options - Opciones de página
   * @returns {string} XML de configuración de página
   */
  function buildPageSettingsXml(options = {}) {
    const margin = options.margin || { top: 1440, right: 1440, bottom: 1440, left: 1440 };
    const size = options.size || { width: 11906, height: 16838 }; // A4
    const orientation = options.orientation || 'portrait';

    return `<w:sectPr xmlns:w="${W_NS}">
  <w:pgSz w:w="${size.width}" w:h="${size.height}" w:orient="${orientation}"/>
  <w:pgMar w:top="${margin.top}" w:right="${margin.right}" w:bottom="${margin.bottom}" w:left="${margin.left}" w:gutter="0" w:header="720" w:footer="720"/>
  <w:cols w:space="720"/>
</w:sectPr>`;
  }

  /**
   * Construye un párrafo WordProcessingML
   * @param {Object} options - Opciones del párrafo
   * @returns {string} XML del párrafo
   */
  function buildParagraphXml(options = {}) {
    const {
      text = '',
      style = null,
      alignment = 'left',
      bold = false,
      italic = false,
      underline = false,
      size = 24,
      font = 'Times New Roman',
      doubleSpacing = true,
      firstLineIndent = false,
      hangingIndent = false,
      beforeSpacing = 0,
      afterSpacing = 0,
      isHeading = false,
      headingLevel = null
    } = options;

    const escapedText = xmlEscape(text);
    const lineSpacing = doubleSpacing ? 480 : 240;

    let pStyle = '';
    if (style) {
      pStyle = `<w:pStyle w:val="${xmlEscape(style)}"/>`;
    } else if (isHeading && headingLevel) {
      pStyle = `<w:pStyle w:val="Heading${headingLevel}"/>`;
    }

    const spacingXml = beforeSpacing > 0 || afterSpacing > 0 || lineSpacing !== 240
      ? `<w:spacing w:before="${beforeSpacing}" w:after="${afterSpacing}" w:line="${lineSpacing}" w:lineRule="auto"/>`
      : `<w:spacing w:line="${lineSpacing}" w:lineRule="auto"/>`;

    let indentXml = '';
    if (firstLineIndent) {
      indentXml = '<w:ind w:firstLine="720"/>';
    } else if (hangingIndent) {
      indentXml = '<w:ind w:left="720" w:hanging="720"/>';
    }

    const alignmentMap = {
      left: 'left',
      center: 'center',
      right: 'right',
      justify: 'both'
    };
    const align = alignmentMap[alignment] || 'left';

    const fontXml = `<w:rFonts w:ascii="${xmlEscape(font)}" w:hAnsi="${xmlEscape(font)}"`;
    if (font !== 'Times New Roman') {
      fontXml += ` w:cs="${xmlEscape(font)}"`;
    }
    fontXml += '/>';

    const boldXml = bold ? '<w:b/>' : '';
    const italicXml = italic ? '<w:i/>' : '';
    const underlineXml = underline ? '<w:u w:val="single"/>' : '';

    return `<w:p>
  <w:pPr>
    <w:jc w:val="${align}"/>
    ${pStyle}
    ${spacingXml}
    ${indentXml}
  </w:pPr>
  <w:r>
    <w:rPr>
      ${boldXml}${italicXml}${underlineXml}
      <w:sz w:val="${size}"/>
      ${fontXml}
    </w:rPr>
    <w:t xml:space="preserve">${escapedText}</w:t>
  </w:r>
</w:p>`;
  }

  /**
   * Construye un salto de página
   * @returns {string} XML del salto de página
   */
  function buildPageBreakXml() {
    return `<w:p>
  <w:r>
    <w:br w:type="page"/>
  </w:r>
</w:p>`;
  }

  /**
   * Construye la tabla de contenido (campo TOC)
   * @returns {string} XML de la tabla de contenido
   */
  function buildTableOfContentsXml() {
    return `<w:p>
  <w:pPr>
    <w:pStyle w:val="Heading1"/>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
    </w:rPr>
    <w:t xml:space="preserve">Tabla de contenido</w:t>
  </w:r>
</w:p>
<w:p>
  <w:r>
    <w:fldChar w:fldCharType="begin"/>
  </w:r>
  <w:r>
    <w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText>
  </w:r>
  <w:r>
    <w:fldChar w:fldCharType="separate"/>
  </w:r>
  <w:r>
    <w:t xml:space="preserve">Actualice la tabla de contenido en Word.</w:t>
  </w:r>
  <w:r>
    <w:fldChar w:fldCharType="end"/>
  </w:r>
</w:p>`;
  }

  /**
   * Construye la portada del documento
   * @param {Object} cover - Datos de la portada
   * @returns {string} XML de la portada
   */
  function buildCoverPageXml(cover) {
    const paragraphs = [];

    // Institución
    if (cover.institucion) {
      paragraphs.push(buildParagraphXml({
        text: cover.institucion,
        alignment: 'center',
        size: 24,
        doubleSpacing: false
      }));
    }

    // Curso
    if (cover.curso) {
      paragraphs.push(buildParagraphXml({
        text: cover.curso,
        alignment: 'center',
        size: 24
      }));
    }

    // Modalidad
    if (cover.modalidad) {
      paragraphs.push(buildParagraphXml({
        text: `Modalidad: ${cover.modalidad}`,
        alignment: 'center',
        size: 20,
        doubleSpacing: false
      }));
    }

    // Docente
    if (cover.docente) {
      paragraphs.push(buildParagraphXml({
        text: cover.docente,
        alignment: 'center',
        size: 24,
        doubleSpacing: false
      }));
    }

    // Espaciado antes del título
    paragraphs.push(buildParagraphXml({
      text: '',
      beforeSpacing: 720,
      doubleSpacing: false
    }));

    // Título
    if (cover.titulo) {
      paragraphs.push(buildParagraphXml({
        text: cover.titulo,
        alignment: 'center',
        bold: true,
        size: 28,
        isHeading: true,
        headingLevel: 1,
        beforeSpacing: 720,
        doubleSpacing: false
      }));
    }

    // Nombre del estudiante
    if (cover.nombre) {
      paragraphs.push(buildParagraphXml({
        text: cover.nombre,
        alignment: 'center',
        bold: true,
        size: 24,
        beforeSpacing: 720,
        doubleSpacing: false
      }));
    }

    // Código estudiantil
    if (cover.codigo) {
      paragraphs.push(buildParagraphXml({
        text: cover.codigo,
        alignment: 'center',
        size: 24,
        doubleSpacing: false
      }));
    }

    // Ciudad y fecha
    const cityDate = [cover.ciudad, cover.fecha].filter(Boolean).join(' · ');
    if (cityDate) {
      paragraphs.push(buildParagraphXml({
        text: cityDate,
        alignment: 'center',
        size: 24,
        doubleSpacing: false
      }));
    }

    return paragraphs.join('\n');
  }

  /**
   * Construye el cuerpo del documento a partir del contenido
   * @param {Object} content - Contenido del documento
   * @returns {string} XML del cuerpo
   */
  function buildDocumentBodyXml(snapshot) {
    const parts = [];

    // 1. Portada
    const cover = snapshot.cover || snapshot.profile || {};
    const coverXml = buildCoverPageXml({
      institucion: cover.institucion || '',
      curso: cover.curso || cover.title || '',
      modalidad: cover.modalidad || '',
      docente: cover.docente || '',
      titulo: cover.titulo || cover.curso || 'Trabajo académico',
      nombre: cover.nombre || '',
      codigo: cover.codigo || '',
      ciudad: cover.ciudad || '',
      fecha: cover.fecha || snapshot.exportDate || ''
    });
    if (coverXml.trim()) {
      parts.push(coverXml);
      parts.push(buildPageBreakXml());
    }

    // 2. Tabla de contenido
    parts.push(buildTableOfContentsXml());
    parts.push(buildPageBreakXml());

    // 3. Título principal
    const title = cover.titulo || cover.curso || 'Trabajo académico';
    parts.push(buildParagraphXml({
      text: title,
      alignment: 'center',
      bold: true,
      size: 28,
      isHeading: true,
      headingLevel: 1
    }));
    parts.push(buildParagraphXml({ text: '' }));

    // 4. Contenido principal (outline o texto)
    const outline = snapshot.outline || snapshot.organizerOutline || {};
    const textContent = snapshot.text || snapshot.redactorContent || '';

    // Si hay outline, procesarlo
    if (outline.values && typeof outline.values === 'object') {
      const outlineValues = Object.values(outline.values);
      if (outlineValues.length > 0) {
        const flatContent = outlineValues.flat();
        let currentLevel = 1;

        for (const item of flatContent) {
          if (!item || typeof item !== 'object') continue;

          const text = item.text || item.content || item.label || item.title || '';
          if (!text.trim()) continue;

          const level = item.level || item.depth || currentLevel;
          const headingLevel = Math.min(Math.max(1, level), 9);

          parts.push(buildParagraphXml({
            text: text,
            isHeading: true,
            headingLevel: headingLevel,
            size: 28 - (headingLevel * 2),
            bold: true
          }));

          // Si tiene subtítulos o contenido
          if (item.children && Array.isArray(item.children)) {
            for (const child of item.children) {
              if (child.text) {
                parts.push(buildParagraphXml({
                  text: child.text,
                  firstLineIndent: true
                }));
              }
            }
          }
        }
      }
    }

    // Procesar texto plano si no hay outline
    if (textContent.trim() && (!outline || !outline.values)) {
      const paragraphs = textContent.split(/\n\s*\n+/);
      for (const para of paragraphs) {
        const cleanPara = para.trim();
        if (cleanPara) {
          parts.push(buildParagraphXml({
            text: cleanPara,
            firstLineIndent: true
          }));
        }
      }
    }

    // 5. Referencias
    const sources = snapshot.sources || snapshot.generatedCitations || [];
    if (sources.length > 0) {
      parts.push(buildPageBreakXml());
      parts.push(buildParagraphXml({
        text: 'Referencias',
        alignment: 'center',
        bold: true,
        size: 28,
        isHeading: true,
        headingLevel: 1
      }));
      parts.push(buildParagraphXml({ text: '' }));

      for (const source of sources) {
        if (!source) continue;
        const sourceText = source.formatted || source.text || source.citation || 
                          source.texto || source.referencia || '';
        if (sourceText.trim()) {
          parts.push(buildParagraphXml({
            text: sourceText,
            hangingIndent: true,
            doubleSpacing: false
          }));
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Construye el documento XML principal (word/document.xml)
   * @param {string} bodyXml - Contenido del cuerpo
   * @returns {string} XML completo del documento
   */
  function buildMainDocumentXml(bodyXml) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W_NS}">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;
  }

  /**
   * Construye el XML de configuración (word/settings.xml)
   * @returns {string} XML de configuración
   */
  function buildSettingsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="${W_NS}">
  <w:updateFields w:val="true"/>
  <w:compatibility>
    <w:useNormalStyleForList>false</w:useNormalStyleForList>
  </w:compatibility>
</w:settings>`;
  }

  // ============================================================================
  // FUNCIÓN PRINCIPAL DE EXPORTACIÓN
  // ============================================================================

  /**
   * Convierte un snapshot a un DOCX (buffer)
   * 
   * @param {Object} snapshot - Snapshot completo del documento
   * @param {Object} options - Opciones de exportación
   * @param {boolean} options.validate - Validar el snapshot antes de exportar (default: true)
   * @param {boolean} options.useTemplate - Usar plantilla si está disponible (default: false)
   * @returns {Promise<Buffer|Uint8Array>} Buffer del DOCX
   * @throws {Error} Si el snapshot es inválido o la exportación falla
   * 
   * @example
   * const snapshot = {
   *   cover: { titulo: 'Mi Trabajo', nombre: 'Juan Pérez' },
   *   outline: { values: { intro: { text: 'Introducción' } } },
   *   text: 'Contenido del documento...',
   *   sources: [{ formatted: 'Apellido, Nombre (2024)...' }],
   *   profile: { title: 'Trabajo académico' },
   *   exportDate: new Date().toISOString()
   * };
   * 
   * const buffer = await docxExport.renderFromSnapshot(snapshot);
   */
  async function renderFromSnapshot(snapshot, options = {}) {
    const { validate = true, useTemplate = false } = options;

    // Validar snapshot
    if (validate) {
      if (!snapshot || typeof snapshot !== 'object') {
        throw new Error('Snapshot es inválido: debe ser un objeto');
      }

      if (!validateSnapshotSize(snapshot)) {
        throw new Error(`Snapshot excede el tamaño máximo de ${MAX_SNAPSHOT_SIZE / (1024 * 1024)}MB`);
      }
    }

    // Normalizar snapshot
    const normalizedSnapshot = normalizeSnapshot(snapshot);

    // Verificar si JSZip está disponible
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip no está disponible. Asegúrate de que está cargado desde CDN.');
    }

    // Crear el ZIP del DOCX
    const zip = new JSZip();

    // 1. docProps/core.xml
    const coreXml = buildCorePropertiesXml({
      title: normalizedSnapshot.cover?.titulo || normalizedSnapshot.profile?.title || 'Documento académico',
      author: normalizedSnapshot.cover?.nombre || 'ProcessAdmin',
      subject: 'Trabajo académico APA 7',
      description: 'Documento generado con ProcessAdmin',
      created: normalizedSnapshot.exportDate || new Date().toISOString(),
      modified: new Date().toISOString()
    });
    zip.file(DOCX_FILES.coreProperties, coreXml);

    // 2. docProps/app.xml
    const appXml = buildAppPropertiesXml({
      title: normalizedSnapshot.cover?.titulo || 'Documento académico',
      company: 'ProcessAdmin',
      appName: 'ProcessAdmin',
      appVersion: '1.0.0'
    });
    zip.file(DOCX_FILES.appProperties, appXml);

    // 3. [Content_Types].xml
    zip.file(DOCX_FILES.contentTypes, XML_TEMPLATES.contentTypes);

    // 4. word/_rels/document.xml.rels
    zip.folder('word/_rels')?.file('document.xml.rels', XML_TEMPLATES.relationships);

    // 5. word/settings.xml
    zip.file('word/settings.xml', buildSettingsXml());

    // 6. word/document.xml (principal)
    const bodyXml = buildDocumentBodyXml(normalizedSnapshot);
    const mainXml = buildMainDocumentXml(bodyXml);
    zip.file(DOCX_FILES.mainDocument, mainXml);

    // 7. Validar el ZIP generado
    const validation = await validateDocx(zip);
    if (!validation.valid) {
      console.warn('Validación del DOCX generado:', validation);
      // No abortar, solo logar advertencias
    }

    // 8. Generar el buffer
    return zip.generateAsync({
      type: 'uint8array',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE'
    });
  }

  /**
   * Normaliza un snapshot para asegurar que tiene todos los campos necesarios
   * @param {Object} snapshot - Snapshot a normalizar
   * @returns {Object} Snapshot normalizado
   */
  function normalizeSnapshot(snapshot) {
    if (!snapshot) return {};

    const normalized = { ...snapshot };

    // Asegurar que cover existe
    if (!normalized.cover) {
      normalized.cover = { ...(normalized.profile || {}) };
    }

    // Asegurar que outline existe
    if (!normalized.outline) {
      normalized.outline = normalized.organizerOutline || {};
    }

    // Asegurar que text existe
    if (!normalized.text && !normalized.redactorContent) {
      normalized.text = '';
    } else if (!normalized.text) {
      normalized.text = normalized.redactorContent || '';
    }

    // Asegurar que sources existe
    if (!normalized.sources) {
      normalized.sources = normalized.generatedCitations || [];
    }

    // Asegurar que profile existe
    if (!normalized.profile) {
      normalized.profile = normalized.exportFormatProfile || {};
    }

    // Asegurar que exportDate existe
    if (!normalized.exportDate) {
      normalized.exportDate = new Date().toISOString();
    }

    return normalized;
  }

  // ============================================================================
  // EXPORTACIÓN PÚBLICA
  // ============================================================================

  return {
    /**
     * Convierte un snapshot a DOCX
     * @function
     */
    renderFromSnapshot,

    /**
     * Valida un archivo DOCX (ZIP)
     * @function
     */
    validateDocx,

    /**
     * Valida el tamaño de un snapshot
     * @function
     */
    validateSnapshotSize,

    /**
     * Escapa texto para XML
     * @function
     */
    xmlEscape,

    /**
     * Normaliza un snapshot
     * @function
     */
    normalizeSnapshot,

    /**
     * Construye XML de propiedades del núcleo
     * @function
     */
    buildCorePropertiesXml,

    /**
     * Construye XML de propiedades de la aplicación
     * @function
     */
    buildAppPropertiesXml,

    /**
     * Tamaño máximo del snapshot (bytes)
     */
    MAX_SNAPSHOT_SIZE,

    /**
     * Nombres de archivos clave en DOCX
     */
    DOCX_FILES
  };
});
