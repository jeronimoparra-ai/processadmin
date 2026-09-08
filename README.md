# ProcessAdmin

[![Repositorio](https://img.shields.io/badge/repo-jeronimoparra--ai%2Fprocessadmin-0f172a)](https://github.com/jeronimoparra-ai/processadmin)
[![Version](https://img.shields.io/badge/version-2.0.0-2563eb)](https://github.com/jeronimoparra-ai/processadmin)
[![Licencia](https://img.shields.io/badge/licencia-MIT-475569)](https://github.com/jeronimoparra-ai/processadmin/blob/main/LICENSE)

> **ProcessAdmin ayuda a crear, redactar, revisar y entregar trabajos académicos correctamente estructurados y formateados en APA 7.**

---

## 📖 ¿Qué es ProcessAdmin?

ProcessAdmin es una aplicación web client-side diseñada para guiar al estudiante en el flujo real de creación de un trabajo académico:

1. **Inicio:** Centro de trabajo con estado actual, porcentaje de avance medible y pendientes objetivos.
2. **Planificar:** Definición de tema, objetivos, justificación y esquema estructural del documento.
3. **Redactar:** Módulo central con redacción asistida por secciones académicas, conteo de palabras y citas en texto.
4. **APA 7:** Generador estructurado de referencias bibliográficas (libros, artículos, capítulos, páginas web y tesis) y citas parentéticas/narrativas.
5. **Revisar:** Comprobaciones objetivas pre-entrega (secciones vacías, volumen de texto, concordancia de citas y checklist de formato).
6. **Exportar Word:** Generación directa de archivos `.docx` con formato APA 7 estricto (márgenes de 2.54 cm, interlineado doble, sangría de primera línea, portada institucional y sangría francesa en referencias).
7. **Mis Trabajos:** Gestor simple para listar, abrir, continuar y crear nuevos trabajos en el navegador.

---

## 🔒 Privacidad y Funcionamiento Local

- **Sin servidores:** La aplicación no cuenta con backend propio ni transmite datos a servidores externos.
- **Sin cuentas obligatorias:** No requiere registro, inicio de sesión ni contraseñas.
- **Persistencia local:** Toda la información vive en el `localStorage` del navegador del usuario con migración automática y protección contra datos corruptos.
- **Exportación real:** Generación de documentos Word en el propio navegador del usuario mediante `docx.js`.

---

## 🚀 Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/jeronimoparra-ai/processadmin.git
cd processadmin
```

Abre `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari). No requiere instalación de paquetes npm, compilación ni servidor Node.js.

---

## 🏛️ Arquitectura del Proyecto

```text
processadmin/
├── index.html                  # Punto de entrada HTML con carga modular ES6
├── og-image.png                # Imagen OpenGraph (1200x630) para SEO
├── css/
│   ├── styles.css              # Tokens de diseño, tipografía fluida y variables
│   ├── layout.css              # Estructura de la aplicación, sidebar y header
│   ├── components.css          # Tarjetas, botones, formularios y utilidades
│   └── utilities.css           # Helpers de diseño responsive
│
├── src/
│   ├── app/
│   │   ├── main.js             # Inicialización de la SPA y observadores
│   │   └── router.js           # Enrutador cliente y normalización de rutas
│   │
│   ├── core/
│   │   ├── state.js            # Única fuente de verdad reactiva (Store)
│   │   ├── storage.js          # Persistencia, manejo de cuota y migración
│   │   └── constants.js        # Tipos de trabajo, fuentes APA 7 y checklist
│   │
│   ├── modules/
│   │   ├── dashboard/          # Módulo 1: Inicio y centro de trabajo
│   │   ├── planner/            # Módulo 2: Planificar y estructurar
│   │   ├── editor/             # Módulo 3: Redactar (Módulo principal)
│   │   ├── apa/                # Módulo 4: Gestor de citas y referencias APA 7
│   │   ├── review/             # Módulo 5: Revisión objetiva pre-entrega
│   │   ├── export/             # Módulo 6: Exportador nativo DOCX (docx.js)
│   │   ├── documents/          # Módulo 7: Mis Trabajos (gestor de documentos)
│   │   └── info/               # Legal y Acerca del proyecto
│   │
│   ├── components/
│   │   └── icons/
│   │       └── icons.js        # Iconografía SVG inline unificada y accesible
│   │
│   └── utils/
│       └── helpers.js          # Utilidades puras (escape, conteos, portapapeles)
│
└── LICENSE                     # Licencia MIT
```

---

## 📦 Dependencias

| Recurso | Tipo | Propósito |
|---|---|---|
| **docx.js (v8.5.0)** | CDN / UMD | Generador oficial de documentos `.docx` con especificación APA 7 |
| **Google Fonts** | Tipografía | Plus Jakarta Sans, Lora (Serif académica) y JetBrains Mono |
| **Vanilla JS (ES6)** | Nativo | Arquitectura de módulos nativos sin bundlers ni frameworks pesados |

---

## ⚖️ Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

**Autor:** Andrés Jeronimo Parra  
**Afiliación:** Institución Universitaria Digital de Antioquia  
**Contacto:** andresjeroparra@gmail.com  
