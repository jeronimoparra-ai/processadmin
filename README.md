<div align="center">

<br/>

```
██████╗  ██████╗  ██████╗██████╗ ██████╗  ██████╗ ™
██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗██╔═══██╗
██║  ██║██║   ██║██║     ██████╔╝██████╔╝██║   ██║
██║  ██║██║   ██║██║     ██╔═══╝ ██╔══██╗██║   ██║
██████╔╝╚██████╔╝╚██████╗██║     ██║  ██║╚██████╔╝
╚═════╝  ╚═════╝  ╚═════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
```

### Generador Profesional · APA 7ª Edición

<br/>

[![Version](https://img.shields.io/badge/versión-1.0.0-0f172a?style=flat-square&labelColor=3b82f6)](https://github.com/tuusuario/docpro)
[![APA](https://img.shields.io/badge/norma-APA%207-0f172a?style=flat-square&labelColor=7c3aed)](https://apastyle.apa.org/)
[![License](https://img.shields.io/badge/licencia-MIT-0f172a?style=flat-square&labelColor=10b981)](LICENSE)
[![Status](https://img.shields.io/badge/estado-activo-0f172a?style=flat-square&labelColor=ec4899)](https://github.com/tuusuario/docpro)
[![No deps](https://img.shields.io/badge/dependencias-cero-0f172a?style=flat-square&labelColor=f59e0b)](https://github.com/tuusuario/docpro)

<br/>

> *Diseña documentos académicos de alta calidad, genera citas APA 7 automáticamente*  
> *y evalúa tu trabajo — sin salir del navegador.*

<br/>

[Inicio rápido](#-inicio-rápido) · [Características](#-características) · [Arquitectura](#-arquitectura) · [APA 7](#-normas-apa-7) · [Contribuir](#-contribuir)

<br/>
<br/>

</div>

---

## ¿Qué es DocPro™?

**DocPro™** es una aplicación web de página única (**SPA**) construida en HTML5, CSS3 y JavaScript puro sin frameworks, sin instalaciones, sin conexión a servidores. Está diseñada específicamente para estudiantes e investigadores que necesitan producir documentos académicos rigurosos bajo las normas **APA 7ª edición**.

Combina cuatro módulos especializados en una interfaz unificada: redacción asistida, gestión de citas, seguimiento de progreso y evaluación con rúbrica.

---

## ✦ Características

### 📊 Panel de Control
El punto de partida. Muestra el estado global del proyecto en tiempo real.

- Estadísticas del documento (fecha de entrega, progreso general, puntuación estimada)
- Guía de inicio en 3 pasos para usuarios nuevos
- Checklist de estructura con 12 ítems verificables
- Métricas acumuladas: palabras escritas, tiempo de trabajo, citas generadas, evaluaciones realizadas
- Avance segmentado por sección: **Planeación → Organización → Dirección → Control**

### ✍️ Redactor Premium
El núcleo de escritura.

- 4 acordeones educativos con orientación detallada por sección
- 5 campos de texto independientes con validación de completitud
- Contador de palabras en tiempo real
- Guardado automático con debounce de 800 ms (via `localStorage`)
- Tips contextuales y recomendaciones de calidad

### 📚 Gestor APA 7
Generación de referencias sin errores.

- Formulario inteligente: Autor/Institución, Año, Título, Editorial, URL
- Validación avanzada de campos obligatorios
- Historial de referencias generadas en sesión
- Checklist de calidad con **12 criterios APA 7**
- Retroalimentación visual de completitud por referencia

### 📈 Evaluador de Rúbrica
Simula tu calificación antes de entregar.

- 4 sliders dinámicos por dimensión de evaluación
- Cálculo automático de puntuación sobre **100 puntos**
- Visualización con **gráfico de donas** (Chart.js)
- Descriptores de desempeño por nivel
- Historial de simulaciones comparativas

---

## 🚀 Inicio Rápido

No requiere instalación ni servidor.

```bash
# 1. Clona el repositorio
git clone https://github.com/tuusuario/docpro.git

# 2. Entra al directorio
cd docpro

# 3. Abre directamente en el navegador
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

> ✅ Compatible con Chrome, Firefox, Safari y Edge en sus versiones actuales.  
> ⚠️ Requiere JavaScript habilitado y soporte de `localStorage`.

### Flujo de trabajo recomendado

```
┌─────────────┐     ┌───────────────┐     ┌───────────────┐     ┌────────────────┐
│  1. PANEL   │────▶│ 2. REDACTOR   │────▶│  3. GESTOR    │────▶│ 4. EVALUADOR   │
│             │     │               │     │     APA 7     │     │   DE RÚBRICA   │
│ Revisa los  │     │ Completa los  │     │ Genera y      │     │ Simula tu      │
│ requisitos  │     │ 5 campos del  │     │ verifica tus  │     │ puntuación     │
│ y checklist │     │ documento     │     │ referencias   │     │ final          │
└─────────────┘     └───────────────┘     └───────────────┘     └────────────────┘
```

---

## 🏗 Arquitectura

```
docpro/
├── index.html          ← SPA principal (toda la lógica vive aquí)
├── css/
│   └── styles.css      ← Variables CSS, animaciones y estilos personalizados
├── .gitignore
├── README.md
└── LICENSE
```

DocPro™ no tiene dependencias instaladas localmente. Todo se resuelve vía CDN en el `<head>`:

| Librería | Propósito | Carga |
|---|---|---|
| **Tailwind CSS** | Utilidades de estilo | CDN |
| **Chart.js** | Gráfico de rúbrica | CDN |
| **Plus Jakarta Sans** | Tipografía | Google Fonts |

### Gestión de estado

```javascript
// Estado global centralizado
const state = {
  activeView: 'panel',       // Vista activa en la SPA
  currentScore: 0,           // Puntuación de la rúbrica
  generatedCitations: [],    // Historial de referencias APA
  wordCounts: {},            // Conteo por sección
  sectionProgress: {},       // Porcentaje de completitud
}

// Persistencia automática — sin backend
function saveField(key, value) {
  localStorage.setItem(`docpro_${key}`, value);
}

// Navegación entre vistas
function navigate(viewId) { /* Renderiza la vista solicitada */ }
```

### Paleta de diseño

| Rol | Color | HEX |
|---|---|---|
| Primario | Azul | `#3b82f6` |
| Secundario | Púrpura | `#7c3aed` |
| Acento A | Rosa | `#ec4899` |
| Acento B | Verde esmeralda | `#10b981` |
| Fondo sidebar | Slate profundo | `#0f172a` |

---

## 📖 Normas APA 7

DocPro™ implementa los requisitos de citación y estructura de la **7ª edición** del Manual de Publicaciones de la APA.

### Elementos de referencia generados

```
Autor, A. A., & Autor, B. B. (Año). Título de la obra. Editorial. https://doi.org/xxxxx
```

Campos cubiertos: `Autor/Institución` · `Año` · `Título` · `Editorial/Revista` · `URL/DOI`

### Estructura de documento requerida

| # | Sección | Mínimo |
|---|---|---|
| 01 | Portada | Completa |
| 02 | Introducción | 200 palabras |
| 03 | Misión y Visión | — |
| 04 | Matriz DOFA | — |
| 05 | Organigrama | — |
| 06 | Análisis de liderazgo | — |
| 07 | Indicadores de gestión (KPIs) | — |
| 08 | Conclusiones | 150 palabras |
| 09 | Referencias APA 7 | Formato correcto |
| 10 | Entrega | Antes de fecha límite |

---

## 🔒 Privacidad

DocPro™ opera completamente en el navegador del usuario. No envía datos a ningún servidor.

```
Usuario → Navegador → localStorage
                ↑
        Ningún dato sale
        de este entorno
```

- ✅ Sin cuentas ni registro
- ✅ Sin telemetría ni analytics
- ✅ Datos persistentes entre sesiones locales
- ✅ Eliminación limpia vaciando el `localStorage` del sitio

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. El proyecto sigue un modelo de desarrollo simple dado que no tiene dependencias de build.

```bash
# 1. Fork y clona
git clone https://github.com/tuusuario/docpro.git

# 2. Crea una rama descriptiva
git checkout -b feat/nombre-de-la-funcionalidad

# 3. Haz tus cambios y confirma
git commit -m "feat: descripción clara del cambio"

# 4. Abre un Pull Request con:
#    - Descripción del problema que resuelve
#    - Screenshots si hay cambios visuales
#    - Navegadores probados
```

### Extender la aplicación

```javascript
// Agregar una nueva vista
function buildMiVista() {
  document.getElementById('workspace').innerHTML = `
    <!-- Tu HTML aquí -->
  `;
  // Registrar event listeners después del render
}

// Registrar en el navegador principal
function navigate(viewId) {
  switch (viewId) {
    case 'mi-vista': buildMiVista(); break;
    // ... vistas existentes
  }
}
```

### Reportar un bug

Abre un issue en GitHub con:

- [ ] Descripción clara del comportamiento inesperado
- [ ] Pasos para reproducirlo
- [ ] Navegador y versión (`Chrome 124`, `Firefox 125`, etc.)
- [ ] Screenshot o grabación de pantalla si aplica

---

## 📋 Hoja de ruta

- [ ] Exportación a `.docx` con formato APA preconfigurado
- [ ] Plantillas por tipo de documento (ensayo, informe, proyecto)
- [ ] Soporte multiidioma (ES / EN)
- [ ] Modo oscuro completo
- [ ] Verificador de plagio básico (comparación local)

---

## 📄 Licencia

Distribuido bajo licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para los términos completos.

---

<div align="center">

<br/>

**DocPro™ v1.0.0**

Construido para la excelencia académica · Sin servidores · Sin rastros

<br/>

[![GitHub stars](https://img.shields.io/github/stars/tuusuario/docpro?style=flat-square&color=3b82f6)](https://github.com/tuusuario/docpro/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/tuusuario/docpro?style=flat-square&color=ec4899)](https://github.com/tuusuario/docpro/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/tuusuario/docpro?style=flat-square&color=10b981)](https://github.com/tuusuario/docpro/commits)

<br/>

</div>
