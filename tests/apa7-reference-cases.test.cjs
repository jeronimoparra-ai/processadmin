// =============================================================================
// APA 7 REFERENCE CASES - Test Suite
// Fixture tests for APA 7 citation generation and validation
// =============================================================================

// Note: Using .cjs extension for CommonJS compatibility with Node.js
// Run with: node tests/apa7-reference-cases.test.cjs

/**
 * Simple test framework helper
 */
const TestRunner = {
  tests: [],
  
  describe(name, fn) {
    console.log(`\n=== ${name} ===`);
    fn();
  },
  
  it(description, fn) {
    this.tests.push({ description, fn });
    try {
      fn();
      console.log(`✓ ${description}`);
      return true;
    } catch (error) {
      console.log(`✗ ${description}`);
      console.log(`  Error: ${error.message}`);
      if (error.stack) {
        const relevantStack = error.stack.split('\n').slice(0, 3).join('\n');
        console.log(`  Stack: ${relevantStack}`);
      }
      return false;
    }
  },
  
  assert: {
    equal(actual, expected, message) {
      if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'}: Expected "${expected}", got "${actual}"`);
      }
    },
    
    deepEqual(actual, expected, message) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`${message || 'Deep equality failed'}: Expected ${expectedStr}, got ${actualStr}`);
      }
    },
    
    ok(value, message) {
      if (!value) {
        throw new Error(message || 'Assertion failed: value is falsy');
      }
    },
    
    isTrue(value, message) {
      if (value !== true) {
        throw new Error(message || 'Expected true, got false');
      }
    },
    
    isFalse(value, message) {
      if (value !== false) {
        throw new Error(message || 'Expected false, got true');
      }
    },
    
    throws(fn, message) {
      let thrown = false;
      try {
        fn();
      } catch (error) {
        thrown = true;
      }
      if (!thrown) {
        throw new Error(message || 'Expected function to throw');
      }
    },
    
    includes(str, substring, message) {
      if (!str || !str.includes(substring)) {
        throw new Error(`${message || 'Includes failed'}: "${str}" does not include "${substring}"`);
      }
    },
    
    matches(str, regex, message) {
      if (!regex.test(str)) {
        throw new Error(`${message || 'Regex match failed'}: "${str}" does not match ${regex}`);
      }
    }
  },
  
  run() {
    let passed = 0;
    let failed = 0;
    
    for (const test of this.tests) {
      try {
        test.fn();
        passed++;
      } catch (error) {
        failed++;
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests: ${passed} passed, ${failed} failed`);
    console.log(`${'='.repeat(50)}`);
    
    return failed === 0;
  }
};

// =============================================================================
// LOAD MODULES
// =============================================================================

// Load the modules we're testing
let apa7, apaRules, academicValidator;

try {
  // Try CommonJS require
  apa7 = require('../src/services/apa7.js');
  apaRules = require('../src/services/apaRules.js');
  academicValidator = require('../src/services/academicValidator.js');
} catch (error) {
  console.error('Failed to load modules:', error.message);
  process.exit(1);
}

console.log('✓ Successfully loaded all modules');

// =============================================================================
// FIXTURE: SINGLE AUTHOR CASES
// =============================================================================

TestRunner.describe('APA7 Generator - Single Author Cases', () => {
  // Test case: Single author with all fields
  const singleAuthorRef = {
    type: 'journal-article',
    author: 'García, María',
    year: '2023',
    title: 'The impact of climate change on biodiversity',
    journal: 'Journal of Environmental Science',
    volume: '15',
    issue: '3',
    pages: '123-145',
    doi: '10.1234/jes.2023.12345'
  };

  TestRunner.it('Should generate journal article with single author', () => {
    const result = apa7.generate(singleAuthorRef);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'García, M.');
    TestRunner.assert.includes(result, '(2023)');
    TestRunner.assert.includes(result, 'The Impact of Climate Change on Biodiversity');
    TestRunner.assert.includes(result, 'Journal of Environmental Science');
    TestRunner.assert.includes(result, '15');
    TestRunner.assert.includes(result, '123-145');
    TestRunner.assert.includes(result, '10.1234/jes.2023.12345');
  });

  TestRunner.it('Should format author name correctly (surname, initials)', () => {
    const result = apa7.generate(singleAuthorRef);
    TestRunner.assert.includes(result, 'García, M.');
  });

  TestRunner.it('Should handle missing volume gracefully', () => {
    const ref = { ...singleAuthorRef, volume: undefined };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Journal of Environmental Science');
  });

  TestRunner.it('Should handle missing issue gracefully', () => {
    const ref = { ...singleAuthorRef, issue: undefined };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
  });

  TestRunner.it('Should handle missing pages gracefully', () => {
    const ref = { ...singleAuthorRef, pages: undefined };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
  });

  // Test case: Single author with unknown date
  const unknownDateRef = {
    type: 'book',
    author: 'López, Juan',
    year: 's.f.',
    title: 'Introduction to Environmental Studies',
    publisher: 'EcoBooks'
  };

  TestRunner.it('Should handle unknown date (s.f.)', () => {
    const result = apa7.generate(unknownDateRef);
    TestRunner.assert.includes(result, '(s.f.)');
  });

  // Test case: Single institutional author
  const institutionalAuthorRef = {
    type: 'website',
    author: 'World Health Organization',
    year: '2023',
    title: 'Global health report',
    url: 'https://www.who.int/report'
  };

  TestRunner.it('Should handle institutional author', () => {
    const result = apa7.generate(institutionalAuthorRef);
    TestRunner.assert.includes(result, 'World Health Organization');
  });

  // Test case: Single author with DOI
  TestRunner.it('Should include DOI when available', () => {
    const result = apa7.generate(singleAuthorRef);
    TestRunner.assert.includes(result, '10.1234/jes.2023.12345');
  });

  // Test case: Single author with URL (no DOI)
  const urlRef = {
    type: 'website',
    author: 'Smith, John',
    year: '2023',
    title: 'Web development trends',
    url: 'https://example.com/article'
  };

  TestRunner.it('Should include URL when DOI not available', () => {
    const result = apa7.generate(urlRef);
    TestRunner.assert.includes(result, 'https://example.com/article');
  });
});

// =============================================================================
// FIXTURE: DOUBLE AUTHOR CASES
// =============================================================================

TestRunner.describe('APA7 Generator - Double Author Cases', () => {
  // Test case: Two authors
  const doubleAuthorRef = {
    type: 'journal-article',
    author: ['García, María', 'López, Juan'],
    year: '2023',
    title: 'Collaborative research on environmental issues',
    journal: 'Environmental Research Journal',
    volume: '12',
    pages: '56-78',
    doi: '10.5678/env.2023.5678'
  };

  TestRunner.it('Should format two authors with ampersand', () => {
    const result = apa7.generate(doubleAuthorRef);
    TestRunner.assert.includes(result, 'García, M. & López, J.');
  });

  TestRunner.it('Should generate complete reference for two authors', () => {
    const result = apa7.generate(doubleAuthorRef);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'García, M. & López, J.');
    TestRunner.assert.includes(result, '(2023)');
    TestRunner.assert.includes(result, 'Collaborative Research on Environmental Issues');
    TestRunner.assert.includes(result, 'Environmental Research Journal');
  });

  // Test case: Two authors with institutional affiliation
  TestRunner.it('Should handle two authors correctly', () => {
    const result = apa7.generate(doubleAuthorRef);
    TestRunner.assert.ok(result.length > 0);
    TestRunner.assert.includes(result, '&');
  });

  // Test case: Two authors in book
  const bookDoubleAuthor = {
    type: 'book',
    author: ['Smith, Alice', 'Johnson, Bob'],
    year: '2022',
    title: 'Introduction to Programming',
    publisher: 'Tech Publishers',
    doi: '10.1234/book.2022.001'
  };

  TestRunner.it('Should format two authors in book reference', () => {
    const result = apa7.generate(bookDoubleAuthor);
    TestRunner.assert.includes(result, 'Smith, A. & Johnson, B.');
    TestRunner.assert.includes(result, '(2022)');
    TestRunner.assert.includes(result, '*Introduction to Programming*');
    TestRunner.assert.includes(result, 'Tech Publishers');
  });

  // Test case: In-text citation with two authors
  TestRunner.it('Should generate in-text citation for two authors', () => {
    const citation = apa7.generateInText(['García, María', 'López, Juan'], '2023');
    TestRunner.assert.includes(citation, 'García and López, 2023');
    TestRunner.assert.includes(citation, '(');
    TestRunner.assert.includes(citation, ')');
  });

  TestRunner.it('Should generate narrative in-text citation for two authors', () => {
    const citation = apa7.generateInText(['García, María', 'López, Juan'], '2023', null, true);
    TestRunner.assert.includes(citation, 'García and López (2023)');
  });
});

// =============================================================================
// FIXTURE: EDITORIAL/BOOK CASES
// =============================================================================

TestRunner.describe('APA7 Generator - Editorial/Book Cases', () => {
  // Test case: Book with editor
  const bookWithEditor = {
    type: 'book',
    author: 'Smith, John',
    year: '2021',
    title: 'Advanced Research Methods',
    editor: 'Brown, Sarah',
    publisher: 'Academic Press',
    edition: '3rd',
    doi: '10.1234/arm.2021'
  };

  TestRunner.it('Should format book with edition', () => {
    const result = apa7.generate(bookWithEditor);
    TestRunner.assert.includes(result, 'Smith, J.');
    TestRunner.assert.includes(result, '(2021)');
    TestRunner.assert.includes(result, '*Advanced Research Methods*');
    TestRunner.assert.includes(result, '(3rd ed.)');
    TestRunner.assert.includes(result, 'Academic Press');
  });

  // Test case: Book chapter
  const chapterRef = {
    type: 'chapter',
    author: 'Wilson, Peter',
    year: '2020',
    title: 'The role of statistics in research',
    bookTitle: 'Research Methodology',
    editor: 'Taylor, Linda',
    pages: '100-125',
    publisher: 'Research Publishers',
    doi: '10.5678/chapter.2020.01'
  };

  TestRunner.it('Should format book chapter correctly', () => {
    const result = apa7.generate(chapterRef);
    TestRunner.assert.includes(result, 'Wilson, P.');
    TestRunner.assert.includes(result, '(2020)');
    TestRunner.assert.includes(result, 'The Role of Statistics in Research');
    TestRunner.assert.includes(result, 'In');
    TestRunner.assert.includes(result, '*Research Methodology*');
    TestRunner.assert.includes(result, '(pp. 100-125)');
  });

  // Test case: Book without author (editor as author)
  const editedBook = {
    type: 'book',
    editor: 'Johnson, Michael',
    year: '2019',
    title: 'Contemporary Issues in Education',
    publisher: 'Education Press'
  };

  TestRunner.it('Should handle book with only editor', () => {
    // This will use the author field, which is empty, so it should still work
    const result = apa7.generate(editedBook);
    TestRunner.assert.ok(result);
  });
});

// =============================================================================
// FIXTURE: DOI CASES
// =============================================================================

TestRunner.describe('APA7 Generator - DOI Cases', () => {
  // Test case: DOI with http://doi.org prefix
  const doiWithPrefix = {
    type: 'journal-article',
    author: 'Brown, Sarah',
    year: '2023',
    title: 'Digital Object Identifiers in Publishing',
    journal: 'Publishing Journal',
    doi: 'https://doi.org/10.1234/pub.2023.001'
  };

  TestRunner.it('Should handle DOI with https://doi.org prefix', () => {
    const result = apa7.generate(doiWithPrefix);
    TestRunner.assert.includes(result, '10.1234/pub.2023.001');
  });

  // Test case: DOI without prefix
  const doiWithoutPrefix = {
    type: 'journal-article',
    author: 'Brown, Sarah',
    year: '2023',
    title: 'Digital Object Identifiers in Publishing',
    journal: 'Publishing Journal',
    doi: '10.1234/pub.2023.001'
  };

  TestRunner.it('Should handle DOI without prefix', () => {
    const result = apa7.generate(doiWithoutPrefix);
    TestRunner.assert.includes(result, '10.1234/pub.2023.001');
  });

  // Test case: DOI with special characters
  const doiWithSpecialChars = {
    type: 'journal-article',
    author: 'Lee, David',
    year: '2023',
    title: 'Special characters in DOI',
    journal: 'Tech Journal',
    doi: '10.5678/tech.2023._abc-123'
  };

  TestRunner.it('Should handle DOI with special characters', () => {
    const result = apa7.generate(doiWithSpecialChars);
    TestRunner.assert.includes(result, '10.5678/tech.2023._abc-123');
  });

  // Test case: DOI with version number
  const doiWithVersion = {
    type: 'journal-article',
    author: 'Chen, Wei',
    year: '2023',
    title: 'Versioned DOI test',
    journal: 'Version Journal',
    doi: '10.1234.56/v1.2.3'
  };

  TestRunner.it('Should handle DOI with version number', () => {
    const result = apa7.generate(doiWithVersion);
    TestRunner.assert.includes(result, '10.1234.56/v1.2.3');
  });

  // Test case: Reference without DOI or URL
  const noIdentifier = {
    type: 'book',
    author: 'Williams, Thomas',
    year: '2023',
    title: 'Offline Research Methods',
    publisher: 'Print Press'
  };

  TestRunner.it('Should handle reference without DOI or URL', () => {
    const result = apa7.generate(noIdentifier);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Williams, T.');
    TestRunner.assert.includes(result, 'Print Press');
  });
});

// =============================================================================
// FIXTURE: FECHA DESCONOCIDA (Unknown Date) CASES
// =============================================================================

TestRunner.describe('APA7 Generator - Unknown Date Cases', () => {
  // Test case: Unknown date with s.f.
  const unknownDateSF = {
    type: 'website',
    author: 'Anonymous',
    year: 's.f.',
    title: 'Untitled Document',
    url: 'https://example.com/unknown'
  };

  TestRunner.it('Should handle unknown date with s.f.', () => {
    const result = apa7.generate(unknownDateSF);
    TestRunner.assert.includes(result, '(s.f.)');
  });

  // Test case: Unknown date with n.d.
  const unknownDateND = {
    type: 'website',
    author: 'Unknown Author',
    year: 'n.d.',
    title: 'Document without date',
    url: 'https://example.com/nodate'
  };

  TestRunner.it('Should handle unknown date with n.d.', () => {
    const result = apa7.generate(unknownDateND);
    TestRunner.assert.includes(result, '(n.d.)');
  });

  // Test case: Unknown date in book
  const unknownBookDate = {
    type: 'book',
    author: 'Traditional, Author',
    year: 's.f.',
    title: 'Ancient Text',
    publisher: 'Historical Press'
  };

  TestRunner.it('Should handle unknown date in book reference', () => {
    const result = apa7.generate(unknownBookDate);
    TestRunner.assert.includes(result, '(s.f.)');
  });

  // Test case: Unknown date with only title
  const unknownDateNoAuthor = {
    type: 'website',
    year: 's.f.',
    title: 'Document Title Only',
    url: 'https://example.com/titleonly'
  };

  TestRunner.it('Should handle reference with unknown date and no author', () => {
    const result = apa7.generate(unknownDateNoAuthor);
    TestRunner.assert.includes(result, '(s.f.)');
    TestRunner.assert.includes(result, 'Document Title Only');
  });

  // Test case: Unknown date with date field
  const unknownDateWithDateField = {
    type: 'website',
    author: 'Test, Author',
    date: 's.f.',
    title: 'Test Document',
    url: 'https://example.com/test'
  };

  TestRunner.it('Should handle unknown date in date field', () => {
    const result = apa7.generate(unknownDateWithDateField);
    TestRunner.assert.includes(result, '(s.f.)');
  });
});

// =============================================================================
// FIXTURE: VALIDATOR TESTS
// =============================================================================

TestRunner.describe('Academic Validator Tests', () => {
  TestRunner.it('Should validate complete journal article', () => {
    const reference = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2023',
      title: 'Test Article',
      journal: 'Test Journal',
      volume: '10',
      pages: '1-10'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.results.length > 0);
    TestRunner.assert.ok(report.totalChecks > 0);
  });

  TestRunner.it('Should detect missing author', () => {
    const reference = {
      type: 'journal-article',
      year: '2023',
      title: 'Test Article',
      journal: 'Test Journal'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.errors.length > 0 || report.warnings.length > 0);
  });

  TestRunner.it('Should detect missing year', () => {
    const reference = {
      type: 'journal-article',
      author: 'Smith, John',
      title: 'Test Article',
      journal: 'Test Journal'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.errors.length > 0 || report.warnings.length > 0);
  });

  TestRunner.it('Should detect missing title', () => {
    const reference = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2023',
      journal: 'Test Journal'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.errors.length > 0 || report.warnings.length > 0);
  });

  TestRunner.it('Should validate thesis with institution', () => {
    const reference = {
      type: 'thesis',
      author: 'Student, Test',
      year: '2023',
      title: 'Test Thesis',
      institution: 'Test University',
      thesisType: 'Master\'s thesis'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.passedChecks >= 0);
  });

  TestRunner.it('Should detect missing institution in thesis', () => {
    const reference = {
      type: 'thesis',
      author: 'Student, Test',
      year: '2023',
      title: 'Test Thesis'
    };
    
    const report = academicValidator.validateReference(reference);
    TestRunner.assert.ok(report);
    TestRunner.assert.ok(report.errors.length > 0 || report.warnings.length > 0);
  });
});

// =============================================================================
// FIXTURE: APA RULES ENGINE TESTS
// =============================================================================

TestRunner.describe('APA Rules Engine Tests', () => {
  TestRunner.it('Should get rules for APA 7 edition', () => {
    const rules = apaRules.getRulesByEdition('APA 7');
    TestRunner.assert.ok(rules);
    TestRunner.assert.ok(rules.length > 0);
  });

  TestRunner.it('Should get registered editions', () => {
    const editions = apaRules.getRegisteredEditions();
    TestRunner.assert.ok(editions);
    TestRunner.assert.ok(editions.length > 0);
    TestRunner.assert.includes(editions, 'APA 7');
  });

  TestRunner.it('Should get rules by type', () => {
    const journalRules = apaRules.getRulesByType('journal-article', 'APA 7');
    TestRunner.assert.ok(journalRules);
    TestRunner.assert.ok(journalRules.length > 0);
  });

  TestRunner.it('Should get rules by profile', () => {
    const authorRules = apaRules.getRulesByProfile('author', 'APA 7');
    TestRunner.assert.ok(authorRules);
    TestRunner.assert.ok(authorRules.length > 0);
  });

  TestRunner.it('Should get specific rule by ID', () => {
    const rule = apaRules.getRuleById('apa7-author-required', 'APA 7');
    TestRunner.assert.ok(rule);
    TestRunner.assert.equal(rule.id, 'apa7-author-required');
  });

  TestRunner.it('Should return null for non-existent rule', () => {
    const rule = apaRules.getRuleById('non-existent-rule', 'APA 7');
    TestRunner.assert.equal(rule, null);
  });

  TestRunner.it('Should get all rules', () => {
    const allRules = apaRules.getAllRules();
    TestRunner.assert.ok(allRules);
    TestRunner.assert.ok(allRules.length > 50); // Should have many rules
  });

  TestRunner.it('Should validate reference against rules', () => {
    const reference = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2023',
      title: 'Test Article',
      journal: 'Test Journal'
    };
    
    const result = apaRules.validateReferenceAgainstRules(reference, {
      edition: 'APA 7',
      type: 'journal-article'
    });
    
    TestRunner.assert.ok(result);
    TestRunner.assert.ok(result.totalRules > 0);
    TestRunner.assert.ok(result.passedCount >= 0);
  });

  TestRunner.it('Should check if rule exists', () => {
    TestRunner.assert.isTrue(apaRules.hasRule('apa7-author-required'));
    TestRunner.assert.isFalse(apaRules.hasRule('non-existent-rule'));
  });

  TestRunner.it('Should count rules by edition', () => {
    const counts = apaRules.countRulesByEdition();
    TestRunner.assert.ok(counts);
    TestRunner.assert.ok(counts['APA 7'] > 0);
  });

  TestRunner.it('Should count rules by profile', () => {
    const counts = apaRules.countRulesByProfile('APA 7');
    TestRunner.assert.ok(counts);
    TestRunner.assert.ok(counts.author > 0);
  });
});

// =============================================================================
// FIXTURE: IN-TEXT CITATION TESTS
// =============================================================================

TestRunner.describe('In-Text Citation Tests', () => {
  TestRunner.it('Should generate parenthetical citation with single author', () => {
    const citation = apa7.generateInText('Smith, John', '2023');
    TestRunner.assert.includes(citation, '(Smith, 2023)');
  });

  TestRunner.it('Should generate parenthetical citation with page number', () => {
    const citation = apa7.generateInText('Smith, John', '2023', '15');
    TestRunner.assert.includes(citation, '(Smith, 2023, p. 15)');
  });

  TestRunner.it('Should generate parenthetical citation with page range', () => {
    const citation = apa7.generateInText('Smith, John', '2023', '15-20');
    TestRunner.assert.includes(citation, '(Smith, 2023, p. 15-20)');
  });

  TestRunner.it('Should generate narrative citation with single author', () => {
    const citation = apa7.generateInText('Smith, John', '2023', null, true);
    TestRunner.assert.includes(citation, 'Smith (2023)');
  });

  TestRunner.it('Should generate narrative citation with page number', () => {
    const citation = apa7.generateInText('Smith, John', '2023', '15', true);
    // Note: Narrative citations don't include page numbers in parentheses
    TestRunner.assert.includes(citation, 'Smith (2023)');
  });

  TestRunner.it('Should handle institutional author in in-text citation', () => {
    const citation = apa7.generateInText('World Health Organization', '2023');
    TestRunner.assert.includes(citation, 'World Health Organization, 2023');
  });

  TestRunner.it('Should handle multiple authors in in-text citation (et al.)', () => {
    const citation = apa7.generateInText([
      'Smith, John',
      'Jones, Mary',
      'Brown, Bob'
    ], '2023');
    TestRunner.assert.includes(citation, 'Smith et al., 2023');
  });

  TestRunner.it('Should handle exactly two authors in in-text citation', () => {
    const citation = apa7.generateInText([
      'Smith, John',
      'Jones, Mary'
    ], '2023');
    TestRunner.assert.includes(citation, 'Smith and Jones, 2023');
  });
});

// =============================================================================
// FIXTURE: EDGE CASES AND ERROR HANDLING
// =============================================================================

TestRunner.describe('Edge Cases and Error Handling', () => {
  TestRunner.it('Should handle empty reference object', () => {
    const result = apa7.generate({});
    // Should still produce some output
    TestRunner.assert.ok(typeof result === 'string');
  });

  TestRunner.it('Should handle null author', () => {
    const ref = {
      type: 'journal-article',
      author: null,
      year: '2023',
      title: 'Test'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
  });

  TestRunner.it('Should handle undefined year', () => {
    const ref = {
      type: 'journal-article',
      author: 'Smith, John',
      title: 'Test'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
  });

  TestRunner.it('Should handle very long title', () => {
    const longTitle = 'A'.repeat(200);
    const ref = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2023',
      title: longTitle,
      journal: 'Test Journal'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result.length > 0);
  });

  TestRunner.it('Should handle special characters in title', () => {
    const ref = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2023',
      title: 'Test with "quotes" and & symbols',
      journal: 'Test Journal'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
  });

  TestRunner.it('Should handle unicode characters', () => {
    const ref = {
      type: 'journal-article',
      author: 'García, María',
      year: '2023',
      title: 'Estudio sobre la biodiversidad',
      journal: 'Revista Científica'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'García, M.');
    TestRunner.assert.includes(result, 'Estudio Sobre La Biodiversidad');
  });

  TestRunner.it('Should handle future year gracefully', () => {
    const ref = {
      type: 'journal-article',
      author: 'Smith, John',
      year: '2099',
      title: 'Future Research',
      journal: 'Future Journal'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.includes(result, '(2099)');
  });
});

// =============================================================================
// FIXTURE: SPECIFIC PUBLICATION TYPES
// =============================================================================

TestRunner.describe('Specific Publication Type Tests', () => {
  TestRunner.it('Should generate booklet reference', () => {
    const ref = {
      type: 'booklet',
      author: 'Smith, John',
      year: '2023',
      title: 'Quick Guide',
      publisher: 'Quick Press'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Smith, J.');
    TestRunner.assert.includes(result, '(2023)');
  });

  TestRunner.it('Should generate website reference without author', () => {
    const ref = {
      type: 'website',
      year: '2023',
      title: 'Test Website',
      url: 'https://example.com'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Test Website');
  });

  TestRunner.it('Should generate software reference', () => {
    const ref = {
      type: 'software-github',
      author: 'Developer, Test',
      year: '2023',
      title: 'Test Software',
      version: '1.0.0',
      platform: 'GitHub',
      url: 'https://github.com/test/software'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Developer, T.');
    TestRunner.assert.includes(result, 'Test Software');
    TestRunner.assert.includes(result, 'Version 1.0.0');
  });

  TestRunner.it('Should generate dataset reference', () => {
    const ref = {
      type: 'dataset-doi',
      author: 'Researcher, Data',
      year: '2023',
      title: 'Test Dataset',
      publisher: 'Data Publisher',
      doi: '10.1234/dataset.2023'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Researcher, D.');
    TestRunner.assert.includes(result, 'Test Dataset');
    TestRunner.assert.includes(result, '10.1234/dataset.2023');
  });

  TestRunner.it('Should generate radio/interview reference', () => {
    const ref = {
      type: 'radio/interview',
      interviewer: 'Host, Interview',
      year: '2023',
      title: 'Test Interview',
      interviewType: 'Radio interview',
      station: 'Test Radio',
      url: 'https://example.com/interview'
    };
    const result = apa7.generate(ref);
    TestRunner.assert.ok(result);
    TestRunner.assert.includes(result, 'Host, I.');
    TestRunner.assert.includes(result, 'Test Interview');
    TestRunner.assert.includes(result, '[Radio interview]');
  });
});

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

console.log('='.repeat(60));
console.log('APA 7 REFERENCE CASES - TEST SUITE');
console.log('='.repeat(60));

const success = TestRunner.run();

if (success) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
