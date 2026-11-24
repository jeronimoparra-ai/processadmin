// =============================================================================
// ACADEMIC VALIDATOR - Domain Layer (Vanilla JS - No Dependencies)
// APA 7 Validation Engine with Traceability and Academic Integrity Checks
// =============================================================================

/**
 * @typedef {Object} ValidationContext
 * @property {string} requirementId - Unique requirement identifier
 * @property {string} section - Document section (e.g., 'references', 'citations')
 * @property {string} edition - APA edition being validated against
 * @property {string} source - Normative source reference
 * @property {string} documentVersion - Stable document version identifier
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string} type - Result type: 'official', 'institutional', 'teacher', 'recommendation', 'automatic', 'manual'
 * @property {'high'|'mid'|'low'} gravity - Error severity
 * @property {boolean} verifiable - Whether this can be automatically verified
 * @property {boolean} required - Whether this is a required check
 * @property {string} message - Human-readable message
 * @property {string[]} evidence - Evidence supporting this result
 * @property {ValidationContext} context - Validation context
 * @property {number} timestamp - Validation timestamp
 * @property {string} validatorId - ID of the validator/rule that produced this
 */

/**
 * @typedef {Object} AcademicValidationReport
 * @property {string} documentId - Unique document identifier
 * @property {string} version - Document version
 * @property {string} edition - APA edition used
 * @property {ValidationResult[]} results - All validation results
 * @property {ValidationResult[]} errors - High severity issues
 * @property {ValidationResult[]} warnings - Mid severity issues
 * @property {ValidationResult[]} info - Low severity issues
 * @property {number} totalChecks - Total number of checks performed
 * @property {number} passedChecks - Number of checks passed
 * @property {number} failedChecks - Number of checks failed
 * @property {Date} validatedAt - When validation occurred
 * @property {TraceabilityEntry[]} traceability - Full traceability log
 */

/**
 * @typedef {Object} TraceabilityEntry
 * @property {string} id - Unique entry identifier
 * @property {string} requirement - The requirement being checked
 * @property {string} section - Document section
 * @property {string} evidence - Evidence found or missing
 * @property {boolean} passed - Whether the check passed
 * @property {string} validationType - Type of validation
 * @property {number} timestamp - When this was recorded
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Validation types according to academic standards
 * @type {Readonly<{OFFICIAL: string, INSTITUTIONAL: string, TEACHER: string, RECOMMENDATION: string, AUTOMATIC: string, MANUAL: string}>}
 */
const VALIDATION_TYPES = Object.freeze({
  OFFICIAL: 'official',
  INSTITUTIONAL: 'institutional',
  TEACHER: 'teacher',
  RECOMMENDATION: 'recommendation',
  AUTOMATIC: 'automatic',
  MANUAL: 'manual'
});

/**
 * Gravity levels
 * @type {Readonly<{HIGH: 'high', MID: 'mid', LOW: 'low'}>}
 */
const GRAVITY = Object.freeze({
  HIGH: 'high',
  MID: 'mid',
  LOW: 'low'
});

/**
 * Normative source references for APA 7
 */
const NORMA_SOURCES = Object.freeze({
  APA_7_MANUAL: 'APA 7th Manual',
  APA_WEBSITE: 'https://apastyle.apa.org',
  PURDUE_OWL: 'https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/general_format.html',
  APA_STYLE_BLOG: 'https://apastyle.apa.org/blog',
  INSTITUTIONAL_GUIDE: 'Institutional Style Guide'
});

// =============================================================================
// VALIDATION ENGINE
// =============================================================================

/**
 * Academic Validator for APA 7 and related standards
 * @namespace academicValidator
 */
const academicValidator = {
  VALIDATION_TYPES,
  GRAVITY,
  NORMA_SOURCES
};

/**
 * Generate unique ID for requirements and validations
 * @returns {string} UUID-like identifier
 */
function generateId() {
  // Simple UUID v4-like generator without external dependencies
  const hex = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += hex[Math.floor(Math.random() * 16)];
    if (i === 7 || i === 11 || i === 15 || i === 19) {
      result += '-';
    }
  }
  return result;
}

/**
 * Generate stable document version ID
 * @param {string} content - Document content or hash
 * @param {string} [prefix] - Optional prefix
 * @returns {string} Stable version identifier
 */
function generateDocumentVersion(content, prefix = 'ver') {
  if (!content) return `${prefix}_${Date.now()}`;
  
  // Simple hash based on content
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${prefix}_${Math.abs(hash).toString(16)}_${Date.now()}`;
}

// =============================================================================
// REQUIREMENT DEFINEER
// =============================================================================

/**
 * Define a new validation requirement
 * @param {Object} config - Requirement configuration
 * @param {string} config.id - Requirement identifier
 * @param {string} config.description - Human-readable description
 * @param {Function} config.check - Validation function
 * @param {string} config.section - Document section
 * @param {string} config.edition - APA edition
 * @param {string} config.source - Normative source
 * @param {string} config.type - Validation type
 * @param {string} config.gravity - Severity level
 * @param {boolean} config.verifiable - Can be automatically verified
 * @param {boolean} config.required - Is mandatory
 * @returns {Object} Requirement object
 */
function defineRequirement(config) {
  return {
    id: config.id || generateId(),
    description: config.description,
    check: config.check,
    section: config.section,
    edition: config.edition || 'APA 7',
    source: config.source || NORMA_SOURCES.APA_7_MANUAL,
    type: config.type || VALIDATION_TYPES.AUTOMATIC,
    gravity: config.gravity || GRAVITY.MID,
    verifiable: config.verifiable !== undefined ? config.verifiable : true,
    required: config.required !== undefined ? config.required : true
  };
}

// =============================================================================
// PREDEFINED REQUIREMENTS
// =============================================================================

/**
 * Create predefined APA 7 requirements
 * These are mapped to the rule definitions in apaRules.js
 */
const predefinedRequirements = {
  // Author requirements
  REQ_AUTHOR_PRESENT: defineRequirement({
    id: 'req_apa7_author_present',
    description: 'Reference must include author information',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.7',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.HIGH,
    verifiable: true,
    required: true,
    check: (ref) => !!ref.author && ref.author.trim() !== ''
  }),

  REQ_AUTHOR_FORMAT: defineRequirement({
    id: 'req_apa7_author_format',
    description: 'Author names must follow APA 7 format (surname, initials)',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.8',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: true,
    check: (ref) => {
      if (!ref.author) return false;
      // Check if author follows surname, initials format
      const parts = ref.author.split(', ');
      if (parts.length < 2) return true; // Institutional authors are OK
      const initials = parts.slice(1).join(' ');
      return /^[A-Z][.]?(\s[A-Z][.])?$/.test(initials);
    }
  }),

  // Date requirements
  REQ_DATE_PRESENT: defineRequirement({
    id: 'req_apa7_date_present',
    description: 'Reference must include publication date/year',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.10',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.HIGH,
    verifiable: true,
    required: true,
    check: (ref) => !!ref.year || !!ref.date
  }),

  REQ_DATE_FORMAT: defineRequirement({
    id: 'req_apa7_date_format',
    description: 'Date must be in YYYY format or "s.f." for unknown dates',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.10',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: true,
    check: (ref) => {
      if (!ref.year && !ref.date) return false;
      if (ref.year === 's.f.' || ref.date === 's.f.') return true;
      if (ref.year === 'n.d.' || ref.date === 'n.d.') return true;
      if (ref.year && /^\d{4}$/.test(ref.year)) return true;
      if (ref.date && /^\d{4}/.test(ref.date)) return true;
      return false;
    }
  }),

  // Title requirements
  REQ_TITLE_PRESENT: defineRequirement({
    id: 'req_apa7_title_present',
    description: 'Reference must include a title',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.18',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.HIGH,
    verifiable: true,
    required: true,
    check: (ref) => !!ref.title && ref.title.trim() !== ''
  }),

  REQ_TITLE_SENTENCE_CASE: defineRequirement({
    id: 'req_apa7_title_sentence_case',
    description: 'Titles should use sentence case in references',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.18',
    type: VALIDATION_TYPES.RECOMMENDATION,
    gravity: GRAVITY.LOW,
    verifiable: false, // Hard to verify automatically
    required: false,
    check: () => true
  }),

  // Source requirements
  REQ_SOURCE_PRESENT: defineRequirement({
    id: 'req_apa7_source_present',
    description: 'Reference must include source information (publisher/journal)',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.29',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.HIGH,
    verifiable: true,
    required: true,
    check: (ref) => !!ref.source || !!ref.publisher || !!ref.journal
  }),

  // Identifier requirements
  REQ_DOI_OR_URL: defineRequirement({
    id: 'req_apa7_doi_or_url',
    description: 'Online sources should include DOI or URL',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.34',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: false,
    check: (ref) => {
      const onlineTypes = ['website', 'software-github', 'dataset-doi'];
      if (!onlineTypes.includes(ref.type)) return true;
      return !!ref.doi || !!ref.url;
    }
  }),

  // Thesis-specific requirements
  REQ_THESIS_INSTITUTION: defineRequirement({
    id: 'req_apa7_thesis_institution',
    description: 'Thesis/dissertation references must include institution',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 10.6',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.HIGH,
    verifiable: true,
    required: true,
    check: (ref) => {
      if (!['thesis', 'dissertation'].includes(ref.type)) return true;
      return !!ref.institution && ref.institution.trim() !== '';
    }
  }),

  REQ_THESIS_TYPE: defineRequirement({
    id: 'req_apa7_thesis_type',
    description: 'Thesis/dissertation references should specify type',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 10.6',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: true,
    check: (ref) => {
      if (!['thesis', 'dissertation'].includes(ref.type)) return true;
      return !!ref.thesisType && ['Master\'s thesis', 'Doctoral dissertation', 'Bachelor\'s thesis'].includes(ref.thesisType);
    }
  }),

  // Website-specific requirements
  REQ_WEBSITE_AUTHOR_OR_TITLE: defineRequirement({
    id: 'req_apa7_website_author_or_title',
    description: 'Website references should include author or title',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 10.16',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: true,
    check: (ref) => {
      if (ref.type !== 'website') return true;
      return !!ref.author || !!ref.title;
    }
  }),

  // DOI format
  REQ_DOI_FORMAT: defineRequirement({
    id: 'req_apa7_doi_format',
    description: 'DOI should be in correct format (10.xxxx/...)',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.34',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.MID,
    verifiable: true,
    required: false,
    check: (ref) => {
      if (!ref.doi) return true;
      return /^10\.\d{4,}(?:\.\d+)*\/\S+$/i.test(ref.doi) || /^https?:\/\/doi\.org\/10\.\d+/i.test(ref.doi);
    }
  }),

  // URL format
  REQ_URL_FORMAT: defineRequirement({
    id: 'req_apa7_url_format',
    description: 'URL should start with http:// or https://',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 9.34',
    type: VALIDATION_TYPES.OFFICIAL,
    gravity: GRAVITY.LOW,
    verifiable: true,
    required: false,
    check: (ref) => {
      if (!ref.url) return true;
      return /^https?:\/\/.+/.test(ref.url);
    }
  }),

  // Journal-specific requirements
  REQ_JOURNAL_VOLUME: defineRequirement({
    id: 'req_apa7_journal_volume',
    description: 'Journal articles should include volume number',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 10.1',
    type: VALIDATION_TYPES.RECOMMENDATION,
    gravity: GRAVITY.LOW,
    verifiable: true,
    required: false,
    check: (ref) => {
      if (ref.type !== 'journal-article') return true;
      return !!ref.volume;
    }
  }),

  // Pages format
  REQ_PAGES_FORMAT: defineRequirement({
    id: 'req_apa7_pages_format',
    description: 'Page ranges should be in format: 123-145',
    section: 'references',
    edition: 'APA 7',
    source: 'APA 7th Manual, Section 10.1',
    type: VALIDATION_TYPES.RECOMMENDATION,
    gravity: GRAVITY.LOW,
    verifiable: true,
    required: false,
    check: (ref) => {
      if (!ref.pages) return true;
      return /^\d+-\d+$/.test(ref.pages) || /^pp\. \d+-\d+$/.test(ref.pages);
    }
  })
};

// =============================================================================
// VALIDATOR CORE
// =============================================================================

/**
 * Validate a single reference against a requirement
 * @param {Object} reference - Reference object to validate
 * @param {Object} requirement - Requirement to check
 * @param {ValidationContext} context - Validation context
 * @returns {ValidationResult} Validation result
 */
function validateAgainstRequirement(reference, requirement, context = {}) {
  const startTime = Date.now();
  
  // Check if requirement is applicable to this reference type
  const typeMatch = !requirement.types || 
    (reference.type && requirement.types.includes(reference.type)) ||
    !reference.type;
  
  if (!typeMatch && requirement.types && requirement.types.length > 0) {
    return {
      isValid: true,
      type: VALIDATION_TYPES.AUTOMATIC,
      gravity: GRAVITY.LOW,
      verifiable: true,
      required: false,
      message: `Requirement ${requirement.id} not applicable to type ${reference.type || 'unknown'}`,
      evidence: [],
      context: {
        ...context,
        requirementId: requirement.id,
        documentVersion: context.documentVersion || generateDocumentVersion(JSON.stringify(reference))
      },
      timestamp: startTime,
      validatorId: requirement.id
    };
  }
  
  try {
    const result = requirement.check(reference);
    
    const validationResult = {
      isValid: result,
      type: requirement.type,
      gravity: requirement.gravity,
      verifiable: requirement.verifiable,
      required: requirement.required,
      message: result ? requirement.description : `Validation failed: ${requirement.description}`,
      evidence: result ? ['Requirement met'] : ['Requirement not met'],
      context: {
        ...context,
        requirementId: requirement.id,
        documentVersion: context.documentVersion || generateDocumentVersion(JSON.stringify(reference))
      },
      timestamp: startTime,
      validatorId: requirement.id
    };
    
    return validationResult;
  } catch (error) {
    return {
      isValid: false,
      type: requirement.type,
      gravity: GRAVITY.HIGH,
      verifiable: requirement.verifiable,
      required: requirement.required,
      message: `Validation error for ${requirement.id}: ${error.message}`,
      evidence: [`Error: ${error.message}`],
      context: {
        ...context,
        requirementId: requirement.id,
        documentVersion: context.documentVersion || generateDocumentVersion(JSON.stringify(reference))
      },
      timestamp: startTime,
      validatorId: requirement.id
    };
  }
}

/**
 * Validate a reference against all applicable requirements
 * @param {Object} reference - Reference object to validate
 * @param {Object} options - Validation options
 * @param {Object[]} options.requirements - Specific requirements to validate against
 * @param {string} options.edition - APA edition
 * @param {string} options.documentVersion - Document version ID
 * @param {string} options.section - Document section
 * @returns {AcademicValidationReport} Full validation report
 */
function validateReference(reference, options = {}) {
  const {
    requirements = Object.values(predefinedRequirements),
    edition = 'APA 7',
    documentVersion,
    section = 'references'
  } = options;
  
  const docVersion = documentVersion || generateDocumentVersion(JSON.stringify(reference));
  const context = { edition, section, documentVersion: docVersion };
  
  const results = [];
  const traceability = [];
  let passedChecks = 0;
  let failedChecks = 0;
  
  for (const requirement of requirements) {
    const result = validateAgainstRequirement(reference, requirement, context);
    results.push(result);
    
    // Add to traceability
    traceability.push({
      id: generateId(),
      requirement: requirement.id,
      section,
      evidence: result.isValid ? 'Requirement met' : 'Requirement not met',
      passed: result.isValid,
      validationType: requirement.type,
      timestamp: result.timestamp
    });
    
    if (result.isValid) {
      passedChecks++;
    } else if (result.required) {
      failedChecks++;
    }
  }
  
  // Categorize results
  const errors = results.filter(r => r.gravity === GRAVITY.HIGH && !r.isValid);
  const warnings = results.filter(r => r.gravity === GRAVITY.MID && !r.isValid);
  const info = results.filter(r => r.gravity === GRAVITY.LOW && !r.isValid);
  
  return {
    documentId: generateId(),
    version: docVersion,
    edition,
    results,
    errors,
    warnings,
    info,
    totalChecks: requirements.length,
    passedChecks,
    failedChecks,
    validatedAt: new Date(),
    traceability
  };
}

/**
 * Validate multiple references
 * @param {Object[]} references - Array of reference objects
 * @param {Object} options - Validation options
 * @returns {AcademicValidationReport} Combined validation report
 */
function validateReferences(references, options = {}) {
  const allResults = [];
  const allTraceability = [];
  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  
  for (const reference of references) {
    const report = validateReference(reference, options);
    allResults.push(...report.results);
    allTraceability.push(...report.traceability);
    totalChecks += report.totalChecks;
    passedChecks += report.passedChecks;
    failedChecks += report.failedChecks;
  }
  
  const errors = allResults.filter(r => r.gravity === GRAVITY.HIGH && !r.isValid);
  const warnings = allResults.filter(r => r.gravity === GRAVITY.MID && !r.isValid);
  const info = allResults.filter(r => r.gravity === GRAVITY.LOW && !r.isValid);
  
  return {
    documentId: generateId(),
    version: generateDocumentVersion(JSON.stringify(references)),
    edition: options.edition || 'APA 7',
    results: allResults,
    errors,
    warnings,
    info,
    totalChecks,
    passedChecks,
    failedChecks,
    validatedAt: new Date(),
    traceability: allTraceability
  };
}

// =============================================================================
// INTEGRATION WITH APA RULES
// =============================================================================

/**
 * Validate a reference using the APA rules engine (from apaRules.js)
 * This provides integration between the rule-based validation and requirement-based validation
 * @param {Object} reference - Reference object
 * @param {Object} options - Validation options
 * @param {string} options.edition - APA edition
 * @param {string} options.type - Publication type
 * @returns {Object} Combined validation result
 */
function validateWithRules(reference, options = {}) {
  const {
    edition = 'APA 7',
    type = 'journal-article'
  } = options;
  
  // Import rules if available (in real usage, this would be from apaRules.js)
  let rules = [];
  
  try {
    // Try to get rules from the apaRules module
    if (typeof require !== 'undefined') {
      const apaRules = require('./apaRules.js');
      rules = apaRules.getRulesByType(type, edition);
    }
  } catch (error) {
    // Fallback: use basic validation
    console.warn('Could not load apaRules module, using basic validation');
  }
  
  // Perform requirement-based validation
  const report = validateReference(reference, { 
    edition,
    section: 'references'
  });
  
  // Add rule-based validation results if available
  if (rules.length > 0) {
    const ruleEngine = typeof require !== 'undefined' ? require('./apaRules.js') : null;
    if (ruleEngine && typeof ruleEngine.validateReferenceAgainstRules === 'function') {
      const ruleResult = ruleEngine.validateReferenceAgainstRules(reference, { edition, type });
      
      // Map rule results to validation results
      const ruleValidationResults = ruleResult.issues.map(issue => ({
        isValid: false,
        type: VALIDATION_TYPES.OFFICIAL,
        gravity: issue.gravity,
        verifiable: true,
        required: true,
        message: issue.message,
        evidence: [`Rule ${issue.rule} failed`],
        context: {
          requirementId: `rule_${issue.rule}`,
          edition,
          section: 'references',
          documentVersion: generateDocumentVersion(JSON.stringify(reference))
        },
        timestamp: Date.now(),
        validatorId: `rule_${issue.rule}`
      }));
      
      report.results.push(...ruleValidationResults);
      report.totalChecks += ruleResult.totalRules;
      report.passedChecks += ruleResult.passedCount;
      report.failedChecks += ruleResult.failedCount;
      
      // Update categorized results
      const newErrors = ruleValidationResults.filter(r => r.gravity === GRAVITY.HIGH);
      const newWarnings = ruleValidationResults.filter(r => r.gravity === GRAVITY.MID);
      const newInfo = ruleValidationResults.filter(r => r.gravity === GRAVITY.LOW);
      
      report.errors = [...report.errors, ...newErrors];
      report.warnings = [...report.warnings, ...newWarnings];
      report.info = [...report.info, ...newInfo];
    }
  }
  
  return report;
}

// =============================================================================
// CITATION CONSISTENCY CHECKER
// =============================================================================

/**
 * Check consistency between in-text citations and reference list
 * @param {string} documentContent - Full document content
 * @param {Object[]} references - Reference list
 * @param {Object} options - Options
 * @returns {Object} Consistency report
 */
function checkCitationConsistency(documentContent, references, options = {}) {
  const { edition = 'APA 7' } = options;
  
  // Extract in-text citations from content
  const inTextCitations = extractInTextCitations(documentContent);
  const referenceAuthors = extractReferenceAuthors(references);
  
  const results = [];
  const traceability = [];
  
  // Check for citations without corresponding references
  const uncited = inTextCitations.filter(citation => {
    const author = extractAuthorFromCitation(citation);
    return !referenceAuthors.includes(author);
  });
  
  if (uncited.length > 0) {
    results.push({
      isValid: false,
      type: VALIDATION_TYPES.AUTOMATIC,
      gravity: GRAVITY.HIGH,
      verifiable: true,
      required: true,
      message: `${uncited.length} citation(s) do not have corresponding references`,
      evidence: uncited,
      context: {
        requirementId: 'req_citation_consistency',
        edition,
        section: 'citations',
        documentVersion: generateDocumentVersion(documentContent)
      },
      timestamp: Date.now(),
      validatorId: 'citation_consistency'
    });
    
    traceability.push({
      id: generateId(),
      requirement: 'req_citation_consistency',
      section: 'citations',
      evidence: `Found ${uncited.length} uncited references: ${uncited.join(', ')}`,
      passed: false,
      validationType: VALIDATION_TYPES.AUTOMATIC,
      timestamp: Date.now()
    });
  }
  
  // Check for references without corresponding citations
  const unreferenced = referenceAuthors.filter(author => {
    return !inTextCitations.some(citation => extractAuthorFromCitation(citation) === author);
  });
  
  if (unreferenced.length > 0) {
    results.push({
      isValid: false,
      type: VALIDATION_TYPES.RECOMMENDATION,
      gravity: GRAVITY.LOW,
      verifiable: true,
      required: false,
      message: `${unreferenced.length} reference(s) are not cited in the text`,
      evidence: unreferenced,
      context: {
        requirementId: 'req_reference_usage',
        edition,
        section: 'references',
        documentVersion: generateDocumentVersion(documentContent)
      },
      timestamp: Date.now(),
      validatorId: 'reference_usage'
    });
    
    traceability.push({
      id: generateId(),
      requirement: 'req_reference_usage',
      section: 'references',
      evidence: `Found ${unreferenced.length} unused references: ${unreferenced.join(', ')}`,
      passed: false,
      validationType: VALIDATION_TYPES.RECOMMENDATION,
      timestamp: Date.now()
    });
  }
  
  return {
    documentId: generateId(),
    version: generateDocumentVersion(documentContent),
    edition,
    results,
    errors: results.filter(r => r.gravity === GRAVITY.HIGH),
    warnings: results.filter(r => r.gravity === GRAVITY.MID),
    info: results.filter(r => r.gravity === GRAVITY.LOW),
    totalChecks: 2,
    passedChecks: results.filter(r => r.isValid).length,
    failedChecks: results.filter(r => !r.isValid).length,
    validatedAt: new Date(),
    traceability,
    details: {
      inTextCitations,
      referenceAuthors,
      uncited,
      unreferenced
    }
  };
}

/**
 * Extract in-text citations from document content
 * @param {string} content - Document content
 * @returns {string[]} Array of extracted citations
 */
function extractInTextCitations(content) {
  if (!content) return [];
  
  // Match APA-style in-text citations: (Author, Year) or (Author, Year, p. X)
  const regex = /\(([^)]+)\)/g;
  const matches = content.match(regex) || [];
  
  return matches.map(m => m.slice(1, -1).trim());
}

/**
 * Extract author from in-text citation
 * @param {string} citation - In-text citation
 * @returns {string} Author name
 */
function extractAuthorFromCitation(citation) {
  if (!citation) return '';
  
  // Remove page references
  const withoutPages = citation.replace(/\s*,\s*p\.\s*\d+.*$/, '').replace(/\s*,\s*pp\.\s*\d+.*$/, '');
  
  // Extract author (before comma or year)
  const parts = withoutPages.split(',');
  if (parts.length > 0) {
    return parts[0].trim();
  }
  
  return citation.trim();
}

/**
 * Extract author names from references
 * @param {Object[]} references - Array of reference objects
 * @returns {string[]} Array of author names
 */
function extractReferenceAuthors(references) {
  return references
    .map(ref => {
      if (ref.author) {
        // Extract surname from formatted author
        if (ref.author.includes(',')) {
          return ref.author.split(',')[0].trim();
        }
        return ref.author.trim();
      }
      return null;
    })
    .filter(a => a && a !== '');
}

// =============================================================================
// EXPORTS
// =============================================================================

// Main validation functions
academicValidator.validateReference = validateReference;
academicValidator.validateReferences = validateReferences;
academicValidator.validateWithRules = validateWithRules;

// Consistency checker
academicValidator.checkCitationConsistency = checkCitationConsistency;

// Predefined requirements
academicValidator.predefinedRequirements = predefinedRequirements;
academicValidator.defineRequirement = defineRequirement;

// Validation types and constants
academicValidator.VALIDATION_TYPES = VALIDATION_TYPES;
academicValidator.GRAVITY = GRAVITY;
academicValidator.NORMA_SOURCES = NORMA_SOURCES;

// Utility functions
academicValidator.generateDocumentVersion = generateDocumentVersion;
academicValidator.generateId = generateId;

// Exports for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = academicValidator;
}

if (typeof exports !== 'undefined') {
  exports = academicValidator;
  module.exports = academicValidator;
}
