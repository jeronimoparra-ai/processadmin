// =============================================================================
// APA 7 CITATION GENERATOR - Domain Layer (Vanilla JS - No Dependencies)
// Bibliographic Reference Generation Engine for APA 7th Edition
// =============================================================================

/**
 * @typedef {Object} APASource
 * @property {string} [type] - Publication type (journal-article, book, chapter, etc.)
 * @property {string|string[]} author - Author(s) or institution
 * @property {string} [year] - Publication year (YYYY or 's.f.')
 * @property {string} [date] - Full publication date
 * @property {string} title - Title of the work
 * @property {string} [subtitle] - Subtitle (optional)
 * @property {string} [journal] - Journal name
 * @property {string} [volume] - Volume number
 * @property {string} [issue] - Issue number
 * @property {string} [pages] - Page range (e.g., '123-145')
 * @property {string} [publisher] - Publisher name
 * @property {string} [place] - Publication place (optional in APA 7)
 * @property {string} [edition] - Edition number/name
 * @property {string} [editor] - Editor name(s)
 * @property {string} [doi] - Digital Object Identifier
 * @property {string} [url] - URL
 * @property {string} [accessed] - Access date for online sources
 * @property {string} [institution] - Institution (for theses)
 * @property {string} [thesisType] - Type of thesis/dissertation
 * @property {string} [organization] - Organization (for software)
 * @property {string} [version] - Software version
 * @property {string} [isbn] - ISBN
 * @property {string} [issn] - ISSN
 */

/**
 * @typedef {Object} APAOptions
 * @property {boolean} [includeDOI] - Include DOI if available (default: true)
 * @property {boolean} [includeURL] - Include URL if available (default: true)
 * @property {boolean} [includeAccessDate] - Include access date for URLs (default: false for APA 7)
 * @property {string} [edition] - APA edition to follow (default: 'APA 7')
 */

/**
 * Publication type constants
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
 * APA 7th Edition citation generator
 * @namespace apa7
 */
const apa7 = {
  PUBLICATION_TYPES
};

// =============================================================================
// AUTHOR FORMATTING
// =============================================================================

/**
 * Format author names according to APA 7 rules
 * @param {string|string[]} authors - Single author string, array of authors, or institutional author
 * @returns {string} Formatted author string
 */
function formatAuthor(authors) {
  if (!authors) return '';
  
  // Handle array of authors
  if (Array.isArray(authors)) {
    if (authors.length === 0) return '';
    if (authors.length === 1) return formatSingleAuthor(authors[0]);
    return formatMultipleAuthors(authors);
  }
  
  // Handle single author string
  return formatSingleAuthor(authors);
}

/**
 * Format a single author name
 * @param {string} author - Author name string
 * @returns {string} Formatted author
 */
function formatSingleAuthor(author) {
  if (!author || typeof author !== 'string') return '';
  
  const trimmed = author.trim();
  if (trimmed === '') return '';
  
  // Institutional author (contains commas, periods, or is all caps)
  if (isInstitutionalAuthor(trimmed)) {
    return trimmed;
  }
  
  // Individual author: split into parts
  const parts = trimmed.split(/[,\s]+/);
  
  // If only one part, return as is
  if (parts.length === 1) {
    return trimmed;
  }
  
  // Last name first, then initials
  const lastName = parts[0];
  const firstParts = parts.slice(1);
  
  // Extract initials from first parts
  const initials = firstParts
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase() + '.')
    .join(' ');
  
  return `${lastName}, ${initials}`;
}

/**
 * Check if an author string represents an institutional author
 * @param {string} author - Author string
 * @returns {boolean} True if institutional
 */
function isInstitutionalAuthor(author) {
  if (!author) return false;
  
  // Check for common institutional indicators
  const institutionalIndicators = [
    'university', 'institute', 'organization', 'department', 'ministry',
    'government', 'company', 'corporation', 'association', 'society',
    'agency', 'commission', 'council', 'bureau', 'center', 'laboratory'
  ];
  
  const lower = author.toLowerCase();
  
  // All caps (likely acronym)
  if (author === author.toUpperCase() && author.length > 2) {
    return true;
  }
  
  // Contains any institutional indicator
  for (const indicator of institutionalIndicators) {
    if (lower.includes(indicator)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Format multiple authors according to APA 7 rules
 * @param {string[]} authors - Array of author strings
 * @returns {string} Formatted authors string
 */
function formatMultipleAuthors(authors) {
  if (!authors || authors.length === 0) return '';
  
  // Filter out empty authors
  const validAuthors = authors.filter(a => a && a.trim() !== '');
  if (validAuthors.length === 0) return '';
  if (validAuthors.length === 1) return formatSingleAuthor(validAuthors[0]);
  
  // Format each author
  const formatted = validAuthors.map(formatSingleAuthor);
  
  // APA 7 rules:
  // - 1 author: just the author
  // - 2 authors: join with " and "
  // - 3-20 authors: separate with commas, use "&" before last
  // - 21+ authors: list first 19, then ..., then last
  
  if (formatted.length === 2) {
    return formatted.join(' & ');
  }
  
  if (formatted.length <= 20) {
    const allButLast = formatted.slice(0, -1).join(', ');
    return `${allButLast}, & ${formatted[formatted.length - 1]}`;
  }
  
  // More than 20 authors
  const first19 = formatted.slice(0, 19).join(', ');
  const last = formatted[formatted.length - 1];
  return `${first19}, ... , ${last}`;
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format publication date according to APA 7 rules
 * @param {string} year - Year string
 * @param {string} [date] - Full date string
 * @returns {string} Formatted date
 */
function formatDate(year, date) {
  if (!year && !date) return '';
  
  // Handle unknown date
  if (year === 's.f.' || date === 's.f.') return '(s.f.)';
  if (year === 'n.d.' || date === 'n.d.') return '(n.d.)';
  
  // If only year is provided
  if (year && !date) {
    return `(${year})`;
  }
  
  // If date is provided, use it
  if (date) {
    // APA 7 uses parentheses around year
    const yearMatch = date.match(/\d{4}/);
    if (yearMatch) {
      return `(${yearMatch[0]})`;
    }
    return `(${date})`;
  }
  
  return `(${year})`;
}

/**
 * Format access date for online sources
 * @param {string} accessed - Access date string
 * @returns {string} Formatted access date
 */
function formatAccessDate(accessed) {
  if (!accessed) return '';
  
  const dateObj = new Date(accessed);
  if (isNaN(dateObj.getTime())) {
    return accessed; // Return as-is if not valid date
  }
  
  // APA 7 format: YYYY, Month DD
  const year = dateObj.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[dateObj.getMonth()];
  const day = dateObj.getDate();
  
  return `${year}, ${month} ${day}`;
}

// =============================================================================
// TITLE FORMATTING
// =============================================================================

/**
 * Format title according to APA 7 rules (sentence case)
 * @param {string} title - Title string
 * @param {string} [subtitle] - Subtitle string
 * @param {boolean} [isItalic] - Whether to italicize (for books, journals)
 * @returns {string} Formatted title
 */
function formatTitle(title, subtitle, isItalic = false) {
  if (!title) return '';
  
  const formattedTitle = toSentenceCase(title);
  const formattedSubtitle = subtitle ? toSentenceCase(subtitle) : '';
  
  let result = formattedTitle;
  if (formattedSubtitle) {
    result += `: ${formattedSubtitle}`;
  }
  
  // Note: Italics are represented with asterisks in plain text
  // In actual rendering, this would be <em> or CSS italic
  if (isItalic) {
    result = `*${result}*`;
  }
  
  return result;
}

/**
 * Convert string to sentence case
 * @param {string} str - Input string
 * @returns {string} Sentence-cased string
 */
function toSentenceCase(str) {
  if (!str) return '';
  
  // Common lowercase words to keep lowercase (unless first word)
  const lowercaseWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'as', 'at',
    'by', 'for', 'in', 'of', 'on', 'per', 'to', 'via', 'from'
  ]);
  
  // Split into words, preserving punctuation
  const words = str.split(/(\s+)/);
  let isFirstWord = true;
  let result = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Skip whitespace
    if (/^\s+$/.test(word)) {
      result += word;
      isFirstWord = false;
      continue;
    }
    
    // Always capitalize first word
    if (isFirstWord) {
      result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      isFirstWord = false;
      continue;
    }
    
    // Capitalize after colon, semicolon, period followed by space
    if (i > 0 && /[:;.]$/.test(words[i - 1])) {
      result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      continue;
    }
    
    // Capitalize proper nouns and words in all caps
    if (word === word.toUpperCase() && word.length > 1 && !/^[\d]+$/.test(word)) {
      result += word;
      continue;
    }
    
    // Keep lowercase for certain words
    const lowerWord = word.toLowerCase();
    if (lowercaseWords.has(lowerWord)) {
      result += lowerWord;
      continue;
    }
    
    // Default: capitalize first letter, lowercase rest
    result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  
  return result;
}

// =============================================================================
// IDENTIFIER FORMATTING (DOI, URL)
// =============================================================================

/**
 * Format DOI according to APA 7 rules
 * @param {string} doi - DOI string
 * @returns {string} Formatted DOI
 */
function formatDOI(doi) {
  if (!doi) return '';
  
  // Clean DOI
  let cleanDOI = doi.trim().replace(/^https?:\/\/doi\.org\//i, '');
  
  // Ensure it starts with 10.
  if (!cleanDOI.startsWith('10.')) {
    cleanDOI = '10.' + cleanDOI;
  }
  
  return cleanDOI;
}

/**
 * Format URL according to APA 7 rules
 * @param {string} url - URL string
 * @returns {string} Formatted URL
 */
function formatURL(url) {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Remove trailing slash
  if (trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }
  
  return trimmed;
}

// =============================================================================
// JOURNAL ARTICLE FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a journal article
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatJournalArticle(source, options = {}) {
  const {
    includeDOI = true,
    includeURL = true
  } = options;
  
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle);
  const journal = source.journal ? toSentenceCase(source.journal) : '';
  
  // Build reference
  let reference = `${authors} ${date} ${title}.`;
  
  // Add journal information
  if (journal) {
    const italicJournal = `*${journal}*`;
    reference += ` ${italicJournal}`;
    
    if (source.volume) {
      reference += `, ${source.volume}`;
    }
    
    if (source.issue) {
      reference += `(${source.issue})`;
    }
    
    if (source.pages) {
      reference += `, ${source.pages}`;
    }
  }
  
  // Add DOI or URL
  const hasDOI = source.doi && formatDOI(source.doi);
  const hasURL = source.url && formatURL(source.url);
  
  if (hasDOI && includeDOI) {
    reference += ` https://doi.org/${formatDOI(source.doi)}`;
  } else if (hasURL && includeURL) {
    reference += ` ${source.url}`;
  }
  
  return reference.trim();
}

// =============================================================================
// BOOK FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a book
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatBook(source, options = {}) {
  const {
    includeDOI = true,
    includeURL = true
  } = options;
  
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle, true); // Books are italicized
  
  // Build reference
  let reference = `${authors} ${date} ${title}`;
  
  // Add edition if specified
  if (source.edition) {
    const editionNum = parseInt(source.edition, 10);
    if (!isNaN(editionNum)) {
      const ordinal = getOrdinalSuffix(editionNum);
      reference += ` (${ordinal} ed.)`;
    } else {
      reference += ` (${source.edition} ed.)`;
    }
  }
  
  // Add publisher
  if (source.publisher) {
    reference += ` ${source.publisher}`;
  }
  
  // Add DOI or URL
  const hasDOI = source.doi && formatDOI(source.doi);
  const hasURL = source.url && formatURL(source.url);
  
  if (hasDOI && includeDOI) {
    reference += ` https://doi.org/${formatDOI(source.doi)}`;
  } else if (hasURL && includeURL) {
    reference += ` ${source.url}`;
  }
  
  return reference.trim();
}

/**
 * Get ordinal suffix for edition number
 * @param {number} num - Number
 * @returns {string} Number with ordinal suffix
 */
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
}

// =============================================================================
// CHAPTER FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a book chapter
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatChapter(source, options = {}) {
  const {
    includeDOI = true,
    includeURL = true
  } = options;
  
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle); // Chapter titles are NOT italicized
  
  // Build reference
  let reference = `${authors} ${date} ${title}.`;
  
  // Add "In" and editor information
  if (source.editor) {
    reference += ` In ${formatAuthor(source.editor)}`;
    if (source.editorRole) {
      reference += ` (${source.editorRole})`;
    }
  } else if (source.bookTitle) {
    reference += ` In`;
  }
  
  // Add book title
  if (source.bookTitle) {
    reference += ` ${formatTitle(source.bookTitle, null, true)}`; // Book title is italicized
  }
  
  // Add pages
  if (source.pages) {
    reference += ` (pp. ${source.pages})`;
  }
  
  // Add publisher
  if (source.publisher) {
    reference += ` ${source.publisher}`;
  }
  
  // Add DOI or URL
  const hasDOI = source.doi && formatDOI(source.doi);
  const hasURL = source.url && formatURL(source.url);
  
  if (hasDOI && includeDOI) {
    reference += ` https://doi.org/${formatDOI(source.doi)}`;
  } else if (hasURL && includeURL) {
    reference += ` ${source.url}`;
  }
  
  return reference.trim();
}

// =============================================================================
// BOOKLET FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a booklet
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatBooklet(source, options = {}) {
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle, true);
  
  let reference = `${authors} ${date} ${title}`;
  
  if (source.publisher) {
    reference += ` ${source.publisher}`;
  }
  
  if (source.url) {
    reference += ` ${formatURL(source.url)}`;
  }
  
  return reference.trim();
}

// =============================================================================
// WEBSITE FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a website
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatWebsite(source, options = {}) {
  const {
    includeURL = true
  } = options;
  
  let reference = '';
  
  // Author or title
  if (source.author) {
    reference = formatAuthor(source.author);
  } else if (source.organization) {
    reference = source.organization;
  }
  
  if (reference && source.date) {
    reference += ` (${formatDate(source.year, source.date).replace(/[()]/g, '')})`;
  } else if (source.date) {
    reference = `(${formatDate(source.year, source.date).replace(/[()]/g, '')})`;
  } else if (source.year) {
    reference += ` (${source.year})`;
  }
  
  // Title
  if (source.title) {
    const title = formatTitle(source.title, source.subtitle, true);
    if (reference) {
      reference += ` ${title}.`;
    } else {
      reference = `${title}.`;
    }
  }
  
  // Site name
  if (source.siteName) {
    reference += ` ${source.siteName}`;
  }
  
  // URL
  if (source.url && includeURL) {
    reference += ` ${formatURL(source.url)}`;
  }
  
  return reference.trim();
}

// =============================================================================
// THESIS/DISSERTATION FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a thesis or dissertation
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatThesis(source, options = {}) {
  const {
    includeURL = true,
    includeDOI = true
  } = options;
  
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle, true);
  const thesisType = source.thesisType || 'Doctoral dissertation';
  
  let reference = `${authors} ${date} ${title}.`;
  
  // Add thesis type and institution
  if (source.institution) {
    reference += ` ${thesisType}, ${source.institution}`;
  } else {
    reference += ` ${thesisType}`;
  }
  
  // Add DOI or URL
  const hasDOI = source.doi && formatDOI(source.doi);
  const hasURL = source.url && formatURL(source.url);
  
  if (hasDOI && includeDOI) {
    reference += ` https://doi.org/${formatDOI(source.doi)}`;
  } else if (hasURL && includeURL) {
    reference += ` ${source.url}`;
  }
  
  return reference.trim();
}

// =============================================================================
// SOFTWARE/GITHUB FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for software (GitHub, etc.)
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatSoftware(source, options = {}) {
  const {
    includeURL = true
  } = options;
  
  let reference = '';
  
  // Author or organization
  if (source.author) {
    reference = formatAuthor(source.author);
  } else if (source.organization) {
    reference = source.organization;
  } else if (source.owner) {
    reference = source.owner;
  }
  
  const date = formatDate(source.year, source.date);
  
  if (reference) {
    reference += ` ${date}`;
  } else {
    reference = date;
  }
  
  // Title
  if (source.title) {
    const title = formatTitle(source.title, source.subtitle, true);
    reference += ` ${title}`;
  }
  
  // Version
  if (source.version) {
    reference += ` (Version ${source.version})`;
  }
  
  // Platform/Repository
  if (source.platform) {
    reference += ` [${source.platform}]`;
  }
  
  // URL
  if (source.url && includeURL) {
    reference += ` ${formatURL(source.url)}`;
  }
  
  return reference.trim();
}

// =============================================================================
// DATASET FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for a dataset
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatDataset(source, options = {}) {
  const {
    includeDOI = true,
    includeURL = true
  } = options;
  
  const authors = formatAuthor(source.author);
  const date = formatDate(source.year, source.date);
  const title = formatTitle(source.title, source.subtitle, true);
  
  let reference = `${authors} ${date} ${title}`;
  
  // Add version if specified
  if (source.version) {
    reference += ` (Version ${source.version})`;
  }
  
  // Add publisher/distributor
  if (source.publisher) {
    reference += ` ${source.publisher}`;
  }
  
  // Add DOI or URL
  const hasDOI = source.doi && formatDOI(source.doi);
  const hasURL = source.url && formatURL(source.url);
  
  if (hasDOI && includeDOI) {
    reference += ` https://doi.org/${formatDOI(source.doi)}`;
  } else if (hasURL && includeURL) {
    reference += ` ${source.url}`;
  }
  
  return reference.trim();
}

// =============================================================================
// RADIO/INTERVIEW FORMATTER
// =============================================================================

/**
 * Generate APA 7 reference for radio/interview
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 reference
 */
function formatRadioInterview(source, options = {}) {
  const {
    includeURL = true
  } = options;
  
  let reference = '';
  
  // Interviewer or host
  if (source.interviewer) {
    reference = formatAuthor(source.interviewer);
  } else if (source.host) {
    reference = formatAuthor(source.host);
  } else if (source.author) {
    reference = formatAuthor(source.author);
  }
  
  // Add broadcast date
  if (source.broadcastDate) {
    reference += ` (${formatDate('', source.broadcastDate).replace(/[()]/g, '')})`;
  } else if (source.year) {
    reference += ` (${source.year})`;
  }
  
  // Title
  if (source.title) {
    const title = formatTitle(source.title, source.subtitle);
    if (reference) {
      reference += ` ${title}`;
    } else {
      reference = title;
    }
  }
  
  // Add "Interview" or type
  if (source.interviewType) {
    reference += ` [${source.interviewType}]`;
  } else {
    reference += ' [Interview]';
  }
  
  // Add station/network
  if (source.station) {
    reference += ` ${source.station}`;
  }
  
  // URL
  if (source.url && includeURL) {
    reference += ` ${formatURL(source.url)}`;
  }
  
  return reference.trim();
}

// =============================================================================
// MAIN GENERATOR FUNCTION
// =============================================================================

/**
 * Main APA 7 citation generator function
 * @param {APASource} source - Source object with reference data
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 citation
 */
function apa7Generate(source, options = {}) {
  if (!source) {
    throw new Error('Source object is required');
  }
  
  // Determine type
  const type = source.type || PUBLICATION_TYPES.JOURNAL_ARTICLE;
  
  // Route to appropriate formatter
  switch (type) {
    case PUBLICATION_TYPES.JOURNAL_ARTICLE:
      return formatJournalArticle(source, options);
    case PUBLICATION_TYPES.BOOK:
      return formatBook(source, options);
    case PUBLICATION_TYPES.CHAPTER:
      return formatChapter(source, options);
    case PUBLICATION_TYPES.BOOKLET:
      return formatBooklet(source, options);
    case PUBLICATION_TYPES.WEBSITE:
      return formatWebsite(source, options);
    case PUBLICATION_TYPES.THESIS:
    case PUBLICATION_TYPES.DISSERTATION:
      return formatThesis(source, options);
    case PUBLICATION_TYPES.SOFTWARE_GITHUB:
      return formatSoftware(source, options);
    case PUBLICATION_TYPES.DATASET_DOI:
      return formatDataset(source, options);
    case PUBLICATION_TYPES.RADIO_INTERVIEW:
      return formatRadioInterview(source, options);
    default:
      // Try to infer type from available fields
      return inferAndFormat(source, options);
  }
}

/**
 * Infer publication type from source fields and format accordingly
 * @param {APASource} source - Source object
 * @param {APAOptions} [options] - Formatting options
 * @returns {string} Formatted APA 7 citation
 */
function inferAndFormat(source, options) {
  // Check for journal-specific fields
  if (source.journal || source.volume || source.issue) {
    return formatJournalArticle(source, options);
  }
  
  // Check for thesis-specific fields
  if (source.thesisType || source.institution) {
    return formatThesis(source, options);
  }
  
  // Check for software-specific fields
  if (source.platform || source.repository || source.owner) {
    return formatSoftware(source, options);
  }
  
  // Default to journal article
  return formatJournalArticle(source, options);
}

// =============================================================================
// IN-TEXT CITATION GENERATOR
// =============================================================================

/**
 * Generate in-text APA 7 citation
 * @param {string|string[]} authors - Author(s)
 * @param {string} year - Publication year
 * @param {string} [pages] - Page number(s) for direct quotes
 * @param {boolean} [narrative] - Whether this is a narrative citation
 * @returns {string} In-text citation
 */
function generateInTextCitation(authors, year, pages, narrative = false) {
  if (!authors || !year) {
    throw new Error('Authors and year are required for in-text citations');
  }
  
  const formattedYear = year === 's.f.' ? 's.f.' : year;
  
  // Handle array of authors
  const authorArray = Array.isArray(authors) ? authors : [authors];
  
  // For narrative citations: Author (Year)
  if (narrative) {
    const author = formatAuthorForInText(authorArray);
    return `${author} (${formattedYear})`;
  }
  
  // For parenthetical citations
  const author = formatAuthorForInText(authorArray);
  let citation = `(${author}, ${formattedYear}`;
  
  // Add page number for direct quotes
  if (pages) {
    // Standardize page references
    const pageRef = pages.includes('pp.') ? pages : `p. ${pages}`;
    citation += `, ${pageRef}`;
  }
  
  citation += ')';
  return citation;
}

/**
 * Format author for in-text citation
 * @param {string[]} authors - Array of authors
 * @returns {string} Formatted author for in-text
 */
function formatAuthorForInText(authors) {
  if (!authors || authors.length === 0) return '';
  
  // Filter and format
  const validAuthors = authors.filter(a => a && a.trim() !== '');
  if (validAuthors.length === 0) return '';
  
  if (validAuthors.length === 1) {
    const author = validAuthors[0];
    // For in-text, we use surname only for individual authors
    if (isInstitutionalAuthor(author)) {
      return author;
    }
    // Extract surname (first part before comma)
    const parts = author.split(',')[0];
    return parts.trim();
  }
  
  if (validAuthors.length === 2) {
    // Two authors: both surnames joined by "and"
    const surname1 = validAuthors[0].split(',')[0].trim();
    const surname2 = validAuthors[1].split(',')[0].trim();
    return `${surname1} and ${surname2}`;
  }
  
  // Three or more authors: first surname + et al.
  const firstSurname = validAuthors[0].split(',')[0].trim();
  return `${firstSurname} et al.`;
}

// =============================================================================
// EXPORTS
// =============================================================================

// Main generator
apa7.generate = apa7Generate;
apa7.generateInText = generateInTextCitation;

// Type-specific generators
apa7.generateJournalArticle = formatJournalArticle;
apa7.generateBook = formatBook;
apa7.generateChapter = formatChapter;
apa7.generateBooklet = formatBooklet;
apa7.generateWebsite = formatWebsite;
apa7.generateThesis = formatThesis;
apa7.generateSoftware = formatSoftware;
apa7.generateDataset = formatDataset;
apa7.generateRadioInterview = formatRadioInterview;

// Helper functions
apa7.formatAuthor = formatAuthor;
apa7.formatDate = formatDate;
apa7.formatTitle = formatTitle;
apa7.formatDOI = formatDOI;
apa7.formatURL = formatURL;
apa7.formatAccessDate = formatAccessDate;

// Constants
apa7.PUBLICATION_TYPES = PUBLICATION_TYPES;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = apa7;
}

// Export for CommonJS
if (typeof exports !== 'undefined') {
  exports = apa7;
  module.exports = apa7;
}
