// Podstránka Výsledky (R9): pořadí týmů po večerech, nejnovější nahoře, filtr podle podniku.
(function () {
  'use strict';
  var C = window.Cesky;
  var K = window.Kobla;
  var seznam = document.getElementById('vysledky-seznam');
  var filtr = document.getElementById('filtr-podnik');

  function el(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) e.className = trida;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function vykresli(vysledky) {
    seznam.textContent = '';
    var vybrany = filtr.value;
    var vyber = vysledky.filter(function (v) { return !vybrany || v.podnik_id === vybrany; });
    if (!vyber.length) {
      seznam.appendChild(el('p', 'prazdne', vysledky.length ? 'V tomhle podniku zatím výsledky nejsou.' : 'Výsledky se tu objeví po prvním odehraném kvízu.'));
      return;
    }
    vyber.forEach(function (v) {
      var blok = el('article', 'vecer');
      blok.appendChild(el('h2', '', C.datumCas(v.datum, v.cas)));
      blok.appendChild(el('p', 'kde', v.podnik_nazev + (v.mesto ? ', ' + v.mesto : '')));
      var ol = el('ol', 'poradi-tabulka');
      (v.tymy || []).forEach(function (t) {
        var li = el('li');
        li.appendChild(el('span', 'poradi', t.poradi + '.'));
        li.appendChild(el('span', 'tym', t.tym));
        li.appendChild(el('span', 'body', C.pocet(t.body, ['bod', 'body', 'bodů'])));
        ol.appendChild(li);
      });
      blok.appendChild(ol);
      seznam.appendChild(blok);
    });
    K.opravMezery(seznam);
  }

  K.nactiData().then(function (data) {
    // do filtru jen podniky, které mají nějaké výsledky
    var podniky = {};
    data.vysledky.forEach(function (v) { podniky[v.podnik_id] = v.podnik_nazev + (v.mesto ? ', ' + v.mesto : ''); });
    Object.keys(podniky).sort(function (a, b) { return podniky[a].localeCompare(podniky[b], 'cs'); }).forEach(function (id) {
      var o = el('option', '', podniky[id]);
      o.value = id;
      filtr.appendChild(o);
    });
    // filtr si pamatuje volbu v adrese (např. vysledky.html#konvice)
    var zAdresy = decodeURIComponent(location.hash.slice(1));
    if (zAdresy && podniky[zAdresy]) filtr.value = zAdresy;
    filtr.disabled = false;
    filtr.addEventListener('change', function () {
      history.replaceState(null, '', filtr.value ? '#' + encodeURIComponent(filtr.value) : location.pathname);
      vykresli(data.vysledky);
    });
    vykresli(data.vysledky);
  }).catch(function () {
    seznam.textContent = '';
    var box = el('div', 'chyba-nacteni');
    box.setAttribute('role', 'alert');
    box.appendChild(el('strong', '', 'Ups, výsledky se nenačetly'));
    box.appendChild(el('p', '', 'Zkus stránku za chvíli obnovit. Když to nepůjde, ' + K.kontaktText() + '.'));
    seznam.appendChild(box);
  });
})();
