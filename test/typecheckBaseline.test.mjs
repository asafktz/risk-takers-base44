import assert from 'node:assert/strict';
import test from 'node:test';

import {
  countDiagnostics,
  findRegressions,
} from '../scripts/typecheck-baseline.mjs';

test('typecheck baseline groups diagnostics without depending on line numbers', () => {
  const output = [
    'src/a.jsx(1,2): error TS2322: first problem',
    'src/a.jsx(99,4): error TS2322: another problem',
    'src/b.js(3,1): error TS2339: missing property',
  ].join('\n');

  assert.deepEqual(countDiagnostics(output), {
    'src/a.jsx|TS2322': 2,
    'src/b.js|TS2339': 1,
  });
});

test('typecheck baseline allows debt reduction and rejects new or increased buckets', () => {
  const allowed = {
    'src/a.jsx|TS2322': 2,
    'src/b.js|TS2339': 1,
  };

  assert.deepEqual(findRegressions({ 'src/a.jsx|TS2322': 1 }, allowed), []);
  assert.deepEqual(findRegressions({
    'src/a.jsx|TS2322': 3,
    'src/c.js|TS7006': 1,
  }, allowed), [
    { key: 'src/a.jsx|TS2322', count: 3, allowed: 2, added: 1 },
    { key: 'src/c.js|TS7006', count: 1, allowed: 0, added: 1 },
  ]);
});
