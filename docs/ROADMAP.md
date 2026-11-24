# ROADMAP — APMS V2

Versión: 1.0 · Fecha: 2026-11-24 · Owner: ATLAS

## Fases

| Fase | Objetivo | Gate |
|---|---|---|
| F0 | Preflight, línea base | G0 — evidence base |
| F1 | Product Discovery | G1 — PRODUCT.md, VISION.md, REQUIREMENTS.md, ROADMAP.md |
| F2 | Auditoría técnica | G2 — backlog priorizado |
| F3 | Estabilización V1 (F3) | G3 — defects críticos cerrados |
| F4 | Arquitectura sostenible (F4) | G4 — ADR justificado |
| F5 | Trazabilidad (F5) | G5 — matriz verificable |
| F6 | Modelo de datos + persistencia | G6 — integridad/migración |
| F7 | Flujo académico completo (F7) | G7 — E2E bloqueante |
| F8 | Motor académico APA (F8) | G8 — casos de referencia |
| F9 | Exportador DOCX (F9) | G9 — íntegro verificable |
| F10 | Rediseño UI (F10 via Antigravity/PRISM) | G10 — funcional, accesible |
| F11 | Seguridad/privacidad (F11) | G11 — controles verificados |
| F12 | PWA + rendimiento (F12) | G12 — instalable y estable |
| F13 | QA suite (F13) | G13 — cero defectos bloqueantes |
| F14 | CI/CD (F14) | G14 — reproducible |
| F15 | Production RC (F15) | G15 — RC validado |
| F16 | Sostenibilidad (F16) | G16 — estrategia documentada |

## V2 timeline (objetivo)

- V2.0: Flujo vertical completo + E2E bloqueante → G13.
- V2.1: Recuperación, plantillas, investigación → G14.
- V2.2: Importaciones, exportación ampliada → G16.
- V3: Sync/cuentas únicamente si hay necesidad real.

## Notas

- Backend obligatorio: NO (local-first).
- Dependencias npm prohibidas sin justificación (sin toolchain actual).
- No se active nada en producción sin autorización.
