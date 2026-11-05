// České formáty na webu (assets/js/cesky.js): skloňování, datum, mezery (K11)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'cesky.js'), 'utf8'), ctx);
const C = ctx.Cesky;
const N = ' ';

test('skloňování počtů', () => {
  assert.equal(C.pocet(1, C.MISTA), '1' + N + 'volné místo');
  assert.equal(C.pocet(3, C.MISTA), '3' + N + 'volná místa');
  assert.equal(C.pocet(5, C.MISTA), '5' + N + 'volných míst');
  assert.equal(C.pocet(0, C.MISTA), '0' + N + 'volných míst');
  assert.equal(C.pocet(2, C.TYMY), '2' + N + 'týmy');
  assert.equal(C.pocet(12, C.TYMY), '12' + N + 'týmů');
  assert.equal(C.pocet(1, C.HRACI), '1' + N + 'hráč');
});

test('formát data a času', () => {
  assert.equal(C.datumCas('2026-11-14', '19:00').replace(/ /g, ' '), 'so 14. 11. 2026 · 19:00');
  assert.equal(C.datumCas('2026-11-12').replace(/ /g, ' '), 'čt 12. 11. 2026');
  assert.equal(C.datumCas('nesmysl'), '');
});

test('nezlomitelné mezery po jednopísmenných předložkách', () => {
  assert.equal(C.nbsp('Kvíz v Prostějově a okolí'), 'Kvíz v' + N + 'Prostějově a' + N + 'okolí');
  assert.equal(C.nbsp('S partou k nám'), 'S' + N + 'partou k' + N + 'nám');
});
