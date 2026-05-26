# 📝 DocPro™ - Generador Profesional APA 7

<div align="center">

![DocPro Logo](https://img.shields.io/badge/DocPro%E2%84%A2-Professional%20APA%207-blue)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-Active-success)

**Herramienta profesional para diseñar documentos académicos de calidad con normas APA 7ª edición**

[Características](#características) • [Uso](#uso) • [Estructura](#estructura) • [Tecnología](#tecnología)

</div>

---

## 🎯 Descripción

**DocPro™** es una aplicación web moderna e interactiva diseñada para ayudarte a crear documentos académicos de calidad siguiendo estrictamente las normas **APA 7ª edición**. Combina elegancia visual con funcionalidad avanzada para mejorar tu experiencia de redacción y citación.

### Enfoque Principal
- ✅ **Diseño de documentos profesionales** según estándares académicos
- ✅ **Generación automática de citas APA 7**
- ✅ **Seguimiento de progreso en tiempo real**
- ✅ **Interfaz elegante e intuitiva**
- ✅ **Evaluación mediante rúbrica integrada**

---

## ✨ Características

### 📊 Panel de Control
- Estadísticas en tiempo real (fecha entrega, progreso, puntuación)
- Guía de inicio con 3 pasos claros
- Estructura de documento con 12 checklist items
- Avance por sección independiente (Planeación, Organización, Dirección, Control)
- Métricas del proyecto (palabras, tiempo de trabajo, citas, evaluaciones)

### ✍️ Redactor Premium
- 4 acordeones educativos con contenido detallado por sección
- Editor de texto con 5 campos independientes
- Contador de palabras en tiempo real
- Guardado automático en localStorage
- Validación de completitud
- Tips y recomendaciones contextuales

### 📚 Gestor APA 7ª Edición
- Formulario completo para generación de citas
- Campos: Autor/Institución, Año, Título, Editorial, URL
- Validación avanzada de datos
- Historial de referencias generadas
- Checklist de calidad (12 criterios)
- Feedback visual de completitud

### 📈 Evaluador de Rúbrica
- 4 sliders dinámicos para evaluación
- Cálculo automático de puntuación (máx. 100 pts)
- Visualización con gráfico de donas
- Descriptores de desempeño
- Historial de simulaciones

### 🔒 Características de Seguridad
- 100% datos locales (localStorage)
- Privacidad garantizada
- Sin conexión a servidores externos
- Datos persistentes en el navegador

---

## 🚀 Uso

### Instalación
1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tuusuario/docpro.git
   cd docpro
   ```

2. **Abre en el navegador**
   - Simplemente abre el archivo `index.html` en tu navegador favorito
   - No requiere servidor, funciona completamente en el cliente

### Flujo de Trabajo

1. **📊 Comienza en el Panel**
   - Revisa la guía de inicio
   - Verifica los requisitos de estructura

2. **✍️ Redacta en el Redactor Premium**
   - Completa los 5 campos principales
   - Monitorea el progreso de palabras
   - El sistema guarda automáticamente

3. **📚 Cita con el Gestor APA 7**
   - Genera citas automáticamente
   - Crea tu lista de referencias
   - Verifica el checklist de calidad

4. **📈 Evalúa con la Rúbrica**
   - Simula tu puntuación
   - Mejora antes de entregar
   - Consulta el historial de evaluaciones

---

## 📁 Estructura

```
docpro/
├── index.html          # Aplicación principal (SPA)
├── css/
│   └── styles.css      # Estilos personalizados y variables CSS
├── .gitignore          # Archivos ignorados por Git
├── README.md           # Este archivo
└── LICENSE             # Licencia MIT
```

### Componentes Principales
- **Single Page Application (SPA)**: Toda la lógica en un archivo HTML
- **Sin dependencias externas**: Usa CDN para Tailwind CSS y Chart.js
- **localStorage API**: Persistencia de datos
- **Responsive Design**: Funciona en desktop, tablet y mobile

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario**: Azul (#3b82f6)
- **Secundario**: Púrpura (#7c3aed)
- **Acentos**: Rosa (#ec4899), Verde (#10b981)
- **Fondo Sidebar**: Slate oscuro (#0f172a)

### Tipografía
- **Fuente**: Plus Jakarta Sans (Google Fonts)
- **Pesos**: 400, 500, 600, 700

### Componentes UI
- Tarjetas con sombras y bordes redondeados
- Gradientes modernos
- Animaciones suaves (fade, slide)
- Efectos hover interactivos

---

## 💻 Tecnología

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Tailwind CSS + Custom CSS
- **JavaScript Vanilla**: Sin frameworks
- **Responsive**: Mobile-first design

### Librerías
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Visualización de datos
- **Plus Jakarta Sans**: Tipografía Google Fonts

### Almacenamiento
- **localStorage API**: Persistencia de datos
- **Debounced auto-save**: Guardado automático (800ms)

---

## 🎓 Normas APA 7ª Edición

DocPro™ implementa completamente los requisitos de citación APA 7:

### Elementos de Citación Generados
- Autor/Institución
- Año de publicación
- Título completo
- Editorial/Revista
- URL (para fuentes en línea)

### Requisitos de Documento
- Portada completa
- Introducción (mín. 200 palabras)
- Misión y Visión
- Matriz DOFA
- Organigrama
- Análisis de liderazgo
- Indicadores de gestión (KPIs)
- Conclusiones (mín. 150 palabras)
- Referencias en APA 7
- Entrega antes de la fecha límite

---

## 🔐 Privacidad y Seguridad

✅ **100% Local**: Todos los datos se guardan en tu navegador
✅ **Sin conexión externa**: No requiere servidor
✅ **Datos privados**: Nadie accede a tu información
✅ **Persistente**: Los datos se mantienen entre sesiones
✅ **Auto-guardado**: Se actualiza cada 800ms

---

## 📋 Requisitos

- **Navegador moderno**: Chrome, Firefox, Safari, Edge
- **JavaScript habilitado**: Necesario para funcionamiento
- **Storage local**: Navegador debe soportar localStorage

---

## 🛠️ Desarrollo

### Estructura de Código
```javascript
// State management
const state = {
  activeView: 'panel',
  currentScore: 0,
  generatedCitations: [],
  // ... más propiedades
}

// Main navigation
function navigate(viewId) { /* ... */ }

// View builders
function buildPanel() { /* ... */ }
function buildRedactor() { /* ... */ }
function buildSimulador() { /* ... */ }
function buildAPA() { /* ... */ }

// Utilities
function saveField(key, value) { /* Auto-save */ }
function updateWordCount(fieldId) { /* Real-time counting */ }
function updateSectionCompleteness() { /* Progress tracking */ }
```

### Extender la Aplicación

Para agregar nuevas funcionalidades:

1. **Agregar vista nueva**
   ```javascript
   function buildNewView() {
     const html = `...`; // Tu contenido HTML
     document.getElementById('workspace').innerHTML = html;
     // Agregar event listeners
   }
   ```

2. **Actualizar navegación**
   - Agregar botón en sidebar
   - Actualizar switch en función navigate()

3. **Guardar datos**
   ```javascript
   saveField('tusCampo', valor); // Auto-guardado en localStorage
   ```

---

## 📝 Licencia

Este proyecto está bajo licencia **MIT**. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ para mejorar la calidad de documentos académicos

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🐛 Reportar Problemas

¿Encontraste un bug? Por favor abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducirlo
- Navegador y versión
- Screenshots si es posible

---

## 📞 Soporte

Para preguntas o soporte:
- Abre un issue en GitHub
- Consulta la documentación en el panel de ayuda de la aplicación

---

<div align="center">

**DocPro™ v1.0.0** | Hecho con 💙 para la excelencia académica

![GitHub last commit](https://img.shields.io/github/last-commit/tuusuario/docpro)
![GitHub stars](https://img.shields.io/github/stars/tuusuario/docpro?style=social)

</div>
