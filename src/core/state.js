// ═══════════════════════════════════════════════════════════════════════
// CORE/STATE.JS - Única fuente de verdad del estado de ProcessAdmin
// ═══════════════════════════════════════════════════════════════════════

import { WORK_TYPES } from './constants.js';
import {
  STORAGE_KEYS,
  safeGetJSON,
  safeSetJSON,
  safeRemove,
  migrateLegacyDataIfNeeded
} from './storage.js';

class ProcessAdminStore {
  constructor() {
    this.subscribers = new Set();
    this.saveTimeout = null;
    this.activeView = 'panel';
    this.currentWork = null;
    this.worksList = [];
    this.isSaving = false;
    this.lastSaved = null;
  }

  init() {
    // 1. Intentar migrar datos antiguos si aplica
    const migrated = migrateLegacyDataIfNeeded();

    // 2. Cargar trabajo activo
    const loadedWork = migrated || safeGetJSON(STORAGE_KEYS.ACTIVE_WORK, null);
    if (loadedWork && loadedWork.id) {
      this.currentWork = this._ensureWorkIntegrity(loadedWork);
    } else {
      this.currentWork = this._createDefaultWork('ensayo', 'Mi Trabajo Académico');
    }

    // 3. Cargar lista de trabajos
    this.worksList = safeGetJSON(STORAGE_KEYS.WORKS_LIST, []);
    this._syncWorkWithList();

    // Guardar para asegurar estructura limpia
    safeSetJSON(STORAGE_KEYS.ACTIVE_WORK, this.currentWork);
    safeSetJSON(STORAGE_KEYS.WORKS_LIST, this.worksList);

    // Exponer globalmente de forma controlada para compatibilidad
    window.appStore = this;
  }

  _createDefaultWork(type = 'ensayo', title = 'Mi Trabajo Académico') {
    const typeDef = WORK_TYPES[type] || WORK_TYPES.ensayo;
    const now = new Date().toISOString();

    return {
      id: `work_${Date.now()}`,
      title: title.trim() || typeDef.name,
      workType: type,
      createdAt: now,
      updatedAt: now,
      metadata: {
        author: '',
        code: '',
        institution: '',
        course: '',
        professor: '',
        city: '',
        date: now.slice(0, 10),
        deadline: ''
      },
      plan: {
        topic: '',
        problem: '',
        question: '',
        generalObjective: '',
        specificObjectives: [],
        justification: '',
        expectedConclusions: '',
        notes: {}
      },
      sections: typeDef.defaultSections.map((sec, idx) => ({
        id: `sec_${sec.key}_${idx}`,
        key: sec.key,
        title: sec.title,
        content: ''
      })),
      citations: [],
      checklistCustom: []
    };
  }

  _ensureWorkIntegrity(work) {
    if (!work || typeof work !== 'object') {
      return this._createDefaultWork();
    }
    const type = work.workType && WORK_TYPES[work.workType] ? work.workType : 'ensayo';
    const typeDef = WORK_TYPES[type];

    const ensured = {
      id: work.id || `work_${Date.now()}`,
      title: (work.title || 'Trabajo académico').trim(),
      workType: type,
      createdAt: work.createdAt || new Date().toISOString(),
      updatedAt: work.updatedAt || new Date().toISOString(),
      metadata: {
        author: work.metadata?.author || '',
        code: work.metadata?.code || '',
        institution: work.metadata?.institution || '',
        course: work.metadata?.course || '',
        professor: work.metadata?.professor || '',
        city: work.metadata?.city || '',
        date: work.metadata?.date || new Date().toISOString().slice(0, 10),
        deadline: work.metadata?.deadline || ''
      },
      plan: {
        topic: work.plan?.topic || '',
        problem: work.plan?.problem || '',
        question: work.plan?.question || '',
        generalObjective: work.plan?.generalObjective || '',
        specificObjectives: Array.isArray(work.plan?.specificObjectives) ? work.plan.specificObjectives : [],
        justification: work.plan?.justification || '',
        expectedConclusions: work.plan?.expectedConclusions || '',
        notes: work.plan?.notes || {}
      },
      sections: Array.isArray(work.sections) && work.sections.length > 0
        ? work.sections.map((sec, idx) => ({
            id: sec.id || `sec_${idx}`,
            key: sec.key || `sec_${idx}`,
            title: sec.title || `Sección ${idx + 1}`,
            content: typeof sec.content === 'string' ? sec.content : ''
          }))
        : typeDef.defaultSections.map((sec, idx) => ({
            id: `sec_${sec.key}_${idx}`,
            key: sec.key,
            title: sec.title,
            content: ''
          })),
      citations: Array.isArray(work.citations) ? work.citations : [],
      checklistCustom: Array.isArray(work.checklistCustom) ? work.checklistCustom : []
    };

    return ensured;
  }

  _syncWorkWithList() {
    if (!this.currentWork) return;
    const words = this.getTotalWordCount();
    const idx = this.worksList.findIndex(w => w.id === this.currentWork.id);
    const summary = {
      id: this.currentWork.id,
      title: this.currentWork.title,
      workType: this.currentWork.workType,
      updatedAt: this.currentWork.updatedAt,
      author: this.currentWork.metadata.author,
      wordCount: words,
      citationsCount: this.currentWork.citations.length
    };

    if (idx >= 0) {
      this.worksList[idx] = summary;
    } else {
      this.worksList.unshift(summary);
    }
  }

  getCurrentWork() {
    return this.currentWork;
  }

  getWorksList() {
    return [...this.worksList];
  }

  getTotalWordCount() {
    if (!this.currentWork?.sections) return 0;
    const allText = this.currentWork.sections.map(s => s.content || '').join(' ');
    return allText.trim().split(/\s+/).filter(Boolean).length;
  }

  getTotalParagraphCount() {
    if (!this.currentWork?.sections) return 0;
    return this.currentWork.sections.reduce((total, s) => {
      const paras = (s.content || '').trim().split(/\n\s*\n+/).filter(Boolean).length;
      return total + paras;
    }, 0);
  }

  updateCurrentWork(changes = {}, debounceMs = 600) {
    if (!this.currentWork) return;

    Object.assign(this.currentWork, changes);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();

    this.notifySubscribers();
    this._scheduleSave(debounceMs);
  }

  updateMetadata(metadataChanges = {}) {
    if (!this.currentWork) return;
    Object.assign(this.currentWork.metadata, metadataChanges);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();

    this.notifySubscribers();
    this._scheduleSave();
  }

  updatePlan(planChanges = {}) {
    if (!this.currentWork) return;
    Object.assign(this.currentWork.plan, planChanges);
    this.currentWork.updatedAt = new Date().toISOString();

    this.notifySubscribers();
    this._scheduleSave();
  }

  changeWorkType(newType) {
    if (!WORK_TYPES[newType] || !this.currentWork) return;
    this.currentWork.workType = newType;
    const typeDef = WORK_TYPES[newType];

    // Mantener secciones existentes si coinciden, o agregar las que faltan
    const existingKeys = new Set(this.currentWork.sections.map(s => s.key));
    typeDef.defaultSections.forEach((sec, idx) => {
      if (!existingKeys.has(sec.key)) {
        this.currentWork.sections.push({
          id: `sec_${sec.key}_${Date.now()}_${idx}`,
          key: sec.key,
          title: sec.title,
          content: ''
        });
      }
    });

    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();
    this.notifySubscribers();
    this._scheduleSave();
  }

  updateSection(sectionId, content) {
    if (!this.currentWork) return;
    const section = this.currentWork.sections.find(s => s.id === sectionId);
    if (section) {
      section.content = content;
      this.currentWork.updatedAt = new Date().toISOString();
      this._syncWorkWithList();
      this.notifySubscribers();
      this._scheduleSave();
    }
  }

  addSection(title, key = '') {
    if (!this.currentWork) return null;
    const generatedKey = key || title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newSection = {
      id: `sec_custom_${Date.now()}`,
      key: generatedKey,
      title: title.trim() || 'Nueva Sección',
      content: ''
    };
    this.currentWork.sections.push(newSection);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();
    this.notifySubscribers();
    this._scheduleSave();
    return newSection;
  }

  removeSection(sectionId) {
    if (!this.currentWork) return;
    this.currentWork.sections = this.currentWork.sections.filter(s => s.id !== sectionId);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();
    this.notifySubscribers();
    this._scheduleSave();
  }

  reorderSections(newOrderIds) {
    if (!this.currentWork || !Array.isArray(newOrderIds)) return;
    const map = new Map(this.currentWork.sections.map(s => [s.id, s]));
    const reordered = newOrderIds.map(id => map.get(id)).filter(Boolean);
    this.currentWork.sections = reordered;
    this.currentWork.updatedAt = new Date().toISOString();
    this.notifySubscribers();
    this._scheduleSave();
  }

  addCitation(citationData) {
    if (!this.currentWork) return null;
    const newCitation = {
      id: `cite_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...citationData
    };
    this.currentWork.citations.push(newCitation);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();
    this.notifySubscribers();
    this._scheduleSave();
    return newCitation;
  }

  updateCitation(citationId, changes) {
    if (!this.currentWork) return;
    const cite = this.currentWork.citations.find(c => c.id === citationId);
    if (cite) {
      Object.assign(cite, changes);
      this.currentWork.updatedAt = new Date().toISOString();
      this.notifySubscribers();
      this._scheduleSave();
    }
  }

  removeCitation(citationId) {
    if (!this.currentWork) return;
    this.currentWork.citations = this.currentWork.citations.filter(c => c.id !== citationId);
    this.currentWork.updatedAt = new Date().toISOString();
    this._syncWorkWithList();
    this.notifySubscribers();
    this._scheduleSave();
  }

  sortCitationsAZ() {
    if (!this.currentWork || !Array.isArray(this.currentWork.citations)) return;
    this.currentWork.citations.sort((a, b) => {
      const authA = (a.authors || a.author || '').toLowerCase();
      const authB = (b.authors || b.author || '').toLowerCase();
      return authA.localeCompare(authB, 'es');
    });
    this.currentWork.updatedAt = new Date().toISOString();
    this.notifySubscribers();
    this._scheduleSave();
  }

  createNewWork(type = 'ensayo', title = '') {
    // Guardar trabajo actual antes de cambiar
    this._saveNow();

    const newWork = this._createDefaultWork(type, title);
    this.currentWork = newWork;
    this._syncWorkWithList();

    safeSetJSON(STORAGE_KEYS.ACTIVE_WORK, this.currentWork);
    safeSetJSON(STORAGE_KEYS.WORKS_LIST, this.worksList);

    this.notifySubscribers();
    return newWork;
  }

  switchWork(workId) {
    if (!workId || (this.currentWork && this.currentWork.id === workId)) return;

    this._saveNow();

    // Buscar si existe en almacenamiento o en el historial
    const storedWorkKey = `processadmin_work_${workId}`;
    let targetWork = safeGetJSON(storedWorkKey, null);

    if (!targetWork) {
      // Intentar buscar en lista o restaurar
      const summary = this.worksList.find(w => w.id === workId);
      if (summary) {
        targetWork = this._createDefaultWork(summary.workType, summary.title);
        targetWork.id = summary.id;
      }
    }

    if (targetWork) {
      this.currentWork = this._ensureWorkIntegrity(targetWork);
      safeSetJSON(STORAGE_KEYS.ACTIVE_WORK, this.currentWork);
      this._syncWorkWithList();
      this.notifySubscribers();
    }
  }

  deleteWork(workId) {
    if (!workId) return;

    // Eliminar de la lista
    this.worksList = this.worksList.filter(w => w.id !== workId);
    safeRemove(`processadmin_work_${workId}`);
    safeSetJSON(STORAGE_KEYS.WORKS_LIST, this.worksList);

    // Si se eliminó el trabajo activo, cambiar al primero o crear uno nuevo
    if (this.currentWork && this.currentWork.id === workId) {
      if (this.worksList.length > 0) {
        this.switchWork(this.worksList[0].id);
      } else {
        this.createNewWork('ensayo', 'Mi Primer Trabajo');
      }
    } else {
      this.notifySubscribers();
    }
  }

  _scheduleSave(debounceMs = 600) {
    this._setSavingIndicator(true);
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this._saveNow();
    }, debounceMs);
  }

  _saveNow() {
    if (!this.currentWork) return;
    clearTimeout(this.saveTimeout);

    safeSetJSON(STORAGE_KEYS.ACTIVE_WORK, this.currentWork);
    // Guardar copia individual por ID para recuperación rápida
    safeSetJSON(`processadmin_work_${this.currentWork.id}`, this.currentWork);
    safeSetJSON(STORAGE_KEYS.WORKS_LIST, this.worksList);

    // Mantener sincronizado redactor_content para interoperabilidad
    const fullText = this.currentWork.sections.map(s => s.content || '').join('\n\n');
    safeSetJSON(STORAGE_KEYS.LEGACY_CONTENT, fullText);

    this.lastSaved = new Date();
    this._setSavingIndicator(false);
  }

  _setSavingIndicator(saving) {
    this.isSaving = saving;
    const pill = document.querySelector('.header-pill');
    if (pill) {
      if (saving) {
        pill.classList.remove('header-pill--success');
        pill.classList.add('header-pill--saving');
        const textSpan = pill.querySelector('span');
        if (textSpan) textSpan.textContent = 'Guardando...';
      } else {
        pill.classList.remove('header-pill--saving');
        pill.classList.add('header-pill--success');
        const textSpan = pill.querySelector('span');
        if (textSpan) textSpan.textContent = 'Guardado';
      }
    }
  }

  subscribe(fn) {
    if (typeof fn === 'function') {
      this.subscribers.add(fn);
      return () => this.subscribers.delete(fn);
    }
    return () => {};
  }

  notifySubscribers() {
    for (const sub of this.subscribers) {
      try {
        sub(this.currentWork);
      } catch (err) {
        console.error('[ProcessAdmin Store] Error notificando observador:', err);
      }
    }
  }
}

export const store = new ProcessAdminStore();
