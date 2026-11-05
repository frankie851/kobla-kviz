// Výběr veřejných dat pro web – nikdy osobní údaje hráčů (K7)
const test = require('node:test');
const assert = require('node:assert/strict');
const { nactiSkript, radekTerminu } = require('./pomocnik');
const G = nactiSkript();

const podniky = [
  { id: 'lev', nazev: 'Hostinec U Lva', mesto: 'Prostějov', adresa: 'Ukázková 1', mapa_url: 'https://mapy.cz/x', popis: 'Sál.', aktivni: 'Ano' },
  { id: 'sova', nazev: 'Kavárna Sova', mesto: 'Plumlov', adresa: 'Vymyšlená 2', mapa_url: 'javascript:alert(1)', popis: '', aktivni: 'ano' },
  { id: 'stary', nazev: 'Zavřená hospoda', mesto: 'Konice', adresa: 'Stará 3', mapa_url: '', popis: '', aktivni: 'Ne' },
  { id: 'vzor', nazev: 'Ukázková hospoda', mesto: 'Prostějov', adresa: 'Ulice 1', mapa_url: '', popis: '', aktivni: 'Ano' }
];
const terminy = [
  radekTerminu({ id: 'lev-2', datum: '20.11.2026' }),
  radekTerminu({ id: 'lev-1', datum: '14.11.2026' }),
  radekTerminu({ id: 'sova-1', podnik_id: 'sova', datum: '15.11.2026', kapacita_tymu: '1' }),
  radekTerminu({ id: 'stary-1', podnik_id: 'stary', datum: '16.11.2026' }),
  radekTerminu({ id: 'lev-0', datum: '1.11.2026' }),
  radekTerminu({ id: 'stary-0', podnik_id: 'stary', datum: '2.10.2026' }),
  radekTerminu({ id: 'vzor-1', podnik_id: 'vzor', datum: '3.12.2026' })
];
const prihlasky = [
  { cas_odeslani: new Date(), termin_id: 'lev-1', tym: 'Tajní agenti', pocet_hracu: 4, kapitan: 'Karel Tajný', email: 'karel@example.com', telefon: '+420 601 111 222', poznamka: 'alergie na ořechy', stav: 'Potvrzeno', souhlas: 'Ano' },
  { cas_odeslani: new Date(), termin_id: 'sova-1', tym: 'Plný stůl', pocet_hracu: 3, kapitan: 'Eva Skrytá', email: 'eva@example.com', telefon: '602333444', poznamka: 'přijdeme později', stav: 'Potvrzeno', souhlas: 'Ano' }
];
const vysledky = [
  { termin_id: 'lev-0', poradi: '2', tym: 'Druzí', body: '40' },
  { termin_id: 'lev-0', poradi: '1', tym: 'První', body: '45,5' },
  { termin_id: 'stary-0', poradi: '1', tym: 'Staří páni', body: '30' },
  { termin_id: 'lev-2', poradi: '1', tym: 'Budoucí', body: '1' },
  { termin_id: 'vzor-1', poradi: '1', tym: 'Ukázkový tým', body: '45' }
];
const ted = '2026-11-10 12:00';
// JSON převod: pole z modulu vm nejdou přímo porovnat přes deepEqual
const data = JSON.parse(JSON.stringify(G.verejnaData(podniky, terminy, prihlasky, vysledky, ted)));
const json = JSON.stringify(data);

test('K7: žádná jména kapitánů, e-maily, telefony ani poznámky', () => {
  for (const zakazane of ['Karel', 'Eva Skrytá', 'example.com', '@', '601', '602333444', 'alergie', 'později', 'kapitan', 'email', 'telefon', 'Tajní agenti', 'Plný stůl']) {
    assert.ok(!json.includes(zakazane), 'veřejná data obsahují: ' + zakazane);
  }
});

test('K7: termíny mají jen povolená pole', () => {
  const povolena = ['id', 'podnik_id', 'datum', 'cas', 'kapacita_tymu', 'volno', 'max_hracu', 'startovne_kc', 'stav', 'poznamka'].sort();
  data.terminy.forEach(t => assert.deepEqual(Object.keys(t).sort(), povolena));
  data.podniky.forEach(p => assert.deepEqual(Object.keys(p).sort(), ['adresa', 'id', 'mapa_url', 'mesto', 'nazev', 'popis']));
});

test('jen aktivní podniky, bez ukázkových řádků „vzor“', () => {
  assert.deepEqual(data.podniky.map(p => p.id), ['lev', 'sova']);
});

test('jen budoucí termíny aktivních podniků, seřazené podle data', () => {
  assert.deepEqual(data.terminy.map(t => t.id), ['lev-1', 'sova-1', 'lev-2']);
});

test('volná místa a obsazeno', () => {
  const lev1 = data.terminy.find(t => t.id === 'lev-1');
  assert.equal(lev1.volno, 1);
  assert.equal(lev1.stav, 'otevreno');
  assert.equal(data.terminy.find(t => t.id === 'sova-1').stav, 'obsazeno');
});

test('nebezpečný odkaz na mapu se nepustí', () => {
  assert.equal(data.podniky.find(p => p.id === 'sova').mapa_url, '');
});

test('výsledky jen odehraných kvízů, nejnovější první, seřazené podle pořadí', () => {
  assert.deepEqual(data.vysledky.map(v => v.termin_id), ['lev-0', 'stary-0']);
  assert.deepEqual(data.vysledky[0].tymy.map(t => t.tym), ['První', 'Druzí']);
  assert.equal(data.vysledky[0].tymy[0].body, 45.5);
  assert.equal(data.vysledky[1].podnik_nazev, 'Zavřená hospoda', 'výsledky zavřeného podniku zůstávají');
});

test('čísla z tabulky: „50 Kč“, „1 200“, „45,5“, prázdné', () => {
  assert.equal(G.cislo('50 Kč', null), 50);
  assert.equal(G.cislo('1 200', null), 1200);
  assert.equal(G.cislo('45,5', 0), 45.5);
  assert.equal(G.cislo('', 6), 6);
  assert.equal(G.cislo('nevím', 6), 6);
});
