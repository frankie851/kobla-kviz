// Kapacita, pravidlo náhradníků a souběh dvou přihlášek (K4, K5)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { nactiSkript, radekTerminu, prihlaska, falesneSluzby, jednoduchyZamek, zadnyZamek } = require('./pomocnik');
const G = nactiSkript();

const termin = (prepis) => G.pripravTermin(radekTerminu(prepis));
const p = (tym, stav, termin_id = 'lev-1') => ({ termin_id, tym, stav });

test('volné místo → Potvrzeno', () => {
  assert.equal(G.rozhodniStav(termin(), [p('A', 'Potvrzeno')]), 'Potvrzeno');
});

test('plný termín → Náhradník', () => {
  assert.equal(G.rozhodniStav(termin(), [p('A', 'Potvrzeno'), p('B', 'Potvrzeno')]), 'Náhradník');
});

test('kapacita 0 → vždy Náhradník', () => {
  assert.equal(G.rozhodniStav(termin({ kapacita_tymu: '0' }), []), 'Náhradník');
});

test('zrušené přihlášky a jiné termíny se nepočítají', () => {
  const prihlasky = [p('A', 'Potvrzeno'), p('B', 'Zrušeno'), p('C', 'Potvrzeno', 'jiny-1'), p('D', ' zrušeno ')];
  assert.equal(G.rozhodniStav(termin(), prihlasky), 'Potvrzeno');
});

test('čekající náhradník: nový tým nepředběhne pořadník, i když se uvolnilo místo', () => {
  // kapacita 2, jeden potvrzený, jeden zrušený (uvolněné místo), jeden náhradník čeká
  const prihlasky = [p('A', 'Potvrzeno'), p('B', 'Zrušeno'), p('C', 'Náhradník')];
  assert.equal(G.rozhodniStav(termin(), prihlasky), 'Náhradník');
  const s = G.verejnyStav(termin(), prihlasky, '2026-11-10 12:00');
  assert.equal(s.stav, 'obsazeno', 'web má ukázat Obsazeno');
  assert.equal(s.volno, 0);
});

test('náhradník bez diakritiky v tabulce se počítá stejně', () => {
  assert.equal(G.rozhodniStav(termin(), [p('C', 'Nahradnik')]), 'Náhradník');
});

test('David zvýší kapacitu po naplnění → zase Potvrzeno (když nikdo nečeká)', () => {
  const prihlasky = [p('A', 'Potvrzeno'), p('B', 'Potvrzeno')];
  assert.equal(G.rozhodniStav(termin({ kapacita_tymu: '3' }), prihlasky), 'Potvrzeno');
});

test('David sníží kapacitu pod počet potvrzených → volno 0, nic záporného', () => {
  const s = G.verejnyStav(termin({ kapacita_tymu: '1' }), [p('A', 'Potvrzeno'), p('B', 'Potvrzeno')], '2026-11-10 12:00');
  assert.equal(s.stav, 'obsazeno');
  assert.equal(s.volno, 0);
});

test('K4: skript zapíše Náhradník, i když web ukazoval zastaralé volné místo', () => {
  const { s, stav } = falesneSluzby({ prihlasky: [p('A', 'Potvrzeno'), p('B', 'Potvrzeno')] });
  const odp = G.zpracujPrihlasku(prihlaska({ tym: 'Pozdní tým' }), s);
  assert.equal(odp.ok, true);
  assert.equal(odp.stav, 'Náhradník');
  assert.equal(stav.prihlasky.at(-1).stav, 'Náhradník');
  assert.match(stav.emaily[0].text, /NÁHRADNÍK/);
});

test('K5: zámek obklopuje čtení stavu i zápis a uvolní se', () => {
  const { s, zaznam } = falesneSluzby();
  G.zpracujPrihlasku(prihlaska(), s);
  assert.deepEqual(zaznam, ['zamkni', 'cti-terminy:zamceno', 'cti-prihlasky:zamceno', 'zapis:zamceno', 'odemkni']);
});

test('K5: zámek se uvolní i při chybě v kontrole', () => {
  const { s, zaznam } = falesneSluzby();
  const odp = G.zpracujPrihlasku(prihlaska({ email: 'spatne' }), s);
  assert.equal(odp.ok, false);
  assert.equal(zaznam.at(-1), 'odemkni');
});

function soubeh(zamek) {
  // Tým A čte stav; v tu chvíli přijde tým B na stejné poslední místo.
  let vnorena = null, druha = null;
  const { s, stav } = falesneSluzby({
    zamek,
    prihlasky: [p('X', 'Potvrzeno')], // kapacita 2 → zbývá 1 místo
    poCteniPrihlasek: () => {
      if (vnorena) return;
      vnorena = 'probíhá';
      vnorena = G.zpracujPrihlasku(prihlaska({ tym: 'Tým B' }), s);
    }
  });
  const prvni = G.zpracujPrihlasku(prihlaska({ tym: 'Tým A' }), s);
  // B dostal „zkus znovu“ (ve skutečnosti by počkal na zámek) → zopakuje se po A
  if (vnorena && vnorena.ok === false) druha = G.zpracujPrihlasku(prihlaska({ tym: 'Tým B' }), s);
  const potvrzeno = stav.prihlasky.filter(x => x.stav === 'Potvrzeno' && x.tym !== 'X').map(x => x.tym);
  return { prvni, vnorena, druha, potvrzeno, stav };
}

test('K5: dvě souběžné přihlášky na poslední místo → právě jedna Potvrzeno', () => {
  const r = soubeh(jednoduchyZamek());
  assert.equal(r.vnorena.ok, false, 'B nesmí projít, dokud A drží zámek');
  assert.equal(r.prvni.stav, 'Potvrzeno');
  assert.equal(r.druha.stav, 'Náhradník');
  assert.deepEqual(r.potvrzeno, ['Tým A']);
});

test('kontrola testu: bez zámku by souběh přeplnil termín (test chybu opravdu zachytí)', () => {
  const r = soubeh(zadnyZamek());
  assert.equal(r.potvrzeno.length, 2);
});

test('K5: v Code.gs používá zpracujPrihlasku zámek (tryLock) a uvolňuje ho ve finally', () => {
  const kod = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
  const fce = kod.slice(kod.indexOf('function zpracujPrihlasku'), kod.indexOf('function zpracujHospodu'));
  const i = (t) => fce.indexOf(t);
  assert.ok(i('s.zamkni(') > -1 && i('s.zamkni(') < i('s.nactiPrihlasky()'), 'zámek před čtením');
  assert.ok(i('s.zapisPrihlasku(') < i('finally'), 'zápis uvnitř try');
  assert.ok(i('s.odemkni()') > i('finally'), 'odemknutí ve finally');
  assert.ok(i('s.posliTelegram') > i('s.odemkni()'), 'upozornění až po odemknutí');
  assert.match(kod, /zamkni: function \(ms\) \{ return zamek\.tryLock\(ms\); \}/);
  assert.match(kod, /LockService\.getScriptLock\(\)/);
});

test('po přihlášce se smaže mezipaměť veřejných dat', () => {
  const { s, stav } = falesneSluzby();
  G.zpracujPrihlasku(prihlaska(), s);
  assert.equal(stav.cacheSmazana, 1);
});
