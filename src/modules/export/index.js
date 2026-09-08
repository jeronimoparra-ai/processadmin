// ═══════════════════════════════════════════════════════════════════════
// MODULES/EXPORT/INDEX.JS - Exportador Oficial a Word DOCX (APA 7)
// ═══════════════════════════════════════════════════════════════════════

import { store } from '../../core/state.js';
import { getIconSvg } from '../../components/icons/icons.js';
import { escapeHtml, writeClipboardText } from '../../utils/helpers.js';

export function renderExport(container) {
  const work = store.getCurrentWork();
  const totalWords = store.getTotalWordCount();
  const citationsCount = (work.citations || []).length;
  const meta = work.metadata || {};

  container.innerHTML = `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Encabezado del módulo -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Exportar a Word (.docx)</h1>
          <p class="text-sm text-slate-600 mt-1">
            Genera un documento Word nativo formateado conforme a las directrices de APA 7.ª edición.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-preview-export" class="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            ${getIconSvg('review', '', 14)}
            <span>Vista Previa de Texto</span>
          </button>
          <button id="btn-generate-docx" class="btn btn-primary text-xs px-4 py-2 font-bold flex items-center gap-2 shadow-sm">
            ${getIconSvg('download', 'text-white', 16)}
            <span>Descargar .docx APA 7</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Formulario de Metadatos para Portada APA 7 -->
        <div class="lg:col-span-7 space-y-6">
          <section class="app-card p-6 bg-white space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                ${getIconSvg('documents', 'text-blue-600', 16)}
                <span>Datos de Portada (Estilo Estudiante APA 7)</span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Estos campos aparecerán en la primera página de tu trabajo de forma centrada.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label for="meta-title" class="form-label">Título del trabajo</label>
                <input id="meta-title" type="text" class="form-input text-sm font-semibold" value="${escapeHtml(work.title || '')}">
              </div>

              <div>
                <label for="meta-author" class="form-label">Nombre del estudiante (Autor)</label>
                <input id="meta-author" type="text" class="form-input text-sm" value="${escapeHtml(meta.author || '')}" placeholder="Ej: Andrés Jeronimo Parra">
              </div>

              <div>
                <label for="meta-code" class="form-label">Código estudiantil (opcional)</label>
                <input id="meta-code" type="text" class="form-input text-sm" value="${escapeHtml(meta.code || '')}" placeholder="Ej: 1002345678">
              </div>

              <div>
                <label for="meta-institution" class="form-label">Institución o Universidad</label>
                <input id="meta-institution" type="text" class="form-input text-sm" value="${escapeHtml(meta.institution || '')}" placeholder="Ej: IU Digital de Antioquia">
              </div>

              <div>
                <label for="meta-course" class="form-label">Curso o Asignatura</label>
                <input id="meta-course" type="text" class="form-input text-sm" value="${escapeHtml(meta.course || '')}" placeholder="Ej: Metodología de la Investigación">
              </div>

              <div>
                <label for="meta-professor" class="form-label">Docente o Tutor</label>
                <input id="meta-professor" type="text" class="form-input text-sm" value="${escapeHtml(meta.professor || '')}" placeholder="Ej: Mg. Carlos Morales">
              </div>

              <div>
                <label for="meta-date" class="form-label">Fecha de entrega</label>
                <input id="meta-date" type="date" class="form-input text-sm" value="${escapeHtml(meta.date || new Date().toISOString().slice(0, 10))}">
              </div>
            </div>
          </section>

          <!-- Opciones de exportación -->
          <section class="app-card p-6 bg-white space-y-4">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Formato APA 7 Aplicado
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Márgenes</span>
                <strong class="text-slate-800">2.54 cm (1 pulgada)</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Fuente</span>
                <strong class="text-slate-800">Times New Roman 12pt</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Interlineado</span>
                <strong class="text-slate-800">Doble (2.0)</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Sangría primera línea</span>
                <strong class="text-slate-800">1.27 cm (0.5 pulg)</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Bibliografía</span>
                <strong class="text-slate-800">Sangría francesa</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span class="text-slate-500 block">Numeración</span>
                <strong class="text-slate-800">Superior derecha</strong>
              </div>
            </div>
          </section>
        </div>

        <!-- Resumen del contenido a exportar -->
        <div class="lg:col-span-5 space-y-4">
          <section class="app-card p-6 bg-white space-y-4 sticky top-6">
            <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Estructura a Exportar</span>
              <span class="badge badge-accent">${totalWords} palabras</span>
            </h2>

            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div class="flex items-center gap-2 p-2 rounded bg-slate-100 text-xs font-semibold text-slate-700">
                <span>📄</span>
                <span>Portada APA 7</span>
              </div>

              ${work.sections.map((sec, idx) => {
                const words = (sec.content || '').trim().split(/\s+/).filter(Boolean).length;
                return `
                  <div class="flex items-center justify-between p-2 rounded border border-slate-200 bg-slate-50/50 text-xs">
                    <span class="font-medium text-slate-800 truncate">${idx + 1}. ${escapeHtml(sec.title)}</span>
                    <span class="font-mono text-slate-500">${words} p.</span>
                  </div>
                `;
              }).join('')}

              <div class="flex items-center justify-between p-2 rounded border border-indigo-200 bg-indigo-50/50 text-xs text-indigo-900 font-medium">
                <span>📚 Referencias</span>
                <span class="font-bold">${citationsCount}</span>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 space-y-2">
              <button id="btn-main-download-docx" class="btn btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
                ${getIconSvg('download', 'text-white', 18)}
                <span>Descargar Archivo Word (.docx)</span>
              </button>
              <p class="text-[11px] text-center text-slate-400">
                Archivo 100% compatible con Microsoft Word, Google Docs y LibreOffice.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Modal de vista previa de texto -->
    <div id="modal-export-preview" class="modal-backdrop" style="display:none;" role="dialog" aria-modal="true">
      <div class="modal-panel max-w-2xl w-full bg-white p-6 rounded-xl space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-bold text-slate-900 text-base">Vista Previa del Texto Completo</h3>
          <button id="btn-close-preview-modal" class="text-slate-400 hover:text-slate-600 p-1">
            ${getIconSvg('close', '', 16)}
          </button>
        </div>

        <div class="p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto font-serif text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-200" id="preview-text-content"></div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button id="btn-copy-preview-text" class="btn btn-secondary text-xs px-3 py-1.5">
            Copiar Todo al Portapapeles
          </button>
          <button id="btn-close-preview-2" class="btn btn-ghost text-xs px-3 py-1.5">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;

  // Helper para persistir metadatos de portada
  function persistMeta() {
    const titleVal = container.querySelector('#meta-title')?.value.trim();
    if (titleVal) store.updateCurrentWork({ title: titleVal });

    store.updateMetadata({
      author: container.querySelector('#meta-author')?.value.trim() || '',
      code: container.querySelector('#meta-code')?.value.trim() || '',
      institution: container.querySelector('#meta-institution')?.value.trim() || '',
      course: container.querySelector('#meta-course')?.value.trim() || '',
      professor: container.querySelector('#meta-professor')?.value.trim() || '',
      date: container.querySelector('#meta-date')?.value || new Date().toISOString().slice(0, 10)
    });
  }

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => persistMeta());
  });

  // Generador nativo DOCX vía docx.js
  async function generateDocxFile() {
    persistMeta();

    if (typeof window.docx === 'undefined' || !window.docx.Document) {
      alert('La librería docx.js no está cargada. Verifica tu conexión a internet para cargar el script.');
      return;
    }

    const {
      Document,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType,
      Header,
      PageNumber,
      PageBreak,
      Packer
    } = window.docx;

    const currentWork = store.getCurrentWork();
    const currentMeta = currentWork.metadata || {};

    const children = [];

    // ── 1. PORTADA APA 7 (ESTUDIANTE) ───────────────────────────────
    // En APA 7 para estudiantes: Título centrado en negrita con salto de línea,
    // seguido de autor, afiliación, curso, docente y fecha.
    children.push(
      new Paragraph({ spacing: { before: 1440 } }), // Espacio superior
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.TITLE,
        spacing: { after: 480 },
        children: [
          new TextRun({
            text: currentWork.title || 'Trabajo Académico',
            bold: true,
            size: 28,
            font: 'Times New Roman'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: currentMeta.author || 'Nombre del Estudiante',
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: currentMeta.institution || 'Institución Académica',
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: currentMeta.course || 'Asignatura / Curso',
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: currentMeta.professor ? `Docente: ${currentMeta.professor}` : '',
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: currentMeta.date || new Date().toLocaleDateString('es-CO'),
            font: 'Times New Roman',
            size: 24
          })
        ]
      }),
      new Paragraph({
        children: [new PageBreak()]
      })
    );

    // ── 2. CUERPO DEL DOCUMENTO ─────────────────────────────────────
    // Repetir el título al inicio de la página 2 como Encabezado Nivel 1 (norma APA 7)
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 480 },
        children: [
          new TextRun({
            text: currentWork.title || 'Trabajo Académico',
            bold: true,
            size: 24,
            font: 'Times New Roman'
          })
        ]
      })
    );

    // Iterar secciones
    currentWork.sections.forEach(sec => {
      // Encabezado de la sección (Nivel 1 centrado en negrita)
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 240 },
          children: [
            new TextRun({
              text: sec.title,
              bold: true,
              size: 24,
              font: 'Times New Roman'
            })
          ]
        })
      );

      // Párrafos del contenido de la sección
      const rawContent = (sec.content || '').trim();
      if (!rawContent) {
        children.push(
          new Paragraph({
            indent: { firstLine: 720 },
            spacing: { line: 480 },
            children: [
              new TextRun({
                text: '[Sección pendiente de redacción]',
                italics: true,
                font: 'Times New Roman',
                size: 24
              })
            ]
          })
        );
      } else {
        const textBlocks = rawContent.split(/\n\s*\n+/);
        textBlocks.forEach(block => {
          const trimmedBlock = block.trim();
          if (!trimmedBlock) return;

          // Si es un subtítulo (### ...)
          if (trimmedBlock.startsWith('###') || trimmedBlock.startsWith('##')) {
            const subTitle = trimmedBlock.replace(/^#+\s*/, '');
            children.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 360, after: 180 },
                children: [
                  new TextRun({
                    text: subTitle,
                    bold: true,
                    size: 24,
                    font: 'Times New Roman'
                  })
                ]
              })
            );
          } else {
            // Párrafo regular con sangría de primera línea (1.27 cm = 720 twips)
            // y doble interlineado (480)
            const cleanText = trimmedBlock.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
            children.push(
              new Paragraph({
                indent: { firstLine: 720 },
                spacing: { line: 480 },
                children: [
                  new TextRun({
                    text: cleanText,
                    font: 'Times New Roman',
                    size: 24
                  })
                ]
              })
            );
          }
        });
      }
    });

    // ── 3. REFERENCIAS BIBLIOGRÁFICAS (APA 7) ────────────────────────
    children.push(
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 480 },
        children: [
          new TextRun({
            text: 'Referencias',
            bold: true,
            size: 24,
            font: 'Times New Roman'
          })
        ]
      })
    );

    if (!currentWork.citations || currentWork.citations.length === 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 480 },
          children: [
            new TextRun({
              text: 'No se registraron referencias bibliográficas.',
              italics: true,
              font: 'Times New Roman',
              size: 24
            })
          ]
        })
      );
    } else {
      // Ordenar alfabéticamente para la exportación
      const sortedCitations = [...currentWork.citations].sort((a, b) => {
        const aAuth = (a.authors || a.title || '').toLowerCase();
        const bAuth = (b.authors || b.title || '').toLowerCase();
        return aAuth.localeCompare(bAuth, 'es');
      });

      sortedCitations.forEach(cite => {
        // En APA 7 las referencias llevan sangría francesa:
        // left: 720, hanging: 720
        const cleanRefText = (cite.formattedHtml || cite.title || '').replace(/<[^>]+>/g, '');
        children.push(
          new Paragraph({
            indent: { left: 720, hanging: 720 },
            spacing: { line: 480, after: 240 },
            children: [
              new TextRun({
                text: cleanRefText,
                font: 'Times New Roman',
                size: 24
              })
            ]
          })
        );
      });
    }

    // ── Ensamblado del Documento DOCX ───────────────────────────────
    const doc = new Document({
      creator: 'ProcessAdmin - Herramienta de Redacción Académica APA 7',
      title: currentWork.title,
      description: 'Documento académico generado en ProcessAdmin con normas APA 7.',
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
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: 'Times New Roman',
                      size: 24
                    })
                  ]
                })
              ]
            })
          },
          children
        }
      ]
    });

    try {
      const blob = await Packer.toBlob(doc);
      const fileName = `${(currentWork.title || 'Trabajo_Academico').replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ]/g, '_')}_APA7.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      if (typeof window.showToast === 'function') {
        window.showToast('Documento Word (.docx) descargado con éxito.', 'success');
      }
    } catch (err) {
      console.error('Error empaquetando DOCX:', err);
      alert('Ocurrió un error al generar el archivo Word. Revisa la consola del navegador.');
    }
  }

  // Bindings de descarga
  container.querySelector('#btn-generate-docx')?.addEventListener('click', generateDocxFile);
  container.querySelector('#btn-main-download-docx')?.addEventListener('click', generateDocxFile);

  // Vista previa
  const modalPreview = container.querySelector('#modal-export-preview');
  const previewBox = container.querySelector('#preview-text-content');

  function openPreview() {
    persistMeta();
    const currentWork = store.getCurrentWork();
    let text = `${currentWork.title}\n\n`;
    currentWork.sections.forEach(s => {
      text += `--- ${s.title} ---\n${s.content || '(Sección vacía)'}\n\n`;
    });
    if (currentWork.citations && currentWork.citations.length > 0) {
      text += `--- Referencias ---\n`;
      currentWork.citations.forEach(c => {
        text += `${(c.formattedHtml || c.title || '').replace(/<[^>]+>/g, '')}\n\n`;
      });
    }

    if (previewBox && modalPreview) {
      previewBox.textContent = text;
      modalPreview.style.display = 'flex';
    }
  }

  function closePreview() {
    if (modalPreview) modalPreview.style.display = 'none';
  }

  container.querySelector('#btn-preview-export')?.addEventListener('click', openPreview);
  container.querySelector('#btn-close-preview-modal')?.addEventListener('click', closePreview);
  container.querySelector('#btn-close-preview-2')?.addEventListener('click', closePreview);

  container.querySelector('#btn-copy-preview-text')?.addEventListener('click', async () => {
    if (previewBox?.textContent) {
      await writeClipboardText(previewBox.textContent);
      if (typeof window.showToast === 'function') {
        window.showToast('Texto copiado al portapapeles.', 'success');
      }
    }
  });
}
