// Validace přihlášky a formuláře hospod, ochrana proti spamu, ochrana tabulky před vzorci
const test = require('node:test');
const assert = require('node:assert/strict');
const { nactiSkript, radekTerminu, prihlaska, falesneSluzby } = require('./pomocnik');
const G = nactiSkript();
const t = G.pripravTermin(radekTerminu());
const k = (u) => G.zkontrolujPrihlasku(prihlaska(u), t, [], '2026-11-10 12:00');

test('platná přihláška projde a údaje se vyčistí', () => {
  const r = k({ tym: '  Večerní   sovy ', kapitan: ' Jan  Ukázka ' });
  assert.equal(r.ok, true);
  assert.equal(r.data.tym, 'Večerní sovy');
  assert.equal(r.data.kapitan, 'Jan Ukázka');
});

test('název týmu 2–40 znaků', () => {
  assert.equal(k({ tym: 'A' }).pole, 'tym');
  assert.equal(k({ tym: 'x'.repeat(41) }).pole, 'tym');
  assert.equal(k({ tym: 'AB' }).ok, true);
  assert.equal(k({ tym: '   ' }).pole, 'tym');
});

test('počet hráčů 1 až max_hracu, celé číslo', () => {
  assert.equal(k({ pocet_hracu: 0 }).pole, 'pocet_hracu');
  assert.equal(k({ pocet_hracu: 7 }).pole, 'pocet_hracu');
  assert.equal(k({ pocet_hracu: 2.5 }).pole, 'pocet_hracu');
  assert.equal(k({ pocet_hracu: 'abc' }).pole, 'pocet_hracu');
  assert.equal(k({ pocet_hracu: '6' }).ok, true);
});

test('kapitán, e-mail, telefon', () => {
  assert.equal(k({ kapitan: '' }).pole, 'kapitan');
  assert.equal(k({ email: 'jan@' }).pole, 'email');
  assert.equal(k({ email: 'jan example.com' }).pole, 'email');
  assert.equal(k({ telefon: '' }).pole, 'telefon');
  assert.equal(k({ telefon: '123 456' }).pole, 'telefon');
  assert.equal(k({ telefon: 'volej mi' }).pole, 'telefon');
  assert.equal(k({ telefon: '600 123 456' }).ok, true);
  assert.equal(k({ telefon: '+420 (600) 123-456' }).ok, true);
});

test('poznámka max 500 znaků, souhlas povinný', () => {
  assert.equal(k({ poznamka: 'x'.repeat(501) }).pole, 'poznamka');
  assert.equal(k({ poznamka: 'x'.repeat(500) }).ok, true);
  assert.equal(k({ souhlas: false }).pole, 'souhlas');
  assert.equal(k({ souhlas: undefined }).pole, 'souhlas');
});

test('spam: vyplněné skryté pole → nic se nezapíše, robot dostane „hotovo“', () => {
  assert.equal(k({ web: 'http://spam' }).spam, true);
  const { s, stav } = falesneSluzby();
  const odp = G.zpracujPrihlasku(prihlaska({ web: 'x' }), s);
  assert.equal(odp.ok, true);
  assert.equal(stav.prihlasky.length, 0);
  assert.equal(stav.emaily.length, 0);
});

test('spam: formulář odeslaný za méně než 3 s se odmítne', () => {
  assert.match(k({ doba_ms: 800 }).chyba, /moc rychle/);
  assert.equal(k({ doba_ms: undefined }).ok, false);
});

test('ochrana tabulky: text začínající = + - @ se zapíše jako text', () => {
  assert.equal(G.bezpecnyText('=IMPORTXML("x")'), "'=IMPORTXML(\"x\")");
  assert.equal(G.bezpecnyText('+420 600'), "'+420 600");
  assert.equal(G.bezpecnyText('Sovy'), 'Sovy');
});

test('formulář hospod: povinná pole a aspoň jeden kontakt', () => {
  const zaklad = { podnik: 'U Lva', mesto: 'Prostějov', kontaktni_osoba: 'Petr', email: '', telefon: '', souhlas: true, web: '', doba_ms: 9000 };
  assert.equal(G.zkontrolujHospodu(zaklad).pole, 'email');
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { telefon: '777123456' })).ok, true);
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { email: 'a@b.cz' })).ok, true);
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { email: 'spatne' })).pole, 'email');
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { podnik: '' , telefon: '777123456' })).pole, 'podnik');
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { telefon: '777123456', kapacita: 'hodně' })).pole, 'kapacita');
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { telefon: '777123456', souhlas: false })).pole, 'souhlas');
  assert.equal(G.zkontrolujHospodu(Object.assign({}, zaklad, { web: 'bot' })).spam, true);
});

test('formulář hospod se zapíše a pošle upozornění', () => {
  const { s, stav } = falesneSluzby();
  const odp = G.zpracujHospodu({ podnik: 'U Lva', mesto: 'Prostějov', kontaktni_osoba: 'Petr', telefon: '777123456', souhlas: true, doba_ms: 9000 }, s);
  assert.equal(odp.ok, true);
  assert.equal(stav.hospody.length, 1);
  assert.equal(stav.emaily.length, 1);
  assert.equal(stav.telegramy.length, 1);
});
