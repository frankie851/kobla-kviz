// Selhání Telegramu nebo e-mailu nesmí způsobit ztrátu přihlášky (K8)
const test = require('node:test');
const assert = require('node:assert/strict');
const { nactiSkript, prihlaska, falesneSluzby } = require('./pomocnik');

test('K8: nefunkční token Telegramu – přihláška se zapíše, chyba jde do listu Chyby, token nikde', () => {
  const TOKEN = '123456:NEFUNKCNI-TOKEN';
  const G = nactiSkript({
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => ({ TELEGRAM_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '42' })[k] || null }) },
    UrlFetchApp: { fetch: (url) => ({ getResponseCode: () => 401, getContentText: () => '{"ok":false,"error_code":401,"description":"Unauthorized"}' }) }
  });
  const { s, stav } = falesneSluzby({ posliTelegram: (text) => G.posliTelegram_(text) });
  const odp = G.zpracujPrihlasku(prihlaska(), s);
  assert.equal(odp.ok, true);
  assert.equal(odp.stav, 'Potvrzeno');
  assert.equal(stav.prihlasky.length, 1, 'přihláška je v tabulce');
  assert.equal(stav.emaily.length, 2, 'e-maily odešly');
  assert.equal(stav.chyby.length, 1);
  assert.equal(stav.chyby[0][0], 'Telegram');
  assert.match(stav.chyby[0][1], /401/);
  assert.ok(!JSON.stringify(stav.chyby).includes(TOKEN), 'token se nesmí objevit v chybě');
});

test('K8: chybějící token – přihláška se zapíše, chyba srozumitelně', () => {
  const G = nactiSkript({ PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) } });
  const { s, stav } = falesneSluzby({ posliTelegram: (text) => G.posliTelegram_(text) });
  assert.equal(G.zpracujPrihlasku(prihlaska(), s).ok, true);
  assert.match(stav.chyby[0][1], /chybí TELEGRAM_TOKEN/);
});

test('K8: selže e-mail (vyčerpaný limit) – přihláška zůstane, Telegram odejde', () => {
  const G = nactiSkript();
  const { s, stav } = falesneSluzby({ emailSelze: true });
  const odp = G.zpracujPrihlasku(prihlaska(), s);
  assert.equal(odp.ok, true);
  assert.equal(stav.prihlasky.length, 1);
  assert.equal(stav.telegramy.length, 1);
  assert.deepEqual(stav.chyby.map(c => c[0]), ['e-mail týmu', 'e-mail organizátorovi']);
});

test('K8: selže všechno včetně zápisu do Chyby – přihláška přesto platí', () => {
  const G = nactiSkript();
  const { s, stav } = falesneSluzby({ emailSelze: true, telegramSelze: true, chybaZapisuChyby: true });
  const odp = G.zpracujPrihlasku(prihlaska(), s);
  assert.equal(odp.ok, true);
  assert.equal(stav.prihlasky.length, 1);
});

test('texty e-mailu týmu obsahují termín, podnik, adresu, startovné a jak se odhlásit', () => {
  const G = nactiSkript();
  const { s, stav } = falesneSluzby();
  G.zpracujPrihlasku(prihlaska(), s);
  const e = stav.emaily.find(x => x.komu === 'jan@example.com');
  assert.match(e.predmet, /přihláška potvrzena – so 14\. 11\. 2026/);
  for (const t of ['so 14. 11. 2026 · 19:00', 'Hostinec U Lva', 'Ukázková 1, Prostějov', '50 Kč za osobu', 'odpověz prosím na tento e-mail']) assert.ok(e.text.includes(t), t);
  assert.match(stav.telegramy[0], /Večerní sovy/);
});
