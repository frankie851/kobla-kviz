// Společný skript pro návrhy designu: načte data/demo.json a vyplní jimi stránku.
// Každý návrh má vlastní HTML a CSS, ale stejné značky data-hero, data-p a data-t.
// Formulář se v návrzích nikam neodesílá.
(function () {
  'use strict';
  var C = window.Cesky;

  function stavText(t) {
    if (t.stav === 'zruseno') return 'Zrušeno';
    if (t.stav === 'uzavreno') return 'Uzavřeno';
    if (t.stav === 'obsazeno' || t.volno <= 0) return 'Obsazeno – náhradník';
    return C.pocet(t.volno, C.MISTA);
  }

  function stavKod(t) {
    if (t.stav === 'otevreno' && t.volno <= 0) return 'obsazeno';
    return t.stav;
  }

  // Demo data mají místo data počet dní od dneška.
  function pripravData(data) {
    var dnes = new Date();
    dnes.setHours(0, 0, 0, 0);
    function posun(dni) {
      var d = new Date(dnes);
      d.setDate(d.getDate() + dni);
      return C.naIso(d);
    }
    data.terminy.forEach(function (t) { t.datum = posun(t.za_dni); });
    data.vysledky.forEach(function (v) { v.datum = posun(v.za_dni); });
    data.podnikPodleId = {};
    data.podniky.forEach(function (p) { data.podnikPodleId[p.id] = p; });
    return data;
  }

  function vypln(koren, atribut, hodnoty) {
    koren.querySelectorAll('[' + atribut + ']').forEach(function (el) {
      var klic = el.getAttribute(atribut);
      if (!(klic in hodnoty)) return;
      if (klic === 'adresa' && el.tagName === 'A') el.href = hodnoty.mapa_url;
      el.textContent = hodnoty[klic];
    });
  }

  function vyberTermin(id) {
    var sel = document.getElementById('f-termin');
    if (!sel) return;
    sel.value = id;
    sel.dispatchEvent(new Event('change'));
    var cil = document.getElementById('prihlaska');
    if (cil) cil.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(function () { sel.focus({ preventScroll: true }); }, 400);
  }

  function hero(data) {
    var nejblizsi = data.terminy.filter(function (t) { return t.stav !== 'zruseno' && t.stav !== 'uzavreno'; })[0];
    if (!nejblizsi) return;
    var p = data.podnikPodleId[nejblizsi.podnik_id];
    vypln(document, 'data-hero', {
      den: C.denCely(nejblizsi.datum),
      denkratky: C.denKratky(nejblizsi.datum),
      datum: C.datumKratke(nejblizsi.datum),
      datumcas: C.datumCas(nejblizsi.datum, nejblizsi.cas),
      cas: nejblizsi.cas,
      podnik: p.nazev,
      mesto: p.mesto,
      adresa: p.adresa,
      mapa_url: p.mapa_url,
      volno: stavText(nejblizsi),
      cislo: String(nejblizsi.volno)
    });
    document.querySelectorAll('[data-hero-termin]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); vyberTermin(nejblizsi.id); });
    });
  }

  function podniky(data) {
    var cil = document.getElementById('podniky');
    var sablona = document.getElementById('sablona-podnik');
    var sablonaT = document.getElementById('sablona-termin');
    if (!cil || !sablona) return;
    data.podniky.forEach(function (p, i) {
      var karta = sablona.content.firstElementChild.cloneNode(true);
      karta.style.setProperty('--i', i);
      vypln(karta, 'data-p', p);
      var seznam = karta.querySelector('[data-p-terminy]');
      data.terminy.filter(function (t) { return t.podnik_id === p.id; }).slice(0, 3).forEach(function (t) {
        var polozka = sablonaT.content.firstElementChild.cloneNode(true);
        polozka.setAttribute('data-stav', stavKod(t));
        vypln(polozka, 'data-t', {
          datum: C.datumCas(t.datum, t.cas),
          den: C.denKratky(t.datum),
          kratke: C.datumKratke(t.datum),
          cas: t.cas,
          stav: stavText(t)
        });
        var tlacitko = polozka.matches('a,button') ? polozka : polozka.querySelector('a,button');
        if (t.stav === 'zruseno' || t.stav === 'uzavreno') {
          if (tlacitko) { tlacitko.setAttribute('aria-disabled', 'true'); tlacitko.tabIndex = -1; }
        } else if (tlacitko) {
          tlacitko.addEventListener('click', function (e) { e.preventDefault(); vyberTermin(t.id); });
        }
        seznam.appendChild(polozka);
      });
      cil.appendChild(karta);
    });
  }

  function formular(data) {
    var sel = document.getElementById('f-termin');
    var pocet = document.getElementById('f-pocet');
    var form = document.getElementById('form-prihlaska');
    if (!sel || !form) return;
    data.terminy.forEach(function (t) {
      if (t.stav === 'zruseno' || t.stav === 'uzavreno') return;
      var p = data.podnikPodleId[t.podnik_id];
      var o = document.createElement('option');
      o.value = t.id;
      o.dataset.max = t.max_hracu;
      o.textContent = C.datumCas(t.datum, t.cas) + ' – ' + p.nazev + ', ' + p.mesto +
        (stavKod(t) === 'obsazeno' ? ' (náhradník)' : '');
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      var o = sel.selectedOptions[0];
      if (o && o.dataset.max && pocet) {
        pocet.max = o.dataset.max;
        var napoveda = document.getElementById('f-pocet-napoveda');
        if (napoveda) napoveda.textContent = 'Nejvíc ' + C.pocet(Number(o.dataset.max), C.HRACI) + ' u stolu.';
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var zprava = form.querySelector('[data-zprava]');
      if (zprava) {
        zprava.hidden = false;
        zprava.textContent = 'Tohle je jen návrh designu. Přihláška se zatím nikam neodesílá.';
      }
    });
  }

  function vysledky(data) {
    var cil = document.getElementById('vysledky-nahled');
    if (!cil || !data.vysledky.length) return;
    var v = data.vysledky[0];
    var p = data.podnikPodleId[v.podnik_id];
    var nadpis = document.querySelector('[data-vysledky-nadpis]');
    if (nadpis) nadpis.textContent = C.datumCas(v.datum) + ' · ' + p.nazev;
    v.tymy.slice(0, 3).forEach(function (t) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="poradi"></span><span class="tym"></span><span class="body"></span>';
      li.querySelector('.poradi').textContent = t.poradi + '.';
      li.querySelector('.tym').textContent = t.tym;
      li.querySelector('.body').textContent = t.body + ' b.';
      cil.appendChild(li);
    });
  }

  var cesta = document.currentScript.getAttribute('data-demo') || '../../data/demo.json';
  fetch(cesta)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      pripravData(data);
      hero(data);
      podniky(data);
      formular(data);
      vysledky(data);
      document.documentElement.classList.add('nacteno');
      C.opravMezery(document.body);
    })
    .catch(function () {
      document.documentElement.classList.add('chyba-dat');
    });
  // Rok do patičky
  document.querySelectorAll('[data-rok]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
