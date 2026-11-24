// =============================================================================
// APA RULES ENGINE - Domain Layer (Vanilla JS - No Dependencies)
// Academic Integrity Validation Rules for APA 7th Edition and variants
// =============================================================================

/**
 * @typedef {Object} APARule
 * @property {string} id - Standard rule identifier (e.g., "apa7-author-format")
 * @property {string} edition - Edition identifier (e.g., "APA 7", "APA 6", "MLA 9", "Harvard", "Chicago")
 * @property {string} profile - Rule category (e.g., "author", "date", "title", "source", "identifier")
 * @property {string} source - Normative source reference (e.g., "APA 7th Manual, Section 9.7")
 * @property {boolean} verifiable - Whether the rule can be automatically verified
 * @property {Function} verify - Verification function that takes a reference object and returns boolean
 * @property {'high'|'mid'|'low'} gravity - Error severity level
 * @property {string} message - Human-readable error message template
 * @property {boolean} required - Whether this rule is mandatory for compliance
 * @property {string[]} types - Publication types this rule applies to
 */

/**
 * Publication type constants for rule targeting
 * @type {Readonly<{JOURNAL_ARTICLE: string, BOOK: string, CHAPTER: string, BOOKLET: string, WEBSITE: string, THESIS: string, DISSERTATION: string, SOFTWARE_GITHUB: string, DATASET_DOI: string, RADIO_INTERVIEW: string}>}
 */
const PUBLICATION_TYPES = Object.freeze({
  JOURNAL_ARTICLE: 'journal-article',
  BOOK: 'book',
  CHAPTER: 'chapter',
  BOOKLET: 'booklet',
  WEBSITE: 'website',
  THESIS: 'thesis',
  DISSERTATION: 'dissertation',
  SOFTWARE_GITHUB: 'software-github',
  DATASET_DOI: 'dataset-doi',
  RADIO_INTERVIEW: 'radio/interview'
});

/**
 * Gravity levels for rule violations
 * @type {Readonly<{HIGH: 'high', MID: 'mid', LOW: 'low'}>}
 */
const GRAVITY = Object.freeze({
  HIGH: 'high',
  MID: 'mid',
  LOW: 'low'
});

/**
 * Edition identifiers
 * @type {Readonly<{APA_7: string, APA_6: string, MLA_9: string, HARVARD: string, CHICAGO: string}>}
 */
const EDITIONS = Object.freeze({
  APA_7: 'APA 7',
  APA_6: 'APA 6',
  MLA_9: 'MLA 9',
  HARVARD: 'Harvard',
  CHICAGO: 'Chicago'
});

/**
 * Profiles for rule categorization
 * @type {Readonly<{AUTHOR: string, DATE: string, TITLE: string, SOURCE: string, IDENTIFIER: string, FORMATTING: string, CONTENT: string}>}
 */
const PROFILES = Object.freeze({
  AUTHOR: 'author',
  DATE: 'date',
  TITLE: 'title',
  SOURCE: 'source',
  IDENTIFIER: 'identifier',
  FORMATTING: 'formatting',
  CONTENT: 'content'
});

// =============================================================================
// RULE DEFINITIONS
// =============================================================================

/**
 * Author-related rules for APA 7
 */
const authorRules = [
  {
    id: 'apa7-author-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 9.7',
    verifiable: true,
    verify: (ref) => !!ref.author && ref.author.trim() !== '',
    gravity: GRAVITY.HIGH,
    message: 'Author is required for APA 7 citations',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-author-surname-first',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 9.8',
    verifiable: true,
    verify: (ref) => {
      if (!ref.author) return false;
      // For individual authors, surname should come first
      const parts = ref.author.split(', ');
      if (parts.length >= 2) {
        return parts[0].trim().length > 0;
      }
      // For institutional authors or single names, this is acceptable
      return true;
    },
    gravity: GRAVITY.MID,
    message: 'Author names should be in surname, initials format (e.g., García, M.)',
    required: true,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.BOOK, PUBLICATION_TYPES.CHAPTER]
  },
  {
    id: 'apa7-author-multiple-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 9.8',
    verifiable: true,
    verify: (ref) => {
      if (!ref.author) return false;
      // Multiple authors should be separated by commas with ampersand before last
      if (ref.author.includes('&') || ref.author.includes('and')) {
        return true;
      }
      return !ref.author.includes(',') || !ref.author.includes(';');
    },
    gravity: GRAVITY.MID,
    message: 'Multiple authors should be separated by commas with ampersand (&) before the last author',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-author-institutional',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 9.11',
    verifiable: true,
    verify: (ref) => {
      if (!ref.author) return false;
      // Institutional authors should be spelled out fully
      return !ref.author.includes('.') || ref.author.includes('(');
    },
    gravity: GRAVITY.LOW,
    message: 'Institutional authors should be spelled out fully on first mention',
    required: false,
    types: [PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB, PUBLICATION_TYPES.DATASET_DOI]
  },
  {
    id: 'apa7-author-max-20',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 9.8',
    verifiable: true,
    verify: (ref) => {
      if (!ref.author) return false;
      // Count author entries (separated by commas or semicolons)
      const authorCount = (ref.author.match(/,/g) || []).length + 1;
      // APA 7 allows up to 20 authors before using et al.
      return authorCount <= 20;
    },
    gravity: GRAVITY.LOW,
    message: 'APA 7 allows up to 20 authors; use et al. for more than 20',
    required: false,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE]
  }
];

/**
 * Date-related rules for APA 7
 */
const dateRules = [
  {
    id: 'apa7-date-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 9.10',
    verifiable: true,
    verify: (ref) => !!ref.year || !!ref.date,
    gravity: GRAVITY.HIGH,
    message: 'Publication year/date is required',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-date-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 9.10',
    verifiable: true,
    verify: (ref) => {
      if (!ref.year && !ref.date) return false;
      if (ref.year) {
        return /^\d{4}$/.test(String(ref.year)) || /^\d{4}, \d{4}$/.test(String(ref.year)) || String(ref.year) === 's.f.';
      }
      if (ref.date) {
        return /^\d{4}$/.test(String(ref.date).slice(0, 4)) || String(ref.date) === 's.f.';
      }
      return true;
    },
    gravity: GRAVITY.MID,
    message: 'Date should be in YYYY format or "s.f." for unknown dates',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-date-no-future',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 9.10',
    verifiable: true,
    verify: (ref) => {
      if (!ref.year) return true;
      const year = parseInt(ref.year, 10);
      if (isNaN(year)) return true;
      const currentYear = new Date().getFullYear();
      return year <= currentYear + 1; // Allow current year + 1 for early online publications
    },
    gravity: GRAVITY.LOW,
    message: 'Publication year appears to be in the future',
    required: false,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-date-unknown-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 9.16',
    verifiable: true,
    verify: (ref) => {
      if (!ref.year && !ref.date) return false;
      if (ref.year === 's.f.' || ref.date === 's.f.') return true;
      if (ref.year === 'n.d.' || ref.date === 'n.d.') return true;
      return true; // If there's a date, it's fine
    },
    gravity: GRAVITY.LOW,
    message: 'Unknown dates should use "s.f." (sin fecha) or "n.d." (no date)',
    required: false,
    types: Object.values(PUBLICATION_TYPES)
  }
];

/**
 * Title-related rules for APA 7
 */
const titleRules = [
  {
    id: 'apa7-title-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.TITLE,
    source: 'APA 7th Manual, Section 9.18',
    verifiable: true,
    verify: (ref) => !!ref.title && ref.title.trim() !== '',
    gravity: GRAVITY.HIGH,
    message: 'Title is required',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-title-sentence-case',
    edition: EDITIONS.APA_7,
    profile: PROFILES.TITLE,
    source: 'APA 7th Manual, Section 9.18',
    verifiable: false, // Hard to verify automatically
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Use sentence case for titles in references (only first word, proper nouns, and after punctuation capitalized)',
    required: true,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.BOOK, PUBLICATION_TYPES.CHAPTER]
  },
  {
    id: 'apa7-title-italic-books',
    edition: EDITIONS.APA_7,
    profile: PROFILES.FORMATTING,
    source: 'APA 7th Manual, Section 9.20',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Book titles should be italicized',
    required: true,
    types: [PUBLICATION_TYPES.BOOK]
  },
  {
    id: 'apa7-title-italic-journals',
    edition: EDITIONS.APA_7,
    profile: PROFILES.FORMATTING,
    source: 'APA 7th Manual, Section 9.20',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Journal titles should be italicized and use title case',
    required: true,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE]
  },
  {
    id: 'apa7-title-quotation-article',
    edition: EDITIONS.APA_7,
    profile: PROFILES.FORMATTING,
    source: 'APA 7th Manual, Section 9.18',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Article and chapter titles should NOT be italicized',
    required: true,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.CHAPTER]
  }
];

/**
 * Source-related rules for APA 7
 */
const sourceRules = [
  {
    id: 'apa7-source-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.SOURCE,
    source: 'APA 7th Manual, Section 9.29',
    verifiable: true,
    verify: (ref) => !!ref.source || !!ref.publisher || !!ref.journal,
    gravity: GRAVITY.HIGH,
    message: 'Source (publisher/journal) is required',
    required: true,
    types: [PUBLICATION_TYPES.BOOK, PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.CHAPTER]
  },
  {
    id: 'apa7-source-publisher-location',
    edition: EDITIONS.APA_7,
    profile: PROFILES.SOURCE,
    source: 'APA 7th Manual, Section 9.29',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Publisher location is not required in APA 7 (only publisher name)',
    required: false,
    types: [PUBLICATION_TYPES.BOOK]
  },
  {
    id: 'apa7-source-journal-volume',
    edition: EDITIONS.APA_7,
    profile: PROFILES.SOURCE,
    source: 'APA 7th Manual, Section 10.1',
    verifiable: true,
    verify: (ref) => {
      if (!ref.journal) return true; // Not a journal article
      return !!ref.volume || !ref.journal.includes('Journal');
    },
    gravity: GRAVITY.MID,
    message: 'Journal articles should include volume number',
    required: true,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE]
  },
  {
    id: 'apa7-source-pages-article',
    edition: EDITIONS.APA_7,
    profile: PROFILES.SOURCE,
    source: 'APA 7th Manual, Section 10.1',
    verifiable: true,
    verify: (ref) => {
      if (!ref.pages) return true;
      // Page range format: 123-125 or 123-125
      return /^\d+-\d+$/.test(ref.pages) || /^pp\. \d+-\d+$/.test(ref.pages);
    },
    gravity: GRAVITY.LOW,
    message: 'Page ranges should be in format: 123-125',
    required: false,
    types: [PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.CHAPTER]
  }
];

/**
 * Identifier rules (DOI, URL) for APA 7
 */
const identifierRules = [
  {
    id: 'apa7-identifier-doi-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 9.34',
    verifiable: true,
    verify: (ref) => {
      if (!ref.doi) return true;
      // DOI should start with 10. and can contain various characters
      return /^10\.\d{4,}(?:\.\d+)*\/\S+$/i.test(ref.doi) || /^https?:\/\/doi\.org\/10\.\d+/i.test(ref.doi);
    },
    gravity: GRAVITY.MID,
    message: 'DOI should be in format: 10.xxxx/... or https://doi.org/10.xxxx/...',
    required: false,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'apa7-identifier-url-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 9.34',
    verifiable: true,
    verify: (ref) => {
      if (!ref.url) return true;
      return /^https?:\/\/.+/.test(ref.url);
    },
    gravity: GRAVITY.LOW,
    message: 'URL should start with http:// or https://',
    required: false,
    types: [PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB, PUBLICATION_TYPES.DATASET_DOI]
  },
  {
    id: 'apa7-identifier-doi-or-url',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 9.34',
    verifiable: true,
    verify: (ref) => {
      // At least one identifier should be present for online sources
      if ([PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB, PUBLICATION_TYPES.DATASET_DOI].includes(ref.type)) {
        return !!ref.doi || !!ref.url;
      }
      return true;
    },
    gravity: GRAVITY.MID,
    message: 'Online sources should include DOI or URL',
    required: true,
    types: [PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB, PUBLICATION_TYPES.DATASET_DOI]
  },
  {
    id: 'apa7-identifier-retrieved',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 9.34',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Use "Retrieved from" for URLs without DOIs in APA 6; APA 7 does not require it',
    required: false,
    types: [PUBLICATION_TYPES.WEBSITE]
  }
];

/**
 * Thesis/Dissertation specific rules
 */
const thesisRules = [
  {
    id: 'apa7-thesis-type-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.CONTENT,
    source: 'APA 7th Manual, Section 10.6',
    verifiable: true,
    verify: (ref) => {
      if (![PUBLICATION_TYPES.THESIS, PUBLICATION_TYPES.DISSERTATION].includes(ref.type)) return true;
      return !!ref.thesisType && ['Master\'s thesis', 'Doctoral dissertation', 'Bachelor\'s thesis'].includes(ref.thesisType);
    },
    gravity: GRAVITY.MID,
    message: 'Thesis/dissertation references should specify the type (e.g., "Master\'s thesis")',
    required: true,
    types: [PUBLICATION_TYPES.THESIS, PUBLICATION_TYPES.DISSERTATION]
  },
  {
    id: 'apa7-thesis-institution-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.SOURCE,
    source: 'APA 7th Manual, Section 10.6',
    verifiable: true,
    verify: (ref) => {
      if (![PUBLICATION_TYPES.THESIS, PUBLICATION_TYPES.DISSERTATION].includes(ref.type)) return true;
      return !!ref.institution && ref.institution.trim() !== '';
    },
    gravity: GRAVITY.HIGH,
    message: 'Institution is required for thesis and dissertation references',
    required: true,
    types: [PUBLICATION_TYPES.THESIS, PUBLICATION_TYPES.DISSERTATION]
  }
];

/**
 * Website specific rules
 */
const websiteRules = [
  {
    id: 'apa7-website-author-or-title',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 10.16',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.WEBSITE) return true;
      return !!ref.author || !!ref.title;
    },
    gravity: GRAVITY.MID,
    message: 'Website references should include author or title',
    required: true,
    types: [PUBLICATION_TYPES.WEBSITE]
  },
  {
    id: 'apa7-website-date-format',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 10.16',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.WEBSITE) return true;
      // Website can have publication date or retrieval date
      return !!ref.year || !!ref.date || !!ref.accessed;
    },
    gravity: GRAVITY.LOW,
    message: 'Website references should include publication date or retrieval date',
    required: false,
    types: [PUBLICATION_TYPES.WEBSITE]
  }
];

/**
 * Software/GitHub specific rules
 */
const softwareRules = [
  {
    id: 'apa7-software-author-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 10.10',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.SOFTWARE_GITHUB) return true;
      return !!ref.author || !!ref.organization;
    },
    gravity: GRAVITY.HIGH,
    message: 'Software references should include author or organization',
    required: true,
    types: [PUBLICATION_TYPES.SOFTWARE_GITHUB]
  },
  {
    id: 'apa7-software-version',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 10.10',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.SOFTWARE_GITHUB) return true;
      return !!ref.version || !!ref.release;
    },
    gravity: GRAVITY.LOW,
    message: 'Software references should include version or release information',
    required: false,
    types: [PUBLICATION_TYPES.SOFTWARE_GITHUB]
  }
];

/**
 * Dataset/DOI specific rules
 */
const datasetRules = [
  {
    id: 'apa7-dataset-doi-required',
    edition: EDITIONS.APA_7,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 7th Manual, Section 10.8',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.DATASET_DOI) return true;
      return !!ref.doi || !!ref.url;
    },
    gravity: GRAVITY.HIGH,
    message: 'Dataset references should include DOI',
    required: true,
    types: [PUBLICATION_TYPES.DATASET_DOI]
  }
];

/**
 * Radio/Interview specific rules
 */
const radioRules = [
  {
    id: 'apa7-radio-interview-host',
    edition: EDITIONS.APA_7,
    profile: PROFILES.AUTHOR,
    source: 'APA 7th Manual, Section 10.12',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.RADIO_INTERVIEW) return true;
      return !!ref.interviewer || !!ref.host || !!ref.author;
    },
    gravity: GRAVITY.MID,
    message: 'Radio/interview references should include interviewer or host',
    required: true,
    types: [PUBLICATION_TYPES.RADIO_INTERVIEW]
  },
  {
    id: 'apa7-radio-broadcast-date',
    edition: EDITIONS.APA_7,
    profile: PROFILES.DATE,
    source: 'APA 7th Manual, Section 10.12',
    verifiable: true,
    verify: (ref) => {
      if (ref.type !== PUBLICATION_TYPES.RADIO_INTERVIEW) return true;
      return !!ref.broadcastDate || !!ref.year;
    },
    gravity: GRAVITY.HIGH,
    message: 'Radio/interview references should include broadcast date',
    required: true,
    types: [PUBLICATION_TYPES.RADIO_INTERVIEW]
  }
];

// =============================================================================
// RULE REGISTRY
// =============================================================================

/**
 * Complete registry of all APA rules organized by edition
 * @type {Map<string, APARule[]>}
 */
const ruleRegistry = new Map();

// Register APA 7 rules
ruleRegistry.set(EDITIONS.APA_7, [
  ...authorRules,
  ...dateRules,
  ...titleRules,
  ...sourceRules,
  ...identifierRules,
  ...thesisRules,
  ...websiteRules,
  ...softwareRules,
  ...datasetRules,
  ...radioRules
]);

// Register APA 6 adapted rules (backward compatibility)
ruleRegistry.set(EDITIONS.APA_6, [
  ...authorRules.map(rule => ({ ...rule, edition: EDITIONS.APA_6 })),
  ...dateRules.map(rule => ({ ...rule, edition: EDITIONS.APA_6 })),
  ...titleRules.map(rule => ({ ...rule, edition: EDITIONS.APA_6 })),
  ...sourceRules.map(rule => ({ ...rule, edition: EDITIONS.APA_6 })),
  // APA 6 requires "Retrieved from" for URLs
  {
    id: 'apa6-identifier-retrieved-required',
    edition: EDITIONS.APA_6,
    profile: PROFILES.IDENTIFIER,
    source: 'APA 6th Manual, Section 7.01',
    verifiable: true,
    verify: (ref) => {
      if (!ref.url) return true;
      // In APA 6, URL without DOI requires "Retrieved from"
      if (!ref.doi && ref.url && !ref.retrievedFrom) return false;
      return true;
    },
    gravity: GRAVITY.HIGH,
    message: 'APA 6 requires "Retrieved from" for URLs without DOI',
    required: true,
    types: [PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB]
  }
]);

// Register MLA 9 rules (basic compatibility)
ruleRegistry.set(EDITIONS.MLA_9, [
  {
    id: 'mla9-author-required',
    edition: EDITIONS.MLA_9,
    profile: PROFILES.AUTHOR,
    source: 'MLA 9th Handbook, Section 2.2',
    verifiable: true,
    verify: (ref) => !!ref.author || !!ref.editor,
    gravity: GRAVITY.HIGH,
    message: 'Author or editor is required in MLA 9',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'mla9-title-italic',
    edition: EDITIONS.MLA_9,
    profile: PROFILES.FORMATTING,
    source: 'MLA 9th Handbook, Section 2.4',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'MLA 9 uses italics for containers (books, journals, websites)',
    required: true,
    types: [PUBLICATION_TYPES.BOOK, PUBLICATION_TYPES.JOURNAL_ARTICLE, PUBLICATION_TYPES.WEBSITE]
  },
  {
    id: 'mla9-access-date',
    edition: EDITIONS.MLA_9,
    profile: PROFILES.DATE,
    source: 'MLA 9th Handbook, Section 5.110',
    verifiable: true,
    verify: (ref) => {
      if (!ref.url) return true;
      return !!ref.accessed; // MLA 9 recommends access date for online sources
    },
    gravity: GRAVITY.LOW,
    message: 'MLA 9 recommends including access date for online sources',
    required: false,
    types: [PUBLICATION_TYPES.WEBSITE, PUBLICATION_TYPES.SOFTWARE_GITHUB, PUBLICATION_TYPES.DATASET_DOI]
  }
]);

// Register Harvard rules (basic compatibility)
ruleRegistry.set(EDITIONS.HARVARD, [
  {
    id: 'harvard-author-year-required',
    edition: EDITIONS.HARVARD,
    profile: PROFILES.AUTHOR,
    source: 'Harvard Style Guide',
    verifiable: true,
    verify: (ref) => !!ref.author && (!!ref.year || !!ref.date),
    gravity: GRAVITY.HIGH,
    message: 'Author and year are required in Harvard style',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'harvard-year-in-parentheses',
    edition: EDITIONS.HARVARD,
    profile: PROFILES.FORMATTING,
    source: 'Harvard Style Guide',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Year should be in parentheses in Harvard style',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  }
]);

// Register Chicago rules (basic compatibility)
ruleRegistry.set(EDITIONS.CHICAGO, [
  {
    id: 'chicago-author-required',
    edition: EDITIONS.CHICAGO,
    profile: PROFILES.AUTHOR,
    source: 'Chicago Manual of Style, 17th Edition',
    verifiable: true,
    verify: (ref) => !!ref.author,
    gravity: GRAVITY.HIGH,
    message: 'Author is required in Chicago style',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  },
  {
    id: 'chicago-footnotes',
    edition: EDITIONS.CHICAGO,
    profile: PROFILES.FORMATTING,
    source: 'Chicago Manual of Style, 17th Edition',
    verifiable: false,
    verify: () => true,
    gravity: GRAVITY.LOW,
    message: 'Chicago style uses footnotes for citations',
    required: true,
    types: Object.values(PUBLICATION_TYPES)
  }
]);

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get all rules for a specific edition
 * @param {string} edition - The edition identifier (e.g., 'APA 7')
 * @returns {APARule[]} Array of rules for the edition
 */
function getRulesByEdition(edition) {
  return ruleRegistry.get(edition) || [];
}

/**
 * Get all registered editions
 * @returns {string[]} Array of edition identifiers
 */
function getRegisteredEditions() {
  return Array.from(ruleRegistry.keys());
}

/**
 * Get rules by publication type
 * @param {string} type - The publication type
 * @param {string} edition - The edition (default: APA 7)
 * @returns {APARule[]} Array of rules applicable to the type
 */
function getRulesByType(type, edition = EDITIONS.APA_7) {
  const rules = getRulesByEdition(edition);
  return rules.filter(rule => rule.types.includes(type));
}

/**
 * Get rules by profile/category
 * @param {string} profile - The profile/category
 * @param {string} edition - The edition (default: APA 7)
 * @returns {APARule[]} Array of rules in the profile
 */
function getRulesByProfile(profile, edition = EDITIONS.APA_7) {
  const rules = getRulesByEdition(edition);
  return rules.filter(rule => rule.profile === profile);
}

/**
 * Get a specific rule by ID
 * @param {string} ruleId - The rule identifier
 * @param {string} edition - The edition (optional)
 * @returns {APARule|null} The rule or null if not found
 */
function getRuleById(ruleId, edition) {
  if (edition) {
    const rules = getRulesByEdition(edition);
    return rules.find(rule => rule.id === ruleId) || null;
  }
  // Search across all editions
  for (const [, rules] of ruleRegistry) {
    const found = rules.find(rule => rule.id === ruleId);
    if (found) return found;
  }
  return null;
}

/**
 * Get all rules across all editions
 * @returns {APARule[]} Array of all rules
 */
function getAllRules() {
  const allRules = [];
  for (const [, rules] of ruleRegistry) {
    allRules.push(...rules);
  }
  return allRules;
}

/**
 * Validate a reference against all applicable rules for a given edition and type
 * @param {Object} reference - The reference object to validate
 * @param {Object} options - Options for validation
 * @param {string} options.edition - The edition to validate against (default: 'APA 7')
 * @param {string} options.type - The publication type (default: 'journal-article')
 * @param {boolean} options.includeOptional - Include optional rules (default: true)
 * @returns {Object} Validation result with issues, warnings, and rule details
 */
function validateReferenceAgainstRules(reference, options = {}) {
  const {
    edition = EDITIONS.APA_7,
    type = PUBLICATION_TYPES.JOURNAL_ARTICLE,
    includeOptional = true
  } = options;

  const rules = getRulesByEdition(edition).filter(rule => 
    rule.types.includes(type) && 
    (includeOptional || rule.required)
  );

  const issues = [];
  const warnings = [];
  const passed = [];

  for (const rule of rules) {
    try {
      const result = rule.verify(reference);
      if (result === false) {
        const issue = {
          rule: rule.id,
          message: rule.message,
          gravity: rule.gravity,
          required: rule.required,
          source: rule.source,
          profile: rule.profile
        };
        if (rule.required) {
          issues.push(issue);
        } else {
          warnings.push(issue);
        }
      } else {
        passed.push({
          rule: rule.id,
          message: rule.message,
          gravity: rule.gravity,
          required: rule.required
        });
      }
    } catch (error) {
      // If verification throws, mark as warning
      warnings.push({
        rule: rule.id,
        message: `Verification error: ${error.message}`,
        gravity: GRAVITY.LOW,
        required: false,
        source: rule.source,
        profile: rule.profile
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    passed,
    totalRules: rules.length,
    passedCount: passed.length,
    failedCount: issues.length + warnings.length
  };
}

/**
 * Check if a rule ID exists
 * @param {string} ruleId - The rule identifier
 * @returns {boolean} True if the rule exists
 */
function hasRule(ruleId) {
  return getRuleById(ruleId) !== null;
}

/**
 * Count rules by edition
 * @returns {Object} Object with edition names as keys and rule counts as values
 */
function countRulesByEdition() {
  const counts = {};
  for (const [edition, rules] of ruleRegistry) {
    counts[edition] = rules.length;
  }
  return counts;
}

/**
 * Count rules by profile
 * @param {string} edition - The edition (default: APA 7)
 * @returns {Object} Object with profile names as keys and rule counts as values
 */
function countRulesByProfile(edition = EDITIONS.APA_7) {
  const rules = getRulesByEdition(edition);
  const counts = {};
  for (const rule of rules) {
    counts[rule.profile] = (counts[rule.profile] || 0) + 1;
  }
  return counts;
}

// =============================================================================
// EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Constants
    PUBLICATION_TYPES,
    GRAVITY,
    EDITIONS,
    PROFILES,
    
    // Registry functions
    getRulesByEdition,
    getRegisteredEditions,
    getRulesByType,
    getRulesByProfile,
    getRuleById,
    getAllRules,
    
    // Validation
    validateReferenceAgainstRules,
    
    // Utility
    hasRule,
    countRulesByEdition,
    countRulesByProfile
  };
}
