// Uzávěrka, formáty data a času, duplicita
const test = require('node:test');
const assert = require('node:assert/strict');
const { nactiSkript, radekTerminu, prihlaska } = require('./pomocnik');
const G = nactiSkript();
const termin = (prepis) => G.pripravTermin(radekTerminu(prepis));
const kontrola = (u, t, prihlasky = [], ted = '2026-11-10 12:00') => G.zkontrolujPrihlasku(prihlaska(u), t, prihlasky, ted);

test('datum jako text v různých tvarech i jako objekt Date', () => {
  assert.equal(G.datumNaIso('14.11.2026'), '2026-11-14');
  assert.equal(G.datumNaIso('14. 11. 2026'), '2026-11-14');
  assert.equal(G.datumNaIso('2026-11-14'), '2026-11-14');
  assert.equal(G.datumNaIso(new Date(2026, 10, 14)), '2026-11-14');
  assert.equal(G.datumNaIso(new Date(2026, 10, 14, 23, 30), (d) => '2026-11-14'), '2026-11-14', 'objekt přes formátovač v časovém pásmu');
  assert.equal(G.datumNaIso('31.2.2026'), null);
  assert.equal(G.datumNaIso(''), null);
  assert.equal(G.datumNaIso('zítra'), null);
});

test('čas a datum s časem', () => {
  assert.equal(G.casNaText('19:00'), '19:00');
  assert.equal(G.casNaText('9:05'), '09:05');
  assert.equal(G.casNaText('19:00:00'), '19:00');
  assert.equal(G.casNaText('25:00'), null);
  assert.equal(G.datumCasNaText('14.11.2026 12:00'), '2026-11-14 12:00');
  assert.equal(G.datumCasNaText('14. 11. 2026 9:30:00'), '2026-11-14 09:30');
  assert.equal(G.datumCasNaText('14.11.2026'), '2026-11-14 00:00');
});

test('přihlášky končí v čase začátku', () => {
  const t = termin();
  assert.equal(kontrola({}, t, [], '2026-11-14 18:59').ok, true);
  assert.match(kontrola({}, t, [], '2026-11-14 19:00').chyba, /skončilo/);
  assert.match(kontrola({}, t, [], '2026-11-15 10:00').chyba, /skončilo/);
});

test('dřívější uzávěrka platí, pozdější se ignoruje', () => {
  const dřív = termin({ uzaverka: '14.11.2026 12:00' });
  assert.equal(kontrola({}, dřív, [], '2026-11-14 11:59').ok, true);
  assert.equal(kontrola({}, dřív, [], '2026-11-14 12:00').ok, false);
  const pozdeji = termin({ uzaverka: '15.11.2026 12:00' });
  assert.equal(pozdeji.konec_prihlasek, '2026-11-14 19:00');
});

test('termín po půlnoci a na přelomu měsíce a roku', () => {
  const t = termin({ datum: '1.12.2026', cas: '0:30' });
  assert.equal(t.zacatek, '2026-12-01 00:30');
  assert.equal(kontrola({}, t, [], '2026-11-30 23:59').ok, true);
  assert.equal(kontrola({}, t, [], '2026-12-01 00:30').ok, false);
  const novyRok = termin({ datum: '1.1.2027', cas: '19:00' });
  assert.equal(kontrola({}, novyRok, [], '2026-12-31 23:00').ok, true);
});

test('zrušený a neexistující termín', () => {
  assert.match(kontrola({}, termin({ stav: 'Zrušeno' })).chyba, /zrušený/);
  assert.match(kontrola({}, null).chyba, /neznáme/);
});

test('veřejný stav uzavřeno po uzávěrce, zrušeno má přednost', () => {
  assert.equal(G.verejnyStav(termin({ uzaverka: '14.11.2026 12:00' }), [], '2026-11-14 13:00').stav, 'uzavreno');
  assert.equal(G.verejnyStav(termin({ stav: 'Zrušeno' }), [], '2026-11-10 12:00').stav, 'zruseno');
  assert.equal(G.verejnyStav(termin(), [], '2026-11-10 12:00').stav, 'otevreno');
});

test('duplicita: stejný název bez ohledu na velikost písmen a mezery', () => {
  const t = termin();
  const prihlasky = [{ termin_id: 'lev-1', tym: 'Večerní Sovy', stav: 'Potvrzeno' }];
  assert.match(kontrola({ tym: '  večerní   sovy ' }, t, prihlasky).chyba, /už je na tento termín přihlášený/);
  assert.equal(kontrola({ tym: 'VEČERNÍ SOVY' }, t, prihlasky).pole, 'tym');
});

test('duplicita: zrušená přihláška ani jiný termín nevadí', () => {
  const t = termin();
  assert.equal(kontrola({}, t, [{ termin_id: 'lev-1', tym: 'Večerní sovy', stav: 'Zrušeno' }]).ok, true);
  assert.equal(kontrola({}, t, [{ termin_id: 'lev-2', tym: 'Večerní sovy', stav: 'Potvrzeno' }]).ok, true);
});

test('duplicita: náhradník se stejným názvem se taky odmítne', () => {
  assert.equal(kontrola({}, termin(), [{ termin_id: 'lev-1', tym: 'večerní sovy', stav: 'Náhradník' }]).ok, false);
});
