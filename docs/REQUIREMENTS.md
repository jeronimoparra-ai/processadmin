# Requisitos funcionales y no funcionales — APMS V2

Version 1.0 · Base: a5a9b45 · Owner: ATLAS (consultores FORGE/SENTINEL)

## RF — Requisitos funcionales (mínimo V2.0)

### Academic Workspace (F7)
- CRUD de Workspace (gestión de múltiples proyectos).
- Filtros y estados vacíos útiles.
- Continuidad del trabajo (acceso rápido a proyecto activo).

### Project Planner (F7)
- Creación de AcademicProject, Course, Document, Section.
- Instrucciones del docente, requisitos, objetivos, estructura de secciones.
- Fechas, planificación (Gantt-lite), seguimiento del avance.

### Research Library (F7)
- Fuentes bibliográficas estructuradas (tipos, DOI/ISBN, metadatos).
- Notas de investigación y citas textuales.
- Archivos adjuntos (restringidos al alcance: solo adjuntos approbados del proyecto).

### Writing Studio (F7)
- Editor estructurado: encabezados, párrafos, listas, tablas, figuras.
- Citas vinculadas a fuentes por ID estable.
- Contadores por sección. Modo concentración. Historial.
- Estados de guardado: standby / saving / saved / offline.

### Review Center (F7)
- Detección de requisitos pendientes vs. secciones presentes.
- Validación bibliográfica consistente.
- Evidencia y navegación a errores concretos.

### Publishing Studio (F7)
- Vista previa de documento completo.
- Exportación DOCX de la instantánea completa (sin estado activo).
- Registro de exportaciones con hash de verificación.

### Academic Engine (F8)
- APA 7 como estándar inicial (con fuente oficial verificada, CSL/citeproc-js opcional).
- Reglas por tipo de publicación, admin (3 estilos).
- Citas narrativas y parentéticas, ordenamiento.

### Security & Privacy (F11) — OWASP ASVS relevantes
- Sanitización universal, CSP, no CDN runtime, versions fijadas.
- Schema validation Zod, archivos DOCX/ZIP validados (XML OOXML).
- Exportación única en path file:// // ExportRecord.

## NFR — Requisitos no funcionales

- NFR-1 Local-first: funciona sin red.
- NFR-2 Tamaño bundle < 500 KB gz.
- NFR-3 IndexedDB (Dexie) máximo 1M tokens de documentación.
- NFR-4 Sin telemetría obligatoria.
- NFR-5 Sin servicios de IA obligatorios.
- NFR-6 WCAG 2.2 AA (objetivo, no bloqueante).
- NFR-7 Compatibilidad: Chromium, Firefox, Edge, Safari móvil.
- NFR-8 Sin network activity: >99% requests local.

## Riesgos identificados (F2)

> Ver ~/Orca-Nexus/evidence/processadmin/F2_AUDIT.md.
