# ProcessAdmin — Product Design Document (APMS)

Versión 1.0 — Proyecto "Renaissance"
Fecha: 2026-11-24 · HEAD: a5a9b45

## 1. Problema central

El trabajo académico actual se fragmenta entre herramientas desconectadas: planificadores de tareas, organizadores de ideas, redactores, gestores de rúbricas y exportadores. Existen productos integrados, pero requieren cuentas, descargas o plataformas remotas que lo impiden a university students with limited connectivity and privacy requirements.

ProcessAdmin es un **Academic Process Management System (APMS)**: un espacio académico integral para comprender, planificar, investigar, redactar, validar, versionar y entregar trabajos académicos.

## 2. Propuesta de valor

> Un espacio académico integral para comprender, planificar, investigar, redactar, validar, versionar y entregar trabajos académicos, manteniendo el control sobre los datos, las fuentes y el proceso intelectual.

Llave: **privacidad por diseño** (datos locales, sin cuentas, sin rastreo obligatorio), **integridad documental** (versionado, trazabilidad), **validación académica explicable**.

## 3. Principios fundamentales

1. El proyecto académico es la entidad central del sistema.
2. Las funcionalidades deben integrarse en un flujo coherente.
3. La integridad documental tiene prioridad sobre las funcionalidades decorativas.
4. La privacidad debe preservarse por diseño.
5. El sistema debe funcionar sin depender obligatoriamente de servicios de IA.
6. Las validaciones académicas deben ser explicables y verificables.
7. La arquitectura debe admitir crecimiento sin reconstrucciones constantes.
8. El usuario debe conservar el control de sus documentos.

## 4. Público objetivo inicial

- Estudiantes universitarios (familias de productos libres, sin suscripción obligatoria).
- Estudiantes técnicos y tecnológicos.
- Estudiantes de formación profesional.
- Investigadores principiantes (rectores para integrar rúbricas de tesis).

Contexto de validación: necesidades reales de estudiantes de instituciones colombianas como IU Digital de Antioquia y SENA (sin requisitos institucionales oficiales asumidos sin documentación).

## 5. Contraste — lo que ProcessAdmin NO será

- No será un LMS (no gestiona matrícula ni calificaciones).
- No será una réplica de Word ni un ERP educativo.
- No incluirá funcionalidades disconnectas.

## 6. Flujo académico clave (V2)

```
Planificación → Investigación → Redacción → Validación → Exportación → Archivo
  (Project Planner)  (Research Library)  (Writing Studio)  (Review Center)  (Publishing Studio) (Archive)
```

## 7. Restricciones del producto

- Local-first (IndexedDB, sin backend obligatorio).
- Sin descargas obligatorias; si se usa PWA, debe ser instalable y offline.
- Arquitectura modular (dominio/aplicación/presentación/persistencia/adaptadores).

## 8. Entregables de F1

[docs/VISION.md](VISION.md) · [docs/REQUIREMENTS.md](REQUIREMENTS.md) · [docs/ROADMAP.md](ROADMAP.md)
