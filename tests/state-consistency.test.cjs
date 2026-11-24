const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

test('los scripts comparten el estado creado por el store después de cargar la configuración', () => {
  const root = path.resolve(__dirname, '..');
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="(src\/[^"]+)" defer>/g)].map(match => match[1]);
  const store = 'src/state/store.js';
  assert.deepEqual(scripts.slice(0, 3), ['src/state/persistence.js', 'src/config/index.js', store]);
  for (const file of scripts) {
    const code = readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(code, /\b(?:const|let|var)\s+state\b/, file);
    assert.doesNotMatch(code, /(?<!window\.)\bstate\./, file);
    const assignments = code.match(/\bwindow\.state\s*=(?!=)/g) || [];
    assert.equal(assignments.length, file === store ? 1 : 0, file);
  }
});
