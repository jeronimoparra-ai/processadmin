# ProcessAdmin

ProcessAdmin es una herramienta web para redactar, organizar y exportar trabajos académicos en APA 7. Funciona directamente en el navegador y guarda la información en `localStorage`, sin cuentas ni servidor propio.

## Qué hace

- Ayuda a redactar borradores académicos con orientación por secciones.
- Organiza ideas, objetivos y estructura del trabajo.
- Genera y revisa citas y referencias en formato APA 7.
- Ofrece checklist, rúbrica y seguimiento de avance.
- Exporta el contenido a Word desde el propio navegador.

## Identidad y confianza

- Nombre público del proyecto: ProcessAdmin.
- Autoría visible: equipo editorial de ProcessAdmin.
- Contacto sugerido: [andresjeroparra@gmail.com](mailto:andresjeroparra@gmail.com).
- Fecha de actualización visible: 29 de mayo de 2026.
- Alcance: apoyo de redacción y organización, no una garantía de calificación ni de aceptación académica.

## Privacidad

ProcessAdmin guarda el contenido localmente en el navegador mediante `localStorage`.

- No requiere registro para usar las herramientas visibles.
- No envía datos a un servidor propio desde esta versión.
- Si borras los datos del sitio en el navegador, se elimina también la información guardada localmente.

## Términos de uso

- El contenido generado por la herramienta debe revisarse antes de entregarse.
- La persona usuaria es responsable de verificar fuentes, citas y requisitos institucionales.
- Las plantillas y exportaciones dependen de los datos introducidos en la interfaz.
- El sitio se ofrece como apoyo técnico y no sustituye la revisión docente o editorial.

## Interfaz

La aplicación se organiza en estas vistas:

- Panel de control: estado general, estructura y accesos rápidos.
- Redactor asistido: redacción guiada por secciones y conectores.
- Gestor APA 7: citas en texto, referencias y validación básica.
- Evaluador de rúbrica: revisión orientativa de criterios.
- Organizador de ideas: estructura de planificación del trabajo.
- Checklist inteligente: verificación de requisitos visibles.
- Historial de documentos: consulta de exportaciones guardadas.
- Exportación a Word: descarga del contenido en formato compatible.
- Información legal: privacidad, términos y contacto.

## Inicio rápido

1. Abre `index.html` en un navegador moderno.
2. Empieza por el Panel de control para revisar el estado del documento.
3. Usa el Redactor asistido para redactar el contenido principal.
4. Completa el Gestor APA 7 y el checklist.
5. Exporta a Word cuando tengas una versión lista para revisar.

## Estructura del proyecto

```text
index.html
css/
js/
assets/
LICENSE
README.md
```

## Notas técnicas

- SPA sin framework.
- Lógica de interfaz en JavaScript nativo.
- Estilos globales en `css/styles.css` y componentes en `css/components.css`.
- Persistencia local con `localStorage`.
- Exportación a Word mediante generación local en el navegador.

## Soporte

Si vas a publicar el proyecto con una cuenta o correo real, reemplaza el contacto sugerido por el canal oficial del sitio.

Última actualización: 29 de mayo de 2026.
