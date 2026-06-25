# ProcessAdmin

[![Repositorio](https://img.shields.io/badge/repo-jeronimoparra--ai%2Fprocessadmin-1c1b18)](https://github.com/jeronimoparra-ai/processadmin)
[![Version](https://img.shields.io/badge/version-1.0.0-c9a96e)](https://github.com/jeronimoparra-ai/processadmin)
[![Licencia](https://img.shields.io/badge/licencia-MIT-5c5650)](https://github.com/jeronimoparra-ai/processadmin/blob/main/LICENSE)

```text
 ____                                      _       _           _       
|  _ \ _ __ ___   ___ ___  ___ ___       / \   __| |_ __ ___ (_)_ __  
| |_) | '__/ _ \ / __/ _ \/ __/ __|____ / _ \ / _` | '_ ` _ \| | '_ \ 
|  __/| | | (_) | (_|  __/\__ \__ \___ / ___ \ (_| | | | | | | | | | |
|_|   |_|  \___/ \___\___||___/___/   /_/   \_\__,_|_| |_| |_|_|_| |_|
```

Redacción académica y APA 7 desde el navegador.

## ¿Qué es ProcessAdmin?

ProcessAdmin es una aplicación web local para planear, redactar, validar y exportar trabajos académicos con normas APA 7. Funciona abriendo `index.html` en el navegador y guarda el contenido en `localStorage`, sin cuentas, servidores propios ni rastreo.

Módulos actuales:

- Panel de Control
- Redactor asistido
- Gestor APA 7
- Evaluador de Rúbrica
- Organizador de Ideas
- Checklist Inteligente
- Historial
- Exportación a Word
- Acerca del autor

## Inicio Rápido

```bash
git clone https://github.com/jeronimoparra-ai/processadmin.git
cd processadmin
```

Abre `index.html` directamente en un navegador moderno. No requiere instalación de paquetes ni servidor local.

## Arquitectura

```text
processadmin/
├── index.html
├── css/
│   ├── styles.css
│   ├── layout.css
│   ├── components.css
│   └── utilities.css
├── js/
│   ├── config.js
│   ├── app.js
│   ├── components/
│   │   ├── header.js
│   │   ├── sidebar.js
│   │   └── uiComponents.js
│   ├── services/
│   │   ├── apa.js
│   │   ├── export.js
│   │   └── storage.js
│   ├── state/
│   │   ├── persistence.js
│   │   └── store.js
│   ├── utils/
│   │   ├── helpers.js
│   │   └── icons.js
│   └── views/
│       ├── acerca.js
│       ├── apa.js
│       ├── checklist.js
│       ├── exportador.js
│       ├── historial.js
│       ├── legal.js
│       ├── organizador.js
│       ├── panel.js
│       ├── redactor.js
│       └── rubrica.js
├── assets/
│   ├── formato-ejemplo.json
│   ├── word-template-ejemplo.docx
│   └── icons/
├── og-image.html
├── .gitignore
├── LICENSE
└── README.md
```

Dependencias CDN:

| Librería | Propósito | Versión |
|---|---|---|
| Tailwind CSS | Estilos utilitarios | CDN |
| Chart.js | Gráfico de rúbrica | CDN |
| docx.js | Exportación Word real | 8.5.0 |
| Plus Jakarta Sans | Tipografía sans | Google Fonts |
| Lora | Tipografía serif | Google Fonts |
| JetBrains Mono | Tipografía mono | Google Fonts |

## Paleta de Diseño

| Rol | Color | HEX |
|---|---|---|
| Fondo | Beige cálido | `#faf9f6` |
| Sidebar | Negro editorial | `#1c1b18` |
| Acento | Oro académico | `#c9a96e` |
| Texto principal | Casi negro | `#1c1b18` |
| Texto secundario | Gris cálido | `#5c5650` |

## Hoja de Ruta

- [x] Exportación a `.docx` con formato APA 7 completo
- [x] Sistema de diseño con tokens CSS (`--dp-*`)
- [x] Animaciones CSS accesibles con prefers-reduced-motion
- [x] Sección "Acerca del autor"
- [x] Schema.org SoftwareApplication
- [ ] Plantillas por tipo de documento (ensayo, informe, proyecto)
- [ ] Soporte multiidioma (ES / EN)
- [ ] Modo oscuro completo
- [ ] Verificador de plagio básico

## Privacidad

ProcessAdmin guarda la información en el navegador mediante `localStorage`. Si borras los datos del sitio, también se elimina el contenido guardado localmente.

## Footer

[![GitHub](https://img.shields.io/badge/GitHub-jeronimoparra--ai%2Fprocessadmin-1c1b18)](https://github.com/jeronimoparra-ai/processadmin)
[![Word](https://img.shields.io/badge/exportacion-.docx-c9a96e)](https://github.com/jeronimoparra-ai/processadmin)

ProcessAdmin v1.0.0 · jeronimoparra-ai/processadmin  
Construido para la excelencia académica · Sin servidores · Sin rastros  
andresjeroparra@gmail.com
