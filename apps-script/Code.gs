/**
 * Kobla Kvíz – Google Apps Script u Google tabulky.
 *
 * Co dělá:
 *  - GET  ?akce=data  → veřejná data pro web (podniky, termíny s volnými místy, výsledky). Nikdy osobní údaje.
 *  - POST {akce:'prihlaska', …} → zapíše přihlášku týmu (hlídá kapacitu, náhradníky, uzávěrku, duplicitu),
 *        pošle potvrzení týmu, e-mail a Telegram organizátorovi.
 *  - POST {akce:'hospoda', …}   → zapíše zájem hospody a upozorní organizátora.
 *
 * Tajné hodnoty a nastavení jsou jen ve Script Properties (Nastavení projektu → Vlastnosti skriptu):
 *   TELEGRAM_TOKEN      – token Telegram bota (tajné)
 *   TELEGRAM_CHAT_ID    – chat ID, kam chodí zprávy (tajné)
 *   ORGANIZATOR_EMAIL   – e-mail, na který chodí upozornění
 *
 * Logika (kapacita, náhradníci, uzávěrka, validace, výběr veřejných dat) je v čistých funkcích bez volání
 * Google služeb, aby šla otestovat v Node (tests/). Google služby se volají jen ve funkcích s „_“ na konci
 * a v doGet/doPost.
 */

var TZ = 'Europe/Prague';
var CACHE_KLIC = 'verejna-data-v1';
var CACHE_SEKUND = 60;
var MIN_DOBA_VYPLNENI_MS = 3000;

var LISTY = {
  Podniky: ['id', 'nazev', 'mesto', 'adresa', 'mapa_url', 'popis', 'aktivni'],
  Terminy: ['id', 'podnik_id', 'datum', 'cas', 'kapacita_tymu', 'max_hracu', 'startovne_kc', 'uzaverka', 'stav', 'poznamka'],
  Prihlasky: ['cas_odeslani', 'termin_id', 'tym', 'pocet_hracu', 'kapitan', 'email', 'telefon', 'poznamka', 'stav', 'souhlas'],
  Vysledky: ['termin_id', 'poradi', 'tym', 'body'],
  Hospody: ['cas_odeslani', 'podnik', 'mesto', 'kontaktni_osoba', 'email', 'telefon', 'kapacita', 'zprava', 'souhlas'],
  Chyby: ['cas', 'akce', 'popis']
};

/* =====================================================================
 * 1) ČISTÉ FUNKCE – bez Google služeb (testují se v tests/)
 * ===================================================================== */

function dvojcifra(n) { return (n < 10 ? '0' : '') + n; }

// Text bez mezer navíc, malými písmeny – pro porovnání názvů týmů
function normalizujNazev(s) {
  return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLocaleLowerCase('cs');
}

// Oříznutý text s jednou mezerou mezi slovy
function cistyText(s) {
  return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[ \t]+/g, ' ').trim();
}

// Ochrana tabulky: text začínající = + - @ by se zapsal jako vzorec, proto dostane apostrof.
function bezpecnyText(s) {
  var t = String(s == null ? '' : s);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function jeEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '')); }
function cistyTelefon(s) { return String(s || '').replace(/[\s\-().\/]/g, ''); }
function jeTelefon(s) { return /^\+?\d{9,15}$/.test(cistyTelefon(s)); }

// Datum z buňky: objekt Date nebo text (14.11.2026, 14. 11. 2026, 2026-11-14). Vrací "2026-11-14" nebo null.
function datumNaIso(v, formatuj) {
  if (v instanceof Date || Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return null;
    if (formatuj) return formatuj(v, 'yyyy-MM-dd');
    return v.getFullYear() + '-' + dvojcifra(v.getMonth() + 1) + '-' + dvojcifra(v.getDate());
  }
  var s = String(v == null ? '' : v).trim();
  var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  var r, mes, den;
  if (m) { r = +m[1]; mes = +m[2]; den = +m[3]; }
  else {
    m = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/.exec(s);
    if (!m) return null;
    den = +m[1]; mes = +m[2]; r = +m[3];
  }
  var d = new Date(Date.UTC(r, mes - 1, den));
  if (d.getUTCFullYear() !== r || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== den) return null; // např. 31. 2.
  return r + '-' + dvojcifra(mes) + '-' + dvojcifra(den);
}

// Čas z buňky: "19:00", "9:30", "19:00:00" nebo Date. Vrací "19:00" nebo null.
function casNaText(v, formatuj) {
  if (v instanceof Date || Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return null;
    if (formatuj) return formatuj(v, 'HH:mm');
    return dvojcifra(v.getHours()) + ':' + dvojcifra(v.getMinutes());
  }
  var m = /^(\d{1,2})[:.](\d{2})/.exec(String(v == null ? '' : v).trim());
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return dvojcifra(+m[1]) + ':' + m[2];
}

// Datum a čas z buňky (uzávěrka): "14.11.2026 12:00", "2026-11-14 12:00" nebo Date. Vrací "2026-11-14 12:00" nebo null.
function datumCasNaText(v, formatuj) {
  if (v instanceof Date || Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return null;
    if (formatuj) return formatuj(v, 'yyyy-MM-dd HH:mm');
    return datumNaIso(v) + ' ' + casNaText(v);
  }
  var s = String(v == null ? '' : v).trim();
  if (!s) return null;
  var datum = datumNaIso(s);
  if (!datum) return null;
  var m = /(\d{1,2}[:.]\d{2})(:\d{2})?\s*$/.exec(s);
  var cas = m ? casNaText(m[1]) : '00:00';
  return cas ? datum + ' ' + cas : null;
}

function jeAno(v) {
  return v === true || /^(ano|a|true|yes|y|1)$/i.test(String(v == null ? '' : v).trim());
}

// Stav termínu z tabulky: Otevřeno / Zrušeno
function jeZruseny(t) { return /^zru[sš]eno$/i.test(String(t.stav || '').trim()); }

// Stav přihlášky z tabulky → 'potvrzeno' | 'nahradnik' | 'zruseno' | ''
function stavPrihlasky(p) {
  var s = String(p.stav || '').trim().toLocaleLowerCase('cs');
  if (s === 'potvrzeno') return 'potvrzeno';
  if (s === 'náhradník' || s === 'nahradnik') return 'nahradnik';
  if (s === 'zrušeno' || s === 'zruseno') return 'zruseno';
  return '';
}

// Číslo z buňky: zvládne i „50 Kč“, „1 200“ nebo „45,5“. Prázdné nebo nesmysl → výchozí hodnota.
function cislo(v, vychozi) {
  var t = String(v == null ? '' : v).replace(/[^\d,.\-]/g, '').replace(',', '.');
  var n = Number(t);
  return t !== '' && isFinite(n) ? n : vychozi;
}

// Řádky s id začínajícím na „vzor“ jsou ukázky z přípravy tabulky – web je ignoruje.
function jeVzor(id) { return /^vzor/i.test(String(id || '').trim()); }

// Převede termín z tabulky na jednotný tvar
function pripravTermin(radek, formatuj) {
  var datum = datumNaIso(radek.datum, formatuj);
  var cas = casNaText(radek.cas, formatuj) || '00:00';
  var zacatek = datum ? datum + ' ' + cas : null;
  var uzaverka = datumCasNaText(radek.uzaverka, formatuj);
  // přihlašování končí začátkem, nebo dřív, když je vyplněná dřívější uzávěrka
  var konec = zacatek;
  if (uzaverka && zacatek && uzaverka < zacatek) konec = uzaverka;
  return {
    id: String(radek.id || '').trim(),
    podnik_id: String(radek.podnik_id || '').trim(),
    datum: datum,
    cas: cas,
    zacatek: zacatek,
    konec_prihlasek: konec,
    kapacita_tymu: Math.max(0, Math.floor(cislo(radek.kapacita_tymu, 0))),
    max_hracu: Math.max(1, Math.floor(cislo(radek.max_hracu, 6))),
    startovne_kc: cislo(radek.startovne_kc, null),
    zruseno: jeZruseny(radek),
    poznamka: cistyText(radek.poznamka)
  };
}

// Přihlášky jednoho termínu: počet potvrzených a čekajících náhradníků
function obsazenost(terminId, prihlasky) {
  var vysl = { potvrzeno: 0, nahradnici: 0 };
  prihlasky.forEach(function (p) {
    if (String(p.termin_id || '').trim() !== terminId) return;
    var s = stavPrihlasky(p);
    if (s === 'potvrzeno') vysl.potvrzeno++;
    else if (s === 'nahradnik') vysl.nahradnici++;
  });
  return vysl;
}

// Pravidlo kapacity (SPEC): Potvrzeno jen když je potvrzených méně než kapacita A nikdo nečeká jako náhradník.
function rozhodniStav(termin, prihlasky) {
  var o = obsazenost(termin.id, prihlasky);
  return (o.potvrzeno < termin.kapacita_tymu && o.nahradnici === 0) ? 'Potvrzeno' : 'Náhradník';
}

// Veřejný stav termínu: otevreno | obsazeno | uzavreno | zruseno ("ted" = "yyyy-MM-dd HH:mm" v Praze)
function verejnyStav(termin, prihlasky, ted) {
  var o = obsazenost(termin.id, prihlasky);
  var volno = Math.max(0, termin.kapacita_tymu - o.potvrzeno);
  var stav;
  if (termin.zruseno) stav = 'zruseno';
  else if (!termin.konec_prihlasek || ted >= termin.konec_prihlasek) stav = 'uzavreno';
  else if (rozhodniStav(termin, prihlasky) === 'Náhradník') stav = 'obsazeno';
  else stav = 'otevreno';
  return { stav: stav, volno: stav === 'obsazeno' ? 0 : volno, potvrzeno: o.potvrzeno, nahradnici: o.nahradnici };
}

// Data pro web. Obsahuje JEN tato pole – žádná jména, e-maily, telefony ani poznámky hráčů.
function verejnaData(podnikyRadky, terminyRadky, prihlasky, vysledkyRadky, ted, formatuj) {
  var podniky = podnikyRadky
    .filter(function (p) { return p.id && !jeVzor(p.id) && jeAno(p.aktivni); })
    .map(function (p) {
      return {
        id: String(p.id).trim(), nazev: cistyText(p.nazev), mesto: cistyText(p.mesto), adresa: cistyText(p.adresa),
        mapa_url: /^https?:\/\//i.test(String(p.mapa_url || '').trim()) ? String(p.mapa_url).trim() : '',
        popis: cistyText(p.popis)
      };
    });
  var aktivni = {};
  podniky.forEach(function (p) { aktivni[p.id] = true; });
  var vsechnyPodniky = {};
  podnikyRadky.forEach(function (p) { if (p.id) vsechnyPodniky[String(p.id).trim()] = p; });

  var vsechnyTerminy = terminyRadky
    .filter(function (r) { return r.id && !jeVzor(r.id); })
    .map(function (r) { return pripravTermin(r, formatuj); })
    .filter(function (t) { return t.datum; });

  var terminy = vsechnyTerminy
    .filter(function (t) { return aktivni[t.podnik_id] && t.zacatek > ted; })
    .sort(function (a, b) { return a.zacatek < b.zacatek ? -1 : a.zacatek > b.zacatek ? 1 : 0; })
    .map(function (t) {
      var s = verejnyStav(t, prihlasky, ted);
      return {
        id: t.id, podnik_id: t.podnik_id, datum: t.datum, cas: t.cas,
        kapacita_tymu: t.kapacita_tymu, volno: s.volno, max_hracu: t.max_hracu,
        startovne_kc: t.startovne_kc, stav: s.stav, poznamka: t.poznamka
      };
    });

  // Výsledky po termínech (jen odehrané), nejnovější první
  var terminPodleId = {};
  vsechnyTerminy.forEach(function (t) { terminPodleId[t.id] = t; });
  var skupiny = {};
  vysledkyRadky.forEach(function (r) {
    var id = String(r.termin_id || '').trim();
    var t = terminPodleId[id];
    if (!t || jeVzor(id) || !String(r.tym || '').trim() || t.zacatek > ted) return;
    if (!skupiny[id]) {
      var p = vsechnyPodniky[t.podnik_id] || {};
      skupiny[id] = { termin_id: id, podnik_id: t.podnik_id, podnik_nazev: cistyText(p.nazev), mesto: cistyText(p.mesto), datum: t.datum, cas: t.cas, tymy: [] };
    }
    skupiny[id].tymy.push({ poradi: Math.floor(cislo(r.poradi, 0)), tym: cistyText(r.tym), body: cislo(r.body, 0) });
  });
  var vysledky = Object.keys(skupiny).map(function (k) {
    skupiny[k].tymy.sort(function (a, b) { return a.poradi - b.poradi; });
    return skupiny[k];
  }).sort(function (a, b) { var x = a.datum + a.cas, y = b.datum + b.cas; return x < y ? 1 : x > y ? -1 : 0; });

  return { ok: true, vygenerovano: ted, podniky: podniky, terminy: terminy, vysledky: vysledky };
}

// Kontrola přihlášky. Vrací {ok:true, data:{…vyčištěné…}} nebo {ok:false, chyba, pole}.
// "spam: true" = robot – tváříme se, že je hotovo, ale nic se nezapíše.
function zkontrolujPrihlasku(u, termin, prihlasky, ted) {
  u = u || {};
  if (cistyText(u.web)) return { ok: false, spam: true };
  if (!(Number(u.doba_ms) >= MIN_DOBA_VYPLNENI_MS)) return { ok: false, chyba: 'Formulář byl odeslaný moc rychle. Počkej pár sekund a zkus to znovu.' };
  if (!termin) return { ok: false, pole: 'termin_id', chyba: 'Tenhle termín neznáme. Obnov stránku a vyber termín znovu.' };
  if (termin.zruseno) return { ok: false, pole: 'termin_id', chyba: 'Tenhle termín je zrušený. Vyber prosím jiný.' };
  if (!termin.konec_prihlasek || ted >= termin.konec_prihlasek) return { ok: false, pole: 'termin_id', chyba: 'Přihlašování na tenhle termín už skončilo.' };
  var tym = cistyText(u.tym);
  if (tym.length < 2 || tym.length > 40) return { ok: false, pole: 'tym', chyba: 'Název týmu musí mít 2 až 40 znaků.' };
  var pocet = Number(u.pocet_hracu);
  if (!(pocet % 1 === 0) || pocet < 1 || pocet > termin.max_hracu) return { ok: false, pole: 'pocet_hracu', chyba: 'Počet hráčů musí být 1 až ' + termin.max_hracu + '.' };
  var kapitan = cistyText(u.kapitan);
  if (kapitan.length < 2 || kapitan.length > 60) return { ok: false, pole: 'kapitan', chyba: 'Napiš jméno kapitána.' };
  var email = cistyText(u.email);
  if (!jeEmail(email) || email.length > 120) return { ok: false, pole: 'email', chyba: 'Zkontroluj e-mail, něco v něm chybí.' };
  var telefon = cistyText(u.telefon);
  if (!jeTelefon(telefon)) return { ok: false, pole: 'telefon', chyba: 'Telefon má mít aspoň 9 číslic.' };
  var poznamka = String(u.poznamka == null ? '' : u.poznamka).trim();
  if (poznamka.length > 500) return { ok: false, pole: 'poznamka', chyba: 'Poznámka může mít nejvýš 500 znaků.' };
  if (u.souhlas !== true && !jeAno(u.souhlas)) return { ok: false, pole: 'souhlas', chyba: 'Bez souhlasu se zpracováním údajů tě nemůžeme přihlásit.' };
  var klic = normalizujNazev(tym);
  var duplicita = prihlasky.some(function (p) {
    return String(p.termin_id || '').trim() === termin.id && stavPrihlasky(p) !== 'zruseno' && normalizujNazev(p.tym) === klic;
  });
  if (duplicita) return { ok: false, pole: 'tym', chyba: 'Tým „' + tym + '“ už je na tento termín přihlášený. Jestli jde o omyl, napiš organizátorovi.' };
  return { ok: true, data: { termin_id: termin.id, tym: tym, pocet_hracu: pocet, kapitan: kapitan, email: email, telefon: telefon, poznamka: poznamka } };
}

function zkontrolujHospodu(u) {
  u = u || {};
  if (cistyText(u.web)) return { ok: false, spam: true };
  if (!(Number(u.doba_ms) >= MIN_DOBA_VYPLNENI_MS)) return { ok: false, chyba: 'Formulář byl odeslaný moc rychle. Počkej pár sekund a zkus to znovu.' };
  var podnik = cistyText(u.podnik), mesto = cistyText(u.mesto), osoba = cistyText(u.kontaktni_osoba);
  if (podnik.length < 2 || podnik.length > 80) return { ok: false, pole: 'podnik', chyba: 'Napiš název podniku.' };
  if (mesto.length < 2 || mesto.length > 60) return { ok: false, pole: 'mesto', chyba: 'Napiš město nebo obec.' };
  if (osoba.length < 2 || osoba.length > 60) return { ok: false, pole: 'kontaktni_osoba', chyba: 'Napiš, s kým se máme domluvit.' };
  var email = cistyText(u.email), telefon = cistyText(u.telefon);
  if (!email && !telefon) return { ok: false, pole: 'email', chyba: 'Vyplň e-mail, nebo telefon.' };
  if (email && !jeEmail(email)) return { ok: false, pole: 'email', chyba: 'Zkontroluj e-mail, něco v něm chybí.' };
  if (telefon && !jeTelefon(telefon)) return { ok: false, pole: 'telefon', chyba: 'Telefon má mít aspoň 9 číslic.' };
  var kapacita = cistyText(u.kapacita);
  if (kapacita && !(Number(kapacita) % 1 === 0 && Number(kapacita) >= 1 && Number(kapacita) <= 1000)) return { ok: false, pole: 'kapacita', chyba: 'Napiš přibližný počet míst jako číslo.' };
  var zprava = String(u.zprava == null ? '' : u.zprava).trim();
  if (zprava.length > 1000) return { ok: false, pole: 'zprava', chyba: 'Zpráva může mít nejvýš 1000 znaků.' };
  if (u.souhlas !== true && !jeAno(u.souhlas)) return { ok: false, pole: 'souhlas', chyba: 'Bez souhlasu ti nemůžeme odpovědět.' };
  return { ok: true, data: { podnik: podnik, mesto: mesto, kontaktni_osoba: osoba, email: email, telefon: telefon, kapacita: kapacita, zprava: zprava } };
}

// "2026-11-14", "19:00" → "so 14. 11. 2026 · 19:00"
function hezkeDatum(iso, cas) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return String(iso || '');
  var dny = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
  var den = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay();
  return dny[den] + ' ' + (+m[3]) + '. ' + (+m[2]) + '. ' + m[1] + (cas ? ' · ' + cas : '');
}

// Texty e-mailů a zprávy na Telegram
function textyPrihlasky(d, stav, termin, podnik, o) {
  var kdy = hezkeDatum(termin.datum, termin.cas);
  var kde = (podnik.nazev || '') + (podnik.adresa ? ', ' + podnik.adresa : '');
  var startovne = termin.startovne_kc != null ? termin.startovne_kc + ' Kč za osobu, platí se na místě' : 'podle informací na webu';
  var nahradnik = stav === 'Náhradník';
  var tym = [
    'Ahoj ' + d.kapitan + ',',
    '',
    nahradnik
      ? 'termín je teď plný, takže tým „' + d.tym + '“ je zapsaný jako NÁHRADNÍK. Když se místo uvolní, ozveme se ti.'
      : 'tým „' + d.tym + '“ je přihlášený na Kobla Kvíz. Místo máte jisté.',
    '',
    'Kdy: ' + kdy,
    'Kde: ' + kde,
    'Počet hráčů: ' + d.pocet_hracu,
    'Startovné: ' + startovne,
    '',
    'Kdybyste nemohli přijít, odpověz prosím na tento e-mail. Uvolníš tím místo dalším týmům.',
    '',
    'Těšíme se!',
    'Kobla Kvíz'
  ].join('\n');
  var org = [
    'Nová přihláška – ' + stav.toUpperCase(),
    '',
    'Termín: ' + kdy + ' (' + termin.id + ')',
    'Podnik: ' + (podnik.nazev || termin.podnik_id),
    'Tým: ' + d.tym,
    'Počet hráčů: ' + d.pocet_hracu,
    'Kapitán: ' + d.kapitan,
    'E-mail: ' + d.email,
    'Telefon: ' + d.telefon,
    'Poznámka: ' + (d.poznamka || '—'),
    '',
    'Obsazenost: ' + o.potvrzeno + '/' + termin.kapacita_tymu + ' potvrzených, náhradníků: ' + o.nahradnici
  ].join('\n');
  var telegram = (nahradnik ? '🟡 Náhradník' : '🟢 Nová přihláška') + '\n' + d.tym + ' (' + d.pocet_hracu + ' hr.)\n' + kdy + ' · ' + (podnik.nazev || termin.podnik_id) +
    '\nKapitán: ' + d.kapitan + ', ' + d.telefon + '\nObsazeno: ' + o.potvrzeno + '/' + termin.kapacita_tymu + (o.nahradnici ? ', náhradníků: ' + o.nahradnici : '');
  return {
    predmetTym: 'Kobla Kvíz: ' + (nahradnik ? 'jste náhradník' : 'přihláška potvrzena') + ' – ' + hezkeDatum(termin.datum),
    textTym: tym,
    predmetOrg: 'Přihláška: ' + d.tym + ' (' + stav + ') – ' + hezkeDatum(termin.datum),
    textOrg: org,
    telegram: telegram
  };
}

function textyHospody(d) {
  var radky = [
    'Hospoda má zájem o Kobla Kvíz',
    '',
    'Podnik: ' + d.podnik,
    'Město: ' + d.mesto,
    'Kontaktní osoba: ' + d.kontaktni_osoba,
    'E-mail: ' + (d.email || '—'),
    'Telefon: ' + (d.telefon || '—'),
    'Kapacita: ' + (d.kapacita || '—'),
    'Zpráva: ' + (d.zprava || '—')
  ];
  return { predmet: 'Zájem o kvíz: ' + d.podnik + ', ' + d.mesto, text: radky.join('\n'), telegram: '🍺 Zájem hospody\n' + d.podnik + ', ' + d.mesto + '\n' + d.kontaktni_osoba + ', ' + (d.telefon || d.email) };
}

/* =====================================================================
 * 2) ZPRACOVÁNÍ AKCÍ – Google služby dostává zvenku ("s"), aby šlo testovat
 * ===================================================================== */

/**
 * Přihláška týmu. Zámek obklopuje čtení stavu i zápis přihlášky, takže dvě souběžné přihlášky
 * na poslední místo nemůžou obě dostat „Potvrzeno“. Upozornění se posílají až po uvolnění zámku
 * a jejich selhání přihlášku neruší (zapíše se do listu Chyby).
 */
function zpracujPrihlasku(u, s) {
  if (!s.zamkni(20000)) {
    return { ok: false, chyba: 'Teď se přihlašuje víc týmů naráz. Zkus to prosím za pár sekund znovu.' };
  }
  var vysledek, termin, podnik, o;
  try {
    var ted = s.ted();
    var terminy = s.nactiTerminy();
    var prihlasky = s.nactiPrihlasky();
    var radek = terminy.filter(function (t) { return String(t.id || '').trim() === String(u && u.termin_id || '').trim() && !jeVzor(t.id); })[0];
    termin = radek ? pripravTermin(radek, s.formatuj) : null;
    var kontrola = zkontrolujPrihlasku(u, termin, prihlasky, ted);
    if (kontrola.spam) return { ok: true, stav: 'Potvrzeno' };
    if (!kontrola.ok) return { ok: false, chyba: kontrola.chyba, pole: kontrola.pole };
    var stav = rozhodniStav(termin, prihlasky);
    var d = kontrola.data;
    s.zapisPrihlasku([s.cas(), d.termin_id, d.tym, d.pocet_hracu, d.kapitan, d.email, d.telefon, d.poznamka, stav, 'Ano']);
    o = obsazenost(termin.id, prihlasky.concat([{ termin_id: termin.id, stav: stav }]));
    podnik = s.najdiPodnik(termin.podnik_id) || {};
    vysledek = { ok: true, stav: stav, data: d };
  } finally {
    s.odemkni();
  }
  s.smazCache();

  var texty = textyPrihlasky(vysledek.data, vysledek.stav, termin, podnik, o);
  bezpecne(s, 'e-mail týmu', function () { s.posliEmail(vysledek.data.email, texty.predmetTym, texty.textTym, true); });
  bezpecne(s, 'e-mail organizátorovi', function () { s.posliEmailOrganizatorovi(texty.predmetOrg, texty.textOrg); });
  bezpecne(s, 'Telegram', function () { s.posliTelegram(texty.telegram); });
  return { ok: true, stav: vysledek.stav };
}

function zpracujHospodu(u, s) {
  var kontrola = zkontrolujHospodu(u);
  if (kontrola.spam) return { ok: true };
  if (!kontrola.ok) return { ok: false, chyba: kontrola.chyba, pole: kontrola.pole };
  var d = kontrola.data;
  s.zapisHospodu([s.cas(), d.podnik, d.mesto, d.kontaktni_osoba, d.email, d.telefon, d.kapacita, d.zprava, 'Ano']);
  var t = textyHospody(d);
  bezpecne(s, 'e-mail organizátorovi (hospoda)', function () { s.posliEmailOrganizatorovi(t.predmet, t.text); });
  bezpecne(s, 'Telegram (hospoda)', function () { s.posliTelegram(t.telegram); });
  return { ok: true };
}

// Spustí upozornění; když selže, zapíše chybu a pokračuje.
function bezpecne(s, akce, fn) {
  try { fn(); } catch (e) {
    try { s.zapisChybu(akce, String(e && e.message || e)); } catch (e2) { /* ani zápis chyby nesmí shodit přihlášku */ }
  }
}

/* =====================================================================
 * 3) GOOGLE ČÁST – vstupní body web app a práce s tabulkou
 * ===================================================================== */

function doGet(e) {
  var akce = e && e.parameter && e.parameter.akce;
  if (akce !== 'data') return json_({ ok: true, info: 'Kobla Kvíz – skript běží. Data pro web: ?akce=data' });
  try {
    var cache = CacheService.getScriptCache();
    var ulozeno = cache.get(CACHE_KLIC);
    if (ulozeno) return ContentService.createTextOutput(ulozeno).setMimeType(ContentService.MimeType.JSON);
    var data = verejnaData(nactiList_('Podniky', true), nactiList_('Terminy', true), nactiList_('Prihlasky', false),
      nactiList_('Vysledky', true), ted_(), formatuj_);
    var text = JSON.stringify(data);
    if (text.length < 90000) cache.put(CACHE_KLIC, text, CACHE_SEKUND);
    return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    zapisChybu_('načtení dat', String(err && err.message || err));
    return json_({ ok: false, chyba: 'Data se nepodařilo načíst.' });
  }
}

function doPost(e) {
  var u;
  try {
    u = JSON.parse(e && e.postData && e.postData.contents || '{}');
  } catch (err) {
    return json_({ ok: false, chyba: 'Neplatný požadavek.' });
  }
  try {
    if (u.akce === 'prihlaska') return json_(zpracujPrihlasku(u, sluzbyGoogle_()));
    if (u.akce === 'hospoda') return json_(zpracujHospodu(u, sluzbyGoogle_()));
    return json_({ ok: false, chyba: 'Neznámá akce.' });
  } catch (err) {
    zapisChybu_('odeslání formuláře', String(err && err.message || err));
    return json_({ ok: false, chyba: 'Něco se pokazilo na naší straně. Zkus to prosím znovu, nebo napiš organizátorovi.' });
  }
}

// Skutečné Google služby pro zpracujPrihlasku / zpracujHospodu
function sluzbyGoogle_() {
  var zamek = LockService.getScriptLock();
  var vlastnosti = PropertiesService.getScriptProperties();
  return {
    zamkni: function (ms) { return zamek.tryLock(ms); },
    odemkni: function () { SpreadsheetApp.flush(); zamek.releaseLock(); },
    ted: ted_,
    cas: function () { return new Date(); },
    formatuj: formatuj_,
    nactiTerminy: function () { return nactiList_('Terminy', true); },
    nactiPrihlasky: function () { return nactiList_('Prihlasky', false); },
    najdiPodnik: function (id) { return nactiList_('Podniky', true).filter(function (p) { return String(p.id).trim() === id; })[0]; },
    zapisPrihlasku: function (radek) { pridejRadek_('Prihlasky', radek); },
    zapisHospodu: function (radek) { pridejRadek_('Hospody', radek); },
    zapisChybu: zapisChybu_,
    smazCache: function () { CacheService.getScriptCache().remove(CACHE_KLIC); },
    posliEmail: function (komu, predmet, text, odpovedOrganizatorovi) {
      var org = vlastnosti.getProperty('ORGANIZATOR_EMAIL');
      var zprava = { to: komu, subject: predmet, body: text, name: 'Kobla Kvíz' };
      if (odpovedOrganizatorovi && org) zprava.replyTo = org;
      MailApp.sendEmail(zprava);
    },
    posliEmailOrganizatorovi: function (predmet, text) {
      var org = vlastnosti.getProperty('ORGANIZATOR_EMAIL');
      if (!org) throw new Error('Ve Script Properties chybí ORGANIZATOR_EMAIL.');
      MailApp.sendEmail({ to: org, subject: predmet, body: text, name: 'Kobla Kvíz' });
    },
    posliTelegram: function (text) { posliTelegram_(text); }
  };
}

function posliTelegram_(text) {
  var vlastnosti = PropertiesService.getScriptProperties();
  var token = vlastnosti.getProperty('TELEGRAM_TOKEN');
  var chat = vlastnosti.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chat) throw new Error('Ve Script Properties chybí TELEGRAM_TOKEN nebo TELEGRAM_CHAT_ID.');
  var odpoved = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    payload: { chat_id: chat, text: text, disable_web_page_preview: 'true' },
    muteHttpExceptions: true
  });
  var kod = odpoved.getResponseCode();
  // Token do chyby nikdy nevypisujeme
  if (kod !== 200) throw new Error('Telegram odpověděl kódem ' + kod + ': ' + odpoved.getContentText().slice(0, 200));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ted_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'); }
function formatuj_(d, vzor) { return Utilities.formatDate(d, TZ, vzor); }

// Načte list jako pole objektů podle hlavičky. "zobrazeno" = hodnoty tak, jak je vidí David (text).
function nactiList_(nazev, zobrazeno) {
  var list = SpreadsheetApp.getActive().getSheetByName(nazev);
  if (!list) throw new Error('Chybí list ' + nazev + '. Spusť funkci pripravTabulku.');
  var rozsah = list.getDataRange();
  var hodnoty = zobrazeno ? rozsah.getDisplayValues() : rozsah.getValues();
  var hlavicka = hodnoty.shift().map(function (h) { return String(h).trim(); });
  return hodnoty.filter(function (r) { return r.join('') !== ''; }).map(function (r) {
    var o = {};
    hlavicka.forEach(function (h, i) { if (h) o[h] = r[i]; });
    return o;
  });
}

function pridejRadek_(nazev, radek) {
  var list = SpreadsheetApp.getActive().getSheetByName(nazev);
  if (!list) throw new Error('Chybí list ' + nazev + '. Spusť funkci pripravTabulku.');
  list.appendRow(radek.map(function (v) { return typeof v === 'string' ? bezpecnyText(v) : v; }));
}

function zapisChybu_(akce, popis) {
  try {
    var ss = SpreadsheetApp.getActive();
    var list = ss.getSheetByName('Chyby') || ss.insertSheet('Chyby');
    list.appendRow([new Date(), bezpecnyText(akce), bezpecnyText(String(popis).slice(0, 500))]);
  } catch (e) { console.error(akce + ': ' + popis); }
}

/* =====================================================================
 * 4) FUNKCE PRO DAVIDA – spouštějí se ručně v editoru (tlačítko Spustit)
 * ===================================================================== */

/**
 * Příprava tabulky. Vytvoří chybějící listy s hlavičkami a ukázkovými řádky (id začíná „vzor“,
 * web je ignoruje). Existující listy a data NEPŘEPISUJE.
 */
function pripravTabulku() {
  var ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);
  ss.setSpreadsheetLocale('cs_CZ');
  var vzory = {
    Podniky: [['vzor', 'Ukázková hospoda (smaž mě)', 'Prostějov', 'Ulice 1, Prostějov', 'https://mapy.cz/', 'Krátký popis podniku.', 'Ne']],
    Terminy: [['vzor-2026-12-03', 'vzor', '3.12.2026', '19:00', 12, 6, 50, '', 'Otevřeno', '']],
    Vysledky: [['vzor-2026-12-03', 1, 'Ukázkový tým', 45]]
  };
  var vytvoreno = [];
  Object.keys(LISTY).forEach(function (nazev) {
    var list = ss.getSheetByName(nazev);
    if (list) return;
    list = ss.insertSheet(nazev);
    var hlavicka = LISTY[nazev];
    list.getRange(1, 1, 1, hlavicka.length).setValues([hlavicka]).setFontWeight('bold').setBackground('#f4ead5');
    list.setFrozenRows(1);
    if (vzory[nazev]) list.getRange(2, 1, vzory[nazev].length, hlavicka.length).setValues(vzory[nazev]);
    nastavFormaty_(list, nazev);
    list.autoResizeColumns(1, hlavicka.length);
    vytvoreno.push(nazev);
  });
  // výchozí prázdný list „List 1“ / „Sheet1“ smažeme, jen když je opravdu prázdný
  ['List 1', 'Sheet1', 'List1'].forEach(function (n) {
    var l = ss.getSheetByName(n);
    if (l && l.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(l);
  });
  var zprava = vytvoreno.length ? 'Hotovo. Vytvořené listy: ' + vytvoreno.join(', ') + '.' : 'Všechny listy už existují, nic jsem neměnil.';
  try { SpreadsheetApp.getUi().alert(zprava); } catch (e) { console.log(zprava); }
}

function nastavFormaty_(list, nazev) {
  var radku = 1000;
  function sloupec(jmeno) { return LISTY[nazev].indexOf(jmeno) + 1; }
  function vyber(jmeno, moznosti) {
    var pravidlo = SpreadsheetApp.newDataValidation().requireValueInList(moznosti, true).setAllowInvalid(false).build();
    list.getRange(2, sloupec(jmeno), radku, 1).setDataValidation(pravidlo);
  }
  if (nazev === 'Podniky') vyber('aktivni', ['Ano', 'Ne']);
  if (nazev === 'Terminy') {
    list.getRange(2, sloupec('datum'), radku, 1).setNumberFormat('d.M.yyyy');
    list.getRange(2, sloupec('cas'), radku, 1).setNumberFormat('HH:mm');
    list.getRange(2, sloupec('uzaverka'), radku, 1).setNumberFormat('d.M.yyyy HH:mm');
    vyber('stav', ['Otevřeno', 'Zrušeno']);
  }
  if (nazev === 'Prihlasky') {
    list.getRange(2, sloupec('cas_odeslani'), radku, 1).setNumberFormat('d.M.yyyy HH:mm:ss');
    list.getRange(2, sloupec('telefon'), radku, 1).setNumberFormat('@');
    vyber('stav', ['Potvrzeno', 'Náhradník', 'Zrušeno']);
  }
  if (nazev === 'Hospody') {
    list.getRange(2, sloupec('cas_odeslani'), radku, 1).setNumberFormat('d.M.yyyy HH:mm:ss');
    list.getRange(2, sloupec('telefon'), radku, 1).setNumberFormat('@');
  }
  if (nazev === 'Chyby') list.getRange(2, 1, radku, 1).setNumberFormat('d.M.yyyy HH:mm:ss');
}

/** Pošle zkušební e-mail organizátorovi a zkušební zprávu na Telegram. Výsledek ukáže v okně. */
function vyzkousejUpozorneni() {
  var s = sluzbyGoogle_();
  var vysledky = [];
  try { s.posliEmailOrganizatorovi('Kobla Kvíz: zkušební e-mail', 'Když tohle čteš, e-maily ze skriptu fungují.'); vysledky.push('E-mail: odeslán.'); }
  catch (e) { vysledky.push('E-mail: CHYBA – ' + e.message); }
  try { s.posliTelegram('Kobla Kvíz: zkušební zpráva. Telegram funguje.'); vysledky.push('Telegram: odeslán.'); }
  catch (e) { vysledky.push('Telegram: CHYBA – ' + e.message); }
  vysledky.push('Zbývající denní limit e-mailů: ' + MailApp.getRemainingDailyQuota());
  try { SpreadsheetApp.getUi().alert(vysledky.join('\n')); } catch (e) { console.log(vysledky.join('\n')); }
}

/** Přidá do tabulky menu „Kobla Kvíz“, ať David nemusí do editoru skriptu. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Kobla Kvíz')
    .addItem('Připravit listy', 'pripravTabulku')
    .addItem('Vyzkoušet e-mail a Telegram', 'vyzkousejUpozorneni')
    .addToUi();
}
