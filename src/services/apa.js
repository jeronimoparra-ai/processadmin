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
