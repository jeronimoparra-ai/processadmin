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

function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (err) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch (err) {
    return false;
  }
}

function safeStorageSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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

function loadJSON(key, fallback) {
  try {
    const value = typeof safeStorageGet === 'function'
      ? safeStorageGet(key, null)
      : localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed !== undefined && parsed !== null ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  if (typeof safeStorageSetJSON === 'function') {
    safeStorageSetJSON(key, value);
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving JSON to localStorage', error);
  }
}

function saveField(key, value) {
  if (typeof flashSaveIndicator === 'function') flashSaveIndicator();

  clearTimeout(window.state.saveTimer);
  window.state.saveTimer = setTimeout(() => {
    if (typeof safeStorageSet === 'function') {
      safeStorageSet(key, value);
    } else {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
    }
    if (typeof updateWriterProgress === 'function') updateWriterProgress();
    if (typeof updateSectionCompleteness === 'function') updateSectionCompleteness();
  }, 800);
}
