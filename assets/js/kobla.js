// Společné funkce webu Kobla Kvíz: nastavení, kontakty, menu, načtení dat a odeslání formulářů.
// Potřebuje config.js a assets/js/cesky.js (načtené před tímto souborem).
(function () {
  'use strict';
  var C = window.Cesky;
  var nastaveni = window.KOBLA_CONFIG || {};
  var ADRESA = String(nastaveni.ADRESA_SKRIPTU || '').trim();
  var KONTAKT = nastaveni.KONTAKT || {};
  var JE_DEMO = !ADRESA;

  // Kořen webu (kvůli podstránkám a návrhům v podsložkách) – podle umístění tohoto skriptu.
  var KOREN = (function () {
    var s = document.currentScript && document.currentScript.getAttribute('src');
    return s ? s.replace(/assets\/js\/kobla\.js.*$/, '') : '';
  })();

  document.documentElement.classList.add('js');

  // ---------- Kontakty ----------
  var POPISY = { email: 'e-mail', telefon: 'telefon', facebook: 'odkaz na Facebook', instagram: 'odkaz na Instagram' };

  function vyplnKontakty() {
    document.querySelectorAll('[data-kontakt]').forEach(function (el) {
      var druh = el.getAttribute('data-kontakt');
      var hodnota = String(KONTAKT[druh] || '').trim();
      el.textContent = '';
      if (!hodnota) { el.textContent = '[DOPLNIT: ' + POPISY[druh] + ']'; return; }
      var a = document.createElement('a');
      if (druh === 'email') { a.href = 'mailto:' + hodnota; a.textContent = hodnota; }
      else if (druh === 'telefon') { a.href = 'tel:' + hodnota.replace(/\s+/g, ''); a.textContent = hodnota; }
      else { a.href = hodnota; a.rel = 'noopener'; a.textContent = druh === 'facebook' ? 'Facebook' : 'Instagram'; }
      el.appendChild(a);
    });
  }

  // Text kontaktu do chybových hlášek
  function kontaktText() {
    var casti = [];
    if (KONTAKT.email) casti.push('napiš na ' + KONTAKT.email);
    if (KONTAKT.telefon) casti.push('zavolej na ' + KONTAKT.telefon);
    return casti.length ? casti.join(' nebo ') : 'napiš organizátorovi (kontakt najdeš dole na stránce)';
  }

  // ---------- Menu na mobilu ----------
  function menu() {
    var tl = document.querySelector('.menu-tlacitko');
    var nav = document.getElementById('menu');
    if (!tl || !nav) return;
    tl.addEventListener('click', function () {
      var otevrit = tl.getAttribute('aria-expanded') !== 'true';
      tl.setAttribute('aria-expanded', String(otevrit));
      nav.classList.toggle('otevrene', otevrit);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { tl.setAttribute('aria-expanded', 'false'); nav.classList.remove('otevrene'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('otevrene')) { tl.setAttribute('aria-expanded', 'false'); nav.classList.remove('otevrene'); tl.focus(); }
    });
  }

  // ---------- Fotky (seznam) ----------
  var fotkyPromise = null;
  function nactiFotky() {
    if (!fotkyPromise) {
      fotkyPromise = fetch(KOREN + 'assets/fotky/fotky.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('fotky'); return r.json(); })
        .then(function (d) {
          return (d.vecery || []).filter(function (v) { return v.fotky && v.fotky.length; });
        })
        .catch(function () { return []; });
    }
    return fotkyPromise;
  }

  // Odkaz „Fotky“ v menu se ukáže, jen když nějaké fotky jsou (R6).
  function odkazNaFotky() {
    nactiFotky().then(function (vecery) {
      if (!vecery.length) return;
      document.querySelectorAll('[data-fotky-odkaz]').forEach(function (el) { el.hidden = false; });
    });
  }

  // ---------- Data (podniky, termíny, výsledky) ----------
  function stavKod(t) {
    if (t.stav === 'zruseno' || t.stav === 'uzavreno') return t.stav;
    if (t.stav === 'obsazeno' || Number(t.volno) <= 0) return 'obsazeno';
    return 'otevreno';
  }

  function stavText(t) {
    var s = stavKod(t);
    if (s === 'zruseno') return 'Zrušeno';
    if (s === 'uzavreno') return 'Uzavřeno';
    if (s === 'obsazeno') return 'Obsazeno – přihlas se jako náhradník';
    return C.pocet(Number(t.volno), C.MISTA);
  }

  // Demo data mají místo data počet dní od dneška (za_dni).
  function demoNaData(d) {
    var dnes = new Date(); dnes.setHours(0, 0, 0, 0);
    function posun(dni) { var x = new Date(dnes); x.setDate(x.getDate() + Number(dni)); return C.naIso(x); }
    (d.terminy || []).forEach(function (t) { if (t.za_dni !== undefined) t.datum = posun(t.za_dni); });
    (d.vysledky || []).forEach(function (v) { if (v.za_dni !== undefined) v.datum = posun(v.za_dni); });
    return d;
  }

  function pripravData(d) {
    d.podniky = d.podniky || []; d.terminy = d.terminy || []; d.vysledky = d.vysledky || [];
    d.podnikPodleId = {};
    d.podniky.forEach(function (p) { d.podnikPodleId[p.id] = p; });
    d.terminy.sort(function (a, b) { return (a.datum + a.cas).localeCompare(b.datum + b.cas); });
    d.terminy.forEach(function (t) { t.stavKod = stavKod(t); t.podnik = d.podnikPodleId[t.podnik_id] || null; });
    // jen termíny podniků, které web zná (aktivní)
    d.terminy = d.terminy.filter(function (t) { return t.podnik; });
    d.vysledky.sort(function (a, b) { return (b.datum + (b.cas || '')).localeCompare(a.datum + (a.cas || '')); });
    d.vysledky.forEach(function (v) {
      var p = d.podnikPodleId[v.podnik_id];
      if (!v.podnik_nazev) v.podnik_nazev = p ? p.nazev : '';
      if (!v.mesto) v.mesto = p ? p.mesto : '';
    });
    d.demo = JE_DEMO;
    return d;
  }

  var dataPromise = null;
  function nactiData(znovu) {
    if (dataPromise && !znovu) return dataPromise;
    var url = JE_DEMO ? KOREN + 'data/demo.json' : ADRESA + (ADRESA.indexOf('?') < 0 ? '?' : '&') + 'akce=data&t=' + Date.now();
    var casovac;
    var limit = new Promise(function (_, odmitni) { casovac = setTimeout(function () { odmitni(new Error('Vypršel čas')); }, 15000); });
    dataPromise = Promise.race([fetch(url, { cache: 'no-store', credentials: 'omit' }), limit])
      .then(function (r) { clearTimeout(casovac); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        if (d && d.ok === false) throw new Error(d.chyba || 'Chyba skriptu');
        return pripravData(JE_DEMO ? demoNaData(d) : d);
      });
    dataPromise.catch(function () { dataPromise = null; });
    return dataPromise;
  }

  // ---------- Odeslání formuláře ----------
  // V demo režimu se nic neposílá, jen se předvede odpověď.
  function odeslat(udaje, data) {
    if (JE_DEMO) {
      return new Promise(function (hotovo) {
        setTimeout(function () {
          if (udaje.akce === 'prihlaska') {
            var t = data && data.terminy.filter(function (x) { return x.id === udaje.termin_id; })[0];
            hotovo({ ok: true, demo: true, stav: t && t.stavKod === 'obsazeno' ? 'Náhradník' : 'Potvrzeno' });
          } else {
            hotovo({ ok: true, demo: true });
          }
        }, 700);
      });
    }
    // text/plain = jednoduchý požadavek bez předběžného dotazu (CORS), Apps Script ho přečte z e.postData.contents
    return fetch(ADRESA, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(udaje),
      credentials: 'omit',
      redirect: 'follow'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  // Štítek „ukázková data“ v demo režimu
  function stitekDemo() {
    if (!JE_DEMO) return;
    var s = document.createElement('span');
    s.className = 'stitek-demo';
    s.textContent = 'ukázková data';
    document.body.appendChild(s);
  }

  function hotovo() {
    vyplnKontakty();
    menu();
    odkazNaFotky();
    stitekDemo();
    document.querySelectorAll('[data-rok]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    C.opravMezery(document.body);
    // Texty, které se doplní později (termíny, hlášky), dostanou nezlomitelné mezery automaticky.
    if (window.MutationObserver) {
      new MutationObserver(function (zmeny) {
        zmeny.forEach(function (z) {
          if (z.type === 'characterData') { C.opravMezery(z.target.parentNode); return; }
          z.addedNodes.forEach(function (n) { C.opravMezery(n.nodeType === 3 ? n.parentNode : n); });
        });
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  window.Kobla = {
    JE_DEMO: JE_DEMO, KOREN: KOREN,
    nactiData: nactiData, nactiFotky: nactiFotky, odeslat: odeslat,
    stavKod: stavKod, stavText: stavText, kontaktText: kontaktText,
    opravMezery: function (el) { C.opravMezery(el); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hotovo);
  else hotovo();
})();
