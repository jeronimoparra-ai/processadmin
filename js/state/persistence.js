// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE.JS - Wrappers for localStorage and save operations
// ═══════════════════════════════════════════════════════════════════════

function safeStorageGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

function safeStorageSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving JSON to localStorage', e);
  }
}

function validateStoredValue(value, fallback) {
  return value !== undefined && value !== null ? value : fallback;
}

function loadJSON(key, fallback) {
  try {
    const value = safeStorageGet(key, null);
    return value ? validateStoredValue(JSON.parse(value), fallback) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  safeStorageSetJSON(key, value);
}

function saveField(key, value) {
  if (typeof flashSaveIndicator === 'function') flashSaveIndicator();

  clearTimeout(window.state.saveTimer);
  window.state.saveTimer = setTimeout(() => {
    safeStorageSet(key, value);
    if (typeof updateWriterProgress === 'function') updateWriterProgress();
    if (typeof updateSectionCompleteness === 'function') updateSectionCompleteness();
  }, 800);
}
