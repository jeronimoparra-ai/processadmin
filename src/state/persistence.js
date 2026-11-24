// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE.JS - Robust wrappers for localStorage and save operations
// Consolidated source-of-truth for safeStorage* and validation helpers
// (moved here from src/config/index.js to avoid silent shadowing)
// ═══════════════════════════════════════════════════════════════════════

function validateStoredValue(value, fallback) {
  if (Array.isArray(fallback)) {
    return Array.isArray(value) ? value : fallback;
  }

  if (fallback && typeof fallback === 'object') {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  }

  if (typeof fallback === 'string') {
    return typeof value === 'string' ? value : fallback;
  }

  if (typeof fallback === 'number') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  if (typeof fallback === 'boolean') {
    return typeof value === 'boolean' ? value : fallback;
  }

  return value ?? fallback;
}

const projectNamePrefix = 'processadmin:project-name:';
const defaultProjectId = 'principal';
const requestedProjectId = new URLSearchParams(location.search).get('project');
const activeProjectId = requestedProjectId && listProjects().some(project => project.id === requestedProjectId)
  ? requestedProjectId
  : defaultProjectId;

function listProjects() {
  const projects = [{ id: defaultProjectId, name: 'Proyecto principal' }];
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(projectNamePrefix)) {
        projects.push({ id: key.slice(projectNamePrefix.length), name: localStorage.getItem(key) });
      }
    }
  } catch {}
  return projects;
}

function projectKey(key, projectId = activeProjectId) {
  return `processadmin:project:${projectId}:${key}`;
}

function createProject(name, fields = {}) {
  const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const written = [];
  try {
    for (const [key, value] of Object.entries(fields)) {
      const scopedKey = projectKey(key, id);
      localStorage.setItem(scopedKey, value);
      written.push(scopedKey);
    }
    localStorage.setItem(projectNamePrefix + id, name);
    return id;
  } catch {
    for (const key of written) localStorage.removeItem(key);
    return null;
  }
}

function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(projectKey(key));
    // Pre-project installations belong exclusively to the principal project.
    if (value === null && activeProjectId === defaultProjectId) return localStorage.getItem(key) ?? fallback;
    return value === null ? fallback : value;
  } catch (err) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(projectKey(key), String(value));
    return true;
  } catch (err) {
    return false;
  }
}

function safeStorageSetJSON(key, value) {
  try {
    localStorage.setItem(projectKey(key), JSON.stringify(value));
    return true;
  } catch (err) {
    return false;
  }
}

function loadStoredString(key, fallback = '') {
  const value = safeStorageGet(key, null);
  if (value === null) return fallback;

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : value;
  } catch (err) {
    return value;
  }
}

function safeParse(key, fallback) {
  try {
    const v = safeStorageGet(key, null);
    return v ? validateStoredValue(JSON.parse(v), fallback) : fallback;
  } catch (err) {
    return fallback;
  }
}

function safeStorageRemove(key) {
  try {
    if (activeProjectId === defaultProjectId) localStorage.removeItem(key);
    localStorage.removeItem(projectKey(key));
    return true;
  } catch {
    return false;
  }
}

function loadJSON(key, fallback) {
  return safeParse(key, fallback);
}

function saveJSON(key, value) {
  return safeStorageSetJSON(key, value);
}

function flushPendingFields() {
  clearTimeout(window.state.saveTimer);
  window.state.saveTimer = null;
  for (const [key, value] of window.state.pendingFields) {
    if (safeStorageSet(key, value)) window.state.pendingFields.delete(key);
  }
  return window.state.pendingFields.size === 0;
}

function saveField(key, value) {
  window.state.pendingFields.set(key, value);
  clearTimeout(window.state.saveTimer);
  window.state.saveTimer = setTimeout(() => {
    if (!flushPendingFields()) showToast('No se pudieron guardar los cambios en este navegador.', 'error');
    updateWriterProgress();
    if (typeof updateSectionCompleteness === 'function') updateSectionCompleteness();
  }, 800);
}
