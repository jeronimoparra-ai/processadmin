// ═══════════════════════════════════════════════════════════════════════
// PERSISTENCE.JS - Wrappers for localStorage and save operations
// ═══════════════════════════════════════════════════════════════════════

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
