// Načte apps-script/Code.gs do Node (modul vm), aby šly testovat jeho čisté funkce.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function nactiSkript(globaly) {
  const kod = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
  const ctx = vm.createContext(Object.assign({ console }, globaly || {}));
  vm.runInContext(kod, ctx, { filename: 'Code.gs' });
  return ctx;
}

// Termín v podobě, jak ho vrací tabulka (getDisplayValues)
function radekTerminu(prepis) {
  return Object.assign({ id: 'lev-1', podnik_id: 'lev', datum: '14.11.2026', cas: '19:00', kapacita_tymu: '2', max_hracu: '6', startovne_kc: '50', uzaverka: '', stav: 'Otevřeno', poznamka: '' }, prepis || {});
}

// Platná přihláška z webu
function prihlaska(prepis) {
  return Object.assign({ akce: 'prihlaska', termin_id: 'lev-1', tym: 'Večerní sovy', pocet_hracu: 4, kapitan: 'Jan Ukázka', email: 'jan@example.com', telefon: '+420 600 000 000', poznamka: '', souhlas: true, web: '', doba_ms: 20000 }, prepis || {});
}

// Falešné služby pro zpracujPrihlasku: tabulka v paměti, záznam pořadí volání, volitelně selhání.
function falesneSluzby(moznosti) {
  moznosti = moznosti || {};
  const zaznam = [];
  const stav = {
    terminy: moznosti.terminy || [radekTerminu()],
    prihlasky: moznosti.prihlasky || [],
    hospody: [],
    chyby: [],
    emaily: [],
    telegramy: [],
    cacheSmazana: 0,
    zamek: moznosti.zamek || jednoduchyZamek()
  };
  const s = {
    zamkni: ms => { zaznam.push('zamkni'); return stav.zamek.zamkni(ms); },
    odemkni: () => { zaznam.push('odemkni'); stav.zamek.odemkni(); },
    ted: () => moznosti.ted || '2026-11-10 12:00',
    cas: () => new Date('2026-11-10T11:00:00Z'),
    formatuj: null,
    nactiTerminy: () => { zaznam.push('cti-terminy:' + (stav.zamek.drzen() ? 'zamceno' : 'ODEMCENO')); if (moznosti.priCteni) moznosti.priCteni(); return stav.terminy.slice(); },
    nactiPrihlasky: () => { zaznam.push('cti-prihlasky:' + (stav.zamek.drzen() ? 'zamceno' : 'ODEMCENO')); const kopie = stav.prihlasky.map(p => Object.assign({}, p)); if (moznosti.poCteniPrihlasek) moznosti.poCteniPrihlasek(); return kopie; },
    najdiPodnik: id => ({ id, nazev: 'Hostinec U Lva', adresa: 'Ukázková 1, Prostějov' }),
    zapisPrihlasku: r => {
      zaznam.push('zapis:' + (stav.zamek.drzen() ? 'zamceno' : 'ODEMCENO'));
      stav.prihlasky.push({ cas_odeslani: r[0], termin_id: r[1], tym: r[2], pocet_hracu: r[3], kapitan: r[4], email: r[5], telefon: r[6], poznamka: r[7], stav: r[8], souhlas: r[9] });
    },
    zapisHospodu: r => stav.hospody.push(r),
    zapisChybu: (akce, popis) => { if (moznosti.chybaZapisuChyby) throw new Error('list Chyby nejde'); stav.chyby.push([akce, popis]); },
    smazCache: () => { stav.cacheSmazana++; },
    posliEmail: (komu, predmet, text) => { if (moznosti.emailSelze) throw new Error('Service invoked too many times'); stav.emaily.push({ komu, predmet, text }); },
    posliEmailOrganizatorovi: (predmet, text) => { if (moznosti.emailSelze) throw new Error('Service invoked too many times'); stav.emaily.push({ komu: 'organizator', predmet, text }); },
    posliTelegram: moznosti.posliTelegram || (text => { if (moznosti.telegramSelze) throw new Error('Telegram odpověděl kódem 401'); stav.telegramy.push(text); })
  };
  return { s, stav, zaznam };
}

// Zámek jako LockService: když ho drží někdo jiný, tryLock vrátí false (ve skutečnosti by čekal).
function jednoduchyZamek() {
  let drzen = false;
  return {
    zamkni: () => { if (drzen) return false; drzen = true; return true; },
    odemkni: () => { drzen = false; },
    drzen: () => drzen
  };
}

// Rozbitý „zámek“, který nic nehlídá – jen pro důkaz, že test souběh opravdu zachytí.
function zadnyZamek() {
  return { zamkni: () => true, odemkni: () => {}, drzen: () => true };
}

module.exports = { nactiSkript, radekTerminu, prihlaska, falesneSluzby, jednoduchyZamek, zadnyZamek };
