# SECURITY.md — ProcessAdmin (APMS V1)

> **Documento de política de seguridad y privacidad**  
> **Auditoría independiente:** SENTINEL (T-F2S)  
> **Task ID:** task_be24567ad87a  
> **Dispatch ID:** ctx_f9d349557bf4  
> **Actualización vigente:** 2026-11-24

---

## 📋 1. Alcance

Este documento cubre:

- La aplicación **ProcessAdmin** (HTML/CSS/JavaScript vanilla, local-first, estática)
- El almacenamiento local (`localStorage`), las importaciones de archivos y las dependencias de red (CDN)
- Los principios de privacidad y los riesgos documentados
- El proceso de reportar y corregir incidentes
- Cumplimiento con estándares OWASP ASVS

**No cubre:**
- Servidores propios (no existen)
- Cuentas de usuario (no hay autenticación)
- Telemetría o tracking (cero telemetría)
- Despliegues externos no autorizados

---

## 🏗️ 2. Modelo de Datos y Confianza

### Arquitectura
- **Tipo:** Aplicación web estática (Single Page Application)
- **Almacenamiento:** `localStorage` del navegador
- **Comunicaciones:** Solo peticiones a CDN (jsDelivr, Google Fonts)
- **Sin servidor:** 100% cliente, sin backend

### Flujo de Datos
```
Usuario → Navegador → ProcessAdmin (HTML/JS/CSS) → localStorage
                              ↓
                        CDN Dependencies
                        (Chart.js, JSZip, docx.js)
```

### Principios de Confianza
- ✅ Procesos escriben únicamente a `localStorage` del mismo origen
- ✅ No se envía información a servidores
- ✅ No hay cuentas ni telemetría
- ✅ Los datos personales son de propiedad del usuario
- ⚠️ Los datos se guardan en **texto plano** (no cifrados)
- ⚠️ **Sin CSP implementado** (vulnerable a XSS)
- ⚠️ **SRI incompleto** (hashes truncados)

### Clasificación de Datos

| Tipo de Dato | Sensibilidad | Ubicación | Protección |
|--------------|--------------|-----------|------------|
| Nombre del estudiante | Alta | localStorage | Texto plano |
| Código estudiantil | Alta | localStorage | Texto plano |
| Institución | Media | localStorage | Texto plano |
| Contenido académico | Media | localStorage | Texto plano |
| Referencias APA | Baja | localStorage | Texto plano |
| Plantillas DOCX | Baja | localStorage | Texto plano (Base64) |
| Historial de exportación | Baja | localStorage | Texto plano |

---

## 🛡️ 3. Controles de Seguridad Aplicados

### ✅ Controles Implementados

| ID | Control | Estado | Archivo | Cobertura |
|----|---------|--------|--------|-----------|
| **C1.01** | Escapado de datos en renderizados (`escapeHtml`) | ✅ Implementado | helpers.js:15 | Alto |
| **C1.02** | Escapado XML (`xmlEscape`) | ✅ Implementado | helpers.js:22 | Alto |
| **C1.03** | Validación de tipo de almacenamiento | ✅ Implementado | persistence.js:10 | Alto |
| **C1.04** | Absorción de errores en escritura a almacenamiento | ✅ Implementado | persistence.js:50 | Alto |
| **C1.05** | Aislamiento del estado global (`window.state`) | ✅ Implementado | store.js | Alto |
| **C1.06** | Aislamiento por proyecto | ✅ Implementado | persistence.js:25 | Alto |
| **C1.07** | Wrappers seguros de localStorage | ✅ Implementado | persistence.js | Alto |
| **C1.08** | Fallback para CDN (Chart.js) | ⚠️ Parcial | index.html | Medio |

### 🔧 Controles en Desarrollo (Recomendaciones Priorizadas)

| ID | Control | Estado | Prioridad | ETA |
|----|---------|--------|-----------|-----|
| **C2.01** | Content Security Policy (CSP) | ❌ Falta | P1 | Inmediato |
| **C2.02** | Subresource Integrity (SRI) completo | ❌ Falta | P1 | Inmediato |
| **C2.03** | Sanitización completa de innerHTML | ❌ Falta | P1 | 3-5 días |
| **C2.04** | Validación robusta de archivos | ❌ Falta | P2 | 2-3 días |
| **C2.05** | Límites de almacenamiento | ❌ Falta | P2 | 2 días |
| **C2.06** | Esquemas de validación (Zod) | ❌ Falta | P2 | 2-3 días |
| **C2.07** | Cifrado de datos sensibles | ❌ Falta | P3 | 3-5 días |
| **C2.08** | Detección de modo file:// | ❌ Falta | P3 | 1 día |
| **C2.09** | Backup automático | ❌ Falta | P4 | 1 día |
| **C2.10** | Dependencias locales completas | ❌ Falta | P4 | 1 día |

---

## 🚨 4. Hallazgos de Seguridad Conocidos

### 🔴 Críticos (P1) - Deben corregirse ANTES de despliegue

| ID | Severidad | Título | Descripción | Estado | CVSS | CWE | OWASP |
|----|-----------|--------|-------------|--------|------|-----|-------|
| **CS-01** | P1 | Sin Content Security Policy | La aplicación no implementa CSP, dejando expuesta a XSS y otros ataques | ❌ Faltante | 8.1 | CWE-693 | V12.1, A03:2021 |
| **CS-02** | P1 | SRI incompleto/incorrecto | Hashes SRI truncados (71 chars en lugar de 96) para dependencias CDN | ❌ Faltante | 7.5 | CWE-829 | V12.3, A06:2021 |

### 🟡 Altos (P2) - Deben corregirse PRONTO

| ID | Severidad | Título | Descripción | Estado | CVSS | CWE | OWASP |
|----|-----------|--------|-------------|--------|------|-----|-------|
| **CS-03** | P2 | Uso de innerHTML sin sanitización | 42+ instancias de innerHTML sin sanitización consistente | ⚠️ Parcial | 7.2 | CWE-79 | V5.3, V6.2, A03:2021 |
| **CS-04** | P2 | Validación de archivos incompleta | Validación basada en nombre de archivo, no en contenido real | ⚠️ Parcial | 7.0 | CWE-434 | V7.4, A04:2021 |
| **CS-05** | P2 | Almacenamiento sin límites | Sin límites de tamaño en localStorage (potencial DoS) | ❌ Faltante | 5.9 | CWE-770 | V10.1, A05:2021 |

### 🟠 Medios (P3) - Recomendado corregir

| ID | Severidad | Título | Descripción | Estado | CVSS | CWE | OWASP |
|----|-----------|--------|-------------|--------|------|-----|-------|
| **CS-06** | P3 | Sin esquema declarativo de validación | Validación de datos ad-hoc, no basada en esquemas | ❌ Faltante | 5.3 | CWE-20 | V5.1 |
| **CS-07** | P3 | Datos personales en texto plano | Sin cifrado de datos sensibles en localStorage | ⚠️ Documentado | 5.0 | CWE-311 | V9.1 |
| **CS-08** | P3 | Modo file:// no aislado | Riesgo de compartición de localStorage y acceso a archivos | ⚠️ Documentado | 6.5 | CWE-942 | V12.4 |

### 🟢 Bajos (P4) - Mejoras opcionales

| ID | Severidad | Título | Descripción | Estado | CVSS | CWE | OWASP |
|----|-----------|--------|-------------|--------|------|-----|-------|
| **CS-09** | P4 | Errores sin sanitización completa | Mensajes de error podrían contener contenido malicioso | ⚠️ Parcial | 4.3 | CWE-116 | V6.2 |
| **CS-10** | P4 | Sin backup automático | No hay mecanismo de backup/export de datos | ❌ Faltante | - | CWE-1154 | V9.2 |
| **CS-11** | P4 | Dependencias CDN incompletas | JSZip y docx no tienen fallback local | ⚠️ Parcial | - | CWE-1104 | V12.3 |

---

## 📊 5. Métricas de Seguridad

### Puntuación General

| Métrica | Valor | Nota |
|---------|-------|------|
| **Puntuación ASVS** | 45/100 | Nivel 1 (Básico) |
| **Hallazgos totales** | 10 | 2 Críticos, 2 Altos, 3 Medios, 3 Bajos |
| **Hallazgos corregidos** | 0 | Ninguno |
| **Cobertura de controles** | 40% | 8/20 controles implementados |

### Cumplimiento por Categoría OWASP ASVS

| Categoría | Cumplimiento | Notas |
|-----------|--------------|-------|
| **V5: Validación** | 31% | Escapado implementado, validación incompleta |
| **V6: Output Encoding** | 33% | escapeHtml existe, no se usa consistentemente |
| **V10: Almacenamiento** | 25% | localStorage seguro pero sin límites |
| **V12: HTTP Security** | 13% | Sin CSP, SRI incompleto |
| **V7: Cifrado** | 15% | HTTPS en CDN, no cifrado local |
| **V8: File Upload** | 25% | Validación básica |
| **V9: Privacidad** | 25% | Datos en texto plano |

---

## 🎯 6. Recomendaciones Priorizadas

### 🔴 Prioridad 1 - CORRECCIÓN INMEDIATA (Antes de cualquier despliegue)

#### R1.1: Implementar Content Security Policy (CS-01)
**Esfuerzo:** 1-2 horas  
**Impacto:** Alto (Protege contra XSS y otros ataques)  
**Dificultad:** Baja

Agregar a `index.html` en la sección `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'none';
  frame-src 'none';
  object-src 'none';
">
```

**Archivo:** `index.html`  
**Verificación:** Usar [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

#### R1.2: Corregir Subresource Integrity (CS-02)
**Esfuerzo:** 1 hora  
**Impacto:** Alto (Protege integridad de dependencias)  
**Dificultad:** Baja

1. **Generar hashes SRI completos y correctos:**

```bash
# Chart.js 4.4.8
curl -s https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js | openssl dgst -sha384 -binary | openssl base64 -A

# JSZip 3.10.1
curl -s https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# docx 8.5.0
curl -s https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js | openssl dgst -sha384 -binary | openssl base64 -A
```

2. **Actualizar index.html con hashes completos:**

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js" 
  integrity="sha384-[HASH_COMPLETO_96_CARACTERES]"
  crossorigin="anonymous">
</script>
```

3. **Descargar copias locales de todas las dependencias:**
```bash
curl -o assets/vendor/jszip-3.10.1.min.js https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
curl -o assets/vendor/docx-8.5.0.umd.js https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js
```

**Archivo:** `index.html`  
**Herramienta:** [SRI Hash Generator](https://www.srihash.org/)

---

### 🟡 Prioridad 2 - CORRECCIÓN PRONTO (Antes de despliegue público)

#### R2.1: Sanitización Completa de innerHTML (CS-03)
**Esfuerzo:** 3-5 días  
**Impacto:** Crítico (Previene XSS)  
**Dificultad:** Media-Alta

1. **Agregar funciones de sanitización a helpers.js:**

```javascript
// Sanitización completa para HTML
function sanitizeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Para atributos
function escapeAttribute(text) {
  return escapeHtml(text).replace(/\s+/g, ' ');
}

// Para URLs
function escapeUrl(text) {
  return String(text).replace(/[^a-zA-Z0-9:\/\-\._~?#[\]@!$&'()*+,;=]/g, encodeURIComponent);
}
```

2. **Reemplazar todos los innerHTML con:**
- `element.textContent = value` (si no se necesita HTML)
- `element.innerHTML = sanitizeHtml(value)` (si se necesita HTML)

3. **Auditar todas las instancias (42+):**
```bash
grep -rn "innerHTML" src/
```

**Archivos:** Todos los archivos en `src/features/`  
**Herramienta:** DOMPurify (recomendado)

---

#### R2.2: Validación Robusta de Archivos (CS-04)
**Esfuerzo:** 2-3 días  
**Impacto:** Alto (Previene upload malicioso)  
**Dificultad:** Media

1. **Validar MIME type:**

```javascript
const validTypes = {
  'application/pdf': { ext: 'pdf', magic: '%PDF' },
  'text/plain': { ext: 'txt', magic: null },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', magic: 'PK' }
};

function validateFile(file) {
  // Validar tipo MIME
  if (!validTypes[file.type]) {
    throw new Error('Tipo de archivo no permitido');
  }
  
  // Validar magic number
  const typeInfo = validTypes[file.type];
  if (typeInfo.magic) {
    const header = await file.slice(0, typeInfo.magic.length).text();
    if (header !== typeInfo.magic) {
      throw new Error('Formato de archivo inválido');
    }
  }
  
  // Validar extensión
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== typeInfo.ext) {
    throw new Error('Extensión no coincide con el tipo');
  }
  
  return true;
}
```

2. **Sanitizar contenido de TXT:**

```javascript
function sanitizeTextContent(text) {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

**Archivos:** `src/features/academico/library.js`, `src/features/academico/publishing.js`

---

#### R2.3: Implementar Límites de Almacenamiento (CS-05)
**Esfuerzo:** 2 días  
**Impacto:** Medio (Previene DoS)  
**Dificultad:** Media

1. **Definir límites:**

```javascript
const STORAGE_LIMITS = {
  maxTotalSize: 4 * 1024 * 1024, // 4MB
  maxPerItem: 500 * 1024, // 500KB por item
  maxRedactorContent: 100 * 1024, // 100KB
  maxAttachmentSize: 250 * 1024, // 250KB
  maxHistoryItems: 10,
  maxSourcesPerProject: 100,
  maxCitationsPerProject: 200
};
```

2. **Calcular uso actual:**

```javascript
function getStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('processadmin:')) {
      total += localStorage.getItem(key).length * 2; // UTF-16
    }
  }
  return total;
}
```

3. **Modificar safeStorageSetJSON:**

```javascript
function safeStorageSetJSON(key, value) {
  const serialized = JSON.stringify(value);
  const serializedSize = serialized.length * 2;
  
  if (serializedSize > STORAGE_LIMITS.maxPerItem) {
    showToast('El dato es demasiado grande para guardar', 'error');
    return false;
  }
  
  const currentUsage = getStorageUsage();
  const newTotal = currentUsage + serializedSize;
  
  if (newTotal > STORAGE_LIMITS.maxTotalSize) {
    if (!cleanupStorage(newTotal - STORAGE_LIMITS.maxTotalSize)) {
      showToast('Almacenamiento lleno. Borra algunos datos.', 'error');
      return false;
    }
  }
  
  try {
    localStorage.setItem(projectKey(key), serialized);
    return true;
  } catch (err) {
    return false;
  }
}
```

**Archivos:** `src/state/persistence.js`

---

### 🟢 Prioridad 3 - MEJORAS (Mediano plazo)

#### R3.1: Esquemas de Validación (CS-06)
**Esfuerzo:** 2-3 días  
**Impacto:** Medio (Mejora consistencia)  
**Dificultad:** Media

Usar Zod para validación de esquemas:

```javascript
// Importar Zod desde CDN
// <script src="https://cdn.jsdelivr.net/npm/zod@3.22.4/lib/zod.umd.min.js"></script>

const studentDataSchema = z.object({
  nombre: z.string().min(1).max(200),
  codigo: z.string().min(1).max(50),
  curso: z.string().min(1).max(200),
  modalidad: z.enum(['Presencial', 'Virtual', 'Híbrida', '']).optional(),
  docente: z.string().min(1).max(200),
  institucion: z.string().min(1).max(200),
  ciudad: z.string().min(1).max(100),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

function validateStudentData(data) {
  try {
    return studentDataSchema.parse(data);
  } catch (error) {
    showToast('Datos inválidos: ' + error.message, 'error');
    return null;
  }
}
```

**Archivos:** `src/config/schemas.js` (nuevo) + integración en persistence.js

---

#### R3.2: Cifrado de Datos Sensibles (CS-07)
**Esfuerzo:** 3-5 días  
**Impacto:** Medio (Mejora privacidad)  
**Dificultad:** Alta

Implementar cifrado cliente usando Web Crypto API:

```javascript
// Derivar clave de contraseña
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Cifrar datos
async function encryptData(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );
  
  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
}
```

**Consideración:** Requeriría UI para contraseña y manejo de recuperación.

**Archivos:** Nuevos archivos de cifrado + integración en persistence.js

---

#### R3.3: Detección de Modo file:// (CS-08)
**Esfuerzo:** 1 día  
**Impacto:** Medio (Mejora seguridad)  
**Dificultad:** Baja

```javascript
// En index.html o main.js
if (location.protocol === 'file:') {
  const warningBanner = document.createElement('div');
  warningBanner.className = 'file-mode-warning bg-amber-100 border-l-4 border-amber-500 p-4';
  warningBanner.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm text-amber-700">
          <strong>Advertencia:</strong> Estás usando ProcessAdmin en modo local (file://). 
          Para mayor seguridad, usa un servidor web local.
        </p>
      </div>
    </div>
  `;
  document.body.prepend(warningBanner);
}
```

**Archivos:** `index.html` o `src/app/main.js`

---

## 📞 7. Respuesta y Contacto

### Reportes de Seguridad

- **Email:** andresjeroparra@gmail.com
- **Formato:** Incluir detalles técnicos, pasos para reproducir y posible impacto
- **Tiempo de respuesta:** 48 horas (días laborables)

### Procedimiento de Reportes

1. **Inicial:** Envío de reporte a andresjeroparra@gmail.com
2. **Validación:** Confirmación de recepción en 24 horas
3. **Análisis:** Evaluación de severidad e impacto
4. **Corrección:** Implementación de fix (según prioridad)
5. **Comunicación:** Notificación al reportante

### Clases de Severidad y SLA

| Severidad | Tiempo de Respuesta | Tiempo de Corrección |
|-----------|---------------------|----------------------|
| **Crítica** | 24 horas | 7 días |
| **Alta** | 48 horas | 14 días |
| **Media** | 3 días | 30 días |
| **Baja** | 7 días | 90 días |

### Divulgación

- **Privada por defecto:** Todos los reportes son privados
- **Divulgación pública:** Solo con autorización explícita del autor
- **Creditos:** Se reconoce al reportante (si lo desea)

---

## 📚 8. Documentación Adicional

### Informes de Auditoría

| Informe | Fecha | Task ID | Estado |
|---------|-------|---------|--------|
| **F11_SECURITY.md** | 2026-11-24 | task_be24567ad87a | ✅ Completo |

**Ubicación del informe completo:**
```
~/Orca-Nexus/evidence/processadmin/F11_SECURITY.md
```

### Recursos de Seguridad

- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Mozilla Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 📜 9. Licencias de Terceros

### Dependencias CDN

| Librería | Versión | Licencia | SRI | Estado |
|----------|---------|----------|-----|--------|
| **Chart.js** | 4.4.8 | MIT | ⚠️ Incompleto | Parcial |
| **JSZip** | 3.10.1 | MIT o GPL-3.0 | ⚠️ Incompleto | Parcial |
| **docx.js** | 8.5.0 | MIT | ⚠️ Incompleto | Parcial |
| **Google Fonts** | - | SIL OFL / CC BY 4.0 | N/A | OK |

### Dependencias Locales

| Archivo | Fuente | Licencia |
|---------|--------|----------|
| `assets/vendor/chart-4.4.8.umd.js` | jsDelivr | MIT |
| `Chart-LICENSE.md` | jsDelivr | MIT |

### Código Propio

| Componente | Licencia |
|------------|----------|
| ProcessAdmin | MIT |
| Arquitectura y UI | MIT |

---

## 🏷️ 10. Etiquetas y Metadatos

```yaml
# Metadatos del documento
version: "2.1"
audit_date: "2026-11-24"
audit_type: "independent_security_audit"
auditor: "Orca Multi-Agent IDE (SENTINEL)"
task_id: "task_be24567ad87a"
dispatch_id: "ctx_f9d349557bf4"
product: "ProcessAdmin"
product_version: "1.0.0"
language: "es"
classification: "internal"
sensitivity: "medium"
tags:
  - security
  - audit
  - sentinel
  - owasp
  - asvs
  - xss
  - csp
  - sri
  - storage
  - privacy
  - file-upload
  - validation
```

---

**Documento generado por ORCA NEXUS SENTINEL**  
*Task ID: task_be24567ad87a | Dispatch ID: ctx_f9d349557bf4*  
*Última actualización: 2026-11-24*  
*¿Preguntas? Contacta a andresjeroparra@gmail.com*
