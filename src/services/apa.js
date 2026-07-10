// ═══════════════════════════════════════════════════════════════════════
// SERVICES/APA.JS - Domain specific APA helpers
// ═══════════════════════════════════════════════════════════════════════

function sortReferencesByAuthor(references) {
  return references.sort((a, b) => {
    const authorA = a.author || a.institution || '';
    const authorB = b.author || b.institution || '';
    return authorA.localeCompare(authorB, 'es');
  });
}

function validateReference(ref) {
  const hasUrl = !!ref.url;
  const hasDoi = !!ref.doi;

  const validation = {
    author: !!ref.author,
    year: !!ref.year,
    title: !!ref.title,
    source: !!ref.source,
    urlOrDoi: hasUrl || hasDoi
  };

  return {
    isValid: Object.values(validation).every(v => v),
    issues: Object.keys(validation).filter(k => !validation[k]),
    validation
  };
}

// Helpers for working with legacy string-based references used by the UI
function getReferenceAuthorFromString(reference) {
  try {
    return String(reference || '').replace(/<[^>]+>/g, '').split('(')[0].trim();
  } catch (err) {
    return '';
  }
}

function sortReferenceStringsByAuthor(referenceStrings) {
  return referenceStrings.sort((a, b) => getReferenceAuthorFromString(a).localeCompare(getReferenceAuthorFromString(b), 'es'));
}

function validateReferenceString(reference) {
  const normalized = String(reference || '').replace(/<[^>]+>/g, '');
  const checks = {
    author: /^[^(]+\(\d{4}\)/.test(normalized),
    year: /\(\d{4}\)/.test(normalized),
    title: /<em>.+<\/em>|\.[^\.]{3,}/.test(reference),
    source: /\)\.\s*.+/.test(normalized),
    doiOrUrl: /doi|https?:\/\//i.test(normalized)
  };

  return {
    isValid: Object.values(checks).every(Boolean),
    validation: checks,
    issues: Object.keys(checks).filter(k => !checks[k])
  };
}

